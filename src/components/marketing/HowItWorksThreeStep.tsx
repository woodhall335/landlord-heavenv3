import Image from "next/image";

const steps = [
  {
    iconSrc: "/images/howitworks1.webp",
    title: "Answer Questions",
    description:
      "Tell us about your situation. Our wizard asks simple questions about your property, tenant, and what you need.",
    time: "5-10 minutes",
  },
  {
    iconSrc: "/images/howitworks2.webp",
    title: "Review & Validate",
    description:
      "We generate your jurisdiction-specific case file and validate key compliance checks before you approve.",
    time: "2-3 minutes",
  },
  {
    iconSrc: "/images/howitworks3.webp",
    title: "File & Proceed",
    description:
      "Pay securely and generate your complete case bundle with filing instructions, evidence checklist, and service guidance.",
    time: "Instant",
  },
];

export function HowItWorksThreeStep() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-14">
        <div className="inline-block bg-primary/10 rounded-full px-4 py-2 mb-4">
          <span className="text-sm font-semibold text-primary">
            Simple 3-Step Process
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Complete UK Eviction Case Bundles in Minutes
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Generate a complete, jurisdiction-specific court bundle with
          statutory-grounded checks for England, Wales, or Scotland.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 md:gap-12">
        {steps.map((step) => (
          <div key={step.title} className="text-center group">
            <div className="relative z-10">
              <div className="mx-auto mb-6 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                <Image
                  src={step.iconSrc}
                  alt={step.title}
                  width={96}
                  height={96}
                  className="h-[72px] w-[72px] md:h-[96px] md:w-[96px] object-contain"
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
              {step.title}
            </h3>
            <p className="text-gray-600">{step.description}</p>
            <p className="text-sm text-primary mt-2 font-medium">{step.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
