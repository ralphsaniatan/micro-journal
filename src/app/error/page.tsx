import Link from "next/link";

export default function ErrorPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center text-white">
            <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-8">Sorry, we couldn't log you in. Please try again.</p>
            <Link href="/login" className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">
                Back to Login
            </Link>
        </div>
    );
}
