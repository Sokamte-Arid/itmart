import client from './client';

export const getBrands = () => client.get('/brands').then((res) => res.data);

export const createBrand = (name, imageFile) => {
  const formData = new FormData();
  formData.append('name', name);
  if (imageFile) formData.append('image', imageFile);
  return client
    .post('/brands', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data);
};

export const updateBrand = (id, name) =>
  client.put(`/brands/${id}`, { name }).then((res) => res.data);

export const updateBrandLogo = (id, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return client
    .put(`/brands/${id}/logo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data);
};

export const deleteBrand = (id) =>
  client.delete(`/brands/${id}`).then((res) => res.data);
