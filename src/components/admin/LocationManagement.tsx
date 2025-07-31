import React, { useState } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  QrCode, 
  ExternalLink, 
  Eye, 
  EyeOff,
  Copy,
  Check
} from 'lucide-react';

const LocationManagement: React.FC = () => {
  const { locations, addLocation, updateLocation, deleteLocation } = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLocation) {
      updateLocation(editingLocation, formData);
      setEditingLocation(null);
    } else {
      addLocation(formData);
      setShowAddForm(false);
    }
    
    setFormData({
      name: '',
      address: '',
      description: '',
      isActive: true,
    });
  };

  const handleEdit = (location: any) => {
    setFormData({
      name: location.name,
      address: location.address,
      description: location.description || '',
      isActive: location.isActive,
    });
    setEditingLocation(location.id);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingLocation(null);
    setFormData({
      name: '',
      address: '',
      description: '',
      isActive: true,
    });
  };

  const copyToClipboard = async (text: string, locationId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(locationId);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const toggleLocationStatus = (id: string, currentStatus: boolean) => {
    updateLocation(id, { isActive: !currentStatus });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#2d4170] to-[#3a4f7a] px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-white mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">Location Management</h1>
                <p className="text-blue-100 opacity-80">Manage visitor registration locations</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 bg-[#EB6E38] hover:bg-[#d85a2a] text-white rounded-lg transition duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="border-b border-gray-200 p-8 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Main Office, Research Lab"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Full address of the location"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Optional description for visitors"
                  rows={2}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  {editingLocation ? 'Update Location' : 'Add Location'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Locations List */}
        <div className="p-8">
          {locations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No locations yet</h3>
              <p className="text-gray-500 mb-4">Create your first location to start managing visitor registrations.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Add First Location
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {locations.map((location) => (
                <div key={location.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                        <button
                          onClick={() => toggleLocationStatus(location.id, location.isActive)}
                          className={`p-1 rounded-full transition duration-200 ${
                            location.isActive 
                              ? 'text-green-600 hover:bg-green-100' 
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={location.isActive ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                        >
                          {location.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          location.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {location.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                      {location.description && (
                        <p className="text-sm text-gray-500 mb-3">{location.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(location)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition duration-200"
                        title="Edit location"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteLocation(location.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                        title="Delete location"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Registration URL */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Registration URL:</label>
                      <button
                        onClick={() => copyToClipboard(`${window.location.origin}/register/${location.registrationUrl}`, location.id)}
                        className="flex items-center text-sm text-purple-600 hover:text-purple-700 transition duration-200"
                      >
                        {copiedUrl === location.id ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 text-sm bg-white px-3 py-2 rounded border text-gray-800 font-mono">
                        {window.location.origin}/register/{location.registrationUrl}
                      </code>
                      <a
                        href={`/register/${location.registrationUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded transition duration-200"
                        title="Open registration page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={location.qrCodeUrl}
                        alt={`QR Code for ${location.name}`}
                        className="w-16 h-16 border border-gray-200 rounded"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-700">QR Code</p>
                        <p className="text-xs text-gray-500">Scan to register</p>
                      </div>
                    </div>
                    <a
                      href={location.qrCodeUrl}
                      download={`${location.name}-qr-code.png`}
                      className="flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition duration-200"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Download
                    </a>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    Created: {new Date(location.createdAt).toLocaleDateString()}
                    {location.updatedAt !== location.createdAt && (
                      <span className="ml-4">
                        Updated: {new Date(location.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationManagement;