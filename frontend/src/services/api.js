import axios from 'axios';

// Use environment variable for production, default to localhost for development
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach token from localStorage on every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Subjects
export const getSubjects = () => API.get('/subjects');
export const addSubject = (data) => API.post('/subjects', data);
export const deleteSubject = (id) => API.delete(`/subjects/${id}`);

// Attendance
export const markAttendance = (data) => API.post('/attendance', data);
export const getAttendance = (sid) => API.get(`/attendance/${sid}`);
export const getAttendanceSummary = () => API.get('/attendance/summary');
export const deleteAttendance = (id) => API.delete(`/attendance/${id}`);

// Assignments
export const getAssignments = (params) => API.get('/assignments', { params });
export const getUpcoming = () => API.get('/assignments/upcoming');
export const addAssignment = (data) => API.post('/assignments', data);
export const updateAssignment = (id, data) => API.put(`/assignments/${id}`, data);
export const deleteAssignment = (id) => API.delete(`/assignments/${id}`);

// Certificates
export const getCertificates = () => API.get('/certificates');
export const uploadCertificate = (formData) => API.post('/certificates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const downloadCertificate = (id) => API.get(`/certificates/${id}/download`, { responseType: 'blob' });
export const deleteCertificate = (id) => API.delete(`/certificates/${id}`);

// Notes
export const getNotes = () => API.get('/notes');
export const addNote = (data) => API.post('/notes', data);
export const updateNote = (id, data) => API.put(`/notes/${id}`, data);
export const deleteNote = (id) => API.delete(`/notes/${id}`);

// Habits
export const getHabits = () => API.get('/habits');
export const addHabit = (data) => API.post('/habits', data);
export const updateHabit = (id, data) => API.put(`/habits/${id}`, data);
export const deleteHabit = (id) => API.delete(`/habits/${id}`);
export const toggleHabit = (id, date) => API.post(`/habits/${id}/toggle`, { date });
