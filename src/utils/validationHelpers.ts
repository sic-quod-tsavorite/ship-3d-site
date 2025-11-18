/**
 * Validation utilities for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns ValidationResult with isValid flag and error message
 */
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return {
      isValid: false,
      error: "Email is required",
    };
  }

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: "Invalid email format",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validates password against security requirements:
 * - Min 8, max 70 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character from allowed set
 *
 * @param password - Password string to validate
 * @returns ValidationResult with isValid flag and error message (shows all violations)
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return {
      isValid: false,
      error: "Password is required",
    };
  }

  const errors: string[] = [];

  // Min 8, max 70 characters
  if (password.length < 8 || password.length > 70) {
    errors.push("be between 8 and 70 characters");
  }

  // At least 1 uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push("contain at least one uppercase letter");
  }

  // At least 1 lowercase
  if (!/[a-z]/.test(password)) {
    errors.push("contain at least one lowercase letter");
  }

  // At least 1 number
  if (!/[0-9]/.test(password)) {
    errors.push("contain at least one number");
  }

  // At least 1 special character from allowed set
  if (!/[!@#$%^&'*(),.?":{}|<>½§¾£€¥+~;=`_\-]/.test(password)) {
    errors.push("contain at least one special character");
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      error: `Password must ${errors.join(", ")}`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};
