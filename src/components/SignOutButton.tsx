import { signOutAction } from "@/lib/auth/session-actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button variant="ghost" type="submit">
        Sign Out
      </Button>
    </form>
  );
}
