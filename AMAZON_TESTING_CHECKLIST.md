# The Study Hub – Amazon Appstore Testing Checklist

**App Name:** The Study Hub  
**Package / SKU focus:** Monthly Subscription only ($4.99 USD)  
**Amazon kept separate** – main app code left unchanged  

---

## 1. Subscription Details (Monthly Only)

| Field                  | Value                          |
|------------------------|--------------------------------|
| Parent SKU             | `studyhub_monthly_sub`         |
| Term SKU               | `studyhub_monthly_term`        |
| Title                  | The Study Hub Pro Monthly      |
| Price                  | $4.99 USD                      |
| Billing Period         | Monthly                        |
| Free Trial             | 7 days                         |
| Auto-renew             | Yes                            |
| Item Type              | SUBSCRIPTION                   |

Use **only** these two SKUs for testing. Ignore yearly and coins for now.

---

## 2. Pre-Testing Setup (Do Once)

- [ ] Log in to [Amazon Developer Console](https://developer.amazon.com/apps-and-games)
- [ ] Create / select the app **The Study Hub**
- [ ] Note your App ID / Package name (recommended: `com.studyhub.app` or keep existing)
- [ ] Go to **In-App Items** → Create the subscription:
  - Parent SKU: `studyhub_monthly_sub`
  - Term SKU: `studyhub_monthly_term`
  - Price: $4.99 USD
  - Free trial: 7 days
  - Term: Monthly
- [ ] Submit the IAP items (they can stay in “Under Review” or “Live” for LAT)
- [ ] Download / confirm your Appstore Authentication Key (public key) – already present in `amazon-iap/`

---

## 3. App Tester Setup (Sandbox / Local Testing)

**Goal:** Test IAP API calls without real charges.

- [ ] Install **Amazon App Tester** from the Amazon Appstore on a Fire tablet / Fire TV / Android test device
- [ ] Enable ADB debugging on the device
- [ ] Push the JSON file to the device:
  ```bash
  adb push amazon.sdktester.json /sdcard/amazon.sdktester.json
