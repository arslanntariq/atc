# Air Traffic Control System - Technical Documentation

## Project Overview
A real-time air traffic control system built with React, TypeScript, and modern web technologies, demonstrating OS concepts through practical implementation.

## Tech Stack
- React + TypeScript
- Vite for build tooling
- TanStack Query for state management
- Mapbox GL for 3D visualization
- Tailwind CSS + shadcn/ui for UI components

## Core Components

### Flight Management System
- `useFlightSimulation` hook: Manages flight states and implements priority scheduling
- Real-time position updates and fuel monitoring
- Emergency detection and handling
- Resource (runway) allocation

### Priority Scheduling Implementation
```typescript
// Priority calculation based on:
// - Fuel level (lower fuel = higher priority)
// - Distance to destination
// - Emergency status
const priorityScheduler = () => {
  flights.sort((a, b) => {
    if (a.status === 'emergency') return -1;
    if (b.status === 'emergency') return 1;
    return (b.priority + (100 - b.fuelLevel)) - (a.priority + (100 - a.fuelLevel));
  });
};
```

### Resource Management
- Runway allocation system
- Airport capacity tracking
- Conflict prevention

## Key Features
1. Real-time flight tracking
2. Emergency handling protocols
3. Priority-based scheduling
4. Resource allocation (runways)
5. Multi-airport management
6. Weather condition simulation (planned)

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start development server:
```bash
npm run dev
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Implement changes
4. Submit a pull request

## Future Enhancements
- Weather simulation system
- Multiple runway support
- Advanced collision detection
- Network latency simulation
- Enhanced emergency protocols