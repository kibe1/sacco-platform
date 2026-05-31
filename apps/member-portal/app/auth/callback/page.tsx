type CallbackPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MemberAuthCallbackPage({ searchParams }: CallbackPageProps) {
  const params = (await searchParams) ?? {};
  const code = typeof params.code === "string" ? params.code : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <main className="shell">
      <p className="eyebrow">Authentication</p>
      <h1>Member sign-in callback</h1>
      <section className="card">
        {error ? (
          <>
            <p>Keycloak returned an error.</p>
            <strong>{error}</strong>
          </>
        ) : (
          <>
            <p>{code ? "Keycloak returned an authorization code." : "No authorization code received."}</p>
            <strong>Next: exchange this code through auth-service and load member context.</strong>
          </>
        )}
      </section>
    </main>
  );
}
