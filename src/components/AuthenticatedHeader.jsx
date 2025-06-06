
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from '../context/AuthContext'; 
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'; 

const AuthenticatedHeader = ({ pageTitle, onToggleSidebar }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { logout } = useAuth(); 

  const handleLogoutClick = () => {
    logout();

  };

  return (
    <header className="bg-white bg-opacity-90 shadow-sm py-3 px-6 flex justify-between items-center sticky top-0 z-30 backdrop-blur-sm">
      <div className="flex items-center space-x-4 min-w-0">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar} 
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
            aria-label="Alternar menu lateral"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate" title={pageTitle}>
          {pageTitle || "Dashboard"} 
        </h1>
      </div>
      <div className="relative">
        <button 
          onClick={() => setShowUserMenu(!showUserMenu)} 
          className="flex items-center space-x-2 focus:outline-none group" 
          aria-label="Menu do usuário"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-lg font-medium shadow-md group-hover:shadow-lg transition-all">
            {Cookies.get("userName")?.charAt(0).toUpperCase() || "U"}
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 transition-transform ${showUserMenu ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 divide-y divide-gray-100">
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{Cookies.get("userName") || "Usuário"}</p>
            </div>

            <div className="py-1">
              <Link 
                to="/configuracoes" 
                onClick={() => setShowUserMenu(false)} 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Dados da Conta</span>
              </Link>
            </div>
            <div className="py-1">
              <button onClick={handleLogoutClick} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sair</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

AuthenticatedHeader.propTypes = {
  pageTitle: PropTypes.string,
  onToggleSidebar: PropTypes.func,
};

export default AuthenticatedHeader;