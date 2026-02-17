import PocketBase from 'pocketbase';
import { TypedPocketBase } from '@/types/pocketbase';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://db.pangohub.fjelldata.com';

// Module-level cache: reuse the authenticated admin client until the token
// is within 5 minutes of expiry, then re-authenticate.
let cachedAdminPb: TypedPocketBase | null = null;
let tokenExpiresAt: number = 0;
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

export const createAdminClient = async (): Promise<TypedPocketBase> => {
    const now = Date.now();

    if (cachedAdminPb && now < tokenExpiresAt - TOKEN_REFRESH_BUFFER_MS) {
        return cachedAdminPb;
    }

    const pb = new PocketBase(PB_URL) as TypedPocketBase;
    pb.autoCancellation(false);

    // PocketBase 0.22+ superuser auth via the new `/api/admins/auth-with-password`
    // endpoint. The SDK still exposes this as `pb.admins.authWithPassword` in 0.26.x.
    await pb.admins.authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL!,
        process.env.POCKETBASE_ADMIN_PASSWORD!
    );

    // PocketBase admin tokens are valid for 1 day by default — cache for 23 hours.
    tokenExpiresAt = now + 23 * 60 * 60 * 1000;
    cachedAdminPb = pb;

    return pb;
};
