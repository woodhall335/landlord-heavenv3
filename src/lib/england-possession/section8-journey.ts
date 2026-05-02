export type EnglandSection8JourneyStage = 'stage1' | 'stage2';

export type Section8JourneyStepKey = 'notice' | 'expiry' | 'claim' | 'hearing';

export interface Section8JourneyStep {
  key: Section8JourneyStepKey;
  label: string;
  text: string;
  imageSrc: string;
  status?: string;
  isHighlighted: boolean;
  isEmphasized: boolean;
}

export const SECTION8_JOURNEY_BASE_STEPS: ReadonlyArray<
  Pick<Section8JourneyStep, 'key' | 'label' | 'text' | 'imageSrc'>
> = [
  {
    key: 'notice',
    label: 'Serve Notice',
    text: 'Prepare and serve the Section 8 notice correctly',
    imageSrc: '/images/notice.webp',
  },
  {
    key: 'expiry',
    label: 'Notice Expires',
    text: 'Wait for the notice period to end before action',
    imageSrc: '/images/expiry.webp',
  },
  {
    key: 'claim',
    label: 'Issue Claim',
    text: 'Submit possession claim to the court',
    imageSrc: '/images/claim.webp',
  },
  {
    key: 'hearing',
    label: 'Court Hearing',
    text: 'Present your case and evidence to the judge',
    imageSrc: '/images/hearing.webp',
  },
] as const;

function getJourneyStepState(
  stage: EnglandSection8JourneyStage,
  key: Section8JourneyStepKey
): Pick<Section8JourneyStep, 'status' | 'isHighlighted' | 'isEmphasized'> {
  if (stage === 'stage1') {
    switch (key) {
      case 'notice':
        return {
          status: 'Current stage',
          isHighlighted: true,
          isEmphasized: true,
        };
      case 'expiry':
        return {
          status: 'Next',
          isHighlighted: true,
          isEmphasized: false,
        };
      default:
        return {
          status: 'Later',
          isHighlighted: false,
          isEmphasized: false,
        };
    }
  }

  switch (key) {
    case 'claim':
      return {
        status: 'Current stage',
        isHighlighted: true,
        isEmphasized: true,
      };
    case 'hearing':
      return {
        status: 'Next',
        isHighlighted: true,
        isEmphasized: true,
      };
    case 'notice':
      return {
        status: 'Foundation',
        isHighlighted: true,
        isEmphasized: false,
      };
    case 'expiry':
      return {
        status: 'Timing check',
        isHighlighted: true,
        isEmphasized: false,
      };
  }
}

export function getSection8JourneySteps(stage: EnglandSection8JourneyStage): Section8JourneyStep[] {
  return SECTION8_JOURNEY_BASE_STEPS.map((step) => ({
    ...step,
    ...getJourneyStepState(stage, step.key),
  }));
}

export function getSection8JourneySummary(stage: EnglandSection8JourneyStage): string {
  if (stage === 'stage1') {
    return 'Stage 1 covers service of the notice and the wait for expiry before the case can move on.';
  }

  return 'Stage 2 carries the same case from the notice timeline into the court claim and hearing path.';
}
