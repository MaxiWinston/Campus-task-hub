// test-supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test function
async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Basic connection test using the auth API
    console.log('\n🔍 Testing basic connection...');
    const { data: settings, error: settingsError } = await supabase.auth.getSession();
    
    if (settingsError) {
      console.log('⚠️ Could not establish basic connection:', settingsError.message);
    } else {
      console.log('✅ Basic connection test passed');
      console.log('Session:', settings.session ? 'Active session found' : 'No active session');
    }
    
    // Test 2: List all tables in the public schema
    console.log('\n🔍 Listing tables in public schema...');
    try {
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_tables');
        
      if (tablesError) throw tablesError;
      
      console.log('✅ Tables in public schema:');
      if (tables && tables.length > 0) {
        tables.forEach((table, index) => {
          console.log(`${index + 1}. ${table.table_name}`);
        });
        
        // If we have tables, try to get row count for each
        console.log('\n📊 Table row counts:');
        for (const table of tables) {
          try {
            const { count, error: countError } = await supabase
              .from(table.table_name)
              .select('*', { count: 'exact', head: true });
              
            if (!countError) {
              console.log(`- ${table.table_name}: ${count} rows`);
            }
          } catch (e) {
            console.log(`- ${table.table_name}: Could not get row count (${e.message})`);
          }
        }
      } else {
        console.log('No tables found in the public schema');
      }
    } catch (e) {
      console.log('⚠️ Could not list tables. This might be a permission issue or the function might not exist.');
      console.log('Error details:', e.message);
    }
    
    // Test 3: Try to get database metadata
    console.log('\n🔍 Checking database metadata...');
    try {
      const { data: version, error: versionError } = await supabase
        .rpc('version');
        
      if (versionError) throw versionError;
      console.log('✅ Database version:', version);
    } catch (e) {
      console.log('⚠️ Could not get database version:', e.message);
    }
    
    console.log('\n✅ Connection test completed!');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:');
    console.error('Error code:', error.code);
    console.error('Message:', error.message);
    console.error('Details:', error.details || 'No additional details');
    
    console.log('\nConnection details:');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key:', supabaseKey ? `${supabaseKey.substring(0, 8)}...` : 'Missing');
    
    // Additional diagnostics
    console.log('\nNext steps:');
    console.log('1. Verify your Supabase URL and key are correct');
    console.log('2. Check if your database has the expected tables');
    console.log('3. Ensure your Supabase project has the correct Row Level Security (RLS) policies');
    
    process.exit(1);
  }
}

// Create the get_tables function if it doesn't exist
async function setupDatabaseFunctions() {
  try {
    console.log('\n🔧 Setting up database functions...');
    
    const { data, error } = await supabase.rpc('get_tables');
    
    if (error && error.code === '42703') {
      console.log('Creating get_tables function...');
      const { error: createError } = await supabase.rpc(`
        create or replace function get_tables()
        returns table (table_name text) as $$
        begin
          return query
          select table_name::text
          from information_schema.tables
          where table_schema = 'public'
          and table_type = 'BASE TABLE';
        end;
        $$ language plpgsql security definer;
      `);
      
      if (createError) throw createError;
      console.log('✅ Created get_tables function');
    } else if (!error) {
      console.log('✅ get_tables function already exists');
    } else {
      throw error;
    }
  } catch (e) {
    console.log('⚠️ Could not set up database functions. You might need to run this as a database superuser.');
    console.log('Error details:', e.message);
  }
}

// Run the tests
async function main() {
  await setupDatabaseFunctions();
  await testConnection();
}

main();
