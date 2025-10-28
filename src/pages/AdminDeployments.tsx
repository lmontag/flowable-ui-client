import { useEffect, useRef, useState } from 'react';
import { listDeployments, deleteDeployment, uploadDeployment } from '../api/deploy';
import MainLayout from '../components/MainLayout';

const USERNAME = (import.meta.env.VITE_FLOWABLE_USERNAME as string) || '';

export default function AdminDeployments() {
  const [items, setItems] = useState<any[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [tenant, setTenant] = useState('')

  const load = () => listDeployments().then(setItems).catch(console.error)
  useEffect(() => { load() }, [])

  async function onUpload() {
    const f = fileRef.current?.files?.[0]
  if (!f) return alert('Select a BPMN/ZIP file')
    setBusy('upload')
    try {
      await uploadDeployment(f, tenant || undefined)
      await load()
      if (fileRef.current) fileRef.current.value = ''
      setTenant('')
  alert('Deployment uploaded')
    } catch (e: any) { alert(e.message) } finally { setBusy(null) }
  }

  async function onDelete(id: string) {
  if (!confirm('Confirm delete?')) return
    setBusy(id)
    try { await deleteDeployment(id); await load() } catch (e: any) { alert(e.message) } finally { setBusy(null) }
  }

  return (
    <MainLayout>
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-3">Deployments</h1>
        <div className="flex items-center gap-2 mb-3">
          <input type="file" ref={fileRef} className="border rounded-xl p-1" />
          <input type="text" placeholder="tenantId (opzionale)" className="border rounded-xl px-2 py-1" value={tenant} onChange={e => setTenant(e.target.value)} />
          <button className="px-3 py-1.5 border rounded-xl" disabled={busy === 'upload'} onClick={onUpload}>{busy === 'upload' ? 'Uploading…' : 'Upload'}</button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(d => (
            <div key={d.id} className="border rounded-2xl p-3 bg-white">
              <div className="font-medium">{d.name || d.id}</div>
              <div className="text-xs opacity-60">id: {d.id} · time: {d.deploymentTime} · tenant: {d.tenantId || '—'}</div>
              <div className="mt-2">
                <button
                  className="px-3 py-1.5 border rounded-xl"
                  disabled={busy === d.id || USERNAME !== 'Admin'}
                  onClick={() => onDelete(d.id)}
                  title={USERNAME !== 'Admin' ? 'Only Admin can perform Delete' : ''}
                >
                  {busy === d.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}