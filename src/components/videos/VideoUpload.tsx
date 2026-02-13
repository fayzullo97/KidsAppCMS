'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { saveVideoMetadata } from '@/actions/cms';

interface VideoUploadProps {
    topicId: string;
    knowledgeUnitId: string;
    onUploadComplete: () => void;
}

export default function VideoUpload({
    topicId,
    knowledgeUnitId,
    onUploadComplete,
}: VideoUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0); // Basic progress state

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const uploadFile = async () => {
        if (!file || !topicId || !knowledgeUnitId) {
            alert('Please select a file and ensure topic and unit are selected.');
            return;
        }

        setUploading(true);
        setProgress(10); // Start progress

        try {
            // 1. Get Presigned URL
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type,
                }),
            });

            if (!response.ok) throw new Error('Failed to get signed URL');

            const { url, publicUrl, filename } = await response.json();
            setProgress(40); // Got URL

            // 2. Upload to R2
            const uploadResponse = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type,
                },
                body: file,
            });

            if (!uploadResponse.ok) throw new Error('Failed to upload to R2');

            setProgress(80); // Uploaded to R2

            // 3. Save Metadata to Supabase
            const result = await saveVideoMetadata({
                topic_id: topicId,
                knowledge_unit_id: knowledgeUnitId,
                video_url: publicUrl,
                duration_seconds: 0, // Placeholder
                file_size: file.size,
                upload_status: 'completed',
            });

            if (!result.success) throw new Error(result.error);

            setProgress(100);
            alert('Upload completed successfully!');
            setFile(null);
            onUploadComplete();
        } catch (error) {
            console.error('Error uploading video:', error);
            alert('Error uploading video');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-medium mb-4">Upload Video</h3>
            <input
                type="file"
                accept="video/mp4"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-indigo-50 file:text-indigo-700
          hover:file:bg-indigo-100"
            />
            {file && (
                <div className="mt-4">
                    {uploading ? (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    ) : (
                        <button
                            onClick={uploadFile}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Upload {file.name}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
