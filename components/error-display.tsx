import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ErrorDisplayProps {
  title: string;
  message: string;
}

export function ErrorDisplay({ title, message }: ErrorDisplayProps) {
  return (
    <Card className="max-w-sm mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
