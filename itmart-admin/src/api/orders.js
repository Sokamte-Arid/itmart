import i18n from '../i18n';
import client from './client';

export const getOrders = (params = {}) =>
  client.get('/orders', { params }).then((res) => res.data);

export const getOrderById = (id) => client.get(`/orders/${id}`).then((res) => res.data);

// `lang` lets the server word its messages (e.g. "not enough stock") in the admin's language
export const updateOrderStatus = (id, status) =>
  client
    .put(`/orders/${id}/status`, { status, lang: i18n.language === 'en' ? 'en' : 'fr' })
    .then((res) => res.data);

export const getOrderStats = () =>
  client.get('/orders/stats/summary').then((res) => res.data);

export const getSalesAnalytics = (days = 30) =>
  client.get('/orders/stats/analytics', { params: { days } }).then((res) => res.data);

// Downloads the order's invoice (confirmed orders) or proforma (not yet
// confirmed) as a PDF, in the admin's language. Returns { number, type }.
export const downloadInvoice = async (orderId, lang = 'fr') => {
  let res;
  try {
    res = await client.get(`/orders/${orderId}/invoice`, { params: { lang }, responseType: 'blob' });
  } catch (err) {
    // Errors come back as a Blob too — turn them back into the API's JSON message
    const data = err.response?.data;
    if (data instanceof Blob) {
      try {
        err.response.data = JSON.parse(await data.text());
      } catch {
        /* not JSON — keep the original error */
      }
    }
    throw err;
  }

  const disposition = res.headers['content-disposition'] || '';
  const filename = /filename="?([^";]+)"?/.exec(disposition)?.[1] || `facture-${orderId}.pdf`;
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 10000);

  return { number: res.headers['x-invoice-number'], type: res.headers['x-invoice-type'] };
};

// Products that have been ordered (with how many orders), for the export window
export const getOrderedProducts = () => client.get('/orders/export/products').then((res) => res.data);

// Downloads an export. { format: 'csv' | 'pdf', status?, productId? }
// csv opens directly in Excel; with productId it's the customers of that product.
export const exportOrders = async ({ format = 'csv', status, productId } = {}) => {
  const res = await client.get('/orders/export', {
    params: { format, status: status || undefined, productId: productId || undefined, lang: i18n.language === 'en' ? 'en' : 'fr' },
    responseType: 'blob',
  });
  const disposition = res.headers['content-disposition'] || '';
  const filename = /filename="?([^";]+)"?/.exec(disposition)?.[1] || `export-${Date.now()}.${format}`;
  const url = window.URL.createObjectURL(new Blob([res.data], { type: format === 'pdf' ? 'application/pdf' : 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 10000);
};
