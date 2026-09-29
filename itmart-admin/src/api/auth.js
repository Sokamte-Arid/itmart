import client from './client';

export const login = (email, password) =>
  client.post('/auth/login', { email, password }).then((res) => res.data);

export const getMe = () => client.get('/auth/me').then((res) => res.data);

export const createAdmin = (payload) =>
  client.post('/auth/admins', payload).then((res) => res.data);

export const getAdmins = () => client.get('/auth/admins').then((res) => res.data);

export const deleteAdmin = (id) => client.delete(`/auth/admins/${id}`).then((res) => res.data);

export const changePassword = (currentPassword, newPassword) =>
  client.put('/auth/change-password', { currentPassword, newPassword }).then((res) => res.data);

export const forgotPassword = (email) =>
  client.post('/auth/forgot-password', { email }).then((res) => res.data);

export const resetPassword = (token, newPassword) =>
  client.post('/auth/reset-password', { token, newPassword }).then((res) => res.data);
