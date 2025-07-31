import React, { useState } from 'react';
import { useVisitor } from '../../contexts/VisitorContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useStaff } from '../../contexts/StaffContext';
import { UserPlus, Phone, Mail, Building, MessageSquare, Calendar, CreditCard, Camera, Check } from 'lucide-react';

const VisitorRegistration: React.FC = () => {
  const { addVisitor } = useVisitor();
  const { settings } = useSettings();
  const { getActiveStaffMembers } = useStaff();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    companyName: '',
    purposeOfVisit: '',
    whomToMeet: '',
    idProofType: '',
    idProofNumber: '',
  });

  const activeStaffMembers = getActiveStaffMembers();


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const visitorData = {
      ...formData,
      locationId: '1', // Default to main office for general registration
      dateTime: new Date().toISOString(),
      photoUrl: '', // Would be populated by file upload in production
    };

    addVisitor(visitorData);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        companyName: '',
        purposeOfVisit: '',
        whomToMeet: '',
        idProofType: '',
        idProofNumber: '',
      });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your visit has been registered. The staff member will be notified for approval.
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              You will receive an email notification once your visit is approved.
              Please wait at the reception area.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#2d4170] to-[#3a4f7a] px-8 py-6">
          <div className="flex items-center">
            <UserPlus className="w-8 h-8 text-white mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-white">Visitor Registration</h1>
              <p className="text-blue-100 opacity-80">Please fill in your details</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline w-4 h-4 mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="inline w-4 h-4 mr-1" />
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Your company"
              />
            </div>
          </div>

          {/* Visit Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="inline w-4 h-4 mr-1" />
                Purpose of Visit *
              </label>
              <select
                name="purposeOfVisit"
                value={formData.purposeOfVisit}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required
              >
                <option value="">Select purpose</option>
                {settings.purposeOfVisitOptions.map(purpose => (
                  <option key={purpose} value={purpose}>{purpose}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Whom to Meet *
              </label>
              <select
                name="whomToMeet"
                value={formData.whomToMeet}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required
              >
                <option value="">Select staff member</option>
                {activeStaffMembers.map(staff => (
                  <option key={staff.id} value={`${staff.firstName} ${staff.lastName}`}>
                    {staff.firstName} {staff.lastName} - {staff.designation || 'Staff'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ID Proof Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="inline w-4 h-4 mr-1" />
                ID Proof Type
              </label>
              <select
                name="idProofType"
                value={formData.idProofType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">Select ID type</option>
                {settings.idTypeOptions.map(idType => (
                  <option key={idType} value={idType}>{idType}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Number
              </label>
              <input
                type="text"
                name="idProofNumber"
                value={formData.idProofNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter ID number"
              />
            </div>
          </div>

          {/* Photo Upload */}
          {settings.enabledFields.photo && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Camera className="inline w-4 h-4 mr-1" />
              Photo {settings.isPhotoMandatory ? '*' : '(Optional)'}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition duration-200">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload a photo or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>
          )}

          {/* Current Date and Time Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Visit Date & Time: </span>
              <span className="text-sm text-gray-600 ml-2">
                {new Date().toLocaleString()}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#EB6E38] hover:bg-[#d85a2a] text-white font-medium py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Register Visit
          </button>
        </form>
      </div>
    </div>
  );
};

export default VisitorRegistration;