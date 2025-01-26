import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Flight, Emergency } from '@/types';

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Flight Details - {flight.id}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Status</p>
            <p className={`inline-flex px-2 py-1 rounded text-sm ${
              flight.status === 'emergency' ? 'bg-destructive text-destructive-foreground' :
              flight.status === 'landing' ? 'bg-primary text-primary-foreground' :
              'bg-secondary text-secondary-foreground'
            }`}>
              {flight.status}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Altitude</p>
              <p className="text-2xl font-mono">{flight.altitude}ft</p>
            </div>
            <div>
              <p className="text-sm font-medium">Speed</p>
              <p className="text-2xl font-mono">{flight.speed}kts</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Location</p>
            <p className="font-mono">
              {flight.latitude.toFixed(4)}°, {flight.longitude.toFixed(4)}°
            </p>
          </div>

          {emergency && (
            <div className="space-y-2 bg-destructive/10 p-4 rounded-lg">
              <p className="text-sm font-medium text-destructive">Emergency Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm">Type</p>
                  <p className="font-medium">{emergency.type}</p>
                </div>
                <div>
                  <p className="text-sm">Severity</p>
                  <p className="font-medium">{emergency.severity}</p>
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