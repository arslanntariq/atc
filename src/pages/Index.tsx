import React, { useState } from 'react';
import Map from '@/components/Map';
import FlightSearch from '@/components/FlightSearch';
import FlightDetailsDialog from '@/components/FlightDetailsDialog';
import { Flight } from '@/types';
import { useFlightSimulation } from '@/hooks/useFlightSimulation';

const Index = () => {
  const { flights, emergencies, flightStats, addFlight, triggerEmergency } = useFlightSimulation();
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Panel - Flight List */}
      <div className="w-80 border-r border-gray-800 h-full overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">All Flights</h2>
          <div className="space-y-2">
            {flights.map(flight => (
              <div 
                key={flight.id}
                className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer"
                onClick={() => handleFlightSelect(flight)}
              >
                <div className="font-medium">{flight.id}</div>
                <div className="text-sm text-gray-400">
                  {flight.altitude}ft | {flight.speed}kts
                </div>
                <div className={`mt-1 text-sm px-2 py-1 rounded-full text-center ${
                  flight.status === 'emergency' ? 'bg-red-500 text-white' :
                  flight.status === 'landing' ? 'bg-blue-500 text-white' :
                  flight.status === 'landed' ? 'bg-green-500 text-white' :
                  flight.status === 'takeoff' ? 'bg-yellow-500 text-white' :
                  'bg-gray-600'
                }`}>
                  {flight.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center - Map Area */}
      <div className="flex-1 relative h-full">
        {/* Stats Bar - Only on top of map */}
        <div className="absolute inset-x-0 top-0 z-10" style={{ width: 'calc(100%)' }}>
          <div className="bg-gray-800/80 backdrop-blur-sm p-2">
            <div className="flex justify-between items-center px-4">
              <h1 className="text-lg font-bold">Flight Control Center</h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Total:</span>
                  <span className="font-bold">{flightStats.total}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Cruising:</span>
                  <span className="font-bold text-yellow-400">{flightStats.cruising}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Taking Off:</span>
                  <span className="font-bold text-blue-400">{flightStats.takeoff}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Landed:</span>
                  <span className="font-bold text-green-400">{flightStats.landed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Emergency:</span>
                  <span className="font-bold text-red-400">{emergencies.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Component */}
        <Map 
          flights={flights.filter(f => f.status !== 'landed')} 
          emergencies={emergencies}
          onSelectFlight={handleFlightSelect}
        />
      </div>

      {/* Right Panel - Search and Controls */}
      <div className="w-96 border-l border-gray-800 h-full overflow-y-auto">
        <FlightSearch 
          flights={flights}
          onSelectFlight={handleFlightSelect}
        />
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <button 
              onClick={addFlight}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
            >
              Add Flight
            </button>
            <button 
              onClick={triggerEmergency}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
            >
              Trigger Emergency
            </button>
          </div>
        </div>
      </div>

      {/* Flight Details Dialog */}
      <FlightDetailsDialog
        flight={selectedFlight}
        emergency={selectedFlight ? emergencies.find(e => e.flightId === selectedFlight.id) : null}
        isOpen={!!selectedFlight}
        onClose={() => setSelectedFlight(null)}
      />
    </div>
  );
};

export default Index;