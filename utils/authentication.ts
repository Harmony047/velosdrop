import type { SetActive, SignInResource } from "@clerk/types";
import { Dispatch, FormEvent, SetStateAction } from "react";

export const handleGoogleSignIn = async (
  isLoaded: boolean,
  signIn: SignInResource | undefined,
  redirectUrl: string = '/customer/dashboard'
) => {
  if (!isLoaded || !signIn) {
    console.error("Clerk not loaded or signIn undefined");
    return;
  }

  try {
    await signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/customer/sso-callback",
      redirectUrlComplete: redirectUrl,
    });
  } catch (error: unknown) {
    console.error("Google Sign In failed:", error);
    throw new Error("Google authentication failed. Please try again.");
  }
};

export const handleSignInSubmit = async (
  email: string,
  password: string,
  signIn: SignInResource | null,
  setError: Dispatch<SetStateAction<string>>,
  isLoaded: boolean,
  setActive: SetActive | undefined,
  e: FormEvent<HTMLFormElement>,
  redirectUrl: string = '/customer/dashboard'
) => {
  e.preventDefault();

  if (!isLoaded || !signIn) {
    setError("Authentication system not ready");
    return;
  }

  try {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    const result = await signIn.create({
      identifier: email,
      password,
    });

    if (result.status === "complete") {
      if (!result.createdSessionId || !setActive) {
        setError("Authentication complete but no session created");
        return;
      }

      await setActive({ session: result.createdSessionId });
      window.location.href = redirectUrl;
    } else {
      setError("Additional verification required");
    }
  } catch (err: unknown) {
    let errorMessage = "An unknown error occurred during sign-in";
    
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'object' && err !== null && 'errors' in err) {
      const clerkError = err as { errors: Array<{ message: string }> };
      errorMessage = clerkError.errors[0]?.message || errorMessage;
    }

    setError(errorMessage);
  }
};