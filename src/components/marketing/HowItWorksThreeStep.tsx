import Image from "next/image";

const steps = [
  {
    iconSrc: "/images/howitworks1.webp",
    title: "Answer Questions",
    description:
      "Tell us what has happened in plain English. We ask the questions that matter so you do not have to work out the legal route yourself.",
    time: "5-10 minutes",
  },
  {
    iconSrc: "/images/howitworks2.webp",
    title: "Check the Route",
    description:
      "We flag the problems that could trip you up before you generate anything, so you do not serve the wrong notice or miss a key detail.",
    time: "2-3 minutes",
  },
  {
    iconSrc: "/images/howitworks3.webp",
    title: "Generate and Act",
    description:
      "Generate the documents, service guidance, and next-step checklist you need to move the case forward.",
    time: "Instant",
  },
];

export function HowItWorksThreeStep() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-14 text-center">
        <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-2">
          <span className="text-sm font-semibold text-primary">Three clear steps</span>
        </div>
        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
          Your tenant is not paying. Here is how you get moving.
        </h2>
        <p className="mx-auto max-w-2xl text-xl text-gray-600">
          Work out the right next step, avoid the mistakes that cause delay, and
          generate the documents you need without wading through legal jargon.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 md:gap-12">
        {steps.map((step) => (
          <div key={step.title} className="group text-center">
            <div className="relative z-10">
              <div className="mx-auto mb-6 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                <Image
                  src={step.iconSrc}
                  alt={step.title}
                  width={96}
                  height={96}
                  className="h-[72px] w-[72px] object-contain md:h-[96px] md:w-[96px]"
                />
              </div>
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-primary">
              {step.title}
            </h3>
            <p className="text-gray-600">{step.description}</p>
            <p className="mt-2 text-sm font-medium text-primary">{step.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
