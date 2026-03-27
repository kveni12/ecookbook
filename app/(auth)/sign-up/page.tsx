import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { AuthErrorBanner } from "@/components/auth/auth-error-banner";
import { AuthFooterLink, AuthForm } from "@/components/auth/auth-form";
import { getActionErrorMessage } from "@/lib/action-errors";
import { signUpAction } from "@/lib/actions";

async function googleSignUpAction() {
  "use server";
  try {
    await signIn("google", { redirectTo: "/dashboard" });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    redirect(`/sign-up?error=${encodeURIComponent(getActionErrorMessage(error, "Google sign-in could not start."))}`);
  }
}

export default async function SignUpPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  async function safeSignUpAction(formData: FormData) {
    "use server";
    try {
      await signUpAction(formData);
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }
      redirect(`/sign-up?error=${encodeURIComponent(getActionErrorMessage(error, "We couldn't create your account."))}`);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full">
        <AuthErrorBanner message={params.error} />
        <AuthForm
          title="Create your cookbook"
          description="Set up a private space for family recipes, stories, and keepsakes."
          submitLabel="Create account"
          action={safeSignUpAction}
          fields={[
            { name: "name", label: "Name", placeholder: "Priya" },
            { name: "email", label: "Email", type: "email", placeholder: "priya@example.com" },
            { name: "password", label: "Password", type: "password", placeholder: "At least 8 characters" }
          ]}
          secondaryAction={googleEnabled ? { label: "Continue with Google", action: googleSignUpAction } : undefined}
          footer={<AuthFooterLink prompt="Already have an account?" href="/sign-in" label="Sign in" />}
        />
      </div>
    </main>
  );
}
