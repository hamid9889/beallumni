import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// Feed APIs
export const getPosts = () => axios.get(`${API}/posts`);
export const createPost = (data) => axios.post(`${API}/posts`, data, { headers: getAuthHeader() });
export const likePost = (postId) => axios.post(`${API}/posts/${postId}/like`, {}, { headers: getAuthHeader() });
export const addComment = (postId, comment) => axios.post(`${API}/posts/${postId}/comment`, { comment }, { headers: getAuthHeader() });

// Alumni APIs
export const searchAlumni = (query = '') => axios.get(`${API}/alumni/search?query=${query}`, { headers: getAuthHeader() });
export const connectAlumni = (toUserId) => axios.post(`${API}/alumni/connect`, { to_user_id: toUserId }, { headers: getAuthHeader() });
export const getConnections = () => axios.get(`${API}/alumni/connections`, { headers: getAuthHeader() });

// Chat APIs
export const sendMessage = (toUserId, message) => axios.post(`${API}/chat/send`, { to_user_id: toUserId, message }, { headers: getAuthHeader() });
export const getMessages = (otherUserId) => axios.get(`${API}/chat/messages/${otherUserId}`, { headers: getAuthHeader() });

// Jobs APIs
export const getJobs = () => axios.get(`${API}/jobs`);
export const createJob = (data) => axios.post(`${API}/jobs`, data, { headers: getAuthHeader() });
export const applyJob = (jobId, data) => axios.post(`${API}/jobs/${jobId}/apply`, data, { headers: getAuthHeader() });
export const getMyApplications = () => axios.get(`${API}/jobs/my-applications`, { headers: getAuthHeader() });

// Placement APIs
export const getPlacementQuestions = (category, company) => {
  let url = `${API}/placement/questions`;
  const params = [];
  if (category) params.push(`category=${category}`);
  if (company) params.push(`company=${company}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  return axios.get(url);
};
export const createPlacementQuestion = (data) => axios.post(`${API}/placement/questions`, data, { headers: getAuthHeader() });
export const likePlacementQuestion = (questionId) => axios.post(`${API}/placement/questions/${questionId}/like`, {}, { headers: getAuthHeader() });
export const savePlacementQuestion = (questionId) => axios.post(`${API}/placement/questions/${questionId}/save`, {}, { headers: getAuthHeader() });
export const getSavedQuestions = () => axios.get(`${API}/placement/saved-questions`, { headers: getAuthHeader() });
export const submitPlacementExperience = (data) => axios.post(`${API}/placement/submit`, data, { headers: getAuthHeader() });
export const getPlacementSubmissions = () => axios.get(`${API}/placement/submissions`);

// AI APIs
export const askAI = (question, context = '') => axios.post(`${API}/ai/ask`, { question, context }, { headers: getAuthHeader() });
export const getAIHistory = () => axios.get(`${API}/ai/history`, { headers: getAuthHeader() });
