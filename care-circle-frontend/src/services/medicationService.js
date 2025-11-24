import api from './api';

export const medicationService = {
  async create(circleId, data) {
    const response = await api.post(`/circles/${circleId}/medications`, data);
    return response.data;
  },

  async getAll(circleId, params = {}) {
    const response = await api.get(`/circles/${circleId}/medications`, { params });
    return response.data;
  },

  async getById(circleId, id) {
    const response = await api.get(`/circles/${circleId}/medications/${id}`);
    return response.data;
  },

  async update(circleId, id, data) {
    const response = await api.put(`/circles/${circleId}/medications/${id}`, data);
    return response.data;
  },

  async delete(circleId, id) {
    const response = await api.delete(`/circles/${circleId}/medications/${id}`);
    return response.data;
  },
};
