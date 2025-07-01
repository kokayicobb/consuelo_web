'use server';

import { signOut as workosSignOut } from '@workos-inc/authkit-nextjs';
import { revalidatePath } from 'next/cache';

export async function signOutAction() {
  await workosSignOut();
  // Revalidate the home page after sign out
  revalidatePath('/');
}