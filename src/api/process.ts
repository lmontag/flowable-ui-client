import { api } from './client'

export type ProcessDefinition = { id: string; key: string; name: string; version: number; deploymentId?: string };

export async function listLatestDefinitions(){
  const d = await api('/flowable-rest/service/repository/process-definitions?latest=true&size=200');
  return d.data ?? d;
}

export async function listDefinitionsByKey(key: string){
  const d = await api(`/flowable-rest/service/repository/process-definitions?key=${encodeURIComponent(key)}&sort=version&order=desc&size=50`);
  return d.data ?? d;
}

export async function startProcessInstance(procDefId: string, variables?: Record<string, any>) {
  return api('/flowable-rest/service/runtime/process-instances', {
    method: 'POST',
    body: JSON.stringify({ processDefinitionId: procDefId, variables: mapVars(variables) }),
  });
}

export async function countInstancesByDefinition(defId: string){
  const d = await api('/flowable-rest/service/query/process-instances', { method: 'POST', body: JSON.stringify({ processDefinitionId: defId }) });
  return d.total ?? 0;
}

function mapVars(vars?: Record<string, any>) {
  if (!vars) return [];
  return Object.entries(vars).map(([name, value]) => ({ name, value }));
}