import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    console.log('UserMenu: handleSignOut called');
    
    if (isSigningOut) {
      console.log('UserMenu: Already signing out, ignoring');
      return;
    }
    
    setIsSigningOut(true);
    setIsOpen(false);

    try {
      console.log('UserMenu: Calling signOut...');
      const { error } = await signOut();

      if (error) {
        console.error('UserMenu: Sign out error:', error);
        console.error('UserMenu: Sign out error, but navigating anyway:', error);
      }
      
      console.log('UserMenu: Navigating to home page');
      navigate('/');
    } catch (error) {
      console.error('UserMenu: Exception during sign out:', error);
      navigate('/');
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors duration-200"
      >
        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
          <User size={18} />
        </div>
        <span className="hidden md:block font-medium">
          {user.email?.split('@')[0]}
        </span>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
          </div>
          
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Settings size={16} className="mr-3" />
            Profile Settings
          </Link>
          
          {localStorage.getItem("isAdmin") === 'true' && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Shield size={16} className="mr-3" />
              Admin Dashboard
            </Link>
          )}
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} className="mr-3" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;