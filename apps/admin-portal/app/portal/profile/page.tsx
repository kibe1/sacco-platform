async function getTheme() {
  const res = await fetch(process.env.API_URL + '/api/v1/portal/theme', { cache: 'no-store' });
  return res.json();
}
export default async function PortalThemePage() {
  const theme = await getTheme();
  return (
    <main style={{fontFamily:'Arial',padding:30}}>
      <h1>Customer Portal Profile Theme</h1>
      <p style={{color:'#00a651',fontWeight:700}}>✔ Theme values are loaded from API and prepared for profile-based customization.</p>
      <div style={{display:'grid',gap:16,maxWidth:700}}>
        {Object.entries(theme).map(([k,v])=>(
          <label key={k} style={{display:'grid',gap:6}}>
            <strong>{k}</strong>
            <input defaultValue={String(v)} style={{padding:12,border:'1px solid #ccc',borderRadius:6}}/>
          </label>
        ))}
        <button style={{background:theme.accentColor,color:'#fff',border:0,padding:'12px 18px',borderRadius:6,fontSize:18}}>Save Theme</button>
      </div>
    </main>
  )
}
