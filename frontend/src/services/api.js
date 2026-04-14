import axios from 'axios';

const API_BASE = 'https://online-exam-system-backend-hs28.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Teacher APIs
export const teacherAPI = {
  createExam: (examData) => api.post('/exams', examData),
  getTeacherExams: (teacherId) => api.get(`/exams/teacher/${teacherId}`),
  getExamResults: (examId) => api.get(`/results/exam/${examId}`),
  publishExam: (examId, publishStatus) => 
    api.put(`/exams/${examId}/publish`, { is_published: publishStatus })
};

// Student APIs
export const studentAPI = {
  getPublishedExams: () => api.get('/exams'),
  getExam: (examId) => api.get(`/exams/${examId}`),
  submitExam: (examId, submissionData) => 
    api.post(`/exams/${examId}/submit`, submissionData),
  getStudentResults: (studentId) => api.get(`/results/student/${studentId}`)
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;