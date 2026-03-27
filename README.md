# FamilyCookbook

FamilyCookbook is a private, collaborative recipe platform built with Next.js 15, TypeScript, Tailwind CSS, shadcn-style UI primitives, Prisma, PostgreSQL, NextAuth, and Supabase-ready media storage. It is designed to feel less like a bookmark manager and more like a living family archive where recipes evolve over generations while preserving attribution, story, and media.

## What is included

- Private-by-default recipe platform with email/password auth and Google OAuth support
- Cookbook Spaces with owner, editor, and viewer membership roles
- Rich recipe model with ingredients, steps, tags, source metadata, notes, comments, favorites, and lineage
- Recipe adaptation flow with preserved parent-child relationships and version snapshots
- Import draft flow for pasted text and source URLs with compliant metadata-first fallback behavior
- Web-first cookbook pages for themed collections and future PDF export support
- Supabase Storage-ready upload endpoint for media
- Seed script with 2 users, 1 family space, 6 base recipes, and 2 adaptations
- Basic tests covering parsing, permissions, and versioning

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS v4
- Prisma ORM
- PostgreSQL via Supabase or Neon
- NextAuth v5 beta
- Supabase Storage
- Vitest

## Quick start

1. Install dependencies

```bash
npm install
```

2. Copy the environment template

```bash
cp .env.example .env
```

3. Set up PostgreSQL in Supabase or Neon and fill in:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

4. Create the database schema and seed demo data

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. Start the app

```bash
npm run dev
```

Demo accounts after seeding:

- `maya@familycookbook.dev` / `family1234`
- `arjun@familycookbook.dev` / `family1234`

## Deployment

### Vercel

1. Push this repository to GitHub.
2. Import the project into Vercel.
3. Add the environment variables from `.env.example`.
4. Set a Postgres database from Supabase or Neon.
5. Run `prisma generate && prisma db push && npm run build` during deployment or as part of your setup pipeline.

Recommended Vercel build command:

```bash
prisma generate && next build
```

Recommended post-deploy step:

```bash
tsx prisma/seed.ts
```

## Data model highlights

- `User`, `CookbookSpace`, `Membership`, and `Invite` support private collaborative groups
- `Recipe`, `RecipeIngredient`, `RecipeStep`, `RecipeMedia`, `RecipeVersion`, `RecipeComment`, and `RecipeFavorite` support rich recipes and lineage
- `Cookbook` and `CookbookRecipe` power themed cookbook generation
- `PersonalRecipeNote` keeps private annotations out of the shared source recipe

## Product behavior notes

- Social/video imports are designed to stay compliant: when direct extraction is unavailable, FamilyCookbook stores the URL, preview metadata, and an editable draft instead of bypassing platform restrictions.
- `embedding Unsupported("vector")?` is included in the Prisma schema so you can enable `pgvector` later for semantic search in Supabase or Neon Postgres.
- The current scaffold implements rule-based ingredient overlap and structured import parsing. OpenAI-assisted parsing, tagging, and caption summarization can be added behind `OPENAI_API_KEY`.

## Suggested next production steps

- Add email delivery for invites and magic-link acceptance flows
- Add object-level upload widgets and drag-and-drop media management
- Implement recipe edit screens and visual side-by-side diff UI for versions
- Add OCR worker integration for handwritten cards and screenshot parsing
- Add search indexing with Postgres full text and optional `pgvector`
- Add PDF cookbook export using the local `pdf` skill workflow

## Testing

```bash
npm run test
```
