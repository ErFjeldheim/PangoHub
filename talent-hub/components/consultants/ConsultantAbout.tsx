import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function ConsultantAbout({ bio }: { bio: string }) {
  return (
    <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-xl">About</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {bio ? (
          <p className="text-muted-foreground leading-relaxed text-pretty">
            {bio}
          </p>
        ) : (
          <p className="text-muted-foreground/60 italic text-sm">
            No bio provided yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
