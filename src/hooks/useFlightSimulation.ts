import { useState, useEffect, useCallback } from 'react';
import { Flight, Emergency, Airport } from '@/types';
import { toast } from '@/components/ui/use-toast';

const AIRPORTS: Airport[] = [
  { code: 'JFK', name: 'John F. Kennedy', latitude: 40.6413, longitude: -73.7781, runways: 4, availableRunways: 4 },
  { code: 'LAX', name: 'Los Angeles Int', latitude: 33.9416, longitude: -118.4085, runways: 4, availableRunways: 4 },
  { code: 'ORD', name: "O'Hare Int", latitude: 41.9742, longitude: -87.9073, runways: 8, availableRunways: 8 },
  { code: 'LHR', name: 'London Heathrow', latitude: 51.4700, longitude: -0.4543, runways: 2, availableRunways: 2 },
];

const FUEL_CONSUMPTION_RATE = 0.1; // % per second
const LANDING_THRESHOLD_DISTANCE = 0.5; // degrees
const TAKEOFF_FUEL = 100;
const LANDING_FUEL_THRESHOLD = 20;

const generateRandomFlight = (): Flight => {
  const departureAirport = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
  let arrivalAirport;
  do {
    arrivalAirport = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
  } while (arrivalAirport.code === departureAirport.code);

  return {
    id: `FL${Math.floor(Math.random() * 9999)}`,
    latitude: departureAirport.latitude,
    longitude: departureAirport.longitude,
    altitude: Math.floor(Math.random() * 35000 + 5000),
    speed: Math.floor(Math.random() * 500 + 300),
    status: 'takeoff',
    departureAirport: departureAirport.code,
    arrivalAirport: arrivalAirport.code,
    fuelLevel: TAKEOFF_FUEL,
    priority: 1,
    estimatedArrivalTime: new Date(Date.now() + Math.random() * 3600000).toISOString(),
  };
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
};

export const useFlightSimulation = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [airports, setAirports] = useState<Airport[]>(AIRPORTS);

  // Priority Scheduling Algorithm
  const priorityScheduler = useCallback(() => {
    setFlights(prev => {
      return [...prev].sort((a, b) => {
        // Emergency flights get highest priority
        if (a.status === 'emergency') return -1;
        if (b.status === 'emergency') return 1;

        // Low fuel gets higher priority
        if (a.fuelLevel < LANDING_FUEL_THRESHOLD) return -1;
        if (b.fuelLevel < LANDING_FUEL_THRESHOLD) return 1;

        // Sort by combined priority score
        return (b.priority + (100 - b.fuelLevel)) - (a.priority + (100 - a.fuelLevel));
      });
    });
  }, []);

  // Resource Management (Runway Allocation)
  const allocateRunways = useCallback(() => {
    setAirports(prev => {
      return prev.map(airport => {
        const landingFlights = flights.filter(f => 
          f.arrivalAirport === airport.code && 
          (f.status === 'landing' || f.status === 'emergency')
        ).length;

        return {
          ...airport,
          availableRunways: Math.max(0, airport.runways - landingFlights),
        };
      });
    });
  }, [flights]);

  // Initialize with 10 flights
  useEffect(() => {
    const initialFlights = Array(10).fill(null).map(() => generateRandomFlight());
    setFlights(initialFlights);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setFlights(prev => prev.map(flight => {
        // Get destination airport
        const arrivalAirport = AIRPORTS.find(a => a.code === flight.arrivalAirport);
        if (!arrivalAirport) return flight;

        // Calculate new position
        const dx = (arrivalAirport.longitude - flight.longitude) * 0.01;
        const dy = (arrivalAirport.latitude - flight.latitude) * 0.01;
        const newLongitude = flight.longitude + dx;
        const newLatitude = flight.latitude + dy;

        // Calculate distance to destination
        const distanceToDestination = calculateDistance(
          newLatitude,
          newLongitude,
          arrivalAirport.latitude,
          arrivalAirport.longitude
        );

        // Update fuel level
        const newFuelLevel = Math.max(0, flight.fuelLevel - FUEL_CONSUMPTION_RATE);

        // Determine new status
        let newStatus = flight.status;
        if (flight.status !== 'emergency') {
          if (distanceToDestination < LANDING_THRESHOLD_DISTANCE) {
            newStatus = 'landing';
          } else if (flight.status === 'takeoff' && flight.altitude > 10000) {
            newStatus = 'cruising';
          }
        }

        // Check for low fuel
        if (newFuelLevel < LANDING_FUEL_THRESHOLD && flight.status !== 'emergency') {
          toast({
            title: "Low Fuel Alert",
            description: `Flight ${flight.id} is running low on fuel (${newFuelLevel.toFixed(1)}%)`,
            variant: "destructive",
          });
        }

        return {
          ...flight,
          longitude: newLongitude,
          latitude: newLatitude,
          fuelLevel: newFuelLevel,
          status: newStatus,
        };
      }));

      // Run scheduling algorithm
      priorityScheduler();
      // Manage resources
      allocateRunways();
    }, 1000);

    return () => clearInterval(interval);
  }, [priorityScheduler, allocateRunways]);

  const addFlight = () => {
    const newFlight = generateRandomFlight();
    setFlights(prev => [...prev, newFlight]);
    toast({
      title: "New Flight Added",
      description: `Flight ${newFlight.id} from ${newFlight.departureAirport} to ${newFlight.arrivalAirport}`,
    });
  };

  const triggerEmergency = (flightId?: string) => {
    let targetFlightId = flightId;
    
    // If no specific flight, choose a random one
    if (!targetFlightId && flights.length > 0) {
      const randomIndex = Math.floor(Math.random() * flights.length);
      targetFlightId = flights[randomIndex].id;
    }
    
    if (!targetFlightId) return;
    
    setFlights(prev => prev.map(flight => 
      flight.id === targetFlightId 
        ? { ...flight, status: 'emergency', priority: 10 } 
        : flight
    ));
    
    const emergencyTypes: Emergency['type'][] = ['technical', 'weather', 'medical', 'fuel'];
    const randomType = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];
    
    const newEmergency: Emergency = {
      id: `EM${Math.floor(Math.random() * 9999)}`,
      flightId: targetFlightId,
      type: randomType,
      severity: 'high',
      timestamp: new Date().toISOString(),
    };
    
    setEmergencies(prev => [...prev, newEmergency]);

    toast({
      title: "Emergency Declared",
      description: `Emergency protocol initiated for flight ${targetFlightId}`,
      variant: "destructive",
    });
  };

  return {
    flights,
    emergencies,
    airports,
    addFlight,
    triggerEmergency,
  };
};