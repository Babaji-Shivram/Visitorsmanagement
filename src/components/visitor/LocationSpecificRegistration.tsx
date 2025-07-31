import React, { useState, useRef, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useVisitor } from '../../contexts/VisitorContext';
import { useLocation } from '../../contexts/LocationContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useStaff } from '../../contexts/StaffContext';
import { UserPlus, Phone, Mail, Building, MessageSquare, Calendar, CreditCard, Camera, Check, MapPin, X } from 'lucide-react';

const LocationSpecificRegistration: React.FC = () => {
  const { locationUrl } = useParams<{ locationUrl: string }>();
  const { addVisitor } = useVisitor();
  const { getLocationByUrl } = useLocation();
  const { settings } = useSettings();
  const { getStaffMembersByLocation, getActiveStaffMembers } = useStaff();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const location = locationUrl ? getLocationByUrl(locationUrl) : null;

  // Get staff members for this location, fallback to all active staff if none found
  const locationStaff = location ? getStaffMembersByLocation(location.id) : [];
  const availableStaff = locationStaff.length > 0 ? locationStaff : getActiveStaffMembers();

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

  if (!location) {
    return <Navigate to="/register" replace />;
  }

  if (!location.isActive) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Unavailable</h2>
          <p className="text-gray-600">
            This registration location is currently inactive. Please contact reception for assistance.
          </p>
        </div>
      </div>
    );
  }

  const purposeOptions = [
    'Business Meeting',
    'Interview',
    'Consultation',
    'Delivery',
    'Maintenance',
    'Training',
    'Other'
  ];

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(photoDataUrl);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const visitorData = {
      ...formData,
      locationId: location.id,
      dateTime: new Date().toISOString(),
      photoUrl: capturedPhoto || '',
    };

    addVisitor(visitorData);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setCapturedPhoto(null);
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
            Your visit to <strong>{location.name}</strong> has been registered. The staff member will be notified for approval.
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
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Visitor Registration</h1>
              <div className="flex items-center text-blue-100 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{location.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-[#2d4170]/5 px-8 py-4 border-b border-[#2d4170]/10">
          <div className="text-sm text-[#2d4170]">
            <p className="font-medium">{location.address}</p>
            {location.description && (
              <p className="text-[#2d4170]/80 mt-1">{location.description}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Photo Capture Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Camera className="inline w-4 h-4 mr-1" />
              Visitor Photo {settings.isPhotoMandatory ? '*' : ''}
            </label>
            
            {!capturedPhoto && !showCamera && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition duration-200">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <button
                  type="button"
                  onClick={startCamera}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  Take Photo
                </button>
                <p className="text-xs text-gray-500 mt-2">Click to open camera and capture your photo</p>
              </div>
            )}

            {showCamera && (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex space-x-3 justify-center">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Capture
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {capturedPhoto && (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={capturedPhoto}
                    alt="Captured visitor photo"
                    className="w-full h-64 object-cover rounded-lg border-2 border-green-200"
                  />
                </div>
                <div className="flex space-x-3 justify-center">
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200 flex items-center"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Retake Photo
                  </button>
                </div>
              </div>
            )}
          </div>

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
                {availableStaff.map(staff => (
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
                <option value="Driver's License">Driver's License</option>
                <option value="Passport">Passport</option>
                <option value="National ID">National ID</option>
                <option value="Employee ID">Employee ID</option>
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

export default LocationSpecificRegistration;