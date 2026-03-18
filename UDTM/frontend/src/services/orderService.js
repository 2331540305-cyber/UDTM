import api from './api';

// Delete current user's orders. Optionally pass olderThanDays to delete only older orders.
export const deleteMyOrders = (olderThanDays) => {
  const qs = olderThanDays ? `?olderThanDays=${encodeURIComponent(olderThanDays)}` : '';
  return api.delete(`/orders/my${qs}`);
};

export default { deleteMyOrders };
