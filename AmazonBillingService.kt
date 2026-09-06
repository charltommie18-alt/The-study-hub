package com.studyhub.iap

/**
 * The Study Hub – Amazon Billing Constants
 * Monthly subscription only ($4.99 USD)
 */
object AmazonBillingService {

    // Parent SKU (subscription group)
    const val MONTHLY_PARENT = "studyhub_monthly_sub"

    // Term SKU (what the user actually purchases)
    const val MONTHLY_TERM = "studyhub_monthly_term"

    // Price for reference / display
    const val MONTHLY_PRICE_USD = 4.99

    fun isSubscription(sku: String): Boolean {
        return sku == MONTHLY_TERM || sku == MONTHLY_PARENT
    }

    fun isMonthly(sku: String): Boolean {
        return sku == MONTHLY_TERM
    }
}
