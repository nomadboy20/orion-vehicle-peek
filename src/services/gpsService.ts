

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
  }

  getToken(): string {
    return this.token;
  }

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