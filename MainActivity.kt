class MainActivity : ComponentActivity() {

    private lateinit var amazonIap: AmazonIapManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        amazonIap = AmazonIapManager(this)
        amazonIap.initialize()

        setContent {
            StudyHubApp()
        }
    }
}
