import { useState, useEffect } from "react";
import { VehicleCard } from "./VehicleCard";
import { AppHeader } from "./AppHeader";
import { gpsService, type Vehicle } from "@/services/gpsService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertCircle, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";

export function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { isTokenValid, mode, token, selectedGroup } = useApp();

  const fetchVehicles = async (isRefresh = false) => {
    if (!isTokenValid) {
      setError("Token nie je nastavený");
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      let vehicleData: Vehicle[];
      
      // Both dev and production mode now work the same way - require group selection
      if (!selectedGroup) {
        setError("Vyberte skupinu");
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      console.log(`🎯 ${mode} mode: Fetching vehicles for group: ${selectedGroup}`);
      vehicleData = await gpsService.getVehiclesByGroup(selectedGroup);
      
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

  // Fetch groups for display purposes
  useEffect(() => {
    if (isTokenValid) {
      gpsService.getGroups()
        .then(setGroups)
        .catch(() => setGroups([]));
    }
  }, [isTokenValid]);

  useEffect(() => {
    // Fetch vehicles when we have a valid token AND a selected group (both dev and production)
    if (isTokenValid && selectedGroup) {
      fetchVehicles();
    }
  }, [isTokenValid, mode, selectedGroup]);

  // Auto-refresh when token is manually updated in dev mode
  useEffect(() => {
    if (mode === 'dev' && isTokenValid && token) {
      fetchVehicles();
    }
  }, [token]);

  // This effect is now handled in the main useEffect above
  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <AppHeader />
        <div className="flex items-center justify-center p-6">
          <Card className="p-8 text-center max-w-md mx-auto bg-card/80 backdrop-blur-sm">
            {mode === 'production' ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                {(!token) ? (
                  <>
                    <h2 className="text-xl font-semibold mb-2 text-card-foreground">Čakám na token...</h2>
                    <p className="text-muted-foreground">Očakávam access token z parent okna</p>
                  </>
                ) : !selectedGroup ? (
                  <>
                    <h2 className="text-xl font-semibold mb-2 text-card-foreground">Čakám na skupinu...</h2>
                    <p className="text-muted-foreground">Očakávam group code z parent okna</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-2 text-card-foreground">Pripravujem dáta...</h2>
                    <p className="text-muted-foreground">Prosím čakajte</p>
                  </>
                )}
              </>
            ) : (
              <>
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                <h2 className="text-xl font-semibold mb-2 text-card-foreground">Token nie je nastavený</h2>
                <p className="text-muted-foreground">V dev režime vložte access token hore v hlavičke.</p>
              </>
            )}
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <AppHeader />
        <div className="flex items-center justify-center p-6">
          <Card className="p-8 text-center max-w-md mx-auto bg-card/80 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2 text-card-foreground">Načítám vozidla...</h2>
            <p className="text-muted-foreground">Pripájam sa k GPS Dozor API</p>
          </Card>
        </div>
      </div>
    );
  }

  if (error && vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <AppHeader />
        <div className="flex items-center justify-center p-6">
          <Card className="p-8 text-center max-w-md mx-auto bg-card/80 backdrop-blur-sm">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2 text-card-foreground">Chyba pripojenia</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchVehicles()} className="bg-gradient-primary hover:opacity-90">
              Zkusit znovu
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      <AppHeader />
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-foreground">GPS Dozor Dashboard</h1>
                {selectedGroup && (
                  <span className="text-lg text-muted-foreground">
                    - {groups.find(g => g.code === selectedGroup)?.name || selectedGroup}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">
                {vehicles.length} vozidel celkom
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
            <h2 className="text-xl font-semibold mb-2 text-card-foreground">Žiadne vozidla</h2>
            <p className="text-muted-foreground">
              Nie sú k dispozicii žiadne vozidla.
            </p>
          </Card>
        ) : (
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-3 pr-2">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.code} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}