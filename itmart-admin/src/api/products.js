import client from './client';

export const getProducts = (params = {}) =>
  client.get('/products', { params }).then((res) => res.data);

export const getProductById = (id) =>
  client.get(`/products/id/${id}`).then((res) => res.data);

export const getLowStockProducts = () =>
  client.get('/products/low-stock').then((res) => res.data);

export const getProductBySlug = (slug) =>
  client.get(`/products/${slug}`).then((res) => res.data);

export const createProduct = (payload) =>
  client.post('/products', payload).then((res) => res.data);

export const updateProduct = (id, payload) =>
  client.put(`/products/${id}`, payload).then((res) => res.data);

export const deleteProduct = (id) =>
  client.delete(`/products/${id}`).then((res) => res.data);

export const duplicateProduct = (id) =>
  client.post(`/products/${id}/duplicate`).then((res) => res.data);

export const setProductAttributes = (id, attributes) =>
  client.put(`/products/${id}/attributes`, { attributes }).then((res) => res.data);

export const getRelatedProducts = (id) =>
  client.get(`/products/${id}/related`).then((res) => res.data);

export const setRelatedProducts = (id, relatedProductIds) =>
  client.put(`/products/${id}/related`, { relatedProductIds }).then((res) => res.data);

export const uploadProductImages = (id, files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('images', file));
  return client
    .post(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
};

export const deleteProductImage = (imageId) =>
  client.delete(`/products/images/${imageId}`).then((res) => res.data);

export const setPrimaryImage = (imageId) =>
  client.put(`/products/images/${imageId}/primary`).then((res) => res.data);
