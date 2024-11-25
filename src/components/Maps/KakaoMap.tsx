"use client";

import React, { useEffect, useState } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

interface KakaoMapProps {
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  width?: string;
  height?: string;
  useCurrentLocation?: boolean;
  initialPosition?: {
    lat: number;
    lng: number;
  };
}

const KakaoMap: React.FC<KakaoMapProps> = ({
  onLocationSelect,
  width = '100%',
  height = '400px',
  useCurrentLocation = false,
  initialPosition
}) => {
  const [position, setPosition] = useState({
    lat: initialPosition?.lat || 37.566826,
    lng: initialPosition?.lng || 126.9786567,
  });
  const [keyword, setKeyword] = useState('');
  const [places, setPlaces] = useState<any[]>([]);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number>(0);
  const [currentLocationMarker, setCurrentLocationMarker] = useState<{
    position: { lat: number; lng: number };
    content: string;
  } | null>(null);

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);

      // 초기 좌표의 주소 정보 가져오기
      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.coord2Address(initialPosition.lng, initialPosition.lat, (result, status) => {
        if (status === kakao.maps.services.Status.OK && result[0]) {
          const addr = result[0].address.address_name;
          if (onLocationSelect) {
            onLocationSelect(initialPosition.lat, initialPosition.lng, addr);
          }
        }
      });
    } else if (useCurrentLocation && navigator.geolocation && !currentLocationMarker) {
      const getCurrentLocationOnce = () => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const newPosition = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            };
            setCurrentLocationMarker({
              position: newPosition,
              content: '현재 위치'
            });
  
            if (!initialPosition) {
              setPosition(newPosition);
            }
  
            const geocoder = new kakao.maps.services.Geocoder();
            geocoder.coord2Address(newPosition.lng, newPosition.lat, (result, status) => {
              if (status === kakao.maps.services.Status.OK && result[0]) {
                const addr = result[0].address.address_name;
                if (onLocationSelect) {
                  onLocationSelect(newPosition.lat, newPosition.lng, addr);
                }
              }
            });
          },
          (error) => {
            console.error('현재 위치를 가져오는데 실패했습니다:', error);
          },
          { maximumAge: 0, timeout: 5000 }
        );
      };

      getCurrentLocationOnce();
    }
  }, [initialPosition, useCurrentLocation, onLocationSelect, currentLocationMarker]);

  // 키워드 검색 함수
  const searchPlaces = () => {
    if (!keyword.trim()) {
      return;
    }

    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data, status) => {
      if (status === kakao.maps.services.Status.OK) {
        setPlaces(data);

        const newMarkers = data.map(place => ({
          position: {
            lat: Number(place.y),
            lng: Number(place.x)
          },
          content: place.place_name
        }));

        setMarkers(newMarkers);

        // 첫 번째 검색 결과로 위치 이동 및 정보 업데이트
        if (data[0]) {
          const firstResult = {
            lat: Number(data[0].y),
            lng: Number(data[0].x)
          };

          setPosition(firstResult); // 검색 결과의 0번 인덱스로 이동
          setSelectedMarkerId(0);

          // 주소 정보 가져오기
          const geocoder = new kakao.maps.services.Geocoder();
          geocoder.coord2Address(firstResult.lng, firstResult.lat, (result, status) => {
            if (status === kakao.maps.services.Status.OK && result[0]) {
              const addr = result[0].address.address_name;
              if (onLocationSelect) {
                onLocationSelect(firstResult.lat, firstResult.lng, addr);
              }
            }
          });
        }
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {

      } else if (status === kakao.maps.services.Status.ERROR) {

      }
    });
  };


  const handleMarkerClick = (lat: number, lng: number) => {
    setPosition({ lat, lng });

    // 선택된 위치에 해당하는 마커의 인덱스 찾기
    const markerIndex = markers.findIndex(
      marker => marker.position.lat === lat && marker.position.lng === lng
    );
    if (markerIndex !== -1) {
      setSelectedMarkerId(markerIndex);
    }

    // 주소 변환
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2Address(lng, lat, (result, status) => {
      if (status === kakao.maps.services.Status.OK && result[0]) {
        const addr = result[0].address.address_name;
        if (onLocationSelect) {
          onLocationSelect(lat, lng, addr);
        }
      }
    });
  };

  return (
    <div className="w-full">

      <Map
        center={position}
        style={{ width, height }}
        level={3}
        className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
      >
        {currentLocationMarker && (
          <MapMarker
            position={currentLocationMarker.position}
            image={{
              src: "https://t1.daumcdn.net/mapjsapi/images/marker.png",
              size: {
                width: 24,
                height: 32,
              },
            }}
          >
            <div className="p-2">{currentLocationMarker.content}</div>
          </MapMarker>
        )}
        {markers.map((marker, index) => (
          <MapMarker
            key={`marker-${index}`}
            position={marker.position}
            onClick={() => {
              handleMarkerClick(marker.position.lat, marker.position.lng);
              setSelectedMarkerId(index);
            }}
            image={{
              src: "https://t1.daumcdn.net/mapjsapi/images/marker.png",
              size: {
                width: selectedMarkerId === index ? 36 : 24,
                height: selectedMarkerId === index ? 48 : 32,
              },
            }}
          >
            {selectedMarkerId === index && (
              <div className="p-2">{marker.content}</div>
            )}
          </MapMarker>
        ))}
      </Map>
      <div className="my-3 flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchPlaces()}
          placeholder="주소/장소를 입력해주세요"
          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
        <button
          onClick={searchPlaces}
          className="rounded bg-primary px-8 py-2 text-white hover:bg-opacity-90 w-1/3"
        >
          검색
        </button>
      </div>

      {places.length > 0 && (
        <div className="mt-3 max-h-40 overflow-y-auto rounded border border-stroke p-3 dark:border-strokedark ">
          {places.map((place, index) => (
            <div
              key={index}
              onClick={() => {
                handleMarkerClick(Number(place.y), Number(place.x)); // 클릭한 결과로 이동
                setSelectedMarkerId(index);
              }}
              className="cursor-pointer border-b border-stroke p-2 hover:bg-gray-100 dark:border-strokedark dark:hover:bg-boxdark"
            >

              <h3 className="font-medium text-black dark:text-white">{place.place_name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {place.road_address_name} {place.road_address_name ? `| ${place.address_name}` : place.address_name}
              </p>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KakaoMap; 