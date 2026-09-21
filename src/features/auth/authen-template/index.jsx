import React from "react";
import LoginForm from "../LoginForm";
import RegisterForm from "../RegisterForm";
import "./index.css";

function AuthenTemplate({ isLogin }) {
  return (
    <div className="authen-template">
      <div className="authen-template__form">
        {isLogin ? <LoginForm /> : <RegisterForm />}
      </div>
      <div className="authen-template__img"></div>
    </div>
  );
}

export default AuthenTemplate;
