'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Question } from '@/types';
import QuestionForm from '@/components/questions/QuestionForm';
import { useParams } from 'next/navigation';

export default function EditQuestionPage() {
    const params = useParams();
    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuestion = async () => {
            if (!params.id) return;

            try {
                const { data, error } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('id', params.id)
                    .single();

                if (error) throw error;
                setQuestion(data);
            } catch (error) {
                console.error('Error fetching question:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestion();
    }, [params.id]);

    if (loading) return <div>Loading...</div>;
    if (!question) return <div>Question not found</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit Question</h1>
            <QuestionForm initialData={question} />
        </div>
    );
}
