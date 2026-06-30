import { z } from 'zod'

// Bangalore mobile: starts with 6-9, exactly 10 digits
const bangaloreMobile = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number (starts with 6–9)')

export const teamMemberSchema = z.object({
  name:             z.string().min(2, 'Name required').max(100),
  tower:            z.string().min(1, 'Tower required').regex(/^(Building 5 – Tower (10|[1-9])|Building 6 – Tower [1-6])$/, 'Select a valid tower'),
  apartment_number: z.string().regex(/^\d{5,6}$/, 'Enter a 5–6 digit apartment number'),
  phone_number:     bangaloreMobile,
})

export type TeamMember = z.infer<typeof teamMemberSchema>

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

  apartment_number: z
    .string()
    .regex(/^\d{5,6}$/, 'Enter a 5–6 digit apartment number'),

  phone_number: bangaloreMobile,

  email: z
    .string()
    .email('Enter a valid email address')
    .max(200, 'Email too long'),

  event_ids: z
    .array(z.string().min(1))
    .min(1, 'Please select at least one event'),

  event_team_details: z.record(
    z.string(),
    z.object({
      team_name: z.string().max(80, 'Team name must be 80 characters or fewer').optional(),
      members:   z.array(teamMemberSchema).optional(),
    })
  ).optional(),
})

export type RegistrationFormData = z.infer<typeof registrationSchema>

export const adminLoginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type AdminLoginData = z.infer<typeof adminLoginSchema>
