"use server";

import bcrypt from "bcryptjs";
import { MembershipRole, RecipeVisibility, SourceType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth, signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { canEditRecipe, canManageSpace } from "@/lib/permissions";
import { parseMessyRecipeText } from "@/lib/recipe-parser";
import { buildRecipeSnapshot, summarizeRecipeChanges, type RecipeSnapshot } from "@/lib/recipe-versioning";
import { slugify } from "@/lib/utils";

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

const createSpaceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional()
});

const recipeSchema = z.object({
  spaceId: z.string().optional(),
  title: z.string().min(2),
  subtitle: z.string().optional(),
  story: z.string().optional(),
  prepTimeMinutes: z.coerce.number().optional(),
  cookTimeMinutes: z.coerce.number().optional(),
  totalTimeMinutes: z.coerce.number().optional(),
  servings: z.coerce.number().optional(),
  cuisine: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  mainIngredients: z.string().optional(),
  dietaryTags: z.string().optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  sourceLink: z.string().url().optional().or(z.literal("")),
  sourceType: z.nativeEnum(SourceType).default(SourceType.MANUAL),
  authorName: z.string().optional(),
  visibility: z.nativeEnum(RecipeVisibility).default(RecipeVisibility.PRIVATE),
  notes: z.string().optional(),
  tips: z.string().optional(),
  lineageNote: z.string().optional(),
  ingredients: z.string().min(1),
  steps: z.string().min(1)
});

async function requireSessionUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  return session.user;
}

export async function signUpAction(formData: FormData) {
  const rawName = String(formData.get("name") ?? "").trim();
  const rawEmail = String(formData.get("email") ?? "").trim().toLowerCase();
  const rawPassword = String(formData.get("password") ?? "");

  const parsed = signUpSchema.safeParse({
    name: rawName,
    email: rawEmail,
    password: rawPassword
  });
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    if (firstIssue?.path[0] === "name") {
      throw new Error("Please enter your name.");
    }
    if (firstIssue?.path[0] === "email") {
      throw new Error("Please enter a valid email address.");
    }
    if (firstIssue?.path[0] === "password") {
      throw new Error("Password must be at least 8 characters.");
    }
    throw new Error("Please complete the sign-up form.");
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email }
  });
  if (existing) throw new Error("An account with that email already exists.");

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash
    }
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/dashboard"
  });
}

export async function createSpaceAction(formData: FormData) {
  const user = await requireSessionUser();
  const parsed = createSpaceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description")
  });
  if (!parsed.success) throw new Error("Please add a name for the space.");

  const slug = `${slugify(parsed.data.name)}-${crypto.randomUUID().slice(0, 6)}`;
  await db.cookbookSpace.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      slug,
      ownerId: user.id,
      memberships: {
        create: {
          userId: user.id,
          role: MembershipRole.OWNER
        }
      }
    }
  });

  revalidatePath("/dashboard");
}

export async function createCookbookAction(formData: FormData) {
  const user = await requireSessionUser();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const intro = String(formData.get("intro") ?? "").trim();
  const spaceId = String(formData.get("spaceId") ?? "").trim();
  const recipeIds = formData
    .getAll("recipeIds")
    .map((value) => String(value))
    .filter(Boolean);

  if (!title || !spaceId || recipeIds.length === 0) {
    throw new Error("Choose a title, a space, and at least one recipe.");
  }

  const membership = await db.membership.findUnique({
    where: {
      userId_spaceId: {
        userId: user.id,
        spaceId
      }
    }
  });

  if (!membership) {
    throw new Error("You do not have access to that cookbook space.");
  }
  if (!canManageSpace(membership.role)) {
    throw new Error("Only owners and editors can create cookbooks.");
  }

  const cookbook = await db.cookbook.create({
    data: {
      title,
      description: description || undefined,
      intro: intro || undefined,
      slug: `${slugify(title)}-${crypto.randomUUID().slice(0, 6)}`,
      spaceId,
      createdById: user.id,
      recipes: {
        create: recipeIds.map((recipeId, index) => ({
          recipeId,
          position: index
        }))
      }
    }
  });

  revalidatePath(`/spaces/${spaceId}`);
  redirect(`/cookbooks/${cookbook.id}`);
}

