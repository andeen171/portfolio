import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const uniqueId = (baseId = 'gradient') => {
  let newId = baseId;
  let suffix = 1;

  if (typeof window !== 'undefined') {
    while (document.querySelector(`#${newId}`)) {
      newId = `${baseId}-${suffix}`;
      suffix += 1;
    }
  }

  return newId;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
