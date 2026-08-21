"use client";

import { useRouter } from "next/navigation";
import { Button } from "@wtws/ui";
import { signOut } from "@/lib/sign-out";

export function LogoutButton() {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      type="button"
      onClick={async () => {
        await signOut();
        router.push("/");
        router.refresh();
      }}
    >
      Log out
    </Button>
  );
}
