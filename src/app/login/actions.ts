"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Initialize admin client for rate limiting
// Using service role key to bypass RLS and access the rate_limits table/function
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for rate limiting but is not set.");
}

const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function login(formData: FormData) {
    // Deprecated in favor of sendLoginCode but kept for strict form actions if needed
    const email = formData.get("email") as string;
    const result = await sendLoginCode(email);

    if (result?.error) {
        redirect(`/login?error=${encodeURIComponent(result.error)}`);
    }

    redirect("/login?message=check_email");
}

export async function getOwnerEmail() {
    return process.env.USER_EMAIL;
}

export async function sendLoginCode(email?: string) {
    const supabase = await createClient();

    let targetEmail = email;
    if (!targetEmail) {
        targetEmail = process.env.USER_EMAIL;
    }

    if (!targetEmail) {
        return { error: "Email is required" };
    }

    // Rate Limiting Logic
    try {
        // We use the admin client to call the secure RPC function
        const { data: isAllowed, error: rateLimitError } = await supabaseAdmin.rpc('check_rate_limit', {
            key_param: targetEmail
        });

        if (rateLimitError) {
            console.error("Rate limiting error:", rateLimitError);
            // If the function doesn't exist (e.g. migration not run), we fail secure
            return { error: "Service temporarily unavailable (Rate Limit Check Failed)" };
        }

        if (isAllowed === false) {
            return { error: "Too many login attempts. Please wait a minute before trying again." };
        }

    } catch (err) {
        console.error("Unexpected rate limiting error:", err);
        return { error: "An unexpected error occurred." };
    }

    const { error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: {
            shouldCreateUser: true,
            // emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    });

    if (error) {
        console.error("Login Error:", error);
        return { error: error.message };
    }

    return { success: true, emailUsed: targetEmail };
}

export async function verifyLoginCode(email: string, code: string) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email'
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/");
}

export async function signout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
}
