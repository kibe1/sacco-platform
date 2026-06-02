
export function PortalTopBar() {
  return <header style={{height:82,background:'#382d28',color:'#fff',display:'flex',alignItems:'center',padding:'0 26px',gap:24}}>
    <div style={{display:'flex',alignItems:'center',gap:9,fontSize:24,fontWeight:800}}>
      <span style={{fontSize:28}}>✣</span><span style={{background:'#f00',width:76,height:28,borderRadius:6,display:'inline-block'}}></span>
      <span>CONNECT<span style={{color:'#39b5df'}}>PLUS</span></span>
    </div>
    <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:28,fontSize:22}}>
      <span>⌕</span><span>▢</span><span>✉</span><span>♢<sup style={{background:'#f44336',borderRadius:'50%',fontSize:12,padding:'2px 5px'}}>24</sup></span>
      <span style={{fontSize:18}}>English⌄</span><span style={{width:42,height:42,borderRadius:'50%',background:'#eee',display:'inline-block'}}></span><span>⌄</span>
    </div>
  </header>
}
