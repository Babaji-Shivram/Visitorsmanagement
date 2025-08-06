import React, { useState } from 'react';
import { useVisitor } from '../../contexts/VisitorContext';
import { useAuth } from '../../contexts/AuthContext';
import { Check, X, Clock, User, Phone, Building, MessageSquare, Calendar, RefreshCw, UserCheck } from 'lucide-react';

const StaffApproval: React.FC = () => {
  const { visitors, updateVisitorStatus } = useVisitor();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'pending' | 'all'>('pending');
  const [actioningVisitor, setActioningVisitor] = useState<string | null>(null);
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    visitorId: string | null;
    visitorName: string;
    currentDate: string;
    newDate: string;
    newTime: string;
  }>({
    isOpen: false,
    visitorId: null,
    visitorName: '',
    currentDate: '',
    newDate: '',
    newTime: ''
  });

  const pendingVisitors = visitors.filter(v => 
    v.status === 'awaiting_approval' && v.whomToMeet === user?.name
  );
  
  const allMyVisitors = visitors.filter(v => v.whomToMeet === user?.name);

  const handleAction = async (visitorId: string, action: 'approved' | 'rejected' | 'rescheduled') => {
    setActioningVisitor(visitorId);
    
    try {
      const success = await updateVisitorStatus(visitorId, action);
      
      if (success) {
        console.log(`✅ Successfully ${action} visitor ${visitorId}`);
      } else {
        console.error(`❌ Failed to ${action} visitor ${visitorId}`);
        alert(`Failed to ${action} visitor. Please try again.`);
      }
    } catch (error) {
      console.error(`❌ Error updating visitor status:`, error);
      alert(`Error updating visitor status. Please try again.`);
    } finally {
      setActioningVisitor(null);
    }
  };

  // Handle reschedule modal
  const openRescheduleModal = (visitor: any) => {
    const currentDateTime = new Date(visitor.dateTime);
    setRescheduleModal({
      isOpen: true,
      visitorId: visitor.id,
      visitorName: visitor.fullName,
      currentDate: visitor.dateTime,
      newDate: currentDateTime.toISOString().split('T')[0],
      newTime: currentDateTime.toTimeString().slice(0, 5)
    });
  };

  const closeRescheduleModal = () => {
    setRescheduleModal({
      isOpen: false,
      visitorId: null,
      visitorName: '',
      currentDate: '',
      newDate: '',
      newTime: ''
    });
  };

  const handleReschedule = async () => {
    if (!rescheduleModal.visitorId || !rescheduleModal.newDate || !rescheduleModal.newTime) {
      return;
    }

    setActioningVisitor(rescheduleModal.visitorId);
    
    try {
      // Combine date and time (would be used in real API call)
      // const newDateTime = new Date(`${rescheduleModal.newDate}T${rescheduleModal.newTime}`);
      
      // Here you would typically call an API to update the visitor's date/time
      // For now, we'll just update the status to rescheduled
      await updateVisitorStatus(rescheduleModal.visitorId, 'rescheduled');
      
      closeRescheduleModal();
    } catch (error) {
      console.error('Error rescheduling visitor:', error);
    } finally {
      setActioningVisitor(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      awaiting_approval: { color: 'bg-yellow-100 text-yellow-800', text: 'Awaiting Approval' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      rescheduled: { color: 'bg-blue-100 text-blue-800', text: 'Rescheduled' },
      checked_in: { color: 'bg-purple-100 text-purple-800', text: 'Checked In' },
      checked_out: { color: 'bg-gray-100 text-gray-800', text: 'Checked Out' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.awaiting_approval;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const displayVisitors = selectedTab === 'pending' ? pendingVisitors : allMyVisitors;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#2d4170] to-[#3a4f7a] px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-white mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">Staff Approval Center</h1>
                <p className="text-blue-100 opacity-80">Review and manage your visitor requests</p>
              </div>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2 text-white text-center">
              <div className="text-2xl font-bold">{pendingVisitors.length}</div>
              <div className="text-sm text-indigo-100">Pending Approval</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8">
            <button
              onClick={() => setSelectedTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                selectedTab === 'pending'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Approvals ({pendingVisitors.length})
            </button>
            <button
              onClick={() => setSelectedTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                selectedTab === 'all'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All My Visitors ({allMyVisitors.length})
            </button>
          </nav>
        </div>

        <div className="p-8">
          {displayVisitors.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-12 h-12 text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No visitors found</h3>
              <p className="text-gray-500">
                {selectedTab === 'pending' 
                  ? 'No pending approval requests at the moment.'
                  : 'No visitors have requested to meet with you yet.'
                }
              </p>
              {selectedTab === 'pending' && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-700">
                    You'll receive notifications when visitors request to meet with you.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {displayVisitors.map((visitor) => (
                <div key={visitor.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{visitor.fullName}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {visitor.phoneNumber}
                            </div>
                            {visitor.companyName && (
                              <div className="flex items-center">
                                <Building className="w-4 h-4 mr-1" />
                                {visitor.companyName}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(visitor.status)}
                          <div className="text-sm text-gray-500 mt-1 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(visitor.dateTime).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-start">
                          <MessageSquare className="w-4 h-4 text-indigo-500 mr-2 mt-0.5" />
                          <div>
                            <span className="text-sm font-medium text-indigo-700">Purpose of Visit:</span>
                            <p className="text-sm text-gray-700 mt-1">{visitor.purposeOfVisit}</p>
                          </div>
                        </div>
                      </div>

                      {visitor.status === 'awaiting_approval' && (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleAction(visitor.id, 'approved')}
                            disabled={actioningVisitor === visitor.id}
                            className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition duration-200 disabled:opacity-50"
                          >
                            {actioningVisitor === visitor.id ? (
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4 mr-2" />
                            )}
                            Approve
                          </button>
                          
                          <button
                            onClick={() => handleAction(visitor.id, 'rejected')}
                            disabled={actioningVisitor === visitor.id}
                            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition duration-200 disabled:opacity-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </button>
                          
                          <button
                            onClick={() => openRescheduleModal(visitor)}
                            disabled={actioningVisitor === visitor.id}
                            className="flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition duration-200 disabled:opacity-50"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Reschedule
                          </button>
                        </div>
                      )}

                      {visitor.approvedAt && (
                        <div className="mt-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Check className="w-4 h-4 text-emerald-500 mr-1" />
                            Approved on {new Date(visitor.approvedAt).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reschedule Visitor
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Visitor:</strong> {rescheduleModal.visitorName}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Current Date/Time:</strong> {new Date(rescheduleModal.currentDate).toLocaleString()}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={rescheduleModal.newDate}
                  onChange={(e) => setRescheduleModal(prev => ({
                    ...prev,
                    newDate: e.target.value
                  }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Time
                </label>
                <input
                  type="time"
                  value={rescheduleModal.newTime}
                  onChange={(e) => setRescheduleModal(prev => ({
                    ...prev,
                    newTime: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeRescheduleModal}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-md transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={!rescheduleModal.newDate || !rescheduleModal.newTime || actioningVisitor === rescheduleModal.visitorId}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition duration-200"
              >
                {actioningVisitor === rescheduleModal.visitorId ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Rescheduling...
                  </>
                ) : (
                  'Reschedule'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffApproval;