import { useState, useEffect, useCallback } from 'react';

interface RouteInfo {
  coordinates: [number, number][];
  distance: number; // in meters
  duration: number; // in seconds
}

interface UseRoutingOptions {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  enabled?: boolean;
}

export function useRouting({ origin, destination, enabled = true }: UseRoutingOptions) {
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoute = useCallback(async () => {
    if (!origin || !destination || !enabled) {
      setRoute(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Using OSRM (Open Source Routing Machine) - free routing API
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch route');
      }

      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes?.[0]) {
        throw new Error('No route found');
      }

      const routeData = data.routes[0];
      
      setRoute({
        coordinates: routeData.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        ),
        distance: routeData.distance,
        duration: routeData.duration,
      });
    } catch (err) {
      console.error('Routing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate route');
      setRoute(null);
    } finally {
      setLoading(false);
    }
  }, [origin, destination, enabled]);

  // Fetch route when positions change
  useEffect(() => {
    const timeoutId = setTimeout(fetchRoute, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [fetchRoute]);

  // Re-fetch route every 30 seconds when tracking
  useEffect(() => {
    if (!enabled || !origin || !destination) return;

    const intervalId = setInterval(fetchRoute, 30000);
    return () => clearInterval(intervalId);
  }, [enabled, origin, destination, fetchRoute]);

  return {
    route,
    loading,
    error,
    refetch: fetchRoute,
    // Computed values
    distanceKm: route ? (route.distance / 1000).toFixed(1) : null,
    durationMinutes: route ? Math.ceil(route.duration / 60) : null,
  };
}
