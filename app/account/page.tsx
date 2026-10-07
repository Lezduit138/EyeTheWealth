import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AccountContent from "./AccountContent";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="etw-page etw-container py-12">
      <AccountContent user={session.user} />
    </div>
  );
}
