import { supabase } from '@/integrations/supabase/client';

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
    console.log('🚀 Calling Supabase edge function for group:', groupCode);
    
    try {
      const { data, error } = await supabase.functions.invoke('gps-vehicles', {
        body: { groupCode }
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(`Function error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from function');
      }

      console.log('✅ Data received from edge function:', data);
      console.log('📊 Number of vehicles:', Array.isArray(data) ? data.length : 'Not an array');
      
      return data;
    } catch (error) {
      console.error('💥 Detailed error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      throw new Error(`Nepodařilo se načíst vozidla: ${error.message}`);
    }
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return this.getVehiclesByGroup('SAGU');
  }
}

export const gpsService = new GPSService();
export type { Vehicle };