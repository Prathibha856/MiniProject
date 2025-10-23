import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [favorites, setFavorites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const savedLang = localStorage.getItem('bmtc_language') || 'en';
    const savedFavs = JSON.parse(localStorage.getItem('bmtc_favorites') || '[]');
    const savedSearches = JSON.parse(localStorage.getItem('bmtc_recent_searches') || '[]');
    const savedNotifs = JSON.parse(localStorage.getItem('bmtc_notifications') || '[]');
    
    setLanguage(savedLang);
    setFavorites(savedFavs);
    setRecentSearches(savedSearches);
    setNotifications(savedNotifs);
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('bmtc_language', lang);
  };

  const addFavorite = (routeNumber) => {
    if (!favorites.includes(routeNumber)) {
      const newFavs = [...favorites, routeNumber];
      setFavorites(newFavs);
      localStorage.setItem('bmtc_favorites', JSON.stringify(newFavs));
    }
  };

  const removeFavorite = (routeNumber) => {
    const newFavs = favorites.filter(f => f !== routeNumber);
    setFavorites(newFavs);
    localStorage.setItem('bmtc_favorites', JSON.stringify(newFavs));
  };

  const value = {
    language, changeLanguage,
    favorites, addFavorite, removeFavorite,
    recentSearches, setRecentSearches,
    notifications, setNotifications
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
