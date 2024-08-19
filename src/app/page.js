"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import Link from 'next/link';
import Image from 'next/image';
import { truncate } from './utils';

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataType, setDataType] = useState("blogs");
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);

  const fetchData = async (type) => {
    setLoading(true);
    try {
      const endpoint = type === "blogs" ? "blogs?populate=image" : "videos?populate=video";
      const res = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
        },
      });
      setData(res.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(dataType);
  }, [dataType]);

  const filteredData = data?.filter(item =>
    item.attributes.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24">
      <div className="flex border p-3 rounded">
        <button onClick={() => { setDataType("blogs"); setCurrentPage(1); }} className={`border p-2 rounded ${dataType === "blogs" ? "bg-white text-black" : "text-white bg-dark"}`}>Blogs</button>
        <button className={`ms-2 border p-2 rounded ${dataType === "videos" ? "bg-white text-black" : "text-white bg-dark"}`} onClick={() => { setDataType("videos"); setCurrentPage(1); }}>Videos</button>
      </div>
      <div>
        <input
          type="text"
          placeholder="Search here"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="m-2 rounded text-black p-1"
        />
      </div>
      <div>
        {loading && !data && (
          <div>
            <div className='bord' />
          </div>
        )}
        <div className='mt-4 flex flex-wrap'>
          {currentData?.map((item) => {
            const { attributes } = item;
            return (
              <Link href={`/${dataType}/${item.id}`} key={item.id}>
                <div className='p-4 border rounded m-2'>
                  <h2>
                    <strong>Title:</strong> {truncate(attributes.title, 30)}
                  </h2>
                  <p><strong>Slug:</strong> {attributes.slug}</p>
                  <p><strong>Publish Date:</strong> {moment(attributes.publishDate).format('MMMM Do, YYYY')}</p>
                  {dataType === "blogs" && (
                    <>
                      {attributes.image?.data && (
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
                      <p><strong>Body:</strong></p>
                      {attributes.body?.map((block, index) => (
                        <p key={index}>{truncate(block.children[0].text, 40)}</p>
                      ))}
                      <p><strong>Read Time:</strong> {moment(attributes.readTime).format("MM/DD/YYYY, hh:mm:ss") || 'Not available'}</p>
                    </>
                  )}
                  {dataType === "videos" && (
                    <>
                      {attributes.video?.data && (
                        <div className='mt-2 video-width'>
                          <video
                            controls
                            width="200"
                            className='rounded'
                            autoPlay
                            loop
                            muted
                          >
                            <source
                              src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${attributes.video.data.attributes.url}`}
                              type="video/mp4"
                            />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                      <p><strong>Video Description:</strong></p>
                      {attributes.videoDescription?.map((block, index) => (
                        <p key={index}>{truncate(block.children[0].text, 40)}</p>
                      ))}
                      <p><strong>Duration:</strong> {attributes.duration}</p>
                    </>
                  )}
                  <p><strong>Created At:</strong> {moment(attributes.createdAt).format('MMMM Do, YYYY, h:mm:ss a')}</p>
                  <p><strong>Updated At:</strong> {moment(attributes.updatedAt).format('MMMM Do, YYYY, h:mm:ss a')}</p>
                  <p><strong>Published At:</strong> {moment(attributes.publishedAt).format('MMMM Do, YYYY, h:mm:ss a')}</p>
                </div>
              </Link>
            );
          })}
        </div>
        {!data && (
          <div>
            <h3>Failed to load Data</h3>
          </div>
        )}
        {
          currentData?.length === 0 && (
            <h3>No Data Found!</h3>
          )
        }
      </div>
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`m-1 px-2 bg-black border rounded ${currentPage === index + 1 ? 'bg-gray-300' : ''}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </main>
  );
}
