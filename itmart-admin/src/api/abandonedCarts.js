import client from './client';

// status: OPEN | CONTACTED | RECOVERED | DISMISSED (empty = OPEN + CONTACTED)
export const getAbandonedCarts = (status) =>
  client.get('/abandoned-carts', { params: { status: status || undefined } }).then((res) => res.data);

export const updateAbandonedCart = (id, status) =>
  client.patch(`/abandoned-carts/${id}`, { status }).then((res) => res.data);

export const deleteAbandonedCart = (id) => client.delete(`/abandoned-carts/${id}`).then((res) => res.data);
