"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useCallback } from "react";

const DISTRICTS = [
  "Ahmednagar","Akola","Amravati","Aurangabad","Beed","Bhandara","Buldhana","Chandrapur",
  "Dhule","Gadchiroli","Gondia","Hingoli","Jalgaon","Jalna","Kolhapur","Latur","Mumbai City",
  "Mumbai Suburban","Nagpur","Nanded","Nandurbar","Nashik","Osmanabad","Palghar","Parbhani",
  "Pune","Raigad","Ratnagiri","Sangli","Satara","Sindhudurg","Solapur","Thane","Wardha",
  "Washim","Yavatmal"
];

const DISASTER_TYPES = ["FLOOD","EARTHQUAKE","CYCLONE","LANDSLIDE","FIRE","DROUGHT","OTHER"];

export default function AdminEmergenciesPage() {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "", disasterType: "FLOOD", affectedDistricts: [] as string[],
    severity: "Moderate", description: "", sourceName: "ETW Admin", sourceUrl: "",
    isSimulation: false,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/admin/emergencies");
    const data = await res.json();
    if (data.success) setEmergencies(data.data);
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: string, action: string) => {
    const res = await fetch(`/api/v1/admin/emergencies/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (data.success) { setMsg(`✓ ${action} done`); load(); }
    else setMsg(`❌ ${data.error}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this emergency? This cannot be undone.")) return;
    const res = await fetch(`/api/v1/admin/emergencies/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) { setMsg("✓ Deleted"); load(); }
    else setMsg(`❌ ${data.error}`);
  };

  const handleCreate = async () => {
    if (!form.sourceUrl || !form.title) { setMsg("❌ Title and Source URL are required"); return; }
    setSaving(true);
    const res = await fetch("/api/v1/admin/emergencies", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setMsg("✓ Emergency created (PENDING_REVIEW)");
      setShowCreate(false);
      setForm({ title:"",disasterType:"FLOOD",affectedDistricts:[],severity:"Moderate",description:"",sourceName:"ETW Admin",sourceUrl:"",isSimulation:false });
      load();
    } else {
      setMsg(`❌ ${JSON.stringify(data.error)}`);
    }
  };

  const toggleDistrict = (d: string) => {
    setForm(f => ({
      ...f,
      affectedDistricts: f.affectedDistricts.includes(d)
        ? f.affectedDistricts.filter(x => x !== d)
        : [...f.affectedDistricts, d]
    }));
  };

  return (
    <div className="etw-page">
      <div className="etw-container">
        <div className="pb-6 border-b-2 border-black mb-8 flex justify-between items-center">
          <div>
            <p className="etw-label text-gray-500 mb-1">ADMIN</p>
            <h1 className="text-4xl font-black">EMERGENCY INTELLIGENCE</h1>
            <p className="text-gray-600 mt-1">Review, approve, reject, close, and simulate emergencies</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowCreate(true); setMsg(""); }}
              className="etw-btn etw-btn-filled"
            >
              + CREATE EMERGENCY
            </button>
            <button
              onClick={() => fetch(`/api/cron/emergency-sync?secret=${process.env.NEXT_PUBLIC_CRON_SECRET || ""}`)
                .then(r=>r.json()).then(d => setMsg(`Sync: +${d.newEmergencies} new, ${d.errors?.length || 0} errors`))}
              className="etw-btn"
            >
              ↻ RUN SYNC
            </button>
          </div>
        </div>

        {msg && (
          <div className="mb-6 p-3 border-2 border-black font-mono text-sm">{msg}</div>
        )}

        {/* Create / Simulate Form */}
        {showCreate && (
          <div className="mb-8 border-2 border-black p-6">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-xl">Create Emergency</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-black">✕ Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="etw-label block mb-1">TITLE *</label>
                <input className="etw-input w-full" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
              </div>
              <div>
                <label className="etw-label block mb-1">TYPE *</label>
                <select className="etw-input w-full" value={form.disasterType} onChange={e=>setForm(f=>({...f,disasterType:e.target.value}))}>
                  {DISASTER_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="etw-label block mb-1">SEVERITY</label>
                <select className="etw-input w-full" value={form.severity} onChange={e=>setForm(f=>({...f,severity:e.target.value}))}>
                  {["Low","Moderate","Severe","Extreme"].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="etw-label block mb-1">SOURCE URL *</label>
                <input className="etw-input w-full" type="url" value={form.sourceUrl} onChange={e=>setForm(f=>({...f,sourceUrl:e.target.value}))} />
              </div>
              <div className="col-span-2">
                <label className="etw-label block mb-1">DESCRIPTION</label>
                <textarea className="etw-input w-full" rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
              </div>
              <div className="col-span-2">
                <label className="etw-label block mb-2">AFFECTED DISTRICTS ({form.affectedDistricts.length} selected)</label>
                <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto border border-gray-200 p-2">
                  {DISTRICTS.map(d=>(
                    <label key={d} className="flex items-center gap-1 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.affectedDistricts.includes(d)} onChange={()=>toggleDistrict(d)} />
                      {d}
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                  <input type="checkbox" checked={form.isSimulation} onChange={e=>setForm(f=>({...f,isSimulation:e.target.checked}))} />
                  <span>⚠️ SIMULATION — Label everywhere as simulation (no real emergency)</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreate} disabled={saving} className="etw-btn etw-btn-filled">
                {saving ? "Creating..." : "CREATE"}
              </button>
              <button onClick={()=>setShowCreate(false)} className="etw-btn">Cancel</button>
            </div>
          </div>
        )}

        {/* Emergency List */}
        {loading ? (
          <p className="etw-label text-gray-500">Loading...</p>
        ) : emergencies.length === 0 ? (
          <div className="border border-dashed border-gray-300 p-10 text-center text-gray-500">
            No emergencies in the system yet.
          </div>
        ) : (
          <div className="space-y-4">
            {emergencies.map((e: any) => (
              <div key={e.id} className={`border-2 p-5 ${e.isActive ? "border-black" : "border-gray-300"}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-black text-lg">{e.title}</span>
                      {e.isSimulation && (
                        <span className="bg-yellow-200 text-yellow-900 text-xs font-bold px-2 py-0.5 uppercase">SIMULATION</span>
                      )}
                      {e.isActive ? (
                        <span className="bg-black text-white text-xs font-bold px-2 py-0.5 uppercase">ACTIVE / PUBLIC</span>
                      ) : e.resolvedAt ? (
                        <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 uppercase">CLOSED</span>
                      ) : (
                        <span className="border-2 border-orange-500 text-orange-600 text-xs font-bold px-2 py-0.5 uppercase">PENDING REVIEW</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {e.disasterType} · {e.severity || "Unknown severity"} · Reported: {new Date(e.reportedAt).toLocaleDateString()} · {e._count?.ngoMatches || 0} NGOs matched
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Districts: {JSON.parse(e.affectedDistricts || "[]").join(", ") || "None"}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {!e.isActive && !e.resolvedAt && (
                      <button onClick={() => handleAction(e.id, "approve")} className="etw-btn etw-btn-filled text-xs py-1 px-3">
                        ✓ APPROVE
                      </button>
                    )}
                    {e.isActive && (
                      <button onClick={() => handleAction(e.id, "close")} className="etw-btn text-xs py-1 px-3">
                        ✓ CLOSE
                      </button>
                    )}
                    {!e.resolvedAt && (
                      <button onClick={() => handleAction(e.id, "reject")} className="etw-btn text-xs py-1 px-3 text-gray-600">
                        ✕ REJECT
                      </button>
                    )}
                    {(e.isSimulation || !e.isActive) && (
                      <button onClick={() => handleDelete(e.id)} className="etw-btn text-xs py-1 px-3 text-red-600 border-red-300">
                        🗑 DELETE
                      </button>
                    )}
                  </div>
                </div>
                {e.description && (
                  <p className="text-sm text-gray-600 mt-2 border-t border-gray-100 pt-2">{e.description}</p>
                )}
                <div className="text-xs mt-2 text-gray-400">
                  Source: <a href={e.sourceUrl} target="_blank" rel="noreferrer" className="underline">{e.sourceName}</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
