const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('lg_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateProfile: async (data) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Classes
  getClasses: async () => {
    const res = await fetch(`${API_BASE}/classes`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getClassById: async (id) => {
    const res = await fetch(`${API_BASE}/classes/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createClass: async (data) => {
    const res = await fetch(`${API_BASE}/classes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateClass: async (id, data) => {
    const res = await fetch(`${API_BASE}/classes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteClass: async (id) => {
    const res = await fetch(`${API_BASE}/classes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  addStudentToClass: async (classId, studentData) => {
    const res = await fetch(`${API_BASE}/classes/${classId}/students`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(studentData),
    });
    return handleResponse(res);
  },

  removeStudentFromClass: async (classId, studentId) => {
    const res = await fetch(`${API_BASE}/classes/${classId}/students/${studentId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  assignCourseToClass: async (classId, courseId) => {
    const res = await fetch(`${API_BASE}/classes/${classId}/assign-course`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseId }),
    });
    return handleResponse(res);
  },

  unassignCourseFromClass: async (classId, courseId) => {
    const res = await fetch(`${API_BASE}/classes/${classId}/unassign-course`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseId }),
    });
    return handleResponse(res);
  },

  // Courses
  getCourses: async () => {
    const res = await fetch(`${API_BASE}/courses`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getCourseById: async (id) => {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createCourse: async (data) => {
    const res = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateCourse: async (id, data) => {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  togglePublishCourse: async (id) => {
    const res = await fetch(`${API_BASE}/courses/${id}/publish`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  deleteCourse: async (id) => {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Chapters
  createChapter: async (data) => {
    const res = await fetch(`${API_BASE}/chapters`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateChapter: async (id, data) => {
    const res = await fetch(`${API_BASE}/chapters/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteChapter: async (id) => {
    const res = await fetch(`${API_BASE}/chapters/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Sections
  createSection: async (data) => {
    const res = await fetch(`${API_BASE}/sections`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getSectionById: async (id) => {
    const res = await fetch(`${API_BASE}/sections/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateSection: async (id, data) => {
    const res = await fetch(`${API_BASE}/sections/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteSection: async (id) => {
    const res = await fetch(`${API_BASE}/sections/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Activities
  createActivity: async (data) => {
    const res = await fetch(`${API_BASE}/activities`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getActivityById: async (id) => {
    const res = await fetch(`${API_BASE}/activities/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateActivity: async (id, data) => {
    const res = await fetch(`${API_BASE}/activities/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteActivity: async (id) => {
    const res = await fetch(`${API_BASE}/activities/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // AI Activity Generation
  generateAIActivity: async (params) => {
    const res = await fetch(`${API_BASE}/ai/generate-activity`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse(res);
  },

  // Progress & Evaluation
  submitActivity: async (activityId, answers) => {
    const res = await fetch(`${API_BASE}/progress/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ activityId, answers }),
    });
    return handleResponse(res);
  },

  getStudentProgress: async (studentId) => {
    const url = studentId ? `${API_BASE}/progress?studentId=${studentId}` : `${API_BASE}/progress`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Analytics
  getTeacherDashboard: async () => {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getClassAnalytics: async (classId) => {
    const res = await fetch(`${API_BASE}/analytics/class/${classId}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
