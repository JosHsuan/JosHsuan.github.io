import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { projects, lab } from '../src/content/portfolio.ts'

type Atom = { type: string; start: number; end: number; body: number }
function atoms(buffer: Buffer, start = 0, end = buffer.length): Atom[] {
  const result: Atom[] = []
  for (let offset = start; offset < end;) {
    assert.ok(offset + 8 <= end, 'Complete MP4 atom header')
    const size = buffer.readUInt32BE(offset)
    assert.ok(size >= 8 && offset + size <= end, 'Valid MP4 atom bounds')
    result.push({type:buffer.toString('ascii',offset+4,offset+8),start:offset,body:offset+8,end:offset+size})
    offset += size
  }
  return result
}

test('source-derived clips have one case figure, a still poster and exact provenance', () => {
  const media = [...projects,...lab].flatMap(p => [p.cover,...p.gallery]).filter(m => m.video)
  const provenance = JSON.parse(readFileSync('docs/motion-provenance.json','utf8'))
  assert.equal(media.length,26)
  assert.equal(new Set(media.map(m => m.id)).size,media.length)
  assert.deepEqual(new Set(provenance.map((p: {id:string}) => p.id)),new Set(media.map(m=>m.id)))
  assert.deepEqual(new Set(readdirSync('public/media').filter(p=>p.endsWith('.mp4'))),new Set(media.map(m=>`${m.id}.mp4`)))
  for (const m of media) {
    const source = provenance.find((p: {id:string})=>p.id===m.id)
    assert.ok(source.source && source.duration > 0, m.id)
    assert.equal(m.video?.duration,source.duration)
    assert.equal(m.video?.label,source.label)
    assert.ok(readFileSync(`public/media/${m.id}.webp`).length > 0)
    const buffer = readFileSync(`public${source.export}`)
    assert.equal(buffer.length,source.bytes,m.id)
    const top = atoms(buffer)
    assert.equal(top[0].type,'ftyp')
    const moov = top.find(a=>a.type==='moov')!
    const mdat = top.find(a=>a.type==='mdat')!
    assert.ok(moov && mdat && moov.start < mdat.start,`${m.id}: MP4 metadata precedes video data for streaming`)
    const children = atoms(buffer,moov.body,moov.end)
    const mvhd = children.find(a=>a.type==='mvhd')!
    assert.equal(buffer[mvhd.body],0)
    const timescale = buffer.readUInt32BE(mvhd.body+12)
    const duration = buffer.readUInt32BE(mvhd.body+16)/timescale
    assert.ok(Math.abs(duration-source.duration) < .15,`${m.id}: duration ${duration} matches the source sequence ${source.duration}`)
    const tracks = children.filter(a=>a.type==='trak')
    assert.equal(tracks.length,1,`${m.id}: visual recording only`)
    const mdia = atoms(buffer,tracks[0].body,tracks[0].end).find(a=>a.type==='mdia')!
    const hdlr = atoms(buffer,mdia.body,mdia.end).find(a=>a.type==='hdlr')!
    assert.equal(buffer.toString('ascii',hdlr.body+8,hdlr.body+12),'vide')
  }
})
