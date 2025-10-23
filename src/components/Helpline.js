import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../styles/common-page.css';

const Helpline = () => {
  const navigate = useNavigate();
  const { language } = useApp();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      q: 'How do I track my bus in real-time?',
      a: 'Go to "Track a Bus" from home screen, enter your bus number (e.g., 335E), and view live location on map. Updates every 30 seconds automatically.'
    },
    {
      q: 'Can I book tickets through this app?',
      a: 'Currently, this app is for information only. Tickets must be purchased on the bus or through BMTC Pass counters. Digital ticketing is coming soon.'
    },
    {
      q: 'What if bus location is not accurate?',
      a: 'Bus location depends on GPS signal. Some delays may occur in tunnels or high-rise areas. Refresh after 30 seconds. If issue persists, call helpline.'
    },
    {
      q: 'How to save favorite routes?',
      a: 'On any route page, click the star icon to add to favorites. Access them quickly from "Search by Route" page.'
    },
    {
      q: 'Are there student/senior citizen discounts?',
      a: 'Yes! Students get 50% discount, senior citizens (60+) get free travel. Valid ID required. Check Fare Calculator for details.'
    },
    {
      q: 'What are peak and off-peak hours?',
      a: 'Peak: 7-10 AM, 5-8 PM (weekdays). Off-peak: All other times. More buses during peak hours. Check Time Table for exact schedules.'
    },
    {
      q: 'How to report lost items?',
      a: 'Call Lost & Found: 080-22952422 (9 AM - 6 PM). Provide date, time, bus number, and item description. Visit nearest depot for collection.'
    },
    {
      q: 'App not working or showing errors?',
      a: 'Check internet connection. Clear browser cache. Try different browser. If problem continues, email tech support at support@mybmtc.com'
    }
  ];

  const contactMethods = [
    {
      icon: 'fa-phone-volume',
      title: '24x7 Helpline',
      primary: '1800-425-1663',
      secondary: 'Toll-free from anywhere in India',
      color: '#4caf50',
      action: () => window.location.href = 'tel:18004251663'
    },
    {
      icon: 'fa-envelope',
      title: 'Email Support',
      primary: 'support@mybmtc.com',
      secondary: 'Response within 24 hours',
      color: '#2196f3',
      action: () => window.location.href = 'mailto:support@mybmtc.com'
    },
    {
      icon: 'fa-globe',
      title: 'Official Website',
      primary: 'mybmtc.karnataka.gov.in',
      secondary: 'Forms, passes, and more',
      color: '#ff9800',
      action: () => window.open('https://mybmtc.karnataka.gov.in', '_blank')
    },
    {
      icon: 'fa-comment-dots',
      title: 'Send Feedback',
      primary: 'Share Your Experience',
      secondary: 'Help us improve our service',
      color: '#e91e63',
      action: () => navigate('/feedback')
    }
  ];

  const departments = [
    { name: 'Customer Service', phone: '080-22952422', hours: '8 AM - 8 PM' },
    { name: 'Lost & Found', phone: '080-22952422', hours: '9 AM - 6 PM' },
    { name: 'Pass Office', phone: '080-22952265', hours: '9 AM - 5 PM' },
    { name: 'Technical Support', email: 'tech@mybmtc.com', hours: '24x7' },
    { name: 'Complaints', email: 'complaints@mybmtc.com', hours: '24x7' }
  ];

  const emergencyContacts = [
    { type: 'Police', number: '100' },
    { type: 'Ambulance', number: '108' },
    { type: 'Women Helpline', number: '1091' },
    { type: 'Senior Citizen Helpline', number: '1091' }
  ];

  return (
    <div>
      <header className="page-header">
        <div className="page-header-container">
          <div className="page-header-left">
            <img src="/assets/bmtc-logo.png" alt="BMTC" className="header-logo" onClick={() => navigate('/')} onError={e => e.target.style.display='none'} />
            <h2>Help & Support</h2>
          </div>
          <div className="page-header-right">
            <button className="icon-btn" onClick={() => navigate('/')}>
              <i className="fas fa-home"></i>
            </button>
          </div>
        </div>
      </header>

      <main style={{background:'#f5f5f5',minHeight:'calc(100vh - 80px)',padding:'30px 20px'}}>
        <div className="container" style={{maxWidth:'1200px'}}>
          {/* Hero Section */}
          <div style={{textAlign:'center',marginBottom:'40px'}}>
            <div style={{fontSize:'4rem',color:'#d32f2f',marginBottom:'15px'}}>
              <i className="fas fa-headset"></i>
            </div>
            <h2 style={{color:'#333',marginBottom:'10px'}}>We're Here to Help!</h2>
            <p style={{color:'#666',fontSize:'1.1rem'}}>Get support anytime, anywhere. Choose your preferred contact method below.</p>
          </div>

          {/* Contact Methods Grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:'20px',marginBottom:'40px'}}>
            {contactMethods.map((method, idx) => (
              <div 
                key={idx}
                onClick={method.action}
                style={{
                  background:'white',
                  padding:'30px',
                  borderRadius:'15px',
                  boxShadow:'0 2px 10px rgba(0,0,0,0.1)',
                  cursor:'pointer',
                  transition:'all 0.3s',
                  border:`3px solid ${method.color}`,
                  textAlign:'center'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{fontSize:'3rem',color:method.color,marginBottom:'15px'}}>
                  <i className={`fas ${method.icon}`}></i>
                </div>
                <h3 style={{color:'#333',marginBottom:'10px',fontSize:'1.2rem'}}>{method.title}</h3>
                <p style={{color:method.color,fontWeight:'700',fontSize:'1.1rem',marginBottom:'8px'}}>{method.primary}</p>
                <p style={{color:'#999',fontSize:'0.9rem'}}>{method.secondary}</p>
              </div>
            ))}
          </div>

          {/* Departments */}
          <div style={{background:'white',borderRadius:'15px',padding:'30px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)',marginBottom:'30px'}}>
            <h3 style={{color:'#333',marginBottom:'25px',display:'flex',alignItems:'center',gap:'10px'}}>
              <i className="fas fa-building" style={{color:'#2196f3'}}></i>
              Department Contacts
            </h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:'20px'}}>
              {departments.map((dept, idx) => (
                <div key={idx} style={{padding:'20px',background:'#f9f9f9',borderRadius:'10px',borderLeft:'4px solid #2196f3'}}>
                  <h4 style={{color:'#333',marginBottom:'10px'}}>{dept.name}</h4>
                  {dept.phone && (
                    <p style={{color:'#666',marginBottom:'5px'}}>
                      <i className="fas fa-phone" style={{marginRight:'8px',color:'#4caf50'}}></i>
                      <a href={`tel:${dept.phone}`} style={{color:'#2196f3',textDecoration:'none'}}>{dept.phone}</a>
                    </p>
                  )}
                  {dept.email && (
                    <p style={{color:'#666',marginBottom:'5px'}}>
                      <i className="fas fa-envelope" style={{marginRight:'8px',color:'#ff9800'}}></i>
                      <a href={`mailto:${dept.email}`} style={{color:'#2196f3',textDecoration:'none'}}>{dept.email}</a>
                    </p>
                  )}
                  <p style={{color:'#999',fontSize:'0.9rem',marginTop:'8px'}}>
                    <i className="fas fa-clock" style={{marginRight:'8px'}}></i>
                    {dept.hours}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div style={{background:'white',borderRadius:'15px',padding:'30px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)',marginBottom:'30px'}}>
            <h3 style={{color:'#333',marginBottom:'25px',display:'flex',alignItems:'center',gap:'10px'}}>
              <i className="fas fa-question-circle" style={{color:'#ff9800'}}></i>
              Frequently Asked Questions
            </h3>
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                style={{
                  marginBottom:'15px',
                  border:'2px solid #f0f0f0',
                  borderRadius:'10px',
                  overflow:'hidden',
                  transition:'all 0.3s'
                }}
              >
                <div 
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  style={{
                    padding:'20px',
                    background: expandedFaq === idx ? '#e3f2fd' : 'white',
                    cursor:'pointer',
                    display:'flex',
                    justifyContent:'space-between',
                    alignItems:'center'
                  }}
                >
                  <h4 style={{color:'#333',margin:0,flex:1}}>{faq.q}</h4>
                  <i className={`fas fa-chevron-${expandedFaq === idx ? 'up' : 'down'}`} style={{color:'#2196f3',fontSize:'1.2rem'}}></i>
                </div>
                {expandedFaq === idx && (
                  <div style={{padding:'20px',background:'#f9f9f9',borderTop:'2px solid #e0e0e0'}}>
                    <p style={{color:'#555',lineHeight:'1.6',margin:0}}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
            <div style={{textAlign:'center',marginTop:'25px'}}>
              <button className="btn btn-primary" onClick={() => navigate('/user-guide')}>
                <i className="fas fa-book-open"></i> View Complete User Guide
              </button>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div style={{background:'linear-gradient(135deg, #f44336 0%, #c62828 100%)',borderRadius:'15px',padding:'30px',color:'white',marginBottom:'30px'}}>
            <h3 style={{marginBottom:'20px',display:'flex',alignItems:'center',gap:'10px'}}>
              <i className="fas fa-exclamation-triangle"></i>
              Emergency Contacts
            </h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:'15px'}}>
              {emergencyContacts.map((contact, idx) => (
                <div key={idx} style={{background:'rgba(255,255,255,0.15)',padding:'15px',borderRadius:'10px',textAlign:'center'}}>
                  <p style={{fontSize:'0.9rem',marginBottom:'8px',opacity:0.9}}>{contact.type}</p>
                  <a 
                    href={`tel:${contact.number}`}
                    style={{fontSize:'1.5rem',fontWeight:'700',color:'white',textDecoration:'none',display:'block'}}
                  >
                    {contact.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media & Office Address */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
            <div style={{background:'white',borderRadius:'15px',padding:'25px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
              <h4 style={{color:'#333',marginBottom:'20px'}}>
                <i className="fas fa-share-alt" style={{color:'#2196f3',marginRight:'10px'}}></i>
                Follow Us
              </h4>
              <div style={{display:'flex',gap:'15px',flexWrap:'wrap'}}>
                <a href="https://facebook.com/bmtc" target="_blank" rel="noopener noreferrer" style={{fontSize:'2rem',color:'#1877f2'}}>
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="https://twitter.com/bmtc" target="_blank" rel="noopener noreferrer" style={{fontSize:'2rem',color:'#1da1f2'}}>
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://youtube.com/bmtc" target="_blank" rel="noopener noreferrer" style={{fontSize:'2rem',color:'#ff0000'}}>
                  <i className="fab fa-youtube"></i>
                </a>
                <a href="https://instagram.com/bmtc" target="_blank" rel="noopener noreferrer" style={{fontSize:'2rem',color:'#e4405f'}}>
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>

            <div style={{background:'white',borderRadius:'15px',padding:'25px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
              <h4 style={{color:'#333',marginBottom:'15px'}}>
                <i className="fas fa-map-marker-alt" style={{color:'#d32f2f',marginRight:'10px'}}></i>
                Head Office
              </h4>
              <p style={{color:'#666',lineHeight:'1.6',fontSize:'0.95rem'}}>
                K.H. Road, Shanthinagar,<br/>
                Bangalore - 560027<br/>
                Karnataka, India
              </p>
            </div>
          </div>

          {/* Response Time Notice */}
          <div style={{background:'#fff3e0',border:'2px solid #ff9800',borderRadius:'10px',padding:'20px',marginTop:'30px',textAlign:'center'}}>
            <i className="fas fa-info-circle" style={{color:'#ff9800',fontSize:'1.5rem',marginBottom:'10px'}}></i>
            <p style={{color:'#666',margin:0}}>
              <strong>Average Response Time:</strong> Phone - Immediate | Email - 24 hours | Feedback - 48 hours
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Helpline;
