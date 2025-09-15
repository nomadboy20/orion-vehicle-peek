import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, MapPin, Battery, Gauge } from "lucide-react";

interface Vehicle {
  code: string;
  groupCode: string;
  branchName?: string;
  name: string;
  spz: string;
  speed: number;
  batteryPercentage: number;
  odometer: number;
  lastPosition?: {
    latitudeE6: number;
    longitudeE6: number;
  } | null;
  lastPositionTimestamp: string;
  refuelingCards: any[];
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const getSpeedBadgeVariant = (speed: number) => {
    if (speed === 0) return "secondary";
    if (speed > 80) return "destructive";
    if (speed > 50) return "default";
    return "secondary";
  };

  const getBatteryColor = (percentage: number) => {
    if (percentage === 0) return "text-muted-foreground";
    if (percentage < 20) return "text-destructive";
    if (percentage < 50) return "text-warning";
    return "text-success";
  };

  const formatLastSeen = (lastPing: string) => {
    try {
      const date = new Date(lastPing);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 1) return "právě teď";
      if (diffMins < 60) return `před ${diffMins} min`;
      if (diffMins < 1440) return `před ${Math.floor(diffMins / 60)} h`;
      return `před ${Math.floor(diffMins / 1440)} dny`;
    } catch {
      return "neznámo";
    }
  };

  return (
    <Card className="p-4 hover:shadow-medium transition-all duration-300 bg-gradient-surface border-border/50">
      <div className="flex items-center justify-between">
        {/* Left section - Vehicle info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="p-2 rounded-lg bg-gradient-primary text-primary-foreground flex-shrink-0">
            <Car className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-lg text-card-foreground truncate">{vehicle.name}</h3>
              <Badge variant={getSpeedBadgeVariant(vehicle.speed)} className="flex items-center gap-1 flex-shrink-0">
                <Gauge className="w-3 h-3" />
                {vehicle.speed} km/h
              </Badge>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="font-mono">{vehicle.spz}</span>
              
              {vehicle.lastPosition ? (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-accent" />
                  <span>{(vehicle.lastPosition.latitudeE6 / 1000000).toFixed(4)}, {(vehicle.lastPosition.longitudeE6 / 1000000).toFixed(4)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span>Pozícia nedostupná</span>
                </div>
              )}
              
              {vehicle.batteryPercentage > 0 && (
                <div className="flex items-center gap-1">
                  <Battery className={`w-3 h-3 ${getBatteryColor(vehicle.batteryPercentage)}`} />
                  <span>{vehicle.batteryPercentage}%</span>
                </div>
              )}
              
              <span className="text-xs">
                {formatLastSeen(vehicle.lastPositionTimestamp)}
              </span>
              
              {vehicle.branchName && (
                <span className="text-xs truncate">
                  {vehicle.branchName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}