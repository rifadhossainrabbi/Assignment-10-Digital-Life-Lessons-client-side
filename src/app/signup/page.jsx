'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { authClient } from '@/lib/auth-client';
import toast from 'react-hot-toast';
import { Button } from '@heroui/react';

const RegisterPage = () => {
  const router = useRouter();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false); // Confirm password visibility state
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch, // for password match
    formState: { errors },
  } = useForm();

  const passwordValue = watch('password'); // password track

  const handleRegisterFunc = async data => {
    setIsLoading(true);
    const { name, email, password, image } = data;

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      image,
    });

    if (error) {
      toast.error(error.message || 'Registration failed!');
      setIsLoading(false);
    } else {
      toast.success('Registration successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/signin');
      }, 1500);
    }
  };

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
    });
  };

  return (
    <div className="container mx-auto min-h-[85vh] flex justify-center items-center p-4">
      <div className="p-8 rounded-xl bg-[#ffb24712] hover:bg-transparent border border-transparent hover:border-amber-500 shadow-lg w-full max-w-md transition-all duration-300">
        <h2 className="text-4xl font-bold text-center mb-10">
          <span className="bg-gradient-to-r from-amber-500 to-blue-500 bg-clip-text text-transparent uppercase tracking-tight">
            Register your account
          </span>
        </h2>

        <form onSubmit={handleSubmit(handleRegisterFunc)} className="space-y-5">
          {/* Name Field */}
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend font-semibold text-gray-300 px-2">
              Name
            </legend>
            <input
              type="text"
              className={`input w-full bg-[#1a1a1a] border-gray-700 focus:outline-none focus:border-amber-600 rounded-xl py-3 px-4 transition-all ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Type here Name"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </fieldset>

          {/* Email Field */}
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend font-semibold text-gray-300 px-2">
              Email
            </legend>
            <input
              type="email"
              className={`input w-full bg-[#1a1a1a] border-gray-700 focus:outline-none focus:border-amber-600 rounded-xl py-3 px-4 transition-all ${errors.email ? 'border-red-500' : ''}`}
              placeholder="Enter your email"
              {...register('email', { required: 'Email field is required' })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </fieldset>

          {/* Photo URL Field */}
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend font-semibold text-gray-300 px-2">
              Photo URL
            </legend>
            <input
              type="text"
              className="input w-full bg-[#1a1a1a] border-gray-700 focus:outline-none focus:border-amber-600 rounded-xl py-3 px-4 transition-all"
              placeholder="Enter photo URL"
              {...register('image')}
            />
          </fieldset>

          {/* Password Field */}
          <fieldset className="fieldset w-full relative">
            <legend className="fieldset-legend font-semibold text-gray-300 px-2">
              Password
            </legend>
            <div className="relative">
              <input
                type={isShowPassword ? 'text' : 'password'}
                className={`input w-full bg-[#1a1a1a] pr-10 border-gray-700 focus:outline-none focus:border-amber-600 rounded-xl py-3 px-4 transition-all ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Type here password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Minimum 6 characters required',
                  },
                  validate: {
                    hasUppercase: v =>
                      /[A-Z]/.test(v) ||
                      'Must contain at least one uppercase letter',
                    hasLowercase: v =>
                      /[a-z]/.test(v) ||
                      'Must contain at least one lowercase letter',
                  },
                })}
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-amber-500 transition-colors"
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
          </fieldset>

          {/* Confirm Password Field */}
          <fieldset className="fieldset w-full relative">
            <legend className="fieldset-legend font-semibold text-gray-300 px-2">
              Confirm Password
            </legend>
            <div className="relative">
              <input
                type={isShowConfirmPassword ? 'text' : 'password'}
                className={`input w-full bg-[#1a1a1a] pr-10 border-gray-700 focus:outline-none focus:border-amber-600 rounded-xl py-3 px-4 transition-all ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Confirm your password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value =>
                    value === passwordValue || 'Passwords do not match',
                })}
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-amber-500 transition-colors"
                onClick={() => setIsShowConfirmPassword(!isShowConfirmPassword)}
              >
                {isShowConfirmPassword ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </span>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </fieldset>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full h-12 bg-gradient-to-r from-amber-300 via-amber-800 to-amber-800 text-white font-bold text-lg rounded-xl shadow-lg active:scale-95 transition-all mt-4 border-none"
          >
            Register
          </Button>
        </form>

        <div className="flex items-center my-8">
          <div className="flex-grow h-[1px] bg-gray-700"></div>
          <span className="mx-4 text-gray-500 text-sm font-medium">OR</span>
          <div className="flex-grow h-[1px] bg-gray-700"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full h-12 font-semibold flex justify-center items-center gap-3 bg-black hover:bg-white hover:text-black text-white border border-gray-800 rounded-md transition-all"
        >
          <FcGoogle size={24} />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link
            href="/signin"
            className="text-amber-500 font-bold hover:text-amber-400 transition-colors underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
