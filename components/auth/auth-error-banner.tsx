import { Card, CardContent } from "@/components/ui/card";

export function AuthErrorBanner({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <Card className="mx-auto mb-4 w-full max-w-md border-red-200 bg-red-50/90">
      <CardContent className="p-4 text-sm text-red-800">{message}</CardContent>
    </Card>
  );
}
