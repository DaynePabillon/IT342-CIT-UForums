import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, RegisterRequest } from '../services/authService';

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
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'password', 'firstName', 'lastName', 'studentNumber'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`);
        return;
      }
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
        navigate('/#/login', { 
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
    <div className="register-container">
      <div className="container-fluid">
        <div className="row vh-100">
          {/* Left side - Image */}
          <div className="col-md-5 d-none d-md-flex p-0" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #A52A2A 100%)' }}>
            <div className="register-image-container w-100 h-100 d-flex align-items-center justify-content-center">
              <div className="text-white text-center p-5">
                <h1 className="display-4 fw-bold mb-4">Join Our Community</h1>
                <p className="lead mb-5">
                  Connect with fellow students and faculty members at CIT-U.
                </p>
                <div className="d-flex justify-content-center">
                  <div className="feature-card bg-white bg-opacity-10 p-4 rounded-4 m-2 text-start">
                    <i className="bi bi-people-fill fs-1 mb-3 text-warning"></i>
                    <h5>Build Connections</h5>
                    <p className="mb-0">Network with peers and professionals</p>
                  </div>
                  <div className="feature-card bg-white bg-opacity-10 p-4 rounded-4 m-2 text-start">
                    <i className="bi bi-mortarboard-fill fs-1 mb-3 text-warning"></i>
                    <h5>Enhance Learning</h5>
                    <p className="mb-0">Access resources and collaborative opportunities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Registration form */}
          <div className="col-md-7 d-flex align-items-center bg-light overflow-auto" style={{ maxHeight: '100vh' }}>
            <div className="register-form-container w-100 p-4 p-md-5">
              <div className="text-center mb-4">
                <img src="/logo.png" alt="CIT-U Forums Logo" className="mb-3" style={{ maxHeight: '60px' }} />
                <h2 className="fw-bold mb-2">Create Your Account</h2>
                <p className="text-muted">Join the CIT-U community today</p>
              </div>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <div className="row g-3">
                      {/* Account Information */}
                      <div className="col-12 mb-3">
                        <h5 className="form-section-title"><i className="bi bi-person-fill me-2"></i>Account Information</h5>
                        <hr className="mt-2 mb-3" />
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="name" className="form-label">Username <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control form-control-lg bg-light"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label">Email Address <span className="text-danger">*</span></label>
                        <input
                          type="email"
                          className="form-control form-control-lg bg-light"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="password" className="form-label">Password <span className="text-danger">*</span></label>
                        <div className="input-group">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="form-control form-control-lg bg-light"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
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
                      
                      <div className="col-md-6">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password <span className="text-danger">*</span></label>
                        <div className="input-group">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className={`form-control form-control-lg bg-light ${!passwordsMatch ? 'is-invalid' : ''}`}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                          >
                            <i className={showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
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
                </div>
                
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    {/* Personal Information - Not Collapsible, Always Visible */}
                    <div className="mb-4">
                      <h5 className="form-section-title">
                        <i className="bi bi-card-heading me-2"></i>Personal Information <span className="text-danger">*</span>
                      </h5>
                      <hr className="mt-2 mb-3" />
                      
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="firstName" className="form-label">First Name <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            className="form-control form-control-lg bg-light"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="lastName" className="form-label">Last Name <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            className="form-control form-control-lg bg-light"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="studentNumber" className="form-label">Student ID <span className="text-danger">*</span></label>
                          <input
                            type="text"
                            className="form-control form-control-lg bg-light"
                            id="studentNumber"
                            name="studentNumber"
                            value={formData.studentNumber}
                            onChange={handleChange}
                            placeholder="##-####-###"
                            required
                          />
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
                          <span><i className="bi bi-telephone-fill me-2"></i>Contact Information (Optional)</span>
                          <i className="bi bi-chevron-down"></i>
                        </h5>
                      </button>
                      
                      <div className="collapse" id="contactInfo">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                            <input
                              type="text"
                              className="form-control form-control-lg bg-light"
                              id="phoneNumber"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleChange}
                              placeholder="09#########"
                            />
                          </div>
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
                  </div>
                </div>
                
                {/* Submit Button - Fixed at the bottom with padding */}
                <div className="card border-0 shadow-sm mb-5">
                  <div className="card-body p-4">
                    <div className="d-grid gap-2">
                      <button 
                        type="submit" 
                        className="btn py-3"
                        style={{ backgroundColor: '#8B0000', color: 'white' }}
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
                        <Link to="/#/login" className="fw-semibold text-decoration-none">Sign in</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;