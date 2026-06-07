import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Timestamp } from 'firebase/firestore'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Timestamp | Date | string, pattern = 'dd/MM/yyyy'): string {
  if (!date) return ''
  let d: Date
  if (typeof date === 'string') {
    d = parseISO(date)
  } else if ('toDate' in date) {
    d = date.toDate()
  } else {
    d = date
  }
  return format(d, pattern, { locale: ptBR })
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function getNextSunday(): Date {
  const today = new Date()
  const day = today.getDay()
  const diff = day === 0 ? 0 : 7 - day
  const sunday = new Date(today)
  sunday.setDate(today.getDate() + diff)
  return sunday
}

export function getLastSunday(): Date {
  const today = new Date()
  const day = today.getDay()
  const diff = day === 0 ? 0 : day
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - diff)
  return sunday
}

export function getCurrentQuarter(date = new Date()): { quarter: number; year: number } {
  const month = date.getMonth()
  return {
    quarter: Math.floor(month / 3) + 1,
    year: date.getFullYear(),
  }
}

export function getQuarterMonths(quarter: number, year: number): Date[] {
  const startMonth = (quarter - 1) * 3
  return [
    new Date(year, startMonth, 1),
    new Date(year, startMonth + 1, 1),
    new Date(year, startMonth + 2, 1),
  ]
}

export function getSundaysInMonth(year: number, month: number): Date[] {
  const sundays: Date[] = []
  const date = new Date(year, month, 1)
  while (date.getDay() !== 0) date.setDate(date.getDate() + 1)
  while (date.getMonth() === month) {
    sundays.push(new Date(date))
    date.setDate(date.getDate() + 7)
  }
  return sundays
}
