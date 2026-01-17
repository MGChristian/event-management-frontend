import { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  FileInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { Upload } from "lucide-react";
import dayjs from "dayjs";
import { AxiosError } from "axios";
import EventService from "../services/eventService";
import { privateAxios } from "../api/axios";
import type { event, createEventDTO, updateEventDTO } from "../types/eventType";

type EventFormModalProps = {
  opened: boolean;
  onClose: () => void;
  event?: event | null;
  onSuccess: () => void;
};

type FormValues = {
  name: string;
  dateStart: Date | null;
  dateEnd: Date | null;
  location: string;
  description: string;
  capacity: number;
  imageBase64: string;
};

function EventFormModal({
  opened,
  onClose,
  event,
  onSuccess,
}: EventFormModalProps) {
  const eventService = new EventService(privateAxios);
  const isEditing = !!event;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      dateStart: null,
      dateEnd: null,
      location: "",
      description: "",
      capacity: 100,
      imageBase64: "",
    },
    validate: {
      name: (value) =>
        value.length < 3 ? "Event name must be at least 3 characters" : null,
      dateStart: (value) => {
        if (!value) return "Start date is required";
        if (!isEditing && dayjs(value).isBefore(dayjs()))
          return "Start date must be in the future";
        return null;
      },
      dateEnd: (value, values) => {
        if (!value) return "End date is required";
        if (
          values.dateStart &&
          dayjs(value).isBefore(dayjs(values.dateStart))
        ) {
          return "End date must be after start date";
        }
        return null;
      },
      location: (value) => (value.length < 2 ? "Location is required" : null),
      capacity: (value) => (value < 1 ? "Capacity must be at least 1" : null),
    },
  });

  // Reset form when modal opens or event changes
  useEffect(() => {
    if (opened) {
      if (event) {
        form.setValues({
          name: event.name,
          dateStart: new Date(event.dateStart),
          dateEnd: new Date(event.dateEnd),
          location: event.location,
          description: event.description || "",
          capacity: event.capacity,
          imageBase64: event.imageBase64 || "",
        });
        setImagePreview(event.imageBase64 || null);
      } else {
        form.reset();
        setImagePreview(null);
      }
      setError(null);
    }
  }, [opened, event]);

  async function handleFileChange(file: File | null) {
    if (!file) {
      setImagePreview(null);
      form.setFieldValue("imageBase64", "");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      form.setFieldValue("imageBase64", base64String);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(values: FormValues) {
    setLoading(true);
    setError(null);

    try {
      if (isEditing && event) {
        // Build update DTO with only changed fields
        const updateData: updateEventDTO = {};

        if (values.name !== event.name) updateData.name = values.name;
        if (
          values.dateStart &&
          dayjs(values.dateStart).toISOString() !==
            dayjs(event.dateStart).toISOString()
        ) {
          updateData.dateStart = dayjs(values.dateStart).toDate();
        }
        if (
          values.dateEnd &&
          dayjs(values.dateEnd).toISOString() !==
            dayjs(event.dateEnd).toISOString()
        ) {
          updateData.dateEnd = dayjs(values.dateEnd).toDate();
        }
        if (values.location !== event.location)
          updateData.location = values.location;
        if (values.description !== (event.description || ""))
          updateData.description = values.description || undefined;
        if (values.capacity !== event.capacity)
          updateData.capacity = values.capacity;
        if (values.imageBase64 !== (event.imageBase64 || ""))
          updateData.imageBase64 = values.imageBase64 || undefined;

        await eventService.updateEvent(event.id, updateData);
      } else {
        const createData: createEventDTO = {
          name: values.name,
          dateStart: dayjs(values.dateStart).toDate(),
          dateEnd: dayjs(values.dateEnd).toDate(),
          location: values.location,
          description: values.description || undefined,
          capacity: values.capacity,
          imageBase64: values.imageBase64 || undefined,
        };

        await eventService.createEvent(createData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.message ||
            `Failed to ${isEditing ? "update" : "create"} event`,
        );
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Edit Event" : "Create Event"}
      size="lg"
      centered
    >
      <form
        onSubmit={form.onSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <TextInput
          withAsterisk
          label="Event Name"
          placeholder="Enter event name"
          key={form.key("name")}
          {...form.getInputProps("name")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <DateTimePicker
            withAsterisk
            label="Start Date & Time"
            placeholder="Select start date"
            minDate={isEditing ? undefined : new Date()}
            key={form.key("dateStart")}
            {...form.getInputProps("dateStart")}
          />
          <DateTimePicker
            withAsterisk
            label="End Date & Time"
            placeholder="Select end date"
            minDate={form.getValues().dateStart || new Date()}
            key={form.key("dateEnd")}
            {...form.getInputProps("dateEnd")}
          />
        </div>

        <TextInput
          withAsterisk
          label="Location"
          placeholder="Enter event location"
          key={form.key("location")}
          {...form.getInputProps("location")}
        />

        <NumberInput
          withAsterisk
          label="Capacity"
          placeholder="Enter maximum capacity"
          min={1}
          key={form.key("capacity")}
          {...form.getInputProps("capacity")}
        />

        <Textarea
          label="Description"
          placeholder="Enter event description"
          minRows={3}
          key={form.key("description")}
          {...form.getInputProps("description")}
        />

        <div className="flex flex-col gap-2">
          <FileInput
            label="Event Image"
            placeholder="Upload event image"
            accept="image/*"
            leftSection={<Upload size={16} />}
            onChange={handleFileChange}
          />
          {imagePreview && (
            <div className="mt-2 overflow-hidden rounded-md">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-32 w-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-stone-300 px-4 py-2 text-stone-600 hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
                ? "Update Event"
                : "Create Event"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EventFormModal;
