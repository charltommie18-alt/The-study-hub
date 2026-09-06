# The Study Hub – ProGuard rules for Amazon Appstore SDK

-dontwarn com.amazon.**
-keep class com.amazon.** { *; }
-keep interface com.amazon.** { *; }

# Keep our IAP classes
-keep class com.studyhub.iap.** { *; }
