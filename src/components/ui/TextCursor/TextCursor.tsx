import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TextCursorProps {
  text: string;
  delay?: number;
  spacing?: number;
  followMouseDirection?: boolean;
  randomFloat?: boolean;
  exitDuration?: number;
  removalInterval?: number;
  maxPoints?: number;
}

interface TrailItem {
  id: number;
  x: number;
  y: number;
  angle: number;
  randomX?: number;
  randomY?: number;
  randomRotate?: number;
}

const TextCursor: React.FC<TextCursorProps> = ({
  text = "Hello!",
  delay = 0.05,
  spacing = 60,
  followMouseDirection = false,
  randomFloat = true,
  exitDuration = 0.8,
  removalInterval = 50,
  maxPoints = 8
}) => {
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const lastMoveTimeRef = useRef<number>(Date.now());
  const idCounter = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    setTrail((prev) => {
      let newTrail = [...prev];

      if (newTrail.length === 0) {
        newTrail.push({
          id: idCounter.current++,
          x: mouseX,
          y: mouseY,
          angle: 0,
          ...(randomFloat && {
            randomX: Math.random() * 10 - 5,
            randomY: Math.random() * 10 - 5,
            randomRotate: Math.random() * 10 - 5,
          }),
        });
      } else {
        const last = newTrail[newTrail.length - 1];
        const dx = mouseX - last.x;
        const dy = mouseY - last.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= spacing) {
          let rawAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
          if (rawAngle > 90) rawAngle -= 180;
          else if (rawAngle < -90) rawAngle += 180;
          const computedAngle = followMouseDirection ? rawAngle : 0;

          const steps = Math.floor(distance / spacing);
          for (let i = 1; i <= steps; i++) {
            const t = (spacing * i) / distance;
            const newX = last.x + dx * t;
            const newY = last.y + dy * t;
            newTrail.push({
              id: idCounter.current++,
              x: newX,
              y: newY,
              angle: computedAngle,
              ...(randomFloat && {
                randomX: Math.random() * 10 - 5,
                randomY: Math.random() * 10 - 5,
                randomRotate: Math.random() * 10 - 5,
              }),
            });
          }
        }
      }

      if (newTrail.length > maxPoints) {
        newTrail = newTrail.slice(newTrail.length - maxPoints);
      }
      return newTrail;
    });

    lastMoveTimeRef.current = Date.now();
  }, [spacing, followMouseDirection, randomFloat, maxPoints]);

  useEffect(() => {
    if (!mounted) return;

    // Add event listener to document instead of container
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [mounted, handleMouseMove]);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      if (Date.now() - lastMoveTimeRef.current > 100) {
        setTrail((prev) => (prev.length > 0 ? prev.slice(1) : prev));
      }
    }, removalInterval);
    return () => clearInterval(interval);
  }, [removalInterval, mounted]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {trail.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 1 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: randomFloat ? [0, item.randomX || 0, 0] : 0,
              y: randomFloat ? [0, item.randomY || 0] : 0,
              rotate: randomFloat
                ? [
                    item.angle,
                    item.angle + (item.randomRotate || 0),
                    item.angle,
                  ]
                : item.angle,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              opacity: { duration: exitDuration, ease: "easeOut", delay },
              scale: { duration: exitDuration, ease: "easeOut", delay },
              ...(randomFloat && {
                x: {
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "mirror" as const,
                },
                y: {
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "mirror" as const,
                },
                rotate: {
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "mirror" as const,
                },
              }),
            }}
            className="absolute select-none whitespace-nowrap text-2xl font-bold text-white/70 drop-shadow-lg"
            style={{
              left: item.x - 20, // Offset to center the text
              top: item.y - 10, // Offset to center the text
              transform: `rotate(${item.angle}deg)`,
            }}
          >
            {text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TextCursor;
