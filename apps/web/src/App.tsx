import { useHealthQuery } from './features/health/useHealthQuery';

export default function App() {
  const { data, isLoading, isError, error } = useHealthQuery();

  return (
    <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <h1>AI Debug Assistant</h1>

      <p>
        Paste an error, stack trace, or log and get a structured explanation.
      </p>

      <section>
        <h2>API Status</h2>

        {isLoading && <p>Checking API...</p>}

        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}

        {isError && (
          <p style={{ color: 'crimson' }}>
            {error instanceof Error ? error.message : 'Failed to load API status'}
          </p>
        )}
      </section>
    </main>
  );
}