import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AuthForm({
  title,
  description,
  submitLabel,
  action,
  fields,
  footer,
  secondaryAction
}: {
  title: string;
  description: string;
  submitLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  fields: Array<{ name: string; label: string; type?: string; placeholder?: string }>;
  footer: React.ReactNode;
  secondaryAction?: {
    label: string;
    action: (formData: FormData) => void | Promise<void>;
  };
}) {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-3">
        <CardTitle className="text-3xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {fields.map((field) => (
            <label key={field.name} className="block space-y-2 text-sm">
              <span className="font-medium">{field.label}</span>
              <Input name={field.name} type={field.type ?? "text"} placeholder={field.placeholder} required />
            </label>
          ))}
          <Button className="w-full" type="submit">
            {submitLabel}
          </Button>
        </form>
        {secondaryAction ? (
          <form action={secondaryAction.action} className="mt-3">
            <Button className="w-full" variant="outline" type="submit">
              {secondaryAction.label}
            </Button>
          </form>
        ) : null}
        <div className="mt-4 text-sm text-[var(--muted-foreground)]">{footer}</div>
      </CardContent>
    </Card>
  );
}

export function AuthFooterLink({ prompt, href, label }: { prompt: string; href: string; label: string }) {
  return (
    <p>
      {prompt}{" "}
      <Link href={href} className="font-medium text-[var(--primary)]">
        {label}
      </Link>
    </p>
  );
}
