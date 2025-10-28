import { api } from './client'

export type Task = { id: string; name: string; assignee?: string; processInstanceId?: string; createTime?: string; executionId?: string; taskDefinitionKey?: string };

export async function listTasks(params: Record<string,string> = {}){
  const query = new URLSearchParams({ size:'50', ...params }).toString();
  const d = await api(`/flowable-rest/service/runtime/tasks?${query}`);
  // Map taskDefinitionKey if present
  const arr = d.data ?? d;
  if (Array.isArray(arr)) {
    return arr.map((t: any) => ({ ...t, taskDefinitionKey: t.taskDefinitionKey }));
  }
  return arr;
}

export async function listMyTasks(){
  return listTasks()
}

export async function claimTask(id: string){
  return api(`/flowable-rest/service/runtime/tasks/${id}`, { method: 'POST', body: JSON.stringify({ action: 'claim' }) });
}

export async function completeTask(id: string, variables?: Record<string, any>){
  return api(`/flowable-rest/service/runtime/tasks/${id}`, { method: 'POST', body: JSON.stringify({ action: 'complete', variables: mapVars(variables) }) });
}

export async function getTaskVariables(id: string){
  return api(`/flowable-rest/service/runtime/tasks/${id}/variables`);
}

function mapVars(vars?: Record<string, any>) {
  if (!vars) return [];
  return Object.entries(vars).map(([name, value]) => ({ name, value }));
}