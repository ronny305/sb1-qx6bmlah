import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Calendar,
  Send,
  User,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Package,
  Home,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useQuotePanel } from '../contexts/QuotePanelContext';
import { createQuoteRequest } from '../lib/quoteRequests';


const QuotePanel: React.FC = () => {
  const { state: cartState, removeItem, updateQuantity, clearCart } = useCart();
  const { isQuotePanelOpen, setIsQuotePanelOpen, hasBeenManuallyClosed, setHasBeenManuallyClosed } = useQuotePanel();

  const [currentStep, setCurrentStep] = useState(1);
  const [orderInfo, setOrderInfo] = useState({
    productionCompany: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    jobName: '',
    jobNumber: '',
    purchaseOrderNumber: '',
    primaryPickupDate: '',
    primaryReturnDate: '',
    shootingLocations: '',
  });
  const [specialRequests, setSpecialRequests] = useState('');
  const [isTaxExempt, setIsTaxExempt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submissionMessage, setSubmissionMessage] = useState('');

  // Auto-close panel after successful submission
  useEffect(() => {
    if (submissionStatus === 'success') {
      const timer = setTimeout(() => {
        setSubmissionStatus('idle'); // Reset submission status
        setHasBeenManuallyClosed(false); // Reset manual close state
        setIsQuotePanelOpen(false);
      }, 10000); // Auto-close after 10 seconds

      return () => clearTimeout(timer);
    }
    }, [submissionStatus, setIsQuotePanelOpen, setHasBeenManuallyClosed]);

  const handleClose = () => {
    setHasBeenManuallyClosed(true);
    setIsQuotePanelOpen(false);
    setCurrentStep(1); // Reset to first step when closing
  };
  // Group cart items by mainCategory
  const groupedCartItems = cartState.items.reduce(
    (acc, item) => {
      const mainCategory = item.equipment.mainCategory;
      if (!acc[mainCategory]) {
        acc[mainCategory] = [];
      }
      acc[mainCategory].push(item);
      return acc;
    },
    {} as Record<string, typeof cartState.items>
  );

  const handleQuantityChange = (itemId: number, value: string) => {
    const newQuantity = parseInt(value);
    if (value === '' || newQuantity <= 0) {
      removeItem(itemId);
    } else if (!isNaN(newQuantity)) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleIncrement = (itemId: number) => {
    const currentQuantity = cartState.items.find(item => item.equipment.id === itemId)?.quantity || 0;
    updateQuantity(itemId, currentQuantity + 1);
  };

  const handleDecrement = (itemId: number) => {
    const currentQuantity = cartState.items.find(item => item.equipment.id === itemId)?.quantity || 0;
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
    } else {
      removeItem(itemId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus('idle');
    setSubmissionMessage('');

    try {
      const quoteData = {
        customer_name: orderInfo.contactName,
        customer_email: orderInfo.contactEmail,
        customer_phone: orderInfo.contactPhone,
        company: orderInfo.productionCompany || null,
        job_name: orderInfo.jobName,
        job_number: orderInfo.jobNumber || null,
        purchase_order_number: orderInfo.purchaseOrderNumber || null,
        start_date: orderInfo.primaryPickupDate,
        end_date: orderInfo.primaryReturnDate,
        shooting_locations: orderInfo.shootingLocations,
        special_requests: specialRequests || null,
        items: cartState.items,
        is_tax_exempt: isTaxExempt,
      };

      await createQuoteRequest(quoteData);
      setSubmissionStatus('success');
      setSubmissionMessage('Thank you! Your quote request has been submitted successfully. We\'ll respond within 2 business hours.');
      clearCart();
      setHasBeenManuallyClosed(false); // Reset manual close state after successful submission
      // Optionally clear form fields after successful submission
      setOrderInfo({
        productionCompany: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        jobName: '',
        jobNumber: '',
        purchaseOrderNumber: '',
        primaryPickupDate: '',
        primaryReturnDate: '',
        shootingLocations: '',
      });
      setSpecialRequests('');
      setIsTaxExempt(false);
      setCurrentStep(1); // Reset to first step after successful submission
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setSubmissionStatus('error');
      setSubmissionMessage('Failed to submit quote request: ' + message + '. Please try again.');
      console.error('Error submitting quote request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if the panel should be open
  const shouldBeOpen = isQuotePanelOpen || submissionStatus === 'success';

  const panelClasses =
    'fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ' +
    (shouldBeOpen ? 'translate-x-0 ' : 'translate-x-full ') +
    'flex flex-col';

  return (
    <div
      className={panelClasses}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Your Quote Request</h2>
        <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      {cartState.totalItems === 0 && submissionStatus !== 'success' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-gray-500">
          <ShoppingCart size={48} className="mb-4" />
          <p className="text-lg font-medium">Your quote list is empty.</p>
          <p className="text-sm">Add items from the equipment pages to get started.</p>
        </div>
      ) : submissionStatus === 'success' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h3>
          <div className="space-y-4 max-w-sm">
            <p className="text-lg text-gray-700 leading-relaxed">
              Your quote request has been submitted successfully.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Clock className="text-blue-600 mr-2" size={20} />
                <span className="font-semibold text-blue-900">Response Time</span>
              </div>
              <p className="text-blue-800 text-sm">
                We'll review your requirements and respond within{' '}
                <span className="font-bold">2 business hours</span> with a detailed quote.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              This panel will close automatically in a few seconds...
            </div>
          </div>
          <div className="mt-8 space-y-3 w-full max-w-sm">
            <Link
              to="/production-equipment"
              onClick={handleClose}
              className="block w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 text-center"
            >
              Continue Shopping
            </Link>
            <button
              onClick={handleClose}
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      ) : currentStep === 1 ? (
        <>
          {/* Step 1: Equipment Review */}
          <div className="flex-1 overflow-y-auto p-4">
          {submissionStatus === 'error' && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {submissionMessage}
            </div>
          )}

          {/* Cart Items Display */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <ShoppingCart size={20} className="mr-2 text-red-600" />
              Selected Equipment ({cartState.totalItems})
            </h3>
            {Object.keys(groupedCartItems).map((mainCategory) => (
              <div key={mainCategory} className="mb-4 border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                  {mainCategory === 'production' ? (
                    <Package size={16} className="mr-2 text-blue-600" />
                  ) : (
                    <Home size={16} className="mr-2 text-purple-600" />
                  )}
                  {mainCategory === 'production' ? 'Production Equipment' : 'Home Ec & Set Rentals'}
                </h4>
                <div className="space-y-2">
                  {groupedCartItems[mainCategory].map((item) => (
                    <div key={item.equipment.id} className="flex items-center justify-between text-sm">
                      <div className="flex-1 pr-2">
                        <p className="font-medium text-gray-900">{item.equipment.name}</p>
                        <p className="text-gray-600 text-xs">
                          {item.equipment.description.substring(0, 50)}...
                        </p>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleDecrement(item.equipment.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.equipment.id, e.target.value)}
                          className="w-12 text-center border border-gray-300 rounded-md mx-1 text-sm"
                          min="1"
                        />
                        <button
                          onClick={() => handleIncrement(item.equipment.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded-full"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeItem(item.equipment.id)}
                          className="ml-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Navigation to Project Details */}
          <div className="mt-6">
            <button
              onClick={() => setCurrentStep(2)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
            >
              <FileText size={20} className="mr-2" />
              Add Project Details
            </button>
          </div>
          </div>
        </>
      ) : currentStep === 2 ? (
        <>
          {/* Step 2: Project Information Form */}
          <div className="flex-1 overflow-y-auto p-4">
            {submissionStatus === 'error' && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center">
                <AlertCircle size={20} className="mr-2" />
                {submissionMessage}
              </div>
            )}

            {/* Back Navigation */}
            <div className="mb-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Equipment
              </button>
            </div>

            {/* Quote Request Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FileText size={20} className="mr-2 text-blue-600" />
                Project Information
              </h3>

              {/* Company & Contact Section */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <h4 className="text-base font-semibold text-gray-700 flex items-center">
                  <User size={16} className="mr-2 text-gray-600" />
                  Company & Contact Details
                </h4>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Production Company Name *</label>
                  <input
                    type="text"
                    value={orderInfo.productionCompany}
                    onChange={(e) => setOrderInfo({ ...orderInfo, productionCompany: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    value={orderInfo.contactName}
                    onChange={(e) => setOrderInfo({ ...orderInfo, contactName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    value={orderInfo.contactEmail}
                    onChange={(e) => setOrderInfo({ ...orderInfo, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact Phone Number *</label>
                  <input
                    type="tel"
                    value={orderInfo.contactPhone}
                    onChange={(e) => setOrderInfo({ ...orderInfo, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Job Name *</label>
                  <input
                    type="text"
                    value={orderInfo.jobName}
                    onChange={(e) => setOrderInfo({ ...orderInfo, jobName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Job Number</label>
                  <input
                    type="text"
                    value={orderInfo.jobNumber}
                    onChange={(e) => setOrderInfo({ ...orderInfo, jobNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="(Optional)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Purchase Order Number</label>
                  <input
                    type="text"
                    value={orderInfo.purchaseOrderNumber}
                    onChange={(e) => setOrderInfo({ ...orderInfo, purchaseOrderNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="(Optional)"
                  />
                </div>
              </div>

              {/* Rental Schedule Section */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <h4 className="text-base font-semibold text-gray-700 flex items-center">
                  <Calendar size={16} className="mr-2 text-gray-600" />
                  Rental Schedule
                </h4>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Primary Pickup Date *</label>
                  <input
                    type="date"
                    value={orderInfo.primaryPickupDate}
                    onChange={(e) => setOrderInfo({ ...orderInfo, primaryPickupDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Primary Return Date *</label>
                  <input
                    type="date"
                    value={orderInfo.primaryReturnDate}
                    onChange={(e) => setOrderInfo({ ...orderInfo, primaryReturnDate: e.target.value })}
                    min={orderInfo.primaryPickupDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Location & Notes Section */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Approximate Shooting Locations *</label>
                  <textarea
                    value={orderInfo.shootingLocations}
                    onChange={(e) => setOrderInfo({ ...orderInfo, shootingLocations: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Additional Notes or Special Requests</label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                    placeholder="(Optional)"
                  />
                </div>
                <div className="flex items-start">
                  <input
                    id="isTaxExempt"
                    type="checkbox"
                    checked={isTaxExempt}
                    onChange={(e) => setIsTaxExempt(e.target.checked)}
                    className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded"
                  />
                  <div className="ml-2">
                    <label htmlFor="isTaxExempt" className="text-xs font-semibold text-gray-900">
                      Florida State Tax Exemption
                    </label>
                    <p className="text-xs text-gray-600">
                      Check if you have a valid Florida State Exemption Certificate
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Quote Button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={
                    !orderInfo.productionCompany ||
                    !orderInfo.contactName ||
                    !orderInfo.contactEmail ||
                    !orderInfo.contactPhone ||
                    !orderInfo.jobName ||
                    !orderInfo.primaryPickupDate ||
                    !orderInfo.primaryReturnDate ||
                    !orderInfo.shootingLocations
                  }
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
                >
                  <CheckCircle size={20} className="mr-2" />
                  Review Quote
                </button>
              </div>
            </div>
          </div>
        </>
      ) : currentStep === 3 ? (
        <>
          {/* Step 3: Review & Submit */}
          <div className="flex-1 overflow-y-auto p-4">
            {submissionStatus === 'error' && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center">
                <AlertCircle size={20} className="mr-2" />
                {submissionMessage}
              </div>
            )}

            {/* Back Navigation */}
            <div className="mb-4">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={cartState.totalItems === 0}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Project Details
              </button>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <CheckCircle size={20} className="mr-2 text-green-600" />
              Review Your Quote Request
            </h3>

            {/* Equipment Summary - Read Only */}
            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-700 mb-3 flex items-center">
                <Package size={16} className="mr-2 text-red-600" />
                Selected Equipment ({cartState.totalItems} items)
              </h4>
              {Object.keys(groupedCartItems).map((mainCategory) => (
                <div key={mainCategory} className="mb-3 border border-gray-200 rounded-lg p-3">
                  <h5 className="font-medium text-gray-600 mb-2 text-sm flex items-center">
                    {mainCategory === 'production' ? (
                      <Package size={14} className="mr-1 text-blue-600" />
                    ) : (
                      <Home size={14} className="mr-1 text-purple-600" />
                    )}
                    {mainCategory === 'production' ? 'Production Equipment' : 'Home Ec & Set Rentals'}
                  </h5>
                  <div className="space-y-1">
                    {groupedCartItems[mainCategory].map((item) => (
                      <div key={item.equipment.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-md p-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.equipment.name}</p>
                          <p className="text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Project Details Summary */}
            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-700 mb-3 flex items-center">
                <Building size={16} className="mr-2 text-blue-600" />
                Project Details
              </h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Company:</span>
                    <p className="text-gray-900">{orderInfo.productionCompany}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Contact:</span>
                    <p className="text-gray-900">{orderInfo.contactName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-900">{orderInfo.contactEmail}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <p className="text-gray-900">{orderInfo.contactPhone}</p>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Job Name:</span>
                  <p className="text-gray-900">{orderInfo.jobName}</p>
                </div>
                {orderInfo.jobNumber && (
                  <div>
                    <span className="font-medium text-gray-700">Job Number:</span>
                    <p className="text-gray-900">{orderInfo.jobNumber}</p>
                  </div>
                )}
                {orderInfo.purchaseOrderNumber && (
                  <div>
                    <span className="font-medium text-gray-700">PO Number:</span>
                    <p className="text-gray-900">{orderInfo.purchaseOrderNumber}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">Rental Period:</span>
                  <p className="text-gray-900">
                    {new Date(orderInfo.primaryPickupDate).toLocaleDateString()} - {new Date(orderInfo.primaryReturnDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Shooting Locations:</span>
                  <p className="text-gray-900">{orderInfo.shootingLocations}</p>
                </div>
                {specialRequests && (
                  <div>
                    <span className="font-medium text-gray-700">Special Requests:</span>
                    <p className="text-gray-900">{specialRequests}</p>
                  </div>
                )}
                {isTaxExempt && (
                  <div className="flex items-center text-green-700 bg-green-50 rounded-md p-2 mt-2">
                    <CheckCircle size={14} className="mr-2" />
                    <span className="text-xs font-medium">Florida State Tax Exemption Applied</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Clock size={20} className="mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} className="mr-2" />
                    Submit Quote Request
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Fallback - shouldn't happen */}
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-gray-500">Something went wrong. Please close and try again.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default QuotePanel;