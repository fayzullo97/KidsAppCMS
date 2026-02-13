'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Video, KnowledgeUnit, Topic } from '@/types';
import { Trash2, Filter, PlayCircle } from 'lucide-react';
import VideoUpload from '@/components/videos/VideoUpload';

export default function VideosPage() {
    const [videos, setVideos] = useState<Video[]>([]);
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
            fetchVideos(selectedUnit);
        } else {
            setVideos([]);
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

    const fetchVideos = async (unitId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .eq('knowledge_unit_id', unitId)
            .order('created_at', { ascending: false });

        if (data) setVideos(data);
        setLoading(false);
    };

    const deleteVideo = async (id: string) => {
        if (!confirm('Are you sure you want to delete this video?')) return;

        try {
            const { error } = await supabase.from('videos').delete().eq('id', id);
            if (error) throw error;
            setVideos(videos.filter((v) => v.id !== id));
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Error deleting video');
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Video Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Topic</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Knowledge Unit</label>
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

            {selectedUnit && (
                <div className="mb-8">
                    <VideoUpload
                        topicId={selectedTopic}
                        knowledgeUnitId={selectedUnit}
                        onUploadComplete={() => fetchVideos(selectedUnit)}
                    />
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-4">Loading videos...</div>
                ) : videos.length === 0 ? (
                    <div className="p-4 text-gray-500">No videos found for this unit.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Size</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {videos.map((video) => (
                                <tr key={video.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800">
                                            <PlayCircle className="w-5 h-5 mr-2" />
                                            View Video
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {video.file_size ? `${(video.file_size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {video.upload_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => deleteVideo(video.id)}
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
