import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { CheckCircle, ArrowLeft, UserCheck } from 'lucide-react';

const ApprovalSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [visitor, setVisitor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVisitor = async () => {
      try {
        if (!id) {
          setError('No visitor ID provided');
          setLoading(false);
          return;
        }

        const visitorData = await apiService.getVisitorById(parseInt(id));
        setVisitor(visitorData);
      } catch (err) {
        console.error('Error loading visitor:', err);
        setError('Failed to load visitor information');
      } finally {
        setLoading(false);
      }
    };

    loadVisitor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading visitor information...</div>
        </div>
      </div>
    );
  }

  if (error || !visitor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-center mb-4">Error</h1>
          <p className="text-gray-600 text-center mb-6">{error || 'Unable to find visitor information'}</p>
          <Link to="/staff/dashboard" className="block text-center w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-green-500 text-white p-6 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Visitor Approved Successfully!</h1>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                Status: Approved
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <UserCheck className="w-5 h-5 text-gray-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Visitor</p>
                  <p className="font-medium">{visitor.fullName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{visitor.phoneNumber}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{visitor.companyName || 'Not provided'}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Visit Date & Time</p>
                  <p className="font-medium">{new Date(visitor.dateTime).toLocaleString()}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Purpose</p>
                  <p className="font-medium">{visitor.purposeOfVisit}</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-green-600 mb-6">
                The visitor has been notified of your approval.
              </p>
              
              <Link 
                to="/staff/dashboard" 
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalSuccess;
