import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Use local Supabase instance
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54323';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addAdminRole() {
  try {
    console.log('Connecting to local Supabase...');
    
    const userUuid = '5a9756d1-6150-429a-8076-de836ae721ea';
    
    // First, check if user exists in auth.users
    console.log('Checking if user exists in auth.users...');
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userUuid);
    
    if (authError) {
      console.log('User not found via admin API, but continuing as user was manually created...');
    } else {
      console.log('User found in auth.users:', authUser.user.email);
    }
    
    // Check if user_roles table exists and current roles
    console.log('Checking current user roles...');
    const { data: currentRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userUuid);
    
    if (rolesError) {
      console.error('Error checking user_roles:', rolesError);
      return;
    }
    
    console.log('Current roles for user:', currentRoles);
    
    // Delete existing roles for this user
    if (currentRoles && currentRoles.length > 0) {
      console.log('Deleting existing roles...');
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userUuid);
      
      if (deleteError) {
        console.error('Error deleting existing roles:', deleteError);
        return;
      }
      console.log('Existing roles deleted successfully');
    }
    
    // Insert admin role
    console.log('Inserting admin role...');
    const { data: insertData, error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userUuid,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (insertError) {
      console.error('Error inserting admin role:', insertError);
      return;
    }
    
    console.log('Admin role inserted successfully:', insertData);
    
    // Verify the insertion
    console.log('Verifying admin role...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userUuid);
    
    if (verifyError) {
      console.error('Error verifying admin role:', verifyError);
      return;
    }
    
    console.log('Verification result:', verifyData);
    console.log(`\nSUCCESS: User with UUID ${userUuid} has been granted admin privileges!`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addAdminRole();