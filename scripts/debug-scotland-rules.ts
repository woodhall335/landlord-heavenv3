/**
 * Debug Scotland Rules Loading
 */

import { loadDecisionEngine } from '../src/lib/decision-engine/config-loader';

console.log('🔍 Debugging Scotland Rules Loading\n');

try {
  const scotlandEngine = loadDecisionEngine('scotland');

  console.log('✅ Scotland decision_engine.yaml loaded successfully!');
  console.log('\n📋 Number of rules:', scotlandEngine.rules.length);

  console.log('\n📜 First 3 rules:');
  scotlandEngine.rules.slice(0, 3).forEach((rule: any, idx: number) => {
    console.log(`\n${idx + 1}. ${rule.name} (${rule.rule_id})`);
    console.log('   Conditions:', JSON.stringify(rule.conditions, null, 2));
    console.log('   Primary grounds:', rule.recommended_grounds?.primary);
    console.log('   Notice period:', rule.notice_period);
  });

} catch (error: any) {
  console.error('❌ Error loading Scotland rules:', error.message);
  console.error(error.stack);
}
