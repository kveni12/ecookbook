import { AuthFooterLink, AuthForm } from "@/components/auth/auth-form";
import { signIn } from "@/lib/auth";

async function signInAction(formData: FormData) {
  "use server";
  await signIn("credentials", {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    redirectTo: "/dashboard"
  });
}

async function googleSignInAction() {
  "use server";
  await signIn("google", { redirectTo: "/dashboard" });
}

export default function SignInPage() {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
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
    </main>
  );
}
