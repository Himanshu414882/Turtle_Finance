import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ClientPrivateRoute = ({ children }) => {
  axios.defaults.withCredentials = true
  const [auth, setAuth] = useState(null);
  const url = import.meta.env.VITE_URL;

  useEffect(() => {
    axios.get(`${url}/auth/check-auth`, { withCredentials: true })
      .then(res => {
        console.log(res.data.role);
        if (res.data.role === "client") setAuth(true);
        else setAuth(false);
      })
      .catch(() => setAuth(false));
  }, []);

  if (auth === null) return <div>Loading...</div>;
  if (!auth) return <Navigate to="/login" state={{ error: "You are not logged in as client" }} />;

  return children;
};

export default ClientPrivateRoute;
