import PocketBase from 'pocketbase';
import { TypedPocketBase } from '@/types/pocketbase';

// Singleton to avoid multiple instances during client-side navigation
let pb: TypedPocketBase | undefined;

export const createClient = () => {
  if (typeof window === 'undefined') {
     // Server side (but executed in component context without cookies yet)
     return new PocketBase('https://db.pangohub.fjelldata.com') as TypedPocketBase;
  }

  if (!pb) {
    pb = new PocketBase('https://db.pangohub.fjelldata.com') as TypedPocketBase;
    // Client-side: load from document.cookie automatically
    pb.authStore.loadFromCookie(document.cookie);
  }
  return pb;
};
