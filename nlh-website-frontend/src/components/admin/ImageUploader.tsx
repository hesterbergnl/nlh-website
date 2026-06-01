import { useRef, useState } from "react";
import { toast } from "sonner";
import { useUploadFile } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
};

export function ImageUploader({ value, onChange, label = "Image" }: Props) {
  const upload = useUploadFile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [manual, setManual] = useState("");

  async function handleFile(file: File) {
    try {
      const result = await upload.mutateAsync(file);
      onChange(result.url);
      toast.success("Uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      {value ? (
        <div className="flex items-start gap-3">
          <img src={value} alt="" className="h-24 w-24 object-cover rounded-md border" />
          <Button variant="outline" size="sm" onClick={() => onChange(null)}>
            Remove
          </Button>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={upload.isPending}
        >
          {upload.isPending ? "Uploading…" : "Upload file"}
        </Button>
        <Input
          placeholder="…or paste a URL"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          className="max-w-md"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            if (manual) {
              onChange(manual);
              setManual("");
            }
          }}
          disabled={!manual}
        >
          Use URL
        </Button>
      </div>
    </div>
  );
}
