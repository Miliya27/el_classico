export function getEnv() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const missing: string[] = [];

    if (!url) {
        missing.push('NEXT_PUBLIC_SUPABASE_URL');
    }

    if (!anonKey) {
        missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    if (missing.length > 0) {
        throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
    }

    return {
        url: url!,
        anonKey: anonKey!,
    };
}
