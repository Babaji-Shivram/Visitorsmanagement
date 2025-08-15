import { RoleConfiguration, CreateRoleConfiguration, UpdateRoleConfiguration, RolePermission, RoleRoute } from '../types/roleTypes';

const API_BASE_URL = '';

class RoleConfigurationService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async getAllRoleConfigurations(): Promise<RoleConfiguration[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/roleconfiguration`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch role configurations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching role configurations:', error);
      throw error;
    }
  }

  async getRoleConfigurationById(id: number): Promise<RoleConfiguration> {
    try {
      const response = await fetch(`${API_BASE_URL}/roleconfiguration/${id}`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch role configuration: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching role configuration:', error);
      throw error;
    }
  }

  async getRoleConfigurationByName(roleName: string): Promise<RoleConfiguration> {
    try {
      const response = await fetch(`${API_BASE_URL}/roleconfiguration/by-name/${encodeURIComponent(roleName)}`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch role configuration: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching role configuration by name:', error);
      throw error;
    }
  }

  async createRoleConfiguration(createDto: CreateRoleConfiguration): Promise<RoleConfiguration> {
    try {
      const response = await fetch(`${API_BASE_URL}/roleconfiguration`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(createDto),
      });

      if (!response.ok) {
        throw new Error(`Failed to create role configuration: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating role configuration:', error);
      throw error;
    }
  }

  async updateRoleConfiguration(id: number, updateDto: UpdateRoleConfiguration): Promise<RoleConfiguration> {
    try {
      const response = await fetch(`${API_BASE_URL}/roleconfiguration/${id}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(updateDto),
      });

      if (!response.ok) {
        throw new Error(`Failed to update role configuration: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating role configuration:', error);
      throw error;
    }
  }

  async deleteRoleConfiguration(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/roleconfiguration/${id}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete role configuration: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting role configuration:', error);
      throw error;
    }
  }

  async activateRoleConfiguration(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/roleconfiguration/${id}/activate`, {
        method: 'PATCH',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to activate role configuration: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error activating role configuration:', error);
      throw error;
    }
  }

  async deactivateRoleConfiguration(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/roleconfiguration/${id}/deactivate`, {
        method: 'PATCH',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to deactivate role configuration: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deactivating role configuration:', error);
      throw error;
    }
  }

  async getRolePermissions(roleConfigurationId: number): Promise<RolePermission[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/roleconfiguration/${roleConfigurationId}/permissions`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch role permissions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      throw error;
    }
  }

  async getRoleRoutes(roleConfigurationId: number): Promise<RoleRoute[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/roleconfiguration/${roleConfigurationId}/routes`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch role routes: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching role routes:', error);
      throw error;
    }
  }

  async hasPermission(roleName: string, permissionName: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/roleconfiguration/check-permission?roleName=${encodeURIComponent(roleName)}&permissionName=${encodeURIComponent(permissionName)}`,
        {
          method: 'GET',
          headers: await this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to check permission: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking permission:', error);
      throw error;
    }
  }

  async seedDefaultRoleConfigurations(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/roleconfiguration/seed-defaults`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to seed default role configurations: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error seeding default role configurations:', error);
      throw error;
    }
  }
}

export const roleConfigurationService = new RoleConfigurationService();
export default roleConfigurationService;
