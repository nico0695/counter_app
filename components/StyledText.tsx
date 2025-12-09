import { getFontFamily, getFontSize } from "@/lib/textStyles";

type StyledTextProps = {
  text: string;
  fontId?: string | null;
  color?: string | null;
  sizeId?: string | null;
  className?: string;
};

/**
 * Component to render text with custom styling (font, color, size)
 */
export default function StyledText({
  text,
  fontId,
  color,
  sizeId,
  className,
}: StyledTextProps) {
  const fontFamily = fontId ? getFontFamily(fontId) : undefined;
  const fontSize = sizeId ? getFontSize(sizeId) : undefined;
  const textColor = color || undefined;

  return (
    <div
      className={className}
      style={{
        fontFamily,
        color: textColor,
        fontSize,
      }}
    >
      {text}
    </div>
  );
}
