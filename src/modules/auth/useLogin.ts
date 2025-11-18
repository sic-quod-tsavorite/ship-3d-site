import { ref, onMounted } from "vue";
import type { Ref } from "vue";
import { useUsers } from "../auth/useUsers";
import { validateEmail, validatePassword } from "@/utils/validationHelpers";

/**
 * Composable for login logic
 * Handles login form state, validation, and submission
 */
export const useLogin = (): {
  email: Ref<string>;
  password: Ref<string>;
  error: Ref<string | null>;
  loading: Ref<boolean>;
  emailError: Ref<string | null>;
  passwordError: Ref<string | null>;
  showPassword: Ref<boolean>;
  emailInput: Ref<HTMLInputElement | null>;
  handleLogin: () => Promise<void>;
  clearEmailError: () => void;
  clearPasswordError: () => void;
} => {
  const { fetchToken, email, password, error, loading } = useUsers();

  // Validation errors
  const emailError = ref<string | null>(null);
  const passwordError = ref<string | null>(null);

  // Password visibility toggle
  const showPassword = ref<boolean>(false);

  // Template ref for auto-focus
  const emailInput = ref<HTMLInputElement | null>(null);

  /**
   * Validates email and sets error state
   */
  const validateEmailField = (emailValue: string): boolean => {
    const result = validateEmail(emailValue);
    emailError.value = result.error;
    return result.isValid;
  };

  /**
   * Validates password and sets error state
   */
  const validatePasswordField = (passwordValue: string): boolean => {
    const result = validatePassword(passwordValue);
    passwordError.value = result.error;
    return result.isValid;
  };

  /**
   * Clears email validation error
   */
  const clearEmailError = (): void => {
    emailError.value = null;
  };

  /**
   * Clears password validation error
   */
  const clearPasswordError = (): void => {
    passwordError.value = null;
  };

  /**
   * Handles login form submission with validation
   */
  const handleLogin = async (): Promise<void> => {
    // Clear previous validation errors
    emailError.value = null;
    passwordError.value = null;

    // Validate inputs
    const isEmailValid = validateEmailField(email.value);
    const isPasswordValid = validatePasswordField(password.value);

    // Only proceed if both are valid
    if (isEmailValid && isPasswordValid) {
      await fetchToken(email.value, password.value);
    }
  };

  /**
   * Auto-focus email input on mount
   */
  const focusEmailInput = (): void => {
    emailInput.value?.focus();
  };

  // Set up auto-focus on mount
  onMounted(() => {
    focusEmailInput();
  });

  return {
    // From useUsers
    email,
    password,
    error,
    loading,

    // Local state
    emailError,
    passwordError,
    showPassword,
    emailInput,

    // Methods
    handleLogin,
    clearEmailError,
    clearPasswordError,
  };
};
