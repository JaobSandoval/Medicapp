import { create } from 'zustand';
import { circleService } from '../services/circleService';

export const useCircleStore = create((set, get) => ({
  circles: [],
  currentCircle: null,
  loading: false,
  error: null,

  fetchCircles: async () => {
    set({ loading: true, error: null });
    try {
      const response = await circleService.getMyCircles();
      set({ circles: response.data.circles, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al cargar círculos', loading: false });
    }
  },

  fetchCircleById: async (circleId) => {
    set({ loading: true, error: null });
    try {
      const response = await circleService.getById(circleId);
      set({ currentCircle: response.data.circle, loading: false });
      return response.data.circle;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al cargar círculo', loading: false });
      return null;
    }
  },

  createCircle: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await circleService.create(data);
      const newCircle = response.data.circle;
      set((state) => ({ 
        circles: [...state.circles, { ...newCircle, myRole: 'admin' }], 
        loading: false 
      }));
      return { success: true, circle: newCircle, code: response.data.code };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear círculo';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  joinCircle: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await circleService.join(data);
      await get().fetchCircles();
      set({ loading: false });
      return { success: true, circle: response.data.circle };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al unirse al círculo';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  leaveCircle: async (circleId) => {
    set({ loading: true, error: null });
    try {
      await circleService.leave(circleId);
      set((state) => ({
        circles: state.circles.filter((c) => c.id !== circleId),
        currentCircle: state.currentCircle?.id === circleId ? null : state.currentCircle,
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al salir del círculo';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  setCurrentCircle: (circle) => set({ currentCircle: circle }),
  clearError: () => set({ error: null }),
}));
