import { useState, useEffect, useCallback } from 'react';
import { Flight, Emergency, Airport } from '@/types';
import { toast } from '@/components/ui/use-toast';

const AIRPORTS: Airport[] = [
  { code: 'LHE', name: 'Allama Iqbal International', latitude: 31.5216, longitude: 74.4036, runways: 2, availableRunways: 2 },
  { code: 'KHI', name: 'Jinnah International', latitude: 24.9008, longitude: 67.1681, runways: 3, availableRunways: 3 },
  { code: 'ISB', name: 'Islamabad International', latitude: 33.6162, longitude: 73.0996, runways: 2, availableRunways: 2 },
  { code: 'DXB', name: 'Dubai International', latitude: 25.2532, longitude: 55.3657, runways: 2, availableRunways: 2 },
  { code: 'DEL', name: 'Indira Gandhi International', latitude: 28.5562, longitude: 77.1000, runways: 3, availableRunways: 3 },
  { code: 'DOH', name: 'Hamad International', latitude: 25.2609, longitude: 51.6138, runways: 2, availableRunways: 2 },
  { code: 'IST', name: 'Istanbul Airport', latitude: 41.2753, longitude: 28.7519, runways: 3, availableRunways: 3 },
  { code: 'BKK', name: 'Suvarnabhumi Airport', latitude: 13.6900, longitude: 100.7501, runways: 2, availableRunways: 2 }
];

const FUEL_CONSUMPTION_RATE = 0.1;
const LANDING_THRESHOLD_DISTANCE = 0.5;
const TAKEOFF_FUEL = 100;
const LANDING_FUEL_THRESHOLD = 20;

const generateRandomFlight = (): Flight => {
  const departureAirport = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
  let arrivalAirport;
  do {
    arrivalAirport = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
  } while (arrivalAirport.code === departureAirport.code);

  // Create a plain serializable object
  return JSON.parse(JSON.stringify({
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
  }));
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
};

export const useFlightSimulation = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [airports, setAirports] = useState<Airport[]>(AIRPORTS);

  const priorityScheduler = useCallback(() => {
    setFlights(prev => {
      const sortedFlights = [...prev].sort((a, b) => {
        if (a.status === 'emergency') return -1;
        if (b.status === 'emergency') return 1;
        if (a.fuelLevel < LANDING_FUEL_THRESHOLD) return -1;
        if (b.fuelLevel < LANDING_FUEL_THRESHOLD) return 1;
        return (b.priority + (100 - b.fuelLevel)) - (a.priority + (100 - a.fuelLevel));
      });
      // Ensure the sorted array is serializable
      return JSON.parse(JSON.stringify(sortedFlights));
    });
  }, []);

  const allocateRunways = useCallback(() => {
    setAirports(prev => {
      const updatedAirports = prev.map(airport => {
        const landingFlights = flights.filter(f => 
          f.arrivalAirport === airport.code && 
          (f.status === 'landing' || f.status === 'emergency')
        ).length;

        return {
          ...airport,
          availableRunways: Math.max(0, airport.runways - landingFlights),
        };
      });
      // Ensure the updated airports array is serializable
      return JSON.parse(JSON.stringify(updatedAirports));
    });
  }, [flights]);

  useEffect(() => {
    const initialFlights = Array(10).fill(null).map(() => generateRandomFlight());
    setFlights(initialFlights);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlights(prev => {
        const updatedFlights = prev.map(flight => {
          const arrivalAirport = AIRPORTS.find(a => a.code === flight.arrivalAirport);
          if (!arrivalAirport) return flight;

          const dx = (arrivalAirport.longitude - flight.longitude) * 0.01;
          const dy = (arrivalAirport.latitude - flight.latitude) * 0.01;
          const newLongitude = flight.longitude + dx;
          const newLatitude = flight.latitude + dy;

          const distanceToDestination = calculateDistance(
            newLatitude,
            newLongitude,
            arrivalAirport.latitude,
            arrivalAirport.longitude
          );

          const newFuelLevel = Math.max(0, flight.fuelLevel - FUEL_CONSUMPTION_RATE);

          let newStatus = flight.status;
          if (flight.status !== 'emergency') {
            if (distanceToDestination < LANDING_THRESHOLD_DISTANCE) {
              newStatus = 'landing';
            } else if (flight.status === 'takeoff' && flight.altitude > 10000) {
              newStatus = 'cruising';
            }
          }

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
        });
        // Ensure the updated flights array is serializable
        return JSON.parse(JSON.stringify(updatedFlights));
      });

      priorityScheduler();
      allocateRunways();
    }, 1000);

    return () => clearInterval(interval);
  }, [priorityScheduler, allocateRunways]);

  const addFlight = () => {
    const newFlight = generateRandomFlight();
    setFlights(prev => JSON.parse(JSON.stringify([...prev, newFlight])));
    toast({
      title: "New Flight Added",
      description: `Flight ${newFlight.id} from ${newFlight.departureAirport} to ${newFlight.arrivalAirport}`,
    });
  };

  const triggerEmergency = () => {
    if (flights.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * flights.length);
    const targetFlightId = flights[randomIndex].id;
    
    setFlights(prev => {
      const updatedFlights = prev.map(flight => 
        flight.id === targetFlightId 
          ? { ...flight, status: 'emergency' as const, priority: 10 } 
          : flight
      );
      return JSON.parse(JSON.stringify(updatedFlights));
    });
    
    const emergencyTypes: Emergency['type'][] = ['technical', 'weather', 'medical', 'fuel'];
    const randomType = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];
    
    const newEmergency: Emergency = {
      id: `EM${Math.floor(Math.random() * 9999)}`,
      flightId: targetFlightId,
      type: randomType,
      severity: 'high',
      timestamp: new Date().toISOString(),
    };
    
    setEmergencies(prev => JSON.parse(JSON.stringify([...prev, newEmergency])));

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