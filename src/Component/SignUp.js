import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import "./Signin.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailRedBox, setEmailRedBox] = useState(false);
  const [passwordRedBox, setPasswordRedBox] = useState(false);
  const [confirmPasswordRedBox, setConfirmPasswordRedBox] = useState(false);
  const navigate = useNavigate();

  const register = (e) => {
    e.preventDefault();

    setEmailRedBox(false);
    setPasswordRedBox(false);
    setConfirmPasswordRedBox(false);
    let flag = 0;
    if (password == "" || password == null) {
      flag = 1;
      setPasswordRedBox(true);
    }
    if (confirmPassword == "" || confirmPassword == null) {
      flag = 1;
      setConfirmPasswordRedBox(true);
    }
    if (confirmPassword != password) {
      flag = 1;
      toast.error("Password And Confirm Password Didn't Match!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setPasswordRedBox(true);
      setConfirmPasswordRedBox(true);
    }
    if (email == "" || email == null) {
      flag = 1;
      setEmailRedBox(true);
    }
    if (!email.includes("@", 2) || !email.includes(".", 5)) {
      flag = 1;
      setEmailRedBox(true);
      toast.error("Please give valid mail id!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
    if (flag == 0) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          if (userCredential) {
            toast.success("You have successfully created an account!", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
            navigate("/");
          }
        })
        .catch((error) => alert(error.message));
    }
  };

  return (
    <div className="login">
      <div className="login__box">
        <Link to="/home" textDecoration="none">
          <img className="login__logo" src="\leaf.png" alt="Leaf" />
        </Link>

        <h1>Sign Up</h1>

        <form>
          <h5>E-mail</h5>
          <input
            type="text"
            style={{
              fontSize: "13px",
              fontWeight: "600",
              background: emailRedBox ? "#FFA500" : "white",
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="email_input"
            required
          />
          <h5>Password</h5>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password_input"
            style={{
              fontSize: "13px",
              fontWeight: "600",
              background: passwordRedBox ? "#FFA500" : "white",
            }}
            required
          />
          <h5>Confirm Password</h5>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="password_input"
            style={{
              fontSize: "13px",
              fontWeight: "600",
              background: confirmPasswordRedBox ? "#FFA500" : "white",
            }}
            required
          />
          <button
            type="submit"
            className="login__signInButton"
            style={{ marginTop: "20px" }}
            onClick={register}
          >
            Sign Up
          </button>
        </form>
        <div
          style={{
            fontSize: "13px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            margin: "10px",
            alignItems: "center",
          }}
        >
          <p
            style={{
              color: "rgba(0, 0, 0, 0.7)",
              padding: "3px",
              margin: "3px",
              textAlign: "center",
            }}
          >
            Already have an account?
          </p>
          <Link
            to="/"
            style={{
              color: "rgba(0, 0, 0, 0.7)",
              padding: "3px",
              margin: "3px",
              color: "blue",
              fontSize: "14px",
              textAlign: "center",
              alignContent: "center",
              alignItems: "center",
            }}
            textDecoration="none"
          >
            Sign In
          </Link>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}

export default SignUp;
