const API_BASE_URL = 'https://a1.gpsguard.eu/api/v1';

// Demo credentials from API documentation
const API_CREDENTIALS = {
  username: 'api_gpsdozor',
  password: 'yakmwlARdn'
};

interface Vehicle {
  Code: string;
  GroupCode: string;
  BranchId: string;
  BranchName: string;
  Name: string;
  SPZ: string;
  BatteryPercentage: number;
  Speed: number;
  LastPosition: {
    Latitude: string;
    Longitude: string;
  };
  LastPing: string;
}

interface Group {
  Code: string;
  Name: string;
}

class GPSService {
  private getAuthHeaders() {
    const credentials = btoa(`${API_CREDENTIALS.username}:${API_CREDENTIALS.password}`);
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  async getGroups(): Promise<Group[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/groups`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw new Error('Nepodařilo se načíst skupiny vozidel');
    }
  }

  async getVehiclesByGroup(groupCode: string): Promise<Vehicle[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/group/${groupCode}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw new Error('Nepodařilo se načíst vozidla');
    }
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    try {
      const groups = await this.getGroups();
      const allVehicles: Vehicle[] = [];

      for (const group of groups) {
        try {
          const vehicles = await this.getVehiclesByGroup(group.Code);
          allVehicles.push(...vehicles);
        } catch (error) {
          console.warn(`Failed to fetch vehicles for group ${group.Code}:`, error);
        }
      }

      return allVehicles;
    } catch (error) {
      console.error('Error fetching all vehicles:', error);
      throw new Error('Nepodařilo se načíst vozidla');
    }
  }
}

export const gpsService = new GPSService();
export type { Vehicle, Group };