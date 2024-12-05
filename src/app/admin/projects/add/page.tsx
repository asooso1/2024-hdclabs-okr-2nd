import { Suspense } from "react";
import AddProject from "@/screens/AddProject";
import Loader from "@/components/common/Loader";

const AddProjectPage = () => {
  return (
    <Suspense fallback={<Loader />}>
      <AddProject />
    </Suspense>
  );
};

export default AddProjectPage;
