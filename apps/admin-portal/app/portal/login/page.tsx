async function getConfig() {
  const res = await fetch(process.env.API_URL + '/api/v1/portal/login-config', { cache: 'no-store' });
  return res.json();
}

export default async function PortalLoginPage() {
  const cfg = await getConfig();
  return (
    <main style={{
      minHeight:'100vh',
      fontFamily:'Arial, Helvetica, sans-serif',
      background:'#ddd',
      overflow:'hidden'
    }}>
      <header style={{
        height:88,
        background:cfg.primaryColor,
        color:'#fff',
        display:'flex',
        alignItems:'center',
        padding:'0 70px',
        position:'relative',
        zIndex:2
      }}>
        <div style={{display:'flex',alignItems:'center',gap:12,fontSize:26,fontWeight:800}}>
          <span style={{fontSize:34}}>✣</span>
          <span style={{background:'#f00',width:72,height:26,borderRadius:5,display:'inline-block'}}></span>
          <span>CONNECT<span style={{color:cfg.accentColor}}>PLUS</span></span>
        </div>
        <nav style={{marginLeft:'auto',display:'flex',gap:46,fontSize:18,alignItems:'center'}}>
          <span>{cfg.language}⌄</span>
          <span>{cfg.contactLabel}</span>
        </nav>
      </header>

      <section style={{
        minHeight:'calc(100vh - 88px)',
        position:'relative',
        background:'linear-gradient(rgba(255,255,255,.18),rgba(255,255,255,.18)), radial-gradient(circle at 20% 35%, #777 0, #bbb 34%, #eee 35%, #ccc 60%, #888 100%)',
        filter:'grayscale(1)',
      }}>
        <div style={{
          position:'absolute',
          inset:0,
          background:'linear-gradient(90deg, rgba(255,255,255,.15), rgba(255,255,255,.45), rgba(255,255,255,.08))'
        }}></div>

        <div style={{
          position:'relative',
          paddingTop:190,
          display:'flex',
          justifyContent:'center',
          filter:'grayscale(0)'
        }}>
          <div style={{
            width:800,
            minHeight:430,
            background:'rgba(255,255,255,.88)',
            boxShadow:'0 8px 24px rgba(0,0,0,.18)',
            padding:'34px 48px',
            position:'relative'
          }}>
            <div style={{
              position:'absolute',
              top:0,
              left:0,
              width:160,
              height:14,
              background:cfg.primaryColor
            }}></div>

            <h1 style={{fontSize:28,margin:'0 0 10px',fontWeight:800}}>{cfg.welcomeTitle}</h1>
            <p style={{fontSize:26,lineHeight:1.18,margin:'0 0 28px'}}>
              <span style={{background:'#f00',width:72,height:29,borderRadius:7,display:'inline-block',verticalAlign:'middle',marginRight:8}}></span>
              {cfg.welcomeText.replace('ConnectPlus ', '')}
            </p>

            <div style={{height:1,background:'#222',margin:'0 0 30px'}}></div>

            <form action="/portal" style={{display:'grid',gap:12}}>
              <label style={{fontSize:18,fontWeight:800}}>Username</label>
              <input name="username" placeholder="Enter Username" style={{
                height:50,
                border:'1px solid #ddd',
                background:'#fff',
                fontSize:22,
                padding:'0 14px',
                outline:'none'
              }}/>
              <button type="submit" style={{
                height:56,
                marginTop:28,
                border:0,
                background:cfg.buttonColor,
                color:'#000',
                fontSize:22,
                fontWeight:800,
                cursor:'pointer'
              }}>Go for it</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
// ✔ V14: customer portal login screen aligned to provided ConnectPlus-style screenshot.
