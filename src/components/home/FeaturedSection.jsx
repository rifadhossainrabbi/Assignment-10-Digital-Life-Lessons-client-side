'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiHeart, FiTag } from 'react-icons/fi';
import { api } from '@/lib/reusableApi';

const FeaturedSection = () => {
  const [featuredLessons, setFeaturedLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const data = await api.get('/featured-lessons');
        setFeaturedLessons(data);
      } catch (err) {
        console.error('Failed to load featured wisdom:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-[#E5A93C] font-mono uppercase tracking-widest">
        Loading Wisdom...
      </div>
    );
  }

  return (
    <section className="py-20 w-full bg-[#0A0908]">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[#E5A93C] font-mono text-xs uppercase tracking-[0.3em] mb-3 block">
              Handpicked Insights
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight">
              Featured Life Lessons
            </h2>
          </div>
          <Link
            href="/public-lessons"
            className="flex items-center gap-2 text-[#8C8275] hover:text-white transition-all font-mono text-xs uppercase tracking-widest group"
          >
            Browse All Archives{' '}
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Lessons Grid - 4 items as requested */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredLessons.map(lesson => (
            <div
              key={lesson._id}
              className="bg-[#0F0E0C] border border-[#1A1612] rounded-2xl overflow-hidden flex flex-col h-full group hover:border-[#E5A93C]/30 transition-all duration-500 shadow-xl"
            >
              {/* Image Header */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={lesson.image}
                  alt={lesson.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-75"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-[#E5A93C] text-black text-[9px] font-bold uppercase px-2 py-1 rounded">
                    {lesson.accessLevel}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#8C8275] uppercase tracking-wider mb-3">
                  <FiTag className="text-[#E5A93C]" /> {lesson.category}
                </div>

                <h3 className="text-xl font-serif text-white mb-4 line-clamp-2 leading-snug group-hover:text-[#E5A93C] transition-colors">
                  {lesson.title}
                </h3>

                <p className="text-[#8C8275] text-sm font-serif italic mb-6 line-clamp-3 leading-relaxed">
                  {lesson.description}
                </p>

                {/* Creator Info & Footer */}
                <div className="mt-auto pt-6 border-t border-[#1A1612] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={lesson.author?.image}
                      className="w-6 h-6 rounded-full grayscale group-hover:grayscale-0 transition-all"
                      alt="creator"
                    />
                    <span className="text-[10px] text-white uppercase tracking-tighter font-mono">
                      {lesson.author?.name?.split(' ')[0]}
                    </span>
                  </div>
                  <Link
                    href={`/public-lessons/${lesson._id}`}
                    className="text-[10px] font-bold text-[#E5A93C] uppercase tracking-[0.2em] hover:text-white transition-colors"
                  >
                    See Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
