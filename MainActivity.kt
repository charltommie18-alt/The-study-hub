package com.studyhub.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import com.studyhub.iap.AmazonIapManager

/**
 * The Study Hub – Entry Activity (Amazon / Fire OS)
 * Package: com.studyhub.app
 */
class MainActivity : ComponentActivity() {

    private lateinit var amazonIap: AmazonIapManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        amazonIap = AmazonIapManager(this)
        amazonIap.initialize()
    }

    fun purchaseMonthlySubscription() {
        amazonIap.buyMonthly()
    }
}
