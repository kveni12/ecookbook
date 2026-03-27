"use client";

import { Mic, PauseCircle, Upload, Video } from "lucide-react";
import { useRef, useState } from "react";
import type { ReactNode } from "react";

import { importRecipeSourceAction, saveRecipeAction } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SpaceOption = { space: { id: string; name: string } };
type UploadKind = "voice" | "video" | "photo";
type SourceTypeValue = "MANUAL" | "SOCIAL" | "WEBSITE" | "IMPORTED_VIDEO" | "FAMILY_ORAL_HISTORY";

const mediaTypes = {
  audio: "AUDIO",
  video: "VIDEO",
  image: "IMAGE"
} as const;

const recipeVisibility = {
  private: "PRIVATE",
  space: "SPACE"
} as const;

const sourceTypeOptions: SourceTypeValue[] = ["MANUAL", "SOCIAL", "WEBSITE", "IMPORTED_VIDEO", "FAMILY_ORAL_HISTORY"];

const tabs = [
  { id: "manual", label: "Manual" },
  { id: "website", label: "Website" },
  { id: "social", label: "Instagram / TikTok" },
  { id: "voice", label: "Voice memo" },
  { id: "video", label: "Video" },
  { id: "photo", label: "Photo / recipe card" }
] as const;

export function ImportStudio({ spaces }: { spaces: SpaceOption[] }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("website");
  const [uploading, setUploading] = useState<UploadKind | null>(null);
  const [uploads, setUploads] = useState<Record<UploadKind, string>>({
    voice: "",
    video: "",
    photo: ""
  });
  const [uploadError, setUploadError] = useState("");
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function uploadFile(kind: UploadKind, file: File) {
    setUploading(kind);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    const payload = (await response.json()) as { error?: string; url?: string };
    if (!response.ok || !payload.url) {
      setUploadError(payload.error ?? "Upload failed. Please try again.");
      setUploading(null);
      return;
    }

    setUploads((current) => ({
      ...current,
      [kind]: payload.url ?? ""
    }));
    setUploading(null);
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setUploadError("This browser does not support audio recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-memo-${Date.now()}.webm`, { type: "audio/webm" });
        await uploadFile("voice", file);
      };

      recorder.start();
      setRecording(true);
    } catch {
      setUploadError("Microphone access was denied.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setRecording(false);
  }

  return (
    <Card id="new-recipe">
      <CardHeader>
        <CardTitle>Recipe studio</CardTitle>
        <CardDescription>
          Everything starts here: manual entry, pasted website text, Instagram links, voice notes, videos, and recipe
          card photos all flow into one editable draft experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`rounded-full px-4 py-2 text-sm transition ${
                activeTab === tab.id ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-white/70"
              }`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {uploadError ? <p className="text-sm text-red-700">{uploadError}</p> : null}

        {activeTab === "manual" ? (
          <form action={saveRecipeAction} className="grid gap-4 md:grid-cols-2">
            <ManualSharedFields spaces={spaces} />
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium">Ingredients</span>
              <Textarea
                name="ingredients"
                placeholder={"2 cups rice flour\n1 cup urad dal | soaked overnight\n1 tsp salt"}
                required
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium">Instructions</span>
              <Textarea
                name="steps"
                placeholder={"Soak the dal overnight.\nBlend into a smooth batter.\nFerment and cook on a hot griddle."}
                required
              />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">Save recipe</Button>
            </div>
          </form>
        ) : null}

        {activeTab === "website" ? (
          <SourceDraftForm
            action={importRecipeSourceAction}
            spaces={spaces}
            importMode="website"
            sourceType="WEBSITE"
            title="Import from a website"
            description="Paste the recipe URL and any copied text. If extraction is incomplete, FamilyCookbook stores the source and creates an editable draft."
            fields={
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Website URL</span>
                  <Input name="sourceUrl" placeholder="https://..." required />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Copied recipe text</span>
                  <Textarea
                    name="body"
                    placeholder="Paste ingredients, instructions, or article text to help structure the draft."
                    required
                  />
                </label>
              </>
            }
          />
        ) : null}

        {activeTab === "social" ? (
          <SourceDraftForm
            action={importRecipeSourceAction}
            spaces={spaces}
            importMode="social"
            sourceType="SOCIAL"
            title="Save a social recipe link"
            description="Paste an Instagram, TikTok, or YouTube link. We save the source compliantly, capture any text you provide, and turn it into a draft for confirmation."
            fields={
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Post or video URL</span>
                  <Input name="sourceUrl" placeholder="https://instagram.com/..." required />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Caption or notes</span>
                  <Textarea
                    name="body"
                    placeholder="Paste the caption, your notes, or any visible ingredient list here."
                  />
                </label>
              </>
            }
          />
        ) : null}

        {activeTab === "voice" ? (
          <SourceDraftForm
            action={importRecipeSourceAction}
            spaces={spaces}
            importMode="voice"
            sourceType="FAMILY_ORAL_HISTORY"
            title="Create from a voice memo"
            description="Record a family member talking through a recipe or upload an audio file. Add a rough transcript when you have one, and we’ll create an oral-history draft."
            fields={
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Recipe title</span>
                  <Input name="title" placeholder="Grandma's stew voice memo" />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Voice memo URL</span>
                  <Input name="mediaUrl" value={uploads.voice} readOnly placeholder="Record or upload audio below" />
                </label>
                <input type="hidden" name="mediaType" value={mediaTypes.audio} />
                <div className="flex flex-wrap gap-3">
                  <Button onClick={recording ? stopRecording : startRecording} type="button" variant="secondary">
                    {recording ? <PauseCircle className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                    {recording ? "Stop recording" : "Record voice memo"}
                  </Button>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm">
                    <Upload className="h-4 w-4" />
                    Upload audio file
                    <input
                      className="hidden"
                      accept="audio/*"
                      type="file"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void uploadFile("voice", file);
                        }
                      }}
                    />
                  </label>
                </div>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Transcript or summary</span>
                  <Textarea
                    name="transcript"
                    placeholder="Transcribe the spoken instructions or summarize the family story behind the dish."
                  />
                </label>
              </>
            }
          />
        ) : null}

        {activeTab === "video" ? (
          <SourceDraftForm
            action={importRecipeSourceAction}
            spaces={spaces}
            importMode="video"
            sourceType="IMPORTED_VIDEO"
            title="Create from video"
            description="Use a hosted video link or upload a clip. If direct extraction is restricted, we store the source metadata and let you confirm the draft manually."
            fields={
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Video URL</span>
                  <Input name="sourceUrl" placeholder="https://youtube.com/..." />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Uploaded video URL</span>
                  <Input name="mediaUrl" value={uploads.video} readOnly placeholder="Upload a video below if you have a local file" />
                </label>
                <input type="hidden" name="mediaType" value={mediaTypes.video} />
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm">
                  <Video className="h-4 w-4" />
                  Upload video file
                  <input
                    className="hidden"
                    accept="video/*"
                    type="file"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void uploadFile("video", file);
                      }
                    }}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Caption, transcript, or recipe notes</span>
                  <Textarea
                    name="body"
                    placeholder="Paste the caption or describe what happens in the video so we can draft the recipe."
                  />
                </label>
              </>
            }
          />
        ) : null}

        {activeTab === "photo" ? (
          <SourceDraftForm
            action={importRecipeSourceAction}
            spaces={spaces}
            importMode="photo"
            sourceType="MANUAL"
            title="Create from a photo or recipe card"
            description="Upload a handwritten recipe card, cookbook photo, or screenshot. Add OCR text if you have it, and the draft will keep both the image and the editable fields."
            fields={
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Image URL</span>
                  <Input name="mediaUrl" value={uploads.photo} readOnly placeholder="Upload an image below" />
                </label>
                <input type="hidden" name="mediaType" value={mediaTypes.image} />
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm">
                  <Upload className="h-4 w-4" />
                  Upload recipe card photo
                  <input
                    className="hidden"
                    accept="image/*"
                    type="file"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void uploadFile("photo", file);
                      }
                    }}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">OCR text or quick transcription</span>
                  <Textarea
                    name="body"
                    placeholder="Paste OCR output or quickly transcribe what you can read from the card."
                  />
                </label>
              </>
            }
          />
        ) : null}

        {uploading ? <p className="text-sm text-[var(--muted-foreground)]">Uploading {uploading}...</p> : null}
      </CardContent>
    </Card>
  );
}

