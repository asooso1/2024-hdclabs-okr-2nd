"use client";
import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import WorkerTable from "@/components/Tables/WorkerTable";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { projectApi } from "@/lib/api/projects";
import { Project } from "@/lib/api/types";

const TablesPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectApi.getWorkerProjects(localStorage.getItem('userId') || '');
        const filteredProjects = (response?.projects || []).filter(project =>
          project.projectStatuses?.some(status => status.userId === localStorage.getItem('userId'))
        );
        setProjects(filteredProjects);

      } catch (error) {
        console.error("사용자 데이터 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <DefaultLayout>
      <Breadcrumb pageName="프로젝트 목록" />

      <div className="flex flex-col gap-10">
        <WorkerTable projects={projects} loading={loading} />
        {/* <TableOne />
        <TableThree /> */}
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
