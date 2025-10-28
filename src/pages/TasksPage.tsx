
import { useEffect, useMemo, useState } from 'react';
import { LucideCopy } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { listTasks, claimTask, completeTask, getTaskVariables, type Task } from '../api/task';
import { historicInstance } from '../api/instances';
import MainLayout from '../components/MainLayout';

const USERNAME = (import.meta.env.VITE_FLOWABLE_USERNAME as string) || '';

export default function TasksPage() {
  const loc = useLocation();
  const navigate = useNavigate();
  const qs = new URLSearchParams(loc.search);
  const qPi = qs.get('processInstanceId') || '';
  const qExec = qs.get('executionId') || '';

  const [tasks, setTasks] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [sel, setSel] = useState<Task | null>(null)
  const [vars, setVars] = useState<any[]>([])
  const [nameMap, setNameMap] = useState<Record<string,string>>({})
  // 3 campi di ricerca: testo (nameLike), taskId (id), processInstanceId
  const [filterText, setFilterText] = useState('')
  // const [filterTaskId, setFilterTaskId] = useState('')
  const [filterProcId, setFilterProcId] = useState(qPi)
  // Per debounce del filtro testo (1 secondo)
  const [debouncedFilterText, setDebouncedFilterText] = useState('')
  useEffect(() => {
    const h = setTimeout(() => setDebouncedFilterText(filterText), 1000)
    return () => clearTimeout(h)
  }, [filterText])

  // Nessuna paginazione: query solo su filtro e pageSize

  // Ogni modifica a filtro, paginazione o pageSize fa una chiamata server
  useEffect(() => {
    // Costruisci i parametri solo se i filtri sono valorizzati
    const params: Record<string, string> = { size: String(pageSize) };
    if (qPi) params.processInstanceId = qPi;
    if (qExec) params.executionId = qExec;

    // nameLike: solo se valorizzato, con wildcard %
    if (debouncedFilterText.trim()) {
      params['nameLike'] = `%${debouncedFilterText.trim()}%`;
    }
    // processInstanceId: solo se valorizzato
    if (filterProcId.trim()) {
      params['processInstanceId'] = filterProcId.trim();
    }

    // Se tutti i filtri sono vuoti (eccetto size, qPi, qExec), chiama senza filtri
    const onlyDefault = !debouncedFilterText.trim() && !filterProcId.trim();
    const queryParams = onlyDefault ? { size: String(pageSize), ...(qPi && { processInstanceId: qPi }), ...(qExec && { executionId: qExec }) } : params;

    listTasks(queryParams).then((resp) => {
      let items: Task[] = [];
      let totalCount = 0;
      if (resp && typeof resp === 'object') {
        if (Array.isArray((resp as any).items)) {
          items = (resp as any).items;
          totalCount = Number((resp as any).total || items.length || 0);
        } else if (Array.isArray(resp as any)) {
          items = resp as any;
          totalCount = items.length;
        }
      } else if (Array.isArray(resp)) {
        items = resp as Task[];
        totalCount = items.length;
      }
      setTasks(items);
      setTotal(totalCount);
    }).catch(console.error);
  }, [loc.search, pageSize, debouncedFilterText, filterProcId]);

  async function enhanceName(t: Task){
    if (!t.processInstanceId || nameMap[t.processInstanceId]) return
    const hi = await historicInstance(t.processInstanceId)
    const name = hi?.processDefinitionName || hi?.processDefinitionKey || ''
    setNameMap(m => ({...m, [t.processInstanceId!]: name}))
  }
  useEffect(()=>{ tasks.forEach(enhanceName) }, [tasks])

  // Nessun filtro locale: la lista è sempre quella del backend
  const filtered = useMemo(() => tasks, [tasks])

  async function claim(t: Task) { await claimTask(t.id); }
  async function complete(t: Task) { await completeTask(t.id); }
  async function open(t: Task) {
    setSel(t)
    const v = await getTaskVariables(t.id)
    setVars(Array.isArray(v) ? v : ((v as any)?.data ?? []))
  }

  const list = Array.isArray(filtered) ? filtered : []

  return (
    <MainLayout rightPanel={sel && (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Task details</h2>
          <button
            className="ml-2 px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium"
            onClick={() => setSel(null)}
            title="Close details"
          >
            Close
          </button>
        </div>
        <div className="text-sm flex items-center gap-1">
          ID: <span className="font-mono select-all">{sel.id}</span>
          <button
            className="hover:text-blue-600"
            title="Copy Task ID"
            onClick={() => {navigator.clipboard.writeText(sel.id)}}
            type="button"
          >
            <LucideCopy size={16} />
          </button>
        </div>
        <div className="text-sm"><b>Process:</b> {sel.processInstanceId ? (nameMap[sel.processInstanceId] || '…') : '—'}</div>
        <div className="text-sm mt-1">
          Assignee:{' '}
          {sel.assignee ? (
            <button
              className="underline cursor-pointer text-blue-700 hover:text-blue-900 px-0.5"
              style={{background: 'none', border: 'none', padding: 0, font: 'inherit'}}
              onClick={() => navigate(`/tasks?assignee=${encodeURIComponent(sel.assignee!)}`)}
              type="button"
            >{sel.assignee}</button>
          ) : '—'}
        </div>
        <div className="text-sm mt-1">
          Task Definition Key: <span className="font-mono select-all">{sel.taskDefinitionKey || '—'}</span>
        </div>
        <div className="text-sm mt-1">Process Instance: {sel.processInstanceId ? (
          <a className='underline cursor-pointer' onClick={()=>navigate(`/instances?select=${encodeURIComponent(sel.processInstanceId!)}`)}>{sel.processInstanceId}</a>
        ) : '—'}</div>
        <div className="mt-4">
          <div className="font-medium mb-1">Variables</div>
          <pre className="bg-gray-50 p-3 rounded-xl text-xs overflow-auto">{JSON.stringify(vars, null, 2)}</pre>
        </div>
      </div>
    )}>
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">
          My Tasks <span className='text-base opacity-60 font-normal'>({Array.isArray(list)? list.length : 0})</span>
        </h1>
        <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
          <input
            className="border rounded-lg px-3 py-2 flex-1"
            placeholder="Search by task name (nameLike)"
            value={filterText}
            onChange={e=>setFilterText(e.target.value)}
          />
          {/* Campo Task ID rimosso */}
          <input
            className="border rounded-lg px-3 py-2 w-44"
            placeholder="Process Instance ID"
            value={filterProcId}
            onChange={e=>setFilterProcId(e.target.value)}
          />
          <select
            className="border rounded-lg px-2 py-2"
            value={pageSize}
            onChange={e=>setPageSize(Number(e.target.value))}
          >
            <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
          </select>
          <span className="ml-auto text-sm opacity-70">{total} results</span>
        </div>
        {list.length === 0 ? (
          <div className="opacity-60 text-center py-8">No tasks found</div>
        ) : (
          <ul className="grid gap-4">
            {list.map(t => {
              const procName = t.processInstanceId ? (nameMap[t.processInstanceId] || '…') : '—'
              return (
                <li key={t.id} className="border rounded-2xl p-4 bg-white shadow-sm flex flex-col gap-2">
                  <div className="font-semibold text-lg">{t.name || t.id}</div>
                  <div className="text-sm"><b>Process:</b> {procName}</div>
                  <div className="text-xs opacity-60 flex flex-col gap-0.5">
                    <span className="flex items-center gap-1">
                      <span className="font-mono select-all">{t.id}</span>
                      <button
                        className="hover:text-blue-600"
                        title="Copy Task ID"
                        onClick={() => {navigator.clipboard.writeText(t.id)}}
                        type="button"
                      >
                        <LucideCopy size={14} />
                      </button>
                    </span>
                    <span>
                      Assignee:{' '}
                      {t.assignee ? (
                        <button
                          className="underline cursor-pointer text-blue-700 hover:text-blue-900 px-0.5"
                          style={{background: 'none', border: 'none', padding: 0, font: 'inherit'}}
                          onClick={() => navigate(`/tasks?assignee=${encodeURIComponent(t.assignee!)}`)}
                          type="button"
                        >{t.assignee}</button>
                      ) : 'unassigned'}
                    </span>
                    <span>
                      Task Definition Key: <span className="font-mono select-all">{t.taskDefinitionKey || '—'}</span>
                    </span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg border bg-white hover:bg-blue-50 text-blue-700 font-medium transition" onClick={() => open(t)}>Open</button>
                    {!t.assignee && (
                      <button
                        className={`px-3 py-1.5 rounded-lg border font-medium transition ${USERNAME !== 'Admin' ? 'bg-gray-300/50 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-blue-50 text-blue-700'}`}
                        onClick={() => claim(t)}
                        disabled={USERNAME !== 'Admin'}
                        title={USERNAME !== 'Admin' ? 'Only Admin can perform Claim' : ''}
                      >
                        Claim
                      </button>
                    )}
                    <button
                      className={`px-3 py-1.5 rounded-lg border font-medium transition ${USERNAME !== 'Admin' ? 'bg-gray-300/50 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-blue-50 text-blue-700'}`}
                      onClick={() => complete(t)}
                      disabled={USERNAME !== 'Admin'}
                      title={USERNAME !== 'Admin' ? 'Only Admin can perform Complete' : ''}
                    >
                      Complete
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </MainLayout>
  )
}