export async function inviteMemberAction(formData: FormData) {
  const user = await requireSessionUser();
  const spaceId = String(formData.get("spaceId") ?? "");
  const email = String(formData.get("email") ?? "").toLowerCase();
  const role = String(formData.get("role") ?? MembershipRole.VIEWER) as MembershipRole;

  const membership = await db.membership.findUnique({
    where: {
      userId_spaceId: {
        userId: user.id,
        spaceId
      }
    }
  });
  if (membership?.role !== MembershipRole.OWNER) {
    throw new Error("Only owners can invite members.");
  }

  await db.invite.upsert({
    where: {
      spaceId_email: {
        spaceId,
        email
      }
    },
    update: {
      role,
      token: crypto.randomUUID(),
      status: "PENDING",
      invitedById: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
    },
    create: {
      spaceId,
      email,
      role,
      token: crypto.randomUUID(),
      status: "PENDING",
      invitedById: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
    }
  });

  revalidatePath(`/spaces/${spaceId}`);
}

export async function saveRecipeAction(formData: FormData) {
  const user = await requireSessionUser();
  const parsed = recipeSchema.safeParse({
    spaceId: formData.get("spaceId") || undefined,
    title: formData.get("title"),
    subtitle: formData.get("subtitle") || undefined,
    story: formData.get("story") || undefined,
    prepTimeMinutes: formData.get("prepTimeMinutes") || undefined,
    cookTimeMinutes: formData.get("cookTimeMinutes") || undefined,
    totalTimeMinutes: formData.get("totalTimeMinutes") || undefined,
    servings: formData.get("servings") || undefined,
    cuisine: formData.get("cuisine") || undefined,
    category: formData.get("category") || undefined,
    tags: formData.get("tags") || undefined,
    mainIngredients: formData.get("mainIngredients") || undefined,
    dietaryTags: formData.get("dietaryTags") || undefined,
    coverImage: formData.get("coverImage") || undefined,
    sourceLink: formData.get("sourceLink") || undefined,
    sourceType: formData.get("sourceType") || SourceType.MANUAL,
    authorName: formData.get("authorName") || undefined,
    visibility: formData.get("visibility") || RecipeVisibility.PRIVATE,
    notes: formData.get("notes") || undefined,
    tips: formData.get("tips") || undefined,
    lineageNote: formData.get("lineageNote") || undefined,
    ingredients: formData.get("ingredients"),
    steps: formData.get("steps")
  });

  if (!parsed.success) throw new Error("Please complete the required recipe fields.");

  const ingredients = String(parsed.data.ingredients)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [head, ...noteParts] = line.split("|");
      return {
        position: index,
        item: head.trim(),
        notes: noteParts.join("|").trim() || undefined
      };
    });

  const steps = String(parsed.data.steps)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((instruction, index) => ({
      position: index,
      instruction
    }));

  const membership = parsed.data.spaceId
    ? await db.membership.findUnique({
        where: {
          userId_spaceId: {
            userId: user.id,
            spaceId: parsed.data.spaceId
          }
        }
      })
    : null;

  if (parsed.data.visibility === RecipeVisibility.SPACE && !membership) {
    throw new Error("Shared recipes need a cookbook space.");
  }

  const recipe = await db.recipe.create({
    data: {
      spaceId: parsed.data.spaceId,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      story: parsed.data.story,
      prepTimeMinutes: parsed.data.prepTimeMinutes,
      cookTimeMinutes: parsed.data.cookTimeMinutes,
      totalTimeMinutes: parsed.data.totalTimeMinutes,
      servings: parsed.data.servings,
      cuisine: parsed.data.cuisine,
      category: parsed.data.category,
      tags: parsed.data.tags?.split(",").map((item) => item.trim()).filter(Boolean) ?? [],
      mainIngredients:
        parsed.data.mainIngredients?.split(",").map((item) => item.trim()).filter(Boolean) ?? [],
      dietaryTags:
        parsed.data.dietaryTags?.split(",").map((item) => item.trim()).filter(Boolean) ?? [],
      coverImage: parsed.data.coverImage || undefined,
      sourceLink: parsed.data.sourceLink || undefined,
      sourceType: parsed.data.sourceType,
      authorName: parsed.data.authorName,
      visibility: parsed.data.visibility,
      notes: parsed.data.notes,
      tips: parsed.data.tips,
      lineageNote: parsed.data.lineageNote,
      createdById: user.id,
      lastEditedById: user.id,
      ingredients: {
        create: ingredients
      },
      steps: {
        create: steps
      }
    },
    include: {
      ingredients: true,
      steps: true,
      media: true
    }
  });

  const snapshot = buildRecipeSnapshot({
    recipe,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    media: recipe.media
  });

  await db.recipeVersion.create({
    data: {
      recipeId: recipe.id,
      createdById: user.id,
      changeSummary: "Created recipe",
      snapshot
    }
  });

  revalidatePath("/dashboard");
  if (recipe.spaceId) revalidatePath(`/spaces/${recipe.spaceId}`);
  redirect(`/recipes/${recipe.id}`);
}

