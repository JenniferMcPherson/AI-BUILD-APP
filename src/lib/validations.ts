import * as z from "zod";

export const SignupFormSchema = z.object({
  name: z.string().trim().min(2, { error: "Name must be at least 2 characters long." }),
  email: z.email({ error: "Please enter a valid email address." }).trim(),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters long." })
    .regex(/[a-zA-Z]/, { error: "Password must contain at least one letter." })
    .regex(/[0-9]/, { error: "Password must contain at least one number." }),
});

export const LoginFormSchema = z.object({
  email: z.email({ error: "Please enter a valid email address." }).trim(),
  password: z.string().min(1, { error: "Password is required." }),
});

export type SignupFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const CreateProjectSchema = z.object({
  name: z.string().trim().min(2, { error: "Name must be at least 2 characters long." }).max(80),
  description: z.string().trim().max(500).optional(),
});

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2, { error: "Name must be at least 2 characters long." }).max(80),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: "Enter your current password." }),
    newPassword: z
      .string()
      .min(8, { error: "New password must be at least 8 characters long." })
      .regex(/[a-zA-Z]/, { error: "New password must contain at least one letter." })
      .regex(/[0-9]/, { error: "New password must contain at least one number." }),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    error: "New password must be different from your current password.",
    path: ["newPassword"],
  });
