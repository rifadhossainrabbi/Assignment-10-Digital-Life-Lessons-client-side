import React from 'react';
import { ArrowRight, MoveDown } from 'lucide-react';

const BannerSection = () => {
  return (
    <section
      className="relative w-full h-screen min-h-screen flex flex-col justify-center items-center text-center px-4 bg-cover bg-center bg-no-repeat overflow-hidden select-none"
      style={{
        backgroundImage:
          "url('/asstes/AB6AXuC1-OSACj2oD60PY8RgsPuE2rGu-I0cvlZ-eNbZLcINQUQHjoNy9wc3UBHjufURX_gtBgKUpvw-VOk3hDfRco7l04pHdilZwWovMBbJjI7nlhMaEFHN1EIrO0cyxdxTmOokS0bnz4EgDhzhz5ML1y2sGoahi4OIGzLN-pLGo2JAw-sbagieUrZvxIlGQCr_QP703vMfoN6edAVUNll.png')",
      }}
    >
      {/* Dark Overlay - ব্যাকগ্রাউন্ড ইমেজকে কিছুটা অন্ধকার করার জন্য যাতে লেখাগুলো স্পষ্ট দেখা যায় */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Top Subtitle */}
        <span className="text-[#E2C799] tracking-[0.25em] text-xs sm:text-sm font-semibold uppercase mb-4 animate-fade-in">
          Mastery Through Experience
        </span>

        {/* Main Heading */}
        <h1 className="text-white font-serif text-4xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6 max-w-3xl drop-shadow-lg">
          Your Personal Wisdom <br className="hidden sm:inline" /> Sanctuary
        </h1>

        {/* Description Paragraph */}
        <p className="text-gray-300 text-sm sm:text-lg max-w-2xl font-light leading-relaxed mb-10 px-2 opacity-90">
          A curated collection of digital mentors and shared experiences.
          Distill the essence of life's greatest teachings into actionable
          wisdom.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center items-center">
          {/* Explore Lessons Button */}
          <button className="group flex items-center justify-center gap-2 bg-[#F1C40F] hover:bg-[#D4AC0D] text-black font-medium px-8 py-3.5 rounded-md transition-all duration-300 shadow-lg shadow-yellow-500/10 w-full sm:w-auto text-sm sm:text-base">
            Explore Lessons
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Share Wisdom Button */}
          <button className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-white font-medium px-8 py-3.5 rounded-md border border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto text-sm sm:text-base">
            Share Wisdom
          </button>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce opacity-60">
        <div className="w-5 h-8 border-2 border-white/40 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-white rounded-full" />
        </div>
        <MoveDown className="w-3 h-3 text-white" />
      </div>
    </section>
  );
};

export default BannerSection;
