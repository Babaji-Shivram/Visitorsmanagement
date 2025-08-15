// Controllers are now routed directly without /api prefix
// Handle different deployment scenarios for API routing
const getApiBaseUrl = () => {
  // No API prefix needed anymore for simplified routing
  return '';
};

const API_BASE_URL = getApiBaseUrl();

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface Location {
  id: number;
  name: string;
  address: string;
  description?: string;
  registrationUrl: string;
  qrCodeUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  visitorCount?: number;
  staffCount?: number;
}

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  designation?: string;
  role: string;
  locationId: number;
  locationName?: string;
  mobileNumber?: string;
  phoneNumber?: string;
  extension?: string;
  canLogin: boolean;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  visitorCount?: number;
}

interface VisitorRegistration {
  locationId: number;
  fullName: string;
  phoneNumber: string;
  email?: string;
  companyName?: string;
  purposeOfVisit: string;
  whomToMeet: string;
  dateTime: string;
  idProofType?: string;
  idProofNumber?: string;
  photoUrl?: string;
  customFields?: { [key: string]: string };
}

interface ReturningVisitorData {
  fullName: string;
  email?: string;
  companyName?: string;
  idProofType?: string;
  idProofNumber?: string;
  isReturningVisitor: boolean;
  lastVisitDate: string;
}

