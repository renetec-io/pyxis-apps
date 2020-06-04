# System Management API

The API allows controlling system functions. It is available by importing
`https://pyxis-api.renetec.io/js/pyxis-api-core.js` and exposed through 
`pyxis.system` object.

----
- API methods
    - [`getIpAddress()`](#getipaddress)
    - [`getHostname()`](#gethostname)
    - [`setHostname(hostname)`](#sethostnamehostname)
    - [`getVersions()`](#getversions)
    - [`checkUpdates()`](#checkupdates)
    - [`update()`](#update)
    - [`reboot()`](#reboot)
    - [`shutdown()`](#shutdown)
    - [`ssh`](#ssh)
      - [`getState()`](#sshgetstate)
      - [`enable()`](#sshenable)
      - [`disable()`](#sshdisable)
----

### `getIpAddress()`
Returns a Promise object that resolves with an array of one or more network IP addresses, 
excluding loopback interface and IPv6 link-local addresses. 

Example:
```javascript
pyxis.system.getIpAddress().then((address) => {
    console.log(address.join(', '));
});
```

### `getHostname()`
Returns a Promise object that resolves with system's hostname.

Example:
```javascript
pyxis.system.getHostname().then((hostname) => {
    console.log(hostname);
});
```

### `setHostname(hostname)`
Used to change hostname of the system. 
Returns a Promise object that resolves with "OK" in case of success.

Example:
```javascript
pyxis.system.setHostname("myhost").then((rv) => {
    console.log(rv);
});
```

### `getVersions()`
Returns a Promise object that resolves with an array of system component versions.

Example:
```javascript
pyxis.system.getVersions().then((versions) => {
    console.log(versions);
});
```
Example of `versions`:
```javascript
[
  {
    component: "pyxis-sdk",
    version: "0.4.1"
  },
  {
    component: "chromium",
    version: "78.0.3904.108"
  }
]
```

### `checkUpdates()`
Request to check available updates of system components.
Returns a Promise object that resolves with an array of available updates. Because checking requires
access to remote repositories, it may take some time, depending on the quality of your connection. If the request takes too long
to finish, the Promise is rejected after a 1 min timeout.
The request cannot be canceled.

If the method is called while there is another pending checkUpdates() or update() request, a new promise is rejected. 

Example:
```
pyxis.system.checkUpdates().then((available) => {
    console.log(available)
});
```

Example of `available` value:
```javascript
[
  {
    component: "pyxis-sdk",
    current_version: "0.3.1",
    available_version: "0.4.5"
  }
]
```

### `update()`
Request to install available updates of system components.
Returns a Promise object that resolves with an array of updated system components. Because update requires
access to remote repositories, request time depends on the quality of your connection. If the download takes too long
to finish, it is aborted and the Promise is rejected after a 10 min timeout. If the download is finished within timeout,
the update proceeds to completion. Therefore, the overall process may theoretically exceed 10 minutes.
The request cannot be canceled.

If the method is called while there is another pending checkUpdates() or update() request, a new promise is rejected. 

Example:
```
pyxis.system.update().then((updated) => {
    console.log(updated)
});
```

Example of `updated` value:
```javascript
[
  {
    component: "pyxis-sdk",
    version: "0.4.5"
  }
]
```

### `reboot()`
Trigger reboot. Returns a Promise object that resolved with "OK" before the reboot is requested.

Example:
```javascript
pyxis.system.reboot().then((rv) => {
    console.log("Initiated reboot: " + rv);
});
```

### `shutdown()`
Trigger shutdown. Returns a Promise object that resolved with "OK" before the shutdown is requested.

Example:
```javascript
pyxis.system.shutdown().then((rv) => {
    console.log("Initiated shutdown: " + rv);
});
```

## `ssh`

The API allows controlling the SSH service. 

### `ssh.getState()`
Used to retrieve state of SSH service.

Example:
```javascript
pyxis.system.ssh.getState().then((state) => {
    console.log("SSH state: " + state);
});
```

Example of `state` value:
```javascript
{
  enabled: true,
}
```

### `ssh.enable()`
Enables SSH service.

Example:
```javascript
pyxis.system.ssh.enable().then((rv) => {
    console.log("SSH service enabled with result: " + rv);
});
```

### `ssh.disable()`
Disables SSH service.

Example:
```javascript
pyxis.system.ssh.disable().then((rv) => {
    console.log("SSH service disabled with result: " + rv);
});
```
