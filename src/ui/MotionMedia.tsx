import { useEffect, useRef, useState } from 'react'
import type { Media } from '../content/portfolio'
import { mediaUrl } from './ProjectCard'

export const videoUrl = (media: Media) => `/media/${media.id}.mp4`

export default function MotionMedia({ media, onEnlarge, enlarged = false, suspended = false }: { media: Media; onEnlarge?: () => void; enlarged?: boolean; suspended?: boolean }) {
  const player = useRef<HTMLVideoElement>(null)
  const userPaused = useRef(false)
  const automaticPause = useRef(false)
  const manuallyStarted = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const video = player.current
    if (!video) return
    let inView = false
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pause = () => {
      if (video.paused) return
      automaticPause.current = true
      video.pause()
    }
    const updatePlayback = () => {
      if (!inView || document.hidden || suspended || userPaused.current || (reducedMotion.matches && !manuallyStarted.current)) pause()
      else void video.play().catch(() => { /* Keep the poster and Play button if automatic playback is blocked. */ })
    }
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0]
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.15
      updatePlayback()
    }, { root: enlarged ? null : video.closest('.terminal-body'), threshold: [0, 0.15] })
    const motionChanged = () => {
      if (reducedMotion.matches) manuallyStarted.current = false
      updatePlayback()
    }
    observer.observe(video)
    document.addEventListener('visibilitychange', updatePlayback)
    reducedMotion.addEventListener('change', motionChanged)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', updatePlayback)
      reducedMotion.removeEventListener('change', motionChanged)
      pause()
    }
  }, [enlarged, media.id, suspended])
  const play = () => {
    const video = player.current
    if (!video) return
    if (video.paused) {
      userPaused.current = false
      manuallyStarted.current = true
      void video.play().catch(() => setFailed(true))
    } else {
      userPaused.current = true
      video.pause()
    }
  }
  const started = () => {
    setPlaying(true)
    setInitialized(true)
    userPaused.current = false
    manuallyStarted.current = true
  }
  const paused = () => {
    setPlaying(false)
    if (automaticPause.current) automaticPause.current = false
    else userPaused.current = true
  }
  return <div className="motion-media">
    <video ref={player} src={videoUrl(media)} poster={mediaUrl(media)} controls={initialized} playsInline muted loop preload="none"
      aria-label={media.alt} onPlay={started} onPause={paused} onError={() => setFailed(true)}>
      <a href={videoUrl(media)}>Open video: {media.caption}</a>
    </video>
    <div className="media-controls">
      <button onClick={play} aria-label={`${playing ? 'Pause' : 'Play'} video: ${media.caption}`}>{playing ? 'Pause' : 'Play'} video</button>
      <span>{media.video?.label} · {media.video?.duration.toFixed(1)} s</span>
      {onEnlarge && <button onClick={onEnlarge} aria-label={`Enlarge video: ${media.caption}`}>Enlarge <span aria-hidden="true">↗</span></button>}
    </div>
    {failed && <p className="media-error" role="alert">Playback is unavailable. <a href={videoUrl(media)}>Open the clip</a>.</p>}
  </div>
}
