

import { apiClient } from './apiClient';

interface Group {
  code: string;
  name: string;
}

interface Position {
  time: string;
  speed: number;
  latitudeE6: number;
  longitudeE6: number;
}

interface VehicleHistory {
  name: string;
  vehicleCode: string;
  fromUtc: string;
  toUtc: string;
  positions: Position[];
}

interface Vehicle {
  code: string;
  groupCode: string;
  branchName?: string;
  name: string;
  spz: string;
  speed: number;
  batteryPercentage: number;
  odometer: number;
  lastPosition: {
    latitudeE6: number;
    longitudeE6: number;
  };
  lastPositionTimestamp: string;
  refuelingCards: any[];
  recentPositions?: Position[];
}

class GPSService {
  private token: string = "";

  setToken(token: string) {
    this.token = token;
    // Also update the apiClient token
    apiClient.setToken(token);
  }

  getToken(): string {
    return this.token;
  }

  setMode(mode: 'dev' | 'production') {
    // Update the apiClient mode
    apiClient.setMode(mode);
  }

  async getGroups(): Promise<Group[]> {
    try {
      const response = await apiClient.request<Group[]>({
        url: 'https://api-d.gpsguard.eu/v1/groups',
        method: 'GET',
      });
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('💥 Groups API error:', error);
      throw new Error(`Nepodařilo se načíst skupiny: ${error.message || error}`);
    }
  }

  async getVehiclesByGroup(groupCode: string): Promise<Vehicle[]> {
    try {
      const response = await apiClient.request<Vehicle[]>({
        url: `https://api-d.gpsguard.eu/v1/vehicles/group/${groupCode}`,
        method: 'GET',
      });
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('💥 Vehicles API error:', error);
      throw new Error(`Nepodařilo se načíst vozidla: ${error.message || error}`);
    }
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    try {
      // First get all groups
      const groups = await this.getGroups();
      
      // Then fetch vehicles for each group and combine them
      const allVehiclesPromises = groups.map(group => this.getVehiclesByGroup(group.code));
      const vehicleArrays = await Promise.all(allVehiclesPromises);
      
      // Flatten the array of arrays into a single array
      const allVehicles = vehicleArrays.flat();
      
      console.log(`✅ Fetched ${allVehicles.length} vehicles from ${groups.length} groups`);
      return allVehicles;
    } catch (error: any) {
      console.error('💥 Get all vehicles error:', error);
      throw new Error(`Nepodařilo se načíst všechna vozidla: ${error.message || error}`);
    }
  }

  async getVehicleHistory(vehicleCode: string, limit: number = 3): Promise<Position[]> {
    try {
      // Get last 24 hours of history
      const toUtc = new Date();
      const fromUtc = new Date(toUtc.getTime() - 24 * 60 * 60 * 1000);
      
      // Format dates to ISO 8601 without seconds (YYYY-MM-DDTHH:mm)
      const formatDate = (date: Date) => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      const response = await apiClient.request<VehicleHistory[]>({
        url: `https://api-d.gpsguard.eu/v1/vehicles/${vehicleCode}/history?fromUtc=${formatDate(fromUtc)}&toUtc=${formatDate(toUtc)}`,
        method: 'GET',
      });
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        const history = response.data[0];
        // Return last N positions
        return history.positions.slice(-limit);
      }
      
      return [];
    } catch (error: any) {
      console.error(`💥 Vehicle history API error for ${vehicleCode}:`, error);
      // Don't throw, just return empty array
      return [];
    }
  }
}

export const gpsService = new GPSService();
export type { Vehicle, Group, Position };