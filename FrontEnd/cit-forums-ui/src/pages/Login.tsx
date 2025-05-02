import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, LoginRequest, isAuthenticated } from '../services/authService';

interface LocationState {
  message?: string;
  usernameOrEmail?: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    usernameOrEmail: '',
    password: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      navigate('/');
    }
    
    // Check for messages from other pages (like registration)
    const state = location.state as LocationState;
    if (state?.message) {
      setSuccessMessage(state.message);
      // Pre-fill username if provided
      if (state.usernameOrEmail) {
        setFormData(prev => ({
          ...prev,
          usernameOrEmail: state.usernameOrEmail || ''
        }));
      }
      
      // Clear the location state to prevent showing the message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const success = await login(formData);
      if (success) {
        // Only navigate on successful login
        navigate('/');
      } else {
        // On failed login, just show error message and stay on the same page
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="container-fluid">
        <div className="row vh-100">
          {/* Left side - Image */}
          <div className="col-md-7 d-none d-md-flex p-0" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #A52A2A 100%)' }}>
            <div className="login-image-container w-100 h-100 d-flex align-items-center justify-content-center">
              <div className="text-white text-center p-5">
                <h1 className="display-4 fw-bold mb-4">Welcome to CIT-U Forums</h1>
                <p className="lead mb-5">
                  A platform for the Cebu Institute of Technology University community to connect, share knowledge, and engage in meaningful discussions.
                </p>
                <div className="d-flex justify-content-center">
                  <div className="feature-card bg-white bg-opacity-10 p-4 rounded-4 m-2 text-start">
                    <i className="bi bi-chat-dots-fill fs-1 mb-3 text-warning"></i>
                    <h5>Engage in Discussions</h5>
                    <p className="mb-0">Connect with peers and participate in academic discussions</p>
                  </div>
                  <div className="feature-card bg-white bg-opacity-10 p-4 rounded-4 m-2 text-start">
                    <i className="bi bi-lightbulb-fill fs-1 mb-3 text-warning"></i>
                    <h5>Share Knowledge</h5>
                    <p className="mb-0">Contribute your insights and learn from others</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Login form */}
          <div className="col-md-5 d-flex align-items-center bg-light">
            <div className="login-form-container w-100 p-4 p-md-5">
              <div className="text-center mb-4">
                <img src="/logo.png" alt="CIT-U Forums Logo" height="60" className="mb-4" />
                <h2 className="fw-bold">Sign In</h2>
                <p className="text-muted">Welcome back! Please login to your account.</p>
              </div>
              
              {successMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {successMessage}
                  <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setSuccessMessage(null)}></button>
                </div>
              )}
              
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                  <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setError(null)}></button>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                      <div className="mb-3">
                        <label htmlFor="usernameOrEmail" className="form-label">Username or Email</label>
                        <div className="input-group mb-3">
                          <span className="input-group-text bg-light"><i className="bi bi-person"></i></span>
                          <input
                            type="text"
                            className="form-control form-control-lg bg-light"
                            id="usernameOrEmail"
                            name="usernameOrEmail"
                            value={formData.usernameOrEmail}
                            onChange={handleChange}
                            placeholder="Enter your username or email"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="input-group mb-3">
                          <span className="input-group-text bg-light"><i className="bi bi-lock"></i></span>
                          <input
                            type={showPassword ? "text" : "password"}
                            className="form-control form-control-lg bg-light"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={togglePasswordVisibility}
                          >
                            <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                          </button>
                        </div>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="rememberMe"
                          />
                          <label className="form-check-label" htmlFor="rememberMe">
                            Remember me
                          </label>
                        </div>
                        <Link to="/forgot-password" className="text-decoration-none">Forgot Password?</Link>
                      </div>
                      
                      <div className="d-grid gap-2">
                        <button 
                          type="submit" 
                          className="btn py-3"
                          style={{ backgroundColor: '#8B0000', color: 'white' }}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Signing in...
                            </>
                          ) : (
                            <>Sign In<i className="bi bi-arrow-right ms-2"></i></>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="mb-0">
                    Don't have an account?{' '}
                    <Link to="/register" className="fw-semibold text-decoration-none">Create one</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;