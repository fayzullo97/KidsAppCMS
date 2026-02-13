'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { createUnit, updateUnit } from '@/actions/cms';
import { KnowledgeUnit, Topic } from '@/types';

interface UnitFormProps {
    initialData?: KnowledgeUnit;
}

export default function UnitForm({ initialData }: UnitFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedTopicId = searchParams.get('topicId');

    const [loading, setLoading] = useState(false);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [formData, setFormData] = useState({
        topic_id: preselectedTopicId || '',
        name: '',
        mastery_threshold: 10,
        thumbnail_url: '',
    });

    useEffect(() => {
        fetchTopics();
        if (initialData) {
            setFormData({
                topic_id: initialData.topic_id,
                name: initialData.name,
                mastery_threshold: initialData.mastery_threshold,
                thumbnail_url: initialData.thumbnail_url || '',
            });
        } else if (preselectedTopicId) {
            setFormData(prev => ({ ...prev, topic_id: preselectedTopicId }));
        }
    }, [initialData, preselectedTopicId]);

    const fetchTopics = async () => {
        const { data } = await supabase.from('topics').select('*').order('name');
        if (data) setTopics(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const unitData = {
                topic_id: formData.topic_id,
                name: formData.name,
                mastery_threshold: formData.mastery_threshold,
                thumbnail_url: formData.thumbnail_url,
            };

            if (initialData) {
                const result = await updateUnit(initialData.id, unitData);
                if (!result.success) throw new Error(result.error);
            } else {
                const result = await createUnit(unitData);
                if (!result.success) throw new Error(result.error);
            }

            // Redirect back to topic details if we have topic context, otherwise units list
            if (formData.topic_id) {
                router.push(`/topics/${formData.topic_id}`);
            } else {
                router.push('/units');
            }
            router.refresh();
        } catch (error) {
            console.error('Error saving unit:', error);
            alert('Error saving unit');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            {/* Only show topic selector if not preselected via URL */}
            {!preselectedTopicId && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Topic</label>
                    <select
                        required
                        value={formData.topic_id}
                        onChange={(e) => setFormData({ ...formData, topic_id: e.target.value })}
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
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Mastery Threshold
                </label>
                <input
                    type="number"
                    required
                    min="1"
                    value={formData.mastery_threshold === 0 ? '' : formData.mastery_threshold}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            mastery_threshold: e.target.value === '' ? 0 : parseInt(e.target.value),
                        })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Thumbnail URL
                </label>
                <input
                    type="text"
                    value={formData.thumbnail_url}
                    onChange={(e) =>
                        setFormData({ ...formData, thumbnail_url: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
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
