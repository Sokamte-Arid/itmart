import client from './client';

export const getPushPublicKey = () => client.get('/push/public-key').then((res) => res.data);

export const subscribePush = (subscription, lang) =>
  client.post('/push/subscribe', { subscription, lang }).then((res) => res.data);

export const unsubscribePush = (endpoint) =>
  client.post('/push/unsubscribe', { endpoint }).then((res) => res.data);

export const sendTestPush = () => client.post('/push/test').then((res) => res.data);
