import api from './api';

export const bitacoraService = {
  async list(params = {}) {
    const { page = 1, limit = 20, accion, entidad } = params;
    const res = await api.get('/bitacora', { params: { page, limit, accion, entidad } });
    return res.data;
  },
  async create(entry) {
    const res = await api.post('/bitacora', entry);
    return res.data;
  }
};