interface VisitorDto {
  id: number;
  locationId: number;
  locationName?: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  companyName?: string;
  purposeOfVisit: string;
  whomToMeet: string;
  dateTime: string;
  idProofType?: string;
  idProofNumber?: string;
  photoUrl?: string;
  status: 'awaiting_approval' | 'approved' | 'rejected' | 'checked_in' | 'checked_out' | 'rescheduled';
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

interface UpdateVisitorStatusDto {
  status: 'awaiting_approval' | 'approved' | 'rejected' | 'rescheduled';
  notes?: string;
}

interface VisitorStatsDto {
  total: number;
  awaiting: number;
  approved: number;
  rejected: number;
  checkedIn: number;
  checkedOut: number;
}

interface CustomField {
  id: number;
  name: string;
  type: 'text' | 'email' | 'number' | 'select' | 'multiselect' | 'textarea' | 'date' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LocationSettings {
  id: number;
  locationId?: number;
  locationName?: string;
  purposeOfVisitOptions: string[];
  idTypeOptions: string[];
  isPhotoMandatory: boolean;
  customFields: CustomField[];
  enabledFields: {
    email: boolean;
    companyName: boolean;
    idProof: boolean;
    photo: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  // Helper function to convert API response (PascalCase) to frontend format (camelCase)
  private convertApiResponseToFrontend(apiData: any): LocationSettings | null {
    if (!apiData) return null;
    
    return {
      id: apiData.id || apiData.Id || 0,
      locationId: apiData.locationId || apiData.LocationId,
      locationName: apiData.locationName || apiData.LocationName,
      purposeOfVisitOptions: apiData.purposeOfVisitOptions || apiData.PurposeOfVisitOptions || [],
      idTypeOptions: apiData.idTypeOptions || apiData.IdTypeOptions || [],
      isPhotoMandatory: apiData.isPhotoMandatory ?? apiData.IsPhotoMandatory ?? false,
      customFields: apiData.customFields || apiData.CustomFields || [],
      enabledFields: {
        email: apiData.enabledFields?.email ?? apiData.EnabledFields?.Email ?? false,
        companyName: apiData.enabledFields?.companyName ?? apiData.EnabledFields?.CompanyName ?? false,
        idProof: apiData.enabledFields?.idProof ?? apiData.EnabledFields?.IdProof ?? false,
        photo: apiData.enabledFields?.photo ?? apiData.EnabledFields?.Photo ?? false
      },
      createdAt: apiData.createdAt || apiData.CreatedAt || new Date().toISOString(),
      updatedAt: apiData.updatedAt || apiData.UpdatedAt || new Date().toISOString()
    };
  }

  private async makeRequest<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log(`🔍 Making request to: ${API_BASE_URL}${endpoint}`, { method: options.method || 'GET', headers });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      console.log(`📡 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP error! status: ${response.status}, body: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      // Handle responses with no content (204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        console.log(`✅ Success with no content (${response.status})`);
        return { success: true, data: null as T };
      }

      // Check if response has content to parse
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`✅ Success with JSON data:`, data);
        return { success: true, data };
      } else {
        // If no JSON content, return success with null data
        console.log(`✅ Success with non-JSON content`);
        return { success: true, data: null as T };
      }
    } catch (error) {
      console.error('❌ API request failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Location endpoints
  async getLocationByUrl(url: string): Promise<Location | null> {
    console.log(`Fetching location with URL: ${url}`);
    console.log(`API endpoint: ${API_BASE_URL}/locations/url/${encodeURIComponent(url)}`);
    
    try {
      const response = await this.makeRequest<Location>(`/locations/url/${encodeURIComponent(url)}`);
      console.log('API response:', response);
      return response.success && response.data ? response.data : null;
    } catch (error) {
      console.error('Error in getLocationByUrl:', error);
      throw error;
    }
  }

  async getLocations(): Promise<Location[]> {
    const response = await this.makeRequest<Location[]>(`/locations`);
    return response.success && response.data ? response.data : [];
  }

  async getLocationSettings(locationId?: number | null): Promise<LocationSettings | null> {
    try {
      const url = locationId 
        ? `/settings?locationId=${locationId}` 
        : '/settings'; // Global settings when no locationId
      const response = await this.makeRequest<any>(url);
      
      if (response.success && response.data) {
        return this.convertApiResponseToFrontend(response.data);
      }
      return null;
    } catch (error) {
      console.error('Error getting location settings:', error);
      return null;
    }
  }

  async updateLocationSettings(locationId: number | undefined, settings: any): Promise<LocationSettings | null> {
    try {
      const url = locationId 
        ? `/settings?locationId=${locationId}` 
        : '/settings'; // Global settings when no locationId
      
      // Convert camelCase to PascalCase for API compatibility and handle all settings types
      const apiSettings: any = {};

      // Form Configuration settings
      if (settings.purposeOfVisitOptions) apiSettings.purposeOfVisitOptions = settings.purposeOfVisitOptions;
      if (settings.idTypeOptions) apiSettings.idTypeOptions = settings.idTypeOptions;
      if (typeof settings.isPhotoMandatory === 'boolean') apiSettings.isPhotoMandatory = settings.isPhotoMandatory;
      if (settings.customFields) apiSettings.customFields = settings.customFields;
      
      if (settings.enabledFields) {
        apiSettings.enabledFields = {
          Email: settings.enabledFields.email,
          CompanyName: settings.enabledFields.companyName,
          IdProof: settings.enabledFields.idProof,
          Photo: settings.enabledFields.photo,
          VehicleNumber: settings.enabledFields.vehicleNumber,
          EmergencyContact: settings.enabledFields.emergencyContact
        };
      }

      // Notification settings
      if (typeof settings.enableEmailNotifications === 'boolean') apiSettings.enableEmailNotifications = settings.enableEmailNotifications;
      if (typeof settings.enableSMSNotifications === 'boolean') apiSettings.enableSMSNotifications = settings.enableSMSNotifications;
      if (typeof settings.enableCheckInReminders === 'boolean') apiSettings.enableCheckInReminders = settings.enableCheckInReminders;
      if (settings.reminderTimeBeforeVisit) apiSettings.reminderTimeBeforeVisit = settings.reminderTimeBeforeVisit;

      // Security & Access settings
      if (typeof settings.requireApprovalForAllVisits === 'boolean') apiSettings.requireApprovalForAllVisits = settings.requireApprovalForAllVisits;
      if (typeof settings.autoApprovalEnabled === 'boolean') apiSettings.autoApprovalEnabled = settings.autoApprovalEnabled;
      if (typeof settings.allowWalkIns === 'boolean') apiSettings.allowWalkIns = settings.allowWalkIns;
      if (settings.dataRetentionDays) apiSettings.dataRetentionDays = settings.dataRetentionDays;
      if (typeof settings.enableAuditLogs === 'boolean') apiSettings.enableAuditLogs = settings.enableAuditLogs;

      // System settings
      if (settings.maxVisitDuration) apiSettings.maxVisitDuration = settings.maxVisitDuration;
      
      // Send settings directly as expected by the API
      const response = await this.makeRequest<any>(url, {
        method: 'PUT',
        body: JSON.stringify(apiSettings),
      });
      
      if (response.success && response.data) {
        return this.convertApiResponseToFrontend(response.data);
      }
      return null;
    } catch (error) {
      console.error('Error updating location settings:', error);
      return null;
    }
  }

  // Staff endpoints
  async getStaffByLocation(locationId: number): Promise<StaffMember[]> {
    const response = await this.makeRequest<StaffMember[]>(`/staff/location/${locationId}`);
    return response.success && response.data ? response.data : [];
  }

  async getActiveStaff(): Promise<StaffMember[]> {
    const response = await this.makeRequest<StaffMember[]>(`/staff/active`);
    return response.success && response.data ? response.data : [];
  }

  // Visitor endpoints
  async registerVisitor(visitor: VisitorRegistration): Promise<boolean> {
    try {
      console.log('🚀 Registering visitor:', visitor);
      const response = await this.makeRequest(`/visitors`, {
        method: 'POST',
        body: JSON.stringify(visitor),
      });
      console.log('📡 Registration response:', response);
      return response.success;
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  }

  async getVisitors(locationId?: number, date?: string, status?: string): Promise<VisitorDto[]> {
    const params = new URLSearchParams();
    if (locationId) params.append('locationId', locationId.toString());
    if (date) params.append('date', date);
    if (status) params.append('status', status);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await this.makeRequest<VisitorDto[]>(`/visitors${query}`);
    return response.success && response.data ? response.data : [];
  }

  async getTodaysVisitors(locationId?: number): Promise<VisitorDto[]> {
    const params = locationId ? `?locationId=${locationId}` : '';
    const response = await this.makeRequest<VisitorDto[]>(`/visitors/today${params}`);
    return response.success && response.data ? response.data : [];
  }

  async getVisitorById(id: number): Promise<VisitorDto | null> {
    const response = await this.makeRequest<VisitorDto>(`/visitors/${id}`);
    return response.success && response.data ? response.data : null;
  }

  async getVisitorByPhoneNumber(phoneNumber: string): Promise<ReturningVisitorData | null> {
    if (!phoneNumber) return null;
    
    try {
      console.log(`🔍 Checking for returning visitor with phone: ${phoneNumber}`);
      const response = await this.makeRequest<ReturningVisitorData>(`/visitors/by-phone/${encodeURIComponent(phoneNumber)}`);
      
      if (response.success && response.data) {
        console.log('✅ Found returning visitor data:', response.data);
        return response.data;
      } else {
        console.log('📱 No previous visitor found with this phone number');
        return null;
      }
    } catch (error) {
      console.log('📱 Phone number check failed (likely new visitor):', error);
      return null;
    }
  }

  async getVisitorsByStaff(staffName: string, status?: string): Promise<VisitorDto[]> {
    const params = status ? `?status=${status}` : '';
    const response = await this.makeRequest<VisitorDto[]>(`/visitors/staff/${encodeURIComponent(staffName)}${params}`);
    return response.success && response.data ? response.data : [];
  }

  async getVisitorStats(locationId?: number, fromDate?: string, toDate?: string): Promise<VisitorStatsDto | null> {
    const params = new URLSearchParams();
    if (locationId) params.append('locationId', locationId.toString());
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await this.makeRequest<VisitorStatsDto>(`/visitors/stats${query}`);
    return response.success && response.data ? response.data : null;
  }

  async updateVisitorStatus(id: number, status: string, notes?: string): Promise<boolean> {
    console.log(`🔄 Updating visitor ${id} status to '${status}'`, { id, status, notes });
    
    const response = await this.makeRequest(`/visitors/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: status, notes }),
    });
    
