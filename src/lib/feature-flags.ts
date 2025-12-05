export const HMO_PRO_ENABLED = process.env.ENABLE_HMO_PRO === 'true';

export const HMO_PRO_DISABLED_RESPONSE = {
  error: 'HMO Pro (licensing and subscription features) is out of scope for V1.',
  message:
    'HMO licensing and subscription tooling are roadmap items. For V1, please use eviction, money claim, or tenancy agreement products for England & Wales and Scotland. Northern Ireland supports tenancy agreements only.',
};
