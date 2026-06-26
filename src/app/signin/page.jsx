'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from '@heroui/react';

const LogInPage = () => {
  // const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginFunc = async data => {
    setIsLoading(true);
    const { data: res, error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      rememberMe: true,
      callbackURL: '/',
    });

    if (error) {
      toast.error(error.message || 'Login failed!');
      setIsLoading(false);
    } else {
      toast.success('Login successful!');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
    });
  };

  return (
    <div className="container mx-auto min-h-[80vh] flex justify-center items-center p-4">
      {/* <Toaster position="top-right" /> */}

      {/* Main Card Container */}
      <div className="p-8 rounded-xl bg-[#ffb24712] hover:bg-transparent border border-transparent hover:border-amber-500 shadow-lg w-full max-w-md transition-all duration-300">
        {/* Header Section */}
        <header className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-amber-500 to-blue-500 bg-clip-text text-transparent">
              Login your account
            </span>
          </h2>
          <p className="text-gray-500 text-[10px] mt-2 uppercase tracking-[0.3em] font-bold">
            Digital Life Lessons
          </p>
        </header>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit(handleLoginFunc)}>
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-400">Email</label>
            <input
              type="email"
              className={`w-full bg-[#0d0d0d] border border-gray-800 text-gray-200 py-3.5 px-4 rounded-xl focus:border-amber-600 outline-none transition-all ${errors.email && 'border-red-500'}`}
              placeholder="example@mail.com"
              {...register('email', { required: 'Email field is required' })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-semibold text-gray-400">
              Password
            </label>
            <div className="relative">
              <input
                type={isShowPassword ? 'text' : 'password'}
                className={`w-full bg-[#0d0d0d] border border-gray-800 text-gray-200 py-3.5 pl-4 pr-12 rounded-xl focus:border-amber-600 outline-none transition-all ${errors.password && 'border-red-500'}`}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password field is required',
                })}
              />
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-amber-500 transition-colors"
                onClick={() => setIsShowPassword(!isShowPassword)}
              >
                {isShowPassword ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </span>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full h-14 bg-gradient-to-r from-amber-400 via-amber-700 to-amber-900 text-white font-bold text-lg rounded-xl shadow-xl shadow-amber-900/10 active:scale-95 transition-all mt-4 border-none"
          >
            Login
          </Button>
        </form>

        {/* Fixed Separator: Ensuring it stays inside the card */}
        <div className="flex items-center my-10 w-full px-2">
          <div className="flex-grow h-[1px] bg-gray-800"></div>
          <span className="mx-4 text-gray-600 text-[10px] font-black tracking-widest uppercase shrink-0">
            OR
          </span>
          <div className="flex-grow h-[1px] bg-gray-800"></div>
        </div>

        {/* Google Login Button */}
        <Button
          variant="bordered"
          onPress={handleGoogleSignIn}
          className="w-full h-14 border-gray-800 text-white hover:bg-white hover:text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-3"
        >
          <FcGoogle size={24} />
          Continue with Google
        </Button>

        {/* Footer Link */}
        <footer className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-amber-500 font-bold hover:text-amber-400 transition-colors underline underline-offset-8 decoration-amber-500/30"
            >
              SignIn Now
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LogInPage;
