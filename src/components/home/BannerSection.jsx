'use client';
import React, { useState, useEffect } from 'react'; 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// Swiper CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import Link from 'next/link';

const sliderData = [
  {
    id: 1,
    image:
      '/asstes/AB6AXuC1-OSACj2oD60PY8RgsPuE2rGu-I0cvlZ-eNbZLcINQUQHjoNy9wc3UBHjufURX_gtBgKUpvw-VOk3hDfRco7l04pHdilZwWovMBbJjI7nlhMaEFHN1EIrO0cyxdxTmOokS0bnz4EgDhzhz5ML1y2sGoahi4OIGzLN-pLGo2JAw-sbagieUrZvxIlGQCr_QP703vMfoN6edAVUNll.png',
    subtitle: 'Mastery Through Experience',
    title: 'Your Personal Wisdom Sanctuary',
    description:
      'A curated collection of digital mentors and shared experiences. Distill life teachings into actionable wisdom.',
  },
  {
    id: 2,
    image: '/asstes/slider2.jpg',
    subtitle: 'Growth & Reflection',
    title: 'Preserve Your Life Insights Forever',
    description:
      'Every lesson learned is a step towards greatness. Store your personal growth journey in our digital archive.',
  },
  {
    id: 3,
    image: '/asstes/Image2.png',
    subtitle: 'Community Wisdom',
    title: 'Learn from the Collective Experience',
    description:
      'Explore wisdom shared by others and avoid common pitfalls. Grow faster by learning from the global community.',
  },
];

const BannerSection = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative w-full h-[85vh] md:h-screen overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        loop={true}
        className="w-full h-full mySwiper"
      >
        {sliderData.map(slide => (
          <SwiperSlide key={slide.id}>
            <div
              className="relative w-full h-full bg-cover bg-center flex items-center justify-center px-4"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black/50" />
              <div className="relative z-10 max-w-5xl text-center mx-auto">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-[#E2C799] tracking-[0.3em] text-xs sm:text-sm font-bold uppercase mb-4 block"
                >
                  {slide.subtitle}
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-white font-serif text-4xl sm:text-6xl md:text-8xl font-bold leading-[1.1] mb-6"
                >
                  {slide.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.9, y: 0 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="text-gray-200 text-sm sm:text-lg max-w-2xl mx-auto font-light leading-relaxed mb-10"
                >
                  {slide.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex flex-wrap gap-4 justify-center"
                >
                  <Link href={'/public-lessons'}>
                    {' '}
                    <button className="group flex items-center gap-2 bg-[#F1C40F] hover:bg-white text-black font-bold px-8 py-4 rounded-sm transition-all duration-300 shadow-xl shadow-yellow-500/10">
                      Explore Lessons
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: #fff !important;
          opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
          background: #f1c40f !important;
          opacity: 1;
          width: 25px;
          border-radius: 5px;
        }
        .swiper-button-next,
        .swiper-button-prev {
          color: #f1c40f !important;
          transform: scale(0.6);
          background: rgba(255, 255, 255, 0.05);
          width: 50px !important;
          height: 50px !important;
          border-radius: 50%;
          border: 1px solid rgba(241, 196, 15, 0.2);
        }
      `}</style>
    </section>
  );
};

export default BannerSection;