function ManualSharedFields({ spaces }: { spaces: SpaceOption[] }) {
  return (
    <>
      <label className="space-y-2">
        <span className="text-sm font-medium">Title</span>
        <Input name="title" placeholder="Grandma Leela's dosa" required />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Subtitle or story prompt</span>
        <Input name="subtitle" placeholder="The breakfast she made after every school recital" />
      </label>
      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-medium">Story</span>
        <Textarea name="story" placeholder="Write the context, family memory, or oral history behind the recipe." />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Cookbook space</span>
        <select name="spaceId" className="h-11 w-full rounded-2xl border bg-white/80 px-4 text-sm">
          <option value="">Private only</option>
          {spaces.map(({ space }) => (
            <option key={space.id} value={space.id}>
              {space.name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Visibility</span>
        <select name="visibility" className="h-11 w-full rounded-2xl border bg-white/80 px-4 text-sm" defaultValue={recipeVisibility.private}>
          <option value={recipeVisibility.private}>Private to me</option>
          <option value={recipeVisibility.space}>Shared in space</option>
        </select>
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Cuisine</span>
        <Input name="cuisine" placeholder="South Indian" />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Category</span>
        <Input name="category" placeholder="Breakfast" />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Prep time (minutes)</span>
        <Input name="prepTimeMinutes" type="number" placeholder="20" />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Cook time (minutes)</span>
        <Input name="cookTimeMinutes" type="number" placeholder="15" />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Servings</span>
        <Input name="servings" type="number" placeholder="4" />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Source type</span>
        <select name="sourceType" className="h-11 w-full rounded-2xl border bg-white/80 px-4 text-sm" defaultValue="MANUAL">
          {sourceTypeOptions.map((sourceType) => (
            <option key={sourceType} value={sourceType}>
              {sourceType.replaceAll("_", " ").toLowerCase()}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Main ingredients</span>
        <Input name="mainIngredients" placeholder="rice flour, urad dal" />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Dietary tags</span>
        <Input name="dietaryTags" placeholder="vegetarian, gluten-free" />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Tags</span>
        <Input name="tags" placeholder="weekend, heirloom, grandma" />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-medium">Cover image URL</span>
        <Input name="coverImage" placeholder="https://..." />
      </label>
      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-medium">Notes and tips</span>
        <Textarea name="notes" placeholder="The batter should be airy. Add warm water on colder days." />
      </label>
    </>
  );
}

function SourceDraftForm({
  action,
  spaces,
  importMode,
  sourceType,
  title,
  description,
  fields
}: {
  action: (formData: FormData) => void | Promise<void>;
  spaces: SpaceOption[];
  importMode: string;
  sourceType: SourceTypeValue;
  title: string;
  description: string;
  fields: ReactNode;
}) {
  return (
    <form action={action} className="space-y-4">
      <input name="importMode" type="hidden" value={importMode} />
      <input name="sourceType" type="hidden" value={sourceType} />
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
      </div>
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
        <span className="text-sm font-medium">Optional title</span>
        <Input name="title" placeholder="Give the draft a working title" />
      </label>
      {fields}
      <label className="block space-y-2">
        <span className="text-sm font-medium">Extra notes</span>
        <Textarea
          name="notes"
          placeholder="Anything the family should know before you refine this recipe draft?"
        />
      </label>
      <Button type="submit">Create draft</Button>
    </form>
  );
}
