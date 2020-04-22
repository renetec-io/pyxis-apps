// Copyright (c) Renetec, Inc. All rights reserved.
// The source code is available at https://github.com/renetec-io/pyxis-apps

function displayCountry() {
    pyxis.wlan.getCountry().then((country) => {
        let textElement = document.getElementById('current-country');
        if (typeof country !== 'undefined') {
            textElement.textContent = country;
        }
    })
}

function displayNetwork() {
    pyxis.wlan.listScannedNetworks().then((response) => {
        connected = response.find(element => element.is_connected == true)

        let textElement = document.getElementById('current-network');
        if (connected === undefined) {
            textElement.textContent = "<NONE>"; 
        } else {
            textElement.textContent = connected.ssid;
        }
    });
}

function forceScan() {
    pyxis.wlan.forceScan();
}

function connect() {
    const ssid = document.getElementById('network-name').value;
    const pswd = document.getElementById('password').value;
    if (ssid.length > 0) {
        pyxis.wlan.connect(ssid, pswd);
    }
}
