import { NavBar } from "@/components/ui";

interface HeaderProps {
  user?: {
    email: string;
    name?: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
  return <NavBar user={user} />;
}
