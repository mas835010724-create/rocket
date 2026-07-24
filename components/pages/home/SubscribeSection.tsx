import ButtonSub from "@/components/shared/ButtonSub";

// SubscribeSection.tsx
interface SubscribeSectionProps {
  description?: string;
  packageId?: string | number;
  packageDescription?: string;
  packageName?: string;
  fromSource?: string | number;
  sourceId?: string | number;
  deeplink?: string;
}

export default function SubscribeSection({
  description,
  packageId,
  packageDescription,
  packageName,
  fromSource,
  sourceId,
  deeplink,
}: SubscribeSectionProps) {
  const defaultDescription = `Don't miss the thrilling moment. Subscribe to TV360 daily for only <span class="text-white font-bold text-lg md:text-xl">$ 0.1</span> (Free for the first 7 days)`;

  const content = description || defaultDescription;
  const formattedDescription = content.replace(/_/g, "_<wbr>");

  return (
    <section className="w-full flex items-center justify-center">
      <div className="mx-2 md:mx-0 pt-2 pb-4 md:py-0 w-full max-w-[90%] md:w-[800px] lg:w-[1000px] items-center">
        <div className="bg-[#1D1D1DE5] mb-4 border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col-reverse md:flex-row items-center justify-between shadow-2xl">
          <div className="text-center md:text-left space-y-1 flex-1 md:pr-4">
            <p
              className="text-des-dark text-[15px] md:text-[16px] leading-relaxed break-words [&>strong]:text-white [&>strong]:font-bold [&>strong]:text-lg [&>strong]:md:text-xl"
              dangerouslySetInnerHTML={{ __html: formattedDescription }}
            />
          </div>
          <div className="flex items-center justify-center gap-3 w-full md:w-auto px-10 md:px-0 pb-2 md:pb-0">
            <ButtonSub
              size="lg"
              packageId={packageId}
              packageDescription={packageDescription}
              packageName={packageName}
              fromSource={fromSource}
              sourceId={sourceId}
              deeplink={deeplink}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
