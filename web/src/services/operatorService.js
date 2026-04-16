import { get, put } from '../utils/api';

// Barcha operatorlarni olish
export const getAllOperators = async () => {
  return await get('/operators');
};

// Top operatorlarni olish
export const getTopOperators = async (limit = 5) => {
  return await get(`/operators/top?limit=${limit}`);
};

// Bitta operatorni olish
export const getOperatorById = async (id) => {
  return await get(`/operators/${id}`);
};

// Operatorni yangilash
export const updateOperator = async (id, operatorData) => {
  return await put(`/operators/${id}`, operatorData);
};

export default {
  getAllOperators,
  getTopOperators,
  getOperatorById,
  updateOperator,
};
