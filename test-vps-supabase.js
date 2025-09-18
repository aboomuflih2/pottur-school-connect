import { createClient } from '@supabase/supabase-js';

async function testVPSSupabaseConnection() {
  const supabaseUrl = 'http://63.250.52.6:8000';
  // Using a placeholder key for initial connection test
  const supabaseKey = 'placeholder-key';
  
  try {
    console.log('Testing VPS Supabase API connection...');
    console.log('Supabase URL:', supabaseUrl);
    
    // Test basic HTTP connectivity first
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('HTTP Response Status:', response.status);
    console.log('HTTP Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('✅ VPS Supabase API is accessible!');
      const data = await response.text();
      console.log('Response body:', data);
    } else {
      console.log('❌ VPS Supabase API returned error status:', response.status);
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testVPSSupabaseConnection();