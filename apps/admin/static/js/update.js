var allowUpdate = false;
var installedVersion = "";
var candidateVersion = "";

/**
 * Compare version strings.
 * @param string v1, v2
 * @return -1 if v2 > v1, 0 if v2=v1, 1 if v2 < v1
 */
function compareVersion(v1, v2) {
    if (typeof v1 !== 'string') return false;
    if (typeof v2 !== 'string') return false;
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

function proceeedUpdateCheckCallback(text) {
    var compareResult = 0;

    if (text.includes("Installed")) {
        installedVersion = text.split(":")[1];
        document.getElementById("log").innerHTML += "Installed version" + installedVersion + "<br>";
        //document.getElementById("progress").value += 10;
    } else if (text.includes("Candidate")) {
        candidateVersion = text.split(":")[1];
        document.getElementById("log").innerHTML += "Candidate version" + candidateVersion + "<br>";
        //document.getElementById("progress").value += 10;
        compareResult = compareVersion(installedVersion, candidateVersion);
        if (compareResult == 0) {
            document.getElementById("log").innerHTML += "The latest version is already installed" + "<br>";
            //document.getElementById("progress").value = 100;
        } else if (compareResult == -1) {
            document.getElementById("log").innerHTML += "New version" + candidateVersion + " is available" + "<br>";
            //document.getElementById("progress").value = 100;
            allowUpdate = true;
            document.getElementById("updateBtn").disabled = false;
            pyxis.fifo.close("system_commands");
            pyxis.fifo.close("system_response");
        }
        /*TODO Handle errors */
    }
}

/** Check installed and available versions and compare them */
function proceedUpdateCheck() {
    pyxis.fifo.openRead("system_response", proceeedUpdateCheckCallback);
    pyxis.fifo.write("system_commands", "apt-cache policy inox\n");
}

function checkForUpdatesCallback(text) {
    if (text.includes("Hit:1")) {
        //document.getElementById("progress").value += 10;
        document.getElementById("log").innerHTML += "Received data from server" + "<br>";
    } else if (text.includes("Reading package lists...")) {
        //document.getElementById("progress").value += 10;
        document.getElementById("log").innerHTML += "Checked package list" + "<br>";
        /* It looks like everything is ok, we can go further! */
        pyxis.fifo.close("system_response");
        proceedUpdateCheck();
    }
    /* Error branch */
    else if (text.includes("Err:")) {
        document.getElementById("log").innerHTML += "Cannot receive data from server" + "<br>";
        //document.getElementById("progress") = 0;
        pyxis.fifo.close("system_response");
        allowUpdate = false;
    }
}

/** Perform initial check for updates. */
function checkForUpdates() {
    const APT_COMMAND = "sudo apt-get update " +
        "-o Dir::Etc::sourcelist='sources.list.d/pyxian.list'" +
        " -o Dir::Etc::sourceparts='-' " +
        "-o APT::Get::List-Cleanup='0'\n";
    pyxis.fifo.openRead("system_response", checkForUpdatesCallback);
    pyxis.fifo.openWrite("system_commands");
    pyxis.fifo.write("system_commands", APT_COMMAND);
}

function updatePackageCallback(text) {

    //document.getElementById("log").innerHTML += text;
    if (text.includes("Reading package lists...")) {
        //document.getElementById("progress").value += 5;
    } else
    if (text.includes("Reading state information...")) {
        //document.getElementById("progress").value += 5;
    } else
    if (text.includes("Get:")) {
        //document.getElementById("progress").value += 5;
    } else
    if (text.includes("Fetched")) {
        //document.getElementById("progress").value += 5;
    } else
    if (text.includes("Preparing to unpack")) {
        //document.getElementById("progress").value += 5;
    }
    if (text.includes("Setting up")) {
        //document.getElementById("progress").value = 100;
        document.getElementById("log").innerHTML += "Installation complete, restart Inox" + "<br>";
        pyxis.fifo.write("system_commands", "/opt/inox/inox-restart\n");
    } else
        /* Error branch */
    if (text.includes("Err:")) {
        document.getElementById("log").innerHTML += "Something went wrong:(" + "<br>" ;
        //document.getElementById("progress") = 0;
        pyxis.fifo.close("system_response");
    }

}

function updatePackage() {
    const APT_COMMAND = "sudo apt-get -y install inox\n";
    /* Do not allow to push button multiple times, it can break everything */
    document.getElementById("updateBtn").disabled = true;
    document.getElementById("log").innerHTML = "UPDATE IN PROGRESS!<br>It may take a while.<br>Please, do not touch!";
    pyxis.fifo.openRead("system_response", updatePackageCallback);
    pyxis.fifo.openWrite("system_commands");
    pyxis.fifo.write("system_commands", APT_COMMAND);
}
