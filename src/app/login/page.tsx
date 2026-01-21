import { login } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
    const { message } = await searchParams;
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
            <div className="w-full max-w-sm space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter">MicroJournal</h1>
                    <p className="text-gray-400">Enter your email to sign in or sign up.</p>
                </div>

                {message === "check_email" && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg text-sm">
                        Magic link sent! Check your email to log in.
                    </div>
                )}


                <form action={login} className="flex flex-col gap-4">
                    <input
                        name="email"
                        type="email"
                        placeholder="hello@example.com"
                        required
                        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
                    />
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-black hover:bg-gray-200 transition-colors"
                    >
                        Send Magic Link
                    </button>
                </form>
            </div>
        </div>
    );
}
