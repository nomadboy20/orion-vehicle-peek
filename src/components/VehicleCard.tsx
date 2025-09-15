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
  lastPosition: {
    latitudeE6: number;
    longitudeE6: number;
  };
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
    <Card className="p-6 hover:shadow-medium transition-all duration-300 hover:scale-[1.02] bg-gradient-surface border-border/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-primary text-primary-foreground">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-card-foreground">{vehicle.name}</h3>
            <p className="text-sm text-muted-foreground font-mono">{vehicle.spz}</p>
          </div>
        </div>
        <Badge variant={getSpeedBadgeVariant(vehicle.speed)} className="flex items-center gap-1">
          <Gauge className="w-3 h-3" />
          {vehicle.speed} km/h
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-accent" />
          <span className="text-muted-foreground">
            {(vehicle.lastPosition.latitudeE6 / 1000000).toFixed(4)}, {(vehicle.lastPosition.longitudeE6 / 1000000).toFixed(4)}
          </span>
        </div>

        {vehicle.batteryPercentage > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Battery className={`w-4 h-4 ${getBatteryColor(vehicle.batteryPercentage)}`} />
            <span className="text-muted-foreground">
              Baterie: {vehicle.batteryPercentage}%
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Poslední aktualizace: {formatLastSeen(vehicle.lastPositionTimestamp)}
          </p>
          {vehicle.branchName && (
            <p className="text-xs text-muted-foreground">
              Pobočka: {vehicle.branchName}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}