'use client';
import "@/screen/loginscreen/index.scss";
import { useState } from "react";

const LoginScreen = () => {                                   // from export const to const and at end export default
  const [showRegister, setShowRegister] = useState(false);

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
            <div className="input-box">
              <span className="icon">
                <ion-icon name="lock-closed"></ion-icon>
              </span>
              <input type="password" name="confirmPassword" required />
              <label htmlFor="confirmPassword">Confirm Password:</label>
            </div>
            <button type="submit">Register</button>
            <div className="register-link">
              Already have an account?{" "}
              <a
                href="/login"
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
      <script
        type="module"
        src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"
      ></script>
      <script
        noModule
        src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"
      ></script>
    </section>
  );
};
export default LoginScreen;
