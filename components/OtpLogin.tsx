'use client';
import { useDriverForm } from '@/app/context/DriverFormContext';
import { auth } from "@/firebase";
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import React, { FormEvent, useState, useTransition, useEffect } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { useRouter } from 'next/navigation';

export interface OtpLoginProps {
  onVerificationSuccess?: (phoneNumber: string) => void;
}

export function OtpLogin({ onVerificationSuccess }: OtpLoginProps) {
    const router = useRouter();
    const { setPersonalData } = useDriverForm();

    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState("");
    const [resendCountdown, setResendCountdown] = useState(0);

    const [recaptchaVerifier, setRecaptchaVerifier] = 
        useState<RecaptchaVerifier | null>(null);

    const [confirmationResult, setConfirmationResult] = 
        useState<ConfirmationResult | null>(null);

    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCountdown > 0) {
            timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCountdown]);

    useEffect(() => {
        const recaptchaVerifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
                size: "invisible",
            }
        );

        setRecaptchaVerifier(recaptchaVerifier);

        return () => {
            recaptchaVerifier.clear();
        };
    }, []);

    useEffect(() => {
        const hasEnteredAllDigits = otp.length === 6;
        if (hasEnteredAllDigits) {
            verifyOtp();
        }
    }, [otp]);

    const verifyOtp = async () => {
        startTransition(async () => {
            setError("");

            if (!confirmationResult) {
                setError("Please request OTP first.");
                return;
            }

            try {
                await confirmationResult?.confirm(otp);
                setPersonalData({ phoneNumber });
                
                if (onVerificationSuccess) {
                    onVerificationSuccess(phoneNumber);
                } else {
                    localStorage.setItem('driver-auth', 'true');
                    router.push('/driver/personal');
                }
            } catch (error) {
                console.log(error);
                setError("Failed to verify OTP. Please check the OTP.");
            }
        });
    }; 

    const requestOtp = async (e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault();

        setResendCountdown(60);

        startTransition(async () => {
            setError("");

            if (!recaptchaVerifier) {
                return setError("RecaptchaVerifier is not initialized.");
            }

            try {
                const confirmationResult = await signInWithPhoneNumber(
                    auth,
                    phoneNumber,
                    recaptchaVerifier
                );

                setConfirmationResult(confirmationResult);
                setSuccess("OTP sent successfully.");
            } catch (err: any) {
                console.log(err);
                setResendCountdown(0);

                if (err.code === "auth/invalid-phone-number") {
                    setError("Invalid phone number. Please check the number.");
                } else if (err.code === "auth/too-many-requests") {
                    setError("Too many requests. Please try again later.");
                } else {
                    setError("Failed to send OTP. Please try again.");
                }
            }
        });
    };

    const loadingIndicator = (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center">
                <svg 
                    width="40" 
                    height="40" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="animate-spin text-purple-600"
                >
                    <path
                        d="M12 2V6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M12 18V22"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M4.93 4.93L7.76 7.76"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M16.24 16.24L19.07 19.07"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M2 12H6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M18 12H22"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M4.93 19.07L7.76 16.24"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M16.24 7.76L19.07 4.93"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
                <p className="mt-4 text-purple-600 dark:text-purple-400 font-medium">
                    Processing...
                </p>
            </div>
        </div>
    );

    return ( 
        <div>
            {!confirmationResult ? (
                <form onSubmit={(e) => requestOtp(e)}>
                    <Input 
                        className="text-white"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter phone number with country code"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                        Please enter your number with the country code (i.e +263 for Zimbabwe)
                    </p>
                    
                    <Button
                        disabled={!phoneNumber || isPending || resendCountdown > 0}
                        type="submit"
                        className="mt-5"
                    >
                        {isPending ? "Sending OTP" : "Send OTP"}
                    </Button>
                </form>
            ) : (
                <div>
                    <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                    
                    <Button
                        disabled={resendCountdown > 0}
                        onClick={() => requestOtp()}
                        className="mt-5"
                    >
                        {resendCountdown > 0
                            ? `Resend OTP in ${resendCountdown}`
                            : "Resend OTP"}
                    </Button>
                </div>
            )}
            
            <div className="p-10 text-center">
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
            </div>
    
            <div id="recaptcha-container"/>
            {isPending && loadingIndicator}
        </div>
    );
}

export default OtpLogin;