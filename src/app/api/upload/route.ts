import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

export async function POST(request: Request) {
    try {
        const { filename, contentType } = await request.json();

        if (!filename || !contentType) {
            return NextResponse.json(
                { error: 'Filename and content type are required' },
                { status: 400 }
            );
        }

        const uniqueFilename = `${Date.now()}-${filename.replace(/\s+/g, '-')}`;

        const signedUrl = await getSignedUrl(
            r2,
            new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: uniqueFilename,
                ContentType: contentType,
            }),
            { expiresIn: 3600 }
        );

        const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
            ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${uniqueFilename}`
            : `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${uniqueFilename}`;

        return NextResponse.json({
            url: signedUrl,
            publicUrl: r2PublicUrl,
            filename: uniqueFilename,
        });
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return NextResponse.json(
            { error: 'Error generating signed URL' },
            { status: 500 }
        );
    }
}
