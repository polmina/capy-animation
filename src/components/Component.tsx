import { useEffect, useRef } from "react";
import capybaraIcon from "../assets/capybara.svg?url";
import cheeseIcon from "../assets/cheese.svg?url";
import lettuceIcon from "../assets/lettuce.svg?url";
import meatIcon from "../assets/meat.svg?url";
import pizzaIcon from "../assets/pizza.svg?url";
import tomatoIcon from "../assets/tomato.svg?url";

const SPEED = 50;

interface Icon {
  src: HTMLImageElement;
  x: number;
  y: number;
  w: number;
  h: number;
  reset: { x: number; y: number };
}

const icons = [
  capybaraIcon,
  cheeseIcon,
  lettuceIcon,
  meatIcon,
  tomatoIcon,
  pizzaIcon,
];

export const Component = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const loadImages = async (): Promise<HTMLImageElement[]> => {
    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    return Promise.all(icons.map(loadImage));
  };

  const render = (
    ctx: CanvasRenderingContext2D,
    up: Icon[],
    down: Icon[],
    spriteSize: number
  ) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const cycleDistance = icons.length * spriteSize;
    const speed = 1 * (SPEED / 100);

    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const animate = (s: Icon, dir: "Up" | "Down") => {
        s.y += dir === "Up" ? -speed : speed;
        s.x += speed;

        // vertical wrap (grid-aligned)
        if (s.y <= s.reset.y - cycleDistance) {
          s.y += cycleDistance;
        }
        if (s.y >= s.reset.y + cycleDistance) {
          s.y -= cycleDistance;
        }

        // horizontal wrap
        if (s.x >= s.reset.x + cycleDistance) {
          s.x -= cycleDistance;
        }

        ctx.drawImage(s.src, s.x, s.y, s.w, s.h);
      };

      up.forEach((s) => animate(s, "Up"));
      down.forEach((s) => animate(s, "Down"));

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    let cancelled = false;

    const run = async () => {
      const images = await loadImages();
      if (cancelled || !canvasRef.current) return;

      const spriteSize = 60;

      const imgsPerColumn =
        Math.ceil(canvas.clientHeight / spriteSize) + icons.length;
      const imgsPerRow =
        Math.ceil(canvas.clientWidth / spriteSize) + icons.length;

      const up: Icon[] = [];
      const down: Icon[] = [];

      let iconIndex = 0;

      for (let i = 0; i < imgsPerRow; i++) {
        for (let u = 0; u < imgsPerColumn; u++) {
          const startX = i * spriteSize - spriteSize * icons.length;
          const startY =
            i % 2 === 0
              ? u * spriteSize
              : u * spriteSize - spriteSize * icons.length;

          const sprite: Icon = {
            src: images[iconIndex],
            x: startX,
            y: startY,
            w: spriteSize - 30,
            h: spriteSize - 30,
            reset: { x: startX, y: startY },
          };

          i % 2 === 0 ? up.push(sprite) : down.push(sprite);

          iconIndex++;
          if (iconIndex === images.length) iconIndex = 0;
        }
      }

      render(ctx, up, down, spriteSize);
    };

    run();

    return () => {
      cancelled = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 size-full bg-gradient-to-b from-[#F7931E] to-[#F15A24] z-0"
    />
  );
};
