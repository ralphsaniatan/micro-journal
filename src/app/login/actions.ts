"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
    // Deprecated in favor of sendLoginCode but kept for strict form actions if needed
    const email = formData.get("email") as string;
    await sendLoginCode(email);
    redirect("/login?message=check_email");
}

export async function sendLoginCode(email: string) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
            // emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    });

    if (error) {
        console.error("Login Error:", error);
        return { error: error.message };
    }

    return { success: true };
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
