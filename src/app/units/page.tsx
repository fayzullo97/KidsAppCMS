'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { KnowledgeUnit, Topic } from '@/types';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Filter } from 'lucide-react';

export default function UnitsPage() {
    const [units, setUnits] = useState<KnowledgeUnit[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopics();
        fetchUnits();
    }, []);

    useEffect(() => {
        fetchUnits();
    }, [selectedTopic]);

    const fetchTopics = async () => {
        const { data } = await supabase.from('topics').select('*').order('name');
        if (data) setTopics(data);
    };

    const fetchUnits = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('knowledge_units')
                .select(`*, topics(name)`)
                .order('created_at', { ascending: false });

            if (selectedTopic) {
                query = query.eq('topic_id', selectedTopic);
            }

            const { data, error } = await query;
            if (error) throw error;
            setUnits(data || []);
        } catch (error) {
            console.error('Error fetching units:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteUnit = async (id: string) => {
        if (!confirm('Are you sure you want to delete this unit?')) return;

        try {
            const { error } = await supabase.from('knowledge_units').delete().eq('id', id);
            if (error) throw error;
            setUnits(units.filter((unit) => unit.id !== id));
        } catch (error) {
            console.error('Error deleting unit:', error);
            alert('Error deleting unit');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Knowledge Units</h1>
                <Link
                    href="/units/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Unit
                </Link>
            </div>

            <div className="mb-6 flex items-center bg-white p-4 rounded-lg shadow-sm">
                <Filter className="w-5 h-5 text-gray-500 mr-2" />
                <span className="mr-2 text-sm font-medium text-gray-700">Filter by Topic:</span>
                <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                >
                    <option value="">All Topics</option>
                    {topics.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                            {topic.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Topic
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mastery Threshold
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {units.map((unit: any) => (
                                <tr key={unit.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {unit.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {unit.topics?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {unit.mastery_threshold}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/units/${unit.id}`}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4 inline-flex items-center"
                                        >
                                            <Pencil className="w-4 h-4 mr-1" /> Edit
                                        </Link>
                                        <button
                                            onClick={() => deleteUnit(unit.id)}
                                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                                        </button>
                                        {/* Placeholder for managing videos later */}
                                        <Link
                                            href={`/videos?unit=${unit.id}`}
                                            className="text-green-600 hover:text-green-900 ml-4 inline-flex items-center"
                                        >
                                            Videos
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
