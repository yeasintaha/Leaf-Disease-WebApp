import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Component/HomePage";
import { useState } from "react";
import Signin from "./Component/Signin";
import SignUp from "./Component/SignUp";
import { UserContext } from "./UserContext";
import Audio from "./Component/Audio";
import Stopwatch from "./Component/Stopwatch";

function App() {
  const [userCredentials, setUserCredentials] = useState({
    Email: "",
    Password: "",
  });

  return (
    <UserContext.Provider value={{ userCredentials, setUserCredentials }}>
      <Router>
        <Routes>
          <Route path="/" Component={Signin} />
          <Route path="/signup" Component={SignUp} />
          <Route path="/home" exact Component={HomePage} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
