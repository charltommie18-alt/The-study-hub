/**
 * The Study Hub – Amazon Monthly Subscription Config
 * Standalone. Does not modify the main web app.
 */

export const AMAZON_SUBSCRIPTION = {
  parentSku: "studyhub_monthly_sub",
  termSku: "studyhub_monthly_term",
  title: "The Study Hub Pro Monthly",
  priceUsd: 4.99,
  trialDays: 7,
  period: "Monthly" as const,
  autoRenew: true,
} as const;

export const AMAZON_MONTHLY_TERM_SKU = AMAZON_SUBSCRIPTION.termSku;
export const AMAZON_MONTHLY_PARENT_SKU = AMAZON_SUBSCRIPTION.parentSku;
