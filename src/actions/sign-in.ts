"use server"

import { signIn } from "@/auth/auth";
import { AuthError } from "next-auth";

export async function signInWithCredentials(email: string, password: string) {
    try {
        await signIn("credentials", {
            email,
            password,
            redirect: false
        })
        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Неверные имя пользователя или пароль." };
                default:
                    return { error: "Что-то пошло не так." };
            }
        }
        // Re-throw other errors for debugging.
        throw error;
    }
}