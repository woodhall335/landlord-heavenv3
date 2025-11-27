import { describe, test, expect, beforeAll } from 'vitest';
import { loadMQS, getNextMQSQuestion } from '@/lib/wizard/mqs-loader';
import type { MasterQuestionSet, ExtendedWizardQuestion } from '@/lib/wizard/types';

describe('Tenancy Agreement MQS - All Jurisdictions', () => {
  // Test England & Wales
  describe('England & Wales - Standard AST', () => {
    let mqs: MasterQuestionSet | null;

    beforeAll(() => {
      mqs = loadMQS('tenancy_agreement', 'england-wales');
    });

    test('should load england-wales MQS successfully', () => {
      expect(mqs).not.toBeNull();
      expect(mqs?.product).toBe('tenancy_agreement');
      expect(mqs?.jurisdiction).toBe('england-wales');
    });

    test('should have questions with valid structure', () => {
      expect(mqs?.questions).toBeDefined();
      expect(Array.isArray(mqs?.questions)).toBe(true);
      expect(mqs!.questions.length).toBeGreaterThan(0);

      // Validate each question has required fields
      mqs!.questions.forEach((q: ExtendedWizardQuestion) => {
        expect(q.id).toBeDefined();
        expect(typeof q.id).toBe('string');
        expect(q.inputType).toBeDefined();
        expect(typeof q.inputType).toBe('string');

        // If question has options, they should be string arrays
        if (q.options) {
          expect(Array.isArray(q.options)).toBe(true);
          q.options.forEach((opt: any) => {
            expect(typeof opt).toBe('string');
          });
        }

        // If question has fields (group type), validate nested fields
        if (q.fields) {
          q.fields.forEach((field: any) => {
            expect(field.id).toBeDefined();
            expect(field.inputType).toBeDefined();

            // Nested field options should also be string arrays
            if (field.options) {
              expect(Array.isArray(field.options)).toBe(true);
              field.options.forEach((opt: any) => {
                expect(typeof opt).toBe('string');
              });
            }
          });
        }

        // maps_to should be present and be an array
        if (q.maps_to) {
          expect(Array.isArray(q.maps_to)).toBe(true);
        }

        // dependsOn should reference valid question IDs
        if (q.dependsOn) {
          expect(q.dependsOn.questionId).toBeDefined();
          const referencedQuestion = mqs!.questions.find(
            (ref: ExtendedWizardQuestion) => ref.id === q.dependsOn?.questionId
          );
          expect(referencedQuestion).toBeDefined();
        }
      });
    });

    test('should start with product tier question', () => {
      const firstQuestion = getNextMQSQuestion(mqs!, {});
      expect(firstQuestion).not.toBeNull();
      expect(firstQuestion?.id).toBe('ast_tier');
    });

    test('should not crash when stepping through standard flow', () => {
      let facts: Record<string, any> = {};
      let currentQuestion = getNextMQSQuestion(mqs!, facts);
      let iterations = 0;
      const maxIterations = 10;

      while (currentQuestion && iterations < maxIterations) {
        // Simulate answering the question
        if (currentQuestion.id === 'ast_tier') {
          facts.product_tier = 'Standard AST';
        } else if (currentQuestion.maps_to && currentQuestion.maps_to.length > 0) {
          // Set a dummy value for the first map target
          const path = currentQuestion.maps_to[0];
          facts[path] = 'test_value';
        }

        currentQuestion = getNextMQSQuestion(mqs!, facts);
        iterations++;
      }

      // Should be able to step through at least a few questions
      expect(iterations).toBeGreaterThan(0);
    });

    test('should show premium questions when Premium AST selected', () => {
      const facts: Record<string, any> = { product_tier: 'Premium AST' };

      // Find all questions
      const premiumQuestions = mqs!.questions.filter((q: ExtendedWizardQuestion) =>
        q.dependsOn?.questionId === 'ast_tier' &&
        q.dependsOn?.value === 'Premium AST'
      );

      expect(premiumQuestions.length).toBeGreaterThan(0);
    });
  });

  // Test Scotland
  describe('Scotland - Standard PRT', () => {
    let mqs: MasterQuestionSet | null;

    beforeAll(() => {
      mqs = loadMQS('tenancy_agreement', 'scotland');
    });

    test('should load scotland MQS successfully', () => {
      expect(mqs).not.toBeNull();
      expect(mqs?.product).toBe('tenancy_agreement');
      expect(mqs?.jurisdiction).toBe('scotland');
    });

    test('should have questions with valid structure', () => {
      expect(mqs?.questions).toBeDefined();
      expect(Array.isArray(mqs?.questions)).toBe(true);
      expect(mqs!.questions.length).toBeGreaterThan(0);

      // Validate options are string arrays
      mqs!.questions.forEach((q: ExtendedWizardQuestion) => {
        if (q.options) {
          q.options.forEach((opt: any) => {
            expect(typeof opt).toBe('string');
          });
        }

        if (q.fields) {
          q.fields.forEach((field: any) => {
            if (field.options) {
              field.options.forEach((opt: any) => {
                expect(typeof opt).toBe('string');
              });
            }
          });
        }
      });
    });

    test('should have maintenance and access sections', () => {
      const maintenanceQ = mqs!.questions.find((q: ExtendedWizardQuestion) =>
        q.id === 'maintenance_repairs'
      );
      const accessQ = mqs!.questions.find((q: ExtendedWizardQuestion) =>
        q.id === 'access_inspections'
      );

      expect(maintenanceQ).toBeDefined();
      expect(accessQ).toBeDefined();
    });

    test('should have premium HMO and insurance sections', () => {
      const hmoQ = mqs!.questions.find((q: ExtendedWizardQuestion) =>
        q.id === 'hmo_details'
      );
      const insuranceQ = mqs!.questions.find((q: ExtendedWizardQuestion) =>
        q.id === 'tenant_insurance_requirements'
      );
      const maintenanceScheduleQ = mqs!.questions.find((q: ExtendedWizardQuestion) =>
        q.id === 'maintenance_schedule'
      );

      expect(hmoQ).toBeDefined();
      expect(insuranceQ).toBeDefined();
      expect(maintenanceScheduleQ).toBeDefined();

      // These should be premium-only
      expect(hmoQ?.dependsOn?.value).toContain('Premium');
      expect(insuranceQ?.dependsOn?.value).toContain('Premium');
      expect(maintenanceScheduleQ?.dependsOn?.value).toContain('Premium');
    });

    test('should have similar section count to E&W', () => {
      const ewMqs = loadMQS('tenancy_agreement', 'england-wales');

      // Scotland should have a reasonable number of questions (rough parity)
      // England & Wales has more premium features, so Scotland might have slightly fewer
      expect(mqs!.questions.length).toBeGreaterThan(20);

      // But should have at least 60% of E&W question count
      const ratio = mqs!.questions.length / ewMqs!.questions.length;
      expect(ratio).toBeGreaterThan(0.6);
    });
  });

  // Test Northern Ireland
  describe('Northern Ireland - Standard Tenancy', () => {
    let mqs: MasterQuestionSet | null;

    beforeAll(() => {
      mqs = loadMQS('tenancy_agreement', 'northern-ireland');
    });

    test('should load northern-ireland MQS successfully', () => {
      expect(mqs).not.toBeNull();
      expect(mqs?.product).toBe('tenancy_agreement');
      expect(mqs?.jurisdiction).toBe('northern-ireland');
    });

    test('should have questions with valid structure', () => {
      expect(mqs?.questions).toBeDefined();
      expect(Array.isArray(mqs?.questions)).toBe(true);
      expect(mqs!.questions.length).toBeGreaterThan(0);

      // Validate options are string arrays
      mqs!.questions.forEach((q: ExtendedWizardQuestion) => {
        if (q.options) {
          q.options.forEach((opt: any) => {
            expect(typeof opt).toBe('string');
          });
        }

        if (q.fields) {
          q.fields.forEach((field: any) => {
            if (field.options) {
              field.options.forEach((opt: any) => {
                expect(typeof opt).toBe('string');
              });
            }
          });
        }
      });
    });

    test('should have maintenance and access sections', () => {
      const maintenanceQ = mqs!.questions.find((q: ExtendedWizardQuestion) =>
        q.id === 'maintenance_repairs'
      );
      const accessQ = mqs!.questions.find((q: ExtendedWizardQuestion) =>
        q.id === 'access_inspections'
      );

      expect(maintenanceQ).toBeDefined();
      expect(accessQ).toBeDefined();
    });

    test('should have premium HMO and insurance sections', () => {
      const hmoQ = mqs!.questions.find((q: ExtendedWizardQuestion) =>
        q.id === 'hmo_details'
      );
      const insuranceQ = mqs!.questions.find((q: ExtendedWizardQuestion) =>
        q.id === 'tenant_insurance_requirements'
      );
      const maintenanceScheduleQ = mqs!.questions.find((q: ExtendedWizardQuestion) =>
        q.id === 'maintenance_schedule'
      );

      expect(hmoQ).toBeDefined();
      expect(insuranceQ).toBeDefined();
      expect(maintenanceScheduleQ).toBeDefined();

      // These should be premium-only
      expect(hmoQ?.dependsOn?.value).toContain('Premium');
      expect(insuranceQ?.dependsOn?.value).toContain('Premium');
      expect(maintenanceScheduleQ?.dependsOn?.value).toContain('Premium');
    });

    test('should have similar section count to E&W', () => {
      const ewMqs = loadMQS('tenancy_agreement', 'england-wales');

      // NI should have a reasonable number of questions (rough parity)
      expect(mqs!.questions.length).toBeGreaterThan(20);

      // But should have at least 60% of E&W question count
      const ratio = mqs!.questions.length / ewMqs!.questions.length;
      expect(ratio).toBeGreaterThan(0.6);
    });
  });

  // Cross-jurisdiction tests
  describe('Cross-Jurisdiction Validation', () => {
    test('all jurisdictions should have product tier as first question', () => {
      const ewMqs = loadMQS('tenancy_agreement', 'england-wales');
      const scotMqs = loadMQS('tenancy_agreement', 'scotland');
      const niMqs = loadMQS('tenancy_agreement', 'northern-ireland');

      const ewFirst = getNextMQSQuestion(ewMqs!, {});
      const scotFirst = getNextMQSQuestion(scotMqs!, {});
      const niFirst = getNextMQSQuestion(niMqs!, {});

      expect(ewFirst?.id).toMatch(/tier/i);
      expect(scotFirst?.id).toMatch(/tier/i);
      expect(niFirst?.id).toMatch(/tier/i);
    });

    test('all jurisdictions should have core sections', () => {
      const jurisdictions = ['england-wales', 'scotland', 'northern-ireland'];
      const coreSections = [
        'property',
        'landlord',
        'tenant',
        'rent',
        'deposit',
        'bills',
        'safety',
        'maintenance',
      ];

      jurisdictions.forEach((jurisdiction) => {
        const mqs = loadMQS('tenancy_agreement', jurisdiction);
        expect(mqs).not.toBeNull();

        coreSections.forEach((section) => {
          const hasSection = mqs!.questions.some((q: ExtendedWizardQuestion) =>
            q.section?.toLowerCase().includes(section) ||
            q.id.toLowerCase().includes(section)
          );
          expect(hasSection).toBe(true);
        });
      });
    });

    test('no questions should have label/value object options', () => {
      const jurisdictions = ['england-wales', 'scotland', 'northern-ireland'];

      jurisdictions.forEach((jurisdiction) => {
        const mqs = loadMQS('tenancy_agreement', jurisdiction);

        mqs!.questions.forEach((q: ExtendedWizardQuestion) => {
          if (q.options) {
            q.options.forEach((opt: any) => {
              // Should be a string, not an object with label/value
              expect(typeof opt).toBe('string');
              expect(opt).not.toHaveProperty('label');
              expect(opt).not.toHaveProperty('value');
            });
          }

          // Check nested fields too
          if (q.fields) {
            q.fields.forEach((field: any) => {
              if (field.options) {
                field.options.forEach((opt: any) => {
                  expect(typeof opt).toBe('string');
                  expect(opt).not.toHaveProperty('label');
                  expect(opt).not.toHaveProperty('value');
                });
              }
            });
          }
        });
      });
    });
  });
});
