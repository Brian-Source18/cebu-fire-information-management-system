'use client';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';

interface FireStation {
  id: number;
  name: string;
  address: string;
  contact_number: string;
  latitude?: number;
  longitude?: number;
  station_type: string;
}

interface EmergencyReport {
  id: number;
  title: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

const stationIcon = new L.DivIcon({
  html: '<div style="font-size:28px;line-height:1;">🚒</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: ''
});

const emergencyIcon = new L.DivIcon({
  html: '<div style="font-size:28px;line-height:1;">🔥</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
  className: ''
});

const userIcon = new L.DivIcon({
  html: '<div style="font-size:28px;line-height:1;">📍</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: ''
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function StationMap({ stations, emergencies = [] }: { stations: FireStation[], emergencies?: EmergencyReport[] }) {
  const [mounted, setMounted] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => { setMounted(true); }, []);
  const [selectedStation, setSelectedStation] = useState<FireStation | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  
  const cebuCenter: [number, number] = [10.3157, 123.8854];
  const validStations = stations.filter(s => s.latitude && s.longitude).map(s => ({ ...s, latitude: Number(s.latitude), longitude: Number(s.longitude) }));
  const validEmergencies = emergencies.filter(e => e.latitude && e.longitude).map(e => ({ ...e, latitude: Number(e.latitude), longitude: Number(e.longitude) }));

  // Stop tracking when component unmounts
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const getDirections = async (station: FireStation) => {
    if (navigator.geolocation) {
      setLoading(true);
      
      // Start watching position for live updates
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setSelectedStation(station);
          
          // Fetch route from OSRM
          try {
            const response = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${station.longitude},${station.latitude}?overview=full&geometries=geojson`
            );
            const data = await response.json();
            
            if (data.routes && data.routes[0]) {
              const coordinates = data.routes[0].geometry.coordinates.map(
                (coord: number[]) => [coord[1], coord[0]] as [number, number]
              );
              setRoute(coordinates);
            }
          } catch (error) {
            console.error('Route calculation error:', error);
          }
          setLoading(false);
        },
        (error) => {
          alert('Unable to get your location. Please enable location services.');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
      
      setWatchId(id);
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const clearRoute = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setRoute([]);
    setUserLocation(null);
    setSelectedStation(null);
  };

  const mapCenter = userLocation || cebuCenter;

  if (!mounted) return null;

  return (
    <div className="map-container">
      {route.length > 0 && (
        <div className="bg-red-600 text-white p-3 text-center font-bold flex items-center justify-center gap-4">
          <span>🧭 Live tracking to {selectedStation?.name}</span>
          <button onClick={clearRoute} className="bg-white text-red-600 px-4 py-1 rounded-full text-sm hover:bg-gray-100">
            Stop Tracking
          </button>
        </div>
      )}
      {loading && (
        <div className="bg-yellow-500 text-black p-2 text-center font-semibold">
          Calculating route...
        </div>
      )}
      <MapContainer center={mapCenter} zoom={12} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {userLocation && <MapUpdater center={userLocation} />}
        
        {validEmergencies.map((emergency) => (
          <Marker
            key={`emergency-${emergency.id}`}
            position={[Number(emergency.latitude), Number(emergency.longitude)]}
            icon={emergencyIcon}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-lg mb-1 text-red-600">🔥 ACTIVE EMERGENCY</h3>
                <h4 className="font-bold mb-1">{emergency.title}</h4>
                <p className="text-sm text-gray-600">📍 {emergency.location}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {validStations.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude!, station.longitude!]}
            icon={stationIcon}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-lg mb-2">{station.name}</h3>
                <p className="text-sm mb-2">{station.address}</p>
                <p className="text-sm mb-3">📞 {station.contact_number}</p>
                <button
                  onClick={() => getDirections(station)}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full text-sm disabled:opacity-50"
                >
                  🧭 Get Directions
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>📍 Your Location</Popup>
          </Marker>
        )}
        
        {route.length > 0 && (
          <>
            <Polyline positions={route} color="#fbbf24" weight={8} opacity={0.6} className="route-glow" />
            <Polyline positions={route} color="#ef4444" weight={5} opacity={1} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
