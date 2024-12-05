"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { projectApi } from "@/lib/api/projects";
import { toast } from "react-toastify";
import Loader from "@/components/common/Loader";
import StaticMap from "@/components/Maps/StaticMap";
import { format } from "date-fns";

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
  before: string | null;
  after: string | null;
  confirmation: string | null;
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
    from: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userSummaries, setUserSummaries] = useState<UserSummary[]>([]);
  const [filteredStatuses, setFilteredStatuses] = useState<ProjectStatus[]>([]);

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

    // 선택된 사용자의 상세 현황 필터링
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
        {/* 프로젝트 헤더 섹션 */}
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
                    height="100%"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 날짜 필터 */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">기간 선택</h2>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <span className="text-gray-500">~</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* 작업자별 통계 */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">작업자별 통계</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">이름</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">출근</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">퇴근</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">작업확인서</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {userSummaries.map((summary) => (
                  <tr
                    key={summary.userId}
                    onClick={() => setSelectedUser(summary.userId)}
                    className={`cursor-pointer transition-colors
                      ${selectedUser === summary.userId ? 'bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{summary.userName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{summary.beforeCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{summary.afterCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{summary.confirmationCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* 선택된 작업자 상세 현황 */}
          {selectedUser && (
            <div className="bg-white dark:bg-boxdark rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">작업자 상세 현황</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">날짜</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">출근</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">퇴근</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">작업확인서</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredStatuses.map((status, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {format(new Date(status.schedule), 'yyyy.MM.dd')}
                        </td>
                        <td className="px-6 py-4">
                          {status.before ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              완료
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              -
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {status.after ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              완료
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              -
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {status.confirmation ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              완료
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              -
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </DefaultLayout>
  );
};

export default ProjectDetailPage;