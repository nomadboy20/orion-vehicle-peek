import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { gpsService, type Vehicle, type Position } from "@/services/gpsService";
import { useApp } from "@/contexts/AppContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  MapPin, 
  Battery, 
  Gauge, 
  ArrowLeft, 
  Clock, 
  Fuel,
  Calendar,
  Building2,
  Hash,
  Activity,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function VehicleDetail() {
  const { vehicleCode } = useParams<{ vehicleCode: string }>();
  const { token } = useApp();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVehicleDetail = async () => {
      if (!vehicleCode || !token) return;
      
      setLoading(true);
      try {
        // Fetch single vehicle data using the dedicated endpoint
        const vehicleData = await gpsService.getVehicle(vehicleCode);
        
        // Load last 3 positions
        const positions = await gpsService.getVehicleHistory(vehicleCode, 3);
        setVehicle({ ...vehicleData, recentPositions: positions });
      } catch (error: any) {
        console.error('Error loading vehicle detail:', error);
        toast.error(`Nepodarilo sa načítať detail vozidla: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadVehicleDetail();
  }, [vehicleCode, token]);

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

  const formatDateTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
    } catch {
      return "neznámo";
    }
  };

  const formatOdometer = (meters: number) => {
    const km = meters / 1000;
    return `${km.toLocaleString('sk-SK', { maximumFractionDigits: 1 })} km`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <div className="p-6">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <div className="p-6">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Späť na zoznam
            </Button>
          </Link>
          <Card className="p-12 text-center">
            <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Vozidlo nebolo nájdené</h2>
            <p className="text-muted-foreground">
              Požadované vozidlo neexistuje alebo nemáte prístupové práva.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="p-6">
        {/* Back button */}
        <Link to="/">
          <Button variant="ghost" className="mb-6 hover-scale">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Späť na zoznam
          </Button>
        </Link>

        {/* Header Card */}
        <Card className="p-6 mb-6 bg-gradient-surface border-border/50 animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                <Car className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{vehicle.name}</h1>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-lg font-mono">
                    {vehicle.spz}
                  </Badge>
                  <Badge variant={getSpeedBadgeVariant(vehicle.speed)} className="text-base">
                    <Gauge className="w-4 h-4 mr-1" />
                    {vehicle.speed} km/h
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Posledná aktualizácia</div>
              <div className="text-sm font-medium">{formatDateTime(vehicle.lastPositionTimestamp)}</div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Základné informácie
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="w-4 h-4" />
                  <span>Kód vozidla</span>
                </div>
                <span className="font-mono font-semibold">{vehicle.code}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="w-4 h-4" />
                  <span>Kód skupiny</span>
                </div>
                <span className="font-mono font-semibold">{vehicle.groupCode}</span>
              </div>

              {vehicle.branchName && (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>Pobočka</span>
                  </div>
                  <span className="font-semibold">{vehicle.branchName}</span>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Fuel className="w-4 h-4" />
                  <span>Stav kilometrov</span>
                </div>
                <span className="font-semibold">{formatOdometer(vehicle.odometer)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Battery className={`w-4 h-4 ${getBatteryColor(vehicle.batteryPercentage)}`} />
                  <span>Batéria</span>
                </div>
                <span className={`font-semibold ${getBatteryColor(vehicle.batteryPercentage)}`}>
                  {vehicle.batteryPercentage}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Gauge className="w-4 h-4" />
                  <span>Aktuálna rýchlosť</span>
                </div>
                <span className="font-semibold">{vehicle.speed} km/h</span>
              </div>
            </div>
          </Card>

          {/* GPS Position */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Aktuálna pozícia
            </h2>
            {vehicle.lastPosition ? (
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-sm text-muted-foreground mb-2">GPS Súradnice</div>
                  <div className="font-mono text-lg font-semibold">
                    {(vehicle.lastPosition.latitudeE6 / 1000000).toFixed(6)}, {(vehicle.lastPosition.longitudeE6 / 1000000).toFixed(6)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Zemepisná šírka</div>
                    <div className="font-mono font-semibold">
                      {(vehicle.lastPosition.latitudeE6 / 1000000).toFixed(6)}°
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Zemepisná dĺžka</div>
                    <div className="font-mono font-semibold">
                      {(vehicle.lastPosition.longitudeE6 / 1000000).toFixed(6)}°
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Calendar className="w-3 h-3" />
                    <span>Čas zaznamenania</span>
                  </div>
                  <div className="font-semibold">{formatDateTime(vehicle.lastPositionTimestamp)}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">GPS pozícia nie je dostupná</p>
              </div>
            )}
          </Card>

          {/* Refueling Cards */}
          {vehicle.refuelingCards && vehicle.refuelingCards.length > 0 && (
            <Card className="p-6 bg-card/80 backdrop-blur-sm animate-fade-in">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Palivové karty
              </h2>
              <div className="space-y-2">
                {vehicle.refuelingCards.map((card, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono">{card}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Positions History */}
          {vehicle.recentPositions && vehicle.recentPositions.length > 0 && (
            <Card className="p-6 bg-card/80 backdrop-blur-sm animate-fade-in lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                História pozícií (posledné 3)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vehicle.recentPositions.map((position, index) => (
                  <div 
                    key={index} 
                    className="p-4 bg-gradient-surface border border-border/50 rounded-lg hover:shadow-medium transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{3 - index}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(position.time)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-accent mt-0.5" />
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground mb-1">GPS Súradnice</div>
                          <div className="font-mono text-sm">
                            {(position.latitudeE6 / 1000000).toFixed(5)}, {(position.longitudeE6 / 1000000).toFixed(5)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">Rýchlosť</span>
                        <Badge variant="outline">
                          <Gauge className="w-3 h-3 mr-1" />
                          {position.speed} km/h
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
