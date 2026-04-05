import axios from 'axios';

// Use environment variable for production, default to localhost for development
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach token and log errors
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API ERROR:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

export default API;

// Auth
export const sendOtp = (data) => API.post('/auth/send-otp', data);
export const verifyOtp = (data) => API.post('/auth/verify-otp', data);
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const addXP = (data) => API.post('/auth/add-xp', data);

// Subjects
export const getSubjects = () => API.get('/subjects');
export const addSubject = (data) => API.post('/subjects', data);
export const deleteSubject = (id) => API.delete(`/subjects/${id}`);

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
export const createHabit = (data) => API.post('/habits', data);
export const updateHabit = (id, data) => API.put(`/habits/${id}`, data);
export const deleteHabit = (id) => API.delete(`/habits/${id}`);
export const toggleHabit = (id, date) => API.post(`/habits/${id}/toggle`, { date });

// AI Productivity
export const breakDownTask = (data) => API.post('/ai/breakdown', data);
export const generateFlashcards = (data) => API.post('/ai/flashcards', data);
export const aiChat = (data) => API.post('/ai/chat', data);
export const summarizeText = (data) => API.post('/ai/summarize', data);
export const optimizeSchedule = (data) => API.post('/ai/optimize', data);
export const getGpaStrategy = (data) => API.post('/ai/gpa-strategy', data);
export const getAiInsights = () => API.get('/ai/insights');
export const getAiMetrics = () => API.get('/ai/metrics');
export const getDailyBriefing = () => API.get('/ai/briefing');
export const matchTask = (data) => API.post('/ai/match-task', data);
export const lockVault = (data) => API.post('/ai/vault/lock', data);
export const breakVault = (data) => API.post('/ai/vault/break', data);
export const simulateProcrastination = (data) => API.post('/ai/simulate-procrastination', data);
export const generateMasteryRoadmap = (data) => API.post('/ai/mastery-roadmap', data);
export const syncRival = (data) => API.post('/ai/rival-sync', data);
export const parseMindSweep = (data) => API.post('/ai/mind-sweep', data);
export const analyzeCode = (data) => API.post('/codeinsight/analyze', data);
export const generateStudyCard = (data) => API.post('/ai/study-card', data);
