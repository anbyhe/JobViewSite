import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const LoginPage = ({ loginEvent, createEvent, isLogin }) => {
  const title = isLogin ? "Welcome Back" : "Create Account";
  const btnText = isLogin ? "Login" : "Register";
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setSonfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const navigate = useNavigate();
  const submitForm = async(e) => {
    setError("");   
    e.preventDefault();
    if (isLogin) {
      const user = {
        email,
        password,
      };
      try {
        const data =  await loginEvent(user);
        if(data.status === 200){
          const details = await data.json();
          login(details.access_token, details.user);
          navigate("/");
        }else
        {
          let errorMessage = `HTTP error! status: ${data.status}`;
  
          try {
            const errorData = await data.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch {
            errorMessage = data.statusText || errorMessage;
          }
  
          setError(errorMessage);
        }
      } catch (error) {
        setError(error.message);
      }     
    } else {
      if (
        username === "" ||
        email === "" ||
        password === "" ||
        confirmPassword === ""
      ) {
        alert("Missing required fields.");
        return;
      }
      if (password !== confirmPassword) {
        alert("Password does not match");
        return;
      }
      const res = await createEvent({username, email, password});
      if(res.status === 200){
        const { access_token, user } = res.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate("/");
      } else {
        const errorMessage = `HTTP error! status: ${res.status}`;
        const details = res.data?.detail
        setError(details || errorMessage);
      }
    }
  };
  return (
    <>
      <section className="bg-indigo-50">
        <form onSubmit={submitForm}>
          <h1 className="text-3xl font-bold text-center underline">{title}</h1>
          <div className="flex flex-col justify-center mt-6 space-y-5">
            {!isLogin && (
              <input
                type="text"
                placeholder="UserName"
                className="border border-indigo-500 p-2 rounded-md container m-auto max-w-lg"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
              />
            )}
            <input
              type="email"
              placeholder="Email"
              className="border border-indigo-500 p-2 rounded-md container m-auto max-w-lg"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="password"
              className="border border-indigo-500 p-2 rounded-md container m-auto max-w-lg"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!isLogin && (
              <input
                type="password"
                placeholder="Confirm password"
                className="border border-indigo-500 p-2 rounded-md container m-auto max-w-lg"
                value={confirmPassword}
                required
                onChange={(e) => setSonfirmPassword(e.target.value)}
              />
            )}
          </div>
          <div className="flex flex-col items-center justify-center mt-6 ">
            <button className="bg-indigo-700 hover:bg-indigo-900 text-white px-4 py-2 w-full rounded-md max-w-lg">
              {btnText}
            </button>
            <p className="my-4">
              Don't have an account ?{" "}
              <NavLink
                to="/register"
                className="text-indigo-500 hover:text-indigo-600"
              >
                Register
              </NavLink>
            </p>
            {error && <p className="text-red-500 my-4">{error}</p>}
          </div>
        </form>
      </section>
    </>
  );
};

export default LoginPage;
