import { ref } from "vue";

export const useFormValidator = () => {
  const errorMessage = ref("");

  const validateRequired = (fields: Record<string, string>): boolean => {
    const missing = Object.entries(fields)
      .filter(([, val]) => val.trim().length === 0)
      .map(([key]) => key);

    if (missing.length > 0) {
      errorMessage.value = `請輸入${missing.join("、")}`;
      return false;
    }
    errorMessage.value = "";
    return true;
  };

  const validatePasswordLength = (password: string, min = 8, max = 12): boolean => {
    if (password.length < min || password.length > max) {
      errorMessage.value = `密碼長度需介於 ${min}~${max} 字元`;
      return false;
    }
    errorMessage.value = "";
    return true;
  };

  return {
    validateRequired,
    validatePasswordLength,
    errorMessage,
  };
};
