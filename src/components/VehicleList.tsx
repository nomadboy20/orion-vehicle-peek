import { useState, useEffect } from "react";
import { VehicleCard } from "./VehicleCard";
import { gpsService, type Vehicle } from "@/services/gpsService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertCircle, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchVehicles = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const vehicleData = await gpsService.getAllVehicles();
      setVehicles(vehicleData);
      
      if (isRefresh) {
        toast({
          title: "Aktualizováno",
          description: `Načteno ${vehicleData.length} vozidel`,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Neočekávaná chyba";
      setError(errorMessage);
      toast({
        title: "Chyba",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchVehicles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md mx-auto bg-card/80 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2 text-card-foreground">Načítám vozidla...</h2>
          <p className="text-muted-foreground">Připojuji se k GPS Dozor API</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md mx-auto bg-card/80 backdrop-blur-sm">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold mb-2 text-card-foreground">Chyba připojení</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchVehicles()} className="bg-gradient-primary hover:opacity-90">
            Zkusit znovu
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">GPS Dozor Dashboard</h1>
              <p className="text-muted-foreground">
                Aktuálně sledováno {vehicles.length} vozidel
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => fetchVehicles(true)}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2 hover:bg-secondary/80"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Aktualizovat
          </Button>
        </div>

        {vehicles.length === 0 ? (
          <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
            <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2 text-card-foreground">Žádná vozidla</h2>
            <p className="text-muted-foreground">
              Momentálně nejsou k dispozici žádná vozidla pro sledování.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.Code} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}