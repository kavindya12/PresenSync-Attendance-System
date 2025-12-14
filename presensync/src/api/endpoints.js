import apiClient from './client.js';

// Auth endpoints
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  googleAuth: () => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`,
  microsoftAuth: () => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/microsoft`,
};

// User endpoints
export const userAPI = {
  getMe: () => apiClient.get('/users/me'),
  updateMe: (data) => apiClient.put('/users/me', data),
  getAllUsers: (params) => apiClient.get('/users', { params }),
  getUserById: (id) => apiClient.get(`/users/${id}`),
  updateUser: (id, data) => apiClient.put(`/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/users/${id}`),
};

// Course endpoints
export const courseAPI = {
  getAllCourses: (params) => apiClient.get('/courses', { params }),
  getCourseById: (id) => apiClient.get(`/courses/${id}`),
  createCourse: (data) => apiClient.post('/courses', data),
  updateCourse: (id, data) => apiClient.put(`/courses/${id}`, data),
  deleteCourse: (id) => apiClient.delete(`/courses/${id}`),
  enrollStudents: (id, data) => apiClient.post(`/courses/${id}/enroll`, data),
  getEnrolledStudents: (id) => apiClient.get(`/courses/${id}/students`),
};

// Class endpoints
export const classAPI = {
  getAllClasses: (params) => apiClient.get('/classes', { params }),
  getClassById: (id) => apiClient.get(`/classes/${id}`),
  createClass: (data) => apiClient.post('/classes', data),
  updateClass: (id, data) => apiClient.put(`/classes/${id}`, data),
  deleteClass: (id) => apiClient.delete(`/classes/${id}`),
  generateQR: (id) => apiClient.post(`/classes/${id}/generate-qr`),
  getQR: (id) => apiClient.get(`/classes/${id}/qr`),
};

// Attendance endpoints
export const attendanceAPI = {
  markAttendance: (data) => apiClient.post('/attendance/mark', data),
  getAttendanceRecords: (params) => apiClient.get('/attendance', { params }),
  getClassAttendance: (classId) => apiClient.get(`/attendance/class/${classId}`),
  getStudentAttendance: (studentId) => apiClient.get(`/attendance/student/${studentId}`),
  updateAttendance: (id, data) => apiClient.put(`/attendance/${id}`, data),
  getAttendanceStats: (params) => apiClient.get('/attendance/stats', { params }),
};

// Leave endpoints
export const leaveAPI = {
  createLeave: (data) => apiClient.post('/leaves', data),
  getLeaves: (params) => apiClient.get('/leaves', { params }),
  getLeaveById: (id) => apiClient.get(`/leaves/${id}`),
  approveLeave: (id) => apiClient.put(`/leaves/${id}/approve`),
  rejectLeave: (id) => apiClient.put(`/leaves/${id}/reject`),
  cancelLeave: (id) => apiClient.delete(`/leaves/${id}`),
};

// Notification endpoints
export const notificationAPI = {
  getNotifications: (params) => apiClient.get('/notifications', { params }),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put('/notifications/read-all'),
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),
};

// Report endpoints
export const reportAPI = {
  generatePDFReport: (params) => apiClient.get('/reports/attendance/pdf', { params, responseType: 'blob' }),
  generateExcelReport: (params) => apiClient.get('/reports/attendance/excel', { params, responseType: 'blob' }),
  getAnalytics: (params) => apiClient.get('/reports/analytics', { params }),
};

// Gamification endpoints
export const gamificationAPI = {
  getStreak: (courseId) => apiClient.get(`/gamification/streak/${courseId}`),
  getAchievements: () => apiClient.get('/gamification/achievements'),
  getCourseAchievements: (courseId) => apiClient.get(`/gamification/achievements/${courseId}`),
};

