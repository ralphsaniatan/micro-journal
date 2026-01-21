import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
    // We can still read message if needed but LoginForm handles UI now.
    await searchParams;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
            <LoginForm />
        </div>
    );
}
