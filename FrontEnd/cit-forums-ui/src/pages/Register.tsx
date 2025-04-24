import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, RegisterRequest } from '../services/authService';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    studentNumber: '',
    city: '',
    province: '',
    address: '',
    bio: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Format phone number (11 digits without dashes)
    if (name === 'phoneNumber') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      
      // Limit to 11 digits
      const limitedDigits = digitsOnly.slice(0, 11);
      
      setFormData({
        ...formData,
        [name]: limitedDigits
      });
    } 
    // Format student number (###-###-####)
    else if (name === 'studentNumber') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      
      // Format as ###-###-####
      if (digitsOnly.length <= 3) {
        setFormData({
          ...formData,
          [name]: digitsOnly
        });
      } else if (digitsOnly.length <= 6) {
        setFormData({
          ...formData,
          [name]: `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`
        });
      } else {
        setFormData({
          ...formData,
          [name]: `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Registering with data:', formData);
      // Register the user
      const success = await register(formData);
      
      if (success) {
        console.log('Registration successful, redirecting to login with:', formData.name);
        // After successful registration, redirect to login
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please login with your new account.',
            usernameOrEmail: formData.name // Pre-fill username field on login page
          } 
        });
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Register</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label htmlFor="name">Username</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <small className="form-text text-muted">
                  Username can only contain letters, numbers, dots, underscores, and hyphens. <strong>No spaces allowed.</strong>
                </small>
              </div>
              <div className="form-group mb-3">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
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
              <div className="form-group mb-3">
                <label htmlFor="phoneNumber">Mobile Number</label>
                <input
                  type="text"
                  className="form-control"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="09123456789"
                />
                <small className="form-text text-muted">
                  Mobile number must be 11 digits without dashes or spaces. <strong>Numbers only, no letters.</strong>
                </small>
              </div>
              <div className="form-group mb-3">
                <label htmlFor="studentNumber">Student ID</label>
                <input
                  type="text"
                  className="form-control"
                  id="studentNumber"
                  name="studentNumber"
                  value={formData.studentNumber}
                  onChange={handleChange}
                  placeholder="123-456-7890"
                />
                <small className="form-text text-muted">
                  Student ID must be in format ###-###-####. <strong>Numbers only, no letters.</strong>
                </small>
              </div>
              <div className="form-group mb-3">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  className="form-control"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="province">Province</label>
                <input
                  type="text"
                  className="form-control"
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="address">Address</label>
                <textarea
                  className="form-control"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="bio">Bio</label>
                <textarea
                  className="form-control"
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>
              <div className="d-grid">
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
            <div className="mt-3 text-center">
              <p>
                Already have an account?{' '}
                <Link to="/login">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;