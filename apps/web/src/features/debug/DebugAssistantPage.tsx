import { useMemo, useState, type FormEvent } from 'react';

import { useHealthQuery } from '../health/useHealthQuery';
import { useAnalyzeDebugMutation } from './hooks/useAnalyzeDebugMutation';
import { DEBUG_CONTEXTS, type DebugContext } from './types';

const contextLabels: Record<DebugContext, string> = {
  react: 'React',
  node: 'Node.js',
  nestjs: 'NestJS',
  typescript: 'TypeScript',
  general: 'General',
};

const exampleError =
  'TypeError: Cannot read properties of undefined\n    at UserCard (src/features/users/UserCard.tsx:18:24)';

export function DebugAssistantPage() {
  const [errorText, setErrorText] = useState(exampleError);
  const [context, setContext] = useState<DebugContext>('react');

  const healthQuery = useHealthQuery();
  const analyzeMutation = useAnalyzeDebugMutation();

  const trimmedErrorText = errorText.trim();
  const canSubmit = trimmedErrorText.length >= 10 && !analyzeMutation.isPending;

  const apiStatusLabel = useMemo(() => {
    if (healthQuery.isLoading) {
      return 'Checking API';
    }

    if (healthQuery.isError) {
      return 'API unavailable';
    }

    return 'API online';
  }, [healthQuery.isError, healthQuery.isLoading]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    analyzeMutation.mutate({
      context,
      errorText: trimmedErrorText,
    });
  }

  return (
    <main className="mx-auto min-h-screen w-[min(1180px,calc(100vw-32px))] py-8 text-slate-800 max-[860px]:w-[min(calc(100%_-_20px),720px)] max-[860px]:py-5">
      <header className="mb-6 flex items-start justify-between gap-6 max-[860px]:grid">
        <div>
          <h1 className="m-0 text-[34px] leading-tight font-bold text-slate-950">
            AI Debug Assistant
          </h1>
          <p className="mt-2.5 max-w-[680px] text-base leading-6 text-slate-600">
            Paste an error, log, or stack trace and get structured debugging guidance.
          </p>
        </div>

        <div
          className={`inline-flex min-h-[34px] items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[13px] font-semibold whitespace-nowrap ${
            healthQuery.isError
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              healthQuery.isError ? 'bg-red-500' : 'bg-emerald-500'
            }`}
            aria-hidden="true"
          />
          {apiStatusLabel}
        </div>
      </header>

      <section className="grid grid-cols-[minmax(340px,0.9fr)_minmax(420px,1.1fr)] items-start gap-5 max-[860px]:grid-cols-1">
        <form
          className="min-h-[620px] rounded-lg border border-slate-300 bg-white p-5 shadow-[0_16px_38px_rgb(15_23_42/0.07)] max-[860px]:min-h-0"
          onSubmit={handleSubmit}
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="m-0 text-lg font-bold text-slate-950">Debug Input</h2>
            <span className="text-[13px] text-slate-500">
              {trimmedErrorText.length} chars
            </span>
          </div>

          <label className="mb-4 grid gap-2">
            <span className="text-[13px] font-bold text-slate-700">Context</span>
            <select
              className="h-[42px] w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15"
              value={context}
              onChange={(event) => setContext(event.target.value as DebugContext)}
            >
              {DEBUG_CONTEXTS.map((debugContext) => (
                <option key={debugContext} value={debugContext}>
                  {contextLabels[debugContext]}
                </option>
              ))}
            </select>
          </label>

          <label className="mb-4 grid gap-2">
            <span className="text-[13px] font-bold text-slate-700">
              Error / Log / Stack Trace
            </span>
            <textarea
              className="min-h-[360px] w-full resize-y rounded-lg border border-slate-300 bg-white p-3 font-mono text-[13px] leading-6 text-slate-950 outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 max-[860px]:min-h-[280px]"
              value={errorText}
              onChange={(event) => setErrorText(event.target.value)}
              spellCheck={false}
              rows={14}
            />
          </label>

          <button
            className="min-h-11 w-full cursor-pointer rounded-lg bg-blue-700 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            type="submit"
            disabled={!canSubmit}
          >
            {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze'}
          </button>

          {trimmedErrorText.length > 0 && trimmedErrorText.length < 10 && (
            <p className="mt-3 text-[13px] text-amber-800">
              Enter at least 10 characters.
            </p>
          )}
        </form>

        <section
          className="min-h-[620px] rounded-lg border border-slate-300 bg-white p-5 shadow-[0_16px_38px_rgb(15_23_42/0.07)] max-[860px]:min-h-0"
          aria-live="polite"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="m-0 text-lg font-bold text-slate-950">Analysis</h2>
            {analyzeMutation.data && (
              <span className="text-[13px] text-slate-500">{contextLabels[context]}</span>
            )}
          </div>

          {!analyzeMutation.data && !analyzeMutation.isPending && !analyzeMutation.isError && (
            <div className="grid min-h-[500px] place-content-center text-center">
              <h3 className="mb-2 text-lg font-bold text-slate-950">No analysis yet</h3>
              <p className="mx-auto max-w-[360px] leading-6 text-slate-500">
                Submit a trace to see the structured result from the API.
              </p>
            </div>
          )}

          {analyzeMutation.isPending && (
            <div className="grid min-h-[500px] place-content-center text-center">
              <h3 className="mb-2 text-lg font-bold text-slate-950">Analyzing</h3>
              <p className="mx-auto max-w-[360px] leading-6 text-slate-500">
                Preparing summary, likely cause, fix, and checklist.
              </p>
            </div>
          )}

          {analyzeMutation.isError && (
            <div className="grid min-h-[500px] place-content-center text-center">
              <h3 className="mb-2 text-lg font-bold text-red-800">Request failed</h3>
              <p className="mx-auto max-w-[360px] leading-6 text-red-800">
                {analyzeMutation.error instanceof Error
                  ? analyzeMutation.error.message
                  : 'Failed to analyze the submitted input.'}
              </p>
            </div>
          )}

          {analyzeMutation.data && (
            <div className="grid gap-3.5">
              <ResultBlock title="Summary" content={analyzeMutation.data.summary} />
              <ResultBlock
                title="Possible Cause"
                content={analyzeMutation.data.possibleCause}
              />
              <ResultBlock
                title="Suggested Fix"
                content={analyzeMutation.data.suggestedFix}
              />

              {analyzeMutation.data.codeExample && (
                <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-2 text-sm font-bold text-slate-950">Code Example</h3>
                  <pre className="m-0 overflow-x-auto rounded-lg bg-slate-950 p-3 text-[13px] leading-6 text-blue-100">
                    <code>{analyzeMutation.data.codeExample}</code>
                  </pre>
                </section>
              )}

              <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="mb-2 text-sm font-bold text-slate-950">Checklist</h3>
                <ul className="m-0 list-disc pl-4 text-sm leading-6 text-slate-700">
                  {analyzeMutation.data.checklist.map((item) => (
                    <li className="mt-1.5 first:mt-0" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

type ResultBlockProps = {
  title: string;
  content: string;
};

function ResultBlock({ title, content }: ResultBlockProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="mb-2 text-sm font-bold text-slate-950">{title}</h3>
      <p className="m-0 text-sm leading-6 text-slate-700">{content}</p>
    </section>
  );
}
