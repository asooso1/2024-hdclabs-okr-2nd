export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  latitude?: number;
  longitude?: number;
  workType?: string;
  color?: string;
}

export interface CalendarProps {
  events: Event[];
  onDateClick?: (date: Date) => void;
  className?: string;
}

export interface DayProps {
  date: Date;
  events: Event[];
  isCurrentMonth: boolean;
  onClick?: (date: Date) => void;
}
