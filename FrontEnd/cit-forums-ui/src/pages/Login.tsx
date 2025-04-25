import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, LoginRequest, isAuthenticated } from '../services/authService';

interface LocationState {
  message?: string;
  from?: string;
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
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
    
    // Check for messages in location state (e.g., from registration)
    const state = location.state as LocationState;
    if (state?.message) {
      setSuccessMessage(state.message);
    }
    
    // Pre-fill username if provided (e.g., from registration)
    if (state?.usernameOrEmail) {
      setFormData(prevState => ({
        ...prevState,
        usernameOrEmail: state.usernameOrEmail || ''
      }));
    }
  }, [location, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clear any existing authentication data from localStorage first
      localStorage.removeItem('token');
      localStorage.removeItem('user_profile');
      sessionStorage.clear();
      
      console.log('Attempting login with:', formData);
      const success = await login(formData);
      
      if (success) {
        console.log('Login successful, redirecting...');
        // Force a full page reload to ensure clean state
        window.location.href = (location.state as LocationState)?.from || '/';
        return; // Stop execution after redirect
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="row g-0">
                {/* Left side - Image and welcome message */}
                <div className="col-md-5 d-none d-md-block bg-primary text-white p-0">
                  <div className="h-100 d-flex flex-column justify-content-center p-4" 
                       style={{
                         background: 'linear-gradient(135deg, #3a8eff 0%, #1e5bb0 100%)',
                         position: 'relative'
                       }}>
                    <div className="position-relative z-1">
                      <h2 className="display-6 fw-bold mb-4">Welcome Back!</h2>
                      <p className="lead">Sign in to continue your journey at CIT-U Forums.</p>
                      <div className="mt-5">
                        <div className="d-flex align-items-center mb-3">
                          <i className="bi bi-chat-left-text-fill me-3 fs-5"></i>
                          <span>Join discussions</span>
                        </div>
                        <div className="d-flex align-items-center mb-3">
                          <i className="bi bi-people-fill me-3 fs-5"></i>
                          <span>Connect with peers</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-mortarboard-fill me-3 fs-5"></i>
                          <span>Access academic resources</span>
                        </div>
                      </div>
                    </div>
                    {/* Decorative circles */}
                    <div className="position-absolute" style={{ bottom: '20px', right: '20px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                    <div className="position-absolute" style={{ top: '40px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                  </div>
                </div>
                
                {/* Right side - Login form */}
                <div className="col-md-7">
                  <div className="card-body p-4 p-lg-5">
                    <div className="text-center mb-4">
                      <h2 className="h3 fw-bold">Sign In</h2>
                      <p className="text-muted">Access your CIT-U Forums account</p>
                    </div>
                    
                    {successMessage && (
                      <div className="alert alert-success d-flex align-items-center" role="alert">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <div>{successMessage}</div>
                      </div>
                    )}
                    
                    {error && (
                      <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <div>{error}</div>
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
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
                      
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                          <label htmlFor="password" className="form-label">Password</label>
                          <Link to="/forgot-password" className="text-decoration-none small">Forgot password?</Link>
                        </div>
                        <div className="input-group mb-3">
                          <span className="input-group-text bg-light"><i className="bi bi-lock"></i></span>
                          <input
                            type="password"
                            className="form-control form-control-lg bg-light"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="d-grid gap-2 mt-5">
                        <button 
                          type="submit" 
                          className="btn btn-primary btn-lg py-3"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Signing in...
                            </>
                          ) : (
                            <>Sign In<i className="bi bi-box-arrow-in-right ms-2"></i></>
                          )}
                        </button>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <p className="mb-0">
                          Don't have an account?{' '}
                          <Link to="/register" className="fw-semibold text-decoration-none">Create account</Link>
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;