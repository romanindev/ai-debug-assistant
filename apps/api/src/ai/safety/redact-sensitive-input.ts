type RedactionRule = {
  pattern: RegExp;
  replacement: string | ((match: string) => string);
};

const REDACTION_RULES: RedactionRule[] = [
  {
    pattern: /\bsk-[A-Za-z0-9_-]{16,}\b/g,
    replacement: '[REDACTED_OPENAI_API_KEY]',
  },
  {
    pattern:
      /\b(?:[a-z0-9_]*api[_-]?key|access[_-]?token|auth[_-]?token|token|secret|password)\s*[:=]\s*['"]?(?!\[REDACTED_)[^'"\s,;]+/gi,
    replacement: (match: string) => {
      const separator = match.includes('=') ? '=' : ':';
      const key = match.split(separator)[0]?.trim() ?? 'secret';

      return `${key}${separator} [REDACTED_SECRET]`;
    },
  },
  {
    pattern: /\b(?:postgres|postgresql|mysql|mongodb|redis):\/\/[^\s]+/gi,
    replacement: '[REDACTED_DATABASE_URL]',
  },
  {
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replacement: '[REDACTED_EMAIL]',
  },
];

export function redactSensitiveInput(input: string): string {
  return REDACTION_RULES.reduce(
    (currentInput, rule) => applyRedactionRule(currentInput, rule),
    input,
  );
}

function applyRedactionRule(input: string, rule: RedactionRule): string {
  if (typeof rule.replacement === 'string') {
    return input.replace(rule.pattern, rule.replacement);
  }

  return input.replace(rule.pattern, rule.replacement);
}
