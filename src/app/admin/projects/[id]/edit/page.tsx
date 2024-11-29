import { Suspense } from "react";
import EditProject from "@/screens/EditProject";

const EditProjectPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditProject />
    </Suspense>
  );
};

export default EditProjectPage; 