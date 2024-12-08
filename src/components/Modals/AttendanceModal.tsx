"use client";
import { useState, useEffect, useRef } from "react";
import { ProjectResult } from "@/lib/api/types";
import StaticMap from "@/components/Maps/StaticMap";
import imageCompression from 'browser-image-compression';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File, description: string) => Promise<void>;
  type: "checkIn" | "checkOut" | "confirmation";
  title: string;
}

export function AttendanceModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  title,
}: AttendanceModalProps) {
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 현재 위치 가져오기
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => console.error("위치 정보 오류:", error)
    );

    // 현재 시간 업데이트
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    // 출퇴근인 경우 모달이 열리면 자동으로 카메라 실행
    if (isOpen && (type === 'checkIn' || type === 'checkOut')) {
      inputRef.current?.click();
    }
  }, [isOpen, type]);

  useEffect(() => {
    setSelectedFile(null);
    setPreview(null);
    setDescription("");
  }, [type]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      await onSubmit(selectedFile, description);
      onClose();
    } catch (error) {
      console.error("제출 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    setIsCompressing(true);
    console.log('압축 전 이미지 크기:', (file.size / (1024 * 1024)).toFixed(2) + 'MB');

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'webp',
      initialQuality: 0.8
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log('압축 후 이미지 크기:', (compressedFile.size / (1024 * 1024)).toFixed(2) + 'MB');
      return compressedFile;
    } catch (error) {
      console.error('이미지 압축 중 오류:', error);
      return file;
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        console.log('원본 파일 타입:', file.type);
        const compressedFile = await compressImage(file);
        console.log('압축 후 파일 타입:', compressedFile.type);
        setSelectedFile(compressedFile);
        
        // 미리보기 생성
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('파일 처리 중 오류:', error);
      }
    }
  };

  // 카메라/파일 입력 설정
  const inputProps = {
    type: "file" as const,
    className: "hidden",
    accept: "image/*",
    capture: "environment" as const,
    onChange: handleFileChange,
    required: true
  };

  if (isFullscreen && preview) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex flex-col">
        <div className="p-4 flex justify-between items-center relative z-[61]">
          <button
            onClick={() => setIsFullscreen(false)}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div 
          className="flex-1 relative flex items-center justify-center cursor-pointer"
          onClick={() => setIsFullscreen(false)}
        >
          <img
            src={preview}
            alt="전체화면 보기"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-boxdark rounded-lg w-full max-w-md p-6 shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-black dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {currentTime.toLocaleTimeString()}
          </p>
        </div>

        {currentLocation && (
          <div className="mb-4 h-40 rounded-lg overflow-hidden">
            <StaticMap
              lat={currentLocation.lat}
              lng={currentLocation.lng}
              height="160px"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            {type === 'confirmation' ? (
              // 작업확인서 등록 UI
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  사진 촬영
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-meta-4 hover:bg-gray-100">
                    {preview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={preview}
                          alt="미리보기"
                          className="w-full h-full object-cover rounded-lg"
                          onClick={() => setIsFullscreen(true)}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-sm">클릭하여 전체화면으로 보기</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          카메라로 촬영하기
                        </p>
                      </div>
                    )}
                    <input {...inputProps} />
                  </label>
                </div>
              </div>
            ) : (
              // 출퇴근 UI
              <div>
                {preview ? (
                  <div 
                    className="relative w-full h-48 mb-4 cursor-pointer" 
                    onClick={() => setIsFullscreen(true)}
                  >
                    <img
                      src={preview}
                      alt="촬영된 사진"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm">클릭하여 전체화면으로 보기</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center mb-4">
                    {isCompressing ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-500">이미지 최적화 중...</p>
                      </div>
                    ) : (
                      <div className="animate-pulse text-gray-500">
                        카메라가 실행됩니다...
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  required
                />
              </div>
            )}
            {preview && (
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                  if (type !== 'confirmation') {
                    // 출근인 경우 다시 촬영 시 자동으로 카메라 실행
                    setTimeout(() => inputRef.current?.click(), 100);
                  }
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                다시 촬영하기
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              비고
            </label>
            <textarea
              className="w-full rounded-lg border border-stroke bg-transparent py-3 px-4 outline-none focus:border-primary dark:border-strokedark"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="특이사항이 있다면 입력해주세요"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                type === 'checkIn' ? 'bg-primary' : 
                type === 'checkOut' ? 'bg-meta-3' : 'bg-black'
              } hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? "처리중..." : "확인"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 