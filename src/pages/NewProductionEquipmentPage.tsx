import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Minus, ArrowLeft, Camera, Mic, Lightbulb, Wrench, ChevronRight } from 'lucide-react';
import { fetchEquipmentByMainCategory } from '../lib/equipment';
import { Equipment } from '../types';
import { useCart } from '../contexts/CartContext';
import { useQuotePanel } from '../contexts/QuotePanelContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Link } from 'react-router-dom';

const NewProductionEquipmentPage: React.FC = () => {
  const { state, addItem, removeItem, updateQuantity } = useCart();
  const { isQuotePanelOpen, setIsQuotePanelOpen, setHasBeenManuallyClosed } = useQuotePanel();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Define custom category order
  const CUSTOM_CATEGORY_ORDER = ['video', 'audio', 'lighting', 'general'];

  // Define category icons and colors
  const categoryConfig = {
    video: { icon: Camera, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50', textColor: 'text-red-700' },
    audio: { icon: Mic, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50', textColor: 'text-red-700' },
    lighting: { icon: Lightbulb, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50', textColor: 'text-red-700' },
    general: { icon: Wrench, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50', textColor: 'text-red-700' }
  };

  // Fetch equipment data from Supabase
  useEffect(() => {
    const loadEquipment = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEquipmentByMainCategory('production');
        setEquipment(data);
        console.log('Fetched production equipment:', data);
      } catch (err) {
        setError('Failed to load equipment. Please try again.');
        console.error('Error loading equipment:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEquipment();
  }, []);

  // Filter equipment based on search
  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [equipment, searchTerm]);

  // Group equipment by category and sort according to custom order
  const groupedEquipment = useMemo(() => {
    const grouped = filteredEquipment.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, Equipment[]>);

    // Sort each category's items by name
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [filteredEquipment]);

  // Sort categories according to custom order
  const sortedCategories = useMemo(() => {
    const categories = Object.keys(groupedEquipment);
    return categories.sort((a, b) => {
      const indexA = CUSTOM_CATEGORY_ORDER.indexOf(a);
      const indexB = CUSTOM_CATEGORY_ORDER.indexOf(b);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [groupedEquipment]);

  const getItemQuantity = (itemId: number): number => {
    const cartItem = state.items.find(item => item.equipment.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddItem = (item: Equipment) => {
    addItem(item);
    
    // Auto-open quote panel on desktop when item is added
    if (isDesktop) {
      setHasBeenManuallyClosed(false);
      setIsQuotePanelOpen(true);
    }
  };

  const handleIncrement = (itemId: number) => {
    const currentQuantity = getItemQuantity(itemId);
    updateQuantity(itemId, currentQuantity + 1);
  };

  const handleDecrement = (itemId: number) => {
    const currentQuantity = getItemQuantity(itemId);
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
    } else {
      removeItem(itemId);
    }
  };

  const handleQuantityChange = (itemId: number, value: string) => {
    const newQuantity = parseInt(value);
    if (value === '' || newQuantity <= 0) {
      removeItem(itemId);
    } else if (!isNaN(newQuantity)) {
      updateQuantity(itemId, newQuantity);
    }
  };

  // Smooth scroll to category section
  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(categoryId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Render quick navigation buttons
  const renderQuickNavButtons = (isMobile: boolean) => {
    return sortedCategories.map((category) => {
      const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.general;
      const IconComponent = config.icon;
      
      return (
        <button
          key={category}
          onClick={() => scrollToCategory(category)}
          className={`${
            isMobile 
              ? 'flex-shrink-0 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:shadow-md hover:border-gray-400'
              : 'flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300'
          } transition-all duration-200`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${config.bgColor}`}>
            <IconComponent size={14} className={config.textColor} />
          </div>
          <span className={`font-medium ${isMobile ? 'text-sm' : 'text-sm'} text-gray-900`}>
            {getCategoryDisplayName(category)}
          </span>
        </button>
      );
    });
  };


  const getCategoryDisplayName = (category: string) => {
    switch (category.toLowerCase()) {
      case 'video': return 'Video Production';
      case 'audio': return 'Audio Equipment';
      case 'lighting': return 'Lighting';
      case 'general': return 'General Equipment';
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading production equipment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-4 py-2 rounded-lg">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-700">
              <ArrowLeft size={24} />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">Production Equipment</h1>
              <p className="text-sm text-gray-600">Professional equipment for filming</p>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Mobile Quick Navigation */}
          <div className="mt-3 border-t border-gray-200 pt-3">
            <p className="text-xs font-medium text-gray-700 mb-2">Quick Navigation</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {renderQuickNavButtons(true)}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Production Equipment</h1>
              <p className="text-gray-600 mt-1">Professional equipment for video, audio, lighting, and general production needs</p>
            </div>
            <div className="w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`max-w-7xl mx-auto px-4 lg:px-8 ${isQuotePanelOpen ? 'lg:pr-96' : ''} transition-all duration-300`}>
        {/* Desktop Quick Navigation - Top Sticky Bar */}
        <div className="hidden lg:block sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200 mb-6 -mx-4 lg:-mx-8">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Quick Navigation</h3>
              <Link
                to="/home-ec-equipment"
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm"
              >
                Browse Home Ec Equipment
                <ChevronRight size={16} className="ml-2" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 pb-2">
              {renderQuickNavButtons(false)}
            </div>
          </div>
        </div>

        {/* Equipment Categories Display */}
        <div>
          {sortedCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedCategories.map((category) => {
                const categoryItems = groupedEquipment[category];
                const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.general;
                const IconComponent = config.icon;

                return (
                  <div 
                    key={category} 
                    id={category}
                    // id={category}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-36 lg:scroll-mt-40"
                  >
                    {/* Category Header */}
                    <div className={`bg-gradient-to-r ${config.color} p-4 lg:p-6`}>
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                            <IconComponent size={24} />
                          </div>
                          <div>
                            <h2 className="text-xl lg:text-2xl font-bold">{getCategoryDisplayName(category)}</h2>
                            <p className="text-sm text-white text-opacity-90">
                              {categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''} available
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={24} className="text-white text-opacity-70" />
                      </div>
                    </div>

                    {/* Horizontal Scrolling Equipment List */}
                    <div className="p-4 lg:p-6">
                      <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth lg:grid lg:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] lg:overflow-visible">
                        {categoryItems.map((item) => {
                          const quantity = getItemQuantity(item.id);
                          return (
                            <div
                              key={item.id}
                              className="flex-shrink-0 w-48 lg:flex-shrink lg:w-auto bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 group"
                            >
                              {/* Equipment Image */}
                              <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden mb-4">
                                <img
                                  src={item.image || '/api/placeholder/256/160'}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              </div>

                              {/* Equipment Info */}
                              <div className="mb-4">
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                                  {item.name}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                  {item.description}
                                </p>
                                
                                {/* Specifications */}
                                {item.specifications && item.specifications.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {item.specifications.slice(0, 2).map((spec, index) => (
                                      <span key={index} className={`inline-block px-2 py-1 ${config.bgColor} ${config.textColor} text-xs rounded-full`}>
                                        {spec}
                                      </span>
                                    ))}
                                    {item.specifications.length > 2 && (
                                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                        +{item.specifications.length - 2} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Quantity Controls */}
                              <div className="border-t border-gray-100 pt-4">
                                {quantity === 0 ? (
                                  <button
                                    onClick={() => handleAddItem(item)}
                                    className={`w-full bg-gradient-to-r ${config.color} hover:opacity-90 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center`}
                                  >
                                    <Plus size={18} className="mr-2" />
                                    Add to Quote
                                  </button>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                                      <button
                                        onClick={() => handleDecrement(item.id)}
                                        className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                                      >
                                        <Minus size={16} />
                                      </button>
                                      <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                        className="w-16 text-center font-bold text-gray-900 bg-transparent border-none outline-none"
                                      />
                                      <button
                                        onClick={() => handleIncrement(item.id)}
                                        className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors"
                                      >
                                        <Plus size={16} />
                                      </button>
                                    </div>
                                    <div className="text-center">
                                      <span className="text-sm text-gray-600">
                                        {item.unitsPerItem && item.unitsPerItem > 1 
                                          ? `${quantity * item.unitsPerItem} total units`
                                          : 'Added to quote'
                                        }
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Category Navigation Links */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-500">
                          Showing {categoryItems.length} items
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          )}
        </div>

      </div>

      {/* Bottom spacing for mobile nav */}
      <div className="h-16 lg:hidden"></div>
    </div>
  );
};

export default NewProductionEquipmentPage;