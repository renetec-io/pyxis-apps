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

function proceedUpdateCheckCallback(text) {
    console.log('> '+text);
    let compareResult = 0;
    if (text.includes("Installed")) {
        installedVersion = text.split(":")[1];
        document.getElementById("log").innerHTML += "Installed version" + installedVersion + "<br>";
    } else if (text.includes("Candidate")) {
        candidateVersion = text.split(":")[1];
        document.getElementById("log").innerHTML += "Candidate version" + candidateVersion + "<br>";
        compareResult = compareVersion(installedVersion, candidateVersion);
        if (compareResult == 0) {
            document.getElementById("log").innerHTML += "The latest version is already installed" + "<br>";
        } else if (compareResult == -1) {
            document.getElementById("log").innerHTML += "New version" + candidateVersion + " is available" + "<br>";
            allowUpdate = true;
            document.getElementById("updateBtn").disabled = false;
        }
        /*TODO Handle errors */
        pyxis.fifo.close("system_commands");
        pyxis.fifo.close("system_response");
    }
}

/** Check installed and available versions and compare them */
function proceedUpdateCheck() {
    pyxis.fifo.openRead("system_response", proceedUpdateCheckCallback);
    pyxis.fifo.write("system_commands", "apt-cache policy inox\n");
}

function checkForUpdatesCallback(text) {
    console.log('> '+text);
    if (text.includes("Hit:1")) {
        document.getElementById("log").innerHTML += "Received data from server" + "<br>";
    } else if (text.includes("Reading package lists...")) {
        document.getElementById("log").innerHTML += "Checked package list" + "<br>";
        /* It looks like everything is ok, we can go further! */
        pyxis.fifo.close("system_response");
        proceedUpdateCheck();
    }
    /* Error branch */
    else if (text.includes("Err:")) {
        document.getElementById("log").innerHTML += "Cannot receive data from server" + "<br>";
        pyxis.fifo.close("system_response");
        allowUpdate = false;
    }
}

/** Perform initial check for updates. */
function checkForUpdates() {
    const APT_COMMAND = "sudo apt-get update " +
        "-o Dir::Etc::sourcelist='sources.list.d/pyxian.list' " +
        "-o Dir::Etc::sourceparts='-' " +
        "-o APT::Get::List-Cleanup='0'\n";
    pyxis.fifo.openRead("system_response", checkForUpdatesCallback);
    pyxis.fifo.openWrite("system_commands");
    pyxis.fifo.write("system_commands", APT_COMMAND);
}

function updatePackageCallback(text) {
    console.log('> '+text);
    if (text.includes("Setting up")) {
        document.getElementById("log").innerHTML += "Installation complete" + "<br>";
        pyxis.fifo.close("system_commands");
        pyxis.fifo.close("system_response");
    } else if (text.includes("Err:")) {
        document.getElementById("log").innerHTML += "Something went wrong :(" + "<br>" ;
        pyxis.fifo.close("system_commands");
        pyxis.fifo.close("system_response");
    }
}

function updatePackage() {
    const APT_COMMAND = "sudo apt-get -y install && sudo reboot\n";
    /* Do not allow to push button multiple times */
    document.getElementById("updateBtn").disabled = true;
    document.getElementById("log").innerHTML =
        "UPDATE IN PROGRESS!<br>"
        + "It will take about 10 minutes. Please, do not disturb.<br>"
        + "Once done, the device will reboot automatically!";
    pyxis.fifo.openRead("system_response", updatePackageCallback);
    pyxis.fifo.openWrite("system_commands");
    pyxis.fifo.write("system_commands", APT_COMMAND);
}
