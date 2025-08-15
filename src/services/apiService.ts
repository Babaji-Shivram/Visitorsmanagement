import { http } from "../lib/http";
import { API_BASE_URL } from "../lib/apiBase";

export interface Location {
  id: number; name: string; address: string; description?: string;
  registrationUrl: string; qrCodeUrl?: string; isActive: boolean;
  createdAt: string; updatedAt: string; visitorCount?: number; staffCount?: number;
}

export interface StaffMember {
  id: string; firstName: string; lastName: string; fullName: string; email: string;
  designation?: string; role: string; locationId: number; locationName?: string;
  mobileNumber?: string; phoneNumber?: string; extension?: string; canLogin: boolean;
  photoUrl?: string; isActive: boolean; createdAt: string; updatedAt: string; visitorCount?: number;
}

export interface VisitorRegistration {
  locationId: number; fullName: string; phoneNumber: string; email?: string; companyName?: string;
  purposeOfVisit: string; whomToMeet: string; dateTime: string; idProofType?: string; idProofNumber?: string;
  photoUrl?: string; customFields?: { [key: string]: string };
}

export interface ReturningVisitorData {
  fullName: string; email?: string; companyName?: string; idProofType?: string; idProofNumber?: string;
  isReturningVisitor: boolean; lastVisitDate: string;
}

export interface VisitorDto {
  id: number; locationId: number; locationName?: string; fullName: string; phoneNumber: string;
  email?: string; companyName?: string; purposeOfVisit: string; whomToMeet: string; dateTime: string;
  idProofType?: string; idProofNumber?: string; photoUrl?: string;
  status: 'awaiting_approval' | 'approved' | 'rejected' | 'checked_in' | 'checked_out' | 'rescheduled';
  createdAt: string; updatedAt: string; approvedBy?: string; approvedAt?: string; checkInTime?: string; checkOutTime?: string; notes?: string;
}

export interface UpdateVisitorStatusDto { status: 'awaiting_approval'|'approved'|'rejected'|'rescheduled'; notes?: string; }
export interface VisitorStatsDto { total: number; awaiting: number; approved: number; rejected: number; checkedIn: number; checkedOut: number; }

export interface CustomField {
  id: number; name: string; type: 'text'|'email'|'number'|'select'|'multiselect'|'textarea'|'date'|'checkbox';
  label: string; placeholder?: string; required: boolean; options?: string[]; order: number; isActive: boolean;
  createdAt: string; updatedAt: string;
}

export interface LocationSettings {
  id: number; locationId?: number; locationName?: string; purposeOfVisitOptions: string[]; idTypeOptions: string[];
  isPhotoMandatory: boolean; customFields: CustomField[];
  enabledFields: { email: boolean; companyName: boolean; idProof: boolean; photo: boolean; vehicleNumber?: boolean; emergencyContact?: boolean; };
  createdAt: string; updatedAt: string;
}

class ApiService {
  private toSettings(data: any): LocationSettings | null {
    if (!data) return null;
    return {
      id: data.id ?? data.Id ?? 0,
      locationId: data.locationId ?? data.LocationId,
      locationName: data.locationName ?? data.LocationName,
      purposeOfVisitOptions: data.purposeOfVisitOptions ?? data.PurposeOfVisitOptions ?? [],
      idTypeOptions: data.idTypeOptions ?? data.IdTypeOptions ?? [],
      isPhotoMandatory: data.isPhotoMandatory ?? data.IsPhotoMandatory ?? false,
      customFields: data.customFields ?? data.CustomFields ?? [],
      enabledFields: {
        email: data.enabledFields?.email ?? data.EnabledFields?.Email ?? false,
        companyName: data.enabledFields?.companyName ?? data.EnabledFields?.CompanyName ?? false,
        idProof: data.enabledFields?.idProof ?? data.EnabledFields?.IdProof ?? false,
        photo: data.enabledFields?.photo ?? data.EnabledFields?.Photo ?? false,
        vehicleNumber: data.enabledFields?.vehicleNumber ?? data.EnabledFields?.VehicleNumber ?? false,
        emergencyContact: data.enabledFields?.emergencyContact ?? data.EnabledFields?.EmergencyContact ?? false,
      },
      createdAt: data.createdAt ?? data.CreatedAt ?? new Date().toISOString(),
      updatedAt: data.updatedAt ?? data.UpdatedAt ?? new Date().toISOString(),
    };
  }

  // Locations
  async getLocations() {
    const res = await http<Location[]>("/locations");
    return res.ok && res.data ? res.data : [];
  }
  async getLocationByUrl(url: string) {
    const res = await http<Location>(`/locations/url/${encodeURIComponent(url)}`);
    return res.ok ? (res.data ?? null) : null;
  }

