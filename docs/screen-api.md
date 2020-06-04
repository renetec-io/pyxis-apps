# Screen Power Management API

The API allows controlling screen power and brightness. It is available by importing
`https://pyxis-api.renetec.io/js/pyxis-api-core.js` and exposed through 
`pyxis.screen` object.

----
- API methods
    - [`getState()`](#getstate)
    - [`enable() / disable()`](#enable--disable)
    - [`setBrightness()`](#setbrightnesslevel)
    - [`enterSleep()`](#entersleep)
    - [`exitSleep()`](#exitsleep)
    - [`setSleepTimeout()`](#setsleeptimeoutdelay)
----

### `getState()`
Returns a Promise object that resolves with screen status.

Example:
```javascript
pyxis.screen.getState().then((state) => {
    console.log(state)
});
```
Example of `state`:
```javascript
  {
    enabled: true,
    brightness: 100,
    sleep_state: false,
    sleep_timeout: 0
  }
```

### `enable() / disable()`
Used to request turning the screen on or off.
Returns a Promise object that resolved with "OK" in case of success.

Example:
```
pyxis.screen.disable().then((rv) => {
    console.log("Turn the screen off: " + rv);
});
```

### `setBrightness(level)`
Used to request screen brightness level between 0 and 100. Selected brightness persists across reboot or power down. Contrary to the disabled state,
if brightness is set to 0, the screen may be completely disabled, but touch inputs are still registered.
Returns a Promise object that resolved with "OK" in case of success.

Example:
```
pyxis.screen.setBrightness(80).then((rv) => {
    console.log("Set brightness to 80%: " + rv);
});
```

### `enterSleep()`
Starts sleep mode. In sleep mode, the screen is disabled until any user input is detected.
Returns a Promise object that resolved with "OK" in case of success.

Example:
```
pyxis.screen.enterSleep().then((rv) => {
    console.log("Start sleep mode: " + rv);
});
```

### `exitSleep()`
Ends sleep mode.
Returns a Promise object that resolved with "OK" in case of success.

Example:
```
pyxis.screen.exitSleep().then((rv) => {
    console.log("Start sleep mode: " + rv);
});
```

### `setSleepTimeout(timeout)`
Set a timeout for entering sleep mode after some period of inactivity. `timeout` is the number of seconds. 
The value persists across reboot or power down. The value of zero disables automatic sleep mode.
Returns a Promise object that resolved with "OK" in case of success.

Example:
```
pyxis.screen.setSleepTimeout(60).then((rv) => {
    console.log("Sleep after 1 minute: " + rv);
});
```
