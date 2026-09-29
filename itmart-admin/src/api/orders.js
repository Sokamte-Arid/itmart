import client from './client';

export const getOrders = (params = {}) =>
  client.get('/orders', { params }).then((res) => res.data);

export const getOrderById = (id) => client.get(`/orders/${id}`).then((res) => res.data);

export const updateOrderStatus = (id, status) =>
  client.put(`/orders/${id}/status`, { status }).then((res) => res.data);

export const getOrderStats = () =>
  client.get('/orders/stats/summary').then((res) => res.data);

export const getSalesAnalytics = (days = 30) =>
  client.get('/orders/stats/analytics', { params: { days } }).then((res) => res.data);

export const downloadInvoice = async (orderId, reference) => {
  const res = await client.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `invoice-${reference}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportOrdersCsv = async (status) => {
  const res = await client.get('/orders/export', {
    params: status ? { status } : undefined,
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `orders-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
