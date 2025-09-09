

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
    console.log('🚀 Calling GPS API directly for group:', groupCode);
    
    try {
      const apiUrl = `https://a2.gpsguard.eu/api/v1/vehicles/group/${groupCode}`;
      const username = "api_gpsdozor";
      const password = "yakmwlARdn";
      const auth = btoa(`${username}:${password}`);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ GPS API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ GPS API success, vehicles count:', Array.isArray(data) ? data.length : 'not array');
      
      return data;
    } catch (error) {
      console.error('💥 GPS API error:', error);
      throw new Error(`Nepodařilo se načíst vozidla: ${error.message}`);
    }
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return this.getVehiclesByGroup('SAGU');
  }
}

export const gpsService = new GPSService();
export type { Vehicle };