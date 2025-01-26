import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Flight, Emergency } from '@/types';

interface MapProps {
  flights: Flight[];
  emergencies: Emergency[];
}

const Map = ({ flights, emergencies }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoiYXJzbGFuaGF0enMiLCJhIjoiY202ZGxzcHExMHY3YzJrc2RnbXF0NDBwdiJ9.hqNL2lkPpr9PQ6Q61omrWg';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      projection: 'globe',
      zoom: 1.5,
      center: [0, 20],
      pitch: 45,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(186, 210, 235)',
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

  useEffect(() => {
    if (!map.current) return;

    // Update markers
    flights.forEach(flight => {
      let marker = markersRef.current[flight.id];
      
      if (!marker) {
        const el = document.createElement('div');
        el.className = 'flight-marker';
        
        marker = new mapboxgl.Marker(el)
          .setLngLat([flight.longitude, flight.latitude])
          .addTo(map.current!);
        
        markersRef.current[flight.id] = marker;
      } else {
        marker.setLngLat([flight.longitude, flight.latitude]);
      }
    });

    // Remove old markers
    Object.keys(markersRef.current).forEach(id => {
      if (!flights.find(f => f.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, [flights]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="map-container" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10" />
    </div>
  );
};

export default Map;