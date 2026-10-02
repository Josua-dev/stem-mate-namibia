import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSyncQueue } from '../hooks/useSyncQueue';

export const Sidebar: React.FC<{ open: boolean }> = ({ open }) => {
  const location = useLocation();
  const { pendingCount } = useSyncQueue();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/activities', label: 'Activities', icon: '🔬' },
    { path: '/plans', label: 'Plans', icon: '📋' },
    { path: '/sync', label: 'Sync Queue', icon: '🔄', badge: pendingCount },
    { path: '/kits', label: 'Kit Requests', icon: '📦' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside
      id="sidebar"
      className={`bg-white border-r border-gray-200 min-h-screen sticky top-16 ${open ? 'w-64' : 'hidden'}`}
    >
      <nav className="p-4" aria-label="Main navigation">
        <ul className="space-y-1">
          {navItems.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors
                  ${location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <span className="text-lg" aria-hidden="true">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};