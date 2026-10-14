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
