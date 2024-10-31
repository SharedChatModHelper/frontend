import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"
import {DEFAULT_PICTURES} from "@/lib/constants.ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function defaultPicture(id: number): string {
  return DEFAULT_PICTURES[id % DEFAULT_PICTURES.length]
}

export function localizedLongDay(timestamp: string | number | undefined, locale?: string) {
  try {
    if (timestamp == null) {
      return "Unknown time";
    }

    const date = new Date(timestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Unknown time";
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return date.toLocaleDateString(locale, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return "Unknown time";
  }
}

export function localizedTime(timestamp: string | number | undefined, locale?: string) {
  try {
    if (timestamp == null) {
      return "Unknown time";
    }

    const date = new Date(timestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Unknown time";
    }

    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric"
    };

    return date.toLocaleTimeString(locale, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return "Unknown time";
  }
}

export function localizedShortDay(timestamp: string | number | undefined, locale?: string) {
  try {
    if (timestamp == null) {
      return "Unknown time";
    }

    const date = new Date(timestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Unknown time";
    }

    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "numeric",
      year: "numeric"
    };

    return date.toLocaleDateString(locale, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return "Unknown time";
  }
}

const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string, unit: 'second' | 'minute' | 'hour' | 'day'): Intl.NumberFormat {
  const key = `${locale}-${unit}`;
  if (!formatters.has(key)) {
    formatters.set(
      key,
      new Intl.NumberFormat(locale, {
        style: 'unit',
        unit,
        unitDisplay: 'long'
      })
    );
  }
  return formatters.get(key)!;
}

export function localizedDuration(seconds: number, locale = 'en'): string {
  if (seconds < 60) {
    return getFormatter(locale, 'second').format(Math.round(seconds));
  }

  if (seconds < 3600) {
    return getFormatter(locale, 'minute').format(Math.round(seconds / 60));
  }

  if (seconds < 86400) {
    return getFormatter(locale, 'hour').format(Math.round(seconds / 3600));
  }

  return getFormatter(locale, 'day').format(Math.round(seconds / 86400));
}
