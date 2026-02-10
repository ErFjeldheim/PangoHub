import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InfoCardProps {
  title: string;
  description: string;
  emptyState: React.ReactNode;
  children: React.ReactNode;
}

export function InfoCard({ title, description, emptyState, children }: InfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {children}
          {emptyState}
        </div>
      </CardContent>
    </Card>
  );
}