import { Container } from '@/components/ui';
import { RiFileList3Line, RiPriceTag3Line, RiShieldCheckLine } from 'react-icons/ri';

const assurances = [
  {
    title: 'Know what you are buying',
    description:
      'Each product page explains who the document is for, what it includes, and which route to choose.',
    Icon: RiFileList3Line,
  },
  {
    title: 'See the price first',
    description:
      'The product price and scope are shown before you begin, with no invented savings or results claims.',
    Icon: RiPriceTag3Line,
  },
  {
    title: 'Review before completion',
    description:
      'Guided questions and validation checks help you review the information used to prepare the document.',
    Icon: RiShieldCheckLine,
  },
] as const;

/**
 * Evidence-based buying assurances. The legacy component name is retained so
 * older page compositions do not need to change, but no testimonial or review
 * claim is displayed without a verified review source.
 */
export function Testimonials() {
  return (
    <section className="bg-gray-50 py-20 md:py-24">
      <Container>
        <div className="mb-14 text-center">
          <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-2">
            <span className="text-sm font-semibold text-primary">Clear buying information</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            What to expect before you pay
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Choose the right route, review the scope, and see the price before starting.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3 lg:gap-8">
          {assurances.map(({ title, description, Icon }) => (
            <div key={title} className="rounded-2xl border-2 border-gray-100 bg-white p-8 shadow-sm">
              <Icon className="mb-5 h-9 w-9 text-primary" aria-hidden="true" />
              <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
              <p className="leading-relaxed text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default Testimonials;
