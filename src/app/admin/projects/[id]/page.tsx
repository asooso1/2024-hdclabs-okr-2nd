import { Suspense } from "react";
import ProjectDetailPage from "@/screens/AdminProjectDetail";
import Loader from "@/components/common/Loader";

const AddProjectPage = () => {
  return (
    <Suspense fallback={<Loader />}>
      <ProjectDetailPage />
    </Suspense>
  );
};

export default AddProjectPage;
