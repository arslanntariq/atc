import React, { useState, useMemo, KeyboardEvent } from 'react';
import { Search, Plane } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Flight } from '@/types';

const AIRPORTS = [
  { code: 'LHE', name: 'Allama Iqbal International' },
  { code: 'KHI', name: 'Jinnah International' },
  { code: 'ISB', name: 'Islamabad International' },
  { code: 'DXB', name: 'Dubai International' },
  { code: 'DEL', name: 'Indira Gandhi International' },
  { code: 'DOH', name: 'Hamad International' },
  { code: 'IST', name: 'Istanbul Airport' },
  { code: 'BKK', name: 'Suvarnabhumi Airport' }
];

interface FlightSearchProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
}

const FlightSearch = ({ flights, onSelectFlight }: FlightSearchProps) => {
  const [fromAirport, setFromAirport] = useState<string>('');
  const [toAirport, setToAirport] = useState<string>('');
  const [flightId, setFlightId] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  // Get only active flights (not landed or completed)
  const activeFlights = useMemo(() => {
    return flights.filter(flight => 
      flight.status !== 'landed' && 
      flight.status !== 'completed'
    );
  }, [flights]);

  // Filter flights based on search criteria
  const filteredFlights = useMemo(() => {
    let results = activeFlights;

    if (isSearching) {
      // If searching by flight ID
      if (flightId) {
        results = results.filter(flight => 
          flight.id.toLowerCase().includes(flightId.toLowerCase())
        );
      }
      
      // If searching by route
      if (fromAirport && fromAirport !== 'all') {
        results = results.filter(flight => 
          flight.departureAirport === fromAirport
        );
      }
      
      if (toAirport && toAirport !== 'all') {
        results = results.filter(flight => 
          flight.arrivalAirport === toAirport
        );
      }
    } else {
      // If not searching, show all active flights
      return activeFlights;
    }

    return results;
  }, [activeFlights, isSearching, flightId, fromAirport, toAirport]);

  const handleSearch = () => {
    setIsSearching(true);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setFromAirport('');
    setToAirport('');
    setFlightId('');
    setIsSearching(false);
  };

  return (
    <div className="space-y-4 p-4 bg-gray-900 rounded-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Active Flights</h2>
        {isSearching && (
          <button 
            onClick={handleClearSearch}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Clear Search
          </button>
        )}
      </div>
      
      {/* Route Search */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400">Search by Route</h3>
        <div className="grid grid-cols-2 gap-2">
          <Select value={fromAirport} onValueChange={setFromAirport}>
            <SelectTrigger>
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Airports</SelectItem>
              {AIRPORTS.map(airport => (
                <SelectItem key={airport.code} value={airport.code}>
                  {airport.code} - {airport.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={toAirport} onValueChange={setToAirport}>
            <SelectTrigger>
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Airports</SelectItem>
              {AIRPORTS.map(airport => (
                <SelectItem key={airport.code} value={airport.code}>
                  {airport.code} - {airport.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Flight ID Search */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400">Search by Flight ID</h3>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Enter flight ID and press Enter..."
            value={flightId}
            onChange={(e) => setFlightId(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-8"
          />
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
      >
        Search Flights
      </button>

      {/* Flight List */}
      <div className="space-y-2 mt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-400">
            {isSearching ? 'Search Results' : 'All Active Flights'} ({filteredFlights.length})
          </h3>
        </div>
        
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredFlights.length > 0 ? (
            filteredFlights.map(flight => (
              <Card 
                key={flight.id}
                className="p-3 bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => onSelectFlight(flight)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">{flight.id}</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {flight.departureAirport} → {flight.arrivalAirport}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    flight.status === 'emergency' ? 'bg-red-900/50 text-red-400' :
                    flight.status === 'landing' ? 'bg-blue-900/50 text-blue-400' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {flight.status}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              {isSearching ? 'No flights found matching your search criteria' : 'No active flights available'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightSearch;