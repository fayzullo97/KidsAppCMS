'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { createQuestion, updateQuestion } from '@/actions/cms';
import { Question, Topic, KnowledgeUnit } from '@/types';

interface QuestionFormProps {
    initialData?: Question;
}

export default function QuestionForm({ initialData }: QuestionFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedUnitId = searchParams.get('unitId');

    const [loading, setLoading] = useState(false);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [units, setUnits] = useState<KnowledgeUnit[]>([]);

    const [selectedTopic, setSelectedTopic] = useState('');

    const [formData, setFormData] = useState({
        knowledge_unit_id: preselectedUnitId || '',
        question_text: '',
        question_type: 'single_choice',
        correct_answer: '',
        incorrect_answers: ['', '', ''], // Default 3 incorrect answers
    });

    useEffect(() => {
        fetchTopics();

        async function initialize() {
            if (initialData) {
                // ... existing initialData logic ...
                setFormData({
                    knowledge_unit_id: initialData.knowledge_unit_id,
                    question_text: initialData.question_text,
                    question_type: initialData.question_type,
                    correct_answer: initialData.correct_answer,
                    incorrect_answers: initialData.incorrect_answers || ['', '', ''],
                });
                fetchUnitDetails(initialData.knowledge_unit_id);
            } else if (preselectedUnitId) {
                // Fetch unit details to set the topic
                await fetchUnitDetails(preselectedUnitId);
            }
        }
        initialize();
    }, [initialData, preselectedUnitId]);

    useEffect(() => {
        if (selectedTopic) {
            fetchUnits(selectedTopic);
        } else {
            setUnits([]);
        }
    }, [selectedTopic]);

    const fetchUnitDetails = async (unitId: string) => {
        const { data } = await supabase.from('knowledge_units').select('topic_id').eq('id', unitId).single();
        if (data) {
            setSelectedTopic(data.topic_id);
        }
    };

    const fetchTopics = async () => {
        const { data } = await supabase.from('topics').select('*').order('name');
        if (data) setTopics(data);
    };

    const fetchUnits = async (topicId: string) => {
        const { data } = await supabase
            .from('knowledge_units')
            .select('*')
            .eq('topic_id', topicId)
            .order('name');
        if (data) setUnits(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const questionData = {
                knowledge_unit_id: formData.knowledge_unit_id,
                question_text: formData.question_text,
                question_type: formData.question_type,
                correct_answer: formData.correct_answer,
                incorrect_answers: formData.incorrect_answers.filter(a => a.trim() !== ''),
            };

            if (initialData) {
                const result = await updateQuestion(initialData.id, questionData);
                if (!result.success) throw new Error(result.error);
            } else {
                const result = await createQuestion(questionData);
                if (!result.success) throw new Error(result.error);
            }

            if (formData.knowledge_unit_id) {
                router.push(`/units/${formData.knowledge_unit_id}`);
            } else {
                router.push('/questions');
            }
            router.refresh();
        } catch (error) {
            console.error('Error saving question:', error);
            alert('Error saving question');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            {!preselectedUnitId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Topic</label>
                        <select
                            required
                            value={selectedTopic}
                            onChange={(e) => setSelectedTopic(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        >
                            <option value="">Select a Topic</option>
                            {topics.map((topic) => (
                                <option key={topic.id} value={topic.id}>
                                    {topic.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Knowledge Unit</label>
                        <select
                            required
                            value={formData.knowledge_unit_id}
                            onChange={(e) => setFormData({ ...formData, knowledge_unit_id: e.target.value })}
                            disabled={!selectedTopic}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border disabled:bg-gray-100"
                        >
                            <option value="">Select a Unit</option>
                            {units.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Question Text</label>
                <textarea
                    required
                    value={formData.question_text}
                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    rows={2}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Question Type</label>
                <select
                    value={formData.question_type}
                    onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                >
                    <option value="single_choice">Single Choice</option>
                    <option value="tap_object">Tap Object</option>
                    <option value="image_selection">Image Selection</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
                <input
                    type="text"
                    required
                    value={formData.correct_answer}
                    onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Incorrect Answers</label>
                {formData.incorrect_answers.map((ans, index) => (
                    <input
                        key={index}
                        type="text"
                        value={ans}
                        placeholder={`Incorrect Answer ${index + 1}`}
                        onChange={(e) => {
                            const newAnswers = [...formData.incorrect_answers];
                            newAnswers[index] = e.target.value;
                            setFormData({ ...formData, incorrect_answers: newAnswers });
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border mb-2"
                    />
                ))}
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
}
