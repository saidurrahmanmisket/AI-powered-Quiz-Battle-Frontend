import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401s globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('qb_token');
      localStorage.removeItem('qb_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  guest: () => api.post('/auth/guest'),
};

export const gameApi = {
  getRooms: () => api.get('/game/rooms'),
  createRoom: (name) => api.post(`/game/rooms?name=${encodeURIComponent(name)}`),
  getRoom: (roomId) => api.get(`/game/rooms/${roomId}`),
  getRoomStatus: (roomId) => api.get(`/game/rooms/${roomId}/status`),
  getGameState: (roomId) => api.get(`/game/rooms/${roomId}/state`),
};

export const leaderboardApi = {
  getTop: () => api.get('/leaderboard'),
  getLeaderboard: () => api.get('/leaderboard'),
  getMatchHistory: () => api.get('/leaderboard/history'),
};

export default api;
