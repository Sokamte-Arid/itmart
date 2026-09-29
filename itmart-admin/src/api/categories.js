import client from './client';

export const getCategories = () => client.get('/categories').then((res) => res.data);

export const getCategoryBySlug = (slug) =>
  client.get(`/categories/${slug}`).then((res) => res.data);

export const createCategory = (fields, imageFile) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  if (imageFile) formData.append('image', imageFile);
  return client
    .post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data);
};

export const updateCategory = (id, payload) =>
  client.put(`/categories/${id}`, payload).then((res) => res.data);

export const updateCategoryImage = (id, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return client
    .put(`/categories/${id}/image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data);
};

export const deleteCategory = (id) =>
  client.delete(`/categories/${id}`).then((res) => res.data);

export const addAttribute = (categoryId, payload) =>
  client.post(`/categories/${categoryId}/attributes`, payload).then((res) => res.data);

export const deleteAttribute = (attributeId) =>
  client.delete(`/categories/attributes/${attributeId}`).then((res) => res.data);
