import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Calendar, User, Building, FileText, AlertCircle, CheckCircle, Clock, XCircle, Filter, Search, Trash2, RotateCcw, Archive } from 'lucide-react';
import { fetchAllQuoteRequests, fetchDeletedQuoteRequests, updateQuoteRequestStatus, deleteQuoteRequest, restoreQuoteRequest, permanentlyDeleteQuoteRequest, QuoteRequest } from '../../lib/quoteRequests';
import { formatDateWithoutTimezone } from '../../lib/dateUtils';
import { useAuth } from '../../contexts/AuthContext';

const QuoteRequestsManagementPage: React.FC = () => {
  const { profile } = useAuth();
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [deletedRequests, setDeletedRequests] = useState<QuoteRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [permanentlyDeleting, setPermanentlyDeleting] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [showDeletionDialog, setShowDeletionDialog] = useState<string | null>(null);
  const [showPermanentDeleteDialog, setShowPermanentDeleteDialog] = useState<string | null>(null);

  useEffect(() => {
    loadQuoteRequests();
  }, [showDeleted]);

  useEffect(() => {
    filterRequests();
  }, [quoteRequests, deletedRequests, searchTerm, selectedStatus, showDeleted]);

  const loadQuoteRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      if (showDeleted) {
        const data = await fetchDeletedQuoteRequests();
        setDeletedRequests(data);
      } else {
        const data = await fetchAllQuoteRequests();
        setQuoteRequests(data);
      }
    } catch (err) {
      setError('Failed to load quote requests. Please try again.');
      console.error('Error loading quote requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    const sourceData = showDeleted ? deletedRequests : quoteRequests;
    let filtered = sourceData;

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.job_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.company && request.company.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedStatus && !showDeleted) {
      filtered = filtered.filter(request => request.status === selectedStatus);
    }

    setFilteredRequests(filtered);
  };

  const handleStatusUpdate = async (id: string, newStatus: QuoteRequest['status']) => {
    try {
      setUpdatingStatus(id);
      await updateQuoteRequestStatus(id, newStatus);
      setQuoteRequests(prev => prev.map(request =>
        request.id === id ? { ...request, status: newStatus } : request
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    setShowDeletionDialog(id);
    setDeletionReason('');
  };

  const handleDelete = async (id: string) => {
    if (!profile?.id) {
      alert('User not authenticated');
      return;
    }

    try {
      setDeleting(id);
      await deleteQuoteRequest(id, profile.id, deletionReason || undefined);
      setQuoteRequests(prev => prev.filter(request => request.id !== id));
      setShowDeletionDialog(null);
      setDeletionReason('');
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting quote request:', err);
      alert('Failed to delete quote request. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleRestore = async (id: string) => {
    if (!profile?.id) {
      alert('User not authenticated');
      return;
    }

    const confirmRestore = window.confirm('Are you sure you want to restore this quote request?');
    if (!confirmRestore) return;

    try {
      setRestoring(id);
      await restoreQuoteRequest(id, profile.id);
      setDeletedRequests(prev => prev.filter(request => request.id !== id));
    } catch (err) {
      console.error('Error restoring quote request:', err);
      alert('Failed to restore quote request. Please try again.');
    } finally {
      setRestoring(null);
    }
  };

  const handlePermanentDeleteClick = (id: string) => {
    setShowPermanentDeleteDialog(id);
  };

  const handlePermanentDelete = async (id: string) => {
    if (!profile?.id) {
      alert('User not authenticated');
      return;
    }

    try {
      setPermanentlyDeleting(id);
      await permanentlyDeleteQuoteRequest(id, profile.id);
      setDeletedRequests(prev => prev.filter(request => request.id !== id));
      setShowPermanentDeleteDialog(null);
    } catch (err) {
      console.error('Error permanently deleting quote request:', err);
      alert('Failed to permanently delete quote request. Please try again.');
    } finally {
      setPermanentlyDeleting(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-purple-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

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

  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quote requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-red-600 w-12 h-12 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadQuoteRequests}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Quote Requests</h2>
          <p className="text-gray-600 text-sm">Manage customer quote requests and rental inquiries</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {showDeleted ? `Deleted: ${deletedRequests.length}` : `Active: ${quoteRequests.length}`}
          </div>
          <Link
            to="/admin/equipment"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Manage Equipment
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by customer, email, or job name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          {!showDeleted && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center justify-end">
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className={`inline-flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
                showDeleted
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Archive className="w-4 h-4 mr-2" />
              {showDeleted ? 'Show Active' : 'Show Deleted'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {showDeleted ? 'deleted' : ''} quote requests found
            </h3>
            <p className="text-gray-500 mb-6">
              {showDeleted
                ? "No quotes have been deleted yet."
                : (quoteRequests.length === 0
                    ? "No quote requests have been submitted yet."
                    : "Try adjusting your search or filter criteria.")
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rental Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  {!showDeleted && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  )}
                  {showDeleted && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deleted Info
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className={`hover:bg-gray-50 ${showDeleted ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{request.customer_name}</div>
                          <div className="text-sm text-gray-500">{request.customer_email}</div>
                          {request.company && (
                            <div className="text-xs text-gray-400 flex items-center mt-1">
                              <Building className="w-3 h-3 mr-1" />
                              {request.company}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.job_name}</div>
                      {request.job_number && (
                        <div className="text-sm text-gray-500">Job #: {request.job_number}</div>
                      )}
                      {request.purchase_order_number && (
                        <div className="text-xs text-gray-400">PO: {request.purchase_order_number}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <div>
                          <div>{formatDateWithoutTimezone(request.start_date)}</div>
                          <div className="text-xs text-gray-500">to {formatDateWithoutTimezone(request.end_date)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {Array.isArray(request.items) ? request.items.length : 0} items
                      </div>
                      <div className="text-xs text-gray-500">
                        Total qty: {Array.isArray(request.items) ? request.items.reduce((sum, item) => sum + item.quantity, 0) : 0}
                      </div>
                    </td>
                    {!showDeleted && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <select
                            value={request.status}
                            onChange={(e) => handleStatusUpdate(request.id!, e.target.value as QuoteRequest['status'])}
                            disabled={updatingStatus === request.id}
                            className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(request.status)} ${
                              updatingStatus === request.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          {updatingStatus === request.id && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    {showDeleted && (
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-700">
                          <div className="font-medium">
                            {request.deleted_at ? new Date(request.deleted_at).toLocaleString() : 'N/A'}
                          </div>
                          {request.deletion_reason && (
                            <div className="text-gray-500 mt-1">
                              Reason: {request.deletion_reason}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/quote-requests/${request.id}`}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye size={16} />
                        </Link>
                        {!showDeleted ? (
                          <button
                            onClick={() => handleDeleteClick(request.id!)}
                            disabled={deleting === request.id}
                            className="text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          >
                            {deleting === request.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRestore(request.id!)}
                              disabled={restoring === request.id}
                              className="text-green-600 hover:text-green-900 transition-colors p-2 hover:bg-green-50 rounded-lg disabled:opacity-50"
                              title="Restore quote"
                            >
                              {restoring === request.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              ) : (
                                <RotateCcw size={16} />
                              )}
                            </button>
                            <button
                              onClick={() => handlePermanentDeleteClick(request.id!)}
                              disabled={permanentlyDeleting === request.id}
                              className="text-red-800 hover:text-red-900 transition-colors p-2 hover:bg-red-100 rounded-lg disabled:opacity-50"
                              title="Permanently delete"
                            >
                              {permanentlyDeleting === request.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-800"></div>
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredRequests.length} of {showDeleted ? deletedRequests.length : quoteRequests.length} quote requests
          </span>
          {!showDeleted && (
            <span>
              {quoteRequests.filter(r => r.status === 'pending').length} Pending, {' '}
              {quoteRequests.filter(r => r.status === 'approved').length} Approved, {' '}
              {quoteRequests.filter(r => r.status === 'completed').length} Completed
            </span>
          )}
        </div>
      </div>

      {showDeletionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Quote Request</h3>
            <p className="text-gray-600 mb-4">
              This will move the quote to the deleted items. You can restore it later if needed.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for deletion (optional)
              </label>
              <textarea
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Enter reason for deletion..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeletionDialog(null);
                  setDeletionReason('');
                }}
                disabled={deleting === showDeletionDialog}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeletionDialog)}
                disabled={deleting === showDeletionDialog}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting === showDeletionDialog ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPermanentDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4">Permanently Delete Quote Request</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-medium mb-2">Warning: This action cannot be undone!</p>
              <p className="text-red-700 text-sm">
                This will permanently remove the quote request from the database. All data will be lost.
              </p>
            </div>
            <p className="text-gray-600 mb-4">
              Are you absolutely sure you want to permanently delete this quote request?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPermanentDeleteDialog(null)}
                disabled={permanentlyDeleting === showPermanentDeleteDialog}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePermanentDelete(showPermanentDeleteDialog)}
                disabled={permanentlyDeleting === showPermanentDeleteDialog}
                className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors disabled:opacity-50"
              >
                {permanentlyDeleting === showPermanentDeleteDialog ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteRequestsManagementPage;
