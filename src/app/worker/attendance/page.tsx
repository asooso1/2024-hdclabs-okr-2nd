"use client";
import { useEffect, useState, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { projectApi } from "@/lib/api/projects";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from "@/components/common/Loader";

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
        const response = await projectApi.getManagedProjects("6729ba6389a50140667aefec");
        setProjects(response);
        if (response.length > 0) {
          setSelectedProject(response[0]);
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

      <div className="flex flex-col gap-10">
        <div className="rounded-lg border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              프로젝트 선택
            </h4>
            <select
              className="mt-4 w-full rounded-lg border border-stroke bg-transparent px-5 py-3 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
              value={selectedProject?.id || ""}
              onChange={(e) => {
                const project = projects.find((p) => p.id === e.target.value);
                setSelectedProject(project || null);
              }}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <div className="mb-6">
              <h4 className="mb-4 text-xl font-semibold text-black dark:text-white">
                프로젝트 정보
              </h4>
              <div className="rounded-lg border border-stroke bg-gray-2 p-4 dark:border-strokedark dark:bg-meta-4">
                <p className="mb-2">작업 위치: {selectedProject.address}</p>
                <p className="mb-2">작업 종류: {selectedProject.workType}</p>
                <p>작업 기간: {new Date(selectedProject.from).toLocaleDateString()} ~ {new Date(selectedProject.to).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
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
                className={`inline-flex items-center justify-center rounded-md px-10 py-4 text-center font-medium text-white ${
                  currentStatus.before === null
                    ? 'bg-primary hover:bg-opacity-90'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                출근하기
              </button>
              <button
                onClick={handleCheckOut}
                disabled={currentStatus.before === null || currentStatus.after !== null}
                className={`inline-flex items-center justify-center rounded-md px-10 py-4 text-center font-medium text-white ${
                  currentStatus.before && !currentStatus.after
                    ? 'bg-meta-3 hover:bg-opacity-90'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                퇴근하기
              </button>
            </div>
            <button
              onClick={handleConfirmation}
              className="inline-flex items-center justify-center rounded-md bg-black px-10 py-4 text-center font-medium text-white hover:bg-opacity-90"
            >
              작업확인서 등록
            </button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AttendancePage;
