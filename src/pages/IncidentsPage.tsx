import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listFailedJobsAll, listDeadletterJobsAll } from '../api/instances'
import MainLayout from '../components/MainLayout'

type Item = any

export default function IncidentsPage() {
  const navigate = useNavigate()
  const [failed, setFailed] = useState<Item[]>([])
  const [dead, setDead] = useState<Item[]>([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    Promise.all([listFailedJobsAll(), listDeadletterJobsAll()])
      .then(([f, d]) => {
        setFailed(Array.isArray(f) ? f : (f?.data || []))
        setDead(Array.isArray(d) ? d : (d?.data || []))
      })
      .catch(console.error)
  }, [])

  const all = useMemo(() => {
    const arr = [
      ...(failed.map(it => ({ ...it, _source: 'failed' }))),
      ...(dead.map(it => ({ ...it, _source: 'deadletter' }))),
    ]
    // naive sort by dueDate/creation if present
    return arr.sort((a, b) => String(b.dueDate || b.createTime || '').localeCompare(String(a.dueDate || a.createTime || '')))
  }, [failed, dead])

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase()
    if (!f) return all
    return all.filter(it =>
      String(it.id || '').toLowerCase().includes(f) ||
      String(it.processInstanceId || '').toLowerCase().includes(f) ||
      String(it.executionId || '').toLowerCase().includes(f) ||
      String(it.jobType || it.jobHandlerType || '').toLowerCase().includes(f) ||
      String(it.exceptionMessage || '').toLowerCase().includes(f)
    )
  }, [all, filter])

  function componentType(it: any): string {
    // Heuristic: if there's a runtime task bound to execution, it would be 'User Task' (but here we don't fetch per item for perf).
    // So we infer from jobType/handler and presence of executionId.
    const jt = (it.jobType || it.jobHandlerType || '').toLowerCase()
    if (jt.includes('timer')) return 'Timer'
    if (jt.includes('async')) return 'Async (Service/Gateway)'
    if (it.executionId) return 'Execution (flow node)'
    return 'Job'
  }

  return (
    <MainLayout>
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-3">Incidents</h1>
        <div className="mb-3 flex items-center gap-2">
          <input className="border rounded-xl px-3 py-1.5 w-full" placeholder="Filtra per id, processInstanceId, executionId, tipo, messaggio..." value={filter} onChange={e => setFilter(e.target.value)} />
        </div>
        <ul className="space-y-2">
          {filtered.map((it: any) => (
            <li key={`${it._source}-${it.id}`} className="border rounded-2xl p-3 bg-white">
              <div className="font-medium">{componentType(it)} <span className="text-xs opacity-60">[{it._source}]</span></div>
              <div className="text-xs opacity-60">
                id: <span className="font-mono">{it.id}</span> · pi: {it.processInstanceId ? (<a className="underline cursor-pointer" onClick={() => navigate(`/instances?select=${encodeURIComponent(it.processInstanceId)}`)}>{it.processInstanceId}</a>) : '—'} · exec: {it.executionId ? (<a className="underline cursor-pointer" onClick={() => navigate(`/tasks?executionId=${encodeURIComponent(it.executionId)}`)}>{it.executionId}</a>) : '—'}
              </div>
              <div className="mt-1 text-sm break-words">{it.exceptionMessage || '—'}</div>
            </li>
          ))}
          {filtered.length === 0 && <li className="opacity-60">Nessun incident</li>}
        </ul>
      </div>
    </MainLayout>
  )
}
