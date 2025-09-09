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
  LastPositionTimestamp: string;
  DeviceImei: string;
  IsActive: boolean;
  IsEcoDrivingEnabled: boolean;
  Odometer: number;
  IsInvoiced: boolean;
  RefuelingCards: any[];
}

class GPSService {
  private getAuthHeaders() {
    const credentials = btoa(`${API_CREDENTIALS.username}:${API_CREDENTIALS.password}`);
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };
  }

  async getVehiclesByGroup(groupCode: string = 'SAGU'): Promise<Vehicle[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/group/${groupCode}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        mode: 'cors',
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
    return this.getVehiclesByGroup('SAGU');
  }
}

export const gpsService = new GPSService();
export type { Vehicle };