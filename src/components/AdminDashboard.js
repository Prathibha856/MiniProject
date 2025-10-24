import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/common-page.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBuses: 250,
    activeBuses: 187,
    totalRoutes: 4190,
    totalStops: 9360,
    avgOccupancy: 68,
    mlAccuracy: 66.83,
    predictionsToday: 1547,
    peakHourCrowd: 'High'
  });

  const [recentPredictions, setRecentPredictions] = useState([
    { time: '17:45', bus: '335E', stop: 'Majestic', crowd: 'Very High', confidence: 89 },
    { time: '17:42', bus: '500D', stop: 'Jayanagar', crowd: 'High', confidence: 82 },
    { time: '17:40', bus: 'G-9', stop: 'Yelahanka', crowd: 'Medium', confidence: 91 },
    { time: '17:38', bus: '215-NE', stop: 'Vidhana Soudha', crowd: 'High', confidence: 85 },
    { time: '17:35', bus: '402-B', stop: 'Shivajinagara', crowd: 'Very High', confidence: 88 }
  ]);

  const [fleetStatus, setFleetStatus] = useState([
    { route: '335E', buses: 12, active: 10, avgDelay: 5, occupancy: 85 },
    { route: '500D', buses: 15, active: 13, avgDelay: 3, occupancy: 72 },
    { route: 'G-9', buses: 8, active: 7, avgDelay: 2, occupancy: 45 },
    { route: '215-NE', buses: 10, active: 9, avgDelay: 7, occupancy: 78 },
    { route: '402-B', buses: 14, active: 12, avgDelay: 4, occupancy: 81 }
  ]);

  const getCrowdColor = (level) => {
    const colors = {
      'Low': '#4caf50',
      'Medium': '#ff9800',
      'High': '#ff5722',
      'Very High': '#f44336'
    };
    return colors[level] || '#9e9e9e';
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return '#4caf50';
    if (percentage >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <div>
      {/* Header */}
      <header className="page-header">
        <div className="page-header-container">
          <div className="page-header-left">
            <img src="/assets/bmtc-logo.png" alt="BusFlow" className="header-logo" onClick={() => navigate('/')} onError={e => e.target.style.display='none'} />
            <h2>Admin Dashboard</h2>
          </div>
          <div className="page-header-right">
            <button className="header-btn" onClick={() => navigate('/helpline')}>
              <i className="fas fa-phone"></i> Helpline
            </button>
            <button className="icon-btn" onClick={() => window.location.reload()}>
              <i className="fas fa-sync-alt"></i>
            </button>
            <button className="icon-btn" onClick={() => navigate('/')}>
              <i className="fas fa-home"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{padding:'30px 20px',background:'#f5f5f5',minHeight:'calc(100vh - 80px)'}}>
        <div className="container" style={{maxWidth:'1400px'}}>
          
          {/* Hero Section */}
          <div style={{textAlign:'center',marginBottom:'40px'}}>
            <div style={{fontSize:'4rem',marginBottom:'15px'}}>
              <i className="fas fa-chart-line" style={{color:'#2196f3'}}></i>
            </div>
            <h2 style={{color:'#333',marginBottom:'10px'}}>Fleet Analytics & Decision Support</h2>
            <p style={{color:'#666'}}>Real-time monitoring and ML-powered insights for transport authorities</p>
          </div>

          {/* Key Metrics */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:'20px',marginBottom:'30px'}}>
            <div style={{background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',padding:'25px',borderRadius:'15px',color:'white',boxShadow:'0 4px 15px rgba(102,126,234,0.3)'}}>
              <i className="fas fa-bus" style={{fontSize:'2.5rem',marginBottom:'10px',opacity:0.9}}></i>
              <h3 style={{fontSize:'2.5rem',margin:'10px 0',fontWeight:'700'}}>{stats.activeBuses}/{stats.totalBuses}</h3>
              <p style={{opacity:0.9,fontSize:'1rem'}}>Active Buses</p>
              <div style={{marginTop:'10px',fontSize:'0.85rem',opacity:0.8}}>
                {((stats.activeBuses/stats.totalBuses)*100).toFixed(1)}% Fleet Utilization
              </div>
            </div>

            <div style={{background:'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',padding:'25px',borderRadius:'15px',color:'white',boxShadow:'0 4px 15px rgba(240,147,251,0.3)'}}>
              <i className="fas fa-route" style={{fontSize:'2.5rem',marginBottom:'10px',opacity:0.9}}></i>
              <h3 style={{fontSize:'2.5rem',margin:'10px 0',fontWeight:'700'}}>{stats.totalRoutes}</h3>
              <p style={{opacity:0.9,fontSize:'1rem'}}>Total Routes</p>
              <div style={{marginTop:'10px',fontSize:'0.85rem',opacity:0.8}}>
                Covering entire BMTC network
              </div>
            </div>

            <div style={{background:'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',padding:'25px',borderRadius:'15px',color:'white',boxShadow:'0 4px 15px rgba(79,172,254,0.3)'}}>
              <i className="fas fa-users" style={{fontSize:'2.5rem',marginBottom:'10px',opacity:0.9}}></i>
              <h3 style={{fontSize:'2.5rem',margin:'10px 0',fontWeight:'700'}}>{stats.avgOccupancy}%</h3>
              <p style={{opacity:0.9,fontSize:'1rem'}}>Avg Occupancy</p>
              <div style={{marginTop:'10px',fontSize:'0.85rem',opacity:0.8}}>
                Across all active buses
              </div>
            </div>

            <div style={{background:'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',padding:'25px',borderRadius:'15px',color:'white',boxShadow:'0 4px 15px rgba(67,233,123,0.3)'}}>
              <i className="fas fa-brain" style={{fontSize:'2.5rem',marginBottom:'10px',opacity:0.9}}></i>
              <h3 style={{fontSize:'2.5rem',margin:'10px 0',fontWeight:'700'}}>{stats.mlAccuracy}%</h3>
              <p style={{opacity:0.9,fontSize:'1rem'}}>ML Accuracy</p>
              <div style={{marginTop:'10px',fontSize:'0.85rem',opacity:0.8}}>
                Random Forest Model
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:'20px',marginBottom:'30px'}}>
            <div style={{background:'white',padding:'20px',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <p style={{color:'#999',fontSize:'0.9rem',margin:'0 0 5px 0'}}>Predictions Today</p>
                  <h3 style={{color:'#333',fontSize:'2rem',margin:0}}>{stats.predictionsToday.toLocaleString()}</h3>
                </div>
                <div style={{background:'#e3f2fd',width:'60px',height:'60px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <i className="fas fa-chart-bar" style={{fontSize:'1.8rem',color:'#2196f3'}}></i>
                </div>
              </div>
            </div>

            <div style={{background:'white',padding:'20px',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <p style={{color:'#999',fontSize:'0.9rem',margin:'0 0 5px 0'}}>Total Bus Stops</p>
                  <h3 style={{color:'#333',fontSize:'2rem',margin:0}}>{stats.totalStops.toLocaleString()}</h3>
                </div>
                <div style={{background:'#fff3e0',width:'60px',height:'60px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <i className="fas fa-map-marked-alt" style={{fontSize:'1.8rem',color:'#ff9800'}}></i>
                </div>
              </div>
            </div>

            <div style={{background:'white',padding:'20px',borderRadius:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <p style={{color:'#999',fontSize:'0.9rem',margin:'0 0 5px 0'}}>Peak Hour Status</p>
                  <h3 style={{color:getCrowdColor(stats.peakHourCrowd),fontSize:'2rem',margin:0}}>{stats.peakHourCrowd}</h3>
                </div>
                <div style={{background:'#fce4ec',width:'60px',height:'60px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <i className="fas fa-exclamation-triangle" style={{fontSize:'1.8rem',color:'#e91e63'}}></i>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(500px, 1fr))',gap:'30px',marginBottom:'30px'}}>
            
            {/* Recent ML Predictions */}
            <div style={{background:'white',borderRadius:'15px',padding:'25px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                <h3 style={{color:'#333',margin:0}}>
                  <i className="fas fa-brain" style={{color:'#9c27b0',marginRight:'10px'}}></i>
                  Recent ML Predictions
                </h3>
                <button className="btn btn-sm btn-outline" style={{fontSize:'0.85rem'}}>
                  <i className="fas fa-download"></i> Export
                </button>
              </div>

              <div style={{maxHeight:'400px',overflowY:'auto'}}>
                {recentPredictions.map((pred, idx) => (
                  <div key={idx} style={{
                    display:'flex',
                    justifyContent:'space-between',
                    alignItems:'center',
                    padding:'15px',
                    background:'#f9f9f9',
                    borderRadius:'10px',
                    marginBottom:'10px',
                    borderLeft:`4px solid ${getCrowdColor(pred.crowd)}`
                  }}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'5px'}}>
                        <span style={{color:'#999',fontSize:'0.85rem'}}>{pred.time}</span>
                        <span style={{background:'#e3f2fd',color:'#2196f3',padding:'2px 8px',borderRadius:'10px',fontSize:'0.75rem',fontWeight:'600'}}>
                          {pred.bus}
                        </span>
                      </div>
                      <p style={{color:'#333',fontWeight:'500',margin:'0 0 5px 0'}}>{pred.stop}</p>
                      <div style={{display:'flex',gap:'15px',fontSize:'0.85rem'}}>
                        <span style={{color:getCrowdColor(pred.crowd),fontWeight:'600'}}>
                          {pred.crowd}
                        </span>
                        <span style={{color:'#999'}}>
                          Confidence: {pred.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fleet Status */}
            <div style={{background:'white',borderRadius:'15px',padding:'25px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                <h3 style={{color:'#333',margin:0}}>
                  <i className="fas fa-bus-alt" style={{color:'#4caf50',marginRight:'10px'}}></i>
                  Fleet Performance
                </h3>
                <button className="btn btn-sm btn-outline" style={{fontSize:'0.85rem'}}>
                  <i className="fas fa-filter"></i> Filter
                </button>
              </div>

              <div style={{maxHeight:'400px',overflowY:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{background:'#f5f5f5',borderRadius:'8px'}}>
                      <th style={{padding:'12px 8px',textAlign:'left',color:'#666',fontSize:'0.85rem',fontWeight:'600'}}>Route</th>
                      <th style={{padding:'12px 8px',textAlign:'center',color:'#666',fontSize:'0.85rem',fontWeight:'600'}}>Active</th>
                      <th style={{padding:'12px 8px',textAlign:'center',color:'#666',fontSize:'0.85rem',fontWeight:'600'}}>Delay</th>
                      <th style={{padding:'12px 8px',textAlign:'center',color:'#666',fontSize:'0.85rem',fontWeight:'600'}}>Occupancy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fleetStatus.map((fleet, idx) => (
                      <tr key={idx} style={{borderBottom:'1px solid #f0f0f0'}}>
                        <td style={{padding:'12px 8px'}}>
                          <span style={{fontWeight:'600',color:'#333'}}>{fleet.route}</span>
                        </td>
                        <td style={{padding:'12px 8px',textAlign:'center'}}>
                          <span style={{
                            background:getStatusColor((fleet.active/fleet.buses)*100),
                            color:'white',
                            padding:'4px 8px',
                            borderRadius:'10px',
                            fontSize:'0.85rem',
                            fontWeight:'600'
                          }}>
                            {fleet.active}/{fleet.buses}
                          </span>
                        </td>
                        <td style={{padding:'12px 8px',textAlign:'center'}}>
                          <span style={{color:fleet.avgDelay > 5 ? '#f44336' : '#4caf50',fontWeight:'500'}}>
                            {fleet.avgDelay} min
                          </span>
                        </td>
                        <td style={{padding:'12px 8px',textAlign:'center'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'8px',justifyContent:'center'}}>
                            <div style={{flex:1,maxWidth:'80px',height:'8px',background:'#e0e0e0',borderRadius:'4px',overflow:'hidden'}}>
                              <div style={{width:`${fleet.occupancy}%`,height:'100%',background:getCrowdColor(fleet.occupancy > 80 ? 'Very High' : fleet.occupancy > 60 ? 'High' : fleet.occupancy > 40 ? 'Medium' : 'Low')}}></div>
                            </div>
                            <span style={{fontSize:'0.85rem',fontWeight:'600',color:'#333'}}>{fleet.occupancy}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ML Model Information */}
          <div style={{background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',borderRadius:'15px',padding:'30px',color:'white',marginBottom:'30px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'15px',marginBottom:'20px'}}>
              <i className="fas fa-brain" style={{fontSize:'3rem'}}></i>
              <div>
                <h3 style={{margin:'0 0 5px 0',fontSize:'1.8rem'}}>Machine Learning Model Performance</h3>
                <p style={{margin:0,opacity:0.9}}>Random Forest Classifier for Crowd Prediction</p>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:'20px'}}>
              <div style={{background:'rgba(255,255,255,0.1)',padding:'20px',borderRadius:'10px'}}>
                <h4 style={{margin:'0 0 10px 0'}}>Overall Accuracy</h4>
                <p style={{fontSize:'2.5rem',margin:'10px 0',fontWeight:'700'}}>66.83%</p>
                <p style={{fontSize:'0.9rem',opacity:0.9,margin:0}}>Tested on 3,000 samples</p>
              </div>

              <div style={{background:'rgba(255,255,255,0.1)',padding:'20px',borderRadius:'10px'}}>
                <h4 style={{margin:'0 0 10px 0'}}>Training Data</h4>
                <p style={{fontSize:'2.5rem',margin:'10px 0',fontWeight:'700'}}>15,000</p>
                <p style={{fontSize:'0.9rem',opacity:0.9,margin:0}}>Synthetic BMTC samples</p>
              </div>

              <div style={{background:'rgba(255,255,255,0.1)',padding:'20px',borderRadius:'10px'}}>
                <h4 style={{margin:'0 0 10px 0'}}>Features Used</h4>
                <p style={{fontSize:'2.5rem',margin:'10px 0',fontWeight:'700'}}>5</p>
                <p style={{fontSize:'0.9rem',opacity:0.9,margin:0}}>Time, location, rush hour</p>
              </div>

              <div style={{background:'rgba(255,255,255,0.1)',padding:'20px',borderRadius:'10px'}}>
                <h4 style={{margin:'0 0 10px 0'}}>Predictions/Day</h4>
                <p style={{fontSize:'2.5rem',margin:'10px 0',fontWeight:'700'}}>{stats.predictionsToday}</p>
                <p style={{fontSize:'0.9rem',opacity:0.9,margin:0}}>Real-time inference</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',gap:'20px'}}>
            <button className="btn btn-primary btn-block" onClick={() => navigate('/crowd-prediction')}>
              <i className="fas fa-chart-line"></i> View Crowd Predictions
            </button>
            <button className="btn btn-primary btn-block" onClick={() => navigate('/track-bus')}>
              <i className="fas fa-bus"></i> Track Fleet
            </button>
            <button className="btn btn-primary btn-block" onClick={() => navigate('/search-route')}>
              <i className="fas fa-route"></i> Route Analytics
            </button>
            <button className="btn btn-primary btn-block" onClick={() => window.open('http://localhost:5000/model/info')}>
              <i className="fas fa-info-circle"></i> ML Model Details
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
