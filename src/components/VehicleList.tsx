import { AppHeader } from "./AppHeader";
import { Card } from "@/components/ui/card";
import { Car } from "lucide-react";

export function VehicleList() {
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
              <h1 className="text-3xl font-bold text-foreground">GPS Dozor Dashboard</h1>
              <p className="text-muted-foreground">
                Template pre GPS tracking aplikáciu
              </p>
            </div>
          </div>
        </div>

        <Card className="p-12 text-center bg-card/80 backdrop-blur-sm">
          <Car className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2 text-card-foreground">GPS Dozor Template</h2>
          <p className="text-muted-foreground">
            Šablóna je pripravená pre implementáciu GPS tracking funkcionalít.
          </p>
        </Card>
      </div>
    </div>
  );
}