"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { projectApi } from "@/lib/api/projects";
import { toast } from "react-toastify";
import Loader from "@/components/common/Loader";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import dynamic from "next/dynamic";
import Image from "next/image";
import Modal from "@/components/common/Modal";

const StaticMap = dynamic(() => import("@/components/Maps/StaticMap"), {
  ssr: false,
});

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
  projectStatuses?: ProjectStatus[];
}

interface ProjectStatus {
  userId: string;
  userName: string | null;
  schedule: string;
  before: {
    createdAt: string;
    updatedAt: string;
    imageUrls: string[];
    description: string;
    time: string;
  } | null;
  after: {
    createdAt: string;
    updatedAt: string;
    imageUrls: string[];
    description: string;
    time: string;
  } | null;
  confirmation: {
    createdAt: string;
    updatedAt: string;
    imageUrls: string[];
    description: string;
  } | null;
}

interface UserSummary {
  userId: string;
  userName: string;
  beforeCount: number;
  afterCount: number;
  confirmationCount: number;
}

const ProjectDetailPage = () => {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: format(new Date(), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userSummaries, setUserSummaries] = useState<UserSummary[]>([]);
  const [filteredStatuses, setFilteredStatuses] = useState<ProjectStatus[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageDescriptions, setSelectedImageDescriptions] = useState<string>('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        const response = await projectApi.getProject(localStorage.getItem('userId') || '', params.id as string);
        setProject(response as Project);
      } catch (error) {
        console.error("프로젝트 상세 정보 가져오기 실패:", error);
        toast.error("프로젝트 정보를 가져오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetail();
  }, [params.id]);

  useEffect(() => {
    if (!project?.projectStatuses) return;

    const filteredData = project.projectStatuses.filter(status => {
      const statusDate = new Date(status.schedule);
      return statusDate >= new Date(dateRange.from) && statusDate <= new Date(dateRange.to);
    });

    // 사용자별 통계 계산
    const summaries: UserSummary[] = [];
    const userMap = new Map<string, UserSummary>();

    filteredData.forEach(status => {
      if (!status.userId || !status.userName) return;

      if (!userMap.has(status.userId)) {
        userMap.set(status.userId, {
          userId: status.userId,
          userName: status.userName,
          beforeCount: 0,
          afterCount: 0,
          confirmationCount: 0,
        });
      }

      const summary = userMap.get(status.userId)!;
      if (status.before) summary.beforeCount++;
      if (status.after) summary.afterCount++;
      if (status.confirmation) summary.confirmationCount++;
    });

    setUserSummaries(Array.from(userMap.values()));

    // 선택된 사용자의 상세 현황 필터
    if (selectedUser) {
      setFilteredStatuses(
        filteredData.filter(status => status.userId === selectedUser)
      );
    }
  }, [project, dateRange, selectedUser]);

  if (loading) return <Loader />;
  if (!project) return <div>프로젝트를 찾을 수 없습니다.</div>;

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-white dark:bg-boxdark rounded-xl shadow-default overflow-hidden mb-6">
            <div className="relative h-40 bg-gradient-to-r from-primary/90 to-primary">
              <div className="absolute inset-0 bg-pattern opacity-10"></div>
              <div className="absolute bottom-6 left-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 text-sm font-medium bg-white text-primary rounded-full">
                    {project.workType}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {project.name}
                </h1>
                <div className="flex items-center text-white/90">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm">{project.address}</p>
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
                        {new Date(project.from).toLocaleDateString()} ~ {new Date(project.to).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                      작업 내용
                    </h3>
                    <p className="font-medium text-black dark:text-white">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="h-full min-h-[200px] rounded-lg overflow-hidden">
                  <StaticMap
                    lat={project.latitude}
                    lng={project.longitude}
                    height="300px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="bg-white dark:bg-boxdark rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">기간 선택</h2>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-auto relative">
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="w-full sm:w-[160px] h-11 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent 
                      focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-gray-900 dark:text-white
                      cursor-pointer"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <span className="text-gray-500">~</span>
                <div className="w-full sm:w-auto relative">
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full sm:w-[160px] h-11 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent 
                      focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-gray-900 dark:text-white
                      cursor-pointer"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-boxdark rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">총 작업자</h3>
                <span className="p-2 bg-primary/10 rounded-lg">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{userSummaries.length}</p>
            </div>

            <div className="bg-white dark:bg-boxdark rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">총 출근율</h3>
                <span className="p-2 bg-green-50 rounded-lg">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round((userSummaries.reduce((acc, cur) => acc + cur.beforeCount, 0) /
                  (userSummaries.length * filteredStatuses.length || 1)) * 100)}%
              </p>
            </div>

            <div className="bg-white dark:bg-boxdark rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">작업확인서 제출률</h3>
                <span className="p-2 bg-blue-50 rounded-lg">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round((userSummaries.reduce((acc, cur) => acc + cur.confirmationCount, 0) /
                  (userSummaries.length * filteredStatuses.length || 1)) * 100)}%
              </p>
            </div>
          </div>

          {/* 작업자별 통계 테이블 개선 */}
          <div className="bg-white dark:bg-boxdark rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">작업자별 통계</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {userSummaries.length}명의 작업자
              </span>
            </div>
            <div className="overflow-x-auto">
              {userSummaries.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">이름</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">출근</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">퇴근</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">작업확인서</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {userSummaries.map((summary) => (
                      <tr
                        key={summary.userId}
                        onClick={() => setSelectedUser(summary.userId)}
                        className={`cursor-pointer transition-all duration-200
                        ${selectedUser === summary.userId
                            ? 'bg-primary/5 hover:bg-primary/10'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                      >
                        <td className="pl-6 py-2">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                              {summary.userName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{summary.userName}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-2 ${summary.beforeCount > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm text-gray-900 dark:text-white">{summary.beforeCount}회</span>
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-2 ${summary.afterCount > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm text-gray-900 dark:text-white">{summary.afterCount}회</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-2 ${summary.confirmationCount > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm text-gray-900 dark:text-white">{summary.confirmationCount}회</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-16 h-16 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-lg font-medium">해당 기간에 작업 계획이 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          {selectedUser && (
            <div className="bg-white dark:bg-boxdark rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {userSummaries.find(s => s.userId === selectedUser)?.userName.charAt(0)}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {userSummaries.find(s => s.userId === selectedUser)?.userName} 작업 현황
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">날짜</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">출근</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">퇴근</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">작업확인서</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredStatuses.map((status, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {format(new Date(status.schedule), 'yyyy.MM.dd')}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(status.schedule), 'EEEE', { locale: ko })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {status.before ? (
                              <>
                                <div 
                                  className="flex items-center cursor-pointer hover:text-primary"
                                  onClick={() => {
                                    setSelectedImages(status.before!.imageUrls);
                                    setSelectedImageDescriptions(status.before!.description);
                                    setIsImageModalOpen(true);
                                  }}
                                >
                                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                  <span className="text-sm text-gray-900 dark:text-white">
                                    {new Date(status.before.updatedAt).toLocaleTimeString('ko-KR', {
                                      timeZone: 'Asia/Seoul',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="h-2 w-2 rounded-full bg-gray-300 mr-2"></div>
                                <span className="text-sm text-gray-500">미등록</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {status.after ? (
                              <>
                                <div 
                                  className="flex items-center cursor-pointer hover:text-primary"
                                  onClick={() => {
                                    setSelectedImages(status.after!.imageUrls);
                                    setSelectedImageDescriptions(status.after!.description);
                                    setIsImageModalOpen(true);
                                  }}
                                >
                                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                  <span className="text-sm text-gray-900 dark:text-white">
                                    {new Date(status.after.updatedAt).toLocaleTimeString('ko-KR', {
                                      timeZone: 'Asia/Seoul',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="h-2 w-2 rounded-full bg-gray-300 mr-2"></div>
                                <span className="text-sm text-gray-500">미등록</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {status.confirmation ? (
                              <div 
                                className="flex items-center cursor-pointer hover:text-primary"
                                onClick={() => {
                                  setSelectedImages(status.confirmation!.imageUrls);
                                  setSelectedImageDescriptions(status.confirmation!.description);
                                  setIsImageModalOpen(true);
                                }}
                              >
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-500">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  제출완료
                                </span>
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400">
                                미제출
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <Modal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          title="이미지 보기"
        >
          <div className="flex flex-col space-y-6 p-4">
            {selectedImages.map((url: string, index: number) => (
              <div key={index} className="flex flex-col">
                <div className="relative w-full h-96">
                  <Image
                    src={`https://hdcl-csp-stg.s3.ap-northeast-2.amazonaws.com/${url}`}
                    alt={`작업 이미지 ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    특이사항 ; {selectedImageDescriptions}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Modal>

      </div>
    </DefaultLayout>
  );
};

export default ProjectDetailPage;