import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ConsultantAbout({ bio }: { bio: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent>
        {bio ? (
          <p className="text-muted-foreground leading-relaxed">{bio}</p>
        ) : (
          <p className="text-muted-foreground italic">No bio provided yet.</p>
        )}
      </CardContent>
    </Card>
  );
}