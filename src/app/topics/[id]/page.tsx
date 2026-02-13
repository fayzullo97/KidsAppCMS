'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Topic, KnowledgeUnit } from '@/types';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function TopicDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [topic, setTopic] = useState<Topic | null>(null);
    const [units, setUnits] = useState<KnowledgeUnit[]>([]);
    const [loading, setLoading] = useState(true);

    // Memoize fetchUnits to include it in dependency arrays if needed
    const fetchUnits = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('knowledge_units')
                .select('*')
                .eq('topic_id', params.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUnits(data || []);
        } catch (error) {
            console.error('Error fetching units:', error);
        }
    }, [params.id]);

    useEffect(() => {
        const fetchTopic = async () => {
            if (!params.id) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('topics')
                    .select('*')
                    .eq('id', params.id)
                    .single();

                if (error) throw error;
                setTopic(data);
                await fetchUnits();
            } catch (error) {
                console.error('Error fetching topic details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopic();
    }, [params.id, fetchUnits]);

    const deleteUnit = async (id: string) => {
        if (!confirm('Are you sure you want to delete this unit?')) return;

        try {
            const { error } = await supabase.from('knowledge_units').delete().eq('id', id);
            if (error) throw error;
            await fetchUnits(); // Refresh list
        } catch (error) {
            console.error('Error deleting unit:', error);
            alert('Error deleting unit');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!topic) return <div>Topic not found</div>;

    return (
        <div>
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center text-gray-900">
                            {topic.icon_url && <img src={topic.icon_url} alt="" className="w-8 h-8 mr-3 rounded" />}
                            {topic.name}
                        </h1>
                        <p className="text-gray-500 mt-1">{topic.description}</p>
                        <div className="mt-2 text-sm text-gray-600">
                            <span className="font-semibold">Age Category:</span> {Array.isArray(topic.age_category) ? topic.age_category.join(', ') : topic.age_category}
                        </div>
                    </div>
                    <Link
                        href={`/topics/${topic.id}/edit`} // Assuming you might have a dedicated edit page or use modal
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                    >
                        <Pencil className="w-4 h-4 mr-1" /> Edit Topic
                    </Link>
                </div>
            </div>

            <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Knowledge Units ({units.length})</h2>
                    <Link
                        href={`/units/new?topicId=${topic.id}`}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md flex items-center hover:bg-blue-700 text-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Unit
                    </Link>
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {units.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No units found for this topic. Click "Add Unit" to create one.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
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
                                {units.map((unit) => (
                                    <tr key={unit.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                <Link href={`/units/${unit.id}`} className="hover:underline text-blue-600">
                                                    {unit.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {unit.mastery_threshold}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={`/units/${unit.id}/edit`}
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
