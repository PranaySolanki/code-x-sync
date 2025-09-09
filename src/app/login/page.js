'use client';
import "@/screen/loginscreen/index.scss";
import { useState } from "react";
import Script from 'next/script';
import supabase  from "@/helper/supabaseClient";
import { SupabaseClient } from "@supabase/supabase-js";

const LoginScreen = () => {                                   // from export const to const and at end export default
  const [showRegister, setShowRegister] = useState(false);
  const [username, setusername] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [message, setmessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setmessage("");

    if (password !== confirmPassword) {
      setmessage("Passwords do not match. Please enter the same password.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      username,
      email,
      password,
    });
    if (error) {
      setmessage(error.message);
    } else {
      setmessage("Signup successful! Please check your email to confirm your account.");
      setTimeout(() => {
        setShowRegister(false); // Flip to login after success
        setusername("");
        setemail("");
        setpassword("");
        setConfirmPassword("");
      }, 1500); // 1.5 seconds delay for user to read the message
    }
  };
  return (
    <section className="section">  
    {/* added class name by pranay */}
      <div className={`login-register-container${showRegister ? " flipped" : ""}`}>
        {/* Login Box */}
        <div className="login-box box-face">
          <form action="/login" method="POST">
            <h2>Login</h2>
            <div className="input-box">
              <span className="icon">
                <ion-icon name="mail"></ion-icon>
              </span>
              <input type="email" name="email" required />
              <label htmlFor="email">Email:</label>
            </div>
            <div className="input-box">
              <span className="icon">
                <ion-icon name="lock-closed"></ion-icon>
              </span>
              <input type="password" name="password" required />
              <label htmlFor="password">Password:</label>
            </div>
            <div className="remember">
              <label>
                <input type="checkbox" name="remember" /> Remember me
              </label>
              <a href="/forgot-password" className="forgot-password">
                Forgot Password?
              </a>
            </div>
            <button type="submit">Login</button>
            <div className="register-link">
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                onClick={(e) => {
                  e.preventDefault();
                  setShowRegister(true);
                }}
              >
                Register here
              </a>
            </div>
          </form>
        </div>
        {/* Registration Box */}
        <div className="register-box box-face">
          <form action="/register" method="POST">
            <h2>Register</h2>
            {message && <span>{message}</span>}
            <div className="input-box">
              <span className="icon">
                <ion-icon name="person"></ion-icon>
              </span>
              <input
                onChange={(e) => setusername(e.target.value)}
                value={username}
                type="text" name="username" required />
              <label htmlFor="username">Username:</label>
            </div>
            <div className="input-box">
              <span className="icon">
                <ion-icon name="mail"></ion-icon>
              </span>
              <input 
              onChange={(e) => {setemail(e.target.value);}}
              value={email} 
              type="email" name="email" required />
              <label htmlFor="email">Email:</label>
            </div>
            <div className="input-box">
              <span className="icon">
                <ion-icon name="lock-closed"></ion-icon>
              </span>
              <input 
                onChange={(e) => {setpassword(e.target.value);}}
                value={password}
                type="password" name="password" required />
              <label htmlFor="password">Password:</label>
            </div>
            <div className="input-box">
              <span className="icon">
                <ion-icon name="lock-closed"></ion-icon>
              </span>
              <input
                 onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                type="password" name="confirmPassword" required />
              <label htmlFor="confirmPassword">Confirm Password:</label>
            </div>
            <button onClick={handleSubmit} type="submit" >Register</button>
            <div className="register-link">
              Already have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowRegister(false);
                }}
              >
                Login here
              </a>
            </div>
          </form>
        </div>
      </div>
      {/* Ionicons Scripts */}
      <Script
        type="module"
        src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"
      ></Script>
      <Script
        noModule
        src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"
      ></Script>
    </section>
  );
};
export default LoginScreen;
