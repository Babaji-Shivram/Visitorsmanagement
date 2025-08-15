import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useVisitor } from '../../contexts/VisitorContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useStaff } from '../../contexts/StaffContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Phone, Mail, Building, MessageSquare, Calendar, CreditCard, Camera, Check, Upload, AlertCircle } from 'lucide-react';
import { apiService, type ReturningVisitorData } from '../../services/apiService';

const VisitorRegistration: React.FC = () => {
  const { addVisitor } = useVisitor();
  const { settings } = useSettings();
  const { getActiveStaffMembers } = useStaff();
  const { user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingReturningVisitor, setIsCheckingReturningVisitor] = useState(false);
  const [returningVisitorInfo, setReturningVisitorInfo] = useState<ReturningVisitorData | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    phoneNumber: '',
    fullName: '',
    email: '',
    companyName: '',
    whomToMeet: '',
    purposeOfMeeting: '',
    idProofType: 'aadhar',
    idProofNumber: '',
    vehicleNumber: '',
    emergencyContact: '',
    notes: '',
    photo: ''
  });

  const isCameraAvailable = () => {
    return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
  };

  // Repeated customer detection
  const checkReturningVisitor = async (phoneNumber: string) => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setReturningVisitorInfo(null);
      return;
    }

    try {
      setIsCheckingReturningVisitor(true);
      console.log('📱 Checking for returning visitor with phone:', phoneNumber);
      
      const visitorData = await apiService.getVisitorByPhoneNumber(phoneNumber);
      console.log('📱 API Response:', visitorData);
      
      if (visitorData && visitorData.isReturningVisitor) {
        console.log('📱 Returning visitor found:', visitorData);
        setReturningVisitorInfo(visitorData);
        
        // Pre-fill form data excluding whomToMeet and purposeOfMeeting
        setFormData(prev => ({
          ...prev,
          fullName: visitorData.fullName || '',
          email: visitorData.email || '',
          companyName: visitorData.companyName || '',
          idProofType: visitorData.idProofType || 'aadhar',
          idProofNumber: visitorData.idProofNumber || ''
        }));
      } else {
        console.log('📱 New visitor - no previous records found');
        setReturningVisitorInfo(null);
      }
    } catch (error) {
      console.log('📱 Error checking for returning visitor:', error);
      setReturningVisitorInfo(null);
    } finally {
      setIsCheckingReturningVisitor(false);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, phoneNumber: value }));
    
    // Check for returning visitor when phone number is complete
    if (value.length >= 10) {
      checkReturningVisitor(value);
    } else {
      setReturningVisitorInfo(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    // Use special handler for phone number
    if (e.target.name === 'phoneNumber') {
      handlePhoneNumberChange(e as React.ChangeEvent<HTMLInputElement>);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const startCamera = useCallback(async () => {
    try {
      const attempts = [
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
        alert('No camera found. Please ensure your device has a camera or upload a photo instead.');
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
      }
    }
  }, [stopCamera]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const removePhoto = () => {
    setCapturedPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.phoneNumber.trim() || !formData.fullName.trim() || !formData.whomToMeet.trim() || !formData.purposeOfMeeting.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addVisitor({
        ...formData,
        photo: capturedPhoto || formData.photo,
        location: user?.location || 'Default Location',
        staffName: user?.name || 'System'
      });
      
      setIsSubmitted(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          phoneNumber: '',
          fullName: '',
          email: '',
          companyName: '',
          whomToMeet: '',
          purposeOfMeeting: '',
          idProofType: 'aadhar',
          idProofNumber: '',
          vehicleNumber: '',
          emergencyContact: '',
          notes: '',
          photo: ''
        });
        setCapturedPhoto(null);
        setIsSubmitted(false);
        setReturningVisitorInfo(null);
      }, 3000);
    } catch (error) {
      console.error('Error submitting visitor:', error);
      alert('Error registering visitor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStaffMembers = getActiveStaffMembers();

  const CameraModal = () => {
    if (!showCamera) return null;

    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75">
        <div className="relative w-full max-w-md mx-4">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Take Photo</h3>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
                onLoadedMetadata={() => setVideoReady(true)}
              />
              {videoReady && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>,
      document.body
    );
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <Check className="w-16 h-16 text-green-500 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
        <p className="text-gray-600">The visitor has been registered successfully.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <UserPlus className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Register New Visitor</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone Number - First Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
                required
              />
              {isCheckingReturningVisitor && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            
            {/* Returning Visitor Indicator */}
            {returningVisitorInfo && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-800 font-medium">
                    Welcome back! Last visit: {new Date(returningVisitorInfo.lastVisitDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Previous details have been pre-filled. Please update "whom to meet" and purpose.
                </p>
              </div>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter company name"
            />
          </div>

          {/* Whom to Meet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Whom to Meet *
            </label>
            <select
              name="whomToMeet"
              value={formData.whomToMeet}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select staff member</option>
              {activeStaffMembers.map(staff => (
                <option key={staff.id} value={staff.name}>
                  {staff.name} - {staff.department}
                </option>
              ))}
            </select>
          </div>

          {/* Purpose of Meeting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Purpose of Meeting *
            </label>
            <textarea
              name="purposeOfMeeting"
              value={formData.purposeOfMeeting}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter purpose of meeting"
              required
            />
          </div>

          {/* ID Proof Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-2" />
              ID Proof Type
            </label>
            <select
              name="idProofType"
              value={formData.idProofType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="aadhar">Aadhar Card</option>
              <option value="pan">PAN Card</option>
              <option value="driving_license">Driving License</option>
              <option value="passport">Passport</option>
              <option value="voter_id">Voter ID</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* ID Proof Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Proof Number
            </label>
            <input
              type="text"
              name="idProofNumber"
              value={formData.idProofNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter ID proof number"
            />
          </div>

          {/* Vehicle Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Number
            </label>
            <input
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter vehicle number"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact
            </label>
            <input
              type="tel"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter emergency contact number"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes"
            />
          </div>

          {/* Photo Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo
            </label>
            {capturedPhoto ? (
              <div className="space-y-4">
                <img
                  src={capturedPhoto}
                  alt="Visitor"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                />
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retake Photo
                  </button>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                {isCameraAvailable() && (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </button>
                )}
                <label className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Registering...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Register Visitor
              </>
            )}
          </button>
        </form>
      </div>

      <CameraModal />
    </div>
  );
};

export default VisitorRegistration;
