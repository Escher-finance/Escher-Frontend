import BigNumber from 'bignumber.js';

export const FORMAT_LOCALE_FALLBACK: string = 'en';
export const MAX_DECIMALS: number = 6;

const removeTrailingZeros = (value: string) => {
  return value.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
};

const getIntlFormatter = ({
  locale,
  decimals,
  fixDp = false,
  compact = false,
}: {
  locale?: string;
  decimals: number;
  fixDp?: boolean;
  compact?: boolean;
}): Intl.NumberFormat => {
  const minDeciamls = fixDp ? decimals : undefined;

  const formatter = new Intl.NumberFormat(locale ?? FORMAT_LOCALE_FALLBACK, {
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: decimals,
    minimumFractionDigits: minDeciamls,
    trailingZeroDisplay: minDeciamls === undefined ? 'stripIfInteger' : 'auto',
  });

  return formatter;
};

/**
 *
 * @description stands for which currency is supported by the app
 */
export type CurrencySymbol = '$';

export type FormatAmountOptions = {
  currencySymbol?: CurrencySymbol;
  semiequate?: boolean;
  compact?: boolean;
  fixDp?: boolean;
  roundMode?: BigNumber.RoundingMode;
  locale?: string;
  abs?: boolean;
};

export const formatNumber = (
  targetValue: BigNumber | number | `${number}` | undefined | null,
  decimals?: number,
  options?: FormatAmountOptions,
): string => {
  if (targetValue === undefined || targetValue === null) return '-';

  const value = new BigNumber(targetValue);

  const maxDecimals = decimals ? (decimals > MAX_DECIMALS ? MAX_DECIMALS : decimals) : MAX_DECIMALS;
  const currencySymbol = options?.currencySymbol ? `${options.currencySymbol}` : '';
  const semiequateSymbol = options?.semiequate ? '≈' : '';
  const abs = options?.abs ?? false;
  const roundMode = options?.roundMode ?? BigNumber.ROUND_DOWN;

  // 0
  if (value.isZero()) return `${semiequateSymbol}${currencySymbol}${new BigNumber(0).toFormat(0)}`;

  const directionSymbol = !abs && value.isNegative() ? '-' : '';

  // less than minimum in decimals
  const min = new BigNumber(1).shiftedBy(-maxDecimals);
  if (value.abs().lt(min))
    return `${semiequateSymbol}${directionSymbol}<${currencySymbol}${min.toFormat(maxDecimals, roundMode)}`;

  const getFormattedValue = options?.compact
    ? () => {
      const compactFormatter = getIntlFormatter({
        locale: options?.locale,
        decimals: maxDecimals,
        fixDp: options?.fixDp,
        compact: true,
      });
      return compactFormatter.format(value.abs().toNumber());
    }
    : () => {
      const formattedBigNumber = value.abs().toFormat(maxDecimals ?? 0, roundMode);
      const trailingZeroManipulatedFormattedBigNumber = options?.fixDp
        ? formattedBigNumber
        : removeTrailingZeros(formattedBigNumber);
      return trailingZeroManipulatedFormattedBigNumber.toLocaleLowerCase();
    };

  return `${semiequateSymbol}${directionSymbol}${currencySymbol}${getFormattedValue()}`;
};

export type FormatCurrencyFunction = (value: BigNumber | number | undefined | null, options?: FormatAmountOptions) => string;

export const formatUSD: FormatCurrencyFunction = (
  value: BigNumber | number | undefined | null,
  options?: FormatAmountOptions,
): string => {
  return formatNumber(value, 2, { currencySymbol: '$', ...options });
};

export const getDecimalSeperator = (locale = FORMAT_LOCALE_FALLBACK): string => {
  return new Intl.NumberFormat(locale).formatToParts(1.1).find((part) => part.type === 'decimal')?.value ?? '.';
};

export const getIntSeperator = (locale = FORMAT_LOCALE_FALLBACK): string => {
  return new Intl.NumberFormat(locale).formatToParts(10000).find((part) => part.type === 'group')?.value ?? ',';
};

export const getFormattedNumberParts = (formattedNumber: string, locale = FORMAT_LOCALE_FALLBACK): [string, string | null] => {
  const decimalSeperator = getDecimalSeperator(locale);
  const [integer, fractions] = formattedNumber.split(decimalSeperator);
  return [integer, fractions !== '' ? fractions : null];
};

export const unformatNumber = (
  formattedValue: string,
  locale = FORMAT_LOCALE_FALLBACK,
): { number: number; decimals: number; prefix?: string } => {
  const [integer, fractions] = getFormattedNumberParts(formattedValue, locale);

  const integerNumberStartIndex = Array.from(integer).findIndex((char) => Number.isSafeInteger(Number(char)));
  const includePrefix = integerNumberStartIndex > -1;
  const prefix = includePrefix ? integer.slice(0, integerNumberStartIndex) : undefined;
  const numberOnlyInteger = includePrefix ? integer.slice(integerNumberStartIndex) : integer;

  const parsedInteger = Number(numberOnlyInteger.replaceAll(getIntSeperator(locale), ''));
  const parsedFractions = fractions ? parseFloat(`0.${fractions}`) : 0;

  const number = Number.isSafeInteger(parsedInteger) ? parsedInteger + parsedFractions : 0;
  const decimals = fractions?.length ?? 0;
  return { number, decimals, prefix };
};

export const sanitizeNumberString = (value: string): `${number}` => {
  const numberedValue = Number(value);
  const sanitizedValue = Number.isNaN(numberedValue) ? 0 : numberedValue;
  return `${sanitizedValue}`;
};
