"use client";
import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "@/components/Tables/TableOne";
import TableThree from "@/components/Tables/TableThree";
import TableTwo from "@/components/Tables/TableTwo";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { projectApi } from "@/lib/api/projects";
import Link from "next/link";
import { toast } from "react-toastify";
import { Project } from "@/lib/api/types";


const TablesPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectApi.getManagedProjects('6744379551dad806db3c9f23');
        setProjects(response || []);
      } catch (error) {
        console.error("사용자 데이터 가져오기 실패:", error);
        toast.error("데이터를 가져오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <DefaultLayout>
      <Breadcrumb pageName="프로젝트 목록" />
      
      <div className="mb-4">
        <Link href="/admin/projects/add">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            프로젝트 추가
          </button>
        </Link>
      </div>

      <div className="flex flex-col gap-10">
        <TableTwo projects={projects} loading={loading} />
        <TableOne />
        <TableThree />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
