"use client";

import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
    return (
        <div className="py-12">
            <AuthForm type="register" />
        </div>
    );
}
