"use client";

import React, { useEffect } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

interface KakaoMapProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLocation?: {
    lat: number;
    lng: number;
  };
}

const KakaoMap = ({ onLocationSelect, initialLocation }: KakaoMapProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.KAKAO_JAVASCRIPT_KEY}&libraries=services&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById('map');
        if (!container) return;

        const options = {
          center: new window.kakao.maps.LatLng(
            initialLocation?.lat || 37.5665, 
            initialLocation?.lng || 126.9780
          ),
          level: 3
        };

        const map = new window.kakao.maps.Map(container, options);
        const marker = new window.kakao.maps.Marker({
          position: map.getCenter()
        });
        marker.setMap(map);

        if (initialLocation) {
          marker.setPosition(new window.kakao.maps.LatLng(
            initialLocation.lat,
            initialLocation.lng
          ));
        }

        // ... 기존 이벤트 핸들러 유지
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [initialLocation, onLocationSelect]);

  return (
    <div id="map" style={{ width: '100%', height: '100%' }}></div>
  );
};

export default KakaoMap; 