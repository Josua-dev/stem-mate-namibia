import React, { useState, useEffect } from 'react';
import { detectKitClash, validateKitRequest } from '../utils/clashDetector';
import { getKitRequests, saveKitRequest, deleteKitRequest } from '../services/storageService';
import type { KitRequest } from '../services/storageService';
import { validatePrivacy } from '../utils/privacyValidator';
import { v4 as uuidv4 } from 'uuid';

export const Kits: React.FC = () => {
  const [requests, setRequests] = useState<KitRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'returned'>('current');
  const [showForm, setShowForm] = useState(false);
  const [clashWarning, setClashWarning] = useState<string>('');
  const [formData, setFormData] = useState({
    kitName: '',
    intendedDate: '',
    responsibleFacilitator: ''
  });

  useEffect(() => {
    setRequests(getKitRequests());
  }, []);

  const handleInputChange = (field: string, value: string) => {
    const latest = { ...formData, [field]: value };
    setFormData(latest);

    // Real-time clash detection using the latest values
    if (latest.kitName && latest.intendedDate) {
      const clash = detectKitClash(
        { kitName: latest.kitName, intendedDate: latest.intendedDate },
        requests.filter(r => r.status === 'current')
      );
      setClashWarning(clash.hasClash ? clash.message : '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateKitRequest(formData);
    if (errors.length > 0) {
      setClashWarning(errors.join('. '));
      return;
    }

    // Privacy check before saving (no pupil data may be present)
    const privacyResult = validatePrivacy({
      title: formData.kitName,
      description: '',
      notes: '',
      safetyNotes: '',
      facilitator: formData.responsibleFacilitator,
      materials: [],
      steps: [],
      inclusionPrompts: []
    });
    if (!privacyResult.valid) {
      setClashWarning(`⚠ Cannot save: ${privacyResult.violations.join(', ')}`);
      return;
    }

    // Check for clashes with existing current requests
    const clash = detectKitClash(formData, requests.filter(r => r.status === 'current'));
    if (clash.hasClash) {
      setClashWarning(clash.message);
      return;
    }

    // Save new request
    const newRequest: KitRequest = {
      id: uuidv4(),
      kitName: formData.kitName,
      intendedDate: formData.intendedDate,
      responsibleFacilitator: formData.responsibleFacilitator,
      createdAt: new Date().toISOString(),
      status: 'current'
    };

    saveKitRequest(newRequest);
    setRequests(getKitRequests());

    // Reset form
    setFormData({ kitName: '', intendedDate: '', responsibleFacilitator: '' });
    setClashWarning('');
    setShowForm(false);
  };

  const handleReturn = (id: string) => {
    const request = requests.find(r => r.id === id);
    if (request) {
      saveKitRequest({ ...request, status: 'returned', returnedAt: new Date().toISOString() });
    }
    setRequests(getKitRequests());
  };

  const handleDelete = (id: string) => {
    deleteKitRequest(id);
    setRequests(getKitRequests());
  };

  const filteredRequests = requests.filter(r => r.status === activeTab);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
      {/* Page header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kit Requests</h1>
        <p className="text-gray-600">
          Manage equipment kit requests for STEM sessions
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'current'}
          onClick={() => setActiveTab('current')}
          className={`
            rounded-md px-4 py-3 text-sm font-medium min-h-[44px]
            ${activeTab === 'current'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          Current ({requests.filter(r => r.status === 'current').length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'returned'}
          onClick={() => setActiveTab('returned')}
          className={`
            rounded-md px-4 py-3 text-sm font-medium min-h-[44px]
            ${activeTab === 'returned'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          Returned ({requests.filter(r => r.status === 'returned').length})
        </button>
      </div>

      {/* Add request button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          aria-expanded={showForm}
          aria-controls="kit-form"
        >
          {showForm ? 'Cancel' : '+ New Kit Request'}
        </button>
      </div>

      {/* Kit request form */}
      {showForm && (
        <form id="kit-form" onSubmit={handleSubmit} className="bg-white rounded-lg shadow-card border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">New Kit Request</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="kit-name" className="block text-sm font-medium text-gray-700 mb-1">
                Kit Name
              </label>
              <input
                type="text"
                id="kit-name"
                value={formData.kitName}
                onChange={(e) => handleInputChange('kitName', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
              />
            </div>
            <div>
              <label htmlFor="intended-date" className="block text-sm font-medium text-gray-700 mb-1">
                Intended Date
              </label>
              <input
                type="date"
                id="intended-date"
                value={formData.intendedDate}
                onChange={(e) => handleInputChange('intendedDate', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
              />
            </div>
            <div>
              <label htmlFor="facilitator" className="block text-sm font-medium text-gray-700 mb-1">
                Responsible Facilitator
              </label>
              <input
                type="text"
                id="facilitator"
                value={formData.responsibleFacilitator}
                onChange={(e) => handleInputChange('responsibleFacilitator', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
              />
            </div>
          </div>

          {/* Clash warning */}
          {clashWarning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4" role="alert">
              <p className="text-yellow-800">{clashWarning}</p>
            </div>
          )}

          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          >
            Submit Request
          </button>
        </form>
      )}

      {/* Requests list */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-card border border-gray-100">
          <p className="text-gray-500 text-lg mb-2">
            {activeTab === 'current' ? 'No current kit requests' : 'No returned kits'}
          </p>
          <p className="text-gray-600 text-sm">
            {activeTab === 'current'
              ? 'Create a new kit request to get started'
              : 'Returned kits will appear here'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredRequests.map(request => (
            <li key={request.id} className="bg-white rounded-lg shadow-card border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{request.kitName}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Facilitator:</span> {request.responsibleFacilitator}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Date:</span> {new Date(request.intendedDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Created: {new Date(request.createdAt).toLocaleString()}
                    {request.returnedAt && ` • Returned: ${new Date(request.returnedAt).toLocaleString()}`}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {request.status === 'current' && (
                    <button
                      onClick={() => handleReturn(request.id)}
                      className="rounded-md bg-green-100 text-green-700 px-4 py-2 text-sm font-medium hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px]"
                    >
                      Mark Returned
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(request.id)}
                    className="rounded-md bg-red-100 text-red-700 px-3 py-2 text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
                    aria-label={`Delete request for ${request.kitName}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};