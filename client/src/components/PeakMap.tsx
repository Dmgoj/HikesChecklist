import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Props {
  name: string;
  latitude: number;
  longitude: number;
}

export function PeakMap({ name, latitude, longitude }: Props) {
  return (
    <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden" }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={10}
        scrollWheelZoom={false}
        style={{ height: 456, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={defaultIcon}>
          <Popup>{name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
