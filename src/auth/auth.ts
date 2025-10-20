import 'server-only';
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserFromDb } from "@/utils/user";
import { signInSchema } from "@/schema/zod";
import bcryptjs from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "E-mail", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        return null;
                    }

                    const { email, password } = await signInSchema.parseAsync(credentials);

                    const user = await getUserFromDb(email);

                    if (!user || !user.password) {
                        return null;
                    }

                    const isPasswordValid = await bcryptjs.compare(
                        password,
                        user.password
                    );

                    if (isPasswordValid) {
                        // Возвращаем объект, который пойдет в JWT токен
                        return { id: user.id, email: user.email };
                    }

                    return null;

                } catch (error) {
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt", // Credentials provider требует JWT
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        // Вызывается при создании/обновлении JWT
        async jwt({ token, user }) {
            // `user` доступен только при первом входе
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        // Вызывается при проверке сессии
        async session({ session, token }) {
            // Передаем id из токена в объект сессии
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        }
    }
});