  // Settings
  async getLocationSettings(locationId?: number | null) {
    const endpoint = locationId ? `/settings?locationId=${locationId}` : "/settings";
    const res = await http<any>(endpoint);
    return res.ok && res.data ? this.toSettings(res.data) : null;
  }
  async updateLocationSettings(locationId: number | undefined, settings: any) {
    const endpoint = locationId ? `/settings?locationId=${locationId}` : "/settings";
    const payload: any = {};
    if (settings.purposeOfVisitOptions) payload.purposeOfVisitOptions = settings.purposeOfVisitOptions;
    if (settings.idTypeOptions) payload.idTypeOptions = settings.idTypeOptions;
    if (typeof settings.isPhotoMandatory === "boolean") payload.isPhotoMandatory = settings.isPhotoMandatory;
    if (settings.customFields) payload.customFields = settings.customFields;
    if (settings.enabledFields) {
      payload.enabledFields = {
        Email: settings.enabledFields.email,
        CompanyName: settings.enabledFields.companyName,
        IdProof: settings.enabledFields.idProof,
        Photo: settings.enabledFields.photo,
        VehicleNumber: settings.enabledFields.vehicleNumber,
        EmergencyContact: settings.enabledFields.emergencyContact,
      };
    }
    if (typeof settings.enableEmailNotifications === "boolean") payload.enableEmailNotifications = settings.enableEmailNotifications;
    if (typeof settings.enableSMSNotifications === "boolean") payload.enableSMSNotifications = settings.enableSMSNotifications;
    if (typeof settings.enableCheckInReminders === "boolean") payload.enableCheckInReminders = settings.enableCheckInReminders;
    if (settings.reminderTimeBeforeVisit) payload.reminderTimeBeforeVisit = settings.reminderTimeBeforeVisit;
    if (typeof settings.requireApprovalForAllVisits === "boolean") payload.requireApprovalForAllVisits = settings.requireApprovalForAllVisits;
    if (typeof settings.autoApprovalEnabled === "boolean") payload.autoApprovalEnabled = settings.autoApprovalEnabled;
    if (typeof settings.allowWalkIns === "boolean") payload.allowWalkIns = settings.allowWalkIns;
    if (settings.dataRetentionDays) payload.dataRetentionDays = settings.dataRetentionDays;
    if (typeof settings.enableAuditLogs === "boolean") payload.enableAuditLogs = settings.enableAuditLogs;
    if (settings.maxVisitDuration) payload.maxVisitDuration = settings.maxVisitDuration;

    const res = await http<any>(endpoint, { method: "PUT", body: JSON.stringify(payload) });
    return res.ok && res.data ? this.toSettings(res.data) : null;
  }

  // Staff
  async getActiveStaff() {
    const res = await http<StaffMember[]>("/staff/active");
    return res.ok && res.data ? res.data : [];
  }
  async getStaffByLocation(locationId: number) {
    const res = await http<StaffMember[]>(`/staff/location/${locationId}`);
    return res.ok && res.data ? res.data : [];
  }

  // Visitors
  async registerVisitor(visitor: VisitorRegistration) {
    const res = await http(`/visitors`, { method: "POST", body: JSON.stringify(visitor) });
    return res.ok;
  }
  async getVisitors(locationId?: number, date?: string, status?: string) {
    const qs = new URLSearchParams();
    if (locationId) qs.append("locationId", String(locationId));
    if (date) qs.append("date", date);
    if (status) qs.append("status", status);
    const res = await http<VisitorDto>(`/visitors${qs.toString() ? `?${qs}` : ""}`);
    return (res.ok && res.data ? (res.data as any) : []) as VisitorDto[];
  }
  async getTodaysVisitors(locationId?: number) {
    const res = await http<VisitorDto[]>(`/visitors/today${locationId ? `?locationId=${locationId}` : ""}`);
    return res.ok && res.data ? res.data : [];
  }
  async getVisitorById(id: number) {
    const res = await http<VisitorDto>(`/visitors/${id}`);
    return res.ok ? (res.data ?? null) : null;
  }
  async getVisitorByPhoneNumber(phone: string) {
    if (!phone) return null;
    const res = await http<ReturningVisitorData>(`/visitors/by-phone/${encodeURIComponent(phone)}`);
    return res.ok ? (res.data ?? null) : null;
  }
  async getVisitorsByStaff(staffName: string, status?: string) {
    const res = await http<VisitorDto[]>(`/visitors/staff/${encodeURIComponent(staffName)}${status ? `?status=${status}` : ""}`);
    return res.ok && res.data ? res.data : [];
  }
  async getVisitorStats(locationId?: number, fromDate?: string, toDate?: string) {
    const qs = new URLSearchParams();
    if (locationId) qs.append("locationId", String(locationId));
    if (fromDate) qs.append("fromDate", fromDate);
    if (toDate) qs.append("toDate", toDate);
    const res = await http<VisitorStatsDto>(`/visitors/stats${qs.toString() ? `?${qs}` : ""}`);
    return res.ok ? (res.data ?? null) : null;
  }
  async updateVisitorStatus(id: number, status: string, notes?: string) {
    const res = await http(`/visitors/${id}/status`, { method: "PUT", body: JSON.stringify({ status, notes }) });
    return res.ok;
  }
  async checkInVisitor(id: number) {
    const res = await http(`/visitors/${id}/checkin`, { method: "POST" });
    return res.ok;
  }
  async checkOutVisitor(id: number) {
    const res = await http(`/visitors/${id}/checkout`, { method: "POST" });
    return res.ok;
  }
  async updateVisitorAssignment(id: number, newWhomToMeet: string) {
    const res = await http(`/visitors/${id}/assignment`, { method: "PUT", body: JSON.stringify(newWhomToMeet) });
    return res.ok;
  }
  async rescheduleVisitor(id: number, newDateTime: string) {
    const res = await http(`/visitors/${id}/reschedule`, { method: "PUT", body: JSON.stringify({ dateTime: newDateTime }) });
    return res.ok;
  }
  async deleteVisitor(id: number) {
    const res = await http(`/visitors/${id}`, { method: "DELETE" });
    return res.ok;
  }
}

export const apiService = new ApiService();
// For quick debugging in DevTools:
;(window as any).__API_BASE_URL = API_BASE_URL;


