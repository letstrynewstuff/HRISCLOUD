


// src/admin/documents/DocumentTemplates.jsx
// Full document management: Upload PDF/DOCX → assign employees → send for e-signature → track status

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/Header";
import {
  FileText, Eye, Upload, X, Loader2, AlertTriangle, Trash2,
  BookOpen, Send, CheckCircle2, ChevronRight, ChevronLeft,
  FileType2, File, Users, MessageSquare, Search, UserCheck,
  Clock, XCircle, Shield, RefreshCw, AlertCircle, Download,
  Plus, PenLine, Inbox,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import { documentApi } from "../../api/service/documentApi";
import { getEmployees } from "../../api/service/employeeApi";

const CATEGORIES = [
  "Contract","NDA","Offer Letter","Policy","Onboarding",
  "Compliance","Promotion Letter","Disciplinary Notice","Exit Letter","Other",
];
const STEPS = ["Upload File","Select Employees","Add Message & Send"];

const fmtDate = (ds) =>
  ds ? new Date(ds).toLocaleDateString("en-NG",{month:"short",day:"numeric",year:"numeric"}) : "—";

// ─────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = status?.toLowerCase();
  const cfg =
    s==="signed"  ?{bg:"#F0FDF4",color:"#15803D",icon:CheckCircle2,label:"Signed"}:
    s==="sent"    ?{bg:"#EFF6FF",color:"#1D4ED8",icon:PenLine,     label:"Awaiting Signature"}:
    s==="pending" ?{bg:"#FFF7ED",color:"#C2410C",icon:Clock,       label:"Pending"}:
    s==="rejected"?{bg:C.dangerLight,color:C.danger,icon:XCircle,  label:"Rejected"}:
                   {bg:C.surfaceAlt,color:C.textMuted,icon:AlertCircle,label:status??"—"};
  const Icon=cfg.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
      style={{background:cfg.bg,color:cfg.color}}>
      <Icon size={9}/>{cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// STEP INDICATOR
// ─────────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((label,i)=>{
        const n=i+1; const done=current>n; const active=current===n;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{background:done?C.success:active?"#4F46E5":C.surfaceAlt,
                        color:done||active?"#fff":C.textMuted,
                        border:`2px solid ${done?C.success:active?"#4F46E5":C.border}`,
                        boxShadow:active?"0 0 0 4px #EEF2FF":"none"}}>
                {done?<CheckCircle2 size={16}/>:n}
              </div>
              <span className="text-[10px] font-semibold text-center leading-tight max-w-[72px]"
                style={{color:active?"#4F46E5":done?C.success:C.textMuted}}>
                {label}
              </span>
            </div>
            {i<STEPS.length-1&&(
              <div className="flex-1 h-[2px] mx-2 mb-5 rounded-full transition-all"
                style={{background:done?"#22C55E":C.border}}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// UPLOAD + SEND MODAL  (3-step wizard)
// ─────────────────────────────────────────────
function SendDocumentModal({ onClose, onSuccess }) {
  const [step,        setStep]        = useState(1);
  const [file,        setFile]        = useState(null);
  const [docName,     setDocName]     = useState("");
  const [category,    setCategory]    = useState("Contract");
  const [uploading,   setUploading]   = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [err1,        setErr1]        = useState("");

  const [employees,   setEmployees]   = useState([]);
  const [empLoading,  setEmpLoading]  = useState(false);
  const [empSearch,   setEmpSearch]   = useState("");
  const [selected,    setSelected]    = useState([]);
  const [err2,        setErr2]        = useState("");

  const [message,     setMessage]     = useState("");
  const [sending,     setSending]     = useState(false);
  const [err3,        setErr3]        = useState("");

  const inputRef = useRef();

  // Load employees when reaching step 2
  useEffect(()=>{
    if(step!==2)return;
    setEmpLoading(true);
    getEmployees({limit:200})
      .then(res=>{
        const list=res?.data??res??[];
        setEmployees(Array.isArray(list)?list:[]);
      })
      .catch(()=>setErr2("Could not load employees. Please try again."))
      .finally(()=>setEmpLoading(false));
  },[step]);

  const acceptFile=(f)=>{
    const ok=["application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword"].includes(f.type);
    if(!ok){setErr1("Only PDF or DOCX files are accepted.");return;}
    setFile(f);
    setErr1("");
    if(!docName)setDocName(f.name.replace(/\.[^.]+$/,""));
  };

  // STEP 1: upload to Cloudinary via backend
  const handleUpload=async()=>{
    if(!file)return setErr1("Please select a file first.");
    if(!docName.trim())return setErr1("Please enter a document name.");
    setUploading(true);setErr1("");
    try{
      // POST /documents/upload → { message, data: { id, name, file_url, ... } }
      const res=await documentApi.uploadFile(file,docName.trim(),category);
      const doc=res?.data??res;
      if(!doc?.id)throw new Error("Upload succeeded but server returned no document ID.");
      setUploadedDoc(doc);
      setStep(2);
    }catch(e){
      setErr1(e?.response?.data?.message??e?.message??"Upload failed. Please try again.");
    }finally{setUploading(false);}
  };

  // STEP 3: send to selected employees
  const handleSend=async()=>{
    if(selected.length===0)return setErr3("Select at least one employee.");
    setSending(true);setErr3("");
    try{
      // POST /documents/send-uploaded → creates documents rows with status='sent'
      await documentApi.sendUploaded(uploadedDoc.id,selected,message.trim());
      onSuccess(selected.length);
    }catch(e){
      setErr3(e?.response?.data?.message??e?.message??"Send failed. Please try again.");
      setSending(false);
    }
  };

  const filteredEmps=employees.filter(e=>{
    const q=empSearch.toLowerCase();
    return !q||
      `${e.first_name??""} ${e.last_name??""}`.toLowerCase().includes(q)||
      e.email?.toLowerCase().includes(q)||
      e.department?.toLowerCase().includes(q);
  });
  const toggle=id=>setSelected(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const toggleAll=()=>setSelected(
    selected.length===filteredEmps.length?[]:filteredEmps.map(e=>e.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{background:"rgba(15,23,42,0.65)",backdropFilter:"blur(6px)"}}>
      <motion.div
        initial={{opacity:0,scale:0.94,y:24}} animate={{opacity:1,scale:1,y:0}}
        exit={{opacity:0,scale:0.94,y:24}} transition={{type:"spring",stiffness:280,damping:26}}
        className="w-full max-w-xl rounded-3xl overflow-hidden flex flex-col"
        style={{background:C.surface,border:`1px solid ${C.border}`,maxHeight:"92vh",
                boxShadow:"0 32px 80px rgba(15,23,42,0.3)"}}>

        {/* Modal header */}
        <div className="px-7 py-5 flex items-center justify-between"
          style={{borderBottom:`1px solid ${C.border}`,background:"linear-gradient(135deg,#4F46E5,#6366F1)"}}>
          <div>
            <p className="font-bold text-lg text-white">Send Document for Signature</p>
            <p className="text-indigo-200 text-xs mt-0.5">
              Upload a PDF or DOCX → choose employees → send for e-signature
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors">
            <X size={15} color="#fff"/>
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-7 pt-6">
          <StepIndicator current={step}/>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 pb-7 space-y-5">

          {/* ═══ STEP 1: Upload File ═══ */}
          {step===1&&(
            <>
              {/* Drop zone */}
              <div
                onDragOver={e=>e.preventDefault()}
                onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)acceptFile(f);}}
                onClick={()=>inputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 py-12 cursor-pointer transition-all"
                style={{borderColor:file?"#4F46E5":C.border,
                        background:file?"#EEF2FF":C.surfaceAlt}}>
                <input ref={inputRef} type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden" onChange={e=>e.target.files[0]&&acceptFile(e.target.files[0])}/>

                {file?(
                  <>
                    {file.type==="application/pdf"
                      ?<FileType2 size={40} color="#DC2626"/>
                      :<FileText size={40} color="#4F46E5"/>}
                    <div className="text-center">
                      <p className="font-bold text-sm" style={{color:C.textPrimary}}>{file.name}</p>
                      <p className="text-xs mt-1" style={{color:C.textMuted}}>
                        {(file.size/1024/1024).toFixed(2)} MB · {file.type.includes("pdf")?"PDF":"DOCX"}
                      </p>
                    </div>
                    <button onClick={e=>{e.stopPropagation();setFile(null);setDocName("");}}
                      className="text-xs px-4 py-1.5 rounded-xl font-semibold"
                      style={{background:C.dangerLight,color:C.danger}}>
                      Remove & choose another
                    </button>
                  </>
                ):(
                  <>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{background:"#EEF2FF"}}>
                      <Upload size={28} color="#4F46E5"/>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-bold text-sm" style={{color:C.textPrimary}}>
                        Drag & drop your document here
                      </p>
                      <p className="text-xs" style={{color:C.textMuted}}>
                        or click anywhere in this box to browse
                      </p>
                      <p className="text-[11px] font-semibold" style={{color:"#4F46E5"}}>
                        PDF · DOCX · DOC · Max 20 MB
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Document name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold" style={{color:C.textSecondary}}>
                  Document Name <span style={{color:C.danger}}>*</span>
                </label>
                <input value={docName} onChange={e=>setDocName(e.target.value)}
                  placeholder="e.g. Employment Contract · Q1 2025"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{background:C.surfaceAlt,border:`1.5px solid ${docName?C.primary:C.border}`,
                          color:C.textPrimary}}/>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold" style={{color:C.textSecondary}}>Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c=>(
                    <button key={c} onClick={()=>setCategory(c)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                      style={{background:category===c?"#4F46E5":C.surfaceAlt,
                              color:category===c?"#fff":C.textSecondary,
                              border:`1.5px solid ${category===c?"#4F46E5":C.border}`}}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {err1&&(
                <div className="rounded-xl p-3 flex items-center gap-2" style={{background:C.dangerLight}}>
                  <AlertTriangle size={14} color={C.danger}/>
                  <p className="text-xs font-semibold" style={{color:C.danger}}>{err1}</p>
                </div>
              )}
            </>
          )}

          {/* ═══ STEP 2: Select Employees ═══ */}
          {step===2&&(
            <>
              <div>
                <p className="font-bold text-sm mb-1" style={{color:C.textPrimary}}>
                  Who should receive and sign this document?
                </p>
                <p className="text-xs" style={{color:C.textMuted}}>
                  Each selected employee will receive a notification and a sign request.
                </p>
              </div>

              {/* Search + select all */}
              <div className="flex gap-2">
                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 flex-1"
                  style={{background:C.surfaceAlt,border:`1px solid ${C.border}`}}>
                  <Search size={13} color={C.textMuted}/>
                  <input value={empSearch} onChange={e=>setEmpSearch(e.target.value)}
                    placeholder="Search by name, email or department…"
                    className="flex-1 bg-transparent text-sm outline-none" style={{color:C.textPrimary}}/>
                  {empSearch&&<button onClick={()=>setEmpSearch("")}><X size={12} color={C.textMuted}/></button>}
                </div>
                {filteredEmps.length>0&&!empLoading&&(
                  <button onClick={toggleAll}
                    className="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap"
                    style={{background:selected.length===filteredEmps.length?"#4F46E5":C.surfaceAlt,
                            color:selected.length===filteredEmps.length?"#fff":C.textSecondary,
                            border:`1px solid ${selected.length===filteredEmps.length?"#4F46E5":C.border}`}}>
                    {selected.length===filteredEmps.length?"Deselect All":"Select All"}
                  </button>
                )}
              </div>

              {/* Selection pill */}
              {selected.length>0&&(
                <div className="rounded-xl px-4 py-2.5 flex items-center gap-2"
                  style={{background:"#EEF2FF",border:"1px solid #C7D2FE"}}>
                  <UserCheck size={14} color="#4F46E5"/>
                  <p className="text-xs font-bold" style={{color:"#4F46E5"}}>
                    {selected.length} employee{selected.length>1?"s":""} selected
                  </p>
                  <button onClick={()=>setSelected([])}
                    className="ml-auto text-xs underline font-semibold" style={{color:"#4F46E5"}}>
                    Clear all
                  </button>
                </div>
              )}

              {/* Employee list */}
              <div className="rounded-xl overflow-hidden"
                style={{border:`1px solid ${C.border}`,maxHeight:320,overflowY:"auto"}}>
                {empLoading?(
                  <div className="flex items-center justify-center py-12 gap-3">
                    <Loader2 size={20} color="#4F46E5" className="animate-spin"/>
                    <span className="text-sm font-medium" style={{color:C.textMuted}}>Loading employees…</span>
                  </div>
                ):filteredEmps.length===0?(
                  <div className="py-10 text-center space-y-1">
                    <Users size={28} color={C.textMuted} className="mx-auto"/>
                    <p className="text-sm font-medium" style={{color:C.textMuted}}>
                      {employees.length===0?"No employees in this company":"No employees match your search"}
                    </p>
                  </div>
                ):filteredEmps.map(emp=>{
                  const isSel=selected.includes(emp.id);
                  return (
                    <div key={emp.id} onClick={()=>toggle(emp.id)}
                      className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all select-none"
                      style={{background:isSel?"#EEF2FF":"transparent",
                              borderBottom:`1px solid ${C.border}`}}
                      onMouseEnter={e=>!isSel&&(e.currentTarget.style.background=C.surfaceAlt)}
                      onMouseLeave={e=>!isSel&&(e.currentTarget.style.background="transparent")}>
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{background:isSel?"#C7D2FE":"#E2E8F0",
                                color:isSel?"#4F46E5":"#475569"}}>
                        {(emp.first_name?.[0]??"?").toUpperCase()}{(emp.last_name?.[0]??"").toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{color:C.textPrimary}}>
                          {emp.first_name} {emp.last_name}
                        </p>
                        <p className="text-xs truncate" style={{color:C.textMuted}}>
                          {emp.job_title??emp.position??"—"} · {emp.department??"—"}
                        </p>
                      </div>
                      {/* Checkbox */}
                      <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                        style={{background:isSel?"#4F46E5":C.surfaceAlt,
                                border:`2px solid ${isSel?"#4F46E5":C.border}`}}>
                        {isSel&&<CheckCircle2 size={11} color="#fff"/>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {err2&&(
                <div className="rounded-xl p-3 flex items-center gap-2" style={{background:C.dangerLight}}>
                  <AlertTriangle size={14} color={C.danger}/>
                  <p className="text-xs font-semibold" style={{color:C.danger}}>{err2}</p>
                </div>
              )}
            </>
          )}

          {/* ═══ STEP 3: Message & Send ═══ */}
          {step===3&&(
            <>
              {/* Summary card */}
              <div className="rounded-2xl p-4 space-y-3"
                style={{background:"linear-gradient(135deg,#EEF2FF,#F5F3FF)",border:"1px solid #C7D2FE"}}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{color:"#6366F1"}}>
                  Ready to Send
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:"#EEF2FF"}}>
                    <FileText size={18} color="#4F46E5"/>
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{color:C.textPrimary}}>
                      {uploadedDoc?.name??docName}
                    </p>
                    <p className="text-xs" style={{color:C.textMuted}}>
                      {category} · {selected.length} recipient{selected.length!==1?"s":""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {employees
                    .filter(e=>selected.includes(e.id))
                    .slice(0,6)
                    .map(e=>(
                      <span key={e.id} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{background:"#C7D2FE",color:"#3730A3"}}>
                        {e.first_name} {e.last_name}
                      </span>
                    ))}
                  {selected.length>6&&(
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{background:"#E2E8F0",color:C.textMuted}}>
                      +{selected.length-6} more
                    </span>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold" style={{color:C.textSecondary}}>
                  Message to recipient(s) <span style={{color:C.textMuted}}>(optional)</span>
                </label>
                <textarea value={message} onChange={e=>setMessage(e.target.value)}
                  placeholder="e.g. Please review and sign this document at your earliest convenience. Contact HR if you have any questions."
                  rows={5} className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
                  style={{background:C.surfaceAlt,border:`1.5px solid ${message?C.primary:C.border}`,
                          color:C.textPrimary,lineHeight:1.6}}/>
                <p className="text-[11px]" style={{color:C.textMuted}}>
                  This message will appear alongside the document when the employee opens it.
                </p>
              </div>

              {/* What happens next info */}
              <div className="rounded-xl p-4 space-y-2"
                style={{background:"#F0FDF4",border:"1px solid #BBF7D0"}}>
                <p className="text-xs font-bold" style={{color:"#15803D"}}>What happens when you click Send?</p>
                {[
                  "Each employee receives an in-app notification",
                  "The document appears in their Documents page",
                  "They can open, read and electronically sign it",
                  "You'll see the status update to Signed here instantly",
                ].map((t,i)=>(
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={12} color="#16A34A" className="mt-0.5 flex-shrink-0"/>
                    <p className="text-xs" style={{color:"#166534"}}>{t}</p>
                  </div>
                ))}
              </div>

              {err3&&(
                <div className="rounded-xl p-3 flex items-center gap-2" style={{background:C.dangerLight}}>
                  <AlertTriangle size={14} color={C.danger}/>
                  <p className="text-xs font-semibold" style={{color:C.danger}}>{err3}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between px-7 py-5 gap-3"
          style={{borderTop:`1px solid ${C.border}`}}>
          <button
            onClick={()=>step>1?setStep(step-1):onClose()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{background:C.surfaceAlt,border:`1px solid ${C.border}`,color:C.textSecondary}}>
            <ChevronLeft size={14}/>
            {step===1?"Cancel":"Back"}
          </button>

          {step===1&&(
            <button onClick={handleUpload} disabled={uploading||!file}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{background:uploading||!file?"#C7D2FE":"#4F46E5",
                      color:uploading||!file?"#818CF8":"#fff",
                      cursor:uploading||!file?"not-allowed":"pointer",
                      boxShadow:uploading||!file?"none":"0 4px 14px rgba(79,70,229,0.4)"}}>
              {uploading
                ?<><Loader2 size={14} className="animate-spin"/>Uploading to cloud…</>
                :<><Upload size={14}/>Upload File &amp; Continue<ChevronRight size={14}/></>}
            </button>
          )}

          {step===2&&(
            <button
              onClick={()=>{
                if(selected.length===0){setErr2("Please select at least one employee.");return;}
                setErr2("");setStep(3);
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{background:selected.length===0?"#C7D2FE":"#4F46E5",
                      color:selected.length===0?"#818CF8":"#fff",
                      cursor:selected.length===0?"not-allowed":"pointer",
                      boxShadow:selected.length===0?"none":"0 4px 14px rgba(79,70,229,0.4)"}}>
              Continue to Message<ChevronRight size={14}/>
            </button>
          )}

          {step===3&&(
            <button onClick={handleSend} disabled={sending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{background:sending?"#C7D2FE":"#16A34A",
                      color:sending?"#4B5563":"#fff",
                      cursor:sending?"not-allowed":"pointer",
                      boxShadow:sending?"none":"0 4px 14px rgba(22,163,74,0.35)"}}>
              {sending
                ?<><Loader2 size={14} className="animate-spin"/>Sending…</>
                :<><Send size={14}/>Send for E-Signature Now</>}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SUCCESS TOAST
// ─────────────────────────────────────────────
function SuccessToast({ count, onDone }) {
  useEffect(()=>{const t=setTimeout(onDone,5000);return()=>clearTimeout(t);},[onDone]);
  return (
    <motion.div initial={{opacity:0,y:40,scale:0.95}} animate={{opacity:1,y:0,scale:1}}
      exit={{opacity:0,y:40,scale:0.95}}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl"
      style={{background:"#16A34A",color:"#fff",minWidth:300}}>
      <CheckCircle2 size={22}/>
      <div>
        <p className="font-bold text-sm">Document sent for signature!</p>
        <p className="text-xs opacity-80 mt-0.5">
          {count} employee{count!==1?"s":""} notified · status will update when signed
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// SENT DOCUMENTS TABLE
// GET /documents → { data: rows[], total: N }
// SQL aliases: template_name, category, employee_name, status, sent_at, signed_at, file_url
// ─────────────────────────────────────────────
function SentDocumentsTable({ refreshTrigger, onNewDoc }) {
  const [docs,         setDocs]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load=useCallback(async()=>{
    setLoading(true);setError(null);
    try{
      const res=await documentApi.getAll({limit:200});
      // res = HTTP body = { data: [...], total: N }  (axios already unwrapped r.data)
      const list=Array.isArray(res?.data)?res.data:[];
      setDocs(list);
    }catch(e){
      setError(e?.response?.data?.message??e?.message??"Failed to load documents.");
    }finally{setLoading(false);}
  },[]);

  useEffect(()=>{load();},[load,refreshTrigger]);

  const filtered=useMemo(()=>{
    const q=search.toLowerCase();
    return docs.filter(d=>{
      const name=(d.template_name??"").toLowerCase();
      const emp=(d.employee_name??"").toLowerCase();
      const cat=(d.category??"").toLowerCase();
      return(!q||name.includes(q)||emp.includes(q)||cat.includes(q))&&
        (statusFilter==="all"||d.status?.toLowerCase()===statusFilter);
    });
  },[docs,search,statusFilter]);

  const pending=docs.filter(d=>["sent","pending"].includes(d.status?.toLowerCase())).length;
  const signed=docs.filter(d=>d.status?.toLowerCase()==="signed").length;

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Sent",
            value: docs.length,
            color: "#4F46E5",
            bg: "#EEF2FF",
          },
          {
            label: "Awaiting Sign",
            value: pending,
            color: "#D97706",
            bg: "#FFF7ED",
          },
          { label: "Signed ✓", value: signed, color: "#15803D", bg: "#F0FDF4" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            <p className="text-3xl font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
            <p
              className="text-xs font-semibold mt-1"
              style={{ color: C.textMuted }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Controls */}
      {/* <div className="flex gap-3 flex-wrap items-center">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 flex-1 min-w-[220px]"
          style={{background:C.surface,border:`1px solid ${C.border}`}}>
          <Search size={13} color={C.textMuted}/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search by document name or employee…"
            className="flex-1 bg-transparent text-sm outline-none" style={{color:C.textPrimary}}/>
          {search&&<button onClick={()=>setSearch("")}><X size={12} color={C.textMuted}/></button>}
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all","sent","signed","pending","rejected"].map(s=>(
            <button key={s} onClick={()=>setStatusFilter(s)}
              className="px-3 py-2 rounded-xl text-xs font-bold capitalize"
              style={{background:statusFilter===s?"#4F46E5":C.surface,
                      color:statusFilter===s?"#fff":C.textSecondary,
                      border:`1px solid ${statusFilter===s?"#4F46E5":C.border}`}}>
              {s==="all"?"All Status":s==="sent"?"Awaiting Sig.":s}
            </button>
          ))}
        </div>

        <button onClick={load}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{background:C.surface,border:`1px solid ${C.border}`}} title="Refresh">
          <RefreshCw size={15} color={C.textSecondary}/>
        </button>
      </div> */}
      {/* Controls */}
      <div className="flex gap-3 flex-wrap items-center">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 flex-1 min-w-[220px]"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
        >
          <Search size={13} color={C.textMuted} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by document name or employee…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: C.textPrimary }}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={12} color={C.textMuted} />
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "sent", "signed", "pending", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-2 rounded-xl text-xs font-bold capitalize"
              style={{
                background: statusFilter === s ? "#4F46E5" : C.surface,
                color: statusFilter === s ? "#fff" : C.textSecondary,
                border: `1px solid ${statusFilter === s ? "#4F46E5" : C.border}`,
              }}
            >
              {s === "all" ? "All Status" : s === "sent" ? "Awaiting Sig." : s}
            </button>
          ))}
        </div>

        {/* ── NEW: Send Document button always visible ── */}
        <button
          onClick={onNewDoc}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
          style={{
            background: "#4F46E5",
            color: "#fff",
            boxShadow: "0 4px 14px rgba(79,70,229,0.3)",
            whiteSpace: "nowrap",
          }}
        >
          <PenLine size={13} />
          Send New Document
        </button>

        <button
          onClick={load}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
          title="Refresh"
        >
          <RefreshCw size={15} color={C.textSecondary} />
        </button>
      </div>

      {error && (
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: C.dangerLight }}
        >
          <AlertTriangle size={15} color={C.danger} />
          <p
            className="text-sm flex-1 font-semibold"
            style={{ color: C.danger }}
          >
            {error}
          </p>
          <button
            onClick={load}
            className="text-xs underline font-bold"
            style={{ color: C.danger }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        {/* Column headers */}
        <div
          className="grid gap-3 px-6 py-3 text-[10px] font-bold uppercase tracking-widest"
          style={{
            gridTemplateColumns: "1fr 170px 120px 105px 165px",
            background: C.surfaceAlt,
            borderBottom: `1px solid ${C.border}`,
            color: C.textMuted,
          }}
        >
          <span>Document</span>
          <span>Employee</span>
          <span>Category</span>
          <span>Sent On</span>
          <span>Signature Status</span>
        </div>

        {loading && (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0"
                  style={{ background: C.surfaceAlt }}
                />
                <div className="flex-1 space-y-2">
                  <div
                    style={{
                      height: 12,
                      width: "45%",
                      borderRadius: 6,
                      background: C.surfaceAlt,
                    }}
                  />
                  <div
                    style={{
                      height: 10,
                      width: "25%",
                      borderRadius: 6,
                      background: C.surfaceAlt,
                    }}
                  />
                </div>
                <div
                  style={{
                    height: 10,
                    width: "15%",
                    borderRadius: 6,
                    background: C.surfaceAlt,
                  }}
                />
                <div
                  style={{
                    height: 10,
                    width: "10%",
                    borderRadius: 6,
                    background: C.surfaceAlt,
                  }}
                />
                <div
                  style={{
                    height: 22,
                    width: 90,
                    borderRadius: 20,
                    background: C.surfaceAlt,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-20 flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "#EEF2FF" }}
            >
              <Inbox size={32} color="#4F46E5" />
            </div>
            <div className="text-center space-y-1">
              <p
                className="font-bold text-base"
                style={{ color: C.textPrimary }}
              >
                {docs.length === 0
                  ? "No documents sent yet"
                  : "No documents match your filters"}
              </p>
              <p className="text-sm" style={{ color: C.textMuted }}>
                {docs.length === 0
                  ? 'Click "Send Document for Signature" to get started'
                  : "Try adjusting your search or status filter"}
              </p>
            </div>
            {docs.length === 0 && (
              <button
                onClick={onNewDoc}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold mt-2"
                style={{
                  background: "#4F46E5",
                  color: "#fff",
                  boxShadow: "0 4px 14px rgba(79,70,229,0.3)",
                }}
              >
                <Plus size={15} />
                Send Your First Document
              </button>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="divide-y" style={{ borderColor: C.border }}>
            {filtered.map((doc, i) => {
              const isSigned = doc.status?.toLowerCase() === "signed";
              const isAwaiting = ["sent", "pending"].includes(
                doc.status?.toLowerCase(),
              );
              return (
                <motion.div
                  key={doc.id ?? i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="grid gap-3 px-6 py-4 items-center transition-colors"
                  style={{ gridTemplateColumns: "1fr 170px 120px 105px 165px" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = C.surfaceAlt)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Document */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "#EEF2FF" }}
                    >
                      <FileText size={15} color="#4F46E5" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-bold truncate"
                        style={{ color: C.textPrimary }}
                      >
                        {doc.template_name ?? "Untitled Document"}
                      </p>
                      {doc.message && (
                        <p
                          className="text-[10px] italic truncate mt-0.5"
                          style={{ color: C.textMuted }}
                        >
                          "{doc.message.slice(0, 50)}
                          {doc.message.length > 50 ? "…" : ""}"
                        </p>
                      )}
                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-semibold mt-0.5"
                          style={{ color: "#4F46E5", textDecoration: "none" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download size={9} />
                          View file ↗
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Employee */}
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: C.textPrimary }}
                    >
                      {doc.employee_name ?? "—"}
                    </p>
                  </div>

                  {/* Category */}
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full inline-block"
                    style={{
                      background: C.accentLight ?? C.primaryLight,
                      color: C.accent ?? C.primary,
                    }}
                  >
                    {doc.category ?? "—"}
                  </span>

                  {/* Date */}
                  <p
                    className="text-xs font-medium"
                    style={{ color: C.textMuted }}
                  >
                    {fmtDate(doc.sent_at ?? doc.created_at)}
                  </p>

                  {/* Status */}
                  <div className="flex flex-col gap-1">
                    <StatusBadge status={doc.status} />
                    {isSigned && doc.signed_at && (
                      <p
                        className="text-[9px] font-semibold"
                        style={{ color: "#16A34A" }}
                      >
                        Signed {fmtDate(doc.signed_at)}
                      </p>
                    )}
                    {isAwaiting && (
                      <p
                        className="text-[9px] font-semibold"
                        style={{ color: "#D97706" }}
                      >
                        Waiting for employee…
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════
export default function DocumentTemplates() {
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [showModal,      setShowModal]      = useState(false);
  const [successCount,   setSuccessCount]   = useState(null);
  const [refreshKey,     setRefreshKey]     = useState(0);

  const handleSuccess=(count)=>{
    setShowModal(false);
    setSuccessCount(count);
    setRefreshKey(k=>k+1);
  };

  return (
    <div className="min-h-screen" style={{background:C.bg,fontFamily:"'DM Sans','Sora',sans-serif"}}>
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          <Header
            title="Document Management"
            subtitle="Send documents for e-signature · Track signing status in real time"
            icon={FileText}
            loading={false}
            searchQuery=""
            setSearchQuery={()=>{}}
            setSidebarOpen={setSidebarOpen}
            stats={[]}
            actions={
              <button
                onClick={()=>setShowModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{background:"#4F46E5",color:"#fff",
                        boxShadow:"0 4px 14px rgba(79,70,229,0.35)"}}>
                <PenLine size={15}/>
                Send Document for Signature
              </button>
            }
          />

          <main className="flex-1 overflow-y-auto px-6 py-6">
            <SentDocumentsTable
              refreshTrigger={refreshKey}
              onNewDoc={()=>setShowModal(true)}
            />
          </main>
        </div>
      </div>

      <AnimatePresence>
        {showModal&&(
          <SendDocumentModal
            onClose={()=>setShowModal(false)}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successCount!==null&&(
          <SuccessToast count={successCount} onDone={()=>setSuccessCount(null)}/>
        )}
      </AnimatePresence>
    </div>
  );
}