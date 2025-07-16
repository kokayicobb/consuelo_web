import type { User as ClerkUser } from "@clerk/nextjs/server";

export interface ExtendedUser extends ClerkUser {
  organizationMemberships?: Array<{
    organization?: {
      id: string;
      // add other organization fields if needed
    };
  }>;
}