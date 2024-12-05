"use client";
import { useState } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

interface StaticMapProps {
  lat: number;
  lng: number;
  width?: string;
  height?: string;
}

const StaticMap = ({ lat, lng, width = '100%', height = '400px' }: StaticMapProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
      <Map
        center={{ lat, lng }}
        style={{ width, height }}
        level={3}
        onTileLoaded={() => setIsLoading(false)}
      >
        <MapMarker position={{ lat, lng }} />
      </Map>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-meta-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default StaticMap; 