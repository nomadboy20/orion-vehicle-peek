

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
    console.log('🔑 Using token:', this.token ? `${this.token.substring(0, 20)}...` : 'NO TOKEN');

    let controller = new AbortController();
    let timeoutId: number | undefined;

    try {
      timeoutId = window.setTimeout(() => controller.abort(), 12000);

      const response = await fetch("https://api-d.gpsguard.eu/api/v1/groups", {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `Orion ${this.token}`,
        },
        signal: controller.signal,
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Groups API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Groups API success:', data);
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.error('⏱️ Groups API timeout');
        throw new Error('Časový limit požiadavky (groups) vypršal');
      }
      console.error('💥 Groups API error:', error);
      throw new Error(`Nepodařilo se načíst skupiny: ${error.message || error}`);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  async getVehiclesByGroup(groupCode: string): Promise<Vehicle[]> {
    console.log(`🚀 Fetching vehicles for group: ${groupCode}`);
    
    let controller = new AbortController();
    let timeoutId: number | undefined;

    try {
      timeoutId = window.setTimeout(() => controller.abort(), 12000);

      const response = await fetch(`https://api-d.gpsguard.eu/api/v1/group/${groupCode}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `Orion ${this.token}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Vehicles API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Vehicles API success:', data);
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.error('⏱️ Vehicles API timeout');
        throw new Error('Časový limit požiadavky (vehicles) vypršal');
      }
      console.error('💥 Vehicles API error:', error);
      throw new Error(`Nepodařilo se načíst vozidla: ${error.message || error}`);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    console.log('🚀 Fetching all vehicles from GPS API');
    
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