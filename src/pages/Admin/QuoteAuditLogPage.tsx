import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Calendar, User, FileText, AlertCircle, Filter, Download } from 'lucide-react';
import { fetchAllAuditLogs, QuoteAuditLog } from '../../lib/quoteRequests';

const QuoteAuditLogPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<QuoteAuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<QuoteAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [auditLogs, searchTerm, selectedAction, startDate, endDate]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllAuditLogs();
      setAuditLogs(data);
    } catch (err) {
      setError('Failed to load audit logs. Please try again.');
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = auditLogs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        (log.customer_snapshot?.customer_name &&
          String(log.customer_snapshot.customer_name).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.customer_snapshot?.job_name &&
          String(log.customer_snapshot.job_name).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.performer_email && log.performer_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.performer_name && log.performer_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedAction) {
      filtered = filtered.filter(log => log.action_type === selectedAction);
    }

    if (startDate) {
      filtered = filtered.filter(log => new Date(log.performed_at) >= new Date(startDate));
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.performed_at) <= endDateTime);
    }

    setFilteredLogs(filtered);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'deleted':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Deleted</span>;
      case 'restored':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Restored</span>;
      case 'permanently_deleted':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-900 text-white">Permanently Deleted</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{action}</span>;
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Action', 'Performed By', 'Customer Name', 'Job Name', 'Details'];
    const rows = filteredLogs.map(log => [
      new Date(log.performed_at).toLocaleString(),
      log.action_type,
      log.performer_email || 'Unknown',
      log.customer_snapshot?.customer_name || 'N/A',
      log.customer_snapshot?.job_name || 'N/A',
      log.details?.reason || 'No details'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `quote_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const actionTypes = [
    { value: '', label: 'All Actions' },
    { value: 'deleted', label: 'Deleted' },
    { value: 'restored', label: 'Restored' },
    { value: 'permanently_deleted', label: 'Permanently Deleted' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audit logs...</p>
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
            onClick={loadAuditLogs}
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
      <div className="mb-6">
        <Link
          to="/admin/quote-requests"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quote Requests
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Quote Request Audit Log</h2>
            <p className="text-gray-600 text-sm">Complete history of quote deletions and restorations</p>
          </div>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export to CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by customer, job, or admin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {actionTypes.map(action => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="date"
              placeholder="Start date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="date"
              placeholder="End date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📜</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
            <p className="text-gray-500 mb-6">
              {auditLogs.length === 0
                ? "No actions have been logged yet."
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performed By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason / Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div>{new Date(log.performed_at).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{new Date(log.performed_at).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionBadge(log.action_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {log.performer_name || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">{log.performer_email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{log.customer_snapshot?.customer_name || 'N/A'}</div>
                        <div className="text-gray-500">{log.customer_snapshot?.job_name || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {log.details?.reason || 'No reason provided'}
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
            Showing {filteredLogs.length} of {auditLogs.length} audit log entries
          </span>
          <span>
            {auditLogs.filter(l => l.action_type === 'deleted').length} Deletions,{' '}
            {auditLogs.filter(l => l.action_type === 'restored').length} Restorations,{' '}
            {auditLogs.filter(l => l.action_type === 'permanently_deleted').length} Permanent Deletions
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuoteAuditLogPage;
