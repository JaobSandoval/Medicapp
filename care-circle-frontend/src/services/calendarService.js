import api from './api';

export const calendarService = {
  async create(circleId, data) {
    const response = await api.post(`/circles/${circleId}/calendar`, data);
    return response.data;
  },

  async getAll(circleId, params = {}) {
    const response = await api.get(`/circles/${circleId}/calendar`, { params });
    return response.data;
  },

  async getByMonth(circleId, year, month) {
    const response = await api.get(`/circles/${circleId}/calendar/month/${year}/${month}`);
    return response.data;
  },

  async getById(circleId, id) {
    const response = await api.get(`/circles/${circleId}/calendar/${id}`);
    return response.data;
  },

  async update(circleId, id, data) {
    const response = await api.put(`/circles/${circleId}/calendar/${id}`, data);
    return response.data;
  },

  async delete(circleId, id) {
    const response = await api.delete(`/circles/${circleId}/calendar/${id}`);
    return response.data;
  },
};
