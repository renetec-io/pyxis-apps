// Copyright (c) Renetec, Inc. All rights reserved.
// The source code is available at https://github.com/renetec-io/pyxis-apps

var allowUpdate = false;
var installedVersion = "";
var candidateVersion = "";

/**
 * Compare version strings.
 * @param string v1, v2
 * @return -1 if v2 > v1, 0 if v2=v1, 1 if v2 < v1
 */
function compareVersion(v1, v2) {
    if ((typeof v1 !== 'string') || (typeof v2 !== 'string')) {
        throw "Wrong parameter type!";
    }
    v1 = v1.split('.');
    v2 = v2.split('.');
    const k = Math.min(v1.length, v2.length);
    for (let i = 0; i < k; ++i) {
        v1[i] = parseInt(v1[i], 10);
        v2[i] = parseInt(v2[i], 10);
        if (v1[i] > v2[i]) return 1;
        if (v1[i] < v2[i]) return -1;
    }
    return v1.length == v2.length ? 0 : (v1.length < v2.length ? -1 : 1);
}

function updateFailed(er) {
    console.error(er);
    document.getElementById("log").innerHTML += "Something went wrong. Try again later." + "<br>";
}

function onUpdateDialogClose() {
    pyxis.fifo.close("apt_response_1");
    pyxis.fifo.close("apt_response_2");
    pyxis.fifo.close("apt_response_3");
    document.getElementById('log').innerHTML='';
}

function proceedUpdateCheckCallback(text) {
    console.log('2 > '+text);
    let matched = text.match(/Installed: (\d+\.\d+\.\d+)/);
    if (matched) {
        installedVersion = matched[1];
        document.getElementById("log").innerHTML += "Installed version " + installedVersion + "<br>";
    }
    matched = text.match(/Candidate: (\d+\.\d+\.\d+)/);
    if (matched) {
        candidateVersion = matched[1];
        document.getElementById("log").innerHTML += "Candidate version " + candidateVersion + "<br>";
        let compareResult = compareVersion(installedVersion, candidateVersion);
        if (compareResult === 0) {
            pyxis.fifo.close("apt_response_2");
            document.getElementById("log").innerHTML += "The latest version is already installed" + "<br>";
        } else if (compareResult === -1) {
            pyxis.fifo.close("apt_response_2");
            allowUpdate = true;
            document.getElementById("log").innerHTML += "New version " + candidateVersion + " is available" + "<br>";
            document.getElementById("updateBtn").disabled = false;
        }
    }
}

function checkForUpdatesCallback(text) {
    console.log('1 > '+text);
    if (text.includes("Hit:1")) {
        document.getElementById("log").innerHTML += "Received data from server" + "<br>";
    }
    if (text.includes("Reading package lists...")) {
        document.getElementById("log").innerHTML += "Checked package list" + "<br>";
        /* It looks like everything is ok, we can go further! */
        pyxis.fifo.openRead("apt_response_2", proceedUpdateCheckCallback);
        setTimeout(()=>{
            pyxis.fifo.close("apt_response_1");
            /* Check installed and available versions and compare them */
            const APT_COMMAND = "apt-cache policy inox > /tmp/pyxis-fifo/apt_response_2";
            pyxis.sh(APT_COMMAND).catch(console.error);
        }, 500);
    }
    /* Error branch */
    else if (text.includes("Err:")) {
        pyxis.fifo.close("apt_response");
        updateFailed("Cannot receive data from server");
    }
}

/** Perform initial check for updates. */
function checkForUpdates() {
    allowUpdate = false;
    pyxis.fifo.openRead("apt_response_1", checkForUpdatesCallback);
    setTimeout(()=>{
        const APT_COMMAND = "sudo apt-get update " +
            "-o Dir::Etc::sourcelist='sources.list.d/pyxian.list' " +
            "-o Dir::Etc::sourceparts='-' " +
            "-o APT::Get::List-Cleanup='0'" +
            " > /tmp/pyxis-fifo/apt_response_1";
        pyxis.sh(APT_COMMAND).catch(console.error);
    }, 100);
}

function updatePackageCallback(text) {
    console.log('3 > '+text);
    if (text.includes("Setting up")) {
        pyxis.fifo.close("apt_response");
        document.getElementById("log").innerHTML += "Installation complete" + "<br>";
    } else if (text.includes("Err:")) {
        pyxis.fifo.close("apt_response");
        updateFailed("apt-get reported error");
    }
}

function updatePackage() {
    /* Do not allow to push button multiple times */
    document.getElementById("updateBtn").disabled = true;
    document.getElementById("log").innerHTML =
        "UPDATE IN PROGRESS!<br>"
        + "It may take up to 10 minutes. Please, do not disturb.<br>"
        + "Once done, the device will reboot automatically!<br>";
    pyxis.fifo.openRead("apt_response_3", updatePackageCallback);
    setTimeout(()=>{
        const APT_COMMAND = "sudo apt-get -y install inox > /tmp/pyxis-fifo/apt_response_3 && sudo reboot";
        pyxis.sh(APT_COMMAND).catch(console.error);
    }, 100);
}
