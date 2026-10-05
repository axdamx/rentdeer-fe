const placeholderValues = new Set([
  "https://your-project-ref.supabase.co",
  "your-publishable-key",
]);

export function hasSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return Boolean(
    url && key && !placeholderValues.has(url) && !placeholderValues.has(key),
  );
}

export function getSupabaseEnv() {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and fill in the project values.",
    );
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
  };
}
