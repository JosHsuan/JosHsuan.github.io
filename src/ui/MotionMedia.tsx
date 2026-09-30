import { useEffect, useRef, useState } from 'react'
import type { Media } from '../content/portfolio'
import { mediaUrl } from './ProjectCard'

export const videoUrl = (media: Media) => `/media/${media.id}.mp4`

export default function MotionMedia({ media, onEnlarge, enlarged = false }: { media: Media; onEnlarge?: () => void; enlarged?: boolean }) {
  const player = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const video = player.current
    if (!video) return
    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) video.pause()
    }, { root: enlarged ? null : video.closest('.terminal-body') })
    const pauseWhenHidden = () => { if (document.hidden) video.pause() }
    observer.observe(video)
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', pauseWhenHidden)
      video.pause()
    }
  }, [enlarged, media.id])
  const play = () => {
    const video = player.current
    if (!video) return
    if (video.paused) void video.play().catch(() => setFailed(true))
    else video.pause()
  }
  const started = () => {
    setPlaying(true)
    setInitialized(true)
    player.current?.closest('.case-study')?.querySelectorAll('video').forEach(video => {
      if (video !== player.current) video.pause()
    })
  }
  return <div className="motion-media">
    <video ref={player} src={videoUrl(media)} poster={mediaUrl(media)} controls={initialized} playsInline muted preload="none"
      aria-label={media.alt} onPlay={started} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => setFailed(true)}>
      <a href={videoUrl(media)}>Open video: {media.caption}</a>
    </video>
    <div className="media-controls">
      <button onClick={play} aria-label={`${playing ? 'Pause' : 'Play'} video: ${media.caption}`}>{playing ? 'Pause' : 'Play'} video</button>
      <span>{media.video?.label} · {media.video?.duration.toFixed(1)} s</span>
      {onEnlarge && <button onClick={() => { player.current?.pause(); onEnlarge() }} aria-label={`Enlarge video: ${media.caption}`}>Enlarge <span aria-hidden="true">↗</span></button>}
    </div>
    {failed && <p className="media-error" role="alert">Playback is unavailable. <a href={videoUrl(media)}>Open the clip</a>.</p>}
  </div>
}
