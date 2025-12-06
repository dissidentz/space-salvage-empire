import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export function NumberTicker({ value, className = "" }: { value: number; className?: string }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.floor(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className={className}>{display}</motion.span>;
}
