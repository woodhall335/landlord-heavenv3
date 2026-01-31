import { redirect } from 'next/navigation';

// Redirect to rolling-tenancy-agreement as they are the same concept
export default function PeriodicTenancyPage() {
  redirect('/rolling-tenancy-agreement');
}
