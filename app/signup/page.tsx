import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignupForm from "./SignupForm";

export default async function SignupPage() {
  const session = await auth();
  if (session) {
    redirect("/account");
  }

  return (
    <div className="etw-page flex items-center justify-center min-h-[70vh]">
      <SignupForm />
    </div>
  );
}