export async function forkRecipeAction(recipeId: string) {
  const user = await requireSessionUser();
  const recipe = await db.recipe.findUnique({
    where: { id: recipeId },
    include: { ingredients: true, steps: true, media: true }
  });
  if (!recipe) throw new Error("Recipe not found.");

  const duplicate = await db.recipe.create({
    data: {
      title: `${recipe.title} (Adapted)`,
      subtitle: recipe.subtitle,
      story: recipe.story,
      prepTimeMinutes: recipe.prepTimeMinutes,
      cookTimeMinutes: recipe.cookTimeMinutes,
      totalTimeMinutes: recipe.totalTimeMinutes,
      servings: recipe.servings,
      cuisine: recipe.cuisine,
      category: recipe.category,
      tags: recipe.tags,
      mainIngredients: recipe.mainIngredients,
      dietaryTags: recipe.dietaryTags,
      coverImage: recipe.coverImage,
      sourceLink: recipe.sourceLink,
      sourceType: recipe.sourceType,
      authorName: user.name ?? recipe.authorName,
      visibility: RecipeVisibility.PRIVATE,
      notes: recipe.notes,
      tips: recipe.tips,
      lineageNote: `Adapted from ${recipe.title}`,
      parentRecipeId: recipe.id,
      createdById: user.id,
      lastEditedById: user.id,
      ingredients: {
        create: recipe.ingredients.map(({ position, quantity, unit, item, notes }) => ({
          position,
          quantity,
          unit,
          item,
          notes
        }))
      },
      steps: {
        create: recipe.steps.map(({ position, instruction, note }) => ({
          position,
          instruction,
          note
        }))
      },
      media: {
        create: recipe.media.map(({ type, url, thumbnailUrl, caption, position }) => ({
          type,
          url,
          thumbnailUrl,
          caption,
          position
        }))
      }
    }
  });

  revalidatePath(`/recipes/${recipeId}`);
  redirect(`/recipes/${duplicate.id}`);
}

