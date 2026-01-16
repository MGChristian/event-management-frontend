import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { TextInput, Textarea, NumberInput, FileInput } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { ArrowLeft, Upload } from "lucide-react";
import dayjs from "dayjs";
import { AxiosError } from "axios";
import EventService from "../../services/eventService";
import { privateAxios } from "../../api/axios";
import PageHeader from "../../components/PageHeader";

function CreateEvent() {
  const navigate = useNavigate();
  const eventService = new EventService(privateAxios);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      dateStart: null as Date | null,
      dateEnd: null as Date | null,
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
        if (dayjs(value).isBefore(dayjs()))
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

  async function handleSubmit(values: typeof form.values) {
    setLoading(true);
    setError(null);

    try {
      await eventService.createEvent({
        name: values.name,
        dateStart: dayjs(values.dateStart).toDate(),
        dateEnd: dayjs(values.dateEnd).toDate(),
        location: values.location,
        description: values.description || undefined,
        capacity: values.capacity,
        imageBase64: values.imageBase64 || undefined,
      });
      navigate("/organizer");
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Failed to create event");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="mx-auto max-w-2xl px-6">
        <Link
          to="/organizer"
          className="mb-6 inline-flex items-center gap-2 text-stone-500 hover:text-stone-700"
        >
          <ArrowLeft size={16} />
          Back to My Events
        </Link>

        <PageHeader
          title="Create Event"
          subtitle="Fill in the details to create a new event"
        />

        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="mt-8 flex flex-col gap-5"
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
              minDate={new Date()}
              key={form.key("dateStart")}
              {...form.getInputProps("dateStart")}
            />
            <DateTimePicker
              withAsterisk
              label="End Date & Time"
              placeholder="Select end date"
              minDate={form.values.dateStart || new Date()}
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
            minRows={4}
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
                  className="h-48 w-full object-cover"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-md bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Event..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;
