import { importRecipeTextAction } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ImportPanel({
  spaces
}: {
  spaces: Array<{ space: { id: string; name: string } }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Import into a draft</CardTitle>
        <CardDescription>
          Paste a URL or messy text from a recipe card, caption, or notes app. When extraction is limited, we keep the
          source metadata and let the family clean it up together.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={importRecipeTextAction} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Source URL</span>
            <Input name="sourceUrl" placeholder="https://..." />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Cookbook space</span>
            <select name="spaceId" className="h-11 w-full rounded-2xl border bg-white/80 px-4 text-sm">
              <option value="">Private draft</option>
              {spaces.map(({ space }) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Raw recipe text</span>
            <Textarea
              name="body"
              placeholder="Paste ingredients, social-media caption text, OCR output, or rough family notes here."
              required
            />
          </label>
          <Button type="submit">Create import draft</Button>
        </form>
      </CardContent>
    </Card>
  );
}
