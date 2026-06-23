import * as yup from 'yup';

export const authSchema = yup.object({
    email: yup.string()
        .trim()
        .required('Email address is required')
        .email('Invalid email address format')
        .max(255, 'Email is too long'),

    password: yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .max(16, 'Password must not exceed 16 characters')
        .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Must contain at least one lowercase letter')
        .matches(/[0-9]/, 'Must contain at least one number')
        .matches(/[@$!%*?&]/, 'Must contain at least one special character'),
});

export type AuthSchema = yup.InferType<typeof authSchema>;