export async function addCommentAction(formData: FormData) {
  const user = await requireSessionUser();
  const recipeId = String(formData.get("recipeId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) throw new Error("Comment cannot be empty.");

  await db.recipeComment.create({
    data: {
      recipeId,
      userId: user.id,
      body
    }
  });

  revalidatePath(`/recipes/${recipeId}`);
}

export async function toggleFavoriteAction(recipeId: string) {
  const user = await requireSessionUser();
  const existing = await db.recipeFavorite.findUnique({
    where: {
      recipeId_userId: {
        recipeId,
        userId: user.id
      }
    }
  });

  if (existing) {
    await db.recipeFavorite.delete({ where: { recipeId_userId: { recipeId, userId: user.id } } });
  } else {
    await db.recipeFavorite.create({ data: { recipeId, userId: user.id } });
  }

  revalidatePath(`/recipes/${recipeId}`);
}

export async function savePersonalNoteAction(formData: FormData) {
  const user = await requireSessionUser();
  const recipeId = String(formData.get("recipeId") ?? "");
  const body = String(formData.get("body") ?? "");

  await db.personalRecipeNote.upsert({
    where: {
      recipeId_userId: {
        recipeId,
        userId: user.id
      }
    },
    update: { body },
    create: { recipeId, userId: user.id, body }
  });

  revalidatePath(`/recipes/${recipeId}`);
}

export async function importRecipeTextAction(formData: FormData) {
  const user = await requireSessionUser();
  const raw = String(formData.get("body") ?? "");
  const sourceUrl = String(formData.get("sourceUrl") ?? "") || undefined;
  const spaceId = String(formData.get("spaceId") ?? "") || undefined;
  const draft = parseMessyRecipeText(raw, sourceUrl);

  const created = await db.recipe.create({
    data: {
      spaceId,
      title: draft.title,
      subtitle: draft.subtitle,
      visibility: spaceId ? RecipeVisibility.SPACE : RecipeVisibility.PRIVATE,
      tags: draft.tags,
      mainIngredients: draft.mainIngredients,
      sourceLink: sourceUrl,
      sourceType: sourceUrl ? SourceType.WEBSITE : SourceType.MANUAL,
      sourcePreview: draft.sourcePreview,
      authorName: user.name ?? undefined,
      createdById: user.id,
      lastEditedById: user.id,
      ingredients: {
        create: draft.ingredients.map((ingredient, index) => ({
          position: index,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          item: ingredient.item,
          notes: ingredient.notes
        }))
      },
      steps: {
        create: draft.steps.map((step, index) => ({
          position: index,
          instruction: step.instruction
        }))
      }
    },
    include: {
      ingredients: true,
      steps: true,
      media: true
    }
  });

  await db.recipeVersion.create({
    data: {
      recipeId: created.id,
      createdById: user.id,
      changeSummary: "Imported recipe draft",
      snapshot: buildRecipeSnapshot({
        recipe: created,
        ingredients: created.ingredients,
        steps: created.steps,
        media: created.media
      })
    }
  });

  revalidatePath("/dashboard");
  redirect(`/recipes/${created.id}`);
}

export async function publishAdaptationBackAction(formData: FormData) {
  const user = await requireSessionUser();
  const recipeId = String(formData.get("recipeId") ?? "");
  const targetSpaceId = String(formData.get("targetSpaceId") ?? "");

  const recipe = await db.recipe.findUnique({
    where: { id: recipeId },
    include: { ingredients: true, steps: true, media: true }
  });
  if (!recipe) throw new Error("Recipe not found.");

  const membership = await db.membership.findUnique({
    where: {
      userId_spaceId: {
        userId: user.id,
        spaceId: targetSpaceId
      }
    }
  });
  if (!canEditRecipe({
    role: membership?.role,
    createdById: recipe.createdById,
    currentUserId: user.id,
    visibility: recipe.visibility
  })) {
    throw new Error("You do not have permission to publish this recipe to that space.");
  }

  const updated = await db.recipe.update({
    where: { id: recipeId },
    data: {
      spaceId: targetSpaceId,
      visibility: RecipeVisibility.SPACE,
      lineageNote: recipe.lineageNote ?? `Adapted from ${recipe.parentRecipeId ? "a family recipe" : recipe.title}`,
      lastEditedById: user.id
    },
    include: { ingredients: true, steps: true, media: true }
  });

  const latestVersion = await db.recipeVersion.findFirst({
    where: { recipeId },
    orderBy: { createdAt: "desc" }
  });
  const nextSnapshot = buildRecipeSnapshot({
    recipe: updated,
    ingredients: updated.ingredients,
    steps: updated.steps,
    media: updated.media
  });

  await db.recipeVersion.create({
    data: {
      recipeId,
      createdById: user.id,
      changeSummary: latestVersion
        ? summarizeRecipeChanges(latestVersion.snapshot as RecipeSnapshot, nextSnapshot)
        : "Published adaptation to family space",
      snapshot: nextSnapshot
    }
  });

  revalidatePath(`/spaces/${targetSpaceId}`);
  redirect(`/recipes/${recipeId}`);
}
