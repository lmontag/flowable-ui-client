
import { useEffect, useMemo, useState } from 'react'
import { LucideCopy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom'
import { runtimeVariables, currentTasks, historicPath, failedJobs, deadletterJobs, diagramUrl, listRuntimeInstances, historicInstance } from '../api/instances'
import MainLayout from '../components/MainLayout'

// Utility function to format date (must be outside component)
function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr || '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

type Row = any

export default function InstancesPage() {
// Helper to ensure processDefinitionKey is present in each row
function ensureKey(row: any): any {
  if (row.processDefinitionKey) return row;
  // Try to extract from processDefinitionId (format: key:version:id)
  if (row.processDefinitionId && typeof row.processDefinitionId === 'string') {
    const parts = row.processDefinitionId.split(':');
    if (parts.length >= 1) {
      return { ...row, processDefinitionKey: parts[0] };
    }
  }
  return row;
}

  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const loc = useLocation();
  const qs = new URLSearchParams(loc.search);
  const defaultDefKey = qs.get('defKey') || '';
  const defaultDefId = qs.get('defId') || '';
  const selectPi = qs.get('select') || '';

  const [rows, setRows] = useState<Row[]>([])
  const [keyMap, setKeyMap] = useState<Record<string, string>>({});
  const [total, setTotal] = useState(0)
  // Filters: processInstanceId, processDefinitionKey, size
  const [filterProcessInstanceId, setFilterProcessInstanceId] = useState(qs.get('id') || '')
  const [filterDefKey, setFilterDefKey] = useState(defaultDefKey)
  const [size, setSize] = useState(qs.get('size') || '10')
  const [sel, setSel] = useState<Row | null>(null)
  const [vars, setVars] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [hist, setHist] = useState<any[]>([])
  const [errs, setErrs] = useState<any>([])
  const [dead, setDead] = useState<any>([])
  const [taskCountMap, setTaskCountMap] = useState<Record<string, number>>({})
  const [incidentCountMap, setIncidentCountMap] = useState<Record<string, number>>({})


  // Ogni modifica a filtro o size fa una chiamata server
  useEffect(() => {
    const params: Record<string, string> = { size: String(size) };
    if (filterProcessInstanceId.trim()) params.id = filterProcessInstanceId.trim();
    if (filterDefKey.trim()) params.processDefinitionKey = filterDefKey.trim();
    listRuntimeInstances(params)
      .then((resp) => {
        let items = [];
        let total = 0;
        if (resp && typeof resp === 'object') {
          if (Array.isArray(resp.items)) {
            items = resp.items;
            total = Number(resp.total || items.length || 0);
          } else if (Array.isArray(resp)) {
            items = resp;
            total = items.length;
          }
        } else if (Array.isArray(resp)) {
          items = resp;
          total = items.length;
        }
        setRows(items);
        setTotal(total);
      })
      .catch(console.error);
  }, [filterProcessInstanceId, filterDefKey, size, loc.search]);

  useEffect(() => {
    async function enrich() {
      const baseRows = Array.isArray(rows) ? rows : [];
      const limited = baseRows.slice(0, 100);
      for (const r of limited) {
        if (taskCountMap[r.id] === undefined) {
          try {
            const t = await currentTasks(r.id);
            const n = Array.isArray(t) ? t.length : t.data?.length || 0;
            setTaskCountMap((m) => ({ ...m, [r.id]: n }));
          } catch {}
        }
        if (incidentCountMap[r.id] === undefined) {
          try {
            const [fj, dj] = await Promise.all([failedJobs(r.id), deadletterJobs(r.id)]);
            const nf = Array.isArray(fj) ? fj.length : fj.data?.length || 0;
            const nd = Array.isArray(dj) ? dj.length : dj.data?.length || 0;
            setIncidentCountMap((m) => ({ ...m, [r.id]: nf + nd }));
          } catch {}
        }
      }
      if (selectPi) {
        const found = rows.find((r) => String(r.id) === selectPi);
        if (found) open(found);
      }
    }
    if (rows.length) enrich();
  }, [rows]);

  // Show processDefinitionKey if present, or extract from processDefinitionId, or fetch if needed
  useEffect(() => {
    // For rows missing key, try to fetch details if not already in keyMap and processDefinitionId does not contain a colon
    rows.forEach(r => {
      if (!r.processDefinitionKey && !keyMap[r.id]) {
        // If processDefinitionId is present and contains a colon, extract the key directly
        if (r.processDefinitionId && typeof r.processDefinitionId === 'string' && r.processDefinitionId.includes(':')) {
          const parts = r.processDefinitionId.split(':');
          if (parts.length > 0) {
            setKeyMap(m => ({ ...m, [r.id]: parts[0] }));
          }
        } else {
          // Otherwise, fetch the instance details to get the processDefinitionId
          historicInstance(r.id).then(inst => {
            if (inst && inst.processDefinitionId && typeof inst.processDefinitionId === 'string' && inst.processDefinitionId.includes(':')) {
              const parts = inst.processDefinitionId.split(':');
              if (parts.length > 0) {
                setKeyMap(m => ({ ...m, [r.id]: parts[0] }));
              }
            }
          });
        }
      }
    });
  }, [rows, keyMap]);

  const filtered = useMemo(() => {
    return rows.map(r => {
      if (r.processDefinitionKey) return r;
      if (keyMap[r.id]) return { ...r, processDefinitionKey: keyMap[r.id] };
      if (r.processDefinitionId && typeof r.processDefinitionId === 'string' && r.processDefinitionId.includes(':')) {
        const parts = r.processDefinitionId.split(':');
        if (parts.length > 0) {
          return { ...r, processDefinitionKey: parts[0] };
        }
      }
      return r;
    });
  }, [rows, incidentCountMap, keyMap]);

  async function open(pi: any) {
    setSel(pi);
    const [v, t, h, e, d] = await Promise.all([
      runtimeVariables(pi.id),
      currentTasks(pi.id),
      historicPath(pi.id),
      failedJobs(pi.id),
      deadletterJobs(pi.id),
    ]);
    setVars(v);
    setTasks(t);
    setHist(h);
    setErrs(e);
    setDead(d);
  }

  const toArr = (v: any) => (Array.isArray(v) ? v : v && v.data ? v.data : []);
  const incidentsList = [...toArr(errs), ...toArr(dead)];

  return (
    <>
      <MainLayout
        rightPanel={
          sel && (
            <div className="space-y-4 relative">
              <button
                className="absolute top-0 right-0 mt-2 mr-2 px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium z-10"
                onClick={() => setSel(null)}
                title="Close details"
              >
                Close
              </button>
              <div>
                <div className="font-medium mb-2">Diagram (highlighted)</div>
                <img
                  className="border rounded-xl max-w-full cursor-pointer hover:shadow-lg transition"
                  src={diagramUrl(sel.id)}
                  alt="process diagram"
                  onClick={() => setShowModal(true)}
                  title="Click to enlarge"
                />
              </div>
              <div className="text-sm">ID: {sel.id}</div>
              <div className="text-sm">Process: {sel.processDefinitionName || sel.processDefinitionKey || sel.processDefinitionId}</div>
              <div className="text-sm">Started: {sel.startTime || '—'}</div>
              <div>
                <div className="font-medium mb-1">Current tasks</div>
                {Array.isArray(tasks) && tasks.length > 0 ? (
                  <ul className="space-y-1">
                    {tasks.map((task: any) => (
                      <li key={task.id} className="flex flex-wrap items-center gap-2 text-xs bg-gray-50 rounded p-2">
                        <span className="flex items-center gap-1">
                          <span className="font-mono select-all">{task.id}</span>
                          <button
                            className="hover:text-blue-600"
                            title="Copy Task ID"
                            onClick={() => {navigator.clipboard.writeText(task.id)}}
                            type="button"
                          >
                            <LucideCopy size={14} />
                          </button>
                        </span>
                        <span className="opacity-60">·</span>
                        <span>{task.name}</span>
                        {task.assignee && (
                          <>
                            <span className="opacity-60">·</span>
                            <span>
                              assignee: <button
                                className="underline cursor-pointer text-blue-700 hover:text-blue-900 px-0.5"
                                style={{background: 'none', border: 'none', padding: 0, font: 'inherit'}}
                                onClick={() => navigate(`/tasks?assignee=${encodeURIComponent(task.assignee)}`)}
                                type="button"
                              >{task.assignee}</button>
                            </span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="opacity-60 text-xs">No current tasks</div>
                )}
              </div>
              <div>
                <div className="font-medium">Variables</div>
                <pre className="bg-gray-50 p-3 rounded-xl text-xs overflow-auto">{JSON.stringify(vars, null, 2)}</pre>
              </div>
              <div>
                <div className="font-medium">Incidents</div>
                <ul className="text-sm list-disc pl-5">
                  {incidentsList.map((it: any, idx: number) => {
                    const exec = it.executionId;
                    const type = it.jobType || it.jobHandlerType || 'job';
                    const msg = it.exceptionMessage || (it.retries === 0 ? 'deadletter' : '');
                    return (
                      <li key={idx} className="mb-1">
                        <span className="font-mono text-xs">{it.id}</span> · {type}
                        {exec ? (
                          <>
                            {' '}
                            (<a
                              className="underline cursor-pointer"
                              onClick={() => navigate(`/tasks?executionId=${encodeURIComponent(exec)}`)}
                            >
                              go to tasks
                            </a>)
                          </>
                        ) : null}
                        {msg ? <> — {msg}</> : null}
                      </li>
                    );
                  })}
                  {incidentsList.length === 0 && <li className="opacity-60">No incidents</li>}
                </ul>
              </div>
              <div>
                <div className="font-medium">History</div>
                <pre className="bg-gray-50 p-3 rounded-xl text-xs overflow-auto">{JSON.stringify(hist, null, 2)}</pre>
              </div>
            </div>
          )
        }
      >
        <div className="max-w-4xl mx-auto w-full">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">Process Instances</h1>
          <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <input
              className="border rounded-lg px-3 py-2 w-44"
              placeholder="Process Instance ID"
              value={filterProcessInstanceId}
              onChange={e => setFilterProcessInstanceId(e.target.value)}
              name="id"
            />
            <input
              className="border rounded-lg px-3 py-2 w-44"
              placeholder="Process Definition Key"
              value={filterDefKey}
              onChange={e => setFilterDefKey(e.target.value)}
              name="processDefinitionKey"
            />
            <select
              className="border rounded-lg px-2 py-2 w-28"
              value={size}
              onChange={e => setSize(e.target.value)}
              name="size"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="ml-auto text-sm opacity-70">{rows.length} results</span>
          </div>
          {filtered.length === 0 ? (
            <div className="opacity-60 text-center py-8">No instances found</div>
          ) : (
            <ul className="grid gap-4">
              {filtered.map((r) => (
                <li key={r.id} className="border rounded-2xl p-4 bg-white shadow-sm flex flex-col gap-2">
                  <div className="font-semibold text-lg flex flex-wrap items-center gap-2">
                    {r.processDefinitionName || r.processDefinitionKey || r.processDefinitionId}
                  </div>
                  <div className="text-xs opacity-60 flex flex-col gap-1">
                    <span className="flex items-center gap-1">
                      id: <span className="font-mono select-all">{r.id}</span>
                      <button
                        className="hover:text-blue-600"
                        title="Copy ID"
                        onClick={() => {navigator.clipboard.writeText(r.id)}}
                        type="button"
                      >
                        <LucideCopy size={16} />
                      </button>
                    </span>
                    {r.processDefinitionKey && (
                      <span className="flex items-center gap-1">
                        key: <span className="font-mono select-all">{r.processDefinitionKey}</span>
                        <button
                          className="hover:text-blue-600"
                          title="Copy Key"
                          onClick={() => {navigator.clipboard.writeText(r.processDefinitionKey)}}
                          type="button"
                        >
                          <LucideCopy size={16} />
                        </button>
                      </span>
                    )}
                    <span>businessKey: {r.businessKey || '—'}</span>
                    <span>suspended: {String(r.suspended ?? false)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <button
                      className="px-2 py-0.5 border rounded-full hover:bg-gray-50"
                      onClick={() => navigate(`/tasks?processInstanceId=${encodeURIComponent(r.id)}`)}
                    >
                      tasks: {taskCountMap[r.id] ?? '…'}
                    </button>
                    <span
                      className={`px-2 py-0.5 border rounded-full ${
                        (incidentCountMap[r.id] || 0) > 0 ? 'bg-red-50' : ''
                      }`}
                    >
                      incident {incidentCountMap[r.id] ?? 0}
                    </span>
                    <span className="px-2 py-0.5 border rounded-full bg-gray-50">
                      {formatDateTime(r.startTime)}
                    </span>
                  </div>
                  <button
                    className="mt-2 px-3 py-1.5 border rounded-xl"
                    onClick={() => open(r)}
                  >
                    Open
                  </button>
                </li>
              ))}

            </ul>
          )}
        </div>
      </MainLayout>
      {/* Modal for large diagram */}
      {showModal && sel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-2xl p-6 relative max-w-4xl w-full flex flex-col items-center">
            <button
              className="absolute top-3 right-3 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
            <img
              src={diagramUrl(sel.id)}
              alt="process diagram large"
              className="max-h-[80vh] w-auto border rounded-xl shadow"
              style={{ maxWidth: '90vw' }}
            />
          </div>
        </div>
      )}
    </>
  );
}