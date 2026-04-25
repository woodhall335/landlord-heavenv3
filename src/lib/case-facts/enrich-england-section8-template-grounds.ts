import 'server-only';

import {
  getEnglandGroundLegalWordings,
  type EnglandGroundLegalWording,
} from '@/lib/england-possession/legal-wording';
import {
  normalizeEnglandGroundCode,
  type EnglandGroundCode,
} from '@/lib/england-possession/ground-catalog';

type TemplateGround = {
  code?: string | number | null;
  number?: string | number | null;
  title?: string | null;
  statutory_text?: string | null;
  full_text?: string | null;
};

type TemplateDataWithGrounds = {
  grounds?: TemplateGround[] | null;
};

function resolveGroundCode(ground: TemplateGround): EnglandGroundCode | null {
  const rawCode = ground.code ?? ground.number;
  return rawCode === null || rawCode === undefined
    ? null
    : normalizeEnglandGroundCode(rawCode);
}

function applyGroundWording(
  ground: TemplateGround,
  wording: EnglandGroundLegalWording | undefined,
): TemplateGround {
  const legalText = wording?.legalWording || ground.statutory_text || ground.full_text || '';

  return {
    ...ground,
    title: ground.title || wording?.title || '',
    statutory_text: legalText,
    full_text: legalText,
  };
}

export async function enrichEnglandSection8TemplateGrounds<T extends TemplateDataWithGrounds>(
  templateData: T,
): Promise<T> {
  if (!Array.isArray(templateData.grounds) || templateData.grounds.length === 0) {
    return templateData;
  }

  const groundWordings = await getEnglandGroundLegalWordings();

  return {
    ...templateData,
    grounds: templateData.grounds.map((ground) => {
      const groundCode = resolveGroundCode(ground);
      return applyGroundWording(ground, groundCode ? groundWordings[groundCode] : undefined);
    }),
  };
}
