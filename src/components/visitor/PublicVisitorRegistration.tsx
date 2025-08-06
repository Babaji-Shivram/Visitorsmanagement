import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { UserPlus, Phone, Mail, Building, MessageSquare, CreditCard, Camera, Check, X, Upload } from 'lucide-react';
import { apiService, type Location, type StaffMember } from '../../services/apiService';

const PublicVisitorRegistration: React.FC = () => {
  const { locationUrl } = useParams<{ locationUrl: string }>();
  const { settings } = useSettings();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<Location | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load location and staff data
  useEffect(() => {
    const loadData = async () => {
      if (!locationUrl) {
        setError('No location URL provided');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Loading location with URL:', locationUrl);
        
        // Get location by URL
        const locationData = await apiService.getLocationByUrl(locationUrl);
        console.log('Location data received:', locationData);
        
        if (locationData) {
          setLocation(locationData);
          
          // Get staff for this location
          const locationStaff = await apiService.getStaffByLocation(locationData.id);
          console.log('Staff data received:', locationStaff);
          
          // If no staff for this location, get all active staff
          if (locationStaff.length === 0) {
            const allActiveStaff = await apiService.getActiveStaff();
            setStaffMembers(allActiveStaff);
          } else {
            setStaffMembers(locationStaff);
          }
        } else {
          setError(`No location found with URL: ${locationUrl}`);
        }
      } catch (error) {
        console.error('Error loading location data:', error);
        setError(`Failed to load location: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [locationUrl]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startCamera = useCallback(async () => {
    try {
      console.log('Starting camera with mobile:', isMobile);
      
      // First check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: isMobile ? 'user' : 'environment',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      };

      console.log('Requesting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream obtained:', stream);
      
      streamRef.current = stream;
      
      // Show camera modal first
      setShowCamera(true);
      setVideoReady(false);
      
      // Wait a bit for the modal to render, then set the video source
      setTimeout(() => {
        if (videoRef.current && stream) {
          console.log('Setting video source');
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);

      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

    } catch (error) {
      console.error('Error accessing camera:', error);
      if (error instanceof Error) {
        alert(`Unable to access camera: ${error.message}`);
      } else {
        alert('Unable to access camera. Please check permissions and try again.');
      }
    }
  }, [isMobile]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Enable image smoothing for better quality
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64 with high quality
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedPhoto(photoDataUrl);
        
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 50, 50]);
        }
      }
    }
    stopCamera();
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setVideoReady(false);
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.fullName || !formData.phoneNumber || !formData.purposeOfVisit) {
      alert('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    if (!location) {
      alert('Location information not available');
      setIsSubmitting(false);
      return;
    }

    try {
      const visitorData = {
        locationId: location.id,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email || undefined,
        companyName: formData.companyName || undefined,
        purposeOfVisit: formData.purposeOfVisit,
        whomToMeet: formData.whomToMeet || 'Walk-in',
        dateTime: new Date().toISOString(),
        idProofType: formData.idProofType || undefined,
        idProofNumber: formData.idProofNumber || undefined,
        photoUrl: capturedPhoto || undefined,
      };

      const success = await apiService.registerVisitor(visitorData);
      
      if (success) {
        setIsSubmitted(true);
        
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Error submitting visitor registration:', error);
      alert('Error submitting registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading location information...</div>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Location Not Found</div>
          <div className="text-gray-600 mb-4">
            {error || `The requested location URL "${locationUrl}" is not valid.`}
          </div>
          <div className="text-sm text-gray-500">
            Debug: URL parameter = {locationUrl || 'undefined'}
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your visit has been registered. The staff member will be notified for approval.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                You will receive an email notification once your visit is approved.
                Please wait at the reception area.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-500 mb-1">Visiting</div>
              <div className="font-medium text-gray-900">{location?.name}</div>
              <div className="text-sm text-gray-600">{location?.address}</div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#EB6E38] hover:bg-[#d85a2a] text-white py-3 px-4 rounded-lg transition duration-200"
            >
              Register Another Visitor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Babajishivram Branding */}
          <div className="bg-gradient-to-r from-[#2d4170] to-[#3a4f7a] px-8 py-6">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mr-3 overflow-hidden">
                <img 
                  src="/Babaji Icon.png" 
                  alt="Babaji Icon" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Babajishivram</h1>
                <p className="text-blue-100 opacity-80">Visitor Registration - {location?.name}</p>
              </div>
            </div>
          </div>

          {/* Camera Modal */}
          {showCamera && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Take Photo</h3>
                  <button
                    onClick={stopCamera}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: '240px' }}>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover rounded-lg"
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => console.log('Video metadata loaded')}
                    onCanPlay={() => {
                      console.log('Video can play');
                      setVideoReady(true);
                    }}
                    onError={(e) => console.error('Video error:', e)}
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  {/* Loading indicator - only show when video is not ready */}
                  {!videoReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <div className="text-gray-500 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                        <div className="text-sm">Initializing camera...</div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={capturePhoto}
                  className="w-full mt-4 bg-[#EB6E38] text-white py-3 px-4 rounded-md hover:bg-[#d85a2a] transition duration-200"
                  disabled={!streamRef.current}
                >
                  <Camera className="w-5 h-5 inline-block mr-2" />
                  Capture Photo
                </button>
              </div>
            </div>
          )}

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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="+91 98765 43210"
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                {staffMembers.length > 0 ? (
                  <select
                    name="whomToMeet"
                    value={formData.whomToMeet}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  >
                    <option value="">Select staff member</option>
                    {staffMembers.map((staff) => (
                      <option key={staff.id} value={`${staff.firstName} ${staff.lastName}`}>
                        {staff.firstName} {staff.lastName} - {staff.designation || 'Staff'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="whomToMeet"
                    value={formData.whomToMeet}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Enter the person you want to meet"
                    required
                  />
                )}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter ID number"
                />
              </div>
            </div>
            )}

            {/* Photo Section */}
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-700 mb-4">Visitor Photo (Optional)</label>
              {capturedPhoto ? (
                <div className="relative inline-block">
                  <img
                    src={capturedPhoto}
                    alt="Captured"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setCapturedPhoto(null)}
                    className="absolute -bottom-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    {/* Camera Button */}
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition duration-200 bg-gray-50 hover:bg-gray-100"
                    >
                      <Camera className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500 text-center">Take Photo</span>
                    </button>
                    
                    {/* Upload Button */}
                    <button
                      type="button"
                      onClick={triggerFileUpload}
                      className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition duration-200 bg-gray-50 hover:bg-gray-100"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500 text-center">Upload Photo</span>
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  
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
            </div>

            {/* Current Date and Time Display */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Visit Date & Time: </span>
                <span className="text-sm text-gray-600 ml-2">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#EB6E38] hover:bg-[#d85a2a] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Registering...' : 'Register Visit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicVisitorRegistration;
