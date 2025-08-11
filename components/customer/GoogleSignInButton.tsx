// components/customer/GoogleSigninButton.tsx
"use client";

import { FC, ReactNode } from "react";
import { Button } from "../ui/button";
import { signIn } from "next-auth/react";

interface GoogleSignInButtonProps {
  children: ReactNode;
}

const GoogleSignInButton: FC<GoogleSignInButtonProps> = ({ children }) => {
  const loginWithGoogle = async () => {
    try {
      await signIn("google", {
        callbackUrl: "/customer/dashboard",
        redirect: true,
      });
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  return (
    <Button
      onClick={loginWithGoogle}
      className="w-full hover:bg-purple-700 transition-colors"
    >
      {children}
    </Button>
  );
};

export default GoogleSignInButton;
