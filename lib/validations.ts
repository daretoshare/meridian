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
    'Apartment number must be 5 or 6 digits starting with 5 or 6 (e.g. 50123 or 501234)'
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
    .regex(/^Tower (1[0-6]|[1-9])$/, 'Select a valid tower (Tower 1 – Tower 16)'),

  apartment_number: apartmentFormat,

  phone_number: bangaloreMobile,

  email: z
    .string()
    .email('Enter a valid email address')
    .max(200, 'Email too long'),

  event_ids: z
    .array(z.string().uuid('Invalid event ID'))
    .min(1, 'Please select at least one event'),
})

export type RegistrationFormData = z.infer<typeof registrationSchema>

export const adminLoginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type AdminLoginData = z.infer<typeof adminLoginSchema>
