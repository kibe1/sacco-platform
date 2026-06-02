export default function SessionTimeoutPage() {
  return (
    <main style={{
      minHeight:'100vh',
      background:'#fafafa',
      fontFamily:'Arial, Helvetica, sans-serif'
    }}>
      <div style={{
        height:58,
        background:'#000',
        width:'100%'
      }}></div>

      <section style={{
        display:'flex',
        justifyContent:'center',
        alignItems:'flex-start',
        paddingTop:100
      }}>
        <div style={{
          width:430,
          height:320,
          background:'#fff',
          border:'1px solid #e5e5e5',
          borderRadius:28,
          boxShadow:'0 2px 4px rgba(0,0,0,.16)',
          display:'flex',
          flexDirection:'column',
          alignItems:'center',
          justifyContent:'center',
          gap:95
        }}>
          <div style={{
            border:'18px solid #ff0808',
            borderRadius:8,
            padding:'14px 18px',
            fontSize:17,
            fontWeight:500,
            background:'#fff'
          }}>
            Your session has timed out. Please login again
          </div>

          <a href="/portal/login" style={{
            width:320,
            height:45,
            background:'#ffe300',
            color:'#000',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            textDecoration:'none',
            fontSize:17,
            fontWeight:700
          }}>
            Login Again
          </a>
        </div>
      </section>
    </main>
  );
}
// ✔ V16: session-timeout page aligned to provided screenshot.
