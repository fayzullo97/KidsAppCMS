'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { createTopic, updateTopic } from '@/actions/cms';
import { Topic } from '@/types';

interface TopicFormProps {
    initialData?: Topic;
}

export default function TopicForm({ initialData }: TopicFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        age_range: '', // e.g. "1-4"
        icon_url: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description || '',
                age_range: initialData.age_range || '',
                icon_url: initialData.icon_url || '',
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const topicData = {
                name: formData.name,
                description: formData.description,
                age_range: formData.age_range,
                icon_url: formData.icon_url,
            };

            if (initialData) {
                const result = await updateTopic(initialData.id, topicData);
                if (!result.success) throw new Error(result.error);
            } else {
                const result = await createTopic(topicData);
                if (!result.success) throw new Error(result.error);
            }

            router.push('/topics');
            router.refresh();
        } catch (error) {
            console.error('Error saving topic:', error);
            alert('Error saving topic');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Age Range (e.g. 1-4)
                </label>
                <input
                    type="text"
                    value={formData.age_range}
                    onChange={(e) =>
                        setFormData({ ...formData, age_range: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Icon URL
                </label>
                <input
                    type="text"
                    value={formData.icon_url}
                    onChange={(e) =>
                        setFormData({ ...formData, icon_url: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
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
