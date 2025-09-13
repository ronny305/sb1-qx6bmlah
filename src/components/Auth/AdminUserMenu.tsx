import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminUserMenu: React.FC = () => {
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
    console.log('AdminUserMenu: handleSignOut called');
    
    if (isSigningOut) {
      console.log('AdminUserMenu: Already signing out, ignoring');
      return;
    }
    
    setIsSigningOut(true);
    setIsOpen(false);

    try {
      console.log('AdminUserMenu: Calling signOut...');
      const { error } = await signOut();

      if (error) {
        console.error('AdminUserMenu: Sign out error:', error);
        console.error('AdminUserMenu: Sign out error, but navigating anyway:', error);
      }
      
      console.log('AdminUserMenu: Navigating to home page');
      navigate('/');
    } catch (error) {
      console.error('AdminUserMenu: Exception during sign out:', error);
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
        className="flex items-center space-x-3 text-gray-700 hover:text-red-600 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
      >
        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
          <User size={18} className="text-white" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {user.email?.split('@')[0]}
          </p>
          <p className="text-xs text-gray-500">Administrator</p>
        </div>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
            <p className="text-xs text-gray-500">Administrator Account</p>
          </div>
          
          <button
            onClick={() => {
              setIsOpen(false);
              // You can add profile/settings functionality here later
            }}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Settings size={16} className="mr-3" />
            Account Settings
          </button>
          
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <LogOut size={16} className="mr-3" />
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUserMenu;