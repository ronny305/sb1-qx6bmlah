import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, ShoppingCart, Menu, FileText } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useQuotePanel } from '../../contexts/QuotePanelContext';

const MobileBottomNavBar: React.FC = () => {
  const { state: cartState } = useCart();
  const { user } = useAuth();
  const { setIsQuotePanelOpen } = useQuotePanel();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleQuoteClick = () => {
    setIsQuotePanelOpen(true);
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center py-2 px-3 ${
            isActive('/') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>

        {/* User/Account */}
        <Link
          to={user ? "/profile" : "/login"}
          className={`flex flex-col items-center py-2 px-3 ${
            isActive('/profile') || isActive('/login') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <User size={24} />
          <span className="text-xs mt-1">{user ? 'Account' : 'Sign in'}</span>
        </Link>

        {/* Cart/Quote */}
        <button
          onClick={handleQuoteClick}
          className="flex flex-col items-center py-2 px-3 relative text-gray-600"
        >
          <div className="relative">
            <FileText size={24} />
            {cartState.totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {cartState.totalItems > 99 ? '99+' : cartState.totalItems}
              </span>
            )}
          </div>
          <span className="text-xs mt-1">Quote</span>
        </button>

        {/* Menu */}
        <Link
          to="/contact"
          className={`flex flex-col items-center py-2 px-3 ${
            isActive('/contact') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <Menu size={24} />
          <span className="text-xs mt-1">Menu</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileBottomNavBar;