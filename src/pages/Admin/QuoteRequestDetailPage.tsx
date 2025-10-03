import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Building, Calendar, MapPin, FileText, Package, Phone, Mail, DollarSign, Save, Send, AlertCircle, CheckCircle, Plus, Minus, Trash2, Edit3, Search, Download } from 'lucide-react';
import { fetchQuoteRequestById, updateQuoteRequestStatus, updateQuoteRequest, resendQuoteEmail, generateQuotePdf, QuoteRequest } from '../../lib/quoteRequests';
import { fetchAllEquipment } from '../../lib/equipment';
import { Equipment } from '../../types';

const QuoteRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Main state
  const [request, setRequest] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Equipment and items state
  const [editableItems, setEditableItems] = useState<any[]>([]);
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
  
  // Form state
  const [discount, setDiscount] = useState<number>(0);
  const [searchNewItemTerm, setSearchNewItemTerm] = useState('');
  const [selectedNewItem, setSelectedNewItem] = useState<Equipment | null>(null);
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [editedStartDate, setEditedStartDate] = useState<string>('');
  const [editedEndDate, setEditedEndDate] = useState<string>('');
  
  // UI state
  const [showAddNewSection, setShowAddNewSection] = useState(false);
  
  // Loading states
  const [isSavingDiscount, setIsSavingDiscount] = useState(false);
  const [isSavingItems, setIsSavingItems] = useState(false);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSavingDates, setIsSavingDates] = useState(false);
  
  // Messages
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [generatePdfError, setGeneratePdfError] = useState<string | null>(null);

  console.log('QuoteRequestDetailPage: Component rendered. ID from params:', id);

  useEffect(() => {
    console.log('QuoteRequestDetailPage: useEffect triggered. ID:', id);
    if (id) {
      loadQuoteRequest(id);
      loadAvailableEquipment();
    } else {
      console.error('QuoteRequestDetailPage: No ID found in URL parameters.');
      setError('No quote request ID provided.');
      setLoading(false);
    }
  }, [id]);
  
  const loadQuoteRequest = async (requestId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('loadQuoteRequest: Attempting to fetch request with ID:', requestId);
      const data = await fetchQuoteRequestById(requestId);
      console.log('loadQuoteRequest: Fetched data:', data);
      if (data) {
        setRequest(data);
        setDiscount(data.discount_amount || 0);
        setEditableItems(Array.isArray(data.items) ? [...data.items] : []);
        setEditedStartDate(data.start_date);
        setEditedEndDate(data.end_date);
      }
    } catch (err) {
      setError('Failed to load quote request details.');
      console.error('loadQuoteRequest: Error fetching quote request:', err);
    } finally {
      setLoading(false);
      console.log('loadQuoteRequest: Loading set to false.');
    }
  };

  const loadAvailableEquipment = async () => {
    try {
      const equipment = await fetchAllEquipment();
      setAvailableEquipment(equipment);
    } catch (err) {
      console.error('Error loading available equipment:', err);
    }
  };

  // Always call useMemo hooks - never conditionally
  const filteredAvailableEquipment = useMemo(() => {
    if (!searchNewItemTerm || searchNewItemTerm.length < 2) return [];
    
    const existingItemIds = editableItems.map(item => item.equipment?.id).filter(Boolean);
    
    return availableEquipment
      .filter(equipment => 
        !existingItemIds.includes(equipment.id) &&
        (equipment.name.toLowerCase().includes(searchNewItemTerm.toLowerCase()) ||
         equipment.description.toLowerCase().includes(searchNewItemTerm.toLowerCase()) ||
         equipment.category.toLowerCase().includes(searchNewItemTerm.toLowerCase()))
      )
      .slice(0, 10);
  }, [searchNewItemTerm, availableEquipment, editableItems]);

  const hasUnsavedItemChanges = useMemo(() => {
    if (!request || !Array.isArray(request.items)) return false;
    return JSON.stringify(editableItems) !== JSON.stringify(request.items);
  }, [editableItems, request?.items]);

  // Always call this useMemo, even if pricedItems might be empty
  const groupedItems = useMemo(() => {
    // Calculate pricing for all items
    const rentalDays = request ? (() => {
      const startDate = new Date(request.start_date);
      const endDate = new Date(request.end_date);
      const timeDiff = endDate.getTime() - startDate.getTime();
      return Math.max(1, Math.floor(timeDiff / (1000 * 3600 * 24)) - 1);
    })() : 1;

    const pricedItems = editableItems.map(item => {
      if (!item?.equipment) return null;
      
      const pricePerUnit = item.equipment.pricePerUnit || 0;
      const unitsPerItem = item.equipment.unitsPerItem || 1;
      const totalUnits = item.quantity * unitsPerItem;
      const itemTotal = totalUnits * pricePerUnit * rentalDays;
      
      return {
        ...item,
        pricePerUnit,
        unitsPerItem,
        totalUnits,
        itemTotal,
        rentalDays
      };
    }).filter(Boolean);

    // Group by main category
    return pricedItems.reduce((acc, item) => {
      if (!item) return acc;
      
      const mainCategory = item.equipment.mainCategory;
      if (!acc[mainCategory]) {
        acc[mainCategory] = [];
      }
      acc[mainCategory].push(item);
      return acc;
    }, {} as Record<string, typeof pricedItems>);
  }, [editableItems, request]);

  const handleQuantityChangeById = (equipmentId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setEditableItems(prev => 
      prev.map(item => 
        item.equipment.id === equipmentId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveItemById = (equipmentId: number) => {
    console.log('handleRemoveItemById: Attempting to remove item with ID:', equipmentId);
    setEditableItems(prev => prev.filter(item => item.equipment.id !== equipmentId));
    console.log('handleRemoveItemById: setEditableItems called.');
  };

  const handleSaveItemChanges = async () => {
    if (!request?.id) return;

    setIsSavingItems(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const updatedRequest = await updateQuoteRequest(request.id, { items: editableItems });
      setRequest(updatedRequest);
      setEditableItems(Array.isArray(updatedRequest.items) ? [...updatedRequest.items] : []);
      setSaveSuccess('Items updated successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving item changes:', err);
      setSaveError('Failed to save item changes. Please try again.');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSavingItems(false);
    }
  };

  const handleCancelItemChanges = () => {
    if (request && Array.isArray(request.items)) {
      setEditableItems([...request.items]);
    }
  };

  const handleAddNewItem = () => {
    if (!selectedNewItem || newItemQuantity < 1) return;
    
    console.log('handleAddNewItem: Adding item:', selectedNewItem.name, 'quantity:', newItemQuantity);
    
    const existingItemIndex = editableItems.findIndex(item => item.equipment.id === selectedNewItem.id);
    
    if (existingItemIndex !== -1) {
      setEditableItems(prev => 
        prev.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + newItemQuantity }
            : item
        )
      );
    } else {
      const newItem = {
        equipment: selectedNewItem,
        quantity: newItemQuantity
      };
      
      setEditableItems(prev => [...prev, newItem]);
    }
    
    setSelectedNewItem(null);
    setNewItemQuantity(1);
    setSearchNewItemTerm('');
    setShowAddNewSection(false);
  };
  
  const handleStatusUpdate = async (newStatus: QuoteRequest['status']) => {
    if (!request?.id) return;

    try {
      setUpdating(true);
      await updateQuoteRequestStatus(request.id, newStatus);
      setRequest(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveDiscount = async () => {
    if (!request?.id) return;

    setIsSavingDiscount(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const updatedRequest = await updateQuoteRequest(request.id, { discount_amount: discount });
      setRequest(updatedRequest);
      setSaveSuccess('Discount updated successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving discount:', err);
      setSaveError('Failed to save discount. Please try again.');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSavingDiscount(false);
    }
  };

  const handleResendQuote = async () => {
    if (!request?.id) return;

    setIsResending(true);
    setResendSuccess(null);
    setResendError(null);

    try {
      await resendQuoteEmail(request.id);
      setResendSuccess('Quote email resent successfully!');
      setTimeout(() => setResendSuccess(null), 3000);
    } catch (err) {
      console.error('Error resending quote:', err);
      setResendError(`Failed to resend quote: ${err instanceof Error ? err.message : 'Unknown error'}.`);
      setTimeout(() => setResendError(null), 5000);
    } finally {
      setIsResending(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!request?.id) return;

    setIsGeneratingPdf(true);
    setGeneratePdfError(null);

    try {
      const { pdf, filename } = await generateQuotePdf(request.id);
      
      const binaryString = atob(pdf);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSaveSuccess('PDF generated and downloaded successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setGeneratePdfError(`Failed to generate PDF: ${err instanceof Error ? err.message : 'Unknown error'}.`);
      setTimeout(() => setGeneratePdfError(null), 5000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setDiscount(value);
    } else if (e.target.value === '') {
      setDiscount(0);
    }
  };

  const handleSaveDates = async () => {
    if (!request?.id) return;

    if (!editedStartDate || !editedEndDate) {
      setSaveError('Both start and end dates are required.');
      setTimeout(() => setSaveError(null), 5000);
      return;
    }

    const startDate = new Date(editedStartDate);
    const endDate = new Date(editedEndDate);

    if (endDate <= startDate) {
      setSaveError('End date must be after start date.');
      setTimeout(() => setSaveError(null), 5000);
      return;
    }

    setIsSavingDates(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const updatedRequest = await updateQuoteRequest(request.id, {
        start_date: editedStartDate,
        end_date: editedEndDate
      });
      setRequest(updatedRequest);
      setEditedStartDate(updatedRequest.start_date);
      setEditedEndDate(updatedRequest.end_date);
      setIsEditingDates(false);
      setSaveSuccess('Rental period updated successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving rental period:', err);
      setSaveError('Failed to save rental period. Please try again.');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSavingDates(false);
    }
  };

  const handleCancelDatesEdit = () => {
    if (request) {
      setEditedStartDate(request.start_date);
      setEditedEndDate(request.end_date);
    }
    setIsEditingDates(false);
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!request) return { grandTotal: 0, finalTotal: 0, taxAmount: 0, rentalDays: 1 };

    const startDate = new Date(request.start_date);
    const endDate = new Date(request.end_date);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const rentalDays = Math.max(1, Math.floor(timeDiff / (1000 * 3600 * 24)) - 1);

    let grandTotal = 0;
    editableItems.forEach(item => {
      if (!item?.equipment) return;
      
      const pricePerUnit = item.equipment.pricePerUnit || 0;
      const unitsPerItem = item.equipment.unitsPerItem || 1;
      const totalUnits = item.quantity * unitsPerItem;
      const itemTotal = totalUnits * pricePerUnit * rentalDays;
      grandTotal += itemTotal;
    });

    const subtotalAfterDiscount = grandTotal - discount;
    const isTaxExempt = request.is_tax_exempt || false;
    const FL_SALES_TAX_RATE = 0.07;
    const taxAmount = isTaxExempt ? 0 : subtotalAfterDiscount * FL_SALES_TAX_RATE;
    const finalTotal = subtotalAfterDiscount + taxAmount;

    return { grandTotal, finalTotal, taxAmount, rentalDays, subtotalAfterDiscount, isTaxExempt };
  };

  const totals = calculateTotals();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryDisplayName = (mainCategory: string) => {
    switch (mainCategory) {
      case 'production':
        return 'Production Equipment';
      case 'home-ec-set':
        return 'Home Ec & Set Rentals';
      default:
        return mainCategory;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quote request...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quote Request Not Found</h2>
          <p className="text-gray-600 mb-8">{error || 'The quote request you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => navigate('/admin/quote-requests')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Back to Quote Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quote Request Details</h2>
              <p className="text-gray-600 text-sm">
                Submitted on {new Date(request.created_at || new Date()).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(request.status)}`}>
                {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
              
              <select
                value={request.status}
                onChange={(e) => handleStatusUpdate(e.target.value as QuoteRequest['status'])}
                disabled={updating}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <User className="mr-3 text-red-600" size={24} />
              Customer Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{request.customer_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <a href={`mailto:${request.customer_email}`} className="text-blue-600 hover:text-blue-700">
                    {request.customer_email}
                  </a>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <a href={`tel:${request.customer_phone || ''}`} className="text-blue-600 hover:text-blue-700">
                    {request.customer_phone || 'N/A'}
                  </a>
                </div>
              </div>
              
              {request.company && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <div className="flex items-center">
                    <Building className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{request.company}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Project Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="mr-3 text-red-600" size={24} />
              Project Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Name</label>
                <p className="text-gray-900">{request.job_name}</p>
              </div>
              
              {request.job_number && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Number</label>
                  <p className="text-gray-900">{request.job_number}</p>
                </div>
              )}
              
              {request.purchase_order_number && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Order Number</label>
                  <p className="text-gray-900">{request.purchase_order_number}</p>
                </div>
              )}
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Rental Period</label>
                  {!isEditingDates && (
                    <button
                      onClick={() => setIsEditingDates(true)}
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                  )}
                </div>

                {isEditingDates ? (
                  <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={editedStartDate}
                        onChange={(e) => setEditedStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        disabled={isSavingDates}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={editedEndDate}
                        onChange={(e) => setEditedEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        disabled={isSavingDates}
                      />
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <button
                        onClick={handleCancelDatesEdit}
                        disabled={isSavingDates}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveDates}
                        disabled={isSavingDates}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                      >
                        {isSavingDates ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3 mr-1" />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span>
                      {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()} ({totals.rentalDays} days)
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shooting Locations</label>
                <div className="flex items-start text-gray-900">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                  <p className="leading-relaxed">{request.shooting_locations}</p>
                </div>
              </div>
              
              {request.special_requests && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                  <p className="text-gray-900 leading-relaxed">{request.special_requests}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add New Equipment Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Plus className="mr-3 text-green-600" size={24} />
              Add Equipment to Quote
            </h2>
            <button
              onClick={() => setShowAddNewSection(!showAddNewSection)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {showAddNewSection ? 'Cancel' : 'Add Equipment'}
            </button>
          </div>
          
          {showAddNewSection && (
            <div className="space-y-6">
              {/* Search Equipment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Equipment
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchNewItemTerm}
                    onChange={(e) => setSearchNewItemTerm(e.target.value)}
                    placeholder="Search by name, description, or category..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Search Results */}
              {filteredAvailableEquipment.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Results ({filteredAvailableEquipment.length} found)
                  </label>
                  <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg">
                    {filteredAvailableEquipment.map((equipment) => (
                      <button
                        key={equipment.id}
                        onClick={() => setSelectedNewItem(equipment)}
                        className={`w-full text-left p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                          selectedNewItem?.id === equipment.id ? 'bg-green-50 border-green-200' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={equipment.image || '/api/placeholder/48/48'}
                            alt={equipment.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{equipment.name}</h4>
                            <p className="text-sm text-gray-600 truncate">{equipment.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                                {equipment.category}
                              </span>
                              {equipment.pricePerUnit && (
                                <span className="text-sm text-green-600 font-medium">
                                  ${equipment.pricePerUnit.toFixed(2)}/unit/day
                                </span>
                              )}
                            </div>
                          </div>
                          {selectedNewItem?.id === equipment.id && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Selected Item and Quantity */}
              {selectedNewItem && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Selected Equipment</h4>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={selectedNewItem.image || '/api/placeholder/64/64'}
                      alt={selectedNewItem.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{selectedNewItem.name}</h5>
                      <p className="text-sm text-gray-600">{selectedNewItem.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium text-gray-700">Quantity:</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setNewItemQuantity(Math.max(1, newItemQuantity - 1))}
                          disabled={newItemQuantity <= 1}
                          className="w-8 h-8 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={newItemQuantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 1) {
                              setNewItemQuantity(value);
                            }
                          }}
                          className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => setNewItemQuantity(newItemQuantity + 1)}
                          className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleAddNewItem}
                      disabled={isAddingNewItem}
                      className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                    >
                      {isAddingNewItem ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Quote
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Requested Equipment */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Package className="mr-3 text-red-600" size={24} />
            Requested Equipment ({editableItems.length} items)
          </h2>
          
          {/* Item Changes Control Bar */}
          {hasUnsavedItemChanges && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Edit3 className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 font-medium">You have unsaved changes to items</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCancelItemChanges}
                    disabled={isSavingItems}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel Changes
                  </button>
                  <button
                    onClick={handleSaveItemChanges}
                    disabled={isSavingItems}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  >
                    {isSavingItems ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Equipment Items */}
          {editableItems.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupedItems).map(([mainCategory, categoryItems]) => (
                <div key={mainCategory} className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4 border-l-4 border-red-500">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <Package className="mr-3 text-red-600" size={20} />
                      {getCategoryDisplayName(mainCategory)}
                      <span className="ml-2 bg-gray-200 text-gray-700 text-sm font-medium px-2 py-1 rounded-full">
                        {categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''}
                      </span>
                    </h3>
                  </div>
                  
                  {categoryItems.map((item) => {
                    if (!item?.equipment) return null;
                    return (
                      <div key={item.equipment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ml-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.equipment.image || '/api/placeholder/64/64'}
                              alt={item.equipment.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1">{item.equipment.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{item.equipment.description}</p>
                            
                            <div className="flex items-center gap-4 mb-3">
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                                {item.equipment.category}
                              </span>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700 font-medium">Qty:</span>
                                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                                  <button
                                    onClick={() => handleQuantityChangeById(item.equipment.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1 || isSavingItems}
                                    className="w-6 h-6 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded flex items-center justify-center transition-colors text-xs"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const newQty = parseInt(e.target.value);
                                      if (!isNaN(newQty) && newQty >= 1) {
                                        handleQuantityChangeById(item.equipment.id, newQty);
                                      }
                                    }}
                                    disabled={isSavingItems}
                                    className="w-16 px-2 py-1 text-center text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                  />
                                  <button
                                    onClick={() => handleQuantityChangeById(item.equipment.id, item.quantity + 1)}
                                    disabled={isSavingItems}
                                    className="w-6 h-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded flex items-center justify-center transition-colors text-xs"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to remove "${item.equipment.name}" from this quote?`)) {
                                    handleRemoveItemById(item.equipment.id);
                                  }
                                }}
                                disabled={isSavingItems}
                                className="inline-flex items-center px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors text-sm disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Remove
                              </button>
                            </div>
                            
                            {item.equipment.pricePerUnit && item.equipment.pricePerUnit > 0 && (
                              <div className="bg-gray-50 rounded-md p-3 mt-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Rate/Unit/Day:</span>
                                    <div className="font-semibold text-gray-900">${item.equipment.pricePerUnit.toFixed(2)}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Total Units:</span>
                                    <div className="font-semibold text-gray-900">{item.quantity * (item.equipment.unitsPerItem || 1)}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Days:</span>
                                    <div className="font-semibold text-gray-900">{totals.rentalDays}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Subtotal:</span>
                                    <div className="font-bold text-red-600">
                                      ${((item.quantity * (item.equipment.unitsPerItem || 1)) * (item.equipment.pricePerUnit || 0) * totals.rentalDays).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              
              {/* Discount Section */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Amount (USD)
                </label>
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={discount}
                      onChange={handleDiscountChange}
                      min="0"
                      max={totals.grandTotal}
                      step="0.01"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0.00"
                      disabled={isSavingDiscount || isResending}
                    />
                  </div>
                  <button
                    onClick={handleSaveDiscount}
                    disabled={isSavingDiscount || isResending}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
                  >
                    {isSavingDiscount ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Discount
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleResendQuote}
                    disabled={isResending || isSavingDiscount || isGeneratingPdf}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    {isResending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Resending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Resend Quote to Customer
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleGeneratePdf}
                    disabled={isGeneratingPdf || isResending || isSavingDiscount}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Generate Quote PDF
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Messages */}
              {(saveSuccess || saveError || resendSuccess || resendError || generatePdfError) && (
                <div className="mt-4 space-y-2">
                  {saveSuccess && <div className="flex items-center text-sm text-green-600"><CheckCircle className="w-4 h-4 mr-1" /> {saveSuccess}</div>}
                  {saveError && <div className="flex items-center text-sm text-red-600"><AlertCircle className="w-4 h-4 mr-1" /> {saveError}</div>}
                  {resendSuccess && <div className="flex items-center text-sm text-green-600"><CheckCircle className="w-4 h-4 mr-1" /> {resendSuccess}</div>}
                  {resendError && <div className="flex items-center text-sm text-red-600"><AlertCircle className="w-4 h-4 mr-1" /> {resendError}</div>}
                  {generatePdfError && <div className="flex items-center text-sm text-red-600"><AlertCircle className="w-4 h-4 mr-1" /> {generatePdfError}</div>}
                </div>
              )}

              {/* Total Summary */}
              <div className="border-t border-gray-200 pt-4 mt-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Total Items: {editableItems.reduce((sum, item) => sum + (item?.quantity || 0), 0)}
                  </div>
                  {totals.grandTotal > 0 && (
                    <div className="text-right">
                      {discount > 0 && <div className="text-sm text-gray-600 line-through">Subtotal: ${totals.grandTotal.toFixed(2)}</div>}
                      {discount > 0 && <div className="text-sm text-red-600">Discount: -${discount.toFixed(2)}</div>}
                      <div className="text-lg font-bold text-gray-900 mt-1">
                        Before Tax Total: ${totals.subtotalAfterDiscount.toFixed(2)}
                      </div>
                      {!totals.isTaxExempt && totals.taxAmount > 0 && (
                        <div className="text-sm text-gray-600">FL Sales Tax (7%): ${totals.taxAmount.toFixed(2)}</div>
                      )}
                      {totals.isTaxExempt && (
                        <div className="text-sm text-green-600 font-medium">Tax Exempt</div>
                      )}
                      <div className="text-2xl font-bold text-red-600 mt-2">
                        After Tax Total: ${totals.finalTotal.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">
                        For {totals.rentalDays} day{totals.rentalDays !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No equipment items found in this request.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteRequestDetailPage;