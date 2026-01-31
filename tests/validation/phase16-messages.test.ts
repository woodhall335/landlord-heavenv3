/**
 * Phase 16 Message Catalog Tests
 *
 * Validates the Phase 13 message catalog and enhanced validation features:
 * - All Phase 13 rules have message catalog entries
 * - Message fields are properly populated
 * - Enhanced validation includes help content
 * - Support categories are properly defined
 */

import {
  getPhase13Message,
  getAllPhase13Messages,
  getHelpConfig,
  getSupportCategory,
  PHASE_13_RULE_IDS,
  isPhase13RuleId,
  clearMessageCatalogCache,
} from '../../src/lib/validation/phase13-messages';

// Reset cache before each test
beforeEach(() => {
  clearMessageCatalogCache();
});

describe('Phase 16: Message Catalog', () => {
  describe('getPhase13Message', () => {
    it('should return message for s21_deposit_cap_exceeded', () => {
      const message = getPhase13Message('s21_deposit_cap_exceeded');
      expect(message).not.toBeNull();
      expect(message?.title).toBe('Deposit Exceeds Legal Cap');
      expect(message?.legalRef).toContain('Tenant Fees Act 2019');
    });

    it('should return message for s21_four_month_bar', () => {
      const message = getPhase13Message('s21_four_month_bar');
      expect(message).not.toBeNull();
      expect(message?.title).toBe('Four-Month Restriction Period');
      expect(message?.legalRef).toContain('Housing Act 1988');
    });

    it('should return message for s21_notice_period_short', () => {
      const message = getPhase13Message('s21_notice_period_short');
      expect(message).not.toBeNull();
      expect(message?.title).toBe('Notice Period Too Short');
    });

    it('should return message for s21_retaliatory_improvement_notice', () => {
      const message = getPhase13Message('s21_retaliatory_improvement_notice');
      expect(message).not.toBeNull();
      expect(message?.title).toBe('Improvement Notice Blocks Section 21');
      expect(message?.legalRef).toContain('Deregulation Act 2015');
    });

    it('should return message for s173_notice_period_short (Wales)', () => {
      const message = getPhase13Message('s173_notice_period_short');
      expect(message).not.toBeNull();
      expect(message?.title).toBe('Section 173 Notice Period Too Short');
      expect(message?.legalRef).toContain('Renting Homes (Wales) Act 2016');
    });

    it('should return message for ntl_landlord_not_registered (Scotland)', () => {
      const message = getPhase13Message('ntl_landlord_not_registered');
      expect(message).not.toBeNull();
      expect(message?.title).toBe('Landlord Registration Required');
      expect(message?.legalRef).toContain('Antisocial Behaviour');
    });

    it('should return null for non-Phase 13 rules', () => {
      const message = getPhase13Message('landlord_name_required');
      expect(message).toBeNull();
    });

    it('should return null for unknown rules', () => {
      const message = getPhase13Message('unknown_rule_xyz');
      expect(message).toBeNull();
    });
  });

  describe('Message Content Validation', () => {
    it('should have title for all Phase 13 messages', () => {
      const messages = getAllPhase13Messages();
      for (const msg of messages) {
        expect(msg.title).toBeTruthy();
        expect(msg.title.length).toBeGreaterThan(0);
      }
    });

    it('should have description for all Phase 13 messages', () => {
      const messages = getAllPhase13Messages();
      for (const msg of messages) {
        expect(msg.description).toBeTruthy();
        expect(msg.description.length).toBeGreaterThan(10);
      }
    });

    it('should have howToFix steps for all Phase 13 messages', () => {
      const messages = getAllPhase13Messages();
      for (const msg of messages) {
        expect(Array.isArray(msg.howToFix)).toBe(true);
        expect(msg.howToFix.length).toBeGreaterThan(0);
      }
    });

    it('should have legalRef for all Phase 13 messages', () => {
      const messages = getAllPhase13Messages();
      for (const msg of messages) {
        expect(msg.legalRef).toBeTruthy();
        expect(msg.legalRef.length).toBeGreaterThan(0);
      }
    });

    it('should have helpUrl for all Phase 13 messages', () => {
      const messages = getAllPhase13Messages();
      for (const msg of messages) {
        expect(msg.helpUrl).toBeTruthy();
        expect(msg.helpUrl).toContain('/help/validation/');
      }
    });

    it('should have supportTags for all Phase 13 messages', () => {
      const messages = getAllPhase13Messages();
      for (const msg of messages) {
        expect(Array.isArray(msg.supportTags)).toBe(true);
        expect(msg.supportTags.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getAllPhase13Messages', () => {
    it('should return all 15 Phase 13 messages', () => {
      const messages = getAllPhase13Messages();
      expect(messages.length).toBe(15);
    });

    it('should include messages from all jurisdictions', () => {
      const messages = getAllPhase13Messages();
      const ruleIds = messages.map((m) => m.ruleId);

      // England S21
      expect(ruleIds).toContain('s21_deposit_cap_exceeded');
      expect(ruleIds).toContain('s21_four_month_bar');
      expect(ruleIds).toContain('s21_notice_period_short');
      expect(ruleIds).toContain('s21_licensing_required_not_licensed');
      expect(ruleIds).toContain('s21_retaliatory_improvement_notice');
      expect(ruleIds).toContain('s21_retaliatory_emergency_action');

      // England S8
      expect(ruleIds).toContain('s8_notice_period_short');

      // Wales S173
      expect(ruleIds).toContain('s173_notice_period_short');
      expect(ruleIds).toContain('s173_deposit_not_protected');
      expect(ruleIds).toContain('s173_written_statement_missing');

      // Scotland NTL
      expect(ruleIds).toContain('ntl_landlord_not_registered');
      expect(ruleIds).toContain('ntl_pre_action_letter_not_sent');
      expect(ruleIds).toContain('ntl_pre_action_signposting_missing');
      expect(ruleIds).toContain('ntl_ground_1_arrears_threshold');
      expect(ruleIds).toContain('ntl_deposit_not_protected');
    });
  });

  describe('PHASE_13_RULE_IDS constant', () => {
    it('should contain 15 rule IDs', () => {
      expect(PHASE_13_RULE_IDS.length).toBe(15);
    });

    it('should match the message catalog rule IDs', () => {
      const messages = getAllPhase13Messages();
      const messageRuleIds = messages.map((m) => m.ruleId);

      for (const ruleId of PHASE_13_RULE_IDS) {
        expect(messageRuleIds).toContain(ruleId);
      }
    });
  });

  describe('isPhase13RuleId', () => {
    it('should return true for Phase 13 rules', () => {
      expect(isPhase13RuleId('s21_deposit_cap_exceeded')).toBe(true);
      expect(isPhase13RuleId('s21_four_month_bar')).toBe(true);
      expect(isPhase13RuleId('ntl_landlord_not_registered')).toBe(true);
    });

    it('should return false for non-Phase 13 rules', () => {
      expect(isPhase13RuleId('landlord_name_required')).toBe(false);
      expect(isPhase13RuleId('s21_deposit_noncompliant')).toBe(false);
      expect(isPhase13RuleId('unknown_rule')).toBe(false);
    });
  });
});

describe('Phase 16: Help Configuration', () => {
  describe('getHelpConfig', () => {
    it('should return help configuration', () => {
      const config = getHelpConfig();
      expect(config).toBeDefined();
    });

    it('should have base_url configured', () => {
      const config = getHelpConfig();
      expect(config.base_url).toBeDefined();
    });

    it('should have support_email configured', () => {
      const config = getHelpConfig();
      expect(config.support_email).toBeDefined();
    });
  });
});

describe('Phase 16: Support Categories', () => {
  describe('getSupportCategory', () => {
    it('should return deposit_issues category for deposit rules', () => {
      const category = getSupportCategory('s21_deposit_cap_exceeded');
      expect(category).not.toBeNull();
      expect(category?.category).toBe('deposit_issues');
      expect(category?.priority).toBe('medium');
    });

    it('should return timing_issues category for timing rules', () => {
      const category = getSupportCategory('s21_four_month_bar');
      expect(category).not.toBeNull();
      expect(category?.category).toBe('timing_issues');
      expect(category?.priority).toBe('low');
    });

    it('should return retaliatory_eviction category for retaliatory rules', () => {
      const category = getSupportCategory('s21_retaliatory_improvement_notice');
      expect(category).not.toBeNull();
      expect(category?.category).toBe('retaliatory_eviction');
      expect(category?.priority).toBe('high');
    });

    it('should return pre_action category for Scotland pre-action rules', () => {
      const category = getSupportCategory('ntl_pre_action_letter_not_sent');
      expect(category).not.toBeNull();
      expect(category?.category).toBe('pre_action');
      expect(category?.priority).toBe('medium');
    });

    it('should return null for non-Phase 13 rules', () => {
      const category = getSupportCategory('landlord_name_required');
      expect(category).toBeNull();
    });
  });

  describe('Support priority coverage', () => {
    it('should have high priority rules defined', () => {
      const highPriorityRules = [
        's21_retaliatory_improvement_notice',
        's21_retaliatory_emergency_action',
      ];

      for (const ruleId of highPriorityRules) {
        const category = getSupportCategory(ruleId);
        expect(category?.priority).toBe('high');
      }
    });

    it('should have low priority rules defined', () => {
      const lowPriorityRules = [
        's21_four_month_bar',
        's21_notice_period_short',
        's173_notice_period_short',
        's8_notice_period_short',
        's173_written_statement_missing',
      ];

      for (const ruleId of lowPriorityRules) {
        const category = getSupportCategory(ruleId);
        expect(category?.priority).toBe('low');
      }
    });
  });
});

describe('Phase 16: Message Catalog Coverage', () => {
  it('should have 100% coverage - all PHASE_13_RULE_IDS have messages', () => {
    for (const ruleId of PHASE_13_RULE_IDS) {
      const message = getPhase13Message(ruleId);
      expect(message).not.toBeNull();
      expect(message?.ruleId).toBe(ruleId);
    }
  });

  it('should have 100% support category coverage - all PHASE_13_RULE_IDS have categories', () => {
    for (const ruleId of PHASE_13_RULE_IDS) {
      const category = getSupportCategory(ruleId);
      expect(category).not.toBeNull();
    }
  });
});
