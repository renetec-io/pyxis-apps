// Copyright (c) Renetec, Inc. All rights reserved.
// The source code is available at https://github.com/renetec-io/pyxis-apps

let allowUpdate = false;
let isUpdateInProgress = false;

function onUpdateDialogClose() {
    setTimeout(()=>{
        document.getElementById("update-message").innerText="";
    }, 500);
}

function handleCheckResponse(results) {
    if (results.length !== 0) {
        let pyxis_sdk = results.find(item => item.component === "pyxis-sdk");
        document.getElementById("update-title").innerText = "Pyxis SDK";
        document.getElementById("update-message").innerText
          = "Installed version: " + pyxis_sdk.current_version + "\n"
          + "New available version: " + pyxis_sdk.available_version;
        allowUpdate = true;
        document.getElementById("updateBtn").disabled = false;
    } else {
        document.getElementById("update-title").innerText = "Nothing to update";
        document.getElementById("update-message").innerText += "The latest versions are already installed";
    }
    linearProgress.close();
    isUpdateInProgress = false;
}

function checkForUpdates() {
    isUpdateInProgress = true;
    linearProgress.open();
    allowUpdate = false;
    document.getElementById("update-title").innerText = "Checking for updates...";
    pyxis.system.checkUpdates().then(handleCheckResponse).catch(handleUpdateFail);
}

function handleUpdateResponse() {
    document.getElementById("update-title").innerText = "Installation complete";
    document.getElementById("update-message").innerText = "Rebooting...";
    // Adding a little timeout for user to notice that reboot will be triggered.
    setTimeout(() => pyxis.system.reboot(), 2000);
    linearProgress.close();
    isUpdateInProgress = false;
}

function handleUpdateFail(er) {
    console.error(er);
    document.getElementById("update-title").innerText = "Something went wrong";
    document.getElementById("update-message").innerText = "Try again later";
    linearProgress.close();
    isUpdateInProgress = false;
}

function updatePackage() {
    isUpdateInProgress = true;
    linearProgress.open();
    // Do not allow to push button multiple times
    document.getElementById("updateBtn").disabled = true;
    document.getElementById("update-title").innerText = "Updating...";
    document.getElementById("update-message").innerText =
      "It may take up to 10 minutes. Please, do not disturb.\n"
      + "Once done, the device will reboot automatically.\n";
    pyxis.system.update().then(handleUpdateResponse).catch(handleUpdateFail);
}
