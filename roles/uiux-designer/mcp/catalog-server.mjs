/** Read-only, stdio MCP. No shell, filesystem-write or arbitrary-path tool. */
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
const catalog = JSON.parse(await readFile(new URL('../catalog/materials.json', import.meta.url), 'utf8'));
const schemas = [
  { name: 'uiux_list_materials', description: 'UIUX designer only: search local licensed/original proposal records.', inputSchema: { type: 'object', properties: { query: { type: 'string', maxLength: 200 }, category: { type: 'string', enum: catalog.categories } }, additionalProperties: false } },
  { name: 'uiux_get_material', description: 'UIUX designer only: get one proposal, source/license and local preview link.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false } },
  { name: 'uiux_catalog_status', description: 'UIUX designer only: inspect catalog scope and availability.', inputSchema: { type: 'object', properties: {}, additionalProperties: false } },
].map(tool => ({ ...tool, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } }));
const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
for await (const line of input) {
  if (!line.trim()) continue;
  let request;
  try {
    request = JSON.parse(line);
    if (request.id === undefined) continue;
    let result;
    if (request.method === 'initialize') result = { protocolVersion: '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'uiux-material-catalog', version: '1.0.0' }, instructions: 'UIUX designer proposal workspace only. Saved candidates are not publication approval.' };
    else if (request.method === 'ping') result = {};
    else if (request.method === 'tools/list') result = { tools: schemas };
    else if (request.method === 'tools/call') {
      const { name, arguments: args = {} } = request.params ?? {};
      if (!schemas.some(tool => tool.name === name)) throw new Error('Unknown tool');
      if (!args || typeof args !== 'object' || Array.isArray(args)) throw new Error('Arguments must be an object');
      const schema = schemas.find(tool => tool.name === name).inputSchema;
      if (Object.keys(args).some(key => !(key in schema.properties))) throw new Error('Unexpected argument');
      let data;
      if (name === 'uiux_catalog_status') data = { role: catalog.role, count: catalog.materials.length, categories: catalog.categories, preview: 'http://127.0.0.1:4175/', productionIntegrated: false };
      else if (name === 'uiux_get_material') {
        data = catalog.materials.find(material => material.id === args.id);
        if (!data) throw new Error('Unknown material ID');
        data = { ...data, preview: `http://127.0.0.1:4175/?material=${data.id}` };
      } else {
        if (args.query !== undefined && (typeof args.query !== 'string' || args.query.length > 200)) throw new Error('Invalid search query');
        if (args.category !== undefined && !catalog.categories.includes(args.category)) throw new Error('Unknown category');
        const query = (args.query ?? '').toLowerCase();
        data = catalog.materials.filter(material => (!args.category || material.category === args.category) && `${material.name} ${material.description} ${material.proposal}`.toLowerCase().includes(query)).map(({ id, name, category, recommendation, license }) => ({ id, name, category, recommendation, license, preview: `http://127.0.0.1:4175/?material=${id}` }));
      }
      result = { content: [{ type: 'text', text: JSON.stringify(data) }] };
    } else { process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: request.id, error: { code: -32601, message: 'Method not found' } }) + '\n'); continue; }
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: request.id, result }) + '\n');
  } catch (error) { process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: request?.id ?? null, error: { code: request ? -32602 : -32700, message: error.message } }) + '\n'); }
}
