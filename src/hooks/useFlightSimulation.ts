import { useState, useEffect, useCallback, useMemo } from 'react';
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

const FUEL_CONSUMPTION_RATE = 0.1; // % per second
const LANDING_THRESHOLD_DISTANCE = 0.5; // degrees
const TAKEOFF_FUEL = 100;
const LANDING_FUEL_THRESHOLD = 20;
const TAKEOFF_TO_CRUISING_TIME = 30000; // 30 seconds in milliseconds

const generateRandomFlight = (initialStatus?: 'landed' | 'takeoff' | 'cruising'): Flight => {
  const departureAirport = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
  let arrivalAirport;
  do {
    arrivalAirport = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
  } while (arrivalAirport.code === departureAirport.code);

  let status = initialStatus || 'takeoff';
  let altitude = Math.floor(Math.random() * 35000 + 5000);
  let fuelLevel = TAKEOFF_FUEL;

  switch (status) {
    case 'landed':
      altitude = 0;
      fuelLevel = 10;
      break;
    case 'takeoff':
      altitude = Math.floor(Math.random() * 5000 + 1000);
      fuelLevel = 95;
      break;
    case 'cruising':
      altitude = Math.floor(Math.random() * 15000 + 25000);
      fuelLevel = Math.floor(Math.random() * 30 + 60);
      break;
  }

  return {
    id: `FL${Math.floor(Math.random() * 9999)}`,
    latitude: departureAirport.latitude,
    longitude: departureAirport.longitude,
    altitude,
    speed: Math.floor(Math.random() * 500 + 300),
    status,
    departureAirport: departureAirport.code,
    arrivalAirport: arrivalAirport.code,
    fuelLevel,
    priority: status === 'landed' ? 0 : 1,
    estimatedArrivalTime: new Date(Date.now() + Math.random() * 3600000).toISOString(),
    takeoffTime: status === 'takeoff' ? Date.now() : undefined,
  };
};

const generateInitialFlights = (): Flight[] => {
  const flights: Flight[] = [];
  
  // Generate 2 landed flights
  flights.push(generateRandomFlight('landed'));
  flights.push(generateRandomFlight('landed'));
  
  // Generate 3 takeoff flights
  for (let i = 0; i < 3; i++) {
    flights.push(generateRandomFlight('takeoff'));
  }
  
  // Generate 5 cruising flights
  for (let i = 0; i < 5; i++) {
    flights.push(generateRandomFlight('cruising'));
  }
  
  return flights;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
};

export const useFlightSimulation = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [airports, setAirports] = useState<Airport[]>(AIRPORTS);

  // Initialize flights
  useEffect(() => {
    const initialFlights = generateInitialFlights();
    setFlights(initialFlights);
  }, []);

  // Priority Scheduling Algorithm
  const priorityScheduler = useCallback(() => {
    setFlights(prev => {
      return [...prev].sort((a, b) => {
        if (a.status === 'emergency') return -1;
        if (b.status === 'emergency') return 1;
        if (a.fuelLevel < LANDING_FUEL_THRESHOLD) return -1;
        if (b.fuelLevel < LANDING_FUEL_THRESHOLD) return 1;
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

  // Real-time flight updates
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      
      setFlights(prev => prev.map(flight => {
        // Skip updates for landed flights
        if (flight.status === 'landed') return flight;

        // Check takeoff to cruising transition
        if (flight.status === 'takeoff' && flight.takeoffTime && 
            (currentTime - flight.takeoffTime) >= TAKEOFF_TO_CRUISING_TIME) {
          flight.status = 'cruising';
          flight.altitude = Math.floor(Math.random() * 15000 + 25000);
          toast({
            title: "Status Update",
            description: `Flight ${flight.id} has reached cruising altitude`,
          });
        }

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
        if (flight.status !== 'emergency' && flight.status !== 'landed') {
          if (distanceToDestination < LANDING_THRESHOLD_DISTANCE) {
            newStatus = 'landing';
          }
        }

        if (newFuelLevel < LANDING_FUEL_THRESHOLD && 
            flight.status !== 'emergency' && 
            flight.status !== 'landed') {
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
          altitude: newStatus === 'landing' ? 
            Math.max(0, flight.altitude - 1000) : flight.altitude
        };
      }));

      priorityScheduler();
      allocateRunways();
    }, 1000);

    return () => clearInterval(interval);
  }, [priorityScheduler, allocateRunways]);

  const addFlight = () => {
    const newFlight = generateRandomFlight('takeoff');
    newFlight.takeoffTime = Date.now();
    setFlights(prev => [...prev, newFlight]);
    toast({
      title: "New Flight Added",
      description: `Flight ${newFlight.id} from ${newFlight.departureAirport} to ${newFlight.arrivalAirport}`,
    });
  };

  const triggerEmergency = () => {
    // Get only cruising flights
    const cruisingFlights = flights.filter(f => f.status === 'cruising');
    
    if (cruisingFlights.length === 0) {
      toast({
        title: "No Cruising Flights",
        description: "No cruising flights available for emergency",
        variant: "destructive",
      });
      return;
    }

    // Select a random cruising flight
    const randomFlight = cruisingFlights[Math.floor(Math.random() * cruisingFlights.length)];

    // Create emergency record
    const emergencyTypes: Emergency['type'][] = ['technical', 'weather', 'medical', 'fuel'];
    const randomType = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];
    
    const newEmergency: Emergency = {
      id: `EM${Math.floor(Math.random() * 9999)}`,
      flightId: randomFlight.id,
      type: randomType,
      severity: 'high',
      timestamp: new Date().toISOString(),
    };

    // Update flight status
    setFlights(prev => prev.map(flight => 
      flight.id === randomFlight.id 
        ? { ...flight, status: 'emergency', priority: 10 } 
        : flight
    ));

    // Add emergency to list
    setEmergencies(prev => [...prev, newEmergency]);

    // Show notification
    toast({
      title: "Emergency Declared",
      description: `Flight ${randomFlight.id} has declared an emergency`,
      variant: "destructive",
    });
  };

  const flightStats = useMemo(() => {
    const total = flights.length;
    const active = flights.filter(f => f.status !== 'landed').length;
    const landed = flights.filter(f => f.status === 'landed').length;
    const takeoff = flights.filter(f => f.status === 'takeoff').length;
    const cruising = flights.filter(f => f.status === 'cruising').length;
    
    return {
      total,
      active,
      landed,
      takeoff,
      cruising
    };
  }, [flights]);

  return {
    flights,
    emergencies,
    airports,
    flightStats,
    addFlight,
    triggerEmergency,
  };
};