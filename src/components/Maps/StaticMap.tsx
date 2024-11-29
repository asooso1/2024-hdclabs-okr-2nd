"use client";

import { Map, MapMarker } from 'react-kakao-maps-sdk';

interface StaticMapProps {
  lat: number;
  lng: number;
  width?: string;
  height?: string;
}

const StaticMap = ({ lat, lng, width = '100%', height = '400px' }: StaticMapProps) => {
  return (
    <Map
      center={{ lat, lng }}
      style={{ width, height }}
      level={3}
    >
      <MapMarker position={{ lat, lng }} />
    </Map>
  );
};

export default StaticMap; 