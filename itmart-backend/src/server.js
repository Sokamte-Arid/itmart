require('dotenv').config();
const app = require('./app');
const { isPushConfigured } = require('./utils/push');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 IT Mart API running on http://localhost:${PORT}`);
  if (!isPushConfigured()) {
    console.warn('🔕 Push notifications disabled — run `npm run push:keys` and add the VAPID keys to .env to enable them.');
  }
});
