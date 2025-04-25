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
                          <span>Access exclusive academic resources</span>
                        </div>
                        <div className="d-flex align-items-center mb-3">
                          <i className="bi bi-check-circle-fill me-3 fs-5"></i>
                          <span>Connect with fellow students</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-check-circle-fill me-3 fs-5"></i>
                          <span>Stay updated with campus events</span>
                        </div>
                      </div>
                    </div>
                    {/* Decorative circles */}
                    <div className="position-absolute" style={{ bottom: '20px', right: '20px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                    <div className="position-absolute" style={{ top: '40px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                  </div>
                </div>
                
                {/* Right side - Registration form */}
                <div className="col-md-7">
                  <div className="card-body p-4 p-lg-5">
                    <div className="text-center mb-4">
                      <h2 className="h3 fw-bold">Create Your Account</h2>
                      <p className="text-muted">Fill in your information to get started</p>
                    </div>
                    
                    {error && (
                      <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <div>{error}</div>
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                      {/* Personal Information Section */}
                      <div className="mb-4">
                        <h5 className="form-section-title"><i className="bi bi-person-fill me-2"></i>Personal Information</h5>
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
                              required
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
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Account Information Section */}
                      <div className="mb-4">
                        <h5 className="form-section-title"><i className="bi bi-shield-lock-fill me-2"></i>Account Information</h5>
                        <div className="mb-3">
                          <label htmlFor="name" className="form-label">Username</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light"><i className="bi bi-person"></i></span>
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
                          <small className="form-text text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            Username can only contain letters, numbers, dots, underscores, and hyphens. <strong>No spaces allowed.</strong>
                          </small>
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">Email</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light"><i className="bi bi-envelope"></i></span>
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
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="password" className="form-label">Password</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light"><i className="bi bi-lock"></i></span>
                            <input
                              type="password"
                              className="form-control form-control-lg bg-light"
                              id="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Student Information Section */}
                      <div className="mb-4">
                        <h5 className="form-section-title"><i className="bi bi-mortarboard-fill me-2"></i>Student Information</h5>
                        <div className="mb-3">
                          <label htmlFor="studentNumber" className="form-label">Student ID</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light"><i className="bi bi-card-heading"></i></span>
                            <input
                              type="text"
                              className="form-control form-control-lg bg-light"
                              id="studentNumber"
                              name="studentNumber"
                              value={formData.studentNumber}
                              onChange={handleChange}
                              placeholder="12-3456-789"
                            />
                          </div>
                          <small className="form-text text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            Student ID must be in format ##-####-###. <strong>Numbers only, no letters.</strong>
                          </small>
                        </div>
                        
                        <div className="mb-3">
                          <label htmlFor="phoneNumber" className="form-label">Mobile Number</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light"><i className="bi bi-phone"></i></span>
                            <input
                              type="text"
                              className="form-control form-control-lg bg-light"
                              id="phoneNumber"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleChange}
                              placeholder="09123456789"
                            />
                          </div>
                          <small className="form-text text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            Mobile number must be 11 digits without dashes or spaces. <strong>Numbers only, no letters.</strong>
                          </small>
                        </div>
                      </div>
                      
                      {/* Contact Information Section - Collapsible */}
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
                          disabled={loading}
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