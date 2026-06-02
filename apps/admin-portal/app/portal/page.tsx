async function getJson(path: string) {
  const res = await fetch(process.env.API_URL + path, { cache: 'no-store' });
  return res.json();
}

function Sidebar({theme}: any) {
  const items = [
    ['⌂','Home','/portal'],
    ['▣','Account Services','/portal/account-services'],
    ['▤','Payments','/portal/payments'],
    ['♧','Custodial Services','#'],
    ['▧','Information Reports','/portal/reports'],
  ];
  const bottom = [
    ['▢','My Pending Tasks','#'],
    ['♢','Alerts & Notifications','#'],
    ['?','Help','#'],
    ['↩','Logout','#'],
  ];
  return (
    <aside style={{width:360,background:theme.sidebarColor,color:'#fff',position:'fixed',left:0,top:0,bottom:0,zIndex:2}}>
      <div style={{height:86,display:'flex',alignItems:'center',gap:12,padding:'0 22px',fontSize:25,fontWeight:800}}>
        <span style={{fontSize:30}}>✣</span><span style={{background:'#f00',width:70,height:25,display:'inline-block'}}></span><span>CONNECT<span style={{color:'#39b5df'}}>PLUS</span></span>
      </div>
      <nav>
        {items.map((i,idx)=>(
          <a key={i[1]} href={i[2]} style={{display:'flex',alignItems:'center',gap:24,padding:'22px 24px',fontSize:22,color:'#fff',textDecoration:'none',background:idx===0?theme.accentColor:'transparent'}}>
            <span style={{fontSize:24,width:28}}>{i[0]}</span><span>{i[1]}</span>
          </a>
        ))}
      </nav>
      <div style={{position:'absolute',left:0,right:0,bottom:0,borderTop:'1px solid rgba(255,255,255,.45)',padding:'18px 0'}}>
        {bottom.map(i=>(
          <a key={i[1]} href={i[2]} style={{display:'flex',alignItems:'center',gap:24,padding:'14px 24px',fontSize:22,color:'#fff',textDecoration:'none'}}>
            <span style={{fontSize:24,width:28}}>{i[0]}</span><span>{i[1]}</span>
          </a>
        ))}
      </div>
    </aside>
  );
}

function TopBar({theme}: any) {
  return (
    <header style={{height:86,background:theme.primaryColor,color:'#fff',marginLeft:360,display:'flex',alignItems:'center',padding:'0 32px',gap:30}}>
      <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:28,fontSize:24}}>
        <span>⌕</span><span>▢</span><span>✉</span><span>♢<sup style={{background:'#f44336',borderRadius:'50%',fontSize:13,padding:'2px 6px'}}>24</sup></span>
        <span style={{fontSize:18}}>English⌄</span>
        <span style={{width:48,height:48,borderRadius:'50%',background:'#eee',display:'inline-block'}}></span><span>⌄</span>
      </div>
    </header>
  );
}

