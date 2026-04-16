import { get, post, put, del } from '../utils/api';

// Barcha mijozlarni olish (Admin uchun)
export const getAllClients = async () => {
  return await get('/clients');
};

// Operator mijozlarini olish
export const getOperatorClients = async () => {
  return await get('/clients/operator');
};

// Bitta mijozni olish
export const getClientById = async (id) => {
  return await get(`/clients/${id}`);
};

// Yangi mijoz qo'shish
export const createClient = async (clientData) => {
  return await post('/clients', clientData);
};

// Mijozni yangilash
export const updateClient = async (id, clientData) => {
  return await put(`/clients/${id}`, clientData);
};

// Mijozni o'chirish
export const deleteClient = async (id) => {
  return await del(`/clients/${id}`);
};

// Statistika olish
export const getStatistics = async (operatorId = null, period = null) => {
  let endpoint = '/clients/statistics';
  const params = new URLSearchParams();

  if (operatorId) params.append('operatorId', operatorId);
  if (period) params.append('period', period);

  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }

  return await get(endpoint);
};

export default {
  getAllClients,
  getOperatorClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getStatistics,
};
