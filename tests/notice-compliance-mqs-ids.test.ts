import { describe, expect, it } from 'vitest';
import fs from 'fs';
import yaml from 'js-yaml';
import { noticeComplianceSpecs } from '@/lib/notices/notice-compliance-spec';

const mqsByJurisdiction: Record<string, string> = {
  england: 'config/mqs/notice_only/england.yaml',
  'england-wales': 'config/mqs/notice_only/england.yaml',
  wales: 'config/mqs/notice_only/wales.yaml',
  scotland: 'config/mqs/notice_only/scotland.yaml',
};

function collectQuestionIds(filePath: string) {
  const doc = yaml.load(fs.readFileSync(filePath, 'utf8')) as any;
  const ids = new Set<string>();

  const walk = (questions?: any[]) => {
    if (!Array.isArray(questions)) return;
    for (const q of questions) {
      if (q?.id) ids.add(q.id);
      if (Array.isArray(q?.fields)) {
        walk(q.fields);
      }
      if (Array.isArray(q?.questions)) {
        walk(q.questions);
      }
    }
  };

  walk(doc?.questions);
  return ids;
}

describe('notice compliance affected_question_id coverage', () => {
  it('all affected_question_id values exist in the MQS for the jurisdiction', () => {
    const cache = new Map<string, Set<string>>();
    const missing: string[] = [];

    for (const spec of noticeComplianceSpecs) {
      const mqsPath = mqsByJurisdiction[spec.jurisdiction];
      expect(mqsPath, `MQS mapping missing for ${spec.jurisdiction}`).toBeTruthy();

      if (!cache.has(mqsPath)) {
        cache.set(mqsPath, collectQuestionIds(mqsPath));
      }

      const ids = cache.get(mqsPath)!;

      const rules = [
        ...(spec.hard_bars || []),
        ...(spec.soft_warnings || []),
        ...(spec.inline_validation_rules || []),
        ...(spec.correction_prompts || []),
      ];

      for (const rule of rules) {
        if (!ids.has(rule.affected_question_id)) {
          missing.push(`${spec.route}:${rule.code}:${rule.affected_question_id}`);
        }
      }
    }

    expect(missing).toEqual([]);
  });
});

