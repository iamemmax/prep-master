import z from "zod";

// Zod Schema
export const userOnboardingInfoSchema = z.object({
  first_name: z.string().min(2, 'Name must be at least 2 characters'),
  last_name: z.string().min(2, 'Name must be at least 2 characters'),
  // username: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Please enter a valid email address'),
   password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  // agreeToTerms: z.boolean().refine((val) => val === true, {
  //   message: 'You must agree to terms & conditions',
  // }),
})

const baseExamOnboardingSchema = z.object({
  email: z.string().email("Invalid email address"),
  country: z.string().min(1, "Country is required"),
  exam_type: z.number({ message: "Please select an exam" }).int().positive(),
  exam_name: z.string().optional(), // UI display only — not sent to API
  exam_date: z
    .string()
    .min(1, "Exam date is required")
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" })
    .refine((val) => new Date(val) > new Date(), { message: "Exam date must be in the future" }),
  target_score: z.string().min(1, "Target score is required"),
  daily_study_hours: z
    .number({ message: "Must be a number" })
    .min(0.5, "Minimum 0.5 hour")
    .max(24, "Maximum 24 hours"),
  current_level: z.string().min(1, "Current level is required"),
  send_progress_report: z.boolean().default(false),
})

export const examOnboardingSchema = baseExamOnboardingSchema

export const step1Schema = baseExamOnboardingSchema.pick({
  country: true,
  exam_type: true,
  exam_name: true,
  exam_date: true,
})

export const step2Schema = baseExamOnboardingSchema.pick({
  target_score: true,
  daily_study_hours: true,
  current_level: true,
  send_progress_report: true,
}).extend({
  send_progress_report: z.boolean(), // ✅ removes the optional/default ambiguity
})


export type ExamOnboardingData = z.infer<typeof examOnboardingSchema>
export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>