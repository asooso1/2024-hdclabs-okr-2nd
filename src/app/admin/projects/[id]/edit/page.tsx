import { Suspense } from "react";
import EditProject from "@/screens/EditProject";

const EditProjectPage = () => {
  return (
    <Suspense fallback={<div></div>}>
      <EditProject />
    </Suspense>
  );
};

export default EditProjectPage; 