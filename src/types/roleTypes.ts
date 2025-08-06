// Role Configuration Types
export interface RoleConfiguration {
  id: number;
  roleName: string;
  displayName: string;
  description?: string;
  colorClass: string;
  iconClass: string;
  isActive: boolean;
  sortOrder: number;
  permissions: RolePermission[];
  routes: RoleRoute[];
}

export interface RolePermission {
  id: number;
  roleConfigurationId: number;
  permissionName: string;
  description?: string;
  isActive: boolean;
}

export interface RoleRoute {
  id: number;
  roleConfigurationId: number;
  routePath: string;
  routeLabel: string;
  iconName: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateRoleConfiguration {
  roleName: string;
  displayName: string;
  description?: string;
  colorClass: string;
  iconClass: string;
  sortOrder: number;
  permissions: CreateRolePermission[];
  routes: CreateRoleRoute[];
}

export interface CreateRolePermission {
  permissionName: string;
  description?: string;
}

export interface CreateRoleRoute {
  routePath: string;
  routeLabel: string;
  iconName: string;
  sortOrder: number;
}

export interface UpdateRoleConfiguration {
  displayName: string;
  description?: string;
  colorClass: string;
  iconClass: string;
  isActive: boolean;
  sortOrder: number;
  permissions: CreateRolePermission[];
  routes: CreateRoleRoute[];
}

// Extended User interface with role configuration
export interface UserWithRoleConfig extends User {
  roleConfiguration?: RoleConfiguration;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  extension?: string;
  role: 'reception' | 'admin' | 'staff';
  department?: string;
  staffId?: string;
  locationId?: number;
  locationName?: string;
}
