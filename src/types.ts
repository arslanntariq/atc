export interface Flight {
  id: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  status: 'cruising' | 'landing' | 'emergency' | 'takeoff' | 'holding';
  departureAirport: string;
  arrivalAirport: string;
  fuelLevel: number;
  priority: number;
  estimatedArrivalTime: string;
}

export interface Emergency {
  id: string;
  flightId: string;
  type: 'technical' | 'weather' | 'medical' | 'fuel';
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface Airport {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  runways: number;
  availableRunways: number;
}