import { z } from 'zod'

// Bangalore mobile: starts with 6-9, exactly 10 digits
const bangaloreMobile = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number (starts with 6–9)')

// Apartment format: 5 or 6 digits starting with 5 or 6 (e.g. 50123, 501234)
const apartmentFormat = z
  .string()
  .regex(
    /^[56]\d{4,5}$/,
    'Apartment number must be 5–6 digits starting with 5 (Building 5) or 6 (Building 6)'
  )

export const registrationSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s.'-]+$/, "Name can only contain letters, spaces, and . ' -"),

  tower: z
    .string()
    .min(1, 'Tower is required')
    .regex(
      /^(Building 5 – Tower (10|[1-9])|Building 6 – Tower [1-6])$/,
      'Select a valid tower'
    ),

  apartment_number: apartmentFormat,

  phone_number: bangaloreMobile,

  email: z
    .string()
    .email('Enter a valid email address')
    .max(200, 'Email too long'),

  event_ids: z
    .array(z.string().min(1))
    .min(1, 'Please select at least one event'),

  team_name: z
    .string()
    .max(80, 'Team name must be 80 characters or fewer')
    .optional(),
}).superRefine((data, ctx) => {
  const building = data.tower?.startsWith('Building 5') ? '5' : data.tower?.startsWith('Building 6') ? '6' : null
  if (building && data.apartment_number && !data.apartment_number.startsWith(building)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Apartment number must start with ${building} for ${data.tower?.split(' – ')[0]}`,
      path: ['apartment_number'],
    })
  }
})

export type RegistrationFormData = z.infer<typeof registrationSchema>

export const adminLoginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type AdminLoginData = z.infer<typeof adminLoginSchema>
