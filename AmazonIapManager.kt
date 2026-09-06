package com.studyhub.iap

import android.app.Activity
import android.util.Log
import com.amazon.device.iap.PurchasingListener
import com.amazon.device.iap.PurchasingService
import com.amazon.device.iap.model.*

/**
 * The Study Hub – Amazon In-App Purchasing Manager
 * Handles monthly subscription (studyhub_monthly_term @ $4.99)
 */
class AmazonIapManager(private val activity: Activity) : PurchasingListener {

    companion object {
        private const val TAG = "StudyHubIAP"
    }

    fun initialize() {
        PurchasingService.registerListener(activity.applicationContext, this)
        PurchasingService.getUserData()
        PurchasingService.getPurchaseUpdates(true)
        // Request product data for our monthly term
        PurchasingService.getProductData(setOf(AmazonBillingService.MONTHLY_TERM))
        Log.d(TAG, "Amazon IAP initialized for The Study Hub")
    }

    fun buyMonthly() {
        Log.d(TAG, "Initiating purchase: ${AmazonBillingService.MONTHLY_TERM}")
        PurchasingService.purchase(AmazonBillingService.MONTHLY_TERM)
    }

    fun buy(sku: String) {
        Log.d(TAG, "Initiating purchase: $sku")
        PurchasingService.purchase(sku)
    }

    fun getPurchaseUpdates() {
        PurchasingService.getPurchaseUpdates(true)
    }

    // ------------------------------------------------------------------
    // PurchasingListener callbacks
    // ------------------------------------------------------------------

    override fun onUserDataResponse(response: UserDataResponse) {
        when (response.requestStatus) {
            UserDataResponse.RequestStatus.SUCCESSFUL -> {
                Log.d(TAG, "User ID: ${response.userData?.userId}")
            }
            UserDataResponse.RequestStatus.FAILED -> {
                Log.e(TAG, "getUserData failed")
            }
            UserDataResponse.RequestStatus.NOT_SUPPORTED -> {
                Log.w(TAG, "getUserData not supported")
            }
        }
    }

    override fun onProductDataResponse(response: ProductDataResponse) {
        when (response.requestStatus) {
            ProductDataResponse.RequestStatus.SUCCESSFUL -> {
                response.productData.forEach { (sku, product) ->
                    Log.d(TAG, "Product: $sku | ${product.title} | ${product.price}")
                }
                response.unavailableSkus.forEach {
                    Log.w(TAG, "Unavailable SKU: $it")
                }
            }
            ProductDataResponse.RequestStatus.FAILED -> {
                Log.e(TAG, "getProductData failed")
            }
            ProductDataResponse.RequestStatus.NOT_SUPPORTED -> {
                Log.w(TAG, "getProductData not supported")
            }
        }
    }

    override fun onPurchaseUpdatesResponse(response: PurchaseUpdatesResponse) {
        when (response.requestStatus) {
            PurchaseUpdatesResponse.RequestStatus.SUCCESSFUL -> {
                response.receipts.forEach { receipt ->
                    Log.d(TAG, "Owned: ${receipt.sku} | canceled=${receipt.isCanceled}")
                    if (!receipt.isCanceled && AmazonBillingService.isMonthly(receipt.sku)) {
                        // TODO: Unlock Pro features for this user
                        Log.d(TAG, "Active monthly subscription found")
                    }
                }
                if (response.hasMore()) {
                    PurchasingService.getPurchaseUpdates(false)
                }
            }
            PurchaseUpdatesResponse.RequestStatus.FAILED -> {
                Log.e(TAG, "getPurchaseUpdates failed")
            }
            PurchaseUpdatesResponse.RequestStatus.NOT_SUPPORTED -> {
                Log.w(TAG, "getPurchaseUpdates not supported")
            }
        }
    }

    override fun onPurchaseResponse(response: PurchaseResponse) {
        when (response.requestStatus) {
            PurchaseResponse.RequestStatus.SUCCESSFUL -> {
                val receipt = response.receipt
                Log.d(TAG, "Purchase SUCCESS: ${receipt.sku}")
                // TODO: Verify receipt (RVS) then unlock Pro
                // For sandbox / App Tester this is enough to mark success
            }
            PurchaseResponse.RequestStatus.ALREADY_PURCHASED -> {
                Log.d(TAG, "Already purchased")
                // Refresh entitlements
                PurchasingService.getPurchaseUpdates(true)
            }
            PurchaseResponse.RequestStatus.INVALID_SKU -> {
                Log.e(TAG, "Invalid SKU")
            }
            PurchaseResponse.RequestStatus.FAILED -> {
                Log.e(TAG, "Purchase failed")
            }
            PurchaseResponse.RequestStatus.NOT_SUPPORTED -> {
                Log.w(TAG, "Purchase not supported on this device")
            }
        }
    }
}
