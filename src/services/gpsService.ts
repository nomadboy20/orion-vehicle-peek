// Fallback to direct API call for debugging (will have CORS issues)
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
    console.log('🔐 Auth credentials prepared:', API_CREDENTIALS.username);
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  async getVehiclesByGroup(groupCode: string = 'SAGU'): Promise<Vehicle[]> {
    const url = `${API_BASE_URL}/vehicles/group/${groupCode}`;
    console.log('🚀 Starting API call to:', url);
    console.log('📡 Group code:', groupCode);
    
    try {
      const headers = this.getAuthHeaders();
      console.log('📋 Request headers:', headers);
      
      console.log('⏳ Making fetch request...');
      const response = await fetch(url, {
        method: 'GET',
        headers,
        mode: 'cors',
      });

      console.log('📡 Response received:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Data received:', data);
      console.log('📊 Number of vehicles:', Array.isArray(data) ? data.length : 'Not an array');
      
      return data;
    } catch (error) {
      console.error('💥 Detailed error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        url: url
      });
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.error('🚫 CORS Error detected - need backend proxy or Supabase edge function');
      }
      
      throw new Error(`Nepodařilo se načíst vozidla: ${error.message}`);
    }
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return this.getVehiclesByGroup('SAGU');
  }
}

export const gpsService = new GPSService();
export type { Vehicle };