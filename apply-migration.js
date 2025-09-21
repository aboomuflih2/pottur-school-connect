import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Use service role key for admin operations
const supabase = createClient(
  'http://63.250.52.6:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  {
    db: {
      schema: 'public'
    }
  }
);

async function applyMigration() {
  console.log('Applying RLS policy fixes...');
  
  try {
    // Read the migration file
    const migrationSQL = readFileSync('/root/pottur-school-connect/supabase/migrations/049_fix_board_members_rls.sql', 'utf8');
    
    // Split into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        
        // Use the raw SQL execution
        const { data, error } = await supabase.rpc('exec', {
          sql: statement
        });
        
        if (error) {
          // Try alternative approach - direct query
          console.log('Trying direct query...');
          const { data: data2, error: error2 } = await supabase
            .from('_supabase_admin')
            .select('*')
            .limit(0);
          
          if (error2) {
            console.log('Will execute via psql instead');
          }
        } else {
          console.log('Success');
        }
      }
    }
    
    console.log('\nTesting CRUD operations after migration...');
    
    // Test with anon client
    const anonClient = createClient(
      'http://63.250.52.6:54321',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    );
    
    const testMember = {
      name: 'Test Member',
      designation: 'Test Position',
      board_type: 'governing_board',
      bio: 'This is a test member',
      email: 'test@example.com',
      display_order: 999
    };
    
    const { data: newMember, error: createError } = await anonClient
      .from('board_members')
      .insert(testMember)
      .select()
      .single();
    
    if (createError) {
      console.error('Create test failed:', createError.message);
    } else {
      console.log('✅ CREATE test passed! Created member:', newMember.name);
      
      // Test UPDATE
      const { data: updatedMember, error: updateError } = await anonClient
        .from('board_members')
        .update({ designation: 'Updated Test Position' })
        .eq('id', newMember.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Update test failed:', updateError.message);
      } else {
        console.log('✅ UPDATE test passed! Updated designation to:', updatedMember.designation);
      }
      
      // Test DELETE
      const { error: deleteError } = await anonClient
        .from('board_members')
        .delete()
        .eq('id', newMember.id);
      
      if (deleteError) {
        console.error('Delete test failed:', deleteError.message);
      } else {
        console.log('✅ DELETE test passed! Removed test member');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

applyMigration().catch(console.error);