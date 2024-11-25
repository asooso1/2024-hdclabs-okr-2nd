import Image from "next/image";
import { Product } from "@/types/product";
import { useState } from "react";

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

interface TableTwoProps {
  projects: Project[];
  loading: boolean;
}

const productData: Product[] = [
  {
    image: "/images/product/product-01.png",
    name: "Apple Watch Series 7",
    category: "Electronics",
    price: 296,
    sold: 22,
    profit: 45,
  },
  {
    image: "/images/product/product-02.png",
    name: "Macbook Pro M1",
    category: "Electronics",
    price: 546,
    sold: 12,
    profit: 125,
  },
  {
    image: "/images/product/product-03.png",
    name: "Dell Inspiron 15",
    category: "Electronics",
    price: 443,
    sold: 64,
    profit: 247,
  },
  {
    image: "/images/product/product-04.png",
    name: "HP Probook 450",
    category: "Electronics",
    price: 499,
    sold: 72,
    profit: 103,
  },
];

const TableTwo = ({ projects, loading }: TableTwoProps) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleRowClick = (projectId: string) => {
    setExpandedRow(expandedRow === projectId ? null : projectId);
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-lg border-stroke shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="px-4 py-6 md:px-6 xl:px-7.5">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            진행중인 프로젝트
          </h4>
        </div>
        <div className="px-4 py-6 md:px-6 2xl:px-7.5">
          로딩중...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg border-stroke shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          진행중인 프로젝트
        </h4>
      </div>

      <div className="grid grid-cols-9 overflow-auto border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-12 md:px-6 2xl:px-7.5">
        <div className="flex items-center col-span-2">
          <p className="font-medium">프로젝트명</p>
        </div>
        <div className="items-center col-span-1 sm:flex">
          <p className="font-medium">작업종류</p>
        </div>
        <div className="flex items-center col-span-1">
          <p className="font-medium">비고</p>
        </div>
        <div className="flex items-center col-span-1">
          <p className="font-medium">작업 위치</p>
        </div>
        <div className="flex items-center col-span-1">
          <p className="font-medium">작업 기간</p>
        </div>
        <div className="flex items-center col-span-1">
          <p className="font-medium">작업 참여자</p>
        </div>
        <div className="flex items-center col-span-1">
          <p className="font-medium">작업내용</p>
        </div>
        <div className="flex items-center col-span-1">
          <p className="font-medium">작업내용</p>
        </div>
      </div>

      {projects.map((project) => (
        <div key={project.id}>
          <div
            onClick={() => handleRowClick(project.id)}
            className="grid grid-cols-9 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-12 md:px-6 2xl:px-7.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-center"
          >
            <div className="flex items-center col-span-2">
              <p className="text-sm text-black dark:text-white">{project.name || '-'}</p>
            </div>
            <div className="items-center col-span-1 sm:flex">
              <p className="text-sm text-black dark:text-white">{project.workType || '-'}</p>
            </div>
            <div className="flex items-center col-span-1">
              <p className="text-sm text-black dark:text-white">{project.description || '-'}</p>
            </div>
            <div className="items-center col-span-1 sm:flex">
              <p className="text-sm text-black dark:text-white">{project.address || '-'}</p>
            </div>
            <div className="flex items-center col-span-1">
              <p className="text-sm text-black dark:text-white">{new Date(project.from).toLocaleDateString()} <br />~ {new Date(project.to).toLocaleDateString()}</p>
            </div>
            <div className="items-center col-span-1 sm:flex">
              <p className="text-sm text-black dark:text-white">{project.workType || '-'}</p>
            </div>
          </div>

          {expandedRow === project.id && (
            <div className="border-t border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-800">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="py-2 text-center">작업자</th>
                        <th className="py-2 text-center">작업 일정</th>
                        <th className="py-2 text-center">출근</th>
                        <th className="py-2 text-center">퇴근</th>
                        <th className="py-2 text-center">작업확인서</th>
                      </tr>
                    </thead>
                    {project.projectStatuses && project.projectStatuses.length > 0 ? (
                      <tbody>
                        {project.projectStatuses.map((status, index) => (
                          <tr key={index} className="border-t border-stroke dark:border-strokedark">
                            <td className="py-2 text-center">{status.userName || '-'}</td>
                            <td className="py-2 text-center">{status.schedule}</td>
                            <td className="py-2 text-center">{status.before !== null ? 'v' : '-'}</td>
                            <td className="py-2 text-center">{status.after !== null ? 'v' : '-'}</td>
                            <td className="py-2 text-center">{status.confirmation !== null ? 'v' : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    ) : (
                      <tbody>
                        <tr>
                          <td className="border-t border-stroke dark:border-strokedark text-gray-500 py-2 text-center">
                            등록된 작업자 정보가 없습니다.
                          </td>
                        </tr>
                      </tbody>
                    )}
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TableTwo;
