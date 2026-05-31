type CallbackPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminAuthCallbackPage({ searchParams }: CallbackPageProps) {
  const params = (await searchParams) ?? {};
  const code = typeof params.code === "string" ? params.code : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <main className="content">
      <p className="eyebrow">Authentication</p>
      <h2>Admin sign-in callback</h2>
      <div className="panel">
        {error ? (
          <>
            <strong>Keycloak returned an error</strong>
            <p>{error}</p>
          </>
        ) : (
          <>
            <strong>{code ? "Keycloak returned an authorization code" : "No authorization code received"}</strong>
            <p>
              The next implementation step is exchanging this code through the backend auth-service, then loading the
              current user and tenant context.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
