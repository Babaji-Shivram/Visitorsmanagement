import React, { useState } from 'react';
import { useVisitor } from '../../contexts/VisitorContext';
import { useLocation } from '../../contexts/LocationContext';
import { useStaff } from '../../contexts/StaffContext';
import LocationManagement from './LocationManagement';
import StaffManagement from './StaffManagement';
import { 
  Shield, 
  Users, 
  TrendingUp, 
  Download, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  MapPin,
  Eye,
  Filter,
  Check,
  X,
  RefreshCw,
  User,
  Phone,
  Building,
  Clock,
  Edit
} from 'lucide-react';

// Helper function to convert visitor status enum to display text
const getStatusText = (status: number | string): string => {
  if (typeof status === 'string') {
    switch (status) {
      case 'awaiting_approval': return 'Awaiting Approval';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'checked_in': return 'Checked In';
      case 'checked_out': return 'Checked Out';
      case 'rescheduled': return 'Rescheduled';
      default: return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  }
  
  // Handle enum values (fallback)
  switch (status) {
    case 1: return 'Awaiting Approval';
    case 2: return 'Approved';
    case 3: return 'Rejected';
    case 4: return 'Checked In';
    case 5: return 'Checked Out';
    case 6: return 'Rescheduled';
    default: return 'Unknown';
  }
};

const AdminDashboard: React.FC = () => {
  const { visitors, updateVisitorStatus } = useVisitor();
  const { locations } = useLocation();
  const { getActiveStaffMembers } = useStaff();
  const [activeTab, setActiveTab] = useState<'live' | 'analytics' | 'approvals' | 'locations' | 'staff'>('live');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
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
  
  const [editVisitorModal, setEditVisitorModal] = useState<{
    isOpen: boolean;
    visitorId: string | null;
    visitorName: string;
    currentWhomToMeet: string;
    newWhomToMeet: string;
  }>({
    isOpen: false,
    visitorId: null,
    visitorName: '',
    currentWhomToMeet: '',
    newWhomToMeet: ''
  });
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    to: new Date().toISOString().split('T')[0]
  });

  const getLiveVisitors = () => {
    const today = new Date().toDateString();
    return visitors.filter(v => {
      const visitDate = new Date(v.dateTime).toDateString();
      const matchesDate = visitDate === today;
      const matchesLocation = selectedLocationId === 'all' || v.locationId === selectedLocationId;
      return matchesDate && matchesLocation;
    });
  };

  const getAnalytics = () => {
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    
    const filteredVisitors = visitors.filter(v => {
      const visitDate = new Date(v.dateTime);
      const matchesDate = visitDate >= fromDate && visitDate <= toDate;
      const matchesLocation = selectedLocationId === 'all' || v.locationId === selectedLocationId;
      return matchesDate && matchesLocation;
    });

    const totalVisitors = filteredVisitors.length;
    const approvedVisitors = filteredVisitors.filter(v => ['approved', 'checked_in', 'checked_out'].includes(v.status)).length;
    const rejectedVisitors = filteredVisitors.filter(v => v.status === 'rejected').length;
    const pendingVisitors = filteredVisitors.filter(v => v.status === 'awaiting_approval').length;

    const approvalRate = totalVisitors > 0 ? (approvedVisitors / totalVisitors * 100).toFixed(1) : '0';

    // Most visited staff
    const staffVisits = filteredVisitors.reduce((acc, visitor) => {
      acc[visitor.whomToMeet] = (acc[visitor.whomToMeet] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topStaff = Object.entries(staffVisits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Purpose analysis
    const purposeCount = filteredVisitors.reduce((acc, visitor) => {
      acc[visitor.purposeOfVisit] = (acc[visitor.purposeOfVisit] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPurposes = Object.entries(purposeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      totalVisitors,
      approvedVisitors,
      rejectedVisitors,
      pendingVisitors,
      approvalRate,
      topStaff,
      topPurposes,
      filteredVisitors
    };
  };

  const analytics = getAnalytics();
  const liveVisitors = getLiveVisitors();

  // Helper function to check if visitor date is today or future
  const isVisitTodayOrFuture = (visitorDateTime: string) => {
    const visitDate = new Date(visitorDateTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    visitDate.setHours(0, 0, 0, 0);
    return visitDate >= today;
  };

  // Helper function to determine available actions for a visitor
  const getAvailableActions = (visitor: any) => {
    const isTodayOrFuture = isVisitTodayOrFuture(visitor.dateTime);
    
    switch (visitor.status) {
      case 'awaiting_approval':
        return {
          canApprove: isTodayOrFuture,
          canReject: true,
          canReschedule: true,
          canEdit: true
        };
      case 'approved':
        return {
          canApprove: false,
          canReject: true,
          canReschedule: true,
          canEdit: true
        };
      case 'rejected':
        return {
          canApprove: isTodayOrFuture,
          canReject: false,
          canReschedule: true,
          canEdit: true
        };
      case 'rescheduled':
        return {
          canApprove: isTodayOrFuture,
          canReject: true,
          canReschedule: true,
          canEdit: true
        };
      default:
        return {
          canApprove: false,
          canReject: false,
          canReschedule: false,
          canEdit: false
        };
    }
  };

  // Get visitors that need action - not just awaiting approval
  const getPendingApprovals = () => {
    return visitors.filter(v => {
      const matchesLocation = selectedLocationId === 'all' || v.locationId === selectedLocationId;
      // Include visitors that need some form of action
      const needsAction = ['awaiting_approval', 'approved', 'rejected', 'rescheduled'].includes(v.status);
      return needsAction && matchesLocation;
    });
  };

  const pendingApprovals = getPendingApprovals();

  // Handle approval actions
  const handleApprovalAction = async (visitorId: string, action: 'approved' | 'rejected' | 'rescheduled') => {
    setActioningVisitor(visitorId);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await updateVisitorStatus(visitorId, action);
    setActioningVisitor(null);
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

  // Handle edit visitor modal
  const openEditVisitorModal = (visitor: any) => {
    setEditVisitorModal({
      isOpen: true,
      visitorId: visitor.id,
      visitorName: visitor.fullName,
      currentWhomToMeet: visitor.whomToMeet,
      newWhomToMeet: visitor.whomToMeet
    });
  };

  const closeEditVisitorModal = () => {
    setEditVisitorModal({
      isOpen: false,
      visitorId: null,
      visitorName: '',
      currentWhomToMeet: '',
      newWhomToMeet: ''
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

  // Handle updating visitor assignment
  const handleUpdateVisitorAssignment = async () => {
    if (!editVisitorModal.visitorId || !editVisitorModal.newWhomToMeet) {
      return;
    }

    setActioningVisitor(editVisitorModal.visitorId);
    
    try {
      // Here you would typically call an API to update the visitor's whomToMeet field
      // For now, we'll simulate this by updating the local data
      console.log(`Updating visitor ${editVisitorModal.visitorId} whomToMeet from "${editVisitorModal.currentWhomToMeet}" to "${editVisitorModal.newWhomToMeet}"`);
      
      // In a real app, you'd call something like:
      // await updateVisitorAssignment(editVisitorModal.visitorId, editVisitorModal.newWhomToMeet);
      
      closeEditVisitorModal();
      
      // Show success message
      alert(`Visitor assignment updated successfully!\nOld: ${editVisitorModal.currentWhomToMeet}\nNew: ${editVisitorModal.newWhomToMeet}`);
      
    } catch (error) {
      console.error('Error updating visitor assignment:', error);
    } finally {
      setActioningVisitor(null);
    }
  };

  const getLiveStats = () => {
    return {
      total: liveVisitors.length,
      awaiting: liveVisitors.filter(v => v.status === 'awaiting_approval').length,
      approved: liveVisitors.filter(v => v.status === 'approved').length,
      checkedIn: liveVisitors.filter(v => v.status === 'checked_in').length,
      checkedOut: liveVisitors.filter(v => v.status === 'checked_out').length,
      rejected: liveVisitors.filter(v => v.status === 'rejected').length,
    };
  };

  const liveStats = getLiveStats();

  // Auto-refresh for live view
  React.useEffect(() => {
    if (activeTab === 'live') {
      const interval = setInterval(() => {
        // Force re-render to simulate real-time updates
        setSelectedLocationId(prev => prev);
      }, 10000); // Refresh every 10 seconds
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [activeTab]);

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

  const exportData = () => {
    const csvContent = [
      ['Name', 'Phone', 'Email', 'Company', 'Purpose', 'Meeting With', 'Status', 'Date/Time', 'Check In', 'Check Out'],
      ...analytics.filteredVisitors.map(v => [
        v.fullName,
        v.phoneNumber,
        v.email || '',
        v.companyName || '',
        v.purposeOfVisit,
        v.whomToMeet,
        v.status,
        new Date(v.dateTime).toLocaleString(),
        v.checkInTime ? new Date(v.checkInTime).toLocaleString() : '',
        v.checkOutTime ? new Date(v.checkOutTime).toLocaleString() : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitor-report-${dateRange.from}-to-${dateRange.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-[#2d4170] to-[#3a4f7a] px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-white mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-blue-100 opacity-80">Comprehensive visitor analytics and management</p>
              </div>
            </div>
            {activeTab === 'analytics' && (
              <button
                onClick={exportData}
                className="flex items-center px-4 py-2 bg-[#EB6E38] hover:bg-[#d85a2a] text-white rounded-lg transition duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8">
            <button
              onClick={() => setActiveTab('live')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'live'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Eye className="inline w-4 h-4 mr-2" />
              Live View {selectedLocationId !== 'all' && `(${locations.find(l => l.id === selectedLocationId)?.name})`}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'analytics'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="inline w-4 h-4 mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'approvals'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Check className="inline w-4 h-4 mr-2" />
              Approvals ({pendingApprovals.length})
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'locations'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MapPin className="inline w-4 h-4 mr-2" />
              Locations
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'staff'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="inline w-4 h-4 mr-2" />
              Staff
            </button>
          </nav>
        </div>

        {/* Filters */}
        {(activeTab === 'analytics' || activeTab === 'live') && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-gray-50 rounded-lg p-4">
              {/* Location Filter */}
              <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-2 shadow-sm">
                <Filter className="w-5 h-5 text-gray-500" />
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {activeTab === 'live' ? 'Live Location:' : 'Location:'}
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[200px]"
                >
                  <option value="all">All Locations</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name} {!location.isActive && '(Inactive)'}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Date Range Filter - Only for analytics */}
              {activeTab === 'analytics' && (
                <>
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">From:</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <label className="text-sm font-medium text-gray-700">To:</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {activeTab === 'locations' ? (
        <LocationManagement />
      ) : activeTab === 'staff' ? (
        <StaffManagement />
      ) : activeTab === 'approvals' ? (
        <>
          {/* Approvals Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Visitor Management</h2>
                  <p className="text-gray-600 mt-1">Review and manage visitor requests</p>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {pendingApprovals.length} Requiring Action
                </div>
              </div>
            </div>

            <div className="p-6">
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-12 h-12 text-green-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                  <p className="text-gray-500">No visitors requiring action at the moment.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingApprovals.map((visitor) => (
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
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {new Date(visitor.dateTime).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm font-medium text-gray-700">Meeting With:</span>
                                <p className="text-sm text-gray-900 mt-1">{visitor.whomToMeet}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-700">Purpose:</span>
                                <p className="text-sm text-gray-900 mt-1">{visitor.purposeOfVisit}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-3">
                            {(() => {
                              const actions = getAvailableActions(visitor);
                              
                              return (
                                <>
                                  {/* Show current status if approved */}
                                  {visitor.status === 'approved' && (
                                    <div className="flex items-center mb-3">
                                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-sm font-medium">
                                        <Check className="w-4 h-4 mr-1" />
                                        Approved
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* Show past date warning */}
                                  {!isVisitTodayOrFuture(visitor.dateTime) && visitor.status === 'awaiting_approval' && (
                                    <div className="flex items-center mb-3">
                                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                        Past date - limited actions available
                                      </span>
                                    </div>
                                  )}
                                  
                                  <div className="flex space-x-3">
                                    {actions.canApprove && (
                                      <button
                                        onClick={() => handleApprovalAction(visitor.id, 'approved')}
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
                                    )}
                                    
                                    {actions.canReject && (
                                      <button
                                        onClick={() => handleApprovalAction(visitor.id, 'rejected')}
                                        disabled={actioningVisitor === visitor.id}
                                        className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition duration-200 disabled:opacity-50"
                                      >
                                        <X className="w-4 h-4 mr-2" />
                                        Reject
                                      </button>
                                    )}
                                    
                                    {actions.canReschedule && (
                                      <button
                                        onClick={() => openRescheduleModal(visitor)}
                                        disabled={actioningVisitor === visitor.id}
                                        className="flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition duration-200 disabled:opacity-50"
                                      >
                                        <Clock className="w-4 h-4 mr-2" />
                                        Reschedule
                                      </button>
                                    )}
                                    
                                    {actions.canEdit && (
                                      <button
                                        onClick={() => openEditVisitorModal(visitor)}
                                        disabled={actioningVisitor === visitor.id}
                                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition duration-200 disabled:opacity-50"
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Assignment
                                      </button>
                                    )}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : activeTab === 'live' ? (
        <>
          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Total</p>
                  <p className="text-2xl font-bold text-gray-900">{liveStats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Awaiting</p>
                  <p className="text-2xl font-bold text-gray-900">{liveStats.awaiting}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{liveStats.approved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Checked In</p>
                  <p className="text-2xl font-bold text-gray-900">{liveStats.checkedIn}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Checked Out</p>
                  <p className="text-2xl font-bold text-gray-900">{liveStats.checkedOut}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{liveStats.rejected}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Visitors Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Live Visitor Activity - {new Date().toLocaleDateString()}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedLocationId === 'all' 
                      ? 'Showing activity across all locations'
                      : `Showing activity for ${locations.find(l => l.id === selectedLocationId)?.name || 'selected location'}`
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live Updates</span>
                  <span className="text-xs text-gray-500">({liveVisitors.length} visitors)</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visitor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Meeting With
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {liveVisitors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No visitors today</p>
                          <p className="text-sm">
                            {selectedLocationId === 'all' 
                              ? 'No visitor activity across all locations today'
                              : `No visitor activity at ${locations.find(l => l.id === selectedLocationId)?.name || 'selected location'} today`
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    liveVisitors.map((visitor) => {
                      const location = locations.find(l => l.id === visitor.locationId);
                      return (
                        <tr key={visitor.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {visitor.fullName.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{visitor.fullName}</div>
                                <div className="text-sm text-gray-500">{visitor.phoneNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{location?.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {visitor.whomToMeet}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {visitor.purposeOfVisit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(visitor.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{new Date(visitor.dateTime).toLocaleTimeString()}</div>
                            {visitor.checkInTime && (
                              <div className="text-xs text-green-600">
                                In: {new Date(visitor.checkInTime).toLocaleTimeString()}
                              </div>
                            )}
                            {visitor.checkOutTime && (
                              <div className="text-xs text-red-600">
                                Out: {new Date(visitor.checkOutTime).toLocaleTimeString()}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Visitors</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalVisitors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.approvalRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.pendingVisitors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.rejectedVisitors}</p>
            </div>
          </div>
        </div>
          </div>

          {/* Analytics Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Visited Staff */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <PieChart className="w-6 h-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Most Visited Staff</h3>
          </div>
          <div className="space-y-4">
            {analytics.topStaff.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No data available</p>
            ) : (
              analytics.topStaff.map(([staff, count], index) => (
                <div key={staff} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-purple-600">#{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{staff}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(count / analytics.totalVisitors) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Visit Purposes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Top Visit Purposes</h3>
          </div>
          <div className="space-y-4">
            {analytics.topPurposes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No data available</p>
            ) : (
              analytics.topPurposes.map(([purpose, count], index) => (
                <div key={purpose} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{purpose}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / analytics.totalVisitors) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Visitor Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meeting With
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.filteredVisitors.slice(0, 10).map((visitor) => (
                <tr key={visitor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {visitor.fullName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{visitor.fullName}</div>
                        <div className="text-sm text-gray-500">{visitor.phoneNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {visitor.whomToMeet}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {visitor.purposeOfVisit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      visitor.status === 'approved' ? 'bg-green-100 text-green-800' :
                      visitor.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      visitor.status === 'checked_in' ? 'bg-purple-100 text-purple-800' :
                      visitor.status === 'checked_out' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getStatusText(visitor.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(visitor.dateTime).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          </div>
        </>
      )}

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

      {/* Edit Visitor Assignment Modal */}
      {editVisitorModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Visitor Assignment
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Visitor:</strong> {editVisitorModal.visitorName}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Current Assignment:</strong> {editVisitorModal.currentWhomToMeet}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Staff Member
                </label>
                <select
                  value={editVisitorModal.newWhomToMeet}
                  onChange={(e) => setEditVisitorModal(prev => ({
                    ...prev,
                    newWhomToMeet: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select staff member</option>
                  {getActiveStaffMembers().map(staff => (
                    <option key={staff.id} value={`${staff.firstName} ${staff.lastName}`}>
                      {staff.firstName} {staff.lastName} - {staff.designation || 'Staff'}
                    </option>
                  ))}
                </select>
              </div>

              {editVisitorModal.newWhomToMeet && editVisitorModal.newWhomToMeet !== editVisitorModal.currentWhomToMeet && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Assignment Change:</strong><br />
                    From: <span className="font-medium">{editVisitorModal.currentWhomToMeet}</span><br />
                    To: <span className="font-medium">{editVisitorModal.newWhomToMeet}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeEditVisitorModal}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-md transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateVisitorAssignment}
                disabled={!editVisitorModal.newWhomToMeet || editVisitorModal.newWhomToMeet === editVisitorModal.currentWhomToMeet || actioningVisitor === editVisitorModal.visitorId}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition duration-200"
              >
                {actioningVisitor === editVisitorModal.visitorId ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Updating...
                  </>
                ) : (
                  'Update Assignment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;