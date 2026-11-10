plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

val uploadStoreFile = System.getenv("POULVIA_UPLOAD_STORE_FILE")
val uploadStorePassword = System.getenv("POULVIA_UPLOAD_STORE_PASSWORD")
val uploadKeyAlias = System.getenv("POULVIA_UPLOAD_KEY_ALIAS")
val uploadKeyPassword = System.getenv("POULVIA_UPLOAD_KEY_PASSWORD")
val hasUploadSigning = listOf(
    uploadStoreFile,
    uploadStorePassword,
    uploadKeyAlias,
    uploadKeyPassword,
).all { !it.isNullOrBlank() }

android {
    namespace = "com.poulvia.poulvia"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "com.poulvia.poulvia"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        // Uses the version code from pubspec.yaml. When using split APKs, 1000 * ABI_VERSION
        // is added automatically by Flutter. (https://developer.android.com/studio/build/configure-apk-splits#configure-APK-versions)
        // You can force using the value of versionCode by specifying the `-P force-version-code-ignoring-abi=true`
        // flag during build.
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    if (hasUploadSigning) {
        signingConfigs {
            create("release") {
                storeFile = file(uploadStoreFile!!)
                storePassword = uploadStorePassword!!
                keyAlias = uploadKeyAlias!!
                keyPassword = uploadKeyPassword!!
            }
        }
    }

    buildTypes {
        release {
            if (hasUploadSigning) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }
}

// Évite de produire silencieusement un APK/AAB release non signé.
tasks.configureEach {
    if (name in setOf("assembleRelease", "bundleRelease", "packageRelease")) {
        doFirst {
            if (!hasUploadSigning) {
                throw GradleException(
                    "Signature release manquante. Configurez POULVIA_UPLOAD_STORE_FILE, " +
                        "POULVIA_UPLOAD_STORE_PASSWORD, POULVIA_UPLOAD_KEY_ALIAS et " +
                        "POULVIA_UPLOAD_KEY_PASSWORD avant de créer la bêta."
                )
            }
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}
