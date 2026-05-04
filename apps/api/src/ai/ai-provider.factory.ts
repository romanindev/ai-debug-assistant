import type { AiProvider } from './ai-provider.interface';
import { AI_PROVIDER_NAMES, type AiProviderName } from './ai.constants';

type AiProviderRegistry = Record<AiProviderName, AiProvider>;
type ConfigurableAiProvider = AiProvider & {
  assertConfigured(): void;
};

export function selectAiProvider(
  providerName: string | undefined,
  providers: AiProviderRegistry,
): AiProvider {
  const selectedProvider = providerName ?? 'mock';

  if (isAiProviderName(selectedProvider)) {
    const provider = providers[selectedProvider];

    if (selectedProvider === 'openai') {
      assertOpenAiProviderConfigured(provider);
    }

    return provider;
  }

  throw new Error(
    `Unsupported AI_PROVIDER "${selectedProvider}". Supported providers: ${AI_PROVIDER_NAMES.join(', ')}`,
  );
}

function isAiProviderName(
  providerName: string,
): providerName is AiProviderName {
  return AI_PROVIDER_NAMES.includes(providerName as AiProviderName);
}

function assertOpenAiProviderConfigured(provider: AiProvider): void {
  if (isConfigurableAiProvider(provider)) {
    provider.assertConfigured();
  }
}

function isConfigurableAiProvider(
  provider: AiProvider,
): provider is ConfigurableAiProvider {
  return 'assertConfigured' in provider;
}
