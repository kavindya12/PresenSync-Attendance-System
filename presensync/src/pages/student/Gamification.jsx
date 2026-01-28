import React, { useState, useEffect } from 'react';
import { courseAPI, gamificationAPI } from '../../api/endpoints';
import StreakCounter from '../../components/features/StreakCounter';
import { Trophy, Award, Target, TrendingUp, Flame } from 'lucide-react';

const Gamification = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [allAchievements, setAllAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchAchievements();
        }
    }, [selectedCourse]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await courseAPI.getAllCourses();
            setCourses(response.data.courses || []);
            if (response.data.courses?.length > 0) {
                setSelectedCourse(response.data.courses[0].id);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAchievements = async () => {
        try {
            const response = await gamificationAPI.getAchievements();
            setAllAchievements(response.data.achievements || []);
        } catch (error) {
            console.error('Error fetching achievements:', error);
            setAllAchievements([]);
        }
    };

    const getBadgeIcon = (badgeType) => {
        switch (badgeType) {
            case 'STREAK_10':
            case 'STREAK_30':
                return <Flame className="text-orange-500" size={32} />;
            case 'PERFECT_WEEK':
            case 'PERFECT_MONTH':
                return <Target className="text-blue-500" size={32} />;
            case 'EARLY_BIRD':
                return <TrendingUp className="text-yellow-500" size={32} />;
            default:
                return <Award className="text-gray-500" size={32} />;
        }
    };

    const getBadgeName = (badgeType) => {
        const badges = {
            PERFECT_WEEK: 'Perfect Week',
            PERFECT_MONTH: 'Perfect Month',
            STREAK_10: '10 Day Streak',
            STREAK_30: '30 Day Streak',
            EARLY_BIRD: 'Early Bird',
            CONSISTENT: 'Consistent',
        };
        return badges[badgeType] || badgeType;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">My Achievements</h2>

            {/* Course Selector */}
            {courses.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Course
                    </label>
                    <select
                        value={selectedCourse || ''}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.code} - {course.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Streak Counter for Selected Course */}
            {selectedCourse && <StreakCounter courseId={selectedCourse} />}

            {/* All Achievements */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Trophy className="text-yellow-500" size={24} />
                    All Achievements
                </h3>
                {allAchievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allAchievements.map((achievement, idx) => (
                            <div
                                key={idx}
                                className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-white dark:bg-gray-600 p-2 rounded-lg">
                                        {getBadgeIcon(achievement.badgeType)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                            {getBadgeName(achievement.badgeType)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {achievement.courseName || 'General'}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {new Date(achievement.earnedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No achievements yet. Keep attending classes to earn badges! 🏆
                    </p>
                )}
            </div>
        </div>
    );
};

export default Gamification;

