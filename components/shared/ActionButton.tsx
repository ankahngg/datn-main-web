import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { forwardRef } from "react";

const ActionButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  return (
    <Button
        ref={ref} {...props}
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">Mở menu thao tác</span>
    </Button>
  );
});

export default ActionButton;
