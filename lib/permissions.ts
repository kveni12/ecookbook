import "server-only";

import { MembershipRole, RecipeVisibility } from "@prisma/client";

export function canManageSpace(role?: MembershipRole | null) {
  return role === MembershipRole.OWNER || role === MembershipRole.EDITOR;
}

export function canInviteMembers(role?: MembershipRole | null) {
  return role === MembershipRole.OWNER;
}

export function canEditRecipe(args: {
  role?: MembershipRole | null;
  createdById: string;
  currentUserId: string;
  visibility: RecipeVisibility;
}) {
  if (args.createdById === args.currentUserId) return true;
  if (args.visibility === RecipeVisibility.PRIVATE) return false;
  return args.role === MembershipRole.OWNER || args.role === MembershipRole.EDITOR;
}

export function canViewRecipe(args: {
  createdById: string;
  currentUserId: string;
  visibility: RecipeVisibility;
  isSpaceMember: boolean;
}) {
  if (args.createdById === args.currentUserId) return true;
  if (args.visibility === RecipeVisibility.PRIVATE) return false;
  return args.isSpaceMember;
}
