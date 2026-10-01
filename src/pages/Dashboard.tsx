import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConnection } from '../contexts/ConnectionContext';
import { getSavedActivities, getPlans, getKitRequests, getSyncQueue, getRecentActivity } from '../services/storageService';

export const Dashboard: React.FC = () => {
  const { isOnline } = useConnection();
  const [stats, setStats] = useState({
    savedActivities: 0,
    pendingSync: 0,
    completedPlans: 0,
    totalPlans: 0,
    currentKits: 0,
    returnedKits: 0,
    recentActivity: [] as any[]
  });

  useEffect(() => {
    // Load stats
    const savedActivities = getSavedActivities();
    const plans = getPlans();
    const kitRequests = getKitRequests();
    const syncQueue = getSyncQueue();
    const recentActivity = getRecentActivity();

    setStats({
      savedActivities: savedActivities.length,
      pendingSync: syncQueue.filter(q => q.status === 'pending').length,
      completedPlans: plans.filter(p => p.status === 'completed').length,
      totalPlans: plans.length,
      currentKits: kitRequests.filter(k => k.status === 'current').length,
      returnedKits: kitRequests.filter(k => k.status === 'returned').length,
      recentActivity: recentActivity.slice(0, 5)
    });
  }, []);

  const statCards = [
    {
      label: 'Activities saved offline',
      value: stats.savedActivities,
      icon: '📌',
      color: 'blue',
      link: '/activities'
    },
    {
      label: 'Pending sync items',
      value: stats.pendingSync,
      icon: '⚠',
      color: 'amber',
      link: '/sync'
    },
    {
      label: 'Completed plans',
      value: stats.completedPlans,
      icon: '✅',
      color: 'green',
      link: '/plans'
    },
    {
      label: 'Current kit requests',
      value: stats.currentKits,
      icon: '📦',
      color: 'purple',
      link: '/kits'
    },
    {
      label: 'Returned kits',
      value: stats.returnedKits,
      icon: '↩️',
      color: 'gray',
      link: '/kits'
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
      {/* Welcome section */}
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to STEMMate Namibia
        </h1>
        <p className="text-gray-600">
          Your offline-first planning tool for Namibian STEM education
        </p>
      </section>

      {/* Connection status */}
      <section className="mb-6" aria-live="polite">
        <div className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
          ${isOnline
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
          }
        `}>
          <span className="text-lg" aria-hidden="true">
            {isOnline ? '🟢' : '🔴'}
          </span>
          <span>
            {isOnline ? 'You are online' : 'You are offline'}
          </span>
        </div>
      </section>

      {/* Stats grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="block bg-white rounded-lg shadow-card p-6 hover:shadow-elevated transition-shadow border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <span className="text-4xl" aria-hidden="true">{stat.icon}</span>
            </div>
          </Link>
        ))}
      </section>

      {/* Recent activity */}
      <section className="bg-white rounded-lg shadow-card p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {stats.recentActivity.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {stats.recentActivity.map((activity: any) => (
              <li key={activity.id} className="py-3 flex items-center gap-3">
                <span className="text-lg" aria-hidden="true">
                  {getActivityIcon(activity.type)}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No recent activity</p>
        )}
      </section>

      {/* Quick actions */}
      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/activities"
          className="block bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
        >
          <h3 className="font-medium text-blue-900">Browse Activities</h3>
          <p className="text-sm text-blue-700 mt-1">Find and save activities for offline use</p>
        </Link>
        <Link
          to="/plans"
          className="block bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
        >
          <h3 className="font-medium text-blue-900">Create Session Plan</h3>
          <p className="text-sm text-blue-700 mt-1">Plan a new STEM session</p>
        </Link>
      </section>
    </div>
  );
};

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    saved_activity: '📌',
    plan_created: '📋',
    plan_completed: '✅',
    kit_requested: '📦',
    kit_returned: '↩️',
    sync_attempt: '🔄',
    sync_completed: '✅',
    sync_failed: '⚠',
    connection: '🌐',
    sign_out: '👋',
    plan_deleted: '🗑️',
    kit_request_deleted: '🗑️',
    removed_saved_activity: '❌'
  };
  return icons[type] || '📝';
}