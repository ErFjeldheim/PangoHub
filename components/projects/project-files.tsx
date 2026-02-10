import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Trash2, Upload } from "lucide-react";

interface ProjectFile {
  name: string;
  path: string;
  publicUrl: string;
}

interface ProjectFilesProps {
  projectId: string;
  files: ProjectFile[];
  isAdmin: boolean;
  uploadAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

export function ProjectFiles({
  projectId,
  files,
  isAdmin,
  uploadAction,
  deleteAction,
}: ProjectFilesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Project Files
        </CardTitle>
        <CardDescription>
          Documents and resources for this project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {files.length ? (
          <div className="space-y-2">
            {files.map((f) => (
              <div
                key={f.path}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <a
                  href={f.publicUrl}
                  className="flex items-center gap-2 flex-1 hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{f.name}</span>
                  <Download className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                </a>
                {isAdmin && (
                  <form action={deleteAction} className="ml-3">
                    <input type="hidden" name="project_id" value={projectId} />
                    <input type="hidden" name="path" value={f.path} />
                    <Button size="sm" variant="ghost" type="submit">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </form>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No files uploaded yet
          </p>
        )}

        {isAdmin && (
          <form
            action={uploadAction}
            className="flex items-end gap-3 pt-4 border-t"
          >
            <input type="hidden" name="project_id" value={projectId} />
            <div className="flex-1">
              <Label htmlFor="file">Upload File</Label>
              <Input id="file" type="file" name="file" className="mt-1.5" />
            </div>
            <Button type="submit">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
