# Wi-Fi Management API

The API provides access to control of the on-board Wi-Fi module.
It is available by importing `https://pyxis-api.renetec.io/js/pyxis-api-core.js` and exposed through 
`pyxis.wlan` object.

----
- API methods
    - [`listScannedNetworks()`](#listscannednetworks)
    - [`listSavedNetworks()`](#listsavednetworks)
    - [`forceScan()`](#forcescan)
    - [`forget(ssid)`](#forgetssid)
    - [`connect(ssid, psk)`](#connectssid-psk)
    - [`setEnabled(enabled)`](#setenabledenabled)
    - [`getStatus`](#getstatus)
    - [`getCountry()`](#getcountry)
    - [`setCountry(country)`](#setcountrycountry)

----

### `listScannedNetworks()`
Returns a Promise object that resolves with an array of currently scanned networks.
If the wireless interface is turned off, it results in an empty array.
Networks are added as they are discovered during scan, you may need to call this API a few times 
to get up-to-date information.
To initiate scan, use [`forceScan()`](#forceScan()) API.

Example:
```javascript
pyxis.wlan.listScannedNetworks().then((networks) => {
    console.log(networks)
});
```

Example of ```networks```:
```javascript
[
  {
    bssid: "78:44:76:c3:68:24",
    flags: ["WPA2-PSK-CCMP", "WPS", "ESS"],
    frequency: "2412",
    is_connected: false,
    is_current: false,
    is_saved: false,
    signal_level: "-53",
    ssid: "TPLINK-GLKA6P"
  },
  // ...
]
```

### `listSavedNetworks()`
Returns a Promise object that resolves with an array of saved networks or an empty array. 
A saved network is the one we successfully issued connect request using [`connect(ssid, psk)`](#connectssid-psk) API.

Example:
```
pyxis.wlan.listSavedNetworks().then((networks) => {
    console.log(netwokrs)
});
```

Example of `networks` value:
```javascript
[
    {
        bssid: "any",
        flags: ["CURRENT"],
        id: "0",
        ssid: "bibika2.4",
    },
    // ...
]
```

### `forceScan()`
Used to initiate scan of available wireless networks.
Returns a Promise object that resolved with "OK" in case of success. The result of the scan can be retrieved with [`listScannedNetworks()`](#listscannednetworks) API.

Example:
```javascript
pyxis.wlan.forceScan().then((rv) => {
    console.log("Successfully initiated scan: " + rv);
});
```

### `forget(ssid)`
Used to forget previously saved network. Takes the `ssid` name of the access point.
Returns a Promise object that resolves with "OK" in case of success.

Example:
```javascript
pyxis.wlan.forget("some_ssid").then((rv) => {
    console.log("Successfully forgot ssid: " + rv);
});
```

### `connect(ssid, psk)`
Used to connect to specified `ssid` and provide an optional `psk` password.
`ssid` should be available. Otherwise, an error is thrown. 
`psk` can be omitted in the following cases:

- Access point with the specified `ssid` is not password protected.
- We already connected to this network previously so we just switch to it.

Returns a Promise object that resolves with "OK" in case of success.

NOTE: Success result of API just means that we will try to connect to the specified `ssid`
but actual connection status can be retrieved through [`getStatus()`](#getStatus()) call.

Example:
```javascript
pyxis.wlan.connect("some_ssid", "password").then((rv) => {
    console.log("Successfully initiated connection: " + rv);
});
```

### `setEnabled(enabled)`
Used to enable or disable the wireless network interface.

Example:
```javascript
pyxis.wlan.setEnabled(true).then((rv) => {
    console.log("Successfully enabled Wi-Fi:" + rv);
});
```

### `getStatus()`
Returns a Promise object that resolves with the current status of the interface.

Example:
```javascript
pyxis.wlan.getStatus(true).then((status) => {
    console.log("Current status is " + status);
});
```

In case we are connected to some `ssid`, the `status`  object is as follows:
```javascript
{
    address: "b8:27:eb:XX:XX:XX",
    bssid: "34:ce:00:XX:XX:XX",
    freq: "2437",
    group_cipher: "CCMP",
    id: "0",
    ip_address: "192.168.2.131"
    key_mgmt: "WPA2-PSK",
    mode: "station",
    p2p_device_address: "76:2f:XX:XX:XX:XX",
    pairwise_cipher: "CCMP",
    ssid: "bibika2.4",
    uuid: "XXXXXXXX-a508-59d2-8613-XXXXXXXXXXXXX",
    wpa_state: "COMPLETED"
}
```
In this case, fields like `ssid` and `ip_address` exist.
The important part here is the value in `wpa_state`, which represents the current state
of the wireless module.

In case we are offline or not connected, the response will be
```javascript
{
    address: "b8:27:eb:XX:XX:XX",
    p2p_device_address: "76:2f:XX:XX:XX:XX",
    uuid: "XXXXXXXX-a508-59d2-8613-XXXXXXXXXXXXX",
    wpa_state: "INACTIVE"
}
```

### `getCountry()`
Returns a Promise object that resolves with a currently configured country.

Example:
```javascript
pyxis.wlan.getCountry().then((country) => {
    console.log("Current country is " + country);
});
```

### `setCountry(country)`
Used to set a country to use. The country is specified with an uppercase two-letter ISO country code.

Example:
```javascript
pyxis.wlan.setCountry("US").then((rv) => {
    console.log("Successfully set current country: " + rv);
});
```
