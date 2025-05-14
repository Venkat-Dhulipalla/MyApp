# SmartRoute - Intelligent Route Optimization Platform

SmartRoute is a modern web application built with Next.js that helps businesses optimize their delivery and field service routes. It uses Google Maps API for location services and provides intelligent route planning with multiple features.

## 🌟 Features

### 1. Multi-Pickup & Drop-off Planning

- Plan routes with multiple pickup and drop-off points
- Set priorities for each stop
- Optimize routes automatically
- Support for passenger names and locations

### 2. Waypoint Routing

- Create routes with specific waypoints
- Set priorities for waypoints
- Optimize routes based on priorities
- Real-time route updates

### 3. Location Services

- Google Maps integration for address autocomplete
- Current location detection
- Support for Google Maps URLs
- Address validation and formatting

### 4. Authentication & Security

- Secure authentication using Clerk
- Protected routes
- User session management
- Role-based access control

## 🔬 Technical Implementation

### Core Algorithm: Route Optimization

The heart of SmartRoute is its route optimization algorithm, which uses a combination of techniques to solve the complex routing problem:

#### 1. Priority-Based Optimization

```typescript
interface Location {
  address: string;
  priority: number; // Higher number = higher priority
  type: "start" | "pickup" | "dropoff" | "waypoint";
  passengerName?: string;
}
```

The algorithm uses a priority scoring system where:

- Each stop is assigned a priority value (1-5)
- Higher priority stops are optimized first
- The system maintains a balance between priority and overall route efficiency

#### 2. Multi-Stop Optimization Algorithm

The route optimization uses a modified version of the Traveling Salesman Problem (TSP) with constraints:

```typescript
function optimizeRoute(locations: Location[]): Route {
  // 1. Group locations by priority
  const priorityGroups = groupByPriority(locations);

  // 2. For each priority level
  for (const priority of priorityGroups) {
    // 3. Calculate optimal sub-routes
    const subRoutes = calculateOptimalSubRoute(priority);

    // 4. Merge with existing route
    mergeWithMainRoute(subRoutes);
  }

  // 5. Apply final optimizations
  return applyFinalOptimizations();
}
```

Key aspects of the algorithm:

- **Priority Grouping**: Stops are grouped by priority level
- **Sub-route Optimization**: Each priority group is optimized independently
- **Route Merging**: Sub-routes are merged while maintaining priority order
- **Final Optimization**: Local optimizations are applied to improve efficiency

#### 3. Distance Matrix Calculation

The system uses Google Maps Distance Matrix API to calculate:

- Real-time travel distances
- Estimated travel times
- Traffic conditions
- Route alternatives

```typescript
interface DistanceMatrix {
  origins: string[];
  destinations: string[];
  mode: "driving" | "walking" | "bicycling";
  trafficModel: "best_guess" | "pessimistic" | "optimistic";
}
```

#### 4. Dynamic Route Updates

The system implements real-time route updates using:

- WebSocket connections for live updates
- Traffic pattern analysis
- Dynamic re-routing based on:
  - Traffic conditions
  - New priority changes
  - Additional stops

### Performance Optimizations

1. **Caching Strategy**:

   - Route calculations are cached
   - Distance matrices are stored temporarily
   - Frequently used routes are pre-computed

2. **Batch Processing**:

   - Multiple stops are processed in batches
   - Parallel API calls for distance calculations
   - Efficient memory usage for large datasets

3. **Incremental Updates**:
   - Only affected portions of routes are recalculated
   - Partial optimizations for small changes
   - Progressive loading of route data

### Error Handling and Edge Cases

```typescript
interface OptimizationError {
  type: "INVALID_LOCATION" | "API_ERROR" | "OPTIMIZATION_FAILED";
  message: string;
  recoveryStrategy: "RETRY" | "FALLBACK" | "MANUAL";
}
```

The system handles various edge cases:

- Invalid addresses
- API failures
- Timeout scenarios
- Rate limiting
- Network issues

### Scalability Considerations

1. **Horizontal Scaling**:

   - Route calculations are distributed across workers
   - API requests are load balanced
   - Database sharding for large datasets

2. **Vertical Scaling**:

   - Memory optimization for large routes
   - Efficient data structures
   - Caching strategies

3. **Performance Metrics**:
   - Route calculation time
   - API response times
   - Memory usage
   - CPU utilization

### Future Improvements

1. **Machine Learning Integration**:

   - Traffic pattern prediction
   - Route preference learning
   - Dynamic priority adjustment

2. **Advanced Optimization**:

   - Multi-vehicle routing
   - Time window constraints
   - Fuel efficiency optimization

3. **Real-time Features**:
   - Live traffic integration
   - Weather-based routing
   - Dynamic ETA updates

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**:
  - Radix UI for accessible components
  - Custom shadcn/ui components
- **Authentication**: Clerk
- **Maps & Location**: Google Maps API
- **State Management**: React Hooks
- **Form Handling**: React controlled components
- **API Integration**: Next.js API routes

## 📦 Project Structure

```
MyApp/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # App-specific components
│   ├── home/             # Dashboard pages
│   ├── planner/          # Route planning pages
│   ├── results/          # Results display pages
│   └── types.ts          # TypeScript types
├── components/            # Shared components
│   ├── ui/               # UI components
│   └── AddressInput.tsx  # Address input component
├── lib/                   # Utility functions
│   ├── maps-config.ts    # Google Maps configuration
│   └── maps-utils.ts     # Maps utility functions
├── public/               # Static assets
└── styles/              # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Maps API key
- Clerk account and API keys

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd MyApp
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

4. Start the development server:

```bash
npm run dev
```

### Google Maps API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API key)
5. Add the API key to your `.env.local` file

### Clerk Authentication Setup

1. Create an account at [Clerk](https://clerk.dev/)
2. Create a new application
3. Get your API keys
4. Add the keys to your `.env.local` file

## 💻 Usage

### Multi-Pickup Planning

1. Navigate to the Multi-Pickup Planner
2. Enter your current location or use the location detection
3. Add passengers with their pickup and drop-off locations
4. Set priorities for each stop
5. Click "Optimize Route" to generate the optimal route

### Waypoint Routing

1. Navigate to the Waypoint Route Planner
2. Enter start and end points
3. Add waypoints with their priorities
4. Click "Optimize Route" to generate the optimal route

## 🔒 Security

- All API routes are protected
- Authentication is required for protected routes
- Google Maps API key is restricted to specific domains
- Environment variables are properly secured

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 📝 API Documentation

### Route Optimization API

**Endpoint**: `/api/optimize-route`

**Method**: POST

**Request Body**:

```typescript
{
  mode: "multi" | "waypoint",
  locations: Array<{
    address: string;
    priority: number;
    type: "start" | "pickup" | "dropoff" | "waypoint";
    passengerName?: string;
  }>;
}
```

**Response**:

```typescript
{
  route: Array<{
    address: string;
    type: string;
    passengerName?: string;
    order: number;
  }>;
  totalDistance: number;
  totalDuration: number;
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.dev/)
- [Google Maps Platform](https://developers.google.com/maps)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
