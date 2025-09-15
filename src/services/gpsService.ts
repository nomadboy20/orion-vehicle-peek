

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
    console.log('🚀 Calling GPS API with Orion auth');
    
    try {
      const apiUrl = "https://api-d.gpsguard.eu/api/v1/groups";
      const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJodHRwOi8vc2NoZW1hcy5vcmlvbi5ncHNndWFyZC5ldS93cy8yMDE1LzEwL2lkZW50aXR5L2NsYWltcy91c2VyaWQiOiIzMTciLCJuYW1laWQiOiJmdm9tYWNrYSIsInVuaXF1ZV9uYW1lIjoiZnZvbWFja2EiLCJodHRwOi8vc2NoZW1hcy5vcmlvbi5ncHNndWFyZC5ldS93cy8yMDE1LzEwL2lkZW50aXR5L2NsYWltcy91c2VyTGV2ZWwiOiJDbGllbnRVc2VyIiwiaHR0cDovL3NjaGVtYXMub3Jpb24uZ3BzZ3VhcmQuZXUvd3MvMjAxNS8xMC9pZGVudGl0eS9jbGFpbXMvcGVybWlzc2lvbk1hc2siOiIxNzYzMzIwMjg2IiwiaHR0cDovL3NjaGVtYXMub3Jpb24uZ3BzZ3VhcmQuZXUvd3MvMjAxNS8xMC9pZGVudGl0eS9jbGFpbXMvZGlzdHJpYnV0b3IiOiJHUFMiLCJodHRwOi8vc2NoZW1hcy5vcmlvbi5ncHNndWFyZC5ldS93cy8yMDE1LzEwL2lkZW50aXR5L2NsYWltcy9jbGllbnQiOiJNRVRSIiwiaHR0cDovL3NjaGVtYXMub3Jpb24uZ3BzZ3VhcmQuZXUvd3MvMjAxNS8xMC9pZGVudGl0eS9jbGFpbXMvdXNlclNoYXJlcyI6IiIsImh0dHA6Ly9zY2hlbWFzLm9yaW9uLmdwc2d1YXJkLmV1L3dzLzIwMTUvMTAvaWRlbnRpdHkvY2xhaW1zL2FjY2Vzc1J1bGVzIjoiW3tcImNjXCI6XCJNRVRSXCIsXCJyXCI6ZmFsc2UsXCJhdFwiOjB9XSIsImh0dHA6Ly9zY2hlbWFzLm9yaW9uLmdwc2d1YXJkLmV1L3dzLzIwMTUvMTAvaWRlbnRpdHkvY2xhaW1zL2Rpc3RyaWJ1dG9ycyI6IkdQUyIsImlzcyI6ImFzOklzc3VlciIsImF1ZCI6ImFzOkF1ZGllbmNlSWQiLCJleHAiOjE3NTc5MjA4MjMsIm5iZiI6MTc1NzkyMDUyM30.PT2GLWEpHS4zzKdHT4jjJatei3-pP0dU847Mh7If9_s";

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `Orion ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ GPS API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ GPS API success, response:', data);
      
      // Since we're calling /groups endpoint, we might need to extract vehicles from the response
      // For now, return the data as is and see what structure we get
      return Array.isArray(data) ? data : [];
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