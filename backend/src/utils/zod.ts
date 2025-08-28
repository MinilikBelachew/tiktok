import z from "zod";

export const RegisterUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  password: z.string().min(8).max(255),
});

export const LoginUserSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().min(10).max(20).optional(),
    password: z.string().min(8).max(255),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone must be provided",
  });

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(255),
});

export const RequestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export const UpdateUserProfile = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().min(10).max(20).optional(),
    avatarUrl: z.string().url().optional(),
    username: z.string().min(3).max(50).optional(),
  })
  .refine(
    (data) => data.email || data.phone || data.avatarUrl || data.username,
    {
      message: "At least one field must be provided for update",
    }
  );
