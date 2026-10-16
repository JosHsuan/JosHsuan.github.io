/** Three-column editorial space starts at nine cells and grows by full rows.
 * Only the supplied, approved projects become list items; empty cells are layout.
 */
export function projectGridRows(projectCount){
  if(!Number.isInteger(projectCount)||projectCount<0)throw TypeError('A non-negative project count is required');
  return Math.max(3,Math.ceil(projectCount/3));
}
