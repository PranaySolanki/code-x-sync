'use client';
import "@/screen/loginscreen/index.scss";
import { useState } from "react";
import Script from 'next/script';
import supabase  from "@/helper/supabaseClient";
import { SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation"; // Add this import

const LoginScreen = () => {                                   // from export const to const and at end export default
  const [showRegister, setShowRegister] = useState(false);
  const [username, setusername] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [message, setmessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState(""); // State for login message
  const router = useRouter(); // Initialize router

  const handleSubmit = async (e) => {
    e.preventDefault();
    setmessage("");

    if (password !== confirmPassword) {
      setmessage("Passwords do not match. Please enter the same password.");
      return;
    }

    const { data:userData, error:authError } = await supabase.auth.signUp({
      username,
      email,
      password,
    });
    if (authError) 
      {
        setmessage(authError.message);
        return;
      } else 
        {
          const userId = userData.user.id;
          // 2. Insert the display name into the profiles table pranay
          const { data: profileData, error: profileError } = await supabase
          .from('User-Table')
          .insert([{
            user_id: userId,
            user_name: username,
            email_id:email
          }]);

            if (profileError) {
              console.log('Profile Creation Error:', profileError.message);
            }else{

            setmessage("Signup successful! Please check your email to confirm your account.");
            setTimeout(() => {
              setShowRegister(false); // Flip to login after success
              setusername("");
              setemail("");
              setpassword("");
              setConfirmPassword("");
              setmessage("");
            }, 1500); // 1.5 seconds delay for user to read the message
          }
      }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage(""); // Clear previous message

    const { email, password } = e.target.elements;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) {
      setLoginMessage(error.message);
    } else {
      setLoginMessage("Login successful!");
      // Redirect or perform any other action after successful login
      setTimeout(() => {
        router.push("/"); // Redirect to home page
      }, 1000); // 1 second delay for user to see the message
    }
  };

  return (
    <section className="section">  
    {/* added class name by pranay */}
      <div className={`login-register-container${showRegister ? " flipped" : ""}`}>
        {/* Login Box */}
        <div className="login-box box-face">
          <form onSubmit={handleLogin} style={{ textAlign: "center" }}>
            <h2>Login</h2>
            {loginMessage && (
              <span className="form-message">{loginMessage}</span>
            )}
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
          <form action="/register" method="POST" style={{ textAlign: "center" }}>
            <h2>Register</h2>
            {message && (
              <span className="form-message">{message}</span>
            )}
            <div className="input-box">
              <span className="icon">
                <ion-icon name="person"></ion-icon>
              </span>
              <input
                onChange={(e) => setusername(e.target.value)}
                value={username}
                type="text" name="username" required />
              <label htmlFor="username">Full Name:</label>
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
        crossOrigin=""
      ></Script>
    </section>
  );
};
export default LoginScreen;