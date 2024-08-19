"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import Link from 'next/link';

export default function VideoDetails({ params }) {
    const { id } = params;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVideo() {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/videos/${id}?populate=video`, {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
                    },
                });
                setData(res.data.data);
            } catch (error) {
                console.error('Error fetching video:', error);
                setData(null);
            } finally {
                setLoading(false);
            }
        }

        fetchVideo();
    }, [id]);

    if (loading) return <div className='mt-5 text-center'>
        <h3>Loading...</h3>
    </div>;
    if (!data) return <p>Failed to load video</p>;

    const { attributes } = data;

    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-24">
            <h1 className='my-2'>Video Detail Page</h1>
            <div className='border p-5 rounded'>
                <h2 className='my-1 text-xl'>{attributes.title}</h2>
                <p><strong>Slug:</strong> {attributes.slug}</p>
                <p><strong>Publish Date:</strong> {moment(attributes.publishDate).format('MMMM Do, YYYY')}</p>
                <div className='mt-2'>
                    <strong>Video Description:</strong>
                    {attributes.videoDescription.map((block, index) => (
                        <p key={index}>{block.children[0].text}</p>
                    ))}
                </div>
                {attributes.video?.data && (
                    <div className='mt-3 video-width'>
                        <video
                            controls
                            src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${attributes.video.data.attributes.url}`}
                            className='w-full max-w-2xl'
                            autoPlay
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )}
                <div className='mt-3'>
                    <p><strong>Duration:</strong> {attributes.duration}</p>
                    <p><strong>Created At:</strong> {moment(attributes.createdAt).format('MMMM Do, YYYY, h:mm:ss a')}</p>
                    <p><strong>Updated At:</strong> {moment(attributes.updatedAt).format('MMMM Do, YYYY, h:mm:ss a')}</p>
                    <p><strong>Published At:</strong> {moment(attributes.publishedAt).format('MMMM Do, YYYY, h:mm:ss a')}</p>
                </div>
            </div>
            <Link href={'/'} className='border mt-5 p-2 rounded'>
                Go Back
            </Link>
        </main>
    );
}