function EntitlementCard({text}: any) {
  return <div style={{height:185,border:'1px solid #d6d6d6',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{text}</div>
}

function Announcement({items}: any) {
  return (
    <div style={{height:185,border:'1px solid #c5d3db',background:'#dff4ff',padding:16,fontSize:22,position:'relative'}}>
      <strong style={{display:'block',fontSize:24,marginBottom:8}}>{items[0]?.title || 'Announcement'}</strong>
      <div>{items[0]?.message || 'No announcement'}</div>
      <div style={{position:'absolute',right:18,bottom:10,fontSize:28}}>● ›</div>
    </div>
  )
}

function OverdraftCard({summary}: any) {
  return (
    <div style={{background:'#fff',border:'1px solid #ddd',height:410,padding:24,position:'relative'}}>
      <div style={{position:'absolute',top:8,left:'50%',fontSize:28,color:'#aaa'}}>═</div>
      <h2>Overdraft Limits</h2>
      <div style={{display:'flex',justifyContent:'center',marginTop:25}}>
        <div style={{width:140,height:140,borderRadius:'50%',border:'22px solid #ecc3e5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:700}}>0%</div>
      </div>
      <div style={{textAlign:'center',fontSize:18,marginTop:12}}>Utilized</div>
      <div style={{position:'absolute',bottom:45,left:45,color:'#7b8491',fontSize:20}}>Available Limits ⓘ</div>
      <div style={{position:'absolute',bottom:18,left:85,color:'#50aeea',fontSize:24}}>{summary.availableLimits.toFixed(2)} KES</div>
      <div style={{position:'absolute',bottom:22,right:30,fontSize:28}}>⟳ ›</div>
    </div>
  )
}

function PendingTasks() {
  return (
    <div style={{background:'#fff',border:'1px solid #ddd',height:410,padding:24}}>
      <div style={{textAlign:'right',color:'#aaa',fontSize:28}}>═</div>
      <h2>My Pending Tasks</h2>
      <div style={{height:250,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontSize:22}}>
        <div style={{fontSize:58,color:'#999'}}>⚠</div>
        <div>No action items pending on me</div>
        <button style={{marginTop:28,border:'1px solid #1683ff',background:'#fff',borderRadius:6,padding:'7px 18px',fontSize:18}}>⟳ Refresh</button>
      </div>
    </div>
  )
}

export default async function CustomerPortalPage() {
  const summary = await getJson('/api/v1/portal/customer-summary');
  const announcements = await getJson('/api/v1/portal/announcements');
  const theme = await getJson('/api/v1/portal/theme');
  return (
    <div style={{background:'#fff',minHeight:'100vh',fontFamily:'Arial, Helvetica, sans-serif',color:'#111'}}>
      <Sidebar theme={theme}/>
      <TopBar theme={theme}/>
      <main style={{marginLeft:360}}>
        <div style={{height:78,display:'flex',alignItems:'center',padding:'0 28px',borderBottom:'1px solid #ddd',fontSize:20}}>
          <span>Balance in <strong>{summary.availableBalance.toLocaleString()}</strong>⌄</span>
          <span style={{marginLeft:28}}>KES⌄</span>
          <span style={{marginLeft:'auto',color:'#1683ff',fontSize:24}}>Quick Actions⌄</span>
        </div>

        <section style={{padding:22}}>
          <div style={{border:'1px solid #d6d6d6',height:54,display:'flex',alignItems:'center',padding:'0 18px',fontSize:20}}>
            <strong>Assets : {summary.assets.toLocaleString()} KES</strong>
            <div style={{height:14,background:'#47c1bd',borderRadius:10,flex:1,margin:'0 18px',maxWidth:300}}></div>
            <strong>Liabilities : {summary.liabilities.toLocaleString()} KES</strong>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:20,marginTop:20}}>
            <EntitlementCard text="You are not entitled for Deposit"/>
            <EntitlementCard text="You are not entitled for Loan"/>
            <EntitlementCard text="You are not entitled for Card"/>
            <Announcement items={announcements}/>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1.25fr .9fr 1.9fr',gap:20,marginTop:20}}>
            <div style={{background:'#fff',border:'1px solid #ddd',height:410,padding:24}}>
              <div style={{textAlign:'right',color:'#aaa',fontSize:28}}>═</div>
              <h2>Balance Overview</h2>
              <div style={{fontSize:24,marginTop:45}}>{summary.assets.toLocaleString()} KES</div>
              <svg width="100%" height="210" viewBox="0 0 420 210">
                <line x1="30" y1="60" x2="400" y2="60" stroke="#eee"/>
                <line x1="30" y1="120" x2="400" y2="120" stroke="#eee"/>
                <rect x="70" y="75" width="150" height="135" fill="#47c1bd" rx="3"/>
                <line x1="30" y1="210" x2="400" y2="210" stroke="#555"/>
                <text x="80" y="205" fontSize="12">9591670018</text>
              </svg>
            </div>
            <OverdraftCard summary={summary}/>
            <PendingTasks/>
          </div>
        </section>
      </main>
    </div>
  );
}
// ✔ V13: customer/member portal aligned to target screenshot and themeable via profile.
