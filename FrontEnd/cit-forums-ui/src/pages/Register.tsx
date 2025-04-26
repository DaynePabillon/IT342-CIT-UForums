import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, RegisterRequest } from '../services/authService';
import { BiShow, BiHide } from 'react-icons/bi';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterRequest & { confirmPassword: string }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
  const [passwordsMatch, setPasswordsMatch] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
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
    // Format student number (##-####-###)
    else if (name === 'studentNumber') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      
      // Format as ##-####-###
      if (digitsOnly.length <= 2) {
        setFormData({
          ...formData,
          [name]: digitsOnly
        });
      } else if (digitsOnly.length <= 6) {
        setFormData({
          ...formData,
          [name]: `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2)}`
        });
      } else {
        setFormData({
          ...formData,
          [name]: `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2, 6)}-${digitsOnly.slice(6, 9)}`
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
      
      // Check if passwords match when either password or confirmPassword changes
      if (name === 'password' || name === 'confirmPassword') {
        const password = name === 'password' ? value : formData.password;
        const confirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;
        setPasswordsMatch(password === confirmPassword || confirmPassword === '');
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordsMatch(false);
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      console.log('Registering with data:', formData);
      // Register the user (exclude confirmPassword from the request)
      const { confirmPassword, ...registerData } = formData;
      const success = await register(registerData);
      
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
    <div className="register-container py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
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
                      <h2 className="display-6 fw-bold mb-4">Join Our Community</h2>
                      <p className="lead">Connect with peers, share knowledge, and participate in discussions at CIT-U Forums.</p>
                      <div className="mt-5">
                        <div className="d-flex align-items-center mb-3">
                          <i className="bi bi-check-circle-fill me-3 fs-5"></i>
                          <span>Access to all forums and discussions</span>
                        </div>
                        <div className="d-flex align-items-center mb-3">
                          <i className="bi bi-check-circle-fill me-3 fs-5"></i>
                          <span>Create threads and share your thoughts</span>
                        </div>
                        <div className="d-flex align-items-center mb-3">
                          <i className="bi bi-check-circle-fill me-3 fs-5"></i>
                          <span>Connect with fellow students and faculty</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Decorative background elements */}
                    <div className="position-absolute top-0 end-0 p-5 opacity-10">
                      <i className="bi bi-chat-square-text-fill" style={{ fontSize: '8rem' }}></i>
                    </div>
                    <div className="position-absolute bottom-0 start-0 p-5 opacity-10">
                      <i className="bi bi-people-fill" style={{ fontSize: '8rem' }}></i>
                    </div>
                  </div>
                </div>
                
                {/* Right side - Registration form */}
                <div className="col-md-7 p-0">
                  <div className="p-4 p-lg-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h3 className="fw-bold m-0">Create an Account</h3>
                      <img src="/logo.png" alt="CIT-U Forums Logo" height="40" />
                    </div>
                    
                    {error && <div className="alert alert-danger">{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                      {/* Account Information */}
                      <div className="mb-4">
                        <h5 className="form-section-title">
                          <i className="bi bi-person-badge-fill me-2"></i>Account Information
                        </h5>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label htmlFor="name" className="form-label">Username</label>
                            <div className="input-group mb-3">
                              <span className="input-group-text bg-light"><i className="bi bi-person"></i></span>
                              <input
                                type="text"
                                className="form-control form-control-lg bg-light"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Choose a username"
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <div className="input-group mb-3">
                              <span className="input-group-text bg-light"><i className="bi bi-envelope"></i></span>
                              <input
                                type="email"
                                className="form-control form-control-lg bg-light"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
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
                                placeholder="Create a password"
                                required
                              />
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={togglePasswordVisibility}
                              >
                                {showPassword ? <BiHide /> : <BiShow />}
                              </button>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                            <div className="input-group mb-3">
                              <span className="input-group-text bg-light"><i className="bi bi-lock-fill"></i></span>
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                className={`form-control form-control-lg bg-light ${!passwordsMatch ? 'is-invalid' : ''}`}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                              />
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={toggleConfirmPasswordVisibility}
                              >
                                {showConfirmPassword ? <BiHide /> : <BiShow />}
                              </button>
                              {!passwordsMatch && (
                                <div className="invalid-feedback">
                                  Passwords do not match
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Personal Information - Collapsible */}
                      <div className="mb-4">
                        <button 
                          className="btn btn-link text-decoration-none p-0 mb-3 w-100 text-start" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#personalInfo" 
                          aria-expanded="false" 
                          aria-controls="personalInfo"
                        >
                          <h5 className="form-section-title d-flex justify-content-between align-items-center">
                            <span><i className="bi bi-person-vcard-fill me-2"></i>Personal Information</span>
                            <i className="bi bi-chevron-down"></i>
                          </h5>
                        </button>
                        
                        <div className="collapse" id="personalInfo">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label htmlFor="firstName" className="form-label">First Name</label>
                              <input
                                type="text"
                                className="form-control form-control-lg bg-light"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="lastName" className="form-label">Last Name</label>
                              <input
                                type="text"
                                className="form-control form-control-lg bg-light"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                              <input
                                type="text"
                                className="form-control form-control-lg bg-light"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="09XXXXXXXXX"
                              />
                              <small className="text-muted">Format: 09XXXXXXXXX (11 digits)</small>
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="studentNumber" className="form-label">Student ID</label>
                              <input
                                type="text"
                                className="form-control form-control-lg bg-light"
                                id="studentNumber"
                                name="studentNumber"
                                value={formData.studentNumber}
                                onChange={handleChange}
                                placeholder="XX-XXXX-XXX"
                              />
                              <small className="text-muted">Format: XX-XXXX-XXX</small>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Contact Information - Collapsible */}
                      <div className="mb-4">
                        <button 
                          className="btn btn-link text-decoration-none p-0 mb-3 w-100 text-start" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#contactInfo" 
                          aria-expanded="false" 
                          aria-controls="contactInfo"
                        >
                          <h5 className="form-section-title d-flex justify-content-between align-items-center">
                            <span><i className="bi bi-geo-alt-fill me-2"></i>Contact Information (Optional)</span>
                            <i className="bi bi-chevron-down"></i>
                          </h5>
                        </button>
                        
                        <div className="collapse" id="contactInfo">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label htmlFor="city" className="form-label">City</label>
                              <input
                                type="text"
                                className="form-control form-control-lg bg-light"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="province" className="form-label">Province</label>
                              <input
                                type="text"
                                className="form-control form-control-lg bg-light"
                                id="province"
                                name="province"
                                value={formData.province}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="col-12">
                              <label htmlFor="address" className="form-label">Address</label>
                              <textarea
                                className="form-control form-control-lg bg-light"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bio Section - Collapsible */}
                      <div className="mb-4">
                        <button 
                          className="btn btn-link text-decoration-none p-0 mb-3 w-100 text-start" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#bioInfo" 
                          aria-expanded="false" 
                          aria-controls="bioInfo"
                        >
                          <h5 className="form-section-title d-flex justify-content-between align-items-center">
                            <span><i className="bi bi-file-person-fill me-2"></i>About You (Optional)</span>
                            <i className="bi bi-chevron-down"></i>
                          </h5>
                        </button>
                        
                        <div className="collapse" id="bioInfo">
                          <div className="mb-3">
                            <label htmlFor="bio" className="form-label">Bio</label>
                            <textarea
                              className="form-control form-control-lg bg-light"
                              id="bio"
                              name="bio"
                              value={formData.bio}
                              onChange={handleChange}
                              placeholder="Tell us a bit about yourself..."
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Submit Button */}
                      <div className="d-grid gap-2 mt-4">
                        <button 
                          type="submit" 
                          className="btn btn-primary btn-lg py-3"
                          disabled={loading || !passwordsMatch}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Creating your account...
                            </>
                          ) : (
                            <>Join CIT-U Forums<i className="bi bi-arrow-right ms-2"></i></>
                          )}
                        </button>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <p className="mb-0">
                          Already have an account?{' '}
                          <Link to="/login" className="fw-semibold text-decoration-none">Sign in</Link>
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

export default Register;