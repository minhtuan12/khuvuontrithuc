import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../../lib/utils';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-sky-400 text-white hover:bg-sky-500 border-b-4 border-sky-600 active:border-b-0 active:translate-y-1',
      secondary: 'bg-pink-400 text-white hover:bg-pink-500 border-b-4 border-pink-600 active:border-b-0 active:translate-y-1',
      accent: 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1',
      outline: 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50 border-b-4 active:border-b-2 active:translate-y-0.5',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    };

    const sizes = {
      sm: 'px-4 py-2 text-lg rounded-2xl',
      md: 'px-6 py-3 text-xl rounded-3xl',
      lg: 'px-8 py-4 text-2xl rounded-[2rem]',
      icon: 'p-4 rounded-full',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'font-bold transition-all duration-200 flex items-center justify-center gap-2',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
