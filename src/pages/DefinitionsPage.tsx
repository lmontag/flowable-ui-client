import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listLatestDefinitions, listDefinitionsByKey, startProcessInstance, countInstancesByDefinition, type ProcessDefinition } from '../api/process'
import MainLayout from '../components/MainLayout'

type Group = { key: string; items: ProcessDefinition[] }

export default function DefinitionsPage() {
  const navigate = useNavigate();
  const [defs, setDefs] = useState<ProcessDefinition[]>([])
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [modal, setModal] = useState<{defId:string}|null>(null)
  const [formVars, setFormVars] = useState<{name:string,value:string}[]>([{name:'',value:''}])

  useEffect(() => {
    listLatestDefinitions().then(async (ds) => {
      setDefs(ds);
      try {
        const m: Record<string, number> = {};
        for (const d of ds) {
          try { m[d.id] = await countInstancesByDefinition(d.id) } catch {}
        }
        setCounts(m);
      } catch (e) { console.error(e) }
    }).catch(console.error)
  }, [])

  const groups = useMemo(() => {
    const byKey: Record<string, ProcessDefinition[]> = {}
    defs.forEach(d => { (byKey[d.key] ||= []).push(d) })
    return Object.entries(byKey).map(([key, items]) => ({ key, items })) as Group[]
  }, [defs])

  async function toggle(key: string){
    setExpandedKey(k => k===key? null : key)
    if (expandedKey !== key) {
      const versions = await listDefinitionsByKey(key)
      setDefs(prev => {
        const others = prev.filter(d => d.key !== key)
        return [...others, ...versions]
      })
      const m: Record<string, number> = {}
      for (const v of versions) {
        try { m[v.id] = await countInstancesByDefinition(v.id) } catch {}
      }
      setCounts(c => ({...c, ...m}))
    }
  }

  function setVar(i:number, field:'name'|'value', val:string){
    setFormVars(v => v.map((r,idx)=> idx===i? {...r, [field]: val} : r))
  }
  function addVar(){ setFormVars(v => [...v, {name:'', value:''}]) }
  function rmVar(i:number){ setFormVars(v => v.filter((_,idx)=> idx!==i)) }

  async function start(defId:string){
    const vars = Object.fromEntries(formVars.filter(v=>v.name).map(v=>[v.name, v.value]))
    try {
      await startProcessInstance(defId, vars)
      alert('Process instance started')
      setModal(null); setFormVars([{name:'', value:''}])
    } catch (e:any) {
      const raw = String(e?.message || e || '')
      let serverMsg = ''
      let exceptionMsg = ''
      try {
        const jsonStart = raw.indexOf('{')
        if (jsonStart >= 0) {
          const maybeJson = raw.slice(jsonStart)
          const parsed = JSON.parse(maybeJson)
          serverMsg = parsed?.message || parsed?.error || ''
          exceptionMsg = parsed?.exception || ''
        }
      } catch {}
      alert(`Impossibile avviare il processo.\n${serverMsg || raw}${exceptionMsg ? '\nException: ' + exceptionMsg : ''}`)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">Process Definitions</h1>
        <div className="grid gap-6">
          {groups.sort((a,b)=>a.key.localeCompare(b.key)).map(g => {
            const latest = defs.filter(d=>d.key===g.key).sort((a,b)=>b.version-a.version)[0]
            const countVal = latest ? counts[latest.id] : undefined
            return (
              <div key={g.key} className="rounded-2xl bg-white shadow-sm border">
                <button className="w-full text-left px-6 py-4 font-semibold flex items-center justify-between text-lg hover:bg-gray-50 rounded-t-2xl" onClick={()=>toggle(g.key)}>
                  <span className="flex items-center gap-2">
                    {g.key}
                    <button
                      title="Apri istanze"
                      className="ml-2 text-xs px-2 py-0.5 border rounded-full hover:bg-blue-50 border-blue-200 text-blue-700"
                      onClick={(e)=>{ e.stopPropagation(); if(latest) navigate(`/instances?defKey=${encodeURIComponent(g.key)}`) }}
                    >{(countVal===undefined)?'…':String(countVal)}</button>
                  </span>
                  <span className="text-xs opacity-60">{expandedKey===g.key ? '▼' : '▶'}</span>
                </button>
                {expandedKey===g.key && (
                  <div className="px-6 pb-4">
                    {defs.filter(d=>d.key===g.key).sort((a,b)=>b.version-a.version).map(d => (
                      <div key={d.id} className="flex items-center justify-between border rounded-xl p-4 mb-3 bg-gray-50">
                        <div>
                          <div className="font-semibold text-base">{d.name || d.key} <span className="text-xs opacity-60">v{d.version}</span></div>
                          <div className="text-xs opacity-60">defId: {d.id} · deploy: {d.deploymentId}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="text-sm hover:underline text-blue-700" onClick={()=>navigate(`/instances?defKey=${encodeURIComponent(d.key)}`)}>
                            # istanze: <b>{(counts[d.id]===undefined)?'…':counts[d.id]}</b>
                          </button>
                          <button className="px-3 py-1.5 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 font-medium transition" onClick={()=>setModal({defId:d.id})}>Start…</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {modal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border">
              <div className="font-semibold mb-2 text-lg">Start process (variables)</div>
              <div className="space-y-2 max-h-80 overflow-auto">
                {formVars.map((v,i)=>(
                  <div key={i} className="flex gap-2">
                    <input className="border rounded-lg px-2 py-1 flex-1" placeholder="name" value={v.name} onChange={e=>setVar(i,'name',e.target.value)} />
                    <input className="border rounded-lg px-2 py-1 flex-1" placeholder="value" value={v.value} onChange={e=>setVar(i,'value',e.target.value)} />
                    <button className="px-2 border rounded-lg" onClick={()=>rmVar(i)}>−</button>
                  </div>
                ))}
                <button className="px-3 py-1.5 border rounded-lg" onClick={addVar}>+ Add variable</button>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button className="px-3 py-1.5 border rounded-lg" onClick={()=>setModal(null)}>Cancel</button>
                <button className="px-3 py-1.5 border rounded-lg bg-blue-600 text-white hover:bg-blue-700" onClick={()=>start(modal.defId)}>Start</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}