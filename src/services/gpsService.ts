

import { apiClient } from './apiClient';

interface Group {
  code: string;
  name: string;
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
        url: 'https://api-d.gpsguard.eu/groups',
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
        url: `https://api-d.gpsguard.eu/group/${groupCode}`,
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
}

export const gpsService = new GPSService();
export type { Vehicle, Group };