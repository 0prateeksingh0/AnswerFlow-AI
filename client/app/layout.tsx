"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

// Helper component for Navbar to access Auth Context
function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b-0">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black text-white tracking-tighter">
          Q&A<span className="text-gray-500">.LIVE</span>
        </Link>
        <div className="flex gap-6 items-center">
          {user ? (
            <>
              <span className="text-sm font-medium text-gray-300">@{user.username} <span className="text-xs text-gray-500 uppercase">({user.role})</span></span>
              <button onClick={logout} className="text-sm font-bold text-gray-400 hover:text-white transition-colors">LOGOUT</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">LOGIN</Link>
              <Link href="/register" className="glass-button px-5 py-2 text-xs uppercase tracking-widest rounded-full">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen text-white selection:bg-white selection:text-black`}>
        <AuthProvider>
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 py-16">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
