import React from 'react';
import { Card } from '@/components/ui/card';
import { Flight, Emergency } from '@/types';

interface DashboardProps {
  flights: Flight[];
  emergencies: Emergency[];
}

const Dashboard = ({ flights, emergencies }: DashboardProps) => {
  return (
    <div className="glassmorphism rounded-lg p-4 space-y-4">
      <h2 className="text-xl font-bold text-primary">Flight Status</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-card/50">
          <p className="text-sm text-muted-foreground">Active Flights</p>
          <p className="text-2xl font-mono">{flights.length}</p>
        </Card>
        
        <Card className="p-4 bg-destructive/20">
          <p className="text-sm text-muted-foreground">Emergencies</p>
          <p className="text-2xl font-mono text-destructive">{emergencies.length}</p>
        </Card>
      </div>

      <div className="h-[200px] overflow-y-auto">
        {flights.map(flight => (
          <div key={flight.id} className="flex items-center justify-between p-2 border-b border-border">
            <div>
              <p className="font-mono">{flight.id}</p>
              <p className="text-sm text-muted-foreground">
                {flight.altitude}ft | {flight.speed}kts
              </p>
            </div>
            <div className={`px-2 py-1 rounded ${
              flight.status === 'emergency' ? 'bg-destructive text-destructive-foreground' :
              flight.status === 'landing' ? 'bg-primary text-primary-foreground' :
              'bg-secondary text-secondary-foreground'
            }`}>
              {flight.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;