# Pyxis SDK Release Notes

## Version 0.5 (2020-06-03)

### Control of SSH access
To improve security, SSH access is not disabled by default in new installations. If needed, it must be enabled in Settings. API for this setting
is also accessible to applications.

### Hostname changing
Hostname can be changed with new API available to applications.

### Object-oriented JavaScript APIs
APIs for FIFO pipes, UART, and GPIO now use OOP-style for convenience and consistency. Note, this change may affect your 
existing applications. Please follow this [migration guide](https://github.com/renetec-io/pyxis-apps/blob/master/docs/migration-0_4.md).

### System update management
New API has been added to control SDK updates from within the applications. API includes version check and request for updates.
See the [API reference](https://github.com/renetec-io/pyxis-apps/blob/master/docs/system-api.md) 
for details.

### Power control
API has been added for requesting system reboot and shutdown. Screen power can be enabled and disabled, 
and brightness can be adjusted when supported by the display hardware. Sleep mode allows screen blanking with a timeout 
for a period of inactivity.

### Other changes
- Information about the Chromium engine is now available on the About page.
- Fixed issues with mouse pointer behavior when used without a touchscreen.
- GPIO handling performance improved.
- Console output during bootup is now hidden.

## Version 0.3 (2020-05-05)

### Web-redirect
Now you can input a website address for the browser to show. You have an option to open that website
every time the device boots up.

### Digital photo frame demo
A new demo was added that turns your device into a digital photo frame with stunning photos from [Unsplash](unsplash.com).

### Other changes
- Release Notes are now available in the docs directory.

### Bugs fixes
- Fixed the bug causing flash drive content being unavailable after reboot.
- Fixed opening applications from "USB Drive" page.
- Fixed application uninstall logic.
- Fixed wrongly scaled touchscreen input on some hardware.

## Version 0.2.2 (2020-04-22)

### Wi-Fi Management API
Wi-Fi settings can now be managed in user applications through pyxis.wlan object.

### Mock Pyxis APIs
You can now use pyxis.* objects while testing on your development host machine. 
For this, import our API library into your HTML:
```html
<script src="https://pyxis-api.renetec.io/js/pyxis-api-core.js"></script> 
```
this will add mock functions with hardcoded dummy return values, allowing for basic testing. You don’t need to worry 
about this dependency when copying to the target hardware as it will be automatically replaced by a real API library in run-time, without fetching anything from the internet.

### Application description
Description can now be added to every application through the `desc` field in the application manifest, app.yaml.

### Source code of example applications
You can use example applications, including the Settings application, as a starting point for your development. 
Their source code is available from our GitHub repository, 
[github.com/renetec-io/pyxis-apps](https://github.com/renetec-io/pyxis-apps).

## Version 0.1.11 (2020-04-01)

### API usage examples
We added examples of using our API for FIFO pipes, UART serial port, and GPIO. The examples are accessible from the 
Settings application.

### HW accelerated 3D graphics
GPU-based rendering is now available, improving user interface responsiveness and allowing rendering of WebGL scenes.