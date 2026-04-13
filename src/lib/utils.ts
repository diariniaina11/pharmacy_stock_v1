import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normalizeUserRole = (role: unknown): 'ADMIN' | 'VENDEUR' | undefined => {
  const value = String(role || '').trim().toLowerCase();
  if (value === 'admin' || value === 'administrator' || value === 'adm') {
    return 'ADMIN';
  }
  if (value === 'vendeur' || value === 'seller' || value === 'vendor') {
    return 'VENDEUR';
  }
  return undefined;
};
