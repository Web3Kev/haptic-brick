### Haptic event example for iOS app Brrrowser

Throw balls inside a cube. Make them bounce.
Each object colliding with the walls will create haptic feedback.

On iOS, this only works when viewed from the app "Brrrowser", which wraps "navigator.vibrate". However, this example also uses a Brrrowser app exclusive "navigator.haptic" call.

"navigator.haptic" leverages the full subtility of iOS haptic engine, giving access to intensity and sharpeness of the vibration, as offered by iOS's Haptic's engine.

This experience is still usable for android users, as "navigator.haptic" will default back to "navigator.vibrate", which is normally supported on android devices.

"Navigator.vibrate" only offers a time-based vibration and no intensity or sharpness tuning unlike "navigator.haptic" (exclusive to Brrrowser app on iOS).

"navigator.vibrate" works great for occasional vibrations such as notifications, or events.
In this example we use the vibration along with rapier's "onContactForce" giving access to "totalForceMagnitude" on collisions. 

The calls can be trigger multiple times per seconds. 

"Navigator.haptic" will manage it properly, along with various intensities depending on the force. 

"Navigator.vibrate" however, cannot deal with repeated calls and will crash the experience if not handled properly.

In the snippet below, we first test for the presence of "Navigator.haptic", clamp and map the intensity to "Navigator.haptic"'s api, then fall back to "Navigator.vibrate" if the experience isn't viewed through the Brrrowse's app and "Navigator.vibrate" is available. 
We then restrict the excessive multiple calls in order to still provide vibration feedback without cluttering the main thread, by allowing a maximum of 1 vibration per 100ms:

``` 
let lastVibrateTime = 0;
const VIBRATE_THROTTLE_MS = 100; // Allow 1 vibration per 100ms

const haptic = (e: any) => {
  const force = e.maxForceMagnitude;

  if (force && force > 4.5) {

    // Map 4.5–20 → 0.2–1.0, clamp anything >20 to 1.0
    const mapForce = (val: number) => {
      if (val >= 20) return 1.0;
      const minVal = 4.5;
      const maxVal = 20;
      const minMapped = 0.2;
      const maxMapped = 1.0;
      const scaled = (val - minVal) / (maxVal - minVal); // 0–1
      return minMapped + scaled * (maxMapped - minMapped);
    };

    const intensity = mapForce(force);

    if ((navigator as any).haptic) {
      (navigator as any).haptic([
        { intensity, sharpness: 0.8 }
      ]);
    } 
    else if ("vibrate" in navigator) {

      const now = Date.now();
      if (now - lastVibrateTime < VIBRATE_THROTTLE_MS) {
        return; // Too soon, skip
      }
      lastVibrateTime = now;
      navigator.vibrate(5);
    }
  }
};

```

The brick model used in this experience is : 
"2x2 Lego Brick" (https://skfb.ly/6YZrA) by Aleks P is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).