import client from './client';

export const getAllBanners = () => client.get('/banners/all').then((res) => res.data);

const toFormData = (fields, imageFile) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  if (imageFile) formData.append('image', imageFile);
  return formData;
};

export const createBanner = (fields, imageFile) =>
  client
    .post('/banners', toFormData(fields, imageFile), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);

export const updateBanner = (id, fields) =>
  client.put(`/banners/${id}`, fields).then((res) => res.data);

export const updateBannerImage = (id, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return client
    .put(`/banners/${id}/image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data);
};

export const deleteBanner = (id) => client.delete(`/banners/${id}`).then((res) => res.data);
