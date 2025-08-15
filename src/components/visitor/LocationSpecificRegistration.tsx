import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useVisitor } from '../../contexts/VisitorContext';
import { useLocation } from '../../contexts/LocationContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useStaff } from '../../contexts/StaffContext';
import { apiService, type LocationSettings } from '../../services/apiService';
import { UserPlus, Phone, Mail, Building, MessageSquare, Calendar, CreditCard, Camera, Check, MapPin, X, Upload } from 'lucide-react';

const LocationSpecificRegistration: React.FC = () => {
  const { locationUrl } = useParams<{ locationUrl: string }>();
  const { addVisitor } = useVisitor();
  const { getLocationByUrl } = useLocation();
  const { settings } = useSettings();
  const { getStaffMembersByLocation, getActiveStaffMembers } = useStaff();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [locationSettings, setLocationSettings] = useState<LocationSettings | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const location = locationUrl ? getLocationByUrl(locationUrl) : null;


  // Load location settings
  useEffect(() => {
    const loadLocationSettings = async () => {
      if (location?.id) {
        try {
          const settingsData = await apiService.getLocationSettings(Number(location.id));
          setLocationSettings(settingsData);
        } catch (error) {
          console.error('Failed to load location settings:', error);
          // Fall back to global settings if location settings fail
          setLocationSettings(null);
        }
      }
    };

    loadLocationSettings();
  }, [location?.id]);

  // Listen for settings updates
  useEffect(() => {
    const handleSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.locationId === location?.id) {
        setLocationSettings(prevSettings => {
          if (!prevSettings) return customEvent.detail.settings;
          return {
            ...prevSettings,
            ...customEvent.detail.settings
          };
        });
      }
    };

    window.addEventListener('locationSettingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('locationSettingsUpdated', handleSettingsUpdate);
  }, [location?.id]);

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

  // purpose options come from settings

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }
      const attempts = [
        { video: { facingMode: 'user', width: { ideal: 1280, max: 1920 }, height: { ideal: 720, max: 1080 }, aspectRatio: { ideal: 16/9 } } },
        { video: { facingMode: 'user' } },
        { video: true }
      ] as MediaStreamConstraints[];
      let stream: MediaStream | null = null;
      let lastError: unknown = null;
      for (const c of attempts) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(c);
          if (stream) break;
        } catch (err) {
          lastError = err;
        }
      }
      if (!stream) {
        throw lastError instanceof Error ? lastError : new Error('Failed to access camera');
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (/NotAllowed/i.test(message) || /Permission/i.test(message)) {
        alert('Camera access denied. Please allow camera permissions and try again.');
      } else if (/NotFound/i.test(message)) {
        alert('No camera found. Please ensure your device has a camera.');
      } else {
        alert('Unable to access camera. Please check that no other app is using the camera and try again.');
      }
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
      
      // Use the actual video dimensions for better quality
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Apply any image enhancements
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw the current video frame
        ctx.drawImage(video, 0, 0);
        
        // Convert to JPEG with good quality (0.9 = 90% quality)
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedPhoto(photoDataUrl);
        stopCamera();
        
        // Provide haptic feedback on mobile devices
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    }
  }, [stopCamera]);

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, JPEG)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle orientation changes on mobile
  React.useEffect(() => {
    const handleOrientationChange = () => {
      if (showCamera && videoRef.current) {
        // Small delay to ensure the orientation change is complete
        setTimeout(() => {
          if (videoRef.current) {
            // Force video refresh
            const stream = videoRef.current.srcObject as MediaStream;
            if (stream) {
              videoRef.current.srcObject = null;
              videoRef.current.srcObject = stream;
            }
          }
        }, 100);
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, [showCamera]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create local time instead of UTC
    const now = new Date();
    const localISOTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();
    
    const visitorData = {
      ...formData,
      locationId: location.id,
      dateTime: localISOTime,
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
          {(locationSettings ? locationSettings.enabledFields.photo : settings.enabledFields.photo) && (
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Camera className="inline w-4 h-4 mr-1" />
              Visitor Photo {settings.isPhotoMandatory ? '*' : ''}
            </label>
            
            {!capturedPhoto && !showCamera && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  {/* Camera Button */}
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex flex-col items-center justify-center w-40 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition duration-200 bg-gray-50 hover:bg-gray-100"
                  >
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 font-medium">Take Photo</span>
                    <span className="text-xs text-gray-500 text-center">Use camera</span>
                  </button>
                  
                  {/* Upload Button */}
                  <button
                    type="button"
                    onClick={triggerFileUpload}
                    className="flex flex-col items-center justify-center w-40 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition duration-200 bg-gray-50 hover:bg-gray-100"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 font-medium">Upload Photo</span>
                    <span className="text-xs text-gray-500 text-center">From device</span>
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 text-center">PNG, JPG up to 5MB</p>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {showCamera && (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Camera overlay for better mobile experience */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-4 border-2 border-white/30 rounded-lg"></div>
                    <div className="absolute top-4 left-4 right-4">
                      <p className="text-white text-sm text-center bg-black/50 rounded px-2 py-1">
                        Position your face within the frame
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 justify-center">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full transition duration-200 flex items-center text-lg font-medium shadow-lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Capture Photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Make sure you're in a well-lit area for the best photo quality
                </p>
              </div>
            )}

            {capturedPhoto && (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={capturedPhoto}
                    alt="Captured visitor photo"
                    className="w-full h-64 sm:h-80 object-cover rounded-lg border-2 border-green-200 shadow-lg"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    ✓ Photo captured
                  </div>
                </div>
                <div className="flex space-x-3 justify-center">
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200 flex items-center"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Retake Photo
                  </button>
                </div>
                <p className="text-xs text-green-600 text-center">
                  Photo looks good! You can retake it if needed.
                </p>
              </div>
            )}
            </div>
          )}

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
                placeholder="+91 98765 43210"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(locationSettings ? locationSettings.enabledFields.email : settings.enabledFields.email) && (
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
            )}

            {(locationSettings ? locationSettings.enabledFields.companyName : settings.enabledFields.companyName) && (
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
            )}
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

          {(() => {
            console.log('🔍 LocationSpecificRegistration - Component rendered');
            console.log('🔍 LocationSpecificRegistration - Settings object:', settings);
            console.log('🔍 LocationSpecificRegistration - ID Proof enabled:', settings?.enabledFields?.idProof);
            console.log('🔍 LocationSpecificRegistration - All enabled fields:', settings?.enabledFields);
            return null;
          })()}
          {(locationSettings ? locationSettings.enabledFields.idProof : settings.enabledFields.idProof) && (
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

export default LocationSpecificRegistration;