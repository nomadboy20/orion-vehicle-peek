// Use Supabase edge function as proxy to avoid CORS issues
const API_BASE_URL = '/functions/v1/gps-vehicles';

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
  async getVehiclesByGroup(groupCode: string = 'SAGU'): Promise<Vehicle[]> {
    try {
      const response = await fetch(`${API_BASE_URL}?groupCode=${groupCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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