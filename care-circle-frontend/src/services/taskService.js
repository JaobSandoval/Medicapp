import api from './api';

export const taskService = {
  async create(circleId, data) {
    const response = await api.post(`/circles/${circleId}/tasks`, data);
    return response.data;
  },

  async getAll(circleId, params = {}) {
    const response = await api.get(`/circles/${circleId}/tasks`, { params });
    return response.data;
  },

  async getMyTasks(circleId) {
    const response = await api.get(`/circles/${circleId}/tasks/my-tasks`);
    return response.data;
  },

  async getById(circleId, id) {
    const response = await api.get(`/circles/${circleId}/tasks/${id}`);
    return response.data;
  },

  async update(circleId, id, data) {
    const response = await api.put(`/circles/${circleId}/tasks/${id}`, data);
    return response.data;
  },

  async updateStatus(circleId, id, status) {
    const response = await api.patch(`/circles/${circleId}/tasks/${id}/status`, { status });
    return response.data;
  },

  async delete(circleId, id) {
    const response = await api.delete(`/circles/${circleId}/tasks/${id}`);
    return response.data;
  },
};
