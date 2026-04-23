export const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string) => {
  // At least one letter, one number, and one special character
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;

  if (!isLongEnough) return "Password must be at least 8 characters long";
  if (!hasLetter) return "Password must contain at least one letter";
  if ( !hasNumber) return "Password must contain at least one number";
  if (!hasSpecial) return "Password must contain at least one special character";
  
  return null; // No error
};
