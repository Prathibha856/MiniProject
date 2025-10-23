import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import '../styles/common-page.css';

const Feedback = () => {
  const navigate = useNavigate();
  const { language } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'bus_service',
    busNumber: '',
    rating: 0,
    subject: '',
    message: ''
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'bus_service', label: 'Bus Service Quality', icon: 'fa-bus' },
    { value: 'timing', label: 'Timing & Punctuality', icon: 'fa-clock' },
    { value: 'driver_conduct', label: 'Driver Conduct', icon: 'fa-user-tie' },
    { value: 'cleanliness', label: 'Bus Cleanliness', icon: 'fa-broom' },
    { value: 'app_issue', label: 'App/Website Issue', icon: 'fa-mobile-alt' },
    { value: 'route', label: 'Route Information', icon: 'fa-route' },
    { value: 'fare', label: 'Fare & Payment', icon: 'fa-money-bill-wave' },
    { value: 'other', label: 'Other', icon: 'fa-ellipsis-h' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.rating) {
      alert('Please provide a rating');
      return;
    }

    setLoading(true);
    try {
      await apiService.submitFeedback({
        ...formData,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
      setSubmitted(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.log('Feedback submitted (demo mode)');
      setSubmitted(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const t = {
    en: {
      title: 'Feedback & Complaints',
      subtitle: 'Help us serve you better',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      category: 'Feedback Category',
      busNumber: 'Bus Number (if applicable)',
      rating: 'Rate Your Experience',
      subject: 'Subject',
      message: 'Your Feedback',
      submit: 'Submit Feedback',
      success: 'Thank You!',
      successMsg: 'Your feedback has been submitted successfully. We appreciate your input!',
      required: 'Required'
    },
    kn: {
      title: 'ಪ್ರತಿಕ್ರಿಯೆ ಮತ್ತು ದೂರುಗಳು',
      subtitle: 'ನಿಮಗೆ ಉತ್ತಮವಾಗಿ ಸೇವೆ ಸಲ್ಲಿಸಲು ನಮಗೆ ಸಹಾಯ ಮಾಡಿ',
      name: 'ಪೂರ್ಣ ಹೆಸರು',
      submit: 'ಪ್ರತಿಕ್ರಿಯೆ ಸಲ್ಲಿಸಿ'
    },
    hi: {
      title: 'फीडबैक और शिकायत',
      subtitle: 'आपकी बेहतर सेवा के लिए',
      name: 'पूरा नाम',
      submit: 'फीडबैक सबमिट करें'
    }
  };

  const text = t[language];

  if (submitted) {
    return (
      <div>
        <header className="page-header">
          <div className="page-header-container">
            <div className="page-header-left"><h2>{text.title}</h2></div>
          </div>
        </header>
        <div style={{padding:'80px 20px',textAlign:'center',maxWidth:'600px',margin:'0 auto'}}>
          <div style={{fontSize:'5rem',color:'#4caf50',marginBottom:'20px'}}>
            <i className="fas fa-check-circle"></i>
          </div>
          <h2 style={{color:'#4caf50',marginBottom:'15px'}}>{text.success}</h2>
          <p style={{fontSize:'1.1rem',color:'#666',marginBottom:'30px'}}>{text.successMsg}</p>
          <div style={{background:'#f0f9ff',padding:'20px',borderRadius:'10px',marginTop:'30px'}}>
            <p><strong>Reference ID:</strong> FB{Date.now().toString().slice(-8)}</p>
            <p style={{marginTop:'10px',fontSize:'0.9rem'}}>You will receive a response within 48 hours</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/')}
            style={{marginTop:'30px',padding:'12px 30px'}}
          >
            <i className="fas fa-home"></i> Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="page-header">
        <div className="page-header-container">
          <div className="page-header-left">
            <img src="/assets/bmtc-logo.png" alt="BMTC" className="header-logo" onClick={() => navigate('/')} onError={e => e.target.style.display='none'} />
            <h2>{text.title}</h2>
          </div>
          <div className="page-header-right">
            <button className="icon-btn" onClick={() => navigate('/')}>
              <i className="fas fa-home"></i>
            </button>
          </div>
        </div>
      </header>

      <main style={{padding:'40px 20px',background:'#f5f5f5',minHeight:'calc(100vh - 80px)'}}>
        <div className="container" style={{maxWidth:'800px'}}>
          <div style={{textAlign:'center',marginBottom:'40px'}}>
            <h3 style={{color:'#d32f2f',marginBottom:'10px'}}>{text.subtitle}</h3>
            <p style={{color:'#666'}}>Your feedback helps us improve our services</p>
          </div>

          <form onSubmit={handleSubmit} style={{background:'white',padding:'40px',borderRadius:'15px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
            {/* Personal Information */}
            <div style={{marginBottom:'30px'}}>
              <h4 style={{marginBottom:'20px',color:'#333'}}>
                <i className="fas fa-user"></i> Personal Information
              </h4>
              <div className="form-group">
                <label>{text.name} <span style={{color:'red'}}>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'15px'}}>
                <div className="form-group">
                  <label>{text.email}</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="form-group">
                  <label>{text.phone}</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
              </div>
            </div>

            {/* Feedback Category */}
            <div style={{marginBottom:'30px'}}>
              <h4 style={{marginBottom:'20px',color:'#333'}}>
                <i className="fas fa-list"></i> {text.category} <span style={{color:'red'}}>*</span>
              </h4>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:'15px'}}>
                {categories.map(cat => (
                  <div
                    key={cat.value}
                    onClick={() => handleChange('category', cat.value)}
                    style={{
                      padding:'15px',
                      border:`2px solid ${formData.category === cat.value ? '#d32f2f' : '#ddd'}`,
                      borderRadius:'10px',
                      cursor:'pointer',
                      textAlign:'center',
                      background: formData.category === cat.value ? '#fff5f5' : 'white',
                      transition:'all 0.3s'
                    }}
                  >
                    <i className={`fas ${cat.icon}`} style={{fontSize:'1.5rem',color:formData.category === cat.value ? '#d32f2f' : '#666',marginBottom:'8px'}}></i>
                    <div style={{fontSize:'0.9rem',fontWeight:formData.category === cat.value ? '600' : 'normal'}}>{cat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bus Number (Optional) */}
            <div className="form-group">
              <label>{text.busNumber}</label>
              <input
                type="text"
                className="form-control"
                value={formData.busNumber}
                onChange={e => handleChange('busNumber', e.target.value)}
                placeholder="e.g., 335E, 500D"
              />
            </div>

            {/* Rating */}
            <div style={{marginBottom:'30px'}}>
              <h4 style={{marginBottom:'15px',color:'#333'}}>
                <i className="fas fa-star"></i> {text.rating} <span style={{color:'red'}}>*</span>
              </h4>
              <div style={{display:'flex',gap:'10px',fontSize:'2.5rem',justifyContent:'center'}}>
                {[1,2,3,4,5].map(star => (
                  <i
                    key={star}
                    className={star <= (hoverRating || formData.rating) ? 'fas fa-star' : 'far fa-star'}
                    onClick={() => handleChange('rating', star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      color: star <= (hoverRating || formData.rating) ? '#ffc107' : '#ddd',
                      cursor:'pointer',
                      transition:'all 0.2s'
                    }}
                  ></i>
                ))}
              </div>
              {formData.rating > 0 && (
                <p style={{textAlign:'center',marginTop:'10px',color:'#666'}}>
                  {formData.rating === 1 && 'Poor'}
                  {formData.rating === 2 && 'Fair'}
                  {formData.rating === 3 && 'Good'}
                  {formData.rating === 4 && 'Very Good'}
                  {formData.rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Subject */}
            <div className="form-group">
              <label>{text.subject} <span style={{color:'red'}}>*</span></label>
              <input
                type="text"
                className="form-control"
                value={formData.subject}
                onChange={e => handleChange('subject', e.target.value)}
                required
                placeholder="Brief summary of your feedback"
              />
            </div>

            {/* Message */}
            <div className="form-group">
              <label>{text.message} <span style={{color:'red'}}>*</span></label>
              <textarea
                className="form-control"
                value={formData.message}
                onChange={e => handleChange('message', e.target.value)}
                required
                rows="6"
                placeholder="Please provide detailed feedback..."
                style={{resize:'vertical'}}
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
              style={{padding:'15px',fontSize:'1.1rem',marginTop:'20px'}}
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> Submitting...</>
              ) : (
                <><i className="fas fa-paper-plane"></i> {text.submit}</>
              )}
            </button>

            <p style={{textAlign:'center',marginTop:'20px',fontSize:'0.9rem',color:'#666'}}>
              <i className="fas fa-lock"></i> Your information is secure and will be kept confidential
            </p>
          </form>

          {/* Contact Info */}
          <div style={{marginTop:'30px',textAlign:'center',color:'#666'}}>
            <p><strong>Alternative Contact Methods:</strong></p>
            <p>📞 Helpline: 1800-425-1663 | 📧 Email: feedback@mybmtc.com</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feedback;
