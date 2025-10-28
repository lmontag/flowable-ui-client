
export async function listRuntimeInstances(params: Record<string,string> = {}){
  const query = new URLSearchParams({ size: '10', ...params }).toString();
  const d = await api(`/flowable-rest/service/runtime/process-instances?${query}`);
  return d.data ?? d;
}
import { api } from './client'

export async function listInstances(params: Record<string,string> = {}){
  const query = new URLSearchParams({ size: '50', ...params }).toString();
  const d = await api(`/flowable-rest/service/runtime/process-instances?${query}`);
  return d.data ?? d;
}

export async function historicActiveInstances(params: Record<string,string> = {}){
  const query = new URLSearchParams({ unfinished: 'true', size: '100', sort: 'startTime', order: 'desc', ...params }).toString();
  const d = await api(`/flowable-rest/service/history/historic-process-instances?${query}`);
  return d.data ?? d;
}

export async function historicInstance(piId: string){
  const d = await api(`/flowable-rest/service/history/historic-process-instances?processInstanceId=${encodeURIComponent(piId)}`);
  const arr = d.data ?? d;
  return Array.isArray(arr) ? (arr[0] || null) : null;
}

export async function runtimeVariables(piId: string){
  return api(`/flowable-rest/service/runtime/process-instances/${piId}/variables`);
}

export async function currentTasks(piId: string){
  const d = await api(`/flowable-rest/service/runtime/tasks?processInstanceId=${piId}`);
  return d.data ?? d;
}

export async function historicPath(piId: string){
  const d = await api(`/flowable-rest/service/history/historic-activity-instances?processInstanceId=${piId}&sort=startTime&order=asc`);
  return d.data ?? d;
}

export function diagramUrl(piId: string){
  return `/flowable-rest/service/runtime/process-instances/${piId}/diagram`;
}

export async function failedJobs(piId: string){
  const d = await api(`/flowable-rest/service/management/jobs?withException=true&processInstanceId=${piId}`);
  return d.data ?? d;
}

export async function deadletterJobs(piId: string){
  const d = await api(`/flowable-rest/service/management/deadletter-jobs?processInstanceId=${piId}`);
  return d.data ?? d;
}
export async function listFailedJobsAll(){
  const d = await api(`/flowable-rest/service/management/jobs?withException=true`);
  return d.data ?? d;
}
export async function listDeadletterJobsAll(){
  const d = await api(`/flowable-rest/service/management/deadletter-jobs`);
  return d.data ?? d;
}
