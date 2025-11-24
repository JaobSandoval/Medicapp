import api from './api';

export const circleService = {
  async create(data) {
    const response = await api.post('/circles', data);
    return response.data;
  },

  async join(data) {
    const response = await api.post('/circles/join', data);
    return response.data;
  },

  async getMyCircles() {
    const response = await api.get('/circles');
    return response.data;
  },

  async getById(circleId) {
    const response = await api.get(`/circles/${circleId}`);
    return response.data;
  },

  async leave(circleId) {
    const response = await api.delete(`/circles/${circleId}/leave`);
    return response.data;
  },
};
