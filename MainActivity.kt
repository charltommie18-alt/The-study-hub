package com.studyhub

import android.os.Bundle
import androidx.activity.ComponentActivity
import com.studyhub.iap.AmazonIapManager

/**
 * The Study Hub – Entry Activity (Amazon / Fire OS)
 *
 * This is a minimal host activity that initializes Amazon IAP.
 * Replace setContent / loadUrl with your WebView or full Compose UI
 * when you are ready to ship a native wrapper.
 */
class MainActivity : ComponentActivity() {

    private lateinit var amazonIap: AmazonIapManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize Amazon In-App Purchasing
        amazonIap = AmazonIapManager(this)
        amazonIap.initialize()

        // TODO: Load your web app here, for example:
        // setContentView(R.layout.activity_main)
        // val webView = findViewById<WebView>(R.id.webview)
        // webView.loadUrl("https://your-hosted-studyhub-url")
        //
        // Or host a Compose UI that mirrors the React app.
    }

    /** Call this from your UI when the user taps "Start Pro Monthly" */
    fun purchaseMonthlySubscription() {
        amazonIap.buyMonthly()
    }
}
