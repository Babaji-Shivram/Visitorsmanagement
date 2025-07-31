import React, { useState, useEffect } from 'react';
import { useVisitor } from '../../contexts/VisitorContext';
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
  Calendar
} from 'lucide-react';

const ReceptionDashboard: React.FC = () => {
  const { visitors, getVisitorsByDate, checkInVisitor, checkOutVisitor, getStaffInfo } = useVisitor();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'visitors' | 'analytics'>('visitors');

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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
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
                <p className="text-blue-100 opacity-80">Manage visitor check-ins and check-outs</p>
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
    </div>
  );
};

export default ReceptionDashboard;