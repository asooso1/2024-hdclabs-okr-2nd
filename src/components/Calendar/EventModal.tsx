import React, { useState, useEffect } from "react";
import { Event } from "./types";

interface EventModalProps {
  event: Event | null;
  date: Date | null;
  onClose: () => void;
  onAdd?: (event: Event) => void;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  date,
  onClose,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || "",
        startTime: event.startTime.toISOString().split("T")[0],
        endTime: event.endTime.toISOString().split("T")[0],
      });
    } else if (date) {
      setFormData({
        ...formData,
        startTime: date.toISOString().split("T")[0],
        endTime: date.toISOString().split("T")[0],
      });
    }
  }, [event, date]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) return;

    const eventData: Event = {
      id: event?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
    };

    if (event?.id) {
      onEdit?.(eventData);
    } else {
      onAdd?.(eventData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-xl bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">
          {event?.id ? "일정 수정" : "새 일정 등록"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block">제목</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full rounded border p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full rounded border p-2"
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block">시작 날짜</label>
            <input
              type="date"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              className="w-full rounded border p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block">종료 날짜</label>
            <input
              type="date"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              className="w-full rounded border p-2"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            {event?.id && (
              <button
                type="button"
                onClick={() => {
                  if (event.id && onDelete) {
                    onDelete(event.id);
                    onClose();
                  }
                }}
                className="rounded bg-red-500 px-4 py-2 text-white"
              >
                삭제
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray-200 px-4 py-2"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 text-white"
            >
              {event?.id ? "수정" : "등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
