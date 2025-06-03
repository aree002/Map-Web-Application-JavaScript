import React, { useState, useRef } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader
} from "@react-google-maps/api";
import { MarkerClusterer } from "@react-google-maps/api";
import Select from "react-select";
import hospitalData from "./output.json"; // ["Address", "12.9716", "77.5946"]

const containerStyle = {
  width: "100vw",
  height: "90vh"
};

const center = {
  lat: 12.9716,
  lng: 77.5946
};

export default function MapWithJsonMarkers() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDHrBV8JwVXJc6KvioigRWCdxQ3iW1im74"
  });

  const [activeMarker, setActiveMarker] = useState(null);
  const mapRef = useRef(null);

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  const handleHospitalSelect = (selectedOption) => {
    const { lat, lng, index } = selectedOption.value;

    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);
      setActiveMarker(index);
    }
  };

  // Dropdown options
  const hospitalOptions = hospitalData.map(([address, latStr, lngStr], idx) => ({
    label: address,
    value: {
      lat: parseFloat(latStr),
      lng: parseFloat(lngStr),
      index: idx
    }
  }));

  if (!isLoaded) return <div>Loading Google Maps...</div>;

  const createMarkers = (clusterer) =>
    hospitalData.map(([address, latStr, lngStr], idx) => {
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (isNaN(lat) || isNaN(lng)) return null;

      return (
        <Marker
          key={idx}
          position={{ lat, lng }}
          clusterer={clusterer}
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new window.google.maps.Size(18, 18),
            anchor: new window.google.maps.Point(25, 25)
          }}
          onClick={() => setActiveMarker(idx)}
        >
          {activeMarker === idx && (
            <InfoWindow onCloseClick={() => setActiveMarker(null)}>
              <div style={{ color: "red", fontSize: "12px", maxWidth: "250px" }}>
                {address}
              </div>
            </InfoWindow>
          )}
        </Marker>
      );
    });

  return (
    <div>
      <div style={{ padding: "10px", width: "300px", zIndex: 1000, position: "absolute" }}>
        <Select
          options={hospitalOptions}
          onChange={handleHospitalSelect}
          placeholder="Search for a hospital..."
          isClearable
        />
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={handleMapLoad}
      >
        <MarkerClusterer>{(clusterer) => createMarkers(clusterer)}</MarkerClusterer>
      </GoogleMap>
    </div>
  );
}
