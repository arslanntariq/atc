export interface Flight {
  id: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  status: 'cruising' | 'landing' | 'emergency';
}

export interface Emergency {
  id: string;
  flightId: string;
  type: 'technical' | 'weather' | 'medical';
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}