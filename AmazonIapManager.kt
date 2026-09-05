package com.studyhub.iap

import android.app.Activity
import android.util.Log
import com.amazon.device.iap.PurchasingListener
import com.amazon.device.iap.PurchasingService
import com.amazon.device.iap.model.*

class AmazonIapManager(private val activity: Activity) : PurchasingListener {

    fun initialize() {
        PurchasingService.registerListener(activity, this)
        PurchasingService.getUserData()
        PurchasingService.getPurchaseUpdates(true)
    }

    fun buy(sku: String) {
        PurchasingService.purchase(sku)
    }

    override fun onUserDataResponse(response: UserDataResponse) {
        Log.d("IAP", "User: ${response.userData?.userId}")
    }

    override fun onProductDataResponse(response: ProductDataResponse) {
        Log.d("IAP", "Products loaded")
    }

    override fun onPurchaseUpdatesResponse(response: PurchaseUpdatesResponse) {
        response.receipts.forEach {
            Log.d("IAP", "Owned: ${it.sku}")
        }
    }

    override fun onPurchaseResponse(response: PurchaseResponse) {
        when (response.requestStatus) {
            PurchaseResponse.RequestStatus.SUCCESSFUL -> {
                Log.d("IAP", "Purchased ${response.receipt.sku}")
            }
            else -> Log.d("IAP", "Purchase failed")
        }
    }
}
