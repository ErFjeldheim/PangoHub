import PocketBase from 'pocketbase';
import { TypedPocketBase } from '@/types/pocketbase';

export const createAdminClient = async () => {
    const pb = new PocketBase(process.env.POCKETBASE_URL || 'https://db.pangohub.fjelldata.com') as TypedPocketBase;
    
    pb.autoCancellation(false);

    await pb.admins.authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL!,
        process.env.POCKETBASE_ADMIN_PASSWORD!
    );

    return pb;
};
