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
      
      console.log('Attempting login with:', formData.usernameOrEmail);
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
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Login</h2>
              
              {successMessage && (
                <div className="alert alert-success">{successMessage}</div>
              )}
              
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label htmlFor="usernameOrEmail">Username or Email</label>
                  <input
                    type="text"
                    className="form-control"
                    id="usernameOrEmail"
                    name="usernameOrEmail"
                    value={formData.usernameOrEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </form>
              <div className="mt-3 text-center">
                <p>
                  Don't have an account?{' '}
                  <Link to="/register">Register</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 