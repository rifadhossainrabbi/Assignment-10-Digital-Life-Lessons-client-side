'use client';

import React from 'react';
import Link from 'next/link';
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaEnvelope,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import Image from 'next/image';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { name: 'Home Sanctuary', path: '/' },
    { name: 'Public Wisdom', path: '/lessons' },
    { name: 'Premium Access', path: '/pricing' },
    { name: 'Your Dashboard', path: '/dashboard' },
  ];

  const legalLinks = [
    { name: 'Terms of Wisdom', path: '/terms' },
    { name: 'Privacy Scroll', path: '/privacy' },
    { name: 'Cookie Policy', path: '/cookie-policy' },
    { name: 'Seek Support', path: '/contact' },
  ];

  const socialLinks = [
    { Icon: FaXTwitter, link: '#', label: 'X' },
    { Icon: FaFacebookF, link: '#', label: 'Facebook' },
    { Icon: FaLinkedinIn, link: '#', label: 'LinkedIn' },
    { Icon: FaInstagram, link: '#', label: 'Instagram' },
  ];

  return (
    <footer className="relative bg-[#050505] text-gray-400 border-t border-amber-900/10 pt-16 md:pt-28 pb-12 overflow-hidden">
      {/* 1. Magical Top Border Effect */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>

      {/* 2. Background Subtle Texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>

      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16 md:mb-24">
          {/* Column 1: Brand Essence */}
          <div className="lg:col-span-4 space-y-6 md:space-y-10 text-center sm:text-left">
            <Link
              href="/"
              className="inline-block transition-all duration-700 hover:brightness-125 group"
            >
              <div className="relative">
                <Image
                  width={200}
                  height={70}
                  alt="Digital Life Lessons"
                  src="/asstes/Untitled_design__5_-removebg-preview.png"
                  className="drop-shadow-[0_0_15px_rgba(255,178,71,0.1)] object-contain transition-transform duration-500 group-hover:scale-[1.02] mx-auto sm:mx-0"
                  priority
                />
              </div>
            </Link>
            <p className="text-[14px] leading-relaxed text-gray-500 max-w-sm font-light tracking-wide italic mx-auto sm:mx-0">
              "In the digital age, wisdom is the only currency that never
              devalues. We curate, preserve, and illuminate the lessons that
              define our journey."
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="lg:col-span-2 text-center sm:text-left">
            <h3 className="text-amber-500 font-bold mb-6 md:mb-10 text-[10px] uppercase tracking-[0.4em] opacity-80">
              The Sanctuary
            </h3>
            <ul className="space-y-4 md:space-y-5 text-[13px]">
              {navLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="hover:text-amber-400 transition-all duration-500 flex items-center justify-center sm:justify-start group w-full sm:w-fit"
                  >
                    <span className="hidden sm:inline-block h-[1px] w-0 bg-amber-600 mr-0 group-hover:w-5 group-hover:mr-3 transition-all duration-500"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="lg:col-span-2 text-center sm:text-left">
            <h3 className="text-amber-500 font-bold mb-6 md:mb-10 text-[10px] uppercase tracking-[0.4em] opacity-80">
              The Archives
            </h3>
            <ul className="space-y-4 md:space-y-5 text-[13px]">
              {legalLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="hover:text-amber-400 transition-all duration-500 flex items-center justify-center sm:justify-start group w-full sm:w-fit"
                  >
                    <span className="hidden sm:inline-block h-[1px] w-0 bg-amber-600 mr-0 group-hover:w-5 group-hover:mr-3 transition-all duration-500"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Socials */}
          <div className="lg:col-span-4 space-y-10 md:space-y-12 text-center sm:text-left">
            <div className="space-y-6">
              <h3 className="text-amber-500 font-bold text-[10px] uppercase tracking-[0.4em] opacity-80">
                Reach Out
              </h3>
              <div className="space-y-4 md:space-y-5 text-[13px]">
                <div className="flex items-center justify-center sm:justify-start gap-4 md:gap-5 group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-amber-500/5 border border-amber-900/20 flex items-center justify-center group-hover:border-amber-500/40 transition-all duration-500 shrink-0">
                    <FaEnvelope className="text-amber-600 text-[14px]" />
                  </div>
                  <span className="group-hover:text-amber-400 transition-colors tracking-widest text-[12px] break-all">
                    wisdom@lifelessons.com
                  </span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-4 md:gap-5 group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-amber-500/5 border border-amber-900/20 flex items-center justify-center group-hover:border-amber-500/40 transition-all duration-500 shrink-0">
                    <FaMapMarkerAlt className="text-amber-600 text-[14px]" />
                  </div>
                  <span className="group-hover:text-amber-400 transition-colors tracking-widest text-[12px]">
                    Dhaka, Bangladesh
                  </span>
                </div>
              </div>
            </div>

            {/* Social Dock */}
            <div className="flex justify-center sm:justify-start gap-5 pt-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  aria-label={social.label}
                  className="w-11 h-11 rounded-xl bg-[#111] border border-amber-900/20 flex items-center justify-center text-gray-500 hover:border-amber-500 hover:text-amber-500 hover:shadow-[0_0_25px_rgba(255,178,71,0.1)] transition-all duration-500 group relative"
                >
                  <social.Icon
                    size={16}
                    className="relative z-10 group-hover:scale-110 transition-transform duration-500"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Bottom Bar */}
        <div className="border-t border-amber-900/10 pt-10 md:pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] uppercase tracking-[0.35em] text-gray-600 font-semibold">
              © {currentYear}{' '}
              <span className="text-amber-800 tracking-normal">
                Digital Life Lessons
              </span>
            </p>
            <span className="text-[9px] uppercase tracking-[0.2em] text-gray-700">
              All Human Insights Reserved
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-700/50"></span>
              <span>Crafted for Seekers</span>
            </div>
            <div className="h-4 w-px bg-amber-900/20 hidden sm:block"></div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-700 font-bold">
              EST. MMXXIV
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
