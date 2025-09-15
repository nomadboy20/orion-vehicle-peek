

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
  private readonly token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJodHRwOi8vc2NoZW1hcy5vcmlvbi5ncHNndWFyZC5ldS93cy8yMDE1LzEwL2lkZW50aXR5L2NsYWltcy91c2VyaWQiOiIzMTciLCJuYW1laWQiOiJmdm9tYWNrYSIsInVuaXF1ZV9uYW1lIjoiZnZvbWFja2EiLCJodHRwOi8vc2NoZW1hcy5vcmlvbi5ncHNndWFyZC5ldS93cy8yMDE1LzEwL2lkZW50aXR5L2NsYWltcy91c2VyTGV2ZWwiOiJDbGllbnRVc2VyIiwiaHR0cDovL3NjaGVtYXMub3Jpb24uZ3BzZ3VhcmQuZXUvd3MvMjAxNS8xMC9pZGVudGl0eS9jbGFpbXMvcGVybWlzc2lvbk1hc2siOiIxNzYzMzIwMjg2IiwiaHR0cDovL3NjaGVtYXMub3Jpb24uZ3BzZ3VhcmQuZXUvd3MvMjAxNS8xMC9pZGVudGl0eS9jbGFpbXMvZGlzdHJpYnV0b3IiOiJHUFMiLCJodHRwOi8vc2NoZW1hcy5vcmlvbi5ncHNndWFyZC5ldS93cy8yMDE1LzEwL2lkZW50aXR5L2NsYWltcy9jbGllbnQiOiJNRVRSIiwiaHR0cDovL3NjaGVtYXMub3Jpb24uZ3BzZ3VhcmQuZXUvd3MvMjAxNS8xMC9pZGVudGl0eS9jbGFpbXMvdXNlclNoYXJlcyI6IiIsImh0dHA6Ly9zY2hlbWFzLm9yaW9uLmdwc2d1YXJkLmV1L3dzLzIwMTUvMTAvaWRlbnRpdHkvY2xhaW1zL2FjY2Vzc1J1bGVzIjoiW3tcImNjXCI6XCJNRVRSXCIsXCJyXCI6ZmFsc2UsXCJhdFwiOjB9XSIsImh0dHA6Ly9zY2hlbWFzLm9yaW9uLmdwc2d1YXJkLmV1L3dzLzIwMTUvMTAvaWRlbnRpdHkvY2xhaW1zL2Rpc3RyaWJ1dG9ycyI6IkdQUyIsImlzcyI6ImFzOklzc3VlciIsImF1ZCI6ImFzOkF1ZGllbmNlSWQiLCJleHAiOjE3NTc5MjE4ODcsIm5iZiI6MTc1NzkyMTU4N30.LblvO7ppqV4sK9s0Rclb125VBntKxVZMLDF7GtU7oq8";

  async getGroups(): Promise<Group[]> {
    console.log('🚀 Fetching groups from GPS API');
    
    try {
      const response = await fetch("https://api-d.gpsguard.eu/api/v1/groups", {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `Orion ${this.token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Groups API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Groups API success:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('💥 Groups API error:', error);
      throw new Error(`Nepodařilo se načíst skupiny: ${error.message}`);
    }
  }

  async getVehiclesByGroup(groupCode: string): Promise<Vehicle[]> {
    console.log(`🚀 Fetching vehicles for group: ${groupCode}`);
    
    try {
      const response = await fetch(`https://api-d.gpsguard.eu/api/v1/group/${groupCode}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `Orion ${this.token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Vehicles API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Vehicles API success:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('💥 Vehicles API error:', error);
      throw new Error(`Nepodařilo se načíst vozidla: ${error.message}`);
    }
  }
}

export const gpsService = new GPSService();
export type { Vehicle, Group };