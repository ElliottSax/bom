import { emailService, emailTemplates, sendEmail, sendPasswordResetEmail } from '../services/email.service';

describe('Email Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, NODE_ENV: 'development', EMAIL_PROVIDER: 'console' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('emailTemplates', () => {
    describe('passwordReset', () => {
      it('should generate password reset template with user name', () => {
        const template = emailTemplates.passwordReset('https://example.com/reset?token=abc', 'John');

        expect(template.subject).toBe('Reset Your Password - BOM Study Tools');
        expect(template.text).toContain('Hello John');
        expect(template.text).toContain('https://example.com/reset?token=abc');
        expect(template.html).toContain('Hello John');
        expect(template.html).toContain('https://example.com/reset?token=abc');
      });

      it('should generate password reset template without user name', () => {
        const template = emailTemplates.passwordReset('https://example.com/reset?token=abc');

        expect(template.text).toContain('Hello,');
        expect(template.text).not.toContain('Hello ,');
      });
    });

    describe('welcomeEmail', () => {
      it('should generate welcome email template', () => {
        const template = emailTemplates.welcomeEmail('Jane', 'https://example.com/login');

        expect(template.subject).toBe('Welcome to BOM Study Tools!');
        expect(template.text).toContain('Welcome to BOM Study Tools, Jane!');
        expect(template.text).toContain('https://example.com/login');
        expect(template.html).toContain('Hello Jane');
      });
    });

    describe('dailyReminder', () => {
      it('should generate daily reminder without verse', () => {
        const template = emailTemplates.dailyReminder('Mike', 'https://example.com');

        expect(template.subject).toBe('Your Daily Scripture Reminder - BOM Study Tools');
        expect(template.text).toContain('Hello Mike');
        expect(template.text).toContain('https://example.com');
      });

      it('should generate daily reminder with verse', () => {
        const verse = { reference: '1 Nephi 3:7', text: 'I will go and do...' };
        const template = emailTemplates.dailyReminder('Mike', 'https://example.com', verse);

        expect(template.text).toContain('1 Nephi 3:7');
        expect(template.text).toContain('I will go and do...');
        expect(template.html).toContain('1 Nephi 3:7');
      });
    });
  });

  describe('sendEmail', () => {
    it('should send email using console provider in development', async () => {
      const consoleSpy = jest.spyOn(console, 'log');

      await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test body',
      });

      // In console mode, it logs the email
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email', async () => {
      const consoleSpy = jest.spyOn(console, 'log');

      await sendPasswordResetEmail('user@example.com', 'test-token-123', 'TestUser');

      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('emailService object', () => {
    it('should export all required methods', () => {
      expect(emailService.sendEmail).toBeDefined();
      expect(emailService.sendPasswordResetEmail).toBeDefined();
      expect(emailService.sendWelcomeEmail).toBeDefined();
      expect(emailService.sendDailyReminderEmail).toBeDefined();
      expect(emailService.templates).toBeDefined();
    });
  });
});
