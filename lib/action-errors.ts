export function getActionErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof Error) {
    if (error.message.includes("Invalid `db.")) {
      return "The database is not ready yet. Run Prisma setup on the deployed database and try again.";
    }

    if (error.message.includes("Unique constraint failed")) {
      return "That record already exists.";
    }

    return error.message;
  }

  return fallback;
}
