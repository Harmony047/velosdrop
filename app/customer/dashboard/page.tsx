import { UserButton } from "@clerk/nextjs";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  return (
    <>
      <SignedOut>
        {typeof window !== "undefined" && redirect("/customer/sign-in")}
      </SignedOut>
      <SignedIn>
        <main className="min-h-screen p-6 bg-[#0f0f0f] text-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Hello, Customer!</h1>
              <UserButton afterSignOutUrl="/customer/sign-in" />
            </div>
            
            <div className="p-6 bg-[#1a1a1a] rounded-xl">
              <h2 className="text-xl mb-4">Welcome to your Dashboard</h2>
              <p>This is a simple mockup of your delivery app dashboard.</p>
            </div>
          </div>
        </main>
      </SignedIn>
    </>
  );
}