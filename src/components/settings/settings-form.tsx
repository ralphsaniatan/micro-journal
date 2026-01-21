"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Camera } from "lucide-react";
import { updateProfile, type Profile } from "@/app/settings/actions";
import { SharingManager } from "@/components/settings/sharing-manager";
import { createClient } from "@/utils/supabase/client";
import imageCompression from "browser-image-compression";
import Link from "next/link";
import { signout } from "@/app/login/actions";

interface SettingsFormProps {
    initialProfile: Profile | null;
    initialLinks: any[];
}

export function SettingsForm({ initialProfile, initialLinks }: SettingsFormProps) {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(initialProfile);
    const [links, setLinks] = useState<any[]>(initialLinks);
    const [username, setUsername] = useState(initialProfile?.username || "");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile?.avatar_url || null);

    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // No client-side fetching needed anymore!

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        const objectUrl = URL.createObjectURL(file);
        setAvatarUrl(objectUrl);
        setIsUploading(true);
        try {
            const supabase = createClient();
            const options = { maxSizeMB: 0.5, maxWidthOrHeight: 500, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);
            const fileExt = file.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            const filePath = `${fileName}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, compressedFile);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            return publicUrl;
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const [pendingUploadUrl, setPendingUploadUrl] = useState<string | null>(null);
    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = await handleFileSelect(e);
        if (url) setPendingUploadUrl(url);
    };

    const handleSave = () => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("username", username);
            if (pendingUploadUrl) {
                formData.append("avatar_url", pendingUploadUrl);
            }
            await updateProfile(formData);

            // Re-sync state
            router.refresh();
            // Optional: Show success message or redirect
            router.push("/");
        });
    };

    return (
        <main className="flex min-h-screen justify-center">
            <div className="w-full max-w-xl border-x border-gray-800 min-h-screen bg-black">
                <header className="sticky top-0 z-10 border-b border-gray-800 bg-black/80 backdrop-blur-md p-4 flex items-center gap-4">
                    <Link href="/" className="hover:bg-white/10 p-2 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5 text-white" />
                    </Link>
                    <h1 className="text-xl font-bold font-sans text-white">Settings</h1>
                </header>

                <div className="p-6 space-y-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-500">
                                        <span className="text-2xl">?</span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="h-8 w-8 text-white/80" />
                            </div>
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={onFileChange}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-blue-400 text-sm font-semibold hover:underline"
                        >
                            Change photo
                        </button>
                    </div>

                    {/* Form Section */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Enter username"
                            />
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isPending || isUploading}
                            className="w-full bg-white text-black font-bold py-3 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                    <div className="h-px bg-gray-800 my-8" />

                    {/* Sharing Section */}
                    <SharingManager initialLinks={links} />

                    <div className="h-px bg-gray-800 my-8" />

                    <form action={signout}>
                        <button
                            type="submit"
                            className="w-full text-red-500 font-medium py-3 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            Log Out
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
