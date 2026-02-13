import { supabaseAdmin } from './src/lib/supabase-admin';

async function checkSchema() {
    console.log('Checking topics table schema...');
    const { data, error } = await supabaseAdmin
        .from('topics')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching topics:', error);
    } else {
        console.log('Successfully fetched sample record:', data[0]);
        console.log('Available columns:', Object.keys(data[0] || {}));
    }
}

checkSchema();
