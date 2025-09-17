#!/usr/bin/env node

/**
 * Self-Hosted Supabase Connection Test Script
 * This script tests the connection to your self-hosted Supabase instance
 * VPS IP: 63.250.52.6
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.production') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Self-Hosted Supabase Connection Test')
console.log('=====================================')
console.log(`VPS IP: 63.250.52.6`)
console.log(`Supabase URL: ${supabaseUrl}`)
console.log('')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!')
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in .env.production')
  console.error('Expected URL: http://63.250.52.6:8000')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('📡 Testing connection to self-hosted Supabase...')
  
  try {
    // Test 1: Basic health check
    console.log('\n1. Testing basic connectivity...')
    const { data: healthData, error: healthError } = await supabase
      .from('academic_programs')
      .select('count')
      .limit(1)
    
    if (healthError) {
      console.error('❌ Health check failed:', healthError.message)
      return false
    }
    
    console.log('✅ Basic connectivity successful')
    
    // Test 2: Authentication test
    console.log('\n2. Testing authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError && authError.message !== 'Invalid JWT') {
      console.error('❌ Auth test failed:', authError.message)
      return false
    }
    
    console.log('✅ Authentication endpoint accessible')
    
    // Test 3: Database query test
    console.log('\n3. Testing database queries...')
    const { data: tableData, error: tableError } = await supabase
      .from('academic_programs')
      .select('*')
      .limit(5)
    
    if (tableError) {
      console.error('❌ Database query failed:', tableError.message)
      return false
    }
    
    console.log('✅ Database queries working')
    console.log(`   Found ${tableData?.length || 0} academic programs`)
    
    return true
  } catch (err) {
    console.error('❌ Connection error:', err.message)
    return false
  }
}

// Run the test
testConnection().then(success => {
  console.log('\n' + '='.repeat(40))
  if (success) {
    console.log('🎉 Self-hosted Supabase connection successful!')
    console.log('Your VPS Supabase instance is ready to use.')
  } else {
    console.log('❌ Connection failed!')
    console.log('Please check:')
    console.log('- VPS is running and accessible at 63.250.52.6')
    console.log('- Supabase is running on port 8000')
    console.log('- Firewall allows connections to port 8000')
    console.log('- API keys are correctly configured')
  }
  process.exit(success ? 0 : 1)
})

export { testConnection }