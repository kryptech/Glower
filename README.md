# Glowr
### Illuminate the darkness with adjustable red screen glow.
This was inspired by the desire for a super-simple app that would use the screen as light for reading at night, and using red light to be gentle on night vision. No permissions are required.

## Installing
You can install the built and unsigned app by copying the file _Glowr-unsigned.apk_ to your device and running it, or from the command line with `adb install Glowr-unsigned.apk`.

## Building
Built with [PhoneGap](https://phonegap.com) 7.1.1. Currently targetting Android 30.
Requires PhoneGap to be installed along with its prerequisits (NPM, Android SDKs).
Run `npm i` to download and install dependancies before you begin.
Run `phonegap build android` from the command line. The APK file will be output to _platforms/android/app/build/outputs/apk/debug/_ You can deploy to your connected Android device by navigating your command line to that path and running `adb install app-debug.apk`, or you can open the APK from your device and install it.

## Author
Chris M. Sissons

## License
MIT licensed
