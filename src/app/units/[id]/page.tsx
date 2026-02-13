'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { KnowledgeUnit, Video, Question } from '@/types';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ArrowLeft, PlayCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import VideoUpload from '@/components/videos/VideoUpload';

export default function UnitDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [unit, setUnit] = useState<KnowledgeUnit | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchVideos = useCallback(async () => {
        if (!params.id) return;
        const { data } = await supabase
            .from('videos')
            .select('*')
            .eq('knowledge_unit_id', params.id)
            .order('created_at', { ascending: false });
        if (data) setVideos(data);
    }, [params.id]);

    const fetchQuestions = useCallback(async () => {
        if (!params.id) return;
        const { data } = await supabase
            .from('questions')
            .select('*')
            .eq('knowledge_unit_id', params.id)
            .order('created_at', { ascending: false });
        if (data) setQuestions(data);
    }, [params.id]);

    useEffect(() => {
        const fetchUnit = async () => {
            if (!params.id) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('knowledge_units')
                    .select('*, topics(name)')
                    .eq('id', params.id)
                    .single();

                if (error) throw error;
                setUnit(data);
                await Promise.all([fetchVideos(), fetchQuestions()]);
            } catch (error) {
                console.error('Error fetching unit details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUnit();
    }, [params.id, fetchVideos, fetchQuestions]);

    const deleteVideo = async (id: string) => {
        if (!confirm('Are you sure you want to delete this video?')) return;
        try {
            const { error } = await supabase.from('videos').delete().eq('id', id);
            if (error) throw error;
            await fetchVideos();
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Error deleting video');
        }
    };

    const deleteQuestion = async (id: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        try {
            const { error } = await supabase.from('questions').delete().eq('id', id);
            if (error) throw error;
            await fetchQuestions();
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('Error deleting question');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!unit) return <div>Unit not found</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center text-gray-900">
                            {unit.thumbnail_url && <img src={unit.thumbnail_url} alt="" className="w-8 h-8 mr-3 rounded" />}
                            {unit.name}
                        </h1>
                        <p className="text-gray-500 mt-1">Topic: {(unit as any).topics?.name}</p>
                        <div className="mt-2 text-sm text-gray-600">
                            <span className="font-semibold">Mastery Threshold:</span> {unit.mastery_threshold}
                        </div>
                    </div>
                    <Link
                        href={`/units/${unit.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                    >
                        <Pencil className="w-4 h-4 mr-1" /> Edit Unit
                    </Link>
                </div>
            </div>

            {/* Videos Section */}
            <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Videos</h2>

                <div className="mb-6">
                    <VideoUpload
                        topicId={unit.topic_id}
                        knowledgeUnitId={unit.id}
                        onUploadComplete={fetchVideos}
                    />
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {videos.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No videos uploaded. Use the upload box above.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {videos.map((video) => (
                                    <tr key={video.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                                                <PlayCircle className="w-5 h-5 mr-2" /> View Video
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {video.file_size ? `${(video.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => deleteVideo(video.id)} className="text-red-600 hover:text-red-900 inline-flex items-center">
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

            {/* Questions Section */}
            <div className="border-t pt-6 pb-10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Questions</h2>
                    <Link
                        href={`/questions/new?unitId=${unit.id}`}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md flex items-center hover:bg-blue-700 text-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Question
                    </Link>
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {questions.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No questions added. Click "Add Question".
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {questions.map((q) => (
                                    <tr key={q.id}>
                                        <td className="px-6 py-4 text-sm text-gray-900">{q.question_text}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{q.question_type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={`/questions/${q.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4 inline-flex items-center">
                                                <Pencil className="w-4 h-4 mr-1" /> Edit
                                            </Link>
                                            <button onClick={() => deleteQuestion(q.id)} className="text-red-600 hover:text-red-900 inline-flex items-center">
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
