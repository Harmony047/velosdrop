"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import React, { FormEvent, useState } from "react";

const SignUpPage = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  if (!isLoaded) return null;

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
      setError("");
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? err.message);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.push("/dashboard");
      } else {
        setError(`Unexpected status: ${attempt.status}`);
      }
    } catch (err: any) {
      const msg =
        err.errors?.[0]?.code === "form_code_incorrect"
          ? "The code you entered is incorrect or expired."
          : err.errors?.[0]?.message ?? "An unknown error occurred.";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#0a0a0a] to-[#1e0b36]">
      {verifying ? (
        <form
          onSubmit={handleVerify}
          className="w-full max-w-md space-y-6 bg-[#1a1a1a]/90 backdrop-blur-sm border border-[#2a2a2a] p-8 rounded-2xl shadow-2xl shadow-purple-900/20"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
              Verify your email
            </h2>
            <p className="mt-2 text-gray-400">
              We've sent a 6-digit code to <span className="text-purple-300">{email}</span>
            </p>
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-400 mb-1">
              Verification code
            </label>
            <input
              id="code"
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full bg-[#2a2a2a] text-white border border-gray-700 p-3 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center tracking-widest"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-900/30 rounded-lg border border-red-800/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white p-3 rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 font-medium"
          >
            Verify Account
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={async () => {
                try {
                  await signUp.prepareEmailAddressVerification({
                    strategy: "email_code",
                  });
                  setError("A new code has been sent to your email.");
                } catch {
                  setError("Could not resend. Try again later.");
                }
              }}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Didn't receive a code? Resend
            </button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={handleSignUp}
          className="w-full max-w-md space-y-6 bg-[#1a1a1a]/90 backdrop-blur-sm border border-[#2a2a2a] p-8 rounded-2xl shadow-2xl shadow-purple-900/20"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
              Create an account
            </h1>
            <p className="mt-2 text-gray-400">Get started with VelosDrop</p>
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
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-400 mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                className="w-full bg-[#2a2a2a] text-white border border-gray-700 p-3 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-900/30 rounded-lg border border-red-800/50">
                {error}
              </div>
            )}

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-700 rounded bg-[#2a2a2a]"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
                I agree to the <a href="#" className="text-purple-400 hover:text-purple-300">Terms</a> and <a href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
              </label>
            </div>

            <div id="clerk-captcha"></div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white p-3 rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 font-medium"
            >
              Create Account
            </button>
          </div>

          <p className="text-sm text-center text-gray-400">
            Already have an account?{" "}
            <a href="/customer/sign-in" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
              Sign in
            </a>
          </p>
        </form>
      )}
    </div>
  );
};

export default SignUpPage;