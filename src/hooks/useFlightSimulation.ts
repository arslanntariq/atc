import { useState, useEffect, useCallback } from 'react';
import { Flight, Emergency, Airport } from '@/types';
import { toast } from '@/components/ui/use-toast';

const AIRPORTS: Airport[] = [
  { code: 'JFK', name: 'John F. Kennedy', latitude: 40.6413, longitude: -73.7781, runways: 4, availableRunways: 4 },
  { code: 'LAX', name: 'Los Angeles Int', latitude: 33.9416, longitude: -118.4085, runways: 4, availableRunways: 4 },
  { code: 'ORD', name: 'O\'Hare Int', latitude: 41.9742, longitude: -87.9073, runways: 8, availableRunways: 8 },
  { code: 'LHR', name: 'London Heathrow', latitude: 51.4700, longitude: -0.4543, runways: 2, availableRunways: 2 },
];

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
    status: 'cruising',
    departureAirport: departureAirport.code,
    arrivalAirport: arrivalAirport.code,
    fuelLevel: 100,
    priority: 1,
    estimatedArrivalTime: new Date(Date.now() + Math.random() * 3600000).toISOString(),
  };
};

export const useFlightSimulation = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [airports, setAirports] = useState<Airport[]>(AIRPORTS);

  // Priority Scheduling Algorithm
  const priorityScheduler = useCallback(() => {
    setFlights(prev => {
      return prev.map(flight => {
        // Increase priority based on fuel level and distance to destination
        const arrivalAirport = AIRPORTS.find(a => a.code === flight.arrivalAirport);
        if (!arrivalAirport) return flight;

        const distance = Math.sqrt(
          Math.pow(flight.latitude - arrivalAirport.latitude, 2) +
          Math.pow(flight.longitude - arrivalAirport.longitude, 2)
        );

        let newPriority = flight.priority;
        if (flight.fuelLevel < 30) newPriority += 2;
        if (distance < 1) newPriority += 1;
        
        return {
          ...flight,
          priority: newPriority,
        };
      }).sort((a, b) => b.priority - a.priority);
    });
  }, []);

  // Resource Management (Runway Allocation)
  const allocateRunways = useCallback(() => {
    setAirports(prev => {
      return prev.map(airport => {
        const landingFlights = flights.filter(f => 
          f.arrivalAirport === airport.code && 
          f.status === 'landing'
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
        // Update position based on destination
        const arrivalAirport = AIRPORTS.find(a => a.code === flight.arrivalAirport);
        if (!arrivalAirport) return flight;

        const dx = (arrivalAirport.longitude - flight.longitude) * 0.1;
        const dy = (arrivalAirport.latitude - flight.latitude) * 0.1;

        // Reduce fuel
        const newFuelLevel = Math.max(0, flight.fuelLevel - 0.5);
        if (newFuelLevel < 20 && flight.status !== 'emergency') {
          toast({
            title: "Low Fuel Alert",
            description: `Flight ${flight.id} is running low on fuel (${newFuelLevel.toFixed(1)}%)`,
            variant: "destructive",
          });
        }

        return {
          ...flight,
          longitude: flight.longitude + dx,
          latitude: flight.latitude + dy,
          fuelLevel: newFuelLevel,
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
    setFlights(prev => [...prev, generateRandomFlight()]);
  };

  const triggerEmergency = () => {
    if (flights.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * flights.length);
    const affectedFlight = flights[randomIndex];
    
    setFlights(prev => prev.map((flight, index) => 
      index === randomIndex ? { ...flight, status: 'emergency', priority: 10 } : flight
    ));
    
    const emergencyTypes: Emergency['type'][] = ['technical', 'weather', 'medical', 'fuel'];
    const randomType = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];
    
    setEmergencies(prev => [...prev, {
      id: `EM${Math.floor(Math.random() * 9999)}`,
      flightId: affectedFlight.id,
      type: randomType,
      severity: 'high',
      timestamp: new Date().toISOString(),
    }]);

    toast({
      title: "Emergency Declared",
      description: `Emergency protocol initiated for flight ${affectedFlight.id}`,
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