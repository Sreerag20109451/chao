import { validateEmail, validatePassword } from '../lib/validators';

describe('Validators', () => {
  describe('validateEmail', () => {
    it('should return true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@sub.domain.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@example')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return null for valid passwords', () => {
      expect(validatePassword('Password123!')).toBeNull();
    });

    it('should return error for short passwords', () => {
      expect(validatePassword('Pass1!')).toBe('Password must be at least 8 characters long');
    });

    it('should return error for passwords without letters', () => {
      expect(validatePassword('12345678!')).toBe('Password must contain at least one letter');
    });

    it('should return error for passwords without numbers', () => {
      expect(validatePassword('Password!')).toBe('Password must contain at least one number');
    });

    it('should return error for passwords without special characters', () => {
      expect(validatePassword('Password123')).toBe('Password must contain at least one special character');
    });
  });
});
