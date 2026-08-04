/**
 * backend/src/config/index.js
 * Centralized Enterprise Configuration Module
 */
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  supabase: {
    url: process.env.SUPABASE_URL || 'https://xphbshysnfgcndcptzvl.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  aiServices: {
    baseUrl: process.env.AI_SERVICES_URL || 'http://localhost:8000',
  },
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
    channelId: process.env.YOUTUBE_CHANNEL_ID || '',
    channelUrl: process.env.YOUTUBE_CHANNEL_URL || '',
  },
};

