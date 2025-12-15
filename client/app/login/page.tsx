"use client";

import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
    return (
        <div className="py-12">
            <AuthForm type="login" />
        </div>
    );
}
