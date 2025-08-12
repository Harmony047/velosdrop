"use client";

import GoogleBtn from "@/components/customer/GoogleBtn";
import { handleGoogleSignIn, handleSignInSubmit } from "@/utils/authentication";
import { useSignIn } from "@clerk/nextjs";
import React, { useState } from "react";
import type { SignInResource } from "@clerk/types";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { signIn, setActive, isLoaded } = useSignIn();

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#0a0a0a] to-[#1e0b36]">
      <form
        onSubmit={(e) =>
          handleSignInSubmit(
            email,
            password,
            signIn as SignInResource | null,
            setError,
            isLoaded,
            setActive,
            e
          )
        }
        className="w-full max-w-md space-y-6 bg-[#1a1a1a]/90 backdrop-blur-sm border border-[#2a2a2a] p-8 rounded-2xl shadow-2xl shadow-purple-900/20"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
            Welcome back
          </h1>
          <p className="mt-2 text-gray-400">Sign in to your account</p>
        </div>

        {/* Google Sign In */}
        <div className="flex flex-col items-center gap-4 mt-6">
          <button
            type="button"
            onClick={() =>
              handleGoogleSignIn(isLoaded, signIn as SignInResource | undefined)
            }
            className="flex items-center justify-center w-full gap-2 px-4 py-3 text-white bg-[#2a2a2a] rounded-xl hover:bg-[#333333] transition-all border border-[#3a3a3a]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1a1a1a] text-gray-400">or</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Email address
            </label>
            <input
              id="email"
              className="w-full bg-[#2a2a2a] text-white border border-gray-700 p-3 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              id="password"
              className="w-full bg-[#2a2a2a] text-white border border-gray-700 p-3 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-900/30 rounded-lg border border-red-800/50">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-700 rounded bg-[#2a2a2a]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                Remember me
              </label>
            </div>
            <a href="/customer/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
              Forgot password?
            </a>
          </div>

          {/* Required for CAPTCHA */}
          <div id="clerk-captcha"></div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white p-3 rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 font-medium"
          >
            Sign In
          </button>
        </div>

        <p className="text-sm text-center text-gray-400">
          Don't have an account?{" "}
          <a href="/customer/sign-up" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
};

export default SignInPage;