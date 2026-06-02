async function getAccounts() {
  const res = await fetch(process.env.API_URL + '/api/v1/portal/accounts', { cache: 'no-store' });
  return res.json();
}

function MiniSidebar() {
  const items = [['⌂','/portal'],['▣','/portal/account-services'],['▤','/portal/payments'],['♧','#'],['▧','/portal/reports']];
  const bottom = ['▢','♢','?','↩'];
  return <aside style={{position:'fixed',top:82,bottom:0,left:0,width:64,background:'#382d28',color:'#fff',zIndex:2}}>
    {items.map((i,idx)=><a key={i[0]} href={i[1]} style={{height:58,display:'flex',alignItems:'center',justifyContent:'center',fontSize:25,color:'#fff',textDecoration:'none',background:idx===1?'#39b5df':'transparent'}}>{i[0]}</a>)}
    <div style={{position:'absolute',bottom:0,left:0,right:0,borderTop:'1px solid rgba(255,255,255,.45)'}}>
      {bottom.map(x=><div key={x} style={{height:58,display:'flex',alignItems:'center',justifyContent:'center',fontSize:25}}>{x}</div>)}
    </div>
  </aside>
}

function Header() {
  return <header style={{height:82,background:'#382d28',color:'#fff',display:'flex',alignItems:'center',padding:'0 26px',gap:24}}>
    <div style={{display:'flex',alignItems:'center',gap:9,fontSize:24,fontWeight:800}}>
      <span style={{fontSize:28}}>✣</span><span style={{background:'#f00',width:76,height:28,borderRadius:6,display:'inline-block'}}></span><span>CONNECT<span style={{color:'#39b5df'}}>PLUS</span></span>
    </div>
    <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:28,fontSize:22}}>
      <span>⌕</span><span>▢</span><span>✉</span><span>♢<sup style={{background:'#f44336',borderRadius:'50%',fontSize:12,padding:'2px 5px'}}>24</sup></span><span style={{fontSize:18}}>English⌄</span><span style={{width:42,height:42,borderRadius:'50%',background:'#eee',display:'inline-block'}}></span><span>⌄</span>
    </div>
  </header>
}

function QuickLinks() {
  const view = ['Account Services','Service Requests','Cheque Status','Overdraft Limit','Account Nickname'];
  const init = ['Generate Statement','Book Deposit','Cheque Book Request','Generic Service Request','New Account Request','Add Nickname','Stop Payment Cheque'];
  return <aside style={{background:'#dff4ff',border:'1px solid #c8dde8',padding:28,minHeight:610,fontSize:20,position:'relative'}}>
    <div style={{position:'absolute',left:-25,top:40,width:48,height:48,borderRadius:'50%',background:'#fff',border:'1px solid #ccc',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30}}>›</div>
    <h2>Quick Links <span style={{float:'right'}}>?</span></h2>
    <strong>⊙ View</strong>
    <ul>{view.map(x=><li key={x} style={{margin:'16px 0'}}>{x}</li>)}</ul>
    <hr/>
    <strong>✐ Initiate</strong>
    <ul>{init.map(x=><li key={x} style={{margin:'16px 0'}}>{x}</li>)}</ul>
    <div style={{textAlign:'right',fontWeight:700}}>Show Less⌃</div>
  </aside>
}

export default async function AccountServicesPage() {
  const accounts = await getAccounts();
  return <main style={{fontFamily:'Arial, Helvetica, sans-serif',background:'#fafafa',minHeight:'100vh'}}>
    <Header/><MiniSidebar/>
    <section style={{marginLeft:64}}>
      <div style={{background:'#fff',height:76,display:'flex',alignItems:'center',padding:'0 22px',borderBottom:'1px solid #ddd'}}><h1>Account Services</h1></div>
      <div style={{height:62,display:'flex',alignItems:'center',paddingLeft:44,borderBottom:'1px solid #ddd',fontSize:18}}><strong>Current & Savings (1)</strong></div>
      <div style={{padding:28,display:'grid',gridTemplateColumns:'1fr 310px',gap:32}}>
        <section style={{background:'#fff',border:'1px solid #ddd',padding:24,minHeight:610}}>
          <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:20}}>
            <button style={{background:'#fff',border:'1px solid #ddd',padding:'10px 18px',fontSize:18}}>□ Group By</button>
            <input placeholder="Search for Accounts" style={{marginLeft:'auto',width:520,padding:'11px',fontSize:18,border:'1px solid #ddd'}}/>
            <button style={{padding:10}}>⟳</button><button style={{padding:10}}>↓</button><button style={{padding:10}}>▣</button>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:18}}>
            <thead><tr style={{borderTop:'1px solid #ddd',borderBottom:'1px solid #ddd'}}>
              {['Accounts','Entity','Type','Available Balance','Available Balance [in KES]','Total Balance','Action'].map(h=><th key={h} align="left" style={{padding:12}}>{h} ↕</th>)}
            </tr></thead>
            <tbody>{accounts.map((a:any)=><tr key={a.accountNo} style={{borderBottom:'1px solid #ddd',verticalAlign:'top'}}>
              <td style={{padding:14}}><span style={{background:'#f00',color:'#f00',borderRadius:8}}>XXXXX</span>{a.accountNo}<br/>{a.accountName}</td>
              <td style={{padding:14}}><span style={{background:'#f00',color:'#f00',borderRadius:8}}>XXXXX</span><br/>{a.entity}</td>
              <td style={{padding:14}}><span style={{background:'#f00',color:'#f00',borderRadius:8}}>XXXXX</span><br/>{a.type}</td>
              <td style={{padding:14,textAlign:'center'}}>{a.availableBalance.toLocaleString()}<br/><span style={{background:'#eee',borderRadius:16,padding:'5px 22px',fontSize:13}}>KES</span></td>
              <td style={{padding:14,textAlign:'center'}}>{a.availableBalance.toLocaleString()}</td>
              <td style={{padding:14,textAlign:'center'}}>{a.totalBalance.toLocaleString()}<br/><span style={{background:'#eee',borderRadius:16,padding:'5px 22px',fontSize:13}}>KES</span></td>
              <td style={{padding:14,fontSize:26}}>⇆ &nbsp;▧ &nbsp;⋮</td>
            </tr>)}</tbody>
          </table>
          <div style={{marginTop:300,fontSize:18}}>Displaying 1 - 1 of 1 Accounts <span style={{float:'right',color:'#777'}}>Items per page&nbsp; 100⌄ &nbsp;&nbsp; Page 1 of 1 ‹ ›</span></div>
        </section>
        <QuickLinks/>
      </div>
    </section>
  </main>
}
// ✔ V15: Account Services customer portal screen matching provided screenshots.
