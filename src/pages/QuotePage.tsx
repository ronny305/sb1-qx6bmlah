import React, { useState } from 'react';
import { Trash2, Plus, Minus, Calendar, Send, ShoppingCart, CheckCircle, Clock, User, Building, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { createQuoteRequest } from '../lib/quoteRequests';

const QuotePage: React.FC = () => {
  const { state: cartState, removeItem, updateQuantity, clearCart } = useCart();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isTaxExempt, setIsTaxExempt] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const quoteData = {
        customer_name: orderInfo.contactName,
        customer_email: orderInfo.contactEmail,
        customer_phone: orderInfo.contactPhone,
        company: orderInfo.productionCompany,
        job_name: orderInfo.jobName,
        job_number: orderInfo.jobNumber,
        purchase_order_number: orderInfo.purchaseOrderNumber,
        start_date: orderInfo.primaryPickupDate,
        end_date: orderInfo.primaryReturnDate,
        shooting_locations: orderInfo.shootingLocations,
        special_requests: specialRequests,
        items: cartState.items,
        is_tax_exempt: isTaxExempt
      };

      console.log('Submitting quote request:', quoteData);
      await createQuoteRequest(quoteData);
      console.log('Quote request submitted successfully');
      
      // Track GA4 event for quote submission from main quote page
      if (window.gtag) {
        window.gtag('event', 'quote_submitted', {
          event_category: 'conversion',
          event_label: 'Quote Page Submission',
          quote_source: 'quote_page',
          number_of_items: cartState.items.length,
          total_quantity: cartState.totalItems,
          customer_company: orderInfo.productionCompany,
          rental_days: (() => {
            const start = new Date(orderInfo.primaryPickupDate);
            const end = new Date(orderInfo.primaryReturnDate);
            return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          })(),
          value: cartState.totalItems
        });
      }
      
      setSubmitted(true);
      clearCart();
    } catch (err) {
      console.error('Error submitting quote request:', err);
      setError(`Failed to submit quote request: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Quote Request Submitted!</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
              Thank you for your quote request. We'll review your requirements and get back to you within 
              <span className="font-semibold text-red-600"> 2 business hours</span> with a detailed quote and availability confirmation.
            </p>
            <div className="space-y-3">
              <Link
                to="/catalog"
                className="block w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform active:scale-95"
              >
                Continue Shopping
              </Link>
              <Link
                to="/"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="text-gray-400" size={32} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Your Quote is Empty</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6">
              Add equipment to your quote to get started with your rental request.
            </p>
            <Link
              to="/production-equipment"
              className="block w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform active:scale-95"
            >
              Browse Equipment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sm:hidden">
        <div className="flex items-center">
          <Link to="/production-equipment" className="mr-4">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Request Quote</h1>
            <p className="text-sm text-gray-600">{cartState.totalItems} items selected</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Desktop Header */}
        <div className="text-center mb-8 sm:mb-12 hidden sm:block">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Request Your Quote
          </h1>
          <p className="text-lg xl:text-xl text-gray-600 max-w-2xl mx-auto">
            Review your equipment selection and provide project details to receive a custom quote
          </p>
        </div>

        {/* Progress Steps - Hidden on mobile */}
        <div className="hidden sm:flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="text-white" size={16} />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Equipment Selected</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <span className="ml-2 text-sm font-medium text-red-600">Project Details</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm font-bold">3</span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Receive Quote</span>
            </div>
          </div>
        </div>

        {/* Equipment Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center mb-4 sm:mb-0">
              <ShoppingCart className="mr-3 text-red-600" size={24} />
              Selected Equipment
            </h2>
            <div className="flex items-center space-x-3">
              <span className="bg-red-100 text-red-800 px-3 py-2 rounded-full text-sm font-bold">
                {cartState.totalItems} item{cartState.totalItems !== 1 ? 's' : ''}
              </span>
              <Link
                to="/production-equipment"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center"
              >
                <Plus size={16} className="mr-1" />
                <span className="hidden sm:inline">Add More</span>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {cartState.items.map((item, index) => (
              <div key={item.equipment.id} className="border border-gray-200 rounded-xl p-3 hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <img
                    src={item.equipment.image}
                    alt={item.equipment.name}
                    className="w-full sm:w-16 h-32 sm:h-16 object-cover rounded-lg shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 mb-2">{item.equipment.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{item.equipment.description}</p>
                    
                    {/* Show total units for mobile */}
                    <div className="text-xs text-gray-600 mb-2">
                      <span className="font-medium">
                        Total: {item.quantity * item.equipment.unitsPerItem} units
                      </span>
                      {item.equipment.unitsPerItem > 1 && (
                        <div className="text-gray-500">
                          {item.quantity} item{item.quantity !== 1 ? 's' : ''} × {item.equipment.unitsPerItem} each
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center bg-gray-50 rounded-lg p-1 w-fit">
                        <button
                          onClick={() => updateQuantity(item.equipment.id, item.quantity - 1)}
                          className="p-1 hover:bg-white rounded-md transition-colors duration-200 touch-manipulation"
                        >
                          <Minus size={16} className="text-gray-600" />
                        </button>
                        <span className="px-3 py-1 font-bold text-gray-900 min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.equipment.id, item.quantity + 1)}
                          className="p-1 hover:bg-white rounded-md transition-colors duration-200 touch-manipulation"
                        >
                          <Plus size={16} className="text-gray-600" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.equipment.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all duration-200 touch-manipulation w-fit"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Form */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center">
            <Building className="mr-3 text-red-600" size={24} />
            Project Information
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Company & Contact Section */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <User className="mr-2 text-gray-600" size={20} />
                Company & Contact Details
              </h3>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Production Company Name *
                  </label>
                  <input
                    type="text"
                    value={orderInfo.productionCompany}
                    onChange={(e) => setOrderInfo({...orderInfo, productionCompany: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900 font-medium text-base"
                    placeholder="Enter your production company name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={orderInfo.contactName}
                      onChange={(e) => setOrderInfo({...orderInfo, contactName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-base"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      value={orderInfo.contactEmail}
                      onChange={(e) => setOrderInfo({...orderInfo, contactEmail: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-base"
                      placeholder="your.email@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={orderInfo.contactPhone}
                      onChange={(e) => setOrderInfo({...orderInfo, contactPhone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-base"
                      placeholder="(305) 555-0123"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Job Name *
                    </label>
                    <input
                      type="text"
                      value={orderInfo.jobName}
                      onChange={(e) => setOrderInfo({...orderInfo, jobName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-base"
                      placeholder="Project or job name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Job Number
                    </label>
                    <input
                      type="text"
                      value={orderInfo.jobNumber}
                      onChange={(e) => setOrderInfo({...orderInfo, jobNumber: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-base"
                      placeholder="Internal job number (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Purchase Order Number
                    </label>
                    <input
                      type="text"
                      value={orderInfo.purchaseOrderNumber}
                      onChange={(e) => setOrderInfo({...orderInfo, purchaseOrderNumber: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-base"
                      placeholder="PO number (optional)"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Rental Schedule Section */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <Calendar className="mr-2 text-gray-600" size={20} />
                Rental Schedule
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primary Pickup Date *
                  </label>
                  <input
                    type="date"
                    value={orderInfo.primaryPickupDate}
                    onChange={(e) => setOrderInfo({...orderInfo, primaryPickupDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primary Return Date *
                  </label>
                  <input
                    type="date"
                    value={orderInfo.primaryReturnDate}
                    onChange={(e) => setOrderInfo({...orderInfo, primaryReturnDate: e.target.value})}
                    min={orderInfo.primaryPickupDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-base"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location & Notes Section */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Approximate Shooting Locations *
                </label>
                <textarea
                  value={orderInfo.shootingLocations}
                  onChange={(e) => setOrderInfo({...orderInfo, shootingLocations: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none text-base"
                  placeholder="List the approximate locations where filming will take place (e.g., Miami Beach, Downtown Miami, Studio at 123 Main St...)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Notes or Special Requests
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none text-base"
                  placeholder="Any additional requirements, delivery instructions, setup needs, or special services..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                  <input
                    id="isTaxExempt"
                    type="checkbox"
                    checked={isTaxExempt}
                    onChange={(e) => setIsTaxExempt(e.target.checked)}
                    className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <label htmlFor="isTaxExempt" className="text-sm font-semibold text-gray-900">
                      Florida State Tax Exemption
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Check this box if you have a valid Florida State Exemption Form. 
                      You must attach the Florida State Exemption Form to your email to receive the before-tax pricing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-4">
              <div className="flex items-start">
                <Clock className="text-blue-600 mt-1 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-3">What happens next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      We'll review your equipment request and check availability for your dates
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      You'll receive a detailed quote with pricing within <strong>2 business hours</strong>
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Our team will contact you to finalize rental details and logistics
                    </li>
                    <li className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      We'll schedule delivery or pickup based on your preferences
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !orderInfo.primaryPickupDate || !orderInfo.primaryReturnDate}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-bold text-base transition-all duration-200 transform active:scale-95 disabled:active:scale-100 shadow-lg disabled:shadow-none flex items-center justify-center touch-manipulation"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Processing Your Request...
                  </div>
                ) : (
                  <>
                    <Send className="mr-3" size={22} />
                    Submit Quote Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuotePage;