import { MessageCircle } from "lucide-react";
import { Button } from "./Button";
import { Wrap } from "./Wrap";
import { WhatsappIcon } from "./WhatsappIcon";
import { buildWaLink } from "@/lib/whatsapp";

export function CTABand({
  heading,
  buttonLabel,
  waMessage,
  size = "default",
  greenButton = false,
}: {
  heading: string;
  buttonLabel: string;
  waMessage: string;
  size?: "default" | "large";
  greenButton?: boolean;
}) {
  return (
    <section className="w-full bg-terracotta px-5 md:px-8 py-16">
      <Wrap className="flex flex-wrap items-center justify-between gap-6 !px-0">
        <h2
          className={`font-serif font-medium text-paper max-w-xl ${
            size === "large" ? "text-[27px]" : "text-2xl"
          }`}
        >
          {heading}
        </h2>
        <Button
          href={buildWaLink(waMessage)}
          variant={greenButton ? "whatsapp" : "invert"}
        >
          {greenButton ? (
            <WhatsappIcon className="h-[18px] w-[18px]" />
          ) : (
            <MessageCircle className="h-[18px] w-[18px]" />
          )}
          {buttonLabel}
        </Button>
      </Wrap>
    </section>
  );
}
