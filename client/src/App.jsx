import {lazy,Suspense,useEffect,useLayoutEffect,useRef,useState} from 'react'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {Link2,Menu,X,ChevronDown,Copy,Check,ArrowRight} from 'lucide-react'
gsap.registerPlugin(ScrollTrigger)
const Hero3D=lazy(()=>import('./Hero3D.jsx'))
const API=import.meta.env.VITE_API_URL||''
const APP=import.meta.env.VITE_APP_URL||'#demo'
const NAV=[['Product','#product'],['Solutions','#usecases'],['How it works','#journey'],['Analytics','#analytics'],['Security','#security']]
const SAMPLE={clicks:[12,18,15,26,31,24,38],days:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  ref:[['Newsletter',42],['Social',31],['Direct / QR',19],['Other',8]],dev:[['Mobile',58],['Desktop',34],['Tablet',8]],
  top:[['/spring-sale',184],['/docs-launch',121],['/event-qr',96]],camp:[['Spring launch',212],['Product docs',148],['Events',96]]}
const Tag=()=> <span className="sample">Sample data — not real customer metrics</span>
const Btn=({href,variant='primary',children})=> <a className={`btn ${variant}`} href={href}>{children}</a>

function Navbar(){
  const [s,setS]=useState(false),[o,setO]=useState(false)
  useEffect(()=>{const f=()=>setS(scrollY>40);f();addEventListener('scroll',f,{passive:true});return()=>removeEventListener('scroll',f)},[])
  return <header className={`nav ${s?'solid':''}`}><div className="wrap navin">
    <a href="#top" className="brand"><span className="logo"><Link2 size={18}/></span>LinkPulse</a>
    <nav id="menu" className={o?'open':''} aria-label="Primary">{NAV.map(([n,h])=> <a key={n} href={h} onClick={()=>setO(false)}>{n}</a>)}
      
      <a className="mob" href="/user/login" onClick={() => setO(false)}>
            Sign in
      </a>
  
      </nav>
    <div className="navact"><a className="signin" href="/user/login">Sign in</a><Btn href="demp">Create a free link</Btn>
      <button className="burger" aria-label="Toggle menu" aria-expanded={o} aria-controls="menu" onClick={()=>setO(!o)}>{o?<X/>:<Menu/>}</button></div>
  </div></header>
}
function Hero(){
  const [fail,setFail]=useState(false)
  return <section className="hero" id="top"><div className="wrap herogrid">
    <div className="herotxt">
      <p className="eyebrow hl">Link management · Redirect rules · Analytics</p>
      <h1 className="hl">Every link has a <em>bigger story.</em></h1>
      <p className="lead hl">Create smarter short links, control every destination, and turn every click into insight.</p>
      <div className="cta hl"><Btn href="#demo">Create your first link <ArrowRight size={18}/></Btn><Btn href="#journey" variant="ghost">Explore the platform</Btn></div>
    </div>
    <div className="herovis">{fail?<div className="ring" aria-hidden="true"/>:
      <Suspense fallback={<div className="ring" aria-hidden="true"/>}><Hero3D onFail={()=>setFail(true)}/></Suspense>}</div>
  </div></section>
}
function Problem(){
  return <section className="light" id="product"><div className="wrap split">
    <div><p className="eyebrow">The problem</p><h2 className="rv">A short link is only the beginning.</h2>
      <ul className="plain">{['Links get hard to organise across campaigns.','Teams need to see where traffic comes from.','Shared links may need expiry, access limits or emergency deactivation.','Raw click counts don’t explain performance.'].map(t=> <li className="rv" key={t}>{t}</li>)}</ul></div>
    <div className="urlviz rv" aria-label="A long URL becoming a short link">
      <code className="long">https://example.com/products/spring-collection?utm_source=newsletter&amp;utm_medium=email&amp;utm_campaign=spring</code>
      <svg viewBox="0 0 20 40" width="20" height="40" aria-hidden="true"><path className="draw" d="M10 0v34M4 28l6 8 6-8" fill="none" stroke="#D98252" strokeWidth="2"/></svg>
      <code className="short">lpls.example/spring</code><small>Illustrative domain</small></div>
  </div></section>
}
const STAGES=[['01','Create','Create a short link with an automatically generated code or a custom alias.'],['02','Control','Configure applicable rules: expiry, click limits and password protection.'],['03','Redirect','Check the link’s status and rules before sending visitors to the destination.'],['04','Understand','Record click events and turn them into useful analytics.']]
function Journey(){
  const r=useRef(null),[a,setA]=useState(0)
  useLayoutEffect(()=>{
    const mm=gsap.matchMedia(),ctx=gsap.context(()=>{
      mm.add('(prefers-reduced-motion: no-preference)',()=>{
        const p=r.current.querySelector('.jpath'),L=p.getTotalLength()
        gsap.set(p,{strokeDasharray:L,strokeDashoffset:L})
        gsap.to(p,{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:r.current.querySelector('.jstages'),start:'top 70%',end:'bottom 60%',scrub:.6,
          onUpdate:s=>setA(Math.min(3,Math.floor(s.progress*4.0)))}})
      })
    },r);return()=>{mm.revert();ctx.revert()}},[])
  return <section className="dark" id="journey" ref={r}><div className="wrap">
    <p className="eyebrow">The link journey</p><h2 className="rv">From one link to a complete picture.</h2>
    <div className="jstages"><svg className="jline" viewBox="0 0 4 100" preserveAspectRatio="none" aria-hidden="true"><path d="M2 0V100" stroke="#ffffff22" strokeWidth=".3" fill="none"/><path className="jpath" d="M2 0V100" stroke="#79A99B" strokeWidth=".5" fill="none" vectorEffect="non-scaling-stroke"/></svg>
      {STAGES.map(([n,t,d],i)=> <article key={n} className={`stage ${i<=a?'on':''}`}><span className="num">{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
  </div></section>
}
function Features(){
  const F=[['Smart link management','Generate short codes or custom aliases, edit and organise links, see current status.','wide'],['Rules and access','Expiry dates, click limits and password protection drive the redirect.',''],
   ['Campaigns & organisation','Group links by campaign and tag; compare campaign totals.',''],['QR codes','Generate downloadable QR codes for links.',''],
   ['Bulk import','Import CSV files; invalid rows and duplicates are flagged before import.',''],['Safety & governance','Admins can disable abusive links; disabled links keep their analytics.','wide']]
  return <section className="light2"><div className="wrap"><p className="eyebrow">Capabilities</p><h2 className="rv">Everything your links need. One connected workspace.</h2>
    <div className="fgrid">{F.map(([t,d,c],i)=> <article key={t} className={`fcell rv ${c} ${i%3===0?'inv':''}`}><h3>{t}</h3><p>{d}</p></article>)}</div>
    <p className="note">LinkPulse is a hackathon project: QR, bulk import and admin tools are part of the product scope — connect them to your backend as they are implemented.</p></div></section>
}
const URLRE=/^https?:\/\/[^\s/$.?#].[^\s]*$/i
function Demo(){
  const [tab,setTab]=useState('create'),[url,setUrl]=useState(''),[alias,setAlias]=useState(''),[err,setErr]=useState({}),[res,setRes]=useState(null),[busy,setBusy]=useState(false),[cp,setCp]=useState(false)
  const body=useRef(null)
  useEffect(()=>{if(body.current&&!matchMedia('(prefers-reduced-motion: reduce)').matches)gsap.fromTo(body.current,{opacity:0,y:12},{opacity:1,y:0,duration:.45,ease:'power3.out'})},[tab])
  async function submit(e){
    e.preventDefault();const er={}
    if(!URLRE.test(url.trim()))er.url='Enter a full URL starting with http:// or https://'
    if(alias&&!/^[A-Za-z0-9_-]{3,32}$/.test(alias))er.alias='Alias: 3–32 letters, numbers, - or _'
    setErr(er);setRes(null);if(Object.keys(er).length)return
    if(!API){setRes({demo:true});return}
    setBusy(true)
    try{const r=await fetch(`${API}/api/links`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({destination:url.trim(),alias:alias||undefined})})
      const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.message||`Request failed (${r.status})`)
      setRes({short:j.shortUrl})}catch(x){setErr({form:x.message})}finally{setBusy(false)}
  }
  const copy=async()=>{try{await navigator.clipboard.writeText(res.short);setCp(true);setTimeout(()=>setCp(false),1500)}catch{}}
  return <section className="dark2" id="demo"><div className="wrap"><p className="eyebrow">Interactive demo</p><h2 className="rv">See the journey behind a click.</h2>
    <div className="browser rv"><div className="chrome"><i/><i/><i/><span>linkpulse / workspace</span></div>
      <div className="tabs" role="tablist">{[['create','Create a link'],['analytics','View analytics'],['rules','Review rules']].map(([k,l])=>
        <button key={k} role="tab" aria-selected={tab===k} className={tab===k?'act':''} onClick={()=>setTab(k)}>{l}</button>)}</div>
      <div className="pane" ref={body} role="tabpanel">
      {tab==='create'&&<form onSubmit={submit} noValidate>
        <label>Destination URL<input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/long/page" aria-invalid={!!err.url}/></label>{err.url&&<p className="err" role="alert">{err.url}</p>}
        <label>Custom alias (optional)<input value={alias} onChange={e=>setAlias(e.target.value)} placeholder="spring-sale" aria-invalid={!!err.alias}/></label>{err.alias&&<p className="err" role="alert">{err.alias}</p>}
        {err.form&&<p className="err" role="alert">{err.form}</p>}
        <button className="btn primary" disabled={busy}>{busy?'Creating…':'Create short link'}</button>
        {res?.demo&&<p className="info" role="status">Input is valid, but no backend is connected (set <code>VITE_API_URL</code>), so nothing was created.</p>}
        {res?.short&&<p className="ok" role="status"><a href={res.short}>{res.short}</a> <button type="button" onClick={copy} aria-label="Copy short link">{cp?<Check size={16}/>:<Copy size={16}/>}</button></p>}
      </form>}
      {tab==='analytics'&&<div><Tag/><Spark/><p className="muted">Last 7 days · {SAMPLE.clicks.reduce((a,b)=>a+b)} sample clicks</p></div>}
      {tab==='rules'&&<div><Tag/><ul className="rules">{[['Status','Active'],['Expiry','Sample: 30 days from creation'],['Click limit','Sample: 1,000'],['Password','Optional']].map(([k,v])=> <li key={k}><b>{k}</b><span>{v}</span></li>)}</ul></div>}
      </div></div></div></section>
}
function Spark(){const m=Math.max(...SAMPLE.clicks);return <svg className="chart" viewBox="0 0 350 120" role="img" aria-label="Sample clicks per day">
  {SAMPLE.clicks.map((v,i)=> <g key={i}><rect className="bar" x={i*50+10} y={100-v/m*90} width="30" height={v/m*90} fill="#79A99B"/><text x={i*50+25} y="116" textAnchor="middle" fontSize="10" fill="#A7AEA8">{SAMPLE.days[i]}</text></g>)}</svg>}
function Bars({data,color}){const t=Math.max(...data.map(d=>d[1]));return <ul className="hbars">{data.map(([k,v])=> <li key={k}><span>{k}</span><div><i className="hb" style={{width:`${v/t*100}%`,background:color}}/></div><b>{v}</b></li>)}</ul>}
function Analytics(){return <section className="dark" id="analytics"><div className="wrap"><p className="eyebrow">Analytics</p><h2 className="rv">Make every click count.</h2><Tag/>
  <div className="agrid">
   <div className="acard rv wide"><h3>Click activity over time</h3><Spark/></div>
   <div className="acard rv"><h3>Traffic by referrer (%)</h3><Bars data={SAMPLE.ref} color="#79A99B"/></div>
   <div className="acard rv"><h3>Device distribution (%)</h3><Bars data={SAMPLE.dev} color="#D98252"/></div>
   <div className="acard rv"><h3>Top links (clicks)</h3><Bars data={SAMPLE.top} color="#79A99B"/></div>
   <div className="acard rv"><h3>Campaign comparison (clicks)</h3><Bars data={SAMPLE.camp} color="#315F52"/></div>
  </div></div></section>}
const STEPS=['Request arrives','Link exists?','Status active?','Not expired?','Under click limit?','Password OK?','Redirect + log click']
function Security(){
  const r=useRef(null)
  useLayoutEffect(()=>{const c=gsap.context(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return
    gsap.from('.node',{opacity:0,x:-24,stagger:.15,duration:.5,ease:'power3.out',scrollTrigger:{trigger:r.current,start:'top 75%'}})},r);return()=>c.revert()},[])
  return <section className="forest" id="security" ref={r}><div className="wrap split"><div><p className="eyebrow">Control & security</p><h2 className="rv">Control the destination. Protect the experience.</h2>
    <p className="lead2">Rules drive the actual redirect: status, expiry, click limits and password checks run before a visitor is sent on. Admins can disable abusive links, which stops redirects immediately while keeping analytics.</p></div>
    <ol className="flow">{STEPS.map((s,i)=> <li className={`node ${i===6?'final':''}`} key={s}>{s}</li>)}</ol></div></section>}
