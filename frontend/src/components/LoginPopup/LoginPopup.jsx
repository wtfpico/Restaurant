import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios"

const LoginPopup = ({ setShowLogin }) => {

  const {url,setToken} = useContext(StoreContext)
  const [currState, setCurrState] = useState("Sign Up");
  const [data,setData] = useState({
    name:"",
    email:"",
    password:""
  })

  const onChangeHandler =(event)=>{
    const name = event.target.name;
    const value = event.target.value;
    setData(data=>({...data,[name]:value}))
  }

  const onLogin =async(event)=>{
    event.preventDefault()
    let newUrl= url;
    if(currState=="Login"){
      newUrl+="/api/user/login"
    }
    else{
      newUrl+="/api/user/register"
    }
    const response = await axios.post(newUrl,data);
    if(response.data.success){
      setToken(response.data.token);
      localStorage.setItem("token",response.data.token);
      setShowLogin(false)

    }
    else{
      alert(response.data.message)
    }

  }
  

  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        {/* Popup Title & Close Button */}
        <div className="login-pop-up-title">
          <h2>{currState}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="close" />
        </div>

        {/* Input Fields */}
        <div className="login-pop-up-inputs">
          {currState !== "Login" && <input name='name'onChange={onChangeHandler} value={data.name} type="text" placeholder="Name" required />}
          <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder="Email" required />
          <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder="Password" required />
        </div>

        {/* Submit Button */}
        <button type="submit">{currState === "Sign Up" ? "Create Account" : "Login"}</button>

        {/* Terms & Conditions (Only for Sign Up) */}
        {currState !== "Login" && (
          <div className="login-pop-up-footer">
            <input type="checkbox" required />
            <p>By continuing, you agree to accept our Privacy Policy & Terms of Service.</p>
          </div>
        )}

        {/* Toggle Between Login & Sign Up */}
        <p>
          {currState === "Login" ? (
            <>
              Create an account? <span onClick={() => setCurrState("Sign Up")}>Click Here</span>
            </>
          ) : (
            <>
              Already have an account? <span onClick={() => setCurrState("Login")}>Login Here</span>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default LoginPopup;
