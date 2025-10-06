'use client';
import "@/screen/loginscreen/index.scss";
import { useState } from "react";
import Script from 'next/script';
import supabase from "@/helper/supabaseClient";
import { useRouter } from "next/navigation";

const LoginScreen = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [username, setusername] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [message, setmessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [isLoginSuccess, setIsLoginSuccess] = useState(false); 
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setmessage("");

    if (password !== confirmPassword) {
      setmessage("Passwords do not match. Please enter the same password.");
      return;
    }

    const { data: userData, error: authError } = await supabase.auth.signUp({
      username,
      email,
      password,
    });
    if (authError) {
      setmessage(authError.message);
      return;
    } else {
      const userId = userData.user.id;
      // 2. Insert the display name into the profiles table pranay
      const { data: profileData, error: profileError } = await supabase
        .from('User-Table')
        .insert([{
          user_id: userId,
          user_name: username,
          email_id: email
        }]);

      if (profileError) {
        console.log('Profile Creation Error:', profileError.message);
      }

      setmessage("Signup successful! Please check your email to confirm your account.");
      setTimeout(() => {
        setShowRegister(false);
        setusername("");
        setemail("");
        setpassword("");
        setConfirmPassword("");
        setmessage("");
      }, 1500);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage("");
    setIsLoginSuccess(false);

    const { email, password } = e.target.elements;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) {
      setLoginMessage(error.message);
    } else {
      setLoginMessage("Login successful!");
      setIsLoginSuccess(true);
      setTimeout(() => {
        router.push("/home");
      }, 1000);
    }
  };

  return (
    <section className="section">
      {/* Removed animated-glow-background to simplify and match video */}
      <div className={`login-register-container${showRegister ? " flipped" : ""}`}>
        {/* Login Box */}
        <div className="login-box box-face">
          <form onSubmit={handleLogin} style={{ textAlign: "center" }}>
            <div className="header-content">
              <h2 className="main-title">Code X Sync</h2>
              <p className="greeting">Welcome back to the future of coding</p>
            </div>

            {loginMessage && (
              <span className={`form-message ${isLoginSuccess ? 'success' : ''}`}> 
                {loginMessage}
              </span>
            )}

            <div className="social-login">
              {/* Uncomment this button if you want the side-by-side layout */}
              {/* <button type="button" className="social-btn github">
                <ion-icon name="logo-github"></ion-icon>
                <span>GitHub</span>
              </button> */}
              {/* MODIFIED: Wrap the Google button for centering */}
              <div className="single-social-login-container">
                <button type="button" className="social-btn google">
                  <ion-icon name="logo-google"></ion-icon>
                  <span>Google</span>
                </button>
              </div>
            </div>

            <div className="divider"><span>Or continue with Email</span></div>

            <div className="input-box">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="Enter your email" required />
            </div>
            <div className="input-box">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" placeholder="Enter your password" required />
            </div>
            <div className="remember">
              <label>
                <input type="checkbox" name="remember" /> Remember me
              </label>
              <a href="/forgot-password" className="forgot-password">
                Forgot Password?
              </a>
            </div>
            <button type="submit">Sign in</button>
            <div className="register-link">
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                onClick={(e) => {
                  e.preventDefault();
                  setShowRegister(true);
                }}
              >
                Sign up
              </a>
            </div>
          </form>
        </div>
        {/* Registration Box */}
        <div className="register-box box-face">
          <form onSubmit={handleSubmit} style={{ textAlign: "center" }}>
            <div className="header-content">
              <h2 className="main-title">Code X Sync</h2>
              <p className="greeting">Join the collaborative coding community</p>
            </div>

            {message && (
              <span className="form-message">{message}</span>
            )}

            <div className="input-box">
              <label htmlFor="username">Full Name</label>
              <input
                onChange={(e) => setusername(e.target.value)}
                value={username}
                type="text" id="username" name="username" placeholder="Enter your full name" required />
            </div>
            <div className="input-box">
              <label htmlFor="reg-email">Email</label>
              <input
                onChange={(e) => { setemail(e.target.value); }}
                value={email}
                type="email" id="reg-email" name="email" placeholder="Enter your email" required />
            </div>
            <div className="input-box">
              <label htmlFor="reg-password">Password</label>
              <input
                onChange={(e) => { setpassword(e.target.value); }}
                value={password}
                type="password" id="reg-password" name="password" placeholder="Enter password" required />
            </div>
            <div className="input-box">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm password" required />
            </div>
            <button type="submit" >Sign up</button>
            <div className="register-link">
              Already have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowRegister(false);
                }}
              >
                Sign in
              </a>
            </div>
          </form>
        </div>
      </div>
      {/* Ionicons Scripts for icons in the video (logo-github, mail-outline, lock-closed-outline) */}
      <Script
        type="module"
        src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"
        crossOrigin=""
      ></Script>
    </section>
  );
};
export default LoginScreen;