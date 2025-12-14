import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Award } from 'lucide-react';
import { gamificationAPI } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

const StreakCounter = ({ courseId }) => {
    const { user } = useAuth();
    const [streak, setStreak] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (courseId && user) {
            fetchStreakData();
        }
    }, [courseId, user]);

    const fetchStreakData = async () => {
        try {
            setLoading(true);
            const response = await gamificationAPI.getCourseAchievements(courseId);
            setStreak(response.data.streak);
            setAchievements(response.data.achievements || []);
        } catch (error) {
            console.error('Error fetching streak data:', error);
            // Fallback to default values
            setStreak({
                currentStreak: 0,
                longestStreak: 0,
                lastAttendanceDate: null,
            });
            setAchievements([]);
        } finally {
            setLoading(false);
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

    const getBadgeColor = (badgeType) => {
        const colors = {
            PERFECT_WEEK: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
            PERFECT_MONTH: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
            STREAK_10: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
            STREAK_30: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
            EARLY_BIRD: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
            CONSISTENT: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
        };
        return colors[badgeType] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    };

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Streak Display */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-xl text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm opacity-90">Current Streak</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Flame size={24} className="text-yellow-300" />
                            <p className="text-4xl font-bold">{streak?.currentStreak || 0}</p>
                            <span className="text-lg opacity-90">days</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm opacity-90">Longest Streak</p>
                        <div className="flex items-center gap-2 mt-1 justify-end">
                            <Trophy size={20} className="text-yellow-300" />
                            <p className="text-2xl font-bold">{streak?.longestStreak || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Award size={20} className="text-yellow-500" />
                        Achievements
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {achievements.map((achievement, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded-lg text-center ${getBadgeColor(achievement.badgeType)}`}
                            >
                                <Award size={24} className="mx-auto mb-1" />
                                <p className="text-xs font-medium">{getBadgeName(achievement.badgeType)}</p>
                                <p className="text-xs opacity-75 mt-1">
                                    {new Date(achievement.earnedAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Streak Progress */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Next Milestone</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {streak?.currentStreak || 0} / {streak?.currentStreak >= 10 ? 30 : 10}
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                        style={{
                            width: `${Math.min(((streak?.currentStreak || 0) / (streak?.currentStreak >= 10 ? 30 : 10)) * 100, 100)}%`,
                        }}
                    ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {streak?.currentStreak >= 10
                        ? 'Keep going! 30 day streak is within reach! 🔥'
                        : 'Reach 10 days for your first badge! 💪'}
                </p>
            </div>
        </div>
    );
};

export default StreakCounter;
