import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useVisitor } from '../../contexts/VisitorContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useStaff } from '../../contexts/StaffContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Phone, Mail, Building, MessageSquare, Calendar, CreditCard, Camera, Check, Upload } from 'lucide-react';

const VisitorRegistration: React.FC = () => {
  const { addVisitor } = useVisitor();
  const { settings } = useSettings();
  const { getActiveStaffMembers } = useStaff();
  const { user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Determine if camera should be available based on user role
  const isCameraAvailable = () => {
    // Camera should only be available for reception users
    // Admin and staff should only have upload option
    return user?.role === 'reception';
  };

  // Debug log
  console.log('VisitorRegistration component mounted', {
    photoEnabled: settings.enabledFields.photo,
    showCamera,
    capturedPhoto: !!capturedPhoto,
    userRole: user?.role,
    cameraAvailable: isCameraAvailable()
  });

  const startCamera = useCallback(async () => {
    try {
      console.log('Starting camera...');
      // Enhanced camera constraints for mobile devices
      const constraints = {
        video: { 
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user', // Front camera for selfies
          aspectRatio: { ideal: 16/9 }
        }
      };

      // Try to get high-quality camera first, fallback to basic if needed
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        // Fallback to basic constraints if high-quality fails
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }
        });
      }
      
      console.log('Camera stream obtained:', stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
        console.log('Camera state set to true');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('NotAllowedError') || errorMessage.includes('Permission denied')) {
        alert('Camera access denied. Please allow camera permissions and try again.');
      } else if (errorMessage.includes('NotFoundError')) {
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
      locationId: '1', // Default to main office for general registration
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

  // Camera Modal Portal Component
  const CameraModal = () => {
    if (!showCamera) return null;
    
    return createPortal(
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            stopCamera();
          }
        }}
      >
        <div 
          style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '24px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Take Your Photo</h3>
            <button
              type="button"
              onClick={stopCamera}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '16px', backgroundColor: 'black', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '300px', objectFit: 'cover' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {/* Camera overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none'
            }}>
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                right: '16px',
                bottom: '16px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                right: '16px'
              }}>
                <p style={{
                  color: 'white',
                  fontSize: '14px',
                  textAlign: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  margin: 0
                }}>
                  Position your face within the frame
                </p>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={capturePhoto}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '24px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Camera size={20} />
              Capture Photo
            </button>
            <button
              type="button"
              onClick={stopCamera}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '24px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
          
          <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', margin: 0 }}>
            Make sure you're in a well-lit area for the best photo quality
          </p>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <CameraModal />

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
                placeholder="+91 98765 43210"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settings.enabledFields.email && (
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

            {settings.enabledFields.companyName && (
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
                {activeStaffMembers.map(staff => (
                  <option key={staff.id} value={`${staff.firstName} ${staff.lastName}`}>
                    {staff.firstName} {staff.lastName} - {staff.designation || 'Staff'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ID Proof Information */}
          {settings.enabledFields.idProof && (
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

          {/* Photo Upload */}
          {settings.enabledFields.photo && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Camera className="inline w-4 h-4 mr-1" />
              Photo {settings.isPhotoMandatory ? '*' : '(Optional)'}
            </label>
            
            <div className="mb-2 text-xs text-blue-600">
              Debug: Photo enabled = {settings.enabledFields.photo ? 'true' : 'false'}, 
              showCamera = {showCamera ? 'true' : 'false'}, 
              capturedPhoto = {capturedPhoto ? 'exists' : 'null'},
              userRole = {user?.role || 'none'},
              cameraAvailable = {isCameraAvailable() ? 'true' : 'false'}
              <br />
              <button 
                type="button" 
                onClick={() => setShowCamera(true)} 
                style={{ backgroundColor: 'red', color: 'white', padding: '4px 8px', margin: '4px', fontSize: '12px' }}
              >
                TEST: Show Camera Modal
              </button>
            </div>
            
            {!capturedPhoto && !showCamera && (
              <div className="space-y-4">
                <div className={`flex gap-4 justify-center items-center ${isCameraAvailable() ? 'flex-col sm:flex-row' : ''}`}>
                  {/* Camera Button - Only show for reception users */}
                  {isCameraAvailable() && (
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Take Photo button clicked!');
                        startCamera();
                      }}
                      className="flex flex-col items-center justify-center w-40 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition duration-200 bg-gray-50 hover:bg-gray-100"
                    >
                      <Camera className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 font-medium">Take Photo</span>
                      <span className="text-xs text-gray-500 text-center">Use camera</span>
                    </button>
                  )}
                  
                  {/* Upload Button - Always available */}
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
                
                <p className="text-xs text-gray-500 text-center">
                  {isCameraAvailable() 
                    ? "PNG, JPG up to 5MB - Take a photo or upload from device" 
                    : "PNG, JPG up to 5MB - Upload from device"}
                </p>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
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
    </>
  );
};

export default VisitorRegistration;