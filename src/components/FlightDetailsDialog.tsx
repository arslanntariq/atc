import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Flight, Emergency } from '@/types';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plane, AlertTriangle, Navigation, Fuel, Clock } from 'lucide-react';

interface FlightDetailsDialogProps {
  flight: Flight | null;
  emergency: Emergency | null;
  isOpen: boolean;
  onClose: () => void;
}

const FlightDetailsDialog = ({ flight, emergency, isOpen, onClose }: FlightDetailsDialogProps) => {
  if (!flight) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900/95 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="w-5 h-5" />
            Flight {flight.id}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {flight.departureAirport} → {flight.arrivalAirport}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Navigation className="w-4 h-4" /> Status
            </h3>
            <Badge 
              variant={
                flight.status === 'emergency' ? 'destructive' :
                flight.status === 'landing' ? 'default' :
                'secondary'
              }
              className="text-sm"
            >
              {flight.status.toUpperCase()}
            </Badge>
          </div>

          {/* Flight Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Altitude</p>
              <p className="text-xl font-mono">{flight.altitude}ft</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Speed</p>
              <p className="text-xl font-mono">{flight.speed}kts</p>
            </div>
          </div>

          {/* Fuel Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Fuel className="w-4 h-4" /> Fuel Level
            </h3>
            <Progress 
              value={flight.fuelLevel} 
              className="h-2"
              variant={flight.fuelLevel < 20 ? 'destructive' : 'default'}
            />
            <p className="text-sm text-gray-400">{flight.fuelLevel.toFixed(1)}%</p>
          </div>

          {/* Route Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" /> Flight Details
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-800/50 p-3 rounded-lg">
              <div>
                <p className="text-xs text-gray-400">Departure</p>
                <p className="font-medium">{flight.departureAirport}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Arrival</p>
                <p className="font-medium">{flight.arrivalAirport}</p>
              </div>
            </div>
          </div>

          {/* Emergency Details */}
          {emergency && (
            <div className="space-y-2 bg-red-900/20 p-4 rounded-lg border border-red-900/50">
              <h3 className="text-sm font-medium flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                Emergency Alert
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Type</p>
                  <p className="font-medium text-red-400">{emergency.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Severity</p>
                  <p className="font-medium text-red-400">{emergency.severity}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlightDetailsDialog;