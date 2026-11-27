import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Upload, Sparkles, FileText, Gauge, CheckCircle2, AlertCircle, ArrowUpRight, Sun, Moon, BriefcaseBusiness, BrainCircuit, MessageSquare, Target, WandSparkles, LoaderCircle, X, ChevronRight} from 'lucide-react';
import './style.css';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analyze`;
function App(){
 const [dark,setDark]=useState(true), [file,setFile]=useState(null), [jd,setJd]=useState(''), [data,setData]=useState(null), [busy,setBusy]=useState(false), [error,setError]=useState(''), [tab,setTab]=useState('overview');
 const theme=dark?'dark':'light';
 const choose=(f)=>{if(f && /\.(pdf|docx)$/i.test(f.name)){setFile(f);setError('');setData(null)}else setError('Choose a PDF or DOCX resume.')};
 async function analyze(){if(!file){setError('Upload your resume to get started.');return}setBusy(true);setError('');setData(null);try{const form=new FormData();form.append('resume',file);form.append('job_description',jd);const res=await fetch(API,{method:'POST',body:form});const json=await res.json();if(!res.ok)throw new Error(json.error||'Could not analyze resume');setData(json);setTab('overview')}catch(e){setError(e.message)}finally{setBusy(false)}}
 const score=data?.score??0;
 const tabs=[['overview','Overview',Gauge],['strengths','Strengths',CheckCircle2],['improve','Improvements',WandSparkles],['interview','Interview prep',BrainCircuit],['coach','AI coach',MessageSquare]];
 return <div className={theme}>
  <div className="app">
   <aside className="sidebar">
    <div className="brand"><div className="brandmark"><Sparkles size={19}/></div><span>resume<span className="brandaccent">IQ</span></span></div>
    <div className="navlabel">WORKSPACE</div><button className="navitem active"><Gauge size={18}/> Resume analysis</button><button className="navitem" onClick={()=>setTab('interview')}><BrainCircuit size={18}/> Interview studio</button>
    <div className="sidecard"><div className="sideicon"><WandSparkles size={17}/></div><strong>Career clarity,<br/>powered by AI.</strong><p>Make your next application count.</p><div className="sideglow"/></div>
    <div className="sidebottom"><div className="avatar">R</div><div><strong>ResumeIQ Studio</strong><small>Personal workspace</small></div><button className="themebtn" onClick={()=>setDark(!dark)} title="Toggle theme">{dark?<Sun size={17}/>:<Moon size={17}/>}</button></div>
   </aside>
   <main className="main">
    <header className="topbar"><div className="crumb">Workspace <span>/</span> <b>Resume analysis</b></div><div className="topright"><span className="live"><i/> AI engine ready</span><button className="themebtn mobiletheme" onClick={()=>setDark(!dark)}>{dark?<Sun size={17}/>:<Moon size={17}/>}</button></div></header>
    <section className="hero"><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> AI CAREER INTELLIGENCE</div><h1>Make your resume<br/> <span>impossible to ignore.</span></h1><p>Decode your resume, uncover opportunities, and walk into interviews with confidence.</p><div className="hero-pills"><span><Target size={14}/> ATS insights</span><span><BrainCircuit size={14}/> AI interview coach</span></div></div><div className="heroart"><div className="orb orb1"/><div className="orb orb2"/><div className="floatingdoc"><div className="dochead"><div className="docicon"><FileText size={18}/></div><div><b>Resume.pdf</b><small>AI scan complete</small></div><CheckCircle2 className="check" size={19}/></div><div className="docline long"/><div className="docline"/><div className="docline medium"/><div className="docline long"/><div className="docline short"/><div className="docline medium"/><div className="docline long"/><div className="docline short"/><div className="docline medium"/></div><div className="floatbadge"><Sparkles size={14}/> AI insights</div></div></section>
    <section className="uploadpanel"><div className="paneltitle"><div><h2>Start with your resume</h2><p>Upload, add a job description, and get your personalized report.</p></div><span className="step">01 / 02</span></div>
      <div className="dropzone" onClick={()=>document.getElementById('fileinput').click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();choose(e.dataTransfer.files[0])}}><input id="fileinput" type="file" accept=".pdf,.docx" hidden onChange={e=>choose(e.target.files[0])}/>{file?<><div className="filecircle"><FileText size={23}/></div><div className="fileinfo"><strong>{file.name}</strong><small>{(file.size/1024/1024).toFixed(2)} MB · Ready to scan</small></div><button className="remove" onClick={e=>{e.stopPropagation();setFile(null)}}><X size={17}/></button></>:<><div className="uploadcircle"><Upload size={23}/></div><div><strong>Drop your resume here, or <span>browse files</span></strong><small>PDF or DOCX · up to 10 MB</small></div></>}</div>
      <label className="fieldlabel">TARGET JOB DESCRIPTION <span>OPTIONAL</span></label><textarea className="jobbox" value={jd} onChange={e=>setJd(e.target.value)} placeholder="Paste the job description here to compare keywords and skills…"/>
      {error&&<div className="error"><AlertCircle size={16}/>{error}</div>}
      <button className="analyze" onClick={analyze} disabled={busy||!file}>{busy?<><LoaderCircle className="spin" size={19}/> Analyzing your resume…</>:<><Sparkles size={18}/> Analyze my resume <ArrowUpRight size={18}/></>}</button>
      <div className="secure"><CheckCircle2 size={14}/> Your resume is processed for this analysis. Use your own API key on the server.</div>
    </section>
    {data&&<section className="results"><div className="resultheader"><div><div className="eyebrow"><Sparkles size={14}/> YOUR REPORT</div><h2>Resume insights</h2></div><div className="scorebadge"><div className="scorebig">{score}<small>/100</small></div><span>ATS score</span></div></div>
      <div className="tabs">{tabs.map(([id,label,Icon])=><button key={id} className={tab===id?'tab active':'tab'} onClick={()=>setTab(id)}><Icon size={16}/>{label}</button>)}</div>
      {tab==='overview'&&<><div className="scoregrid">{Object.entries(data.score_breakdown||{}).map(([k,v])=><div className="scorecard" key={k}><div className="scoretop"><span>{k.replace(/_/g,' ')}</span><b>{v}%</b></div><div className="progress"><div style={{width:v+'%'}}/></div></div>)}</div><div className="tworesults"><ResultList title="Top strengths" items={data.strengths}/><ResultList title="Focus areas" items={data.weaknesses}/></div></>}
      {tab==='strengths'&&<ResultList title="What works well" items={data.strengths}/>}
      {tab==='improve'&&<><ResultList title="Improvement suggestions" items={data.suggestions}/><ResultList title="Missing / relevant skills" items={data.missing_skills}/><ResultList title="Grammar review" items={(data.grammar_issues||[]).map(x=>`${x.issue} → ${x.suggestion}`)}/><ResultList title="Formatting observations" items={data.formatting_issues}/></>}
      {tab==='interview'&&<div className="interviewgrid">{[['HR questions',data.hr_questions],['Technical questions',data.technical_questions],['Behavioral questions',data.behavioral_questions],['Project questions',data.project_questions]].map(([title,items])=><ResultList key={title} title={title} items={items}/>)}</div>}
      {tab==='coach'&&<><div className="coachgrid">{(data.coach||[]).map((x,i)=><div className="coachcard" key={i}><div className="qnum">QUESTION {i+1}</div><h3>{x.question}</h3><p className="sample"><b>Sample response structure</b><br/>{x.sample_answer}</p></div>)}</div><ResultList title="Confidence tips" items={data.confidence_tips}/><ResultList title="Communication suggestions" items={data.communication_tips}/></>}
    </section>}
    <footer>ResumeIQ <span>·</span> AI-powered career toolkit <span>·</span> Built for your next chapter</footer>
   </main>
  </div>
 </div>
}
function ResultList({title,items}){if(!items?.length)return null;return <div className="resultlist"><h3>{title}</h3><ul>{items.map((x,i)=><li key={i}><ChevronRight size={15}/><span>{typeof x==='string'?x:JSON.stringify(x)}</span></li>)}</ul></div>}
createRoot(document.getElementById('root')).render(<App/>);
