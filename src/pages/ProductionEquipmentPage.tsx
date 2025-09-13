import React, { useState, useMemo } from 'react';
import { useEffect } from 'react';
import { Search, Filter, Plus, Minus, Check, ArrowRight, ArrowLeft, Camera, Mic, Star } from 'lucide-react';
import { fetchEquipmentByMainCategory } from '../lib/equipment';
import { Equipment } from '../types';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

const ProductionEquipmentPage: React.FC = () => {
  const { state, addItem, removeItem, updateQuantity } = useCart();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Define custom category order as a constant
  const CUSTOM_CATEGORY_ORDER = ['Catering / Holding', 'Video Village', 'Wardrobe & HMU Supplies', 'Lights & Fans'];

  // Fetch equipment data from Supabase
  useEffect(() => {
    const loadEquipment = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEquipmentByMainCategory('production');
        setEquipment(data);
        console.log('Fetched equipment data:', data);
        console.log('Categories from fetched data:', data.map(item => item.category));
      } catch (err) {
        setError('Failed to load equipment. Please try again.');
        console.error('Error loading equipment:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEquipment();
  }, []);

  // Get unique categories for filtering
  const categories = useMemo(() => {
    console.log('Category Order defined:', CUSTOM_CATEGORY_ORDER);
    
    const cats = equipment.map(item => item.category);
    const uniqueCategories = Array.from(new Set(cats));
    
    console.log('Unique Categories from equipment (before sort):', uniqueCategories);
    
    // Sort categories based on custom order
    const sortedCategories = uniqueCategories.sort((a, b) => {
      const indexA = CUSTOM_CATEGORY_ORDER.indexOf(a);
      const indexB = CUSTOM_CATEGORY_ORDER.indexOf(b);
      
      console.log(`Comparing categories: "${a}" (index: ${indexA}) vs "${b}" (index: ${indexB})`);
      
      // If both categories are in the custom order, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // If only one category is in the custom order, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // If neither category is in the custom order, sort alphabetically
      return a.localeCompare(b);
    });
    
    console.log('Final sorted categories:', sortedCategories);
    return sortedCategories;
  }, [equipment, CUSTOM_CATEGORY_ORDER]);

  // Filter equipment based on search and category filters
  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      // Sort by custom category order first, then by name within each category
      const indexA = CUSTOM_CATEGORY_ORDER.indexOf(a.category);
      const indexB = CUSTOM_CATEGORY_ORDER.indexOf(b.category);
      
      // If both categories are in the custom order, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        if (indexA !== indexB) {
          return indexA - indexB;
        }
        // Same category, sort by name
        return a.name.localeCompare(b.name);
      }
      
      // If only one category is in the custom order, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // If neither category is in the custom order, sort alphabetically by category, then by name
      const categoryCompare = a.category.localeCompare(b.category);
      if (categoryCompare !== 0) {
        return categoryCompare;
      }
      return a.name.localeCompare(b.name);
    });
  }, [equipment, searchTerm, selectedCategories, CUSTOM_CATEGORY_ORDER]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getItemQuantity = (itemId: number): number => {
    const cartItem = state.items.find(item => item.equipment.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddItem = (item: Equipment) => {
    addItem(item);
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading equipment...</p>
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
          <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-4 py-2 rounded-lg">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-3 py-3">
          {/* Amazon-style search bar */}
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-700">
              <ArrowLeft size={24} />
            </Link>
            <div className="flex-1 relative bg-white border border-gray-300 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Search className="absolute left-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-20 py-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent border-0"
                />
                <div className="absolute right-3 flex items-center gap-2">
                  <Camera className="text-gray-400 w-5 h-5" />
                  <Mic className="text-gray-400 w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
          {/* Filter chips */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium whitespace-nowrap"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategories.includes(category)
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
            <Link
              to="/home-ec-equipment"
              className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium whitespace-nowrap"
            >
              Home Ec Equipment →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
              
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{category}</span>
                    </label>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
              
              {/* Desktop Navigation to Home Ec */}
              <div className="mt-6">
                <Link
                  to="/home-ec-equipment"
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
                >
                  Browse Home Ec Equipment
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Desktop Header */}
            <div className="hidden lg:block mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Production Equipment</h1>
              <p className="text-gray-600">Professional equipment for large-scale food production and commercial kitchens</p>
            </div>

            {/* Active Filters */}
            {selectedCategories.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedCategories.map(category => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {category}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="ml-1 hover:text-blue-600"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Equipment List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:block hidden">
              {filteredEquipment.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-gray-400 text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredEquipment.map((item) => {
                    const quantity = getItemQuantity(item.id);
                    return (
                      <div key={item.id} className="p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          {/* Equipment Image */}
                          <div className="w-16 h-16 lg:w-16 lg:h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                            <img
                              src={item.image || '/api/placeholder/80/80'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Equipment Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                                  <span className="text-sm text-gray-600 truncate">- {item.description}</span>
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize flex-shrink-0">
                                    {item.category}
                                  </span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                                {quantity === 0 ? (
                                  <button
                                    onClick={() => handleAddItem(item)}
                                    className="w-8 h-8 lg:w-8 lg:h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleDecrement(item.id)}
                                        className="w-6 h-6 lg:w-6 lg:h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleIncrement(item.id)}
                                        className="w-6 h-6 lg:w-6 lg:h-6 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <div className="bg-gray-100 px-3 py-1 rounded-full">
                                      <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                        className="w-12 text-sm font-bold text-gray-900 text-center bg-transparent border-none outline-none"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Amazon-style Equipment List */}
            <div className="lg:hidden space-y-1">
              {filteredEquipment.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-lg">
                  <div className="text-gray-400 text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredEquipment.map((item) => {
                  const quantity = getItemQuantity(item.id);
                  return (
                    <div key={item.id} className="bg-white p-3 border-b border-gray-200">
                      <div className="flex gap-4">
                        {/* Equipment Image */}
                        <div className="w-20 h-20 flex-shrink-0 relative">
                          <img
                            src={item.image || '/api/placeholder/96/96'}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        {/* Equipment Details */}
                        <div className="flex-1 min-w-0">
                          <div className="mb-2">
                            <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {item.description}
                            </p>
                          </div>

                          {/* Category badge */}
                          <div className="mb-3">
                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full capitalize">
                              {item.category}
                            </span>
                          </div>

                          {/* Action Button */}
                          <div className="flex items-center justify-between">
                            {quantity === 0 ? (
                              <button
                                onClick={() => handleAddItem(item)}
                                className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDecrement(item.id)}
                                    className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleIncrement(item.id)}
                                    className="w-5 h-5 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="bg-gray-100 px-3 py-1 rounded-full">
                                  <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                    className="w-12 text-sm font-bold text-gray-900 text-center bg-transparent border-none outline-none"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Bottom spacing for mobile nav */}
      <div className="h-16 lg:hidden"></div>
    </div>
  );
};

export default ProductionEquipmentPage;