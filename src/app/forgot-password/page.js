'use client';
import "@/screen/loginscreen/index.scss";
import { useState } from "react";
import Script from 'next/script';
import supabase from "@/helper/supabaseClient";
import { useRouter } from "next/navigation";

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setMessage("");
        setIsSubmitting(true);
        setIsSuccess(false);

        if (!email) {
            setMessage("Please enter your email address.");
            setIsSubmitting(false);
            return;
        }

        try {
            // Note: The redirectTo URL should point to where the user will land 
            // after clicking the link in their email (e.g., a page to set the new password).
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                setMessage(error.message || "Failed to send reset link.");
                setIsSuccess(false);
            } else {
                setMessage("Success! Check your email for the password reset link.");
                setIsSuccess(true);
                setEmail(""); // Clear email field on success
            }
        } catch (e) {
            setMessage("An unexpected error occurred.");
            setIsSuccess(false);
            console.error("Password reset error:", e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="section">
            <div className="login-register-container">
                <div className="forgot-password-box box-face">
                    <form onSubmit={handlePasswordReset} style={{ textAlign: "center" }}>
                        <div className="header-content">
                            <h2 className="main-title">Code X Sync</h2>
                            <p className="greeting">Forgot your password?</p>
                        </div>
                        
                        {/* Message Display (uses existing form-message styling) */}
                        {message && (
                            <span className={`form-message ${isSuccess ? 'success' : ''}`}> 
                                {message}
                            </span>
                        )}

                        <div className="subtitle" style={{marginBottom: '30px'}}>
                            Enter your email address and we'll send you a link to reset your password.
                        </div>

                        <div className="input-box">
                            <label htmlFor="reset-email">Email</label>
                            <input
                                type="email"
                                id="reset-email"
                                name="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Sending..." : "Send Reset Link"}
                        </button>

                        <div className="register-link">
                            Remember your password?{" "}
                            <a href="/login">
                                Back to Sign in
                            </a>
                        </div>
                    </form>
                </div>
            </div>
            {/* Ionicons Scripts (for consistency, assumed to be in the layout or needed here) */}
            <Script
                type="module"
                src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"
                crossOrigin=""
            ></Script>
        </section>
    );
};

export default ForgotPasswordScreen;