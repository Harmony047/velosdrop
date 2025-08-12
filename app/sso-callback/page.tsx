"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
import type { SignInResource } from "@clerk/types";

export default function SSOCallback() {
  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();

  useEffect(() => {
    if (!isLoaded || !signIn) return;

    const handleCallback = async () => {
      try {
        // Cast signIn to SignInResource so TS lets us call the method
        const { createdSessionId } = await (signIn as SignInResource).handleRedirectCallback({
          redirectUrl: "/dashboard",
        });

        if (createdSessionId) {
          await setActive({ session: createdSessionId });
          router.push("/dashboard");
        } else {
          throw new Error("No session created");
        }
      } catch (err) {
        console.error("Error handling SSO callback:", err);
        router.push("/customer/sign-in");
      }
    };

    handleCallback();
  }, [isLoaded, signIn, setActive, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <div className="text-white text-xl">Processing authentication...</div>
    </div>
  );
}
