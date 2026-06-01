import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/Markdown";

type Props = {
  value: string;
  onChange: (next: string) => void;
  rows?: number;
};

export function MarkdownEditor({ value, onChange, rows = 18 }: Props) {
  return (
    <Tabs defaultValue="write">
      <TabsList>
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="write">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="font-mono text-sm"
          placeholder="Write some markdown…"
        />
      </TabsContent>
      <TabsContent value="preview">
        <div className="rounded-md border p-4 min-h-[400px]">
          {value ? <Markdown>{value}</Markdown> : (
            <p className="text-muted-foreground text-sm">Nothing to preview yet.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
