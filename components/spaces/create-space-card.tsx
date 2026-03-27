import { createSpaceAction } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateSpaceCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a cookbook space</CardTitle>
        <CardDescription>Set up a private home for a family branch, friend group, or shared food tradition.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createSpaceAction} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Space name</span>
            <Input name="name" placeholder="Holiday Table" required />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Description</span>
            <Textarea name="description" placeholder="Recipes, stories, and media for our December gatherings." />
          </label>
          <Button type="submit">Create space</Button>
        </form>
      </CardContent>
    </Card>
  );
}
