"use server"

import { IFormData } from "@/types/form-data";
import { saltAndHashPassword } from "@/utils/password";
import prisma from "@/utils/prisma";

export async function registerUser(formData: IFormData) {
    const { email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
        return { error: "Пароли не совпадают" }
    }

    if (password.length < 6) {
        return { error: "Пароль должен быть не менее 6 символов" }
    }

    try {

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { error: "Этот email уже занят" }
        }

        const hash = await saltAndHashPassword(password)
        const user = await prisma.user.create({
            data: {
                email: email,
                password: hash
            }
        })

        return user

    } catch (error) {
        console.error("Ошибка регистрации", error)
    }
}