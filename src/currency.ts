/**
 * Currency conversion utilities for inFakt API
 *
 * IMPORTANT: inFakt API returns all monetary values in GROSZE (Polish pennies/cents).
 * 100 grosze = 1 PLN
 *
 * This module provides utilities to convert between grosze and zBotych (PLN).
 */

/**
 * Converts grosze (pennies) to zBotych (PLN)
 *
 * @param grosze - Amount in grosze (1/100 of PLN)
 * @returns Amount in PLN with 2 decimal places
 *
 * @example
 * groszeToPLN(12345) // returns 123.45
 * groszeToPLN(100) // returns 1.00
 * groszeToPLN(0) // returns 0.00
 */
export function groszeToPLN(grosze: number | string): number {
  const value = typeof grosze === 'string' ? parseFloat(grosze) : grosze;
  return Math.round(value) / 100;
}

/**
 * Converts zBotych (PLN) to grosze (pennies)
 *
 * @param pln - Amount in PLN
 * @returns Amount in grosze (integer)
 *
 * @example
 * plnToGrosze(123.45) // returns 12345
 * plnToGrosze(1.00) // returns 100
 * plnToGrosze(0.00) // returns 0
 */
export function plnToGrosze(pln: number): number {
  return Math.round(pln * 100);
}

/**
 * Formats grosze amount as PLN string with currency symbol
 *
 * @param grosze - Amount in grosze
 * @param locale - Locale for formatting (default: 'pl-PL')
 * @returns Formatted string with PLN currency
 *
 * @example
 * formatGrosze(12345) // returns "123,45 zB"
 * formatGrosze(12345, 'en-US') // returns "PLN 123.45"
 */
export function formatGrosze(grosze: number | string, locale: string = 'pl-PL'): string {
  const pln = groszeToPLN(grosze);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'PLN',
  }).format(pln);
}

/**
 * Converts an object with monetary fields from grosze to PLN
 *
 * @param obj - Object with monetary fields
 * @param fields - Array of field names to convert
 * @returns New object with converted values
 *
 * @example
 * const apiResponse = { net_price: 12345, tax_price: 2839, gross_price: 15184 };
 * convertMonetaryFields(apiResponse, ['net_price', 'tax_price', 'gross_price']);
 * // returns { net_price: 123.45, tax_price: 28.39, gross_price: 151.84 }
 */
export function convertMonetaryFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const converted = { ...obj };

  for (const field of fields) {
    const value = converted[field];
    if (typeof value === 'number' || typeof value === 'string') {
      (converted[field] as unknown) = groszeToPLN(value as number | string);
    }
  }

  return converted;
}

/**
 * List of standard monetary field names in inFakt API responses
 */
export const MONETARY_FIELDS = [
  'net_price',
  'gross_price',
  'tax_price',
  'unit_net_price',
  'unit_gross_price',
  'price',
  'amount',
  'total',
  'value',
] as const;

/**
 * Recursively converts all monetary fields in an object or array
 *
 * @param data - Data to convert (object, array, or primitive)
 * @returns Converted data with monetary values in PLN
 */
export function convertAllMonetaryFields(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => convertAllMonetaryFields(item));
  }

  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const converted: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Check if this is a monetary field
      if (MONETARY_FIELDS.includes(key as typeof MONETARY_FIELDS[number])) {
        if (typeof value === 'number' || typeof value === 'string') {
          converted[key] = groszeToPLN(value as number | string);
        } else {
          converted[key] = value;
        }
      } else {
        // Recursively convert nested objects/arrays
        converted[key] = convertAllMonetaryFields(value);
      }
    }

    return converted;
  }

  return data;
}
