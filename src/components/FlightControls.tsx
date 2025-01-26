import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Flight, Emergency } from '@/types';

interface FlightControlsProps {
  onAddFlight: (flightData?: Omit<Flight, 'id'>) => void;
  onEmergency: (emergency?: Omit<Emergency, 'id' | 'timestamp'>) => void;
}

const FlightControls = ({ onAddFlight, onEmergency }: FlightControlsProps) => {
  const { toast } = useToast();

  const handleAddFlight = () => {
    onAddFlight();
    toast({
      title: "New Flight Added",
      description: "A new flight has been scheduled and added to the system.",
    });
  };

  const handleEmergency = () => {
    onEmergency();
    toast({
      title: "Emergency Triggered",
      description: "Emergency protocol has been initiated.",
      variant: "destructive",
    });
  };

  return (
    <Card className="glassmorphism p-4 space-y-4">
      <h2 className="text-xl font-bold text-primary">Flight Controls</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={handleAddFlight} className="w-full">
          Add Flight
        </Button>
        <Button onClick={handleEmergency} variant="destructive" className="w-full">
          Trigger Emergency
        </Button>
      </div>
    </Card>
  );
};

export default FlightControls;