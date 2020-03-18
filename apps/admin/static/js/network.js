function displayCountry() {
    const country = pyxis.wlan.getCountry();
    let textElement = document.getElementById('current-country');
    if (typeof country !== 'undefined') {
        textElement.textContent = country;
    }
}

function displayNetwork() {
    const list = pyxis.wlan.listNetworks();
    const connected = list.find(element => element.state == 1);
    let textElement = document.getElementById('current-network');
    if (connected === undefined) {
        textElement.textContent = "<NONE>";
    } else {
        textElement.textContent = connected.name;
    }
}

function connect() {
    const ssid = document.getElementById('network-name').value;
    const pswd = document.getElementById('password').value;
    if (ssid.length > 0) {
        pyxis.wlan.connect(ssid, pswd);
    }
}
