import { Suspense } from 'react';
import QuestionForm from '@/components/questions/QuestionForm';

export default function NewQuestionPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Create New Question</h1>
            <Suspense fallback={<div>Loading...</div>}>
                <QuestionForm />
            </Suspense>
        </div>
    );
}
