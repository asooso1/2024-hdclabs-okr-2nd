"use client";
import { useEffect, useState, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { projectApi } from "@/lib/api/projects";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from "@/components/common/Loader";
import StaticMap from "@/components/Maps/StaticMap";

interface Project {
  createdAt: string;
  updatedAt: string;
  id: string;
  name: string;
  description: string;
  workType: string;
  address: string;
  latitude: number;
  longitude: number;
  from: string;
  to: string;
  projectStatuses?: {
    userId: string;
    userName: string | null;
    schedule: string;
    before: string | null;
    after: string | null;
    confirmation: string | null;
  }[];
}

const AttendancePage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentStatus, setCurrentStatus] = useState<{
    before: string | null;
    after: string | null;
  }>({ before: null, after: null });
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({ latitude: null, longitude: null });
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectApi.getWorkerProjects(localStorage.getItem('userId') || '');
        
        const filteredProjects = (response?.projects || []).filter(project => 
          project.projectStatuses?.some(status => status.userId === localStorage.getItem('userId'))
        );
        setProjects(filteredProjects);
                
        if (filteredProjects && filteredProjects.length > 0) {
          setSelectedProject(filteredProjects[0]);
          const projectId = new URLSearchParams(window.location.search).get('projectId');
          if (projectId) {
            const foundProjectIndex = filteredProjects.findIndex(project => project.id === projectId);
            if (foundProjectIndex !== -1) {
              setSelectedProject(filteredProjects[foundProjectIndex]);
            }
          }
        }
      } catch (error) {
        console.error("프로젝트 데이터 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      const userStatus = selectedProject.projectStatuses?.find(
        status => status.userId === "현재_사용자_ID"
      );
      if (userStatus) {
        setCurrentStatus({
          before: userStatus.before,
          after: userStatus.after
        });
      }
    }
  }, [selectedProject]);

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('위치 정보가 지원되지 않습니다.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject);
      console.log(navigator.geolocation);
    });
  };

  const handleImageCapture = async (file: File, type: 'checkIn' | 'checkOut') => {
    try {
      const location = await getCurrentLocation();
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      const formData = new FormData();
      formData.append('image', file);
      formData.append('latitude', location.coords.latitude.toString());
      formData.append('longitude', location.coords.longitude.toString());
      formData.append('timestamp', new Date().toISOString());

      if (type === 'checkIn') {
        setCurrentStatus(prev => ({ ...prev, before: new Date().toISOString() }));
        console.log("입력받은 데이터:", {
          file,
          type,
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          },
          timestamp: new Date().toISOString()
        });
        toast.success('정상적으로 출근 처리되었습니다.');
      } else {
        setCurrentStatus(prev => ({ ...prev, after: new Date().toISOString() }));
        toast.success('정상적으로 퇴근 처리되었습니다.');
      }
    } catch (error) {
      console.error('출퇴근 처리 중 오류 발생:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      alert(`위치 정보 오류: ${errorMessage}`);
      toast.error('처리 중 오류가 발생했습니다.');
    }
  };

  const handleCheckIn = async () => {
    if (cameraRef.current) {
      cameraRef.current.click();
    }
  };

  const handleCheckOut = async () => {
    if (cameraRef.current) {
      cameraRef.current.click();
    }
  };

  const handleConfirmation = async () => {
    toast.success('작업확인서가 정상적으로 등록되었습니다.', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <DefaultLayout>
      <ToastContainer />
      <Breadcrumb pageName="출퇴근 관리" />
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 bg-white dark:bg-boxdark rounded-xl shadow-default p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              프로젝트 선택
            </h4>
            {selectedProject && (
              <button
                onClick={() => setSelectedProject(null)}
                className="text-sm text-gray-500 hover:text-primary"
              >
                다른 프로젝트 선택
              </button>
            )}
          </div>
          <select
            className="w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
            value={selectedProject?.id || ""}
            onChange={(e) => {
              const project = projects.find((p) => p.id === e.target.value);
              setSelectedProject(project || null);
            }}
          >
            <option value="">프로젝트를 선택해주세요</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {selectedProject && (
          <div className="mb-8">
            <div className="bg-white dark:bg-boxdark rounded-xl shadow-default overflow-hidden mb-6">
              <div className="relative h-40 bg-gradient-to-r from-primary/90 to-primary">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                <div className="absolute bottom-6 left-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 text-sm font-medium bg-white text-primary rounded-full">
                      {selectedProject.workType}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {selectedProject.name}
                  </h1>
                  <div className="flex items-center text-white/90">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm">{selectedProject.address}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                        작업 기간
                      </h3>
                      <div className="flex items-center text-black dark:text-white">
                        <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="font-medium">
                          {new Date(selectedProject.from).toLocaleDateString()} ~ {new Date(selectedProject.to).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                        출퇴근 상태
                      </h3>
                      <div className="flex gap-4">
                        <div className="flex-1 p-4 rounded-lg bg-gray-50 dark:bg-meta-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">출근 시간</p>
                          <p className="font-medium text-black dark:text-white">
                            {currentStatus.before ? new Date(currentStatus.before).toLocaleTimeString() : '-'}
                          </p>
                        </div>
                        <div className="flex-1 p-4 rounded-lg bg-gray-50 dark:bg-meta-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">퇴근 시</p>
                          <p className="font-medium text-black dark:text-white">
                            {currentStatus.after ? new Date(currentStatus.after).toLocaleTimeString() : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      ref={cameraRef}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageCapture(file, currentStatus.before ? 'checkOut' : 'checkIn');
                        }
                      }}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={handleCheckIn}
                        disabled={currentStatus.before !== null}
                        className={`flex items-center justify-center gap-2 rounded-lg px-6 py-4 text-center font-medium transition-all ${
                          currentStatus.before === null
                            ? 'bg-primary text-white hover:bg-opacity-90'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-meta-4'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        출근하기
                      </button>
                      <button
                        onClick={handleCheckOut}
                        disabled={currentStatus.before === null || currentStatus.after !== null}
                        className={`flex items-center justify-center gap-2 rounded-lg px-6 py-4 text-center font-medium transition-all ${
                          currentStatus.before && !currentStatus.after
                            ? 'bg-meta-3 text-white hover:bg-opacity-90'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-meta-4'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        퇴근하기
                      </button>
                    </div>
                    <button
                      onClick={handleConfirmation}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-4 text-center font-medium text-white hover:bg-opacity-90 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      작업확인서 등록
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-boxdark rounded-xl shadow-default overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                  작업 위치
                </h3>
                <div className="h-[300px] w-full rounded-lg overflow-hidden">
                  <StaticMap
                    lat={selectedProject.latitude}
                    lng={selectedProject.longitude}
                  />
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{selectedProject.address}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedProject && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              프로젝트가 선택되지 않았습니다
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              위에서 프로젝트를 선택해주세요
            </p>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default AttendancePage;
