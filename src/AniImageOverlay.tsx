import React, { useEffect, useMemo, useRef, useState } from "react";

export type AniImage = {
  image: string;
  duration: number;
};

export type AniImageOverlayProps = {
  coord_z?: number;
  images: AniImage[];
  coord_x: number;
  coord_y: number;
  dragable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onPositionChange?: (position: { x: number; y: number }) => void;
};

/**
 * AniImageOverlay
 *
 * Chování:
 * - Obrázky se neustále střídají dokola podle `duration`.
 * - Komponenta je vždy viditelná.
 * - dragable = false:
 *   Komponenta je pouze umístěná na `coord_x` / `coord_y`.
 *
 * - dragable = true:
 *   Komponentu lze přesouvat myší.
 *   Při hoveru se zobrazí tooltip s aktuální pozicí.
 *
 * Poznámka:
 * - Komponenta je absolutně pozicovaná podle `coord_x` a `coord_y`.
 * - Z-index není explicitně nastavován, takže používá běžné defaultní chování vrstvení.
 */
export default function AniImageOverlay({
  coord_z = 0,
  images,
  coord_x,
  coord_y,  dragable = false,
  className,
  style,
  onPositionChange,
}: AniImageOverlayProps) {
  const [position, setPosition] = useState({ x: coord_x, y: coord_y });
    const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const timersRef = useRef<number[]>([]);

  const safeImages = useMemo(
    () => images.filter((item) => item.image && item.duration > 0),
    [images]
  );

  useEffect(() => {
    setPosition({ x: coord_x, y: coord_y });
  }, [coord_x, coord_y]);

  useEffect(() => {
    onPositionChange?.(position);
  }, [position, onPositionChange]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    setCurrentIndex(0);

    if (safeImages.length === 0) {
      return;
    }
    let elapsed = 0;

    safeImages.forEach((item, index) => {
      const switchTimer = window.setTimeout(() => {
        setCurrentIndex(index);
      }, elapsed);
      timersRef.current.push(switchTimer);
      elapsed += item.duration;
    });

    const totalDuration = Math.max(
      1,
      safeImages.reduce((sum, item) => sum + item.duration, 0)
    );

    const intervalId = window.setInterval(() => {
      let localElapsed = 0;

      safeImages.forEach((item, index) => {
        const switchTimer = window.setTimeout(() => {
          setCurrentIndex(index);
        }, localElapsed);
        timersRef.current.push(switchTimer);
        localElapsed += item.duration;
      });
    }, totalDuration);

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
      window.clearInterval(intervalId);
    };
  }, [safeImages]);

  useEffect(() => {
    if (!dragable || !isDragging) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      setPosition({
        x: event.clientX - dragOffsetRef.current.x,
        y: event.clientY - dragOffsetRef.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragable, isDragging]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!dragable) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    dragOffsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    setIsDragging(true);
  };

  const currentImage = safeImages[currentIndex];

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        zIndex: coord_z,
        cursor: dragable ? (isDragging ? "grabbing" : "grab") : "default",
        userSelect: "none",
        ...style,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsDragging(false);
      }}
    >
      {currentImage ? (
        <img
          src={currentImage.image}
          alt={`ani-image-${currentIndex}`}
          draggable={false}
          style={{
            display: "block",
            pointerEvents: "none",
            maxWidth: "none",
          }}
        />
      ) : null}

      {isHovered ? (
        <div
          style={{
            position: "absolute",
            left: "100%",
            top: 0,
            marginLeft: 8,
            padding: "6px 8px",
            fontSize: 12,
            lineHeight: 1.35,
            color: "white",
            background: "rgba(0, 0, 0, 0.8)",
            borderRadius: 6,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          x: {Math.round(position.x)}, y: {Math.round(position.y)}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Příklad použití:
 *
 * <div style={{ position: "relative" }}>
 *   <img src="/background.jpg" alt="background" />
 *
 *   <AniImageOverlay
 *     coord_x={120}
 *     coord_y={80}
 * *     dragable={false}
 *     images={[
 *       { image: "/overlay-1.png", duration: 500 },
 *       { image: "/overlay-2.png", duration: 700 },
 *     ]}
 *   />
 * </div>
 *
 * Drag režim:
 *
 * <AniImageOverlay
 *   coord_x={120}
 *   coord_y={80}
 *   dragable
 *   images={[
 *     { image: "/overlay-1.png", duration: 300 },
 *     { image: "/overlay-2.png", duration: 300 },
 *     { image: "/overlay-3.png", duration: 300 },
 *   ]}
 * />
 */
