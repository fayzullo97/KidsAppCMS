const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Fetching columns for topics...');
    const { data, error } = await supabase.from('topics').select('*').limit(1);

    if (error) {
        console.error('Error:', error.message);
        if (error.message.includes('column')) {
            console.log('The error confirms a column mismatch.');
        }
    } else if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
    } else {
        console.log('Table is empty. Trying to fetch schema via PostgREST metadata...');
        // We can't easily do this via JS client, but we can try to insert a dummy record and see the error details
    }
}

check();
