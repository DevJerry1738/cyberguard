import { z } from "zod";

// Registration schema
export const RegisterSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain an uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain a number" }),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, { message: "You must accept the terms" }),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

// Login schema
export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

// Forgot password schema
export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

// Reset password schema
export const ResetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain an uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain a number" }),
  confirmPassword: z.string(),
  token: z.string().min(1, { message: "Missing token" }),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
