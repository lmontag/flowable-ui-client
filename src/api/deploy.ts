import { api } from './client'

export async function listDeployments(){
  const d = await api('/flowable-rest/service/repository/deployments?size=200&sort=deployTime&order=desc');
  return d.data ?? d;
}

export async function deleteDeployment(id: string){
  return api(`/flowable-rest/service/repository/deployments/${id}`, { method: 'DELETE' });
}

export async function uploadDeployment(file: File, tenantId?: string){
  const form = new FormData();
  form.append('file', file, file.name);
  if (tenantId) form.append('tenantId', tenantId);
  const res = await fetch(`/flowable-rest/service/repository/deployments`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}