import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/session");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4">
      <SignIn
        forceRedirectUrl="/session"
        signUpUrl="/onboarding"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
      />
    </div>
  );
}
