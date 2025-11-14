import React, { useState, useEffect } from 'react';
import { BarChart, Users, Package, FileText, TrendingUp, Calendar } from 'lucide-react';
import { fetchEquipmentCount, fetchRecentEquipment } from '../../lib/equipment';
import { fetchPendingQuoteRequestsCount, fetchTotalQuoteRequestsCount, fetchRecentQuoteRequests } from '../../lib/quoteRequests';
import { fetchProjectsCount, fetchRecentProjects } from '../../lib/projects';

const AdminOverviewPage: React.FC = () => {
  const [counts, setCounts] = useState({
    equipment: 0,
    projects: 0,
    pendingQuotes: 0,
    totalQuotes: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCounts = async () => {
      setLoading(true);
      setError(null);

      // Fetch each count independently with individual error handling
      const loadEquipmentCount = async () => {
        try {
          const count = await fetchEquipmentCount();
          setCounts(prev => ({ ...prev, equipment: count }));
        } catch (err) {
          console.error('Error loading equipment count:', err);
          setError('Failed to load some dashboard data. Some statistics may be unavailable.');
        }
      };

      const loadProjectsCount = async () => {
        try {
          const count = await fetchProjectsCount();
          setCounts(prev => ({ ...prev, projects: count }));
        } catch (err) {
          console.error('Error loading projects count:', err);
          setError('Failed to load some dashboard data. Some statistics may be unavailable.');
        }
      };

      const loadPendingQuotesCount = async () => {
        try {
          const count = await fetchPendingQuoteRequestsCount();
          setCounts(prev => ({ ...prev, pendingQuotes: count }));
        } catch (err) {
          console.error('Error loading pending quotes count:', err);
          setError('Failed to load some dashboard data. Some statistics may be unavailable.');
        }
      };

      const loadTotalQuotesCount = async () => {
        try {
          const count = await fetchTotalQuoteRequestsCount();
          setCounts(prev => ({ ...prev, totalQuotes: count }));
        } catch (err) {
          console.error('Error loading total quotes count:', err);
          setError('Failed to load some dashboard data. Some statistics may be unavailable.');
        }
      };

      // Load all counts in parallel but with independent error handling
      await Promise.allSettled([
        loadEquipmentCount(),
        loadProjectsCount(),
        loadPendingQuotesCount(),
        loadTotalQuotesCount()
      ]);

      setLoading(false);
    };

    loadCounts();
    loadRecentActivities();
  }, []);

  const loadRecentActivities = async () => {
    setActivitiesLoading(true);
    setActivitiesError(null);

    // Fetch recent data from all sources with independent error handling
    const results = await Promise.allSettled([
      fetchRecentEquipment(3),
      fetchRecentProjects(3),
      fetchRecentQuoteRequests(3)
    ]);

    const activities = [];

    // Add equipment activities (if successful)
    if (results[0].status === 'fulfilled') {
      const recentEquipment = results[0].value;
      recentEquipment.forEach(item => {
        const isNew = !item.updated_at || item.updated_at === item.created_at;
        activities.push({
          id: `equipment-${item.id}`,
          message: isNew ? `New equipment "${item.name}" added` : `Equipment "${item.name}" updated`,
          timestamp: item.updated_at || item.created_at,
          type: 'equipment',
          color: isNew ? 'bg-blue-500' : 'bg-blue-500'
        });
      });
    } else {
      console.error('Error loading recent equipment:', results[0].reason);
    }

    // Add project activities (if successful)
    if (results[1].status === 'fulfilled') {
      const recentProjects = results[1].value;
      recentProjects.forEach(project => {
        const isNew = !project.updated_at || project.updated_at === project.created_at;
        activities.push({
          id: `project-${project.id}`,
          message: isNew ? `New project "${project.title}" added` : `Project "${project.title}" updated`,
          timestamp: project.updated_at || project.created_at,
          type: 'project',
          color: isNew ? 'bg-purple-500' : 'bg-purple-500'
        });
      });
    } else {
      console.error('Error loading recent projects:', results[1].reason);
    }

    // Add quote request activities (if successful)
    if (results[2].status === 'fulfilled') {
      const recentQuoteRequests = results[2].value;
      recentQuoteRequests.forEach(quote => {
        activities.push({
          id: `quote-${quote.id}`,
          message: `New quote request from ${quote.customer_name} for "${quote.job_name}"`,
          timestamp: quote.created_at,
          type: 'quote',
          color: 'bg-green-500'
        });
      });
    } else {
      console.error('Error loading recent quote requests:', results[2].reason);
    }

    // Check if all requests failed
    if (results.every(result => result.status === 'rejected')) {
      setActivitiesError('Failed to load recent activities from all sources.');
    } else if (results.some(result => result.status === 'rejected')) {
      setActivitiesError('Some recent activities could not be loaded.');
    }

    // Sort by timestamp and take the most recent 5
    const sortedActivities = activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
    setRecentActivities(sortedActivities);
    setActivitiesLoading(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than 1 hour ago';
    }
  };

  const stats = [
    {
      title: 'Total Equipment',
      value: loading ? '...' : counts.equipment.toString(),
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending Quotes',
      value: loading ? '...' : counts.pendingQuotes.toString(),
      icon: Users,
      color: 'bg-yellow-500'
    },
    {
      title: 'Total Quote Requests',
      value: loading ? '...' : counts.totalQuotes.toString(),
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 text-sm">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="ml-4 text-red-600 hover:text-red-700 text-sm font-medium underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${loading ? 'text-gray-400' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg text-left transition-colors">
            <Package className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">Add Equipment</h3>
            <p className="text-sm text-blue-600">Add new rental equipment</p>
          </button>
          <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg text-left transition-colors">
            <BarChart className="w-8 h-8 mb-2" />
            <h3 className="font-semibold">View Reports</h3>
            <p className="text-sm text-purple-600">Check analytics and reports</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {activitiesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mr-3"></div>
            <span className="text-gray-600">Loading recent activities...</span>
          </div>
        ) : activitiesError ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{activitiesError}</p>
            <button
              onClick={loadRecentActivities}
              className="text-red-600 hover:text-red-700 font-medium underline"
            >
              Try Again
            </button>
          </div>
        ) : recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 ${activity.color} rounded-full mr-3`}></div>
                <span className="text-sm text-gray-700">{activity.message}</span>
                <span className="text-xs text-gray-500 ml-auto">{formatTimestamp(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activities found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverviewPage;