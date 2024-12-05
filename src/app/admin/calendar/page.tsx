import { Suspense } from "react";
import AdminCalendar from "@/screens/AdminCalendar";

const CalendarPage = () => {
  return (
    <Suspense fallback={<div></div>}>
      <AdminCalendar />
    </Suspense>
  );
};

export default CalendarPage;
