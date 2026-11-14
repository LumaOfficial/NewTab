import { useEffect, useState } from 'react';
import type { BackgroundSettings } from '../../storage/schema';
import { backgroundStyle } from '../../theme/themes';

/**
 * Paints the workspace background. Wallpapers and videos are validated when
 * saved; if a media file still fails to load, the theme gradient underneath
 * shows instead of a blank page.
 */
export function BackgroundLayer({ background }: { background: BackgroundSettings }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [background.imageUrl, background.videoUrl, background.kind]);

  const fallbackStyle = {
    backgroundImage: `linear-gradient(${background.gradientAngle}deg, ${background.gradientFrom}, ${background.gradientTo})`,
  };

  const media =
    background.kind === 'image' && background.imageUrl ? (
      failed ? (
        <div className="bg-layer bg-layer--fallback" style={fallbackStyle} />
      ) : (
        <img
          className="bg-layer__image"
          src={background.imageUrl}
          alt=""
          onError={() => setFailed(true)}
        />
      )
    ) : background.kind === 'video' && background.videoUrl ? (
      failed ? (
        <div className="bg-layer bg-layer--fallback" style={fallbackStyle} />
      ) : (
        <video
          className="bg-layer__video"
          src={background.videoUrl}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          onError={() => setFailed(true)}
        />
      )
    ) : background.kind === 'image' || background.kind === 'video' ? (
      <div className="bg-layer bg-layer--fallback" style={fallbackStyle} />
    ) : null;

  const painted = backgroundStyle(background);

  const showScrim = Boolean(media);
  const dim = Math.min(80, Math.max(0, background.dim)) / 100;

  return (
    <div className="background" aria-hidden="true">
      {media}
      {painted.kind === 'gradient' || painted.kind === 'solid' ? (
        <div
          className={`bg-layer${background.kind === 'gradient' && background.animated ? ' bg-layer--animated' : ''}`}
          style={painted.style}
        />
      ) : null}
      {showScrim ? <div className="bg-layer__scrim" style={{ opacity: dim }} /> : null}
    </div>
  );
}
