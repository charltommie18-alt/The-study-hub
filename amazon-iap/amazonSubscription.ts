/**
 * StudyHub Amazon Monthly Subscription
 *
 * Standalone configuration.
 * This does NOT modify the existing StudyHub app.
 */

export const AMAZON_SUBSCRIPTION = {
  parentSku: "studyhub_monthly_sub",
  termSku: "studyhub_monthly_term",

  title: "StudyHub Pro Monthly",

  priceUsd: 4.99,

  trialDays: 7,

  period: "Monthly" as const,

  autoRenew: true,
} as const;

export const AMAZON_MONTHLY_TERM_SKU =
  AMAZON_SUBSCRIPTION.termSku;

export const AMAZON_MONTHLY_PARENT_SKU =
  AMAZON_SUBSCRIPTION.parentSku;

export const AMAZON_APPSTORE_PUBLIC_KEY =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqU5TMO5tkpjlr908xPwnnvtFFT60uCvXchruKoPOKRHXmF0EiuWk7ISluo/SFzaoDoygSFTRtHqN8Wrdi91HZ6vV4fN2s3GP+tMwVlR3Kw0ugEHk/OY0j3jmZD8I3x2mT6+icD70sfSSJd3t0sOibCZvduqmCPpzdsViEjgCqiz2dyVH2IWTiKMFPlWrHX6q1t+ag5egO4afPxDOre9Cw4GxHLZKPQ/Bk9cYAsVuz0vgC+WPEn0+aSvTK5hG95/uErOSvvLguqBv8ZSHbdj9vgH0I7/pgQ3b7lXyMnJBSyJ47/3Sxg0xMQcKyqaRxPt3D/GS2Njvr36Vg7nqViRSPwIDAQAB";

