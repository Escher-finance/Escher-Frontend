export const shortenText = (string: string, over: number): string =>
  string.length > over ? `${string.slice(0, over - 3)}・・・${string.slice(-3)}` : string;

export const shortenAddress = (address: string, charsStart = 4, charsEnd = 6): string => {
  return `${address.substring(0, charsStart + 2)}...${address.substring(address.length - (charsEnd || charsStart))}`;
};

export const capitalizeFirstLetter = (str: string): string => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const textToNumberRegex = (input: string, decimals?: number): string | undefined => {
  const regex = /^\d*\.?\d*$/;
  if (!regex.test(input)) return undefined;

  if (/^0\d+/.test(input)) return undefined;

  if (decimals !== undefined && input.includes(".")) {
    const [intPart, decimalPart = ""] = input.split(".");
    if (decimalPart.length > decimals) {
      return `${intPart}.${decimalPart.slice(0, decimals)}`;
    }
  }

  return input;
};