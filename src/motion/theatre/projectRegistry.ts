import { getProject, type IProject } from '@theatre/core';

const projects = new Map<string, { revision: string; state: string; project: IProject; active: boolean }>();

export function acquireProject(id: string, revision: string, state: unknown) {
  const serialized = JSON.stringify(state);
  if (!serialized || !state || typeof state !== 'object') throw new Error('An exported Theatre state is required.');
  let record = projects.get(id);
  if (record && (record.revision !== revision || record.state !== serialized)) throw new Error(`Motion state changed for ${id}; export work and reload the authoring session.`);
  if (record?.active) throw new Error(`Scene ${id} already has an active controller.`);
  if (!record) {
    record = { revision, state: serialized, project: getProject(id, { state }), active: false };
    projects.set(id, record);
  }
  record.active = true;
  return { project: record.project, release: () => { record.active = false; } };
}
