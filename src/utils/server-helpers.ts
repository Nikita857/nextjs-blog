import { auth } from "@/auth/auth";

export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function checkAuth(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}
