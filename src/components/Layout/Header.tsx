// src/components/Layout/Header.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, FileText, MapPin, Phone } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useQuotePanel } from '../../contexts/QuotePanelContext';
import UserMenu from '../Auth/UserMenu';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state: cartState } = useCart();
  const { user } = useAuth();
  const { setIsQuotePanelOpen } = useQuotePanel();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Production Equipment', path: '/new-production-equipment' },
    { name: 'Home EC', path: '/home-ec-equipment' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Main Header */}
      <header className="bg-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/onestoplogo16-v2.png"
                alt="One Stop Production Rentals"
                className="h-[60px] w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center justify-center space-x-12">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`font-medium text-base transition-colors duration-200 hover:text-red-400 ${
                    isActive(item.path) ? 'text-red-400' : 'text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Desktop Quote Link */}
              <button
                onClick={() => setIsQuotePanelOpen(true)}
                className="flex items-center space-x-2 font-medium text-base transition-colors duration-200 hover:text-red-400 text-white"
              >
                <FileText size={20} />
                {cartState.totalItems > 0 && (
                  <span className="bg-red-600 text-white text-sm font-bold px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                    {cartState.totalItems > 99 ? '99+' : cartState.totalItems}
                  </span>
                )}
                <span>Quote</span>
              </button>

              {/* Desktop User Menu */}
              {user && <UserMenu />}
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              {user && (
                <div className="mr-4">
                  <UserMenu />
                </div>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-red-400"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-600 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 text-lg font-medium text-center transition-colors duration-200 hover:text-red-400 ${
                    isActive(item.path) ? 'text-red-400' : 'text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Quote Link */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsQuotePanelOpen(true);
                }}
                className="flex items-center justify-center space-x-2 py-2 text-lg font-medium transition-colors duration-200 hover:text-red-400 text-white"
              >
                <FileText size={24} />
                {cartState.totalItems > 0 && (
                  <span className="bg-red-600 text-white text-sm font-bold px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                    {cartState.totalItems > 99 ? '99+' : cartState.totalItems}
                  </span>
                )}
                <span>Quote</span>
              </button>

              {!user && (
                <div className="border-t border-gray-600 pt-4 mt-4">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 text-xl font-medium text-center transition-colors duration-200 text-white hover:text-red-400"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;