    console.log(`📡 Update visitor status response:`, response);
    return response.success;
  }

  async checkInVisitor(id: number): Promise<boolean> {
    const response = await this.makeRequest(`/visitors/${id}/checkin`, {
      method: 'POST',
    });
    return response.success;
  }

  async checkOutVisitor(id: number): Promise<boolean> {
    const response = await this.makeRequest(`/visitors/${id}/checkout`, {
      method: 'POST',
    });
    return response.success;
  }

  async updateVisitorAssignment(id: number, newWhomToMeet: string): Promise<boolean> {
    const response = await this.makeRequest(`/visitors/${id}/assignment`, {
      method: 'PUT',
      body: JSON.stringify(newWhomToMeet),
    });
    return response.success;
  }

  async rescheduleVisitor(id: number, newDateTime: string): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ message: string }>(`/visitors/${id}/reschedule`, {
        method: 'PUT',
        body: JSON.stringify({ dateTime: newDateTime }),
      });
      
      console.log('✅ Visitor rescheduled successfully:', response);
      return response.success;
    } catch (error) {
      console.error('❌ Error rescheduling visitor:', error);
      return false;
    }
  }

  async deleteVisitor(id: number): Promise<boolean> {
    const response = await this.makeRequest(`/visitors/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  }
}

export const apiService = new ApiService();
export type { Location, StaffMember, VisitorRegistration, VisitorDto, UpdateVisitorStatusDto, VisitorStatsDto, CustomField, LocationSettings };


