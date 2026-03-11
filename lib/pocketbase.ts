import PocketBase from 'pocketbase';
import { TypedPocketBase } from '@/types/pocketbase';

// Singleton to avoid multiple instances during client-side navigation
let pb: TypedPocketBase | undefined;

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || process.env.POCKETBASE_URL || 'https://db.pangohub.fjelldata.com';

export const createClient = () => {
  if (typeof window === 'undefined') {
     // Server side (but executed in component context without cookies yet)
     return new PocketBase(PB_URL) as TypedPocketBase;
  }

  if (!pb) {
    pb = new PocketBase(PB_URL) as TypedPocketBase;
    // Note: auth cookie is HttpOnly — the client SDK cannot read it from document.cookie.
    // All authenticated operations go through server actions which read the cookie server-side.
  }
  return pb;
};
