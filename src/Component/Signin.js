import React, { useState, useContext, useEffect, useRef } from "react";
import { UserContext } from "../UserContext";
import { Link, useNavigate } from "react-router-dom";
import { BsPersonFill } from "react-icons/bs";
import { IoMdBasket } from "react-icons/io";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import "./Signin.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailRedBox, setEmailRedBox] = useState(false);
  const [passwordRedBox, setPasswordRedBox] = useState(false);
  const navigate = useNavigate();

  const { userCredentials, setUserCredentials } = useContext(UserContext);

  // const signin = (e) => {
  //   navigate("/");
  // };
  const signin = (e) => {
    e.preventDefault();

    setEmailRedBox(false);
    setPasswordRedBox(false);

    let flag = 0;
    if (password == "" || password == null) {
      flag = 1;
      setPasswordRedBox(true);
    }
    if (email == "" || email == null) {
      flag = 1;
      setEmailRedBox(true);
    }
    if (!email.includes("@", 2) || !email.includes(".", 5)) {
      flag = 1;
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
      setEmailRedBox(true);
    }

    if (flag == 0) {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          setUserCredentials({
            Email: email,
            Password: password,
          });
          console.log(userCredentials);
          setTimeout(() => {
            toast.success("You have successfully signed in!", {
              position: "top-right",
              autoClose: 1000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
          }, 1000);

          navigate("/home");
        })
        .catch((error) => alert(error.message));
    }
  };

  const register = (e) => {
    navigate("/signup");
  };

  return (
    <div>
      <div className="login">
        <div className="login__box">
          <Link to="/home" textDecoration="none">
            <img className="login__logo" src="\leaf.png" alt="Leaf" />
          </Link>

          <h1>Sign In</h1>

          <form>
            <h5>E-mail</h5>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                fontSize: "13px",
                fontWeight: "600",
                backgroundColor: emailRedBox ? "#FFA500" : "white",
              }}
              className="email_input"
              required
            />
            <h5>Password</h5>
            <input
              type="password"
              value={password}
              style={{
                fontSize: "13px",
                fontWeight: "600",
                backgroundColor: passwordRedBox ? "#FFA500" : "white",
              }}
              onChange={(e) => setPassword(e.target.value)}
              className="password_input"
              required
            />
            <button
              type="submit"
              onClick={signin}
              className="login__signInButton"
            >
              Sign In
            </button>
          </form>
          <button onClick={register} className="login__registerButton">
            Create An Account
          </button>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}

export default Signin;
