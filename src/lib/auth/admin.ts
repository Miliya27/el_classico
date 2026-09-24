import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export interface AdminRecord {
    user_id: string;
    display_name: string | null;
}

export async function requireAdmin(): Promise<{ user: User; admin: AdminRecord }> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/admin/login');
    }

    const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('user_id, display_name')
        .eq('user_id', user.id)
        .maybeSingle();

    if (adminError || !admin) {
        redirect('/admin/login');
    }

    return { user, admin };
}

export async function getAdminState() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { isLogged: false, isAdmin: false, user: null, admin: null };
        }

        const { data: admin } = await supabase
            .from('admins')
            .select('user_id, display_name')
            .eq('user_id', user.id)
            .maybeSingle();

        return {
            isLogged: true,
            isAdmin: Boolean(admin),
            user,
            admin: admin ?? null,
        };
    } catch {
        return { isLogged: false, isAdmin: false, user: null, admin: null };
    }
}
