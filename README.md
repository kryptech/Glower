# Glowr
### Illuminate the darkness with adjustable red screen glow.
This was inspired by the desire for a super-simple app that would use the screen as light for reading at night, and using red light to be gentle on night vision. No permissions are required.
https://github.com/kryptech/Glower

## Installing
You can install the built and unsigned app by copying the file _Glowr-unsigned.apk_ to your device and running it, or from the command line with `adb install Glowr-unsigned.apk`.
Due to the version of PhoneGap the minimum supported version of Android is Lollipop 5.1 (SDK version 22).

## Building
Built with [PhoneGap](https://phonegap.com) 7.1.1. Currently targetting Android 29.
Requires PhoneGap to be installed along with its prerequisits (npm, Android SDKs). Run `npm i` to download and install dependancies before you begin.
You'll also need the [cordova-plugin-brightness](https://github.com/mgcrea/cordova-plugin-brightness) which you can install with `phonegap plugin add cordova-plugin-brightness`.
You'll also need the [cordova-plugin-inappbrowser](https://github.com/apache/cordova-plugin-inappbrowser) which you can install with `phonegap plugin add cordova-plugin-inappbrowser`.
You can debug by running `phonegap serve` and using the [PhoneGap Developer app](https://play.google.com/store/apps/details?id=com.adobe.phonegap.app) on your device to fetch the app over the network. This will allow you to get console info from the app. Note that the brightness plugin might not work when testing this way.
You can install a standalone copy by running `phonegap build android` from the command line. The APK file will be output to _platforms/android/app/build/outputs/apk/debug/_ You can deploy to your connected Android device by navigating your command line to that path and running `adb install app-debug.apk`, or you can open the APK from your device and install it.

## Author
Chris M. Sissons

## License
MIT licensed
