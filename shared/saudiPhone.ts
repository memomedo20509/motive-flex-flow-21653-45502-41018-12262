import { z } from "zod";

const ARABIC_DIGITS: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

export function normalizeSaudiPhone(value: string): string {
  let phone = value
    .trim()
    .replace(/[٠-٩]/g, (digit) => ARABIC_DIGITS[digit])
    .replace(/[^\d+]/g, "");

  if (phone.startsWith("00966")) phone = `+966${phone.slice(5)}`;
  else if (phone.startsWith("966")) phone = `+${phone}`;
  else if (phone.startsWith("05")) phone = `+966${phone.slice(1)}`;
  else if (phone.startsWith("5")) phone = `+966${phone}`;

  return phone;
}

export function isSaudiMobile(value: string): boolean {
  return /^\+9665\d{8}$/.test(normalizeSaudiPhone(value));
}

export const saudiPhoneSchema = z
  .string()
  .trim()
  .min(1, "رقم الجوال مطلوب")
  .transform(normalizeSaudiPhone)
  .refine(isSaudiMobile, "أدخل رقم جوال سعودي صحيح، مثل 05XXXXXXXX");
