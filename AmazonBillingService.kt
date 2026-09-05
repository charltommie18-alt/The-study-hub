package com.studyhub.iap

object AmazonBillingService {

    const val MONTHLY = "com.studyhub.premium.monthly"
    const val YEARLY = "com.studyhub.premium.yearly"
    const val COINS = "com.studyhub.coins100"

    fun isSubscription(sku: String): Boolean {
        return sku == MONTHLY || sku == YEARLY
    }

    fun isConsumable(sku: String): Boolean {
        return sku == COINS
    }
}
