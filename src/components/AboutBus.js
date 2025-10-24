import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../styles/common-page.css';

const AboutBus = () => {
  const navigate = useNavigate();
  const { language } = useApp();
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, number, route

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    filterRoutes();
  }, [searchQuery, filterType, routes]);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      // Try to load routes from GTFS data
      const response = await fetch('/data/routes.json');
      if (response.ok) {
        const data = await response.json();
        setRoutes(data);
      } else {
        // Fallback to sample routes
        loadSampleRoutes();
      }
    } catch (error) {
      console.log('Loading sample routes...');
      loadSampleRoutes();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleRoutes = () => {
    // Sample BMTC routes from GTFS data
    const sampleRoutes = [
      { busNumber: '335E', routeName: 'Kempegowda Bus Station - Kadugodi', routeId: '335E', category: 'Ordinary' },
      { busNumber: '500D', routeName: 'Kempegowda Bus Station - Banashankari', routeId: '500D', category: 'Ordinary' },
      { busNumber: '215-NE', routeName: '11th Block Anjanapura ⇔ Vidhana Soudha', routeId: '215-NE ANP11-KMT-VSD', category: 'Ordinary' },
      { busNumber: '402-B', routeName: '5th Phase Yelahanka New Town ⇔ Shivajinagara Bus Station', routeId: '402-B YSTF-VSD-SBS', category: 'Ordinary' },
      { busNumber: '280-F', routeName: '5th Phase Yelahanka New Town ⇔ Hosakote Bus Stand', routeId: '280-F YSTF-HSK', category: 'Ordinary' },
      { busNumber: '507-D', routeName: '5th Phase Yelahanka New Town ⇔ KR Pura Govt Hospital', routeId: '507-D', category: 'Ordinary' },
      { busNumber: '285-MC', routeName: '5th Phase Yelahanka New Town ⇔ Doddaballapura Bus Stand', routeId: '285-MC YSTF-NES-DBP', category: 'Ordinary' },
      { busNumber: 'G-9', routeName: '5th Phase Yelahanka New Town ⇔ Shivajinagara Bus Station', routeId: 'G-9 SBS-YSTF', category: 'Vayu Vajra' },
      { busNumber: '302', routeName: '80 feet Road Kalyananagara ⇔ Shivajinagara Bus Station', routeId: '302 KLN-SBS', category: 'Ordinary' },
      { busNumber: 'BC-7C', routeName: '8th Mile Dasarahalli ⇔ 8th Mile Dasarahalli', routeId: 'BC-7C', category: 'Big Circle' },
      { busNumber: '250-DD', routeName: '8th Mile Dasarahalli ⇔ 8th Mile Dasarahalli Arrival', routeId: '250-DD', category: 'Ordinary' },
      { busNumber: 'MF-25', routeName: '8th Mile Dasarahalli ⇔ Thippennahalli', routeId: 'MF-25', category: 'Ordinary' },
      { busNumber: '60-A', routeName: '9th Block Jayanagara ⇔ Chandra Layout', routeId: '60-A CLO-JNN', category: 'Ordinary' },
      { busNumber: '237-J', routeName: '9th Block Jayanagara ⇔ Panchasheela Nagara', routeId: '237-J', category: 'Ordinary' },
      { busNumber: '347-K', routeName: 'AECS Layout Singasandra ⇔ KR Market', routeId: '347-K', category: 'Ordinary' },
      { busNumber: '347-N', routeName: 'AECS Layout Singasandra ⇔ Kempegowda Bus Station', routeId: '347-N', category: 'Ordinary' },
      { busNumber: '45-G', routeName: 'AGS Layout Cross ⇔ Kempegowda Bus Station', routeId: '45-G AGSLC-KBS', category: 'Ordinary' },
      { busNumber: '401-AK', routeName: 'Abbigere ⇔ Peenya 2nd stage', routeId: '401-AK ABG-PSS', category: 'Ordinary' },
      { busNumber: 'V-250SB', routeName: 'Acharya Institute of Technology ⇔ KR Market', routeId: 'V-250SB', category: 'Volvo' },
      { busNumber: '258-N', routeName: 'Adarshanagara Water Tank ⇔ Kempegowda Bus Station', routeId: '258-N ASDW-VSD-KBS', category: 'Ordinary' },
      { busNumber: 'Vivek_Test14', routeName: '10th Cross Lingadhiranahalli ⇔ 10th Cross Magadi Road', routeId: 'Vivek_Test14', category: 'Test Route' },
      { busNumber: 'VLO1-KGR', routeName: '1st Block Vishweshwaraiah Layout ⇔ Kengeri Bus Station', routeId: 'VLO1-KGR', category: 'Ordinary' },
      { busNumber: '2KVP-JHE', routeName: '2nd stage Kuvempunagara ⇔ Jalahalli East', routeId: '2KVP-JHE', category: 'Ordinary' },
      { busNumber: '300-E', routeName: 'ADMC Quarters Office ⇔ KR Pura Govt Hospital', routeId: '300-E ADMC-KRPGH', category: 'Ordinary' },
      { busNumber: '401', routeName: 'Adishwara Bombay Dying ⇔ Yelahanka Old Town', routeId: '401 ABDYNG-YHK', category: 'Ordinary' }
    ];
    setRoutes(sampleRoutes);
  };

  const filterRoutes = () => {
    if (!searchQuery.trim()) {
      setFilteredRoutes(routes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = routes.filter(route => {
      switch (filterType) {
        case 'number':
          return route.busNumber.toLowerCase().includes(query);
        case 'route':
          return route.routeName.toLowerCase().includes(query);
        default:
          return (
            route.busNumber.toLowerCase().includes(query) ||
            route.routeName.toLowerCase().includes(query) ||
            route.routeId.toLowerCase().includes(query)
          );
      }
    });

    setFilteredRoutes(filtered);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Volvo': return 'fa-bus';
      case 'Vayu Vajra': return 'fa-rocket';
      case 'Big Circle': return 'fa-circle-notch';
      default: return 'fa-bus';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Volvo': return '#9c27b0';
      case 'Vayu Vajra': return '#ff5722';
      case 'Big Circle': return '#2196f3';
      default: return '#4caf50';
    }
  };

  const t = {
    en: {
      title: 'About Bus',
      subtitle: 'Complete list of BMTC buses and routes',
      search: 'Search',
      searchPlaceholder: 'Search by bus number or route name...',
      all: 'All',
      byNumber: 'By Number',
      byRoute: 'By Route',
      totalBuses: 'Total Buses',
      busNumber: 'Bus Number',
      routeName: 'Route Name',
      routeId: 'Route ID',
      category: 'Category',
      noBuses: 'No buses found',
      tryDifferent: 'Try a different search term',
      popular: 'Popular Routes',
      ordinary: 'Ordinary',
      volvo: 'Volvo AC',
      vayuVajra: 'Vayu Vajra (Airport)',
      bigCircle: 'Big Circle Routes'
    },
    kn: {
      title: 'ಬಸ್ ಬಗ್ಗೆ',
      subtitle: 'ಬಿಎಮ್‌ಟಿಸಿ ಬಸ್‌ಗಳು ಮತ್ತು ಮಾರ್ಗಗಳ ಸಂಪೂರ್ಣ ಪಟ್ಟಿ',
      search: 'ಹುಡುಕಿ',
      totalBuses: 'ಒಟ್ಟು ಬಸ್‌ಗಳು'
    },
    hi: {
      title: 'बस के बारे में',
      subtitle: 'बीएमटीसी बसों और मार्गों की पूरी सूची',
      search: 'खोजें',
      totalBuses: 'कुल बसें'
    }
  };

  const text = t[language];

  return (
    <div>
      {/* Header */}
      <header className="page-header">
        <div className="page-header-container">
          <div className="page-header-left">
            <img src="/assets/bmtc-logo.png" alt="BusFlow" className="header-logo" onClick={() => navigate('/')} onError={e => e.target.style.display='none'} />
            <h2>{text.title}</h2>
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
              <i className="fas fa-info-circle" style={{color:'#2196f3'}}></i>
            </div>
            <h2 style={{color:'#333',marginBottom:'10px'}}>{text.subtitle}</h2>
            <p style={{color:'#666'}}>Find information about all BMTC buses available in Bangalore</p>
          </div>

          {/* Stats Cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',gap:'20px',marginBottom:'30px'}}>
            <div style={{background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',padding:'25px',borderRadius:'15px',color:'white',textAlign:'center',boxShadow:'0 4px 15px rgba(102,126,234,0.3)'}}>
              <i className="fas fa-bus" style={{fontSize:'3rem',marginBottom:'10px',opacity:0.9}}></i>
              <h3 style={{fontSize:'2.5rem',margin:'10px 0',fontWeight:'700'}}>{filteredRoutes.length}</h3>
              <p style={{opacity:0.9,fontSize:'1.1rem'}}>{text.totalBuses}</p>
            </div>

            <div style={{background:'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',padding:'25px',borderRadius:'15px',color:'white',textAlign:'center',boxShadow:'0 4px 15px rgba(240,147,251,0.3)'}}>
              <i className="fas fa-route" style={{fontSize:'3rem',marginBottom:'10px',opacity:0.9}}></i>
              <h3 style={{fontSize:'2.5rem',margin:'10px 0',fontWeight:'700'}}>250+</h3>
              <p style={{opacity:0.9,fontSize:'1.1rem'}}>Routes Covered</p>
            </div>

            <div style={{background:'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',padding:'25px',borderRadius:'15px',color:'white',textAlign:'center',boxShadow:'0 4px 15px rgba(79,172,254,0.3)'}}>
              <i className="fas fa-map-marked-alt" style={{fontSize:'3rem',marginBottom:'10px',opacity:0.9}}></i>
              <h3 style={{fontSize:'2.5rem',margin:'10px 0',fontWeight:'700'}}>9,360</h3>
              <p style={{opacity:0.9,fontSize:'1.1rem'}}>Bus Stops</p>
            </div>

            <div style={{background:'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',padding:'25px',borderRadius:'15px',color:'white',textAlign:'center',boxShadow:'0 4px 15px rgba(67,233,123,0.3)'}}>
              <i className="fas fa-city" style={{fontSize:'3rem',marginBottom:'10px',opacity:0.9}}></i>
              <h3 style={{fontSize:'2.5rem',margin:'10px 0',fontWeight:'700'}}>All</h3>
              <p style={{opacity:0.9,fontSize:'1.1rem'}}>Bangalore Zones</p>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div style={{background:'white',padding:'30px',borderRadius:'15px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)',marginBottom:'30px'}}>
            <div style={{display:'flex',gap:'15px',marginBottom:'20px',flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:'300px'}}>
                <input
                  type="text"
                  className="form-control"
                  placeholder={text.searchPlaceholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{fontSize:'1.1rem',padding:'12px 20px'}}
                />
              </div>
              <div style={{display:'flex',gap:'10px'}}>
                <button
                  className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setFilterType('all')}
                  style={{padding:'12px 20px'}}
                >
                  <i className="fas fa-list"></i> {text.all}
                </button>
                <button
                  className={`btn ${filterType === 'number' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setFilterType('number')}
                  style={{padding:'12px 20px'}}
                >
                  <i className="fas fa-hashtag"></i> {text.byNumber}
                </button>
                <button
                  className={`btn ${filterType === 'route' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setFilterType('route')}
                  style={{padding:'12px 20px'}}
                >
                  <i className="fas fa-route"></i> {text.byRoute}
                </button>
              </div>
            </div>

            {/* Category Legend */}
            <div style={{display:'flex',gap:'15px',flexWrap:'wrap',padding:'15px',background:'#f9f9f9',borderRadius:'10px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#4caf50'}}></div>
                <span style={{fontSize:'0.9rem',color:'#666'}}>Ordinary</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#9c27b0'}}></div>
                <span style={{fontSize:'0.9rem',color:'#666'}}>Volvo AC</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#ff5722'}}></div>
                <span style={{fontSize:'0.9rem',color:'#666'}}>Vayu Vajra</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#2196f3'}}></div>
                <span style={{fontSize:'0.9rem',color:'#666'}}>Big Circle</span>
              </div>
            </div>
          </div>

          {/* Bus List */}
          {loading ? (
            <div style={{textAlign:'center',padding:'60px',background:'white',borderRadius:'15px'}}>
              <i className="fas fa-spinner fa-spin" style={{fontSize:'3rem',color:'#2196f3',marginBottom:'20px'}}></i>
              <p style={{color:'#666',fontSize:'1.2rem'}}>Loading buses...</p>
            </div>
          ) : filteredRoutes.length > 0 ? (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(350px, 1fr))',gap:'20px'}}>
              {filteredRoutes.map((route, idx) => (
                <div
                  key={idx}
                  style={{
                    background:'white',
                    borderRadius:'12px',
                    padding:'20px',
                    boxShadow:'0 2px 8px rgba(0,0,0,0.1)',
                    borderLeft:`4px solid ${getCategoryColor(route.category)}`,
                    transition:'all 0.3s ease',
                    cursor:'pointer'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                  onClick={() => navigate(`/search-route?bus=${route.busNumber}`)}
                >
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:'15px'}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
                        <div style={{
                          background:getCategoryColor(route.category),
                          color:'white',
                          padding:'8px 15px',
                          borderRadius:'20px',
                          fontWeight:'700',
                          fontSize:'1.1rem'
                        }}>
                          <i className={`fas ${getCategoryIcon(route.category)}`} style={{marginRight:'5px'}}></i>
                          {route.busNumber}
                        </div>
                        <span style={{
                          background:'#f5f5f5',
                          color:'#666',
                          padding:'4px 10px',
                          borderRadius:'12px',
                          fontSize:'0.75rem',
                          fontWeight:'600'
                        }}>
                          {route.category}
                        </span>
                      </div>
                      <h4 style={{color:'#333',marginBottom:'8px',fontSize:'0.95rem',lineHeight:'1.4'}}>
                        {route.routeName}
                      </h4>
                      <p style={{color:'#999',fontSize:'0.85rem',margin:0}}>
                        <i className="fas fa-id-card" style={{marginRight:'5px'}}></i>
                        ID: {route.routeId}
                      </p>
                    </div>
                  </div>

                  <div style={{display:'flex',gap:'10px',marginTop:'15px'}}>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/journey-planner?route=${route.busNumber}`);
                      }}
                      style={{flex:1,fontSize:'0.85rem',padding:'8px'}}
                    >
                      <i className="fas fa-route"></i> Plan Journey
                    </button>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/track-bus?bus=${route.busNumber}`);
                      }}
                      style={{flex:1,fontSize:'0.85rem',padding:'8px'}}
                    >
                      <i className="fas fa-map-marker-alt"></i> Track
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{textAlign:'center',padding:'60px',background:'white',borderRadius:'15px'}}>
              <i className="fas fa-search" style={{fontSize:'4rem',color:'#ddd',marginBottom:'20px'}}></i>
              <h3 style={{color:'#666',marginBottom:'10px'}}>{text.noBuses}</h3>
              <p style={{color:'#999'}}>{text.tryDifferent}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AboutBus;
