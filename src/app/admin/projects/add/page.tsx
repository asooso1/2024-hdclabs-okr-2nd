import { Suspense } from "react";
import AddProject from "@/screens/AddProject";

const AddProjectPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddProject />
    </Suspense>
  );
};

export default AddProjectPage;
