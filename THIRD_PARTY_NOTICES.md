# Third-party notices

## shadcndashboard/shadcndashboard (MIT)

Source: https://github.com/shadcndashboard/shadcndashboard

Used as the starting point for the technical stack: React, Vite, Tailwind CSS v4, shadcn/ui on Base UI, Recharts and Lucide. The following files are adapted from it:

| Project file | Adapted from | Main changes |
|---|---|---|
| `shared/src/lib/cn.ts` | `src/lib/utils.ts` | none |
| `shared/src/ui/button.tsx` | `src/components/ui/button.tsx` | 16 px text, ≥ 48 px height, project palette, native `<button>` |
| `shared/src/ui/dialog.tsx` | `src/components/ui/dialog.tsx` | palette, 16 px text, labelled 48 px close button, no zoom animation |
| `shared/src/ui/field.tsx` | `src/components/ui/input.tsx`, `label.tsx`, `field.tsx` | visible label + hint + error wired with `aria-describedby` / `aria-invalid` |

MIT License, Copyright (c) 2026 Shadcn Dashboard.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## npm packages

React, React Router, Base UI, Recharts, Lucide, Tailwind CSS, class-variance-authority, clsx, tailwind-merge, Vite, TypeScript and playwright-core are used under their own licenses (MIT, ISC or Apache-2.0); see each package in `node_modules`.
