/* pranaysolanki/code-x-sync/code-x-sync-8aab366aa30db2d0bf54a90ee6fef547cb693bec/src/app/login/page.js */

'use client';
import "@/screen/loginscreen/index.scss";
import { useState } from "react";
import Script from 'next/script';
import supabase  from "@/helper/supabaseClient";
import { useRouter } from "next/navigation"; 

const LoginScreen = () => {                                   
  const [showRegister, setShowRegister] = useState(false);
  const [username, setusername] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [message, setmessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const router = useRouter(); 

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
              setShowRegister(false); 
              setusername("");
              setemail("");
              setpassword("");
              setConfirmPassword("");
              setmessage("");
            }, 1500);
          }
      }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage("");

    const { email, password } = e.target.elements;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) {
      setLoginMessage(error.message);
    } else {
      setLoginMessage("Login successful!");
      setTimeout(() => {
        router.push("/home"); // Redirect to home
      }, 1000); 
    }
  };

  return (
    <section className="section">  
      <div className={`login-register-container${showRegister ? " flipped" : ""}`}>
        {/* Login Box */}
        <div className="login-box box-face">
          <form onSubmit={handleLogin} style={{ textAlign: "center" }}>
            <div className="header-content">
                <h2 className="main-title">Code X Sync</h2>
                <p className="greeting">Welcome back to the future of coding</p>
            </div>
            
            {loginMessage && (
              <span className="form-message">{loginMessage}</span>
            )}
            
            <div className="social-buttons">
                <div className="social-btn">
                    <ion-icon name="logo-github"></ion-icon>
                    <span>GitHub</span>
                </div>
                <div className="social-btn">
                    <ion-icon name="logo-google"></ion-icon>
                    <span>Google</span>
                </div>
            </div>
            
            <div className="divider">Or continue with Email</div>

            <div className="input-box">
              <span className="icon">
                <ion-icon name="mail-outline"></ion-icon>
              </span>
              <input type="email" name="email" placeholder="Enter your email" required />
              <label htmlFor="email">Email</label>
            </div>
            <div className="input-box">
              <span className="icon">
                <ion-icon name="lock-closed-outline"></ion-icon>
              </span>
              <input type="password" name="password" placeholder="Enter your password" required />
              <label htmlFor="password">Password</label>
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
              <span className="icon">
                <ion-icon name="person-outline"></ion-icon>
              </span>
              <input
                onChange={(e) => setusername(e.target.value)}
                value={username}
                type="text" name="username" placeholder="Enter your full name" required />
              <label htmlFor="username">Full Name</label>
            </div>
            <div className="input-box">
              <span className="icon">
                <ion-icon name="mail-outline"></ion-icon>
              </span>
              <input 
              onChange={(e) => {setemail(e.target.value);}}
              value={email} 
              type="email" name="email" placeholder="Enter your email" required />
              <label htmlFor="email">Email</label>
            </div>
            <div className="input-box">
              <span className="icon">
                <ion-icon name="lock-closed-outline"></ion-icon>
              </span>
              <input 
                onChange={(e) => {setpassword(e.target.value);}}
                value={password}
                type="password" name="password" placeholder="Enter password" required />
              <label htmlFor="password">Password</label>
            </div>
            <div className="input-box">
              <span className="icon">
                <ion-icon name="lock-closed-outline"></ion-icon>
              </span>
              <input
                 onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                type="password" name="confirmPassword" placeholder="Confirm password" required />
              <label htmlFor="confirmPassword">Confirm Password</label>
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