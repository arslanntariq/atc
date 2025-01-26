import { useState, useEffect } from 'react';
import { Flight, Emergency } from '@/types';

const generateRandomPosition = () => ({
  latitude: Math.random() * 180 - 90,
  longitude: Math.random() * 360 - 180,
});

const generateRandomFlight = (): Flight => ({
  id: `FL${Math.floor(Math.random() * 9999)}`,
  ...generateRandomPosition(),
  altitude: Math.floor(Math.random() * 35000 + 5000),
  speed: Math.floor(Math.random() * 500 + 300),
  status: 'cruising',
});

export const useFlightSimulation = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);

  useEffect(() => {
    // Initial flights
    setFlights([generateRandomFlight(), generateRandomFlight()]);

    // Update positions every second
    const interval = setInterval(() => {
      setFlights(prev => prev.map(flight => ({
        ...flight,
        latitude: flight.latitude + (Math.random() - 0.5) * 0.1,
        longitude: flight.longitude + (Math.random() - 0.5) * 0.1,
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addFlight = () => {
    setFlights(prev => [...prev, generateRandomFlight()]);
  };

  const triggerEmergency = () => {
    if (flights.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * flights.length);
    const affectedFlight = flights[randomIndex];
    
    setFlights(prev => prev.map((flight, index) => 
      index === randomIndex ? { ...flight, status: 'emergency' } : flight
    ));
    
    setEmergencies(prev => [...prev, {
      id: `EM${Math.floor(Math.random() * 9999)}`,
      flightId: affectedFlight.id,
      type: 'technical',
      severity: 'high',
      timestamp: new Date().toISOString(),
    }]);
  };

  return {
    flights,
    emergencies,
    addFlight,
    triggerEmergency,
  };
};