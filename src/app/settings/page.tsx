import { getProfile, getShareLinks } from "./actions";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
    // Fetch data server-side so loading.tsx shows
    const [profile, links] = await Promise.all([
        getProfile(),
        getShareLinks()
    ]);

    return <SettingsForm initialProfile={profile} initialLinks={links || []} />;
}
