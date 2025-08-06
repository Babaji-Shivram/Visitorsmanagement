// Get the server IP from environment or use localhost as fallback
const getApiBaseUrl = () => {
  // For production, you can set this via environment variable
  // For development, it will try to detect the server IP
  const serverIP = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'localhost' 
    : window.location.hostname;
  
  return `http://${serverIP}:9524/api`;
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

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
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

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle responses with no content (204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return { success: true, data: null as T };
      }

      // Check if response has content to parse
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return { success: true, data };
      } else {
        // If no JSON content, return success with null data
        return { success: true, data: null as T };
      }
    } catch (error) {
      console.error('API request failed:', error);
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
    const response = await this.makeRequest(`/visitors`, {
      method: 'POST',
      body: JSON.stringify(visitor),
    });
    return response.success;
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

  async getVisitorById(id: number): Promise<VisitorDto | null> {
    const response = await this.makeRequest(`/visitors/${id}`, { method: 'GET' });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  }

  async updateVisitorStatus(id: number, status: string, notes?: string): Promise<boolean> {
    // Convert frontend status strings to backend enum values
    const statusMapping: { [key: string]: number } = {
      'awaiting_approval': 1,
      'approved': 2,
      'rejected': 3,
      'checked_in': 4,
      'checked_out': 5,
      'rescheduled': 6
    };

    const statusValue = statusMapping[status] || statusMapping['awaiting_approval'];
    
    console.log(`🔄 Updating visitor ${id} status from '${status}' to enum value ${statusValue}`, { id, status, statusValue, notes });
    
    const response = await this.makeRequest(`/visitors/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: statusValue, notes }),
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

  async deleteVisitor(id: number): Promise<boolean> {
    const response = await this.makeRequest(`/visitors/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  }
}

export const apiService = new ApiService();
export type { Location, StaffMember, VisitorRegistration, VisitorDto, UpdateVisitorStatusDto, VisitorStatsDto };
