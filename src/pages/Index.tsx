import React from 'react';
import Map from '@/components/Map';
import Dashboard from '@/components/Dashboard';
import FlightControls from '@/components/FlightControls';
import { useFlightSimulation } from '@/hooks/useFlightSimulation';

const Index = () => {
  const { flights, emergencies, addFlight, triggerEmergency } = useFlightSimulation();

  return (
    <div className="min-h-screen p-4 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-2rem)]">
        <div className="lg:w-2/3 h-full relative">
          <Map flights={flights} emergencies={emergencies} />
        </div>
        <div className="lg:w-1/3 h-full flex flex-col gap-4">
          <Dashboard flights={flights} emergencies={emergencies} />
          <FlightControls onAddFlight={addFlight} onEmergency={triggerEmergency} />
        </div>
      </div>
    </div>
  );
};

export default Index;