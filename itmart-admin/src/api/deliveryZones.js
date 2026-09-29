import client from './client';

export const getAllDeliveryZones = () => client.get('/delivery-zones/all').then((res) => res.data);

export const createDeliveryZone = (payload) =>
  client.post('/delivery-zones', payload).then((res) => res.data);

export const updateDeliveryZone = (id, payload) =>
  client.put(`/delivery-zones/${id}`, payload).then((res) => res.data);

export const deleteDeliveryZone = (id) =>
  client.delete(`/delivery-zones/${id}`).then((res) => res.data);
