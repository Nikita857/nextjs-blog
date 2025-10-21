"use server";

import { auth } from "@/auth/auth";
import prisma from "@/utils/prisma";
import bcrypt from "bcryptjs";
import z from "zod";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Пароль обязателен"),
    newPassword: z
      .string()
      .min(6, "Новый пароль должен быть не менее 6 символов"),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Новый пароль не должен совпадать со старым",
    path: ["newPassword"],
  });

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (newPassword !== confirmPassword) {
    console.log(newPassword, "new")
    console.log(confirmPassword, "confirm")
    return { error: "Passwords not same" };
  }

  const validation = passwordSchema.safeParse({ currentPassword, newPassword });
  if (!validation.success) {
    return { error: validation.error.message };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user || !user.password) {
    return { error: "User not found" };
  }

  const isPasswordValid = await bcrypt.compare(
    validation.data.currentPassword,
    user.password
  );

  if (!isPasswordValid) {
    return { error: "Invalid password" };
  }

  const hashedNewPassword = await bcrypt.hash(validation.data.newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword },
  });

  return { success: "Password updated" };
}
