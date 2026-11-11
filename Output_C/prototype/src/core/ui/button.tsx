/**
 * Button: adapted from the shadcn dashboard template (src/components/ui/button.tsx).
 * Changes: 16 px text, minimum 48 px height (AR4 asks for >= 44 px), colours
 * from the project palette, native <button> element.
 */
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../lib/cn';

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-transparent text-base font-normal text-ink transition-colors select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-6',
  {
    variants: {
      variant: {
        primary: 'bg-sleep hover:brightness-110',
        secondary: 'bg-raised hover:brightness-110',
        fitness: 'bg-fit hover:brightness-110',
        nutrition: 'bg-food hover:brightness-110',
        danger: 'bg-fit hover:brightness-110',
        outline: 'border-line bg-transparent hover:bg-raised',
        ghost: 'bg-transparent hover:bg-raised',
      },
      size: {
        md: 'min-h-12 px-4 py-2',
        lg: 'min-h-14 px-5 py-3 text-lg',
        icon: 'size-12',
        block: 'min-h-14 w-full px-4 py-3',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
