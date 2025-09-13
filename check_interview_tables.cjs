const pg = require('pg');

const client = new pg.Client({
  host: 'localhost',
  port: 54323,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function checkTables() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check all tables with 'interview' in the name
    const interviewTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%interview%'
    `);
    
    console.log('Interview-related tables:', interviewTables.rows.map(row => row.table_name));
    
    // Check if interview_subject_templates exists and its structure
    if (interviewTables.rows.some(row => row.table_name === 'interview_subject_templates')) {
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'interview_subject_templates' 
        AND table_schema = 'public'
      `);
      
      console.log('interview_subject_templates columns:', columns.rows);
      
      // Check data in the table
      const data = await client.query('SELECT * FROM interview_subject_templates LIMIT 10');
      console.log('interview_subject_templates data:', data.rows);
    }
    
    // Check if interview_subjects exists and its structure
    if (interviewTables.rows.some(row => row.table_name === 'interview_subjects')) {
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'interview_subjects' 
        AND table_schema = 'public'
      `);
      
      console.log('interview_subjects columns:', columns.rows);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();