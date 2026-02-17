import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';
import { TypedPocketBase } from '@/types/pocketbase';

// Server-side client helper
export const createServerClient = async () => {
    const cookieStore = await cookies();
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://db.pangohub.fjelldata.com') as TypedPocketBase;

    const authCookie = cookieStore.get('pb_auth');
    
    if (authCookie) {
        pb.authStore.loadFromCookie(`pb_auth=${authCookie.value}`);
    }

    return pb;
};
