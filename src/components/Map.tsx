import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Flight, Emergency } from '@/types';
import FlightDetailsDialog from './FlightDetailsDialog';

const AIRPORTS = [
  { code: 'LHE', name: 'Allama Iqbal International', latitude: 31.5216, longitude: 74.4036 },
  { code: 'KHI', name: 'Jinnah International', latitude: 24.9008, longitude: 67.1681 },
  { code: 'ISB', name: 'Islamabad International', latitude: 33.6162, longitude: 73.0996 },
  { code: 'DXB', name: 'Dubai International', latitude: 25.2532, longitude: 55.3657 },
  { code: 'DEL', name: 'Indira Gandhi International', latitude: 28.5562, longitude: 77.1000 },
  { code: 'DOH', name: 'Hamad International', latitude: 25.2609, longitude: 51.6138 },
  { code: 'IST', name: 'Istanbul Airport', latitude: 41.2753, longitude: 28.7519 },
  { code: 'BKK', name: 'Suvarnabhumi Airport', latitude: 13.6900, longitude: 100.7501 }
];

interface MapProps {
  flights: Flight[];
  emergencies: Emergency[];
}

const PLANE_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <path d="M21.5,15.5L15.5,12L12.5,9.5L9.5,7L7,6C6.4,5.8 5.8,6.4 6,7L7,9.5L9.5,12.5L12,15.5L15.5,21.5C15.7,22.1 16.3,22.1 16.5,21.5L18,17L22,15.5C22.6,15.3 22.1,14.7 21.5,15.5Z" fill="currentColor"/>
  <path d="M3,8L6,9.5L7,11L5.5,12.5L2.5,13C2,13.1 1.9,12.6 2.2,12.3L3.7,10.8L3,8Z" fill="currentColor"/>
</svg>
`;

const Map = ({ flights, emergencies }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoiYXJzbGFuaGF0enMiLCJhIjoiY202ZGxzcHExMHY3YzJrc2RnbXF0NDBwdiJ9.hqNL2lkPpr9PQ6Q61omrWg';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [69.3451, 30.3753],
      zoom: 4,
      projection: 'globe',
      pitch: 45,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(12, 12, 25)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
      });
    });

    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, []);

  const calculateFlightRotation = (flight: Flight): number => {
    const destinationAirport = AIRPORTS.find(a => a.code === flight.arrivalAirport);
    if (!destinationAirport) return 0;

    const dx = destinationAirport.longitude - flight.longitude;
    const dy = destinationAirport.latitude - flight.latitude;
    
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = (angle + 360) % 360;
    
    return angle;
  };

  const createPlaneElement = (flight: Flight) => {
    const el = document.createElement('div');
    el.className = 'plane-marker';
    el.innerHTML = PLANE_ICON;
    
    const rotation = calculateFlightRotation(flight);
    
    el.style.setProperty('--rotation', `${rotation}deg`);
    el.style.cssText = `
      width: 32px;
      height: 32px;
      transform: rotate(${rotation}deg);
      transition: transform 0.3s ease;
    `;

    if (flight.status === 'emergency') {
      el.classList.add('emergency');
    }

    // Add click handler to show flight details
    el.addEventListener('click', () => {
      setSelectedFlight(flight);
    });

    return el;
  };

  useEffect(() => {
    if (!map.current) return;

    flights.forEach(flight => {
      let marker = markersRef.current[flight.id];
      
      if (!marker) {
        const el = createPlaneElement(flight);
        
        marker = new mapboxgl.Marker({
          element: el,
          rotationAlignment: 'map',
          pitchAlignment: 'map'
        })
          .setLngLat([flight.longitude, flight.latitude])
          .addTo(map.current!);
        
        markersRef.current[flight.id] = marker;
      } else {
        // Update existing marker
        const el = marker.getElement();
        const rotation = calculateFlightRotation(flight);
        el.style.setProperty('--rotation', `${rotation}deg`);
        el.style.transform = `rotate(${rotation}deg)`;
        el.classList.toggle('emergency', flight.status === 'emergency');
        marker.setLngLat([flight.longitude, flight.latitude]);
      }
    });

    // Remove markers for flights that no longer exist
    Object.keys(markersRef.current).forEach(id => {
      if (!flights.find(f => f.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, [flights]);

  const getEmergencyForFlight = (flightId: string) => {
    return emergencies.find(e => e.flightId === flightId) || null;
  };

  return (
    <div className="w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      <FlightDetailsDialog
        flight={selectedFlight}
        emergency={selectedFlight ? getEmergencyForFlight(selectedFlight.id) : null}
        isOpen={!!selectedFlight}
        onClose={() => setSelectedFlight(null)}
      />
    </div>
  );
};

export default Map;