function UseCases(){return <section className="light" id="usecases"><div className="wrap"><p className="eyebrow">Use cases</p><h2 className="rv">Built for the work behind every link.</h2>
  <div className="ugrid">{[['Marketing campaigns','Group links by campaign and compare their results.'],['Product & content sharing','Share clean links with expiry or password where needed.'],['Teams with many destinations','Keep aliases, tags and statuses organised.'],['QR-enabled experiences','Bridge print and events to tracked destinations.']].map(([t,d],i)=>
    <article className="rv" key={t}><span>0{i+1}</span><h3>{t}</h3><p>{d}</p></article>)}</div></div></section>}
const FAQ=[['What is LinkPulse?','A URL shortening, link management and analytics platform where rules, campaigns and click data work together.'],['How do short links work?','Each short code maps to a destination. On every visit the engine checks status, expiry, click limit and password, records the click, then redirects.'],['Can I create a custom alias?','Yes. Aliases are validated for format and duplicates before publishing.'],['Can I set an expiry date?','Yes. Expired links stop redirecting but keep their analytics.'],['Can a link be password protected?','Yes. Visitors must enter the password before being redirected.'],['Can I track link performance?','Yes. Clicks, referrers, devices and browsers are recorded, with bots filtered out.'],['Can I generate QR codes?','QR generation is part of the product scope; availability depends on your deployment.'],['Can I import links in bulk?','CSV import is part of the product scope, with invalid rows and duplicates flagged before import.']]
function FAQSection(){const [o,setO]=useState(0);return <section className="light2" id="faq"><div className="wrap narrow"><h2 className="rv">Frequently asked questions</h2>
  {FAQ.map(([q,a],i)=> <div className={`faq ${o===i?'open':''}`} key={q}><h3><button aria-expanded={o===i} aria-controls={`f${i}`} onClick={()=>setO(o===i?-1:i)}>{q}<ChevronDown size={20}/></button></h3><div className="fa" id={`f${i}`}><p>{a}</p></div></div>)}</div></section>}
