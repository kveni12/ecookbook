import { signIn } from "@/lib/auth";
import { AuthFooterLink, AuthForm } from "@/components/auth/auth-form";
import { signUpAction } from "@/lib/actions";

async function googleSignUpAction() {
  "use server";
  await signIn("google", { redirectTo: "/dashboard" });
}

export default function SignUpPage() {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <AuthForm
        title="Create your cookbook"
        description="Set up a private space for family recipes, stories, and keepsakes."
        submitLabel="Create account"
        action={signUpAction}
        fields={[
          { name: "name", label: "Name", placeholder: "Priya" },
          { name: "email", label: "Email", type: "email", placeholder: "priya@example.com" },
          { name: "password", label: "Password", type: "password", placeholder: "At least 8 characters" }
        ]}
        secondaryAction={googleEnabled ? { label: "Continue with Google", action: googleSignUpAction } : undefined}
        footer={<AuthFooterLink prompt="Already have an account?" href="/sign-in" label="Sign in" />}
      />
    </main>
  );
}
