import { describe, expect, it } from "vitest";
import { MembershipRole, RecipeVisibility } from "@prisma/client";

import { canEditRecipe, canViewRecipe } from "@/lib/permissions";

describe("permissions", () => {
  it("allows owners and editors to edit shared recipes", () => {
    expect(
      canEditRecipe({
        role: MembershipRole.EDITOR,
        createdById: "recipe-author",
        currentUserId: "editor",
        visibility: RecipeVisibility.SPACE
      })
    ).toBe(true);
  });

  it("blocks viewers from editing recipes they do not own", () => {
    expect(
      canEditRecipe({
        role: MembershipRole.VIEWER,
        createdById: "recipe-author",
        currentUserId: "viewer",
        visibility: RecipeVisibility.SPACE
      })
    ).toBe(false);
  });

  it("blocks non-members from viewing shared recipes", () => {
    expect(
      canViewRecipe({
        createdById: "recipe-author",
        currentUserId: "other-user",
        visibility: RecipeVisibility.SPACE,
        isSpaceMember: false
      })
    ).toBe(false);
  });
});
