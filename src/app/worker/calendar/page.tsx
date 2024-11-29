import { Suspense } from "react";
import WorkerCalendar from "@/screens/WorkerCalendar";

const WorkerCalendarPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkerCalendar />
    </Suspense>
  );
};

export default WorkerCalendarPage;

