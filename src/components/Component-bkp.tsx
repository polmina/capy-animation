import { useEffect, useRef } from "react";
import capybaraIcon from "../assets/capybara.svg?url";
import cheeseIcon from "../assets/cheese.svg?url";
import lettuceIcon from "../assets/lettuce.svg?url";
import meatIcon from "../assets/meat.svg?url";
import pizzaIcon from "../assets/pizza.svg?url";
import tomatoIcon from "../assets/tomato.svg?url";



interface Icon {
  src: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  reset: { x: number, y: number }
  cycle: { current: number, total: number }
}

const icons = [capybaraIcon, cheeseIcon, lettuceIcon, meatIcon, tomatoIcon, pizzaIcon];

export const Component = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const render = (ctx: CanvasRenderingContext2D, upAnimationArray: Icon[], downAnimationArray: Icon[]) => {

    const frame = () => {
      if (!canvasRef.current) return;

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      const animate = (s: Icon, d: "Up" | "Down") => {

        if (d === 'Up') {
          s.y = s.y - 1;
        } else {
          s.y = s.y + 1;
        }

        s.x = s.x + 1;
        s.cycle.current++;

        ctx.drawImage(s.src, s.x, s.y, s.w, s.h);

        if (s.cycle.current >= s.cycle.total) {
          s.y = s.reset.y
          s.x = s.reset.x;
          s.cycle.current = 0;
        }
      }

      upAnimationArray.forEach((s: Icon) => animate(s, 'Up'));
      downAnimationArray.forEach((s: Icon) => animate(s, 'Down'));

      requestAnimationFrame(frame)
    }
    frame();
  }

  const loadImages = async (): Promise<any> => {

    function loadImage(src: string) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    }
    const images = await Promise.all(icons.map(loadImage));

    return images;
  }


  const run = async (ctx: CanvasRenderingContext2D) => {

    if (!canvasRef.current) return;
    const images = await loadImages();

    const spriteSize = 80;

    const fittingImagesH = Math.ceil(canvasRef.current.clientHeight / spriteSize);
    const imgsPerColumn = fittingImagesH + icons.length;

    const fittingImagesW = Math.ceil(canvasRef.current.clientWidth / spriteSize);
    const imgsPerRow = fittingImagesW + icons.length;

    const upAnimationArray: Icon[] = [];
    const downAnimationArray: Icon[] = [];


    let iconsIndex = 0

    for (let i = 0; i < imgsPerRow; i++) {
      for (let u = 0; u < imgsPerColumn; u++) {

        const startingY = (i % 2 === 0) ? u * spriteSize : ((u * spriteSize) - (spriteSize * icons.length));
        const startingX = i * spriteSize - (spriteSize * icons.length);

        const sprite: Icon = {
          src: images[iconsIndex++],
          x: startingX,
          y: startingY,
          w: spriteSize - 30,
          h: spriteSize - 30,
          cycle: {
            current: 0,
            total: icons.length * spriteSize
          },
          reset: {
            x: startingX,
            y: startingY
          }
        }
        if (i % 2 === 0) {
          upAnimationArray.push(sprite)
        } else {
          downAnimationArray.push(sprite)
        }
        if (iconsIndex === icons.length) iconsIndex = 0;
      }
    };

    render(ctx, upAnimationArray, downAnimationArray);
  }

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.height = canvas.clientHeight * dpr;
    canvas.width = canvas.clientWidth * dpr;


    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    run(ctx)

  }, [icons]);

  return <canvas className="fixed inset-0 size-full bg-gradient-to-b from-[#F7931E] to-[#F15A24] z-0" ref={canvasRef} />
}
