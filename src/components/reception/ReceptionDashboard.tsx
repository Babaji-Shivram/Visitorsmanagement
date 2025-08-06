import React, { useState } from 'react';
import { useVisitor } from '../../contexts/VisitorContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  Filter,
  RefreshCw,
  LogIn,
  LogOut,
  Calendar,
  MapPin,
  Check,
  X,
  User,
  Phone,
  Building,
  MessageSquare
} from 'lucide-react';

const ReceptionDashboard: React.FC = () => {
  const { visitors, getVisitorsByDate, checkInVisitor, checkOutVisitor, getStaffInfo, refreshVisitors, updateVisitorStatus } = useVisitor();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
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
  const [activeTab, setActiveTab] = useState<'visitors' | 'analytics' | 'approvals'>('visitors');

  const todayVisitors = getVisitorsByDate(selectedDate);
  
  const filteredVisitors = todayVisitors.filter(visitor => {
    const matchesSearch = visitor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visitor.phoneNumber.includes(searchTerm) ||
                         visitor.whomToMeet.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || visitor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshVisitors();
    setIsRefreshing(false);
  };

  const getStatusStats = () => {
    const stats = {
      total: todayVisitors.length,
      awaiting: todayVisitors.filter(v => v.status === 'awaiting_approval').length,
      approved: todayVisitors.filter(v => v.status === 'approved').length,
      checkedIn: todayVisitors.filter(v => v.status === 'checked_in').length,
      checkedOut: todayVisitors.filter(v => v.status === 'checked_out').length,
      rejected: todayVisitors.filter(v => v.status === 'rejected').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      awaiting_approval: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Awaiting Approval' },
      approved: { color: 'bg-green-100 text-green-800 border-green-200', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', text: 'Rejected' },
      rescheduled: { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Rescheduled' },
      checked_in: { color: 'bg-purple-100 text-purple-800 border-purple-200', text: 'Checked In' },
      checked_out: { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Checked Out' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.awaiting_approval;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const canCheckIn = (visitor: any) => visitor.status === 'approved';
  const canCheckOut = (visitor: any) => visitor.status === 'checked_in';

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
          showCheckInOut: false
        };
      case 'approved':
        return {
          canApprove: false,
          canReject: true,
          canReschedule: true,
          showCheckInOut: true
        };
      case 'rejected':
        return {
          canApprove: isTodayOrFuture,
          canReject: false,
          canReschedule: true,
          showCheckInOut: false
        };
      case 'rescheduled':
        return {
          canApprove: isTodayOrFuture,
          canReject: true,
          canReschedule: true,
          showCheckInOut: false
        };
      default:
        return {
          canApprove: false,
          canReject: false,
          canReschedule: false,
          showCheckInOut: false
        };
    }
  };

  // Get visitors that need action - not just awaiting approval
  const getPendingApprovals = () => {
    return visitors.filter(v => {
      const matchesLocation = user?.locationId ? v.locationId === user.locationId.toString() : true;
      // Include visitors that need some form of action
      const needsAction = ['awaiting_approval', 'approved', 'rejected', 'rescheduled'].includes(v.status);
      return needsAction && matchesLocation;
    });
  };

  const pendingApprovals = getPendingApprovals();

  // Handle approval actions
  const handleApprovalAction = async (visitorId: string, action: 'approved' | 'rejected' | 'rescheduled') => {
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
      // Combine date and time for future enhancement
      // const newDateTime = new Date(`${rescheduleModal.newDate}T${rescheduleModal.newTime}`);
      
      // For now, we'll just update the status to rescheduled
      await updateVisitorStatus(rescheduleModal.visitorId, 'rescheduled');
      
      closeRescheduleModal();
    } catch (error) {
      console.error('Error rescheduling visitor:', error);
    } finally {
      setActioningVisitor(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-[#2d4170] to-[#3a4f7a] px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-white mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">Reception Dashboard</h1>
                <div className="flex items-center space-x-4 text-blue-100 opacity-80">
                  <span>Manage visitor check-ins and check-outs</span>
                  {user?.locationName && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{user.locationName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center px-4 py-2 bg-[#EB6E38] hover:bg-[#d85a2a] text-white rounded-lg transition duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8">
            <button
              onClick={() => setActiveTab('visitors')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'visitors'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="inline w-4 h-4 mr-2" />
              Visitors ({filteredVisitors.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'analytics'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Filter className="inline w-4 h-4 mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                activeTab === 'approvals'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Check className="inline w-4 h-4 mr-2" />
              Actions ({pendingApprovals.length})
            </button>
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'visitors' ? (
            <>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex-1 relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search visitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="awaiting_approval">Awaiting Approval</option>
                    <option value="approved">Approved</option>
                    <option value="checked_in">Checked In</option>
                    <option value="checked_out">Checked Out</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Full Analytics View */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Total</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-600">Awaiting</p>
                      <p className="text-2xl font-bold text-yellow-900">{stats.awaiting}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <UserCheck className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Approved</p>
                      <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <LogIn className="w-8 h-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Checked In</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.checkedIn}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <LogOut className="w-8 h-8 text-gray-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Checked Out</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.checkedOut}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <UserX className="w-8 h-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-600">Rejected</p>
                      <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Analytics Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Activity Timeline</h3>
                  <div className="space-y-3">
                    {filteredVisitors.slice(0, 5).map((visitor) => (
                      <div key={visitor.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {visitor.fullName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{visitor.fullName}</p>
                            <p className="text-xs text-gray-500">{visitor.whomToMeet}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(visitor.status)}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(visitor.dateTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900">Ready to Check In</p>
                        <p className="text-sm text-green-700">{stats.approved} visitors approved</p>
                      </div>
                      <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium text-purple-900">Currently On-Site</p>
                        <p className="text-sm text-purple-700">{stats.checkedIn} visitors checked in</p>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">{stats.checkedIn}</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-yellow-900">Pending Approval</p>
                        <p className="text-sm text-yellow-700">{stats.awaiting} visitors waiting</p>
                      </div>
                      <div className="text-2xl font-bold text-yellow-600">{stats.awaiting}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Filter for Analytics */}
              <div className="flex items-center space-x-4 mb-6">
                <Calendar className="w-5 h-5 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600">Analytics for selected date</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Visitors Table - Always Visible */}
      {activeTab === 'visitors' && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meeting With
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No visitors found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {visitor.fullName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{visitor.fullName}</div>
                            {visitor.companyName && (
                              <div className="text-sm text-gray-500">{visitor.companyName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{visitor.phoneNumber}</div>
                        {visitor.email && (
                          <div className="text-sm text-gray-500">{visitor.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {visitor.purposeOfVisit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{visitor.whomToMeet}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const staffInfo = getStaffInfo(visitor.whomToMeet);
                          return staffInfo ? (
                            <div className="text-sm">
                              <div className="text-gray-900">{staffInfo.phone}</div>
                              <div className="text-gray-500">{staffInfo.email}</div>
                              <div className="text-gray-500">Ext: {staffInfo.extension}</div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">Contact not available</div>
                          );
                        })()}
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {canCheckIn(visitor) && (
                            <button
                              onClick={() => checkInVisitor(visitor.id)}
                              className="inline-flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition duration-200"
                            >
                              <LogIn className="w-3 h-3 mr-1" />
                              Check In
                            </button>
                          )}
                          {canCheckOut(visitor) && (
                            <button
                              onClick={() => checkOutVisitor(visitor.id)}
                              className="inline-flex items-center px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium rounded-md transition duration-200"
                            >
                              <LogOut className="w-3 h-3 mr-1" />
                              Check Out
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approvals Content */}
      {activeTab === 'approvals' && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Visitor Management</h2>
            <span className="text-sm text-gray-500">
              {pendingApprovals.length} visitor{pendingApprovals.length !== 1 ? 's' : ''} requiring action
            </span>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Check className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No visitors requiring action</p>
                <p className="text-sm">All visitors have been processed</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingApprovals.map((visitor) => (
                <div key={visitor.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{visitor.fullName}</h3>
                          {visitor.companyName && (
                            <p className="text-sm text-gray-600">{visitor.companyName}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{visitor.phoneNumber}</span>
                        </div>
                        {visitor.email && (
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{visitor.email}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">Meeting: {visitor.whomToMeet}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-700">
                            Time: {new Date(visitor.dateTime).toLocaleString()}
                          </span>
                          {!isVisitTodayOrFuture(visitor.dateTime) && visitor.status === 'awaiting_approval' && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                              Past date - limited actions
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Purpose of Visit:</p>
                        <p className="text-sm text-gray-600">{visitor.purposeOfVisit}</p>
                      </div>

                      {visitor.notes && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                          <p className="text-sm text-gray-600">{visitor.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      {(() => {
                        const actions = getAvailableActions(visitor);
                        
                        return (
                          <>
                            {/* Show current status if approved */}
                            {visitor.status === 'approved' && (
                              <div className="mb-2">
                                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-sm font-medium">
                                  <Check className="w-4 h-4 mr-1" />
                                  Approved
                                </span>
                              </div>
                            )}
                            
                            {/* Check In/Check Out buttons for approved visitors */}
                            {actions.showCheckInOut && (
                              <div className="space-y-2">
                                {canCheckIn(visitor) && (
                                  <button
                                    onClick={() => checkInVisitor(visitor.id)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition duration-200 w-full justify-center"
                                  >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Check In
                                  </button>
                                )}
                                {canCheckOut(visitor) && (
                                  <button
                                    onClick={() => checkOutVisitor(visitor.id)}
                                    className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-md transition duration-200 w-full justify-center"
                                  >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Check Out
                                  </button>
                                )}
                              </div>
                            )}
                            
                            {/* Action buttons */}
                            <div className="space-y-2">
                              {actions.canApprove && (
                                <button
                                  onClick={() => handleApprovalAction(visitor.id, 'approved')}
                                  disabled={actioningVisitor === visitor.id}
                                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-md transition duration-200 w-full justify-center"
                                >
                                  {actioningVisitor === visitor.id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-4 h-4 mr-2" />
                                      Approve
                                    </>
                                  )}
                                </button>
                              )}
                              
                              {actions.canReject && (
                                <button
                                  onClick={() => handleApprovalAction(visitor.id, 'rejected')}
                                  disabled={actioningVisitor === visitor.id}
                                  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-md transition duration-200 w-full justify-center"
                                >
                                  {actioningVisitor === visitor.id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-4 h-4 mr-2" />
                                      Reject
                                    </>
                                  )}
                                </button>
                              )}
                              
                              {actions.canReschedule && (
                                <button
                                  onClick={() => openRescheduleModal(visitor)}
                                  disabled={actioningVisitor === visitor.id}
                                  className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white text-sm font-medium rounded-md transition duration-200 w-full justify-center"
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Reschedule
                                </button>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
    </div>
  );
};

export default ReceptionDashboard;