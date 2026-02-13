'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Topic } from '@/types';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function TopicsPage() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            const { data, error } = await supabase
                .from('topics')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTopics(data || []);
        } catch (error) {
            console.error('Error fetching topics:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteTopic = async (id: string) => {
        if (!confirm('Are you sure you want to delete this topic?')) return;

        try {
            const { error } = await supabase.from('topics').delete().eq('id', id);
            if (error) throw error;
            setTopics(topics.filter((topic) => topic.id !== id));
        } catch (error) {
            console.error('Error deleting topic:', error);
            alert('Error deleting topic');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Topics</h1>
                <Link
                    href="/topics/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Topic
                </Link>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Age Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created At
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {topics.map((topic) => (
                            <tr key={topic.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        <Link href={`/topics/${topic.id}`} className="hover:underline text-blue-600">
                                            {topic.name}
                                        </Link>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {topic.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {Array.isArray(topic.age_category)
                                        ? topic.age_category.join(', ')
                                        : topic.age_category}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(topic.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                        href={`/topics/${topic.id}`}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4 inline-flex items-center"
                                    >
                                        <Pencil className="w-4 h-4 mr-1" /> Edit
                                    </Link>
                                    <button
                                        onClick={() => deleteTopic(topic.id)}
                                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
