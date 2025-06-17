### Haptic event example for iOS app Brrrowser

Throw balls inside a cube. Make them bounce.
Each object colliding with the walls will create haptic feedback.
This only works when viewed from the app "Brrrowser" on iOS, that wraps navigator.vibrate as well as a Brrrowser app exclusive "navigator.haptic".

navigator.haptic leverages the full subtility of iOS haptic engine.

This experience is still usable for android users, as navigator.haptic will fall back to navigator.vibrate which is normally supported on android devices.
Navigator.vibrate only offers a time based vibration and no intensity or sharpness tunining unlike navigator.haptic (exclusive to Brrrowser app on iOS)


"2x2 Lego Brick" (https://skfb.ly/6YZrA) by Aleks P is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).