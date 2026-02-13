'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Question, KnowledgeUnit, Topic } from '@/types';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [units, setUnits] = useState<KnowledgeUnit[]>([]);

    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [selectedUnit, setSelectedUnit] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTopics();
    }, []);

    useEffect(() => {
        if (selectedTopic) {
            fetchUnits(selectedTopic);
        } else {
            setUnits([]);
            setSelectedUnit('');
        }
    }, [selectedTopic]);

    useEffect(() => {
        if (selectedUnit) {
            fetchQuestions(selectedUnit);
        } else {
            setQuestions([]);
        }
    }, [selectedUnit]);

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

    const fetchQuestions = async (unitId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('knowledge_unit_id', unitId)
            .order('created_at', { ascending: false });

        if (data) setQuestions(data);
        setLoading(false);
    };

    const deleteQuestion = async (id: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return;

        try {
            const { error } = await supabase.from('questions').delete().eq('id', id);
            if (error) throw error;
            setQuestions(questions.filter((q) => q.id !== id));
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('Error deleting question');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Question Management</h1>
                <Link
                    href="/questions/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Topic</label>
                    <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    >
                        <option value="">-- Select Topic --</option>
                        {topics.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Unit</label>
                    <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        disabled={!selectedTopic}
                        className="block w-full rounded-md border-gray-300 shadow-sm p-2 border disabled:bg-gray-100"
                    >
                        <option value="">-- Select Unit --</option>
                        {units.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-4">Loading questions...</div>
                ) : questions.length === 0 ? (
                    <div className="p-4 text-gray-500">No questions found for this unit.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Answer</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {questions.map((q) => (
                                <tr key={q.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {q.question_text}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {q.question_type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {q.correct_answer}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/questions/${q.id}`}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4 inline-flex items-center"
                                        >
                                            <Pencil className="w-4 h-4 mr-1" /> Edit
                                        </Link>
                                        <button
                                            onClick={() => deleteQuestion(q.id)}
                                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
