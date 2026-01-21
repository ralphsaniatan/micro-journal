"use client";

import { useState, useTransition } from "react";
import { sendLoginCode, verifyLoginCode } from "./actions";
import { useRouter } from "next/navigation";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState<"email" | "code">("email");
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSendCode = async (formData: FormData) => {
        const emailInput = formData.get("email") as string;
        setError("");

        startTransition(async () => {
            try {
                const res = await sendLoginCode(emailInput);
                if (res?.error) {
                    setError(res.error);
                } else {
                    setEmail(emailInput);
                    setStep("code");
                }
            } catch (err) {
                setError("Failed to send code. Please try again.");
            }
        });
    };

    const handleVerify = async (formData: FormData) => {
        const codeInput = formData.get("code") as string;
        setError("");

        startTransition(async () => {
            try {
                const res = await verifyLoginCode(email, codeInput);
                if (res?.error) {
                    setError(res.error);
                }
                // Determine if success usually handled by redirect in server action
            } catch (err) {
                setError("Failed to verify code.");
            }
        });
    };

    return (
        <div className="w-full max-w-sm space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter">Rap's Braindump</h1>
                <p className="text-gray-400">
                    {step === "email"
                        ? "Enter your email to sign in."
                        : `Enter the code sent to ${email}`}
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {step === "email" ? (
                <form action={handleSendCode} className="flex flex-col gap-4">
                    <input
                        name="email"
                        type="email"
                        placeholder="hello@example.com"
                        required
                        defaultValue={email}
                        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {isPending ? "Sending..." : "Continue"}
                    </button>
                </form>
            ) : (
                <form action={handleVerify} className="flex flex-col gap-4">
                    <input
                        name="code"
                        type="text"
                        placeholder="12345678"
                        required
                        maxLength={8}
                        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 text-center tracking-[0.5em] text-xl focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all uppercase"
                    />
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {isPending ? "Verifying..." : "Sign In"}
                    </button>
                    <button
                        type="button"
                        onClick={() => setStep("email")}
                        className="text-sm text-gray-500 hover:text-white transition-colors"
                    >
                        Change Email
                    </button>
                </form>
            )}
        </div>
    );
}
