import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { AuthErrorBanner } from "@/components/auth/auth-error-banner";
import { AuthFooterLink, AuthForm } from "@/components/auth/auth-form";
import { signIn } from "@/lib/auth";
import { getActionErrorMessage } from "@/lib/action-errors";

async function signInAction(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/dashboard"
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    const message =
      error instanceof AuthError && error.type === "CredentialsSignin"
        ? "That email and password combination did not work."
        : getActionErrorMessage(error, "We couldn't sign you in.");
    redirect(`/sign-in?error=${encodeURIComponent(message)}`);
  }
}

async function googleSignInAction() {
  "use server";
  try {
    await signIn("google", { redirectTo: "/dashboard" });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    redirect(`/sign-in?error=${encodeURIComponent(getActionErrorMessage(error, "Google sign-in could not start."))}`);
  }
}

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full">
        <AuthErrorBanner message={params.error} />
        <AuthForm
          title="Welcome back"
          description="Sign in to your private family archive."
          submitLabel="Sign in"
          action={signInAction}
          fields={[
            { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
            { name: "password", label: "Password", type: "password", placeholder: "At least 8 characters" }
          ]}
          secondaryAction={googleEnabled ? { label: "Continue with Google", action: googleSignInAction } : undefined}
          footer={<AuthFooterLink prompt="Need an account?" href="/sign-up" label="Create one" />}
        />
      </div>
    </main>
  );
}
