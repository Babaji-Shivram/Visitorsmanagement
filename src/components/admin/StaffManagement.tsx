import React, { useState, useRef } from 'react';
import { useStaff } from '../../contexts/StaffContext';
import { useLocation } from '../../contexts/LocationContext';
import ConfirmationDialog from '../common/ConfirmationDialog';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  User,
  Camera,
  Eye,
  EyeOff,
  Save,
  X,
  Upload,
  Smartphone,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const StaffManagement: React.FC = () => {
  const { staffMembers, addStaffMember, updateStaffMember, deleteStaffMember, isLoading, error, reloadStaffMembers } = useStaff();
  const { locations } = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkUploadResults, setBulkUploadResults] = useState<{
    success: number;
    errors: string[];
    total: number;
  } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    staffId: string | null;
    staffName: string;
    isLoading: boolean;
  }>({
    isOpen: false,
    staffId: null,
    staffName: '',
    isLoading: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    locationId: '',
    email: '',
    password: '',
    mobileNumber: '',
    phoneNumber: '',
    extension: '',
    designation: '',
    role: 'staff' as 'admin' | 'reception' | 'staff',
    photoUrl: '',
    isActive: true,
    canLogin: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const staffData = {
      ...formData,
      photoUrl: selectedPhoto || formData.photoUrl,
    };

    if (editingStaff) {
      updateStaffMember(editingStaff, staffData);
      setEditingStaff(null);
    } else {
      addStaffMember(staffData);
      setShowAddForm(false);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      locationId: '',
      email: '',
      password: '',
      mobileNumber: '',
      phoneNumber: '',
      extension: '',
      designation: '',
      role: 'staff' as 'admin' | 'reception' | 'staff',
      photoUrl: '',
      isActive: true,
      canLogin: true,
    });
    setSelectedPhoto(null);
  };

  const handleEdit = (staff: any) => {
    setFormData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      locationId: staff.locationId,
      email: staff.email,
      password: staff.password || '',
      mobileNumber: staff.mobileNumber,
      phoneNumber: staff.phoneNumber,
      extension: staff.extension,
      designation: staff.designation || '',
      role: staff.role || 'staff',
      photoUrl: staff.photoUrl || '',
      isActive: staff.isActive,
      canLogin: staff.canLogin !== undefined ? staff.canLogin : true,
    });
    setSelectedPhoto(staff.photoUrl || null);
    setEditingStaff(staff.id);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingStaff(null);
    resetForm();
  };

  const handleDeleteClick = (staff: any) => {
    setDeleteConfirmation({
      isOpen: true,
      staffId: staff.id,
      staffName: `${staff.firstName} ${staff.lastName}`,
      isLoading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.staffId) return;
    
    setDeleteConfirmation(prev => ({ ...prev, isLoading: true }));
    
    try {
      await deleteStaffMember(deleteConfirmation.staffId);
      setDeleteConfirmation({
        isOpen: false,
        staffId: null,
        staffName: '',
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to delete staff member:', error);
      setDeleteConfirmation(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteConfirmation.isLoading) {
      setDeleteConfirmation({
        isOpen: false,
        staffId: null,
        staffName: '',
        isLoading: false
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSelectedPhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleStaffStatus = (id: string, currentStatus: boolean) => {
    updateStaffMember(id, { isActive: !currentStatus });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    return location ? location.name : 'Unknown Location';
  };

  const downloadTemplate = () => {
    const headers = [
      'First Name*',
      'Last Name*',
      'Location Name*',
      'Email Address*',
      'Mobile Number*',
      'Phone Number*',
      'Extension*',
      'Designation',
      'Active (true/false)'
    ];
    
    const sampleData = [
      'John',
      'Doe',
      'Main Office',
      'john.doe@company.com',
      '+1 (555) 200-1010',
      '+1 (555) 100-1010',
      '1010',
      'Software Engineer',
      'true'
    ];
    
    const csvContent = [
      headers.join(','),
      sampleData.join(','),
      '# Available Locations: ' + locations.map(l => l.name).join(', '),
      '# Required fields are marked with *',
      '# Active field should be "true" or "false"'
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff-upload-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      processBulkUpload(csv);
    };
    reader.readAsText(file);
  };

  const processBulkUpload = (csvContent: string) => {
    const lines = csvContent.split('\n').filter(line => 
      line.trim() && !line.startsWith('#')
    );
    
    if (lines.length < 2) {
      setBulkUploadResults({
        success: 0,
        errors: ['CSV file must contain at least a header row and one data row'],
        total: 0
      });
      return;
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    const dataRows = lines.slice(1);
    
    const results = {
      success: 0,
      errors: [] as string[],
      total: dataRows.length
    };
    
    dataRows.forEach((row, index) => {
      try {
        const values = row.split(',').map(v => v.trim());
        const rowNumber = index + 2; // +2 because we start from row 2 (after header)
        
        // Validate required fields
        const firstName = values[0];
        const lastName = values[1];
        const locationName = values[2];
        const email = values[3];
        const mobileNumber = values[4];
        const phoneNumber = values[5];
        const extension = values[6];
        const designation = values[7] || '';
        const isActive = values[8]?.toLowerCase() === 'true';
        
        if (!firstName || !lastName || !locationName || !email || !mobileNumber || !phoneNumber || !extension) {
          results.errors.push(`Row ${rowNumber}: Missing required fields`);
          return;
        }
        
        // Find location by name
        const location = locations.find(l => l.name.toLowerCase() === locationName.toLowerCase());
        if (!location) {
          results.errors.push(`Row ${rowNumber}: Location "${locationName}" not found`);
          return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          results.errors.push(`Row ${rowNumber}: Invalid email format`);
          return;
        }
        
        // Check if staff member already exists
        const existingStaff = staffMembers.find(s => 
          s.email.toLowerCase() === email.toLowerCase()
        );
        if (existingStaff) {
          results.errors.push(`Row ${rowNumber}: Staff member with email "${email}" already exists`);
          return;
        }
        
        // Add staff member
        const staffData = {
          firstName,
          lastName,
          locationId: location.id,
          email,
          password: 'temp123', // Default password for CSV imports
          mobileNumber,
          phoneNumber,
          extension,
          designation,
          role: 'staff' as 'admin' | 'reception' | 'staff', // Default role
          photoUrl: '',
          isActive,
          canLogin: true
        };
        
        addStaffMember(staffData);
        results.success++;
        
      } catch (error) {
        results.errors.push(`Row ${index + 2}: Error processing row - ${error}`);
      }
    });
    
    setBulkUploadResults(results);
    
    // Clear file input
    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
  };

  const closeBulkUpload = () => {
    setShowBulkUpload(false);
    setBulkUploadResults(null);
  };
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#2d4170] to-[#3a4f7a] px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-white mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">Staff Management</h1>
                <p className="text-blue-100 opacity-80">Manage staff members and their information</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => reloadStaffMembers()}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                disabled={isLoading}
              >
                <Users className="w-4 h-4 mr-2" />
                {isLoading ? 'Loading...' : 'Reload'}
              </button>
              <button
                onClick={() => setShowBulkUpload(true)}
                className="flex items-center px-4 py-2 bg-[#EB6E38] hover:bg-[#d85a2a] text-white rounded-lg transition duration-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-4 py-2 bg-[#EB6E38] hover:bg-[#d85a2a] text-white rounded-lg transition duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff Member
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Upload Modal */}
        {showBulkUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileSpreadsheet className="w-6 h-6 text-white mr-2" />
                    <h3 className="text-lg font-semibold text-white">Bulk Upload Staff Members</h3>
                  </div>
                  <button
                    onClick={closeBulkUpload}
                    className="text-white hover:bg-white/20 rounded-lg p-1 transition duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {!bulkUploadResults ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <FileSpreadsheet className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload Staff Members via CSV</h4>
                      <p className="text-gray-600 mb-6">
                        Download the template, fill in your staff data, and upload the CSV file to add multiple staff members at once.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">Instructions:</h5>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>1. Download the CSV template below</li>
                        <li>2. Fill in your staff member information</li>
                        <li>3. Save the file and upload it using the upload button</li>
                        <li>4. Required fields: First Name, Last Name, Location, Email, Mobile, Phone, Extension</li>
                        <li>5. Location names must match existing locations exactly</li>
                      </ul>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={downloadTemplate}
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download Template
                      </button>
                      
                      <div className="flex-1">
                        <input
                          ref={csvInputRef}
                          type="file"
                          accept=".csv"
                          onChange={handleBulkUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => csvInputRef.current?.click()}
                          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          Upload CSV File
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                        <div>
                          <h6 className="font-medium text-yellow-900">Available Locations:</h6>
                          <p className="text-sm text-yellow-800 mt-1">
                            {locations.map(l => l.name).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      {bulkUploadResults.success > 0 ? (
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      ) : (
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      )}
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload Results</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{bulkUploadResults.total}</div>
                        <div className="text-sm text-blue-800">Total Rows</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{bulkUploadResults.success}</div>
                        <div className="text-sm text-green-800">Successful</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{bulkUploadResults.errors.length}</div>
                        <div className="text-sm text-red-800">Errors</div>
                      </div>
                    </div>
                    
                    {bulkUploadResults.errors.length > 0 && (
                      <div className="bg-red-50 rounded-lg p-4">
                        <h5 className="font-medium text-red-900 mb-2">Errors:</h5>
                        <div className="max-h-40 overflow-y-auto">
                          {bulkUploadResults.errors.map((error, index) => (
                            <div key={index} className="text-sm text-red-800 mb-1">
                              • {error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-center">
                      <button
                        onClick={closeBulkUpload}
                        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-200"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="border-b border-gray-200 p-8 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {selectedPhoto ? (
                      <img
                        src={selectedPhoto}
                        alt="Staff photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </button>
                  <p className="text-sm text-gray-500 mt-1">Optional - JPG, PNG up to 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <select
                    name="locationId"
                    value={formData.locationId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select location</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="staff">Staff</option>
                    <option value="reception">Receptionist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Senior Engineer, Manager"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="email@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+1 (555) 200-0000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extension *
                  </label>
                  <input
                    type="text"
                    name="extension"
                    value={formData.extension}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="1001"
                    required
                  />
                </div>
              </div>

              {/* Password and Login Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter login password"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Password for staff member to login to the system
                  </p>
                </div>
                <div className="flex items-center h-fit pt-6">
                  <input
                    type="checkbox"
                    id="canLogin"
                    name="canLogin"
                    checked={formData.canLogin}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canLogin" className="ml-2 text-sm text-gray-700">
                    Allow system login
                  </label>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active staff member
                </label>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Staff List */}
        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading staff members...</h3>
              <p className="text-gray-500">Please wait while we fetch the data.</p>
            </div>
          ) : staffMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members yet</h3>
              <p className="text-gray-500 mb-4">Add your first staff member to get started.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Add First Staff Member
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {staffMembers.map((staff) => (
                <div key={staff.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {staff.photoUrl ? (
                          <img
                            src={staff.photoUrl}
                            alt={`${staff.firstName} ${staff.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {staff.firstName} {staff.lastName}
                        </h3>
                        {staff.designation && (
                          <p className="text-sm text-gray-600">{staff.designation}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleStaffStatus(staff.id, staff.isActive)}
                        className={`p-1 rounded-full transition duration-200 ${
                          staff.isActive 
                            ? 'text-green-600 hover:bg-green-100' 
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={staff.isActive ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                      >
                        {staff.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        staff.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {staff.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {getLocationName(staff.locationId)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {staff.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Smartphone className="w-4 h-4 mr-2 text-gray-400" />
                      {staff.mobileNumber}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {staff.phoneNumber} ext. {staff.extension}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(staff)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition duration-200"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(staff)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition duration-200"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    Added: {new Date(staff.createdAt).toLocaleDateString()}
                    {staff.updatedAt !== staff.createdAt && (
                      <span className="ml-4">
                        Updated: {new Date(staff.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        title="Delete Staff Member"
        message={`Are you sure you want to delete "${deleteConfirmation.staffName}"? This action cannot be undone and will remove all their access to the system.`}
        confirmText="Delete Staff Member"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={deleteConfirmation.isLoading}
      />
    </div>
  );
};

export default StaffManagement;