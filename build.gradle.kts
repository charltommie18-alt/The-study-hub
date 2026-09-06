// The Study Hub – Amazon / Fire OS module dependencies (snippet)
// Place the official Appstore SDK JAR at: libs/amazon-appstore-sdk.jar
// Download from: https://developer.amazon.com/apps-and-games/sdk-download

dependencies {
    // Amazon Appstore SDK (required for IAP)
    implementation(files("libs/amazon-appstore-sdk.jar"))

    // AndroidX
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.activity:activity-ktx:1.9.2")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.6")
}
