/**
 * Free Tools Hub Page
 *
 * Central hub listing all free tools available to landlords.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import {
  RiFileCheckLine,
  RiFileTextLine,
  RiCalculatorLine,
  RiHome2Line,
  RiMailLine
} from 'react-icons/ri';

export const metadata: Metadata = {
  title: 'Free Landlord Tools | Landlord Heaven',
  description: 'Free tools for UK landlords: document validators, Section 21 & Section 8 notice generators, rent arrears calculator, HMO license checker, and more.',
};

const freeGenerators = [
  {
    href: '/tools/free-section-21-notice-generator',
    title: 'Section 21 Notice Generator',
    description: 'Generate a free Section 21 eviction notice for England. Basic template with no legal pack.',
    icon: RiFileTextLine,
    jurisdiction: 'England',
  },
  {
    href: '/tools/free-section-8-notice-generator',
    title: 'Section 8 Notice Generator',
    description: 'Generate a free Section 8 notice with grounds for possession. Basic template only.',
    icon: RiFileTextLine,
    jurisdiction: 'England',
  },
  {
    href: '/tools/free-rent-demand-letter',
    title: 'Rent Demand Letter',
    description: 'Create a professional rent demand letter to send to tenants in arrears.',
    icon: RiMailLine,
    jurisdiction: 'All UK',
  },
];

const calculatorsAndCheckers = [
  {
    href: '/tools/rent-arrears-calculator',
    title: 'Rent Arrears Calculator',
    description: 'Calculate total rent arrears including interest for money claims.',
    icon: RiCalculatorLine,
    jurisdiction: 'All UK',
  },
  {
    href: '/tools/hmo-license-checker',
    title: 'HMO License Checker',
    description: 'Check if your property requires an HMO license based on occupancy and location.',
    icon: RiHome2Line,
    jurisdiction: 'All UK',
  },
];

const validators = [
  {
    href: '/tools/validators',
    title: 'Document Validators',
    description: 'AI-powered validation for Section 21, Section 8, Wales notices, Scotland notices, and more.',
    icon: RiFileCheckLine,
    jurisdiction: 'All UK',
  },
  {
    href: '/tools/validators/section-21',
    title: 'Section 21 Validator',
    description: 'Check if your Section 21 notice is valid and court-ready.',
    icon: RiFileCheckLine,
    jurisdiction: 'England',
  },
  {
    href: '/tools/validators/section-8',
    title: 'Section 8 Validator',
    description: 'Validate your Section 8 notice with grounds for possession.',
    icon: RiFileCheckLine,
    jurisdiction: 'England',
  },
];

export default function FreeToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-20">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">100% Free</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Free Landlord Tools
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              Helpful tools for UK landlords - no account required
            </p>
            <p className="text-sm text-gray-500">
              Generators, calculators, validators, and checkers for notices and documents
            </p>
          </div>
        </Container>
      </section>

      {/* Tools Grid */}
      <div className="py-16 md:py-20">
        <Container>
          {/* Document Generators */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Generators</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freeGenerators.map((tool) => (
                <Link key={tool.href} href={tool.href}>
                  <Card hoverable padding="large" className="h-full">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <tool.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{tool.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                        <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                          {tool.jurisdiction}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Calculators & Checkers */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Calculators & Checkers</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calculatorsAndCheckers.map((tool) => (
                <Link key={tool.href} href={tool.href}>
                  <Card hoverable padding="large" className="h-full">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-secondary/10">
                        <tool.icon className="w-6 h-6 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{tool.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                        <span className="inline-block text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded">
                          {tool.jurisdiction}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Document Validators */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Validators</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {validators.map((tool) => (
                <Link key={tool.href} href={tool.href}>
                  <Card hoverable padding="large" className="h-full">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-green-100">
                        <tool.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{tool.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                        <span className="inline-block text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                          {tool.jurisdiction}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Need Court-Ready Documents?
            </h2>
            <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              Our paid packs include professionally prepared, legally compliant documents with full validation,
              court forms, and witness statements.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/products/notice-only"
                className="inline-block bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Eviction Notices from £29.99
              </Link>
              <Link
                href="/products/money-claim"
                className="inline-block bg-white/20 text-white border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors"
              >
                Money Claims from £179.99
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
