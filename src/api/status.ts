import { BASE_URL } from './client'

import { listFailedJobsAll } from './instances'

export async function checkFlowableStatus() {
  try {
    await listFailedJobsAll();
    return true;
  } catch {
    return false;
  }
}
