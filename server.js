import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'http://localhost:54323',
  process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'Backend API is running',
    port: PORT,
    supabaseUrl: process.env.VITE_SUPABASE_URL
  });
});

// Proxy to Supabase (if needed)
app.use('/supabase', async (req, res) => {
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}${req.path}`, {
      method: req.method,
      headers: {
        ...req.headers,
        'apikey': process.env.VITE_SUPABASE_ANON_KEY
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API status: http://localhost:${PORT}/api/status`);
});