import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    redirect("/account");
  }

  const hasGoogle = !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

  return (
    <div className="etw-page flex items-center justify-center min-h-[70vh]">
      <LoginForm hasGoogle={hasGoogle} />
    </div>
  );
}
