import { InputNumber } from "antd";
import type { ComponentProps } from "react";
import { getNumberLocale } from "@repo/util";

type AntdInputNumberProps = ComponentProps<typeof InputNumber>;

export type LocaleInputNumberProps = AntdInputNumberProps & {
  locale?: string;
  maximumFractionDigits?: number;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getNumberSeparators = (locale: string) => {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);

  return {
    group: parts.find((part) => part.type === "group")?.value || ",",
    decimal: parts.find((part) => part.type === "decimal")?.value || ".",
  };
};

const parseLocaleNumber = (value: string | undefined, locale: string) => {
  if (!value) return "";

  const { decimal, group } = getNumberSeparators(locale);
  let nextValue = value.replace(new RegExp(escapeRegExp(group), "g"), "");
  nextValue = nextValue.replace(new RegExp(`[^0-9${escapeRegExp(decimal)}-]`, "g"), "");
  nextValue = nextValue.replace(decimal, ".");

  const parts = nextValue.split(".");
  if (parts.length > 2) {
    nextValue = `${parts[0]}.${parts.slice(1).join("")}`;
  }

  return nextValue;
};

export const LocaleInputNumber = ({
  formatter,
  locale = getNumberLocale(),
  maximumFractionDigits = 4,
  parser,
  ...props
}: LocaleInputNumberProps) => (
  <InputNumber
    formatter={
      formatter ??
      ((value) => {
        if (value === undefined || value === null || value === "") return "";

        const normalizedValue = parseLocaleNumber(String(value), locale);
        const numberValue = Number(normalizedValue);

        return Number.isFinite(numberValue)
          ? numberValue.toLocaleString(locale, { maximumFractionDigits })
          : String(value);
      })
    }
    parser={parser ?? ((value) => parseLocaleNumber(value, locale) as any)}
    {...props}
  />
);
