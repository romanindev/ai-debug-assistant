import { redactSensitiveInput } from './redact-sensitive-input';

describe('redactSensitiveInput', () => {
  it('redacts OpenAI-like API keys', () => {
    expect(
      redactSensitiveInput('OPENAI_API_KEY=sk-1234567890abcdefghijklmnop'),
    ).toContain('OPENAI_API_KEY=[REDACTED_OPENAI_API_KEY]');
  });

  it('redacts generic token and password assignments', () => {
    const result = redactSensitiveInput(
      'token: abc123 password="super-secret"',
    );

    expect(result).toContain('token: [REDACTED_SECRET]');
    expect(result).toContain('password= [REDACTED_SECRET]');
  });

  it('redacts database urls', () => {
    expect(
      redactSensitiveInput('postgresql://app:secret@localhost:5432/db'),
    ).toBe('[REDACTED_DATABASE_URL]');
  });

  it('redacts email addresses', () => {
    expect(redactSensitiveInput('Contact admin@example.com')).toBe(
      'Contact [REDACTED_EMAIL]',
    );
  });
});
