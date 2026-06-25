'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaLightbulb, FaBookOpen, FaUsers, FaChartLine } from 'react-icons/fa';

const WhyLearning = () => {
  const benefits = [
    {
      id: 1,
      icon: <FaLightbulb className="text-amber-500 text-4xl" />,
      title: 'Preserve Wisdom',
      description:
        'Life lessons are fleeting. Documenting them ensures that the insights you gain today stay with you forever.',
    },
    {
      id: 2,
      icon: <FaBookOpen className="text-blue-500 text-4xl" />,
      title: 'Mindful Reflection',
      description:
        'Writing down your experiences encourages deep reflection, helping you understand your own growth journey.',
    },
    {
      id: 3,
      icon: <FaUsers className="text-amber-500 text-4xl" />,
      title: 'Community Growth',
      description:
        'Sharing your wisdom helps others avoid similar mistakes and find inspiration in your successes.',
    },
    {
      id: 4,
      icon: <FaChartLine className="text-blue-500 text-4xl" />,
      title: 'Track Progress',
      description:
        'Visualize how your mindset evolves over time by looking back at the lessons you’ve learned through the years.',
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="py-20 w-full bg-[#0a0a0a] overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-amber-500 to-blue-500 bg-clip-text text-transparent uppercase tracking-tight">
              Why Learning From Life Matters
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            Your experiences are your greatest teachers. Our platform helps you
            capture, organize, and share those priceless moments of clarity.
          </motion.p>
        </div>

        {/* Benefit Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {benefits.map(benefit => (
            <motion.div
              key={benefit.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05, translateY: -5 }}
              className="p-8 rounded-2xl bg-[#141414] border border-gray-800 hover:border-amber-500/50 transition-all duration-300 shadow-xl group"
            >
              <div className="mb-6 bg-gray-900 w-16 h-16 rounded-xl flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-amber-500 transition-colors">
                {benefit.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyLearning;
