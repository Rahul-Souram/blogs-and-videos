"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import Link from 'next/link';
import Image from 'next/image';


export default function BlogDetail({ params }) {
    const { id } = params;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBlog() {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/blogs/${id}?populate=image`, {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
                    },
                });
                setData(res.data.data);
            } catch (error) {
                console.error('Error fetching blog:', error);
                setData(null);
            } finally {
                setLoading(false);
            }
        }

        fetchBlog();
    }, [id]);

    if (loading) return <div className='mt-5 text-center'>
        <h3>Loading...</h3>
    </div>;
    if (!data) return <p>Failed to load blog</p>;

    const { attributes } = data;

    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-24">
            <h1 className='my-2'>Blog Detail Page</h1>
            <div className='border p-5 rounded'>
                <h2 className='my-1 text-xl'><strong>Title: </strong>{attributes?.title}</h2>
                {attributes?.image?.data && (
                    <div className='mt-2 img-width'>
                        <Image
                            src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${attributes?.image?.data?.attributes?.url}`}
                            alt={attributes?.title}
                            width={200}
                            height={150}
                            className='rounded'
                        />
                    </div>
                )}
                <p><strong>Slug:</strong> {attributes?.slug}</p>
                <p><strong>Publish Date:</strong> {moment(attributes?.publishDate).format('MMMM Do, YYYY')}</p>
                <div className='mt-2'><strong>Body:</strong>
                    {attributes?.body?.map((block, index) => (
                        <p key={index}>{block.children[0].text}</p>
                    ))}
                </div>
                <div className='mt-3'>
                    <p><strong>Read Time:</strong> {moment(attributes?.readTime).format('MMMM Do, YYYY, h:mm:ss a') || 'Not available'}</p>
                    <p><strong>Created At:</strong> {moment(attributes?.createdAt).format('MMMM Do, YYYY, h:mm:ss a')}</p>
                    <p><strong>Updated At:</strong> {moment(attributes?.updatedAt).format('MMMM Do, YYYY, h:mm:ss a')}</p>
                    <p><strong>Published At:</strong> {moment(attributes?.publishedAt).format('MMMM Do, YYYY, h:mm:ss a')}</p>
                </div>
            </div>
            <Link href={'/'} className='border mt-5 p-2 rounded'>
                Go Back
            </Link>
        </main>
    );
}
