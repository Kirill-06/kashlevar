import { useEffect, useRef, useState } from 'react';

const PUFF_FRAMES = [0, 1, 2, 3, 0];
const PUFF_FRAME_DURATION = 150;

export const usePuffAnimation = () => {
  const [personFrame, setPersonFrame] = useState<number>(0);
  const [isPuffLoading, setIsPuffLoading] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(id => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const triggerPuff = () => {
    if (isPuffLoading) return Promise.resolve();

    setIsPuffLoading(true);

    return new Promise<void>(resolve => {
      PUFF_FRAMES.forEach((frame, index) => {
        const id = window.setTimeout(() => {
          setPersonFrame(frame);

          const isLast = index === PUFF_FRAMES.length - 1;
          if (isLast) {
            setPersonFrame(0);
            setIsPuffLoading(false);
            resolve();
          }
        }, index * PUFF_FRAME_DURATION);

        timersRef.current.push(id);
      });
    });
  };

  return {
    personFrame,
    isPuffLoading,
    triggerPuff,
  };
};
