import { redirect } from 'next/navigation';

// Root "/" — the middleware handles locale routing,
// but as a safety net we redirect to the default locale.
export default function RootPage() {
  redirect('/de');
}
