import client from './client';

export const getTrackingSettings = () => client.get('/settings/tracking').then((res) => res.data);

export const updateTrackingSettings = (payload) =>
  client.put('/settings/tracking', payload).then((res) => res.data);

export const getBranding = () => client.get('/settings/branding').then((res) => res.data);

// { primaryColor, darkColor, removeLogo?, removeIcon?, lang }
export const updateBranding = (payload) => client.put('/settings/branding', payload).then((res) => res.data);

// kind: 'logo' | 'icon'. Sent as-is (not resized in the browser) so a
// transparent PNG keeps its transparency.
export const uploadBrandingImage = (kind, file) => {
  const formData = new FormData();
  formData.append('image', file);
  return client
    .post(`/settings/branding/${kind}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data);
};

// Shop details (WhatsApp, contact, social links, notifications, invoices)
export const getStoreSettings = () => client.get('/settings/store/admin').then((res) => res.data);

export const updateStoreSettings = (payload) => client.put('/settings/store', payload).then((res) => res.data);

// Référencement (SEO) of the whole site
export const getSeoSettings = () => client.get('/settings/seo').then((res) => res.data);

export const updateSeoSettings = (payload) => client.put('/settings/seo', payload).then((res) => res.data);