function Final(){return <section className="dark final"><div className="wrap center"><h2 className="rv">Make your next link work harder.</h2><p className="lead">Create, manage, and understand your links in one connected place.</p>
  <div className="cta"><Btn href={APP}>Get started</Btn><Btn href="#analytics" variant="ghost">Explore analytics</Btn></div><div className="ring small" aria-hidden="true"/></div></section>}
function Footer(){return <footer><div className="wrap foot"><a href="#top" className="brand"><span className="logo"><Link2 size={18}/></span>LinkPulse</a>
  <nav aria-label="Footer">{NAV.map(([n,h])=> <a key={n} href={h}>{n}</a>)}<a href="#faq">FAQ</a></nav><small>© {new Date().getFullYear()} LinkPulse</small></div></footer>}

export default function App(){
  useLayoutEffect(()=>{
    const ctx=gsap.context(()=>{
      if(matchMedia('(prefers-reduced-motion: reduce)').matches)return
      gsap.from('.hl',{y:40,opacity:0,duration:1,stagger:.18,ease:'power3.out',delay:.15})
      gsap.utils.toArray('.rv').forEach(el=>gsap.from(el,{y:36,opacity:0,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}}))
      gsap.utils.toArray('.draw').forEach(el=>{const l=el.getTotalLength();gsap.fromTo(el,{strokeDasharray:l,strokeDashoffset:l},{strokeDashoffset:0,scrollTrigger:{trigger:el,start:'top 85%'},duration:1})})
      gsap.utils.toArray('.bar').forEach(el=>gsap.from(el,{scaleY:0,transformOrigin:'50% 100%',duration:.8,scrollTrigger:{trigger:el,start:'top 95%',once:true}}))
      gsap.utils.toArray('.hb').forEach(el=>gsap.from(el,{scaleX:0,transformOrigin:'0 50%',duration:.8,scrollTrigger:{trigger:el,start:'top 95%',once:true}}))
    });const rf=()=>ScrollTrigger.refresh();addEventListener('load',rf)
    return()=>{removeEventListener('load',rf);ctx.revert()}},[])
  return <><a className="skip" href="#product">Skip to content</a><Navbar/><main><Hero/><Problem/><Journey/><Features/><Demo/><Analytics/><Security/><UseCases/><FAQSection/><Final/></main><Footer/></>
}
