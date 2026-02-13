'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

// --- Units ---

export async function createUnit(data: any) {
    try {
        const { error } = await supabaseAdmin.from('knowledge_units').insert([data]);
        if (error) throw error;
        revalidatePath('/units');
        revalidatePath(`/topics/${data.topic_id}`);
        return { success: true };
    } catch (error: any) {
        console.error('Error creating unit:', error);
        return { success: false, error: error.message };
    }
}

export async function updateUnit(id: string, data: any) {
    try {
        const { error } = await supabaseAdmin
            .from('knowledge_units')
            .update(data)
            .eq('id', id);
        if (error) throw error;
        revalidatePath('/units');
        revalidatePath(`/topics/${data.topic_id}`);
        return { success: true };
    } catch (error: any) {
        console.error('Error updating unit:', error);
        return { success: false, error: error.message };
    }
}

// --- Topics ---

export async function createTopic(data: any) {
    try {
        const { error } = await supabaseAdmin.from('topics').insert([data]);
        if (error) throw error;
        revalidatePath('/topics');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTopic(id: string, data: any) {
    try {
        const { error } = await supabaseAdmin.from('topics').update(data).eq('id', id);
        if (error) throw error;
        revalidatePath('/topics');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


// --- Questions ---

export async function createQuestion(data: any) {
    try {
        const { error } = await supabaseAdmin.from('questions').insert([data]);
        if (error) throw error;
        revalidatePath('/questions');
        revalidatePath(`/units/${data.knowledge_unit_id}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateQuestion(id: string, data: any) {
    try {
        const { error } = await supabaseAdmin.from('questions').update(data).eq('id', id);
        if (error) throw error;
        revalidatePath('/questions');
        revalidatePath(`/units/${data.knowledge_unit_id}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- Videos ---

export async function saveVideoMetadata(data: any) {
    try {
        const { error } = await supabaseAdmin.from('videos').insert([data]);
        if (error) throw error;
        revalidatePath(`/units/${data.knowledge_unit_id}`);
        revalidatePath('/videos');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
