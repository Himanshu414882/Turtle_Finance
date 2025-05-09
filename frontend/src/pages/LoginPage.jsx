import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import brandlogo from '../assets/images/logo_png.png';
import styles from '../styles/login.module.css';

const LoginPage = () => {
  const url = import.meta.env.VITE_URL;
  const emailRef = useRef();
  const passwordRef = useRef();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location.state]);


  const handleLogin = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    try {
      const res = await axios.post(
        `${url}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      console.log('Login successful:', res.data);
      const role = res.data.role;

      if (role === "admin") {
        navigate('/adminautharized/admin/clients');
      } else if (role === "client") {
        navigate('/clientautharized/client/dashboard'); // Update this route to your actual client dashboard route
      } else {
        setError("Unknown role. Please contact support.");
      }
  
    } catch (err) {
      console.error('Login failed:', err.response?.data);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="d-flex vh-100 align-items-center justify-content-center">
      <div className="w-100 h-100 row align-items-center justify-content-center">
        <div className="col-10 g-0 col-md-8 border border-3 border-turtle-primary rounded-4 bg-light">
          <div className="row g-0">
            <div className="col-12 col-md-5 d-flex align-items-center p-2 p-md-4 position-relative">
              <form className="w-100 h-100 p-3 my-4" onSubmit={handleLogin}>
                <img className={`${styles.brandlogo}`} src={brandlogo} alt="" />

                <div className="d-flex flex-column gap-3 h-50 my-4">
                  {message && <div className="alert alert-info">{message}</div>}
                  {error && <div className="alert alert-danger">{error}</div>}


                  <input
                    type="email"
                    ref={emailRef}
                    className="form-control"
                    id="Email"
                    placeholder="Email"
                    required
                  />

                  <input
                    type="password"
                    ref={passwordRef}
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    required
                  />

                  <a className="fs-6 text-md-end text-dark link-underline-dark link-offset-2" role="button">
                    Forgot Password?
                  </a>

                  <button type="submit" className="btn btn-md btn-turtle-primary">
                    Login
                  </button>
                </div>
              </form>

              <p className="text-center text-dark fs-5 m-0 position-absolute start-50 bottom-0 translate-middle fw-bolder">
                #FinancialPlanningZaruriHai
              </p>
            </div>

            <div className="col-12 col-md-7 d-none d-md-block">
              <img
                className={`${styles.loginPhoto} h-100 w-100`}
                src="https://static.wixstatic.com/media/ced0bf_df09d06b093044cc96f22264a45ef92f~mv2.png/v1/fill/w_792,h_596,al_c,q_90,enc_avif,quality_auto/ced0bf_df09d06b093044cc96f22264a45ef92f~mv2.png"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
