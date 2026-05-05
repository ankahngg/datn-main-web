export type BeforeAfterCardProps = {
  beforeLabel: string;
  beforeValue: string | number;
  changeLabel: string;
  changeValue: string | number;
  afterLabel: string;
  afterValue: string | number;
  currency: string;
  type: "increase" | "decrease";
  afterLabel2?: string;
  afterValue2?: string | number;
};

function BeforeAfterCard(props: BeforeAfterCardProps) {
  const {
    beforeLabel,
    beforeValue,
    changeLabel,
    changeValue,
    afterLabel,
    afterValue,
    type,
    currency,
  } = props;

  const before = `${beforeLabel}: ${beforeValue} ${currency}`;
  const after = `${afterLabel}: ${afterValue} ${currency}`;
  const change =
    type === "increase"
      ? `${changeLabel}: +${changeValue} ${currency}`
      : `${changeLabel}: -${changeValue} ${currency}`;
  const after2 =
    props.afterLabel2 && props.afterValue2
      ? `${props.afterLabel2}: ${props.afterValue2} ${currency}`
      : null;

  return (
    <div className="rounded-lg border border-muted-foreground/40 bg-background/40 p-3">
      <p className="text-xs text-muted-foreground">{before}</p>
      <p className="text-xs text-muted-foreground">{change}</p>
      <p className="text-sm font-medium text-foreground">{after}</p>

      {after2 && (
        <p className="text-sm font-medium text-foreground">{after2}</p>
      )}
    </div>
  );
}

export default BeforeAfterCard;
