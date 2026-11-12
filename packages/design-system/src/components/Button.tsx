/**
 * Buttons. Adapted from the shadcn dashboard template button (cva variants),
 * redesigned: pill shape, 48–56 px tall (AR4), 16 px+ text, filled primary in
 * off-white with dark text (12.4:1), category actions on deep category
 * surfaces (≥ 5.6:1). A soft press scale gives tactile feedback.
 */
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../cn';

export const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 rounded-full border-2 border-transparent font-bold transition-[transform,background-color,filter] duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:border-hair disabled:bg-transparent disabled:text-ink disabled:active:scale-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-5',
  {
    variants: {
      variant: {
        primary: 'bg-ink text-on-ink hover:brightness-95',
        secondary: 'bg-surface-hi text-ink hover:brightness-110',
        outline: 'border-line/70 bg-transparent text-ink hover:bg-surface',
        ghost: 'bg-transparent text-ink hover:bg-surface',
        fitness: 'bg-act-deep text-ink hover:brightness-110',
        nutrition: 'bg-food-deep text-ink hover:brightness-110',
        sleep: 'bg-sleep-deep text-ink hover:brightness-110',
        danger: 'bg-act-deep text-ink hover:brightness-110',
      },
      size: {
        sm: 'min-h-11 px-4 text-base',
        md: 'min-h-12 px-5 text-base',
        lg: 'min-h-14 px-6 text-lg',
        icon: 'size-12 text-base',
      },
      block: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, block, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size, block }), className)} {...props} />;
}
