function installedApps(json) {
    let lib = JSON.parse(json);
    return lib.apps;
}

function localAppByTag(lib, tag) {
    let isDefault = tag === pyxis.apps.tag(lib.default);

    // Look through the main library
    for (i in lib.apps) {
        let app = lib.apps[i];
        if (pyxis.apps.tag(app) === tag) {
            app.libPath = lib.path;
            app.default = isDefault;
            app.installed = true;
            return app;
        }
    }

    // Look through other local libraries
    for (i in lib.other) {
        if (lib.other[i].local === false)
            continue;

        for (j in lib.other[i].apps) {
            let app = lib.other[i].apps[j];
            if (pyxis.apps.tag(app) === tag) {
                app.libPath = lib.other[i].path;
                app.default = isDefault;
                app.installed = false;
                return app;
            }
        }
    }

    return undefined;
}

function appByTag(json, args) {
    let lib = JSON.parse(json);
    return localAppByTag(lib, args[0]);
}

function defaultApp(json) {
    let lib = JSON.parse(json);
    tag = pyxis.apps.tag(lib.default);
    return localAppByTag(lib, tag);
}

function nonLocalLib(json) {
    let lib = JSON.parse(json);
    let installed = new Map();
    lib.apps.forEach((app) => {
        installed.set(app.name + app.version, app.path);
    });
    for (i in lib.other) {
        let library = lib.other[i];
        if (library.local === false) {
            library.apps.forEach((app) => {
                app.installedPath = installed.get(app.name + app.version);
            });
            return library;
        }
    }
    return {path: '', local: false, apps: []};
}

function demosLib(json) {
    let lib = JSON.parse(json);
    for (i in lib.other) {
        let library = lib.other[i];
        if (library.local === false)
            continue;
        let path = library.path.split('/');
        if (path[path.length - 1] === 'demos') {
            return library;
        }
    }
    return {path: '', local: true, apps: []};
}

function examplesLib(json) {
    let lib = JSON.parse(json);
    for (i in lib.other) {
        let library = lib.other[i];
        if (library.local === false)
            continue;
        let path = library.path.split('/');
        if (path[path.length - 1] === 'examples') {
            return library;
        }
    }
    return {path: '', local: true, apps: []};
}

if (typeof(pyxis) == "undefined") {
    // Define mock Pyxis APIs
    window.pyxis={};
    pyxis.screen = {
        setRotation(orientation) { },
        getRotation() {return 'normal'},
    };

    let dump = '{"path": "/home/pi/.inox/apps/", "apps": [{"path": "/home/pi/.inox/apps/Pyxis-wifi", "name": "wifi", "version": "1.0"}, {"path": "/home/pi/.inox/apps/Pyxis-admin", "name": "admin", "version": "0.1"}], "admin": {"name": "admin", "version": "0.1", "path": "/home/pi/.inox/apps/Pyxis-admin"}, "default": {"name": "admin", "version": "0.1", "path": "/home/pi/.inox/apps/Pyxis-admin"}, "other": [{"path": "/opt/inox/apps/", "local": true, "apps": [{"path": "/opt/inox/apps/Pyxis-wifi", "name": "wifi", "version": "1.0"}, {"path": "/opt/inox/apps/Pyxis-admin", "name": "admin", "version": "0.1"}, {"path": "/opt/inox/apps/screenrotation", "name": "screen-settings", "version": "0.1"}, {"path": "/opt/inox/apps/sysinfo", "name": "sysinfo", "version": "0.1"}]}, {"path": "/media//UNTITLED.vfat", "local": false, "apps": [{"path": "/media/UNTITLED.vfat/svg-animation-traveler", "name": "The_Traveler_Animation", "version": "1.0"}]},{"path":"/opt/inox/apps/demos","local":true,"apps":[{"path": "/opt/inox/apps/demos/beer-machine","name":"Beer Machine","version":"0.1"},{"path":"/opt/inox/apps/demos/toaster","name":"Toaster UI","version":"0.1"}]}]}';

    pyxis.apps = {
        tag(app) { return app.path },
        getInstalled() {
            return new Promise((resolve) => {
                resolve(installedApps(dump));
            })
        },
        getDemos() {
            return new Promise((resolve) => {
                resolve(demosLib(dump));
            })
        },
        getExamples() {
            return new Promise((resolve) => {
                resolve(examplesLib(dump));
            })
        },
        getNonLocal() {
            return new Promise((resolve) => {
                resolve(nonLocalLib(dump));
            })
        },
        install(path) {
            console.log(`INSTALL "${path}"`);
        },
        uninstall(path) {
            console.log(`UNINSTALL "${path}"`);
        },
        getDefault() {
            return new Promise((resolve) => {
                resolve(defaultApp(dump));
            })
        },
        setDefault(path) {
            console.log(`SET_DEFAULT "${path}"`);
        },
        getByTag(tag) {
            return new Promise((resolve) => {
                resolve(appByTag(dump, [tag]));
            })
        }
    };
    pyxis.sysinfo = {
        getIP() {
            return "12.34.56.78";
        },
        getHostname() {
            return "raspberrypi";
        },
        getBrowserVersion() {
            return "Inox 0.0.1";
        }
    };
    pyxis.wlan = {
        listNetworks() {
          let result = [];
          result.push({name:'HackLab', state:0});
          result.push({name:'Asus', state:2});
          result.push({name:'Milosh', state:1});
          return result;
        },
        connect(ssid, psk) {
            console.log(`Connect to WLAN ${ssid} : ${psk}`);
        },
        getCountry() {
            return "US";
        }
    };
} else {
    // Define real API wrappers

    function getApps(parser, ...parserArgs) {
        return new Promise((resolve) => {
            pyxis.fifo.openRead("admin_update", (dump) => {
                pyxis.fifo.close("admin_update");
                pyxis.fifo.close("admin_commands");
                resolve(parser(dump, parserArgs));
            });
            pyxis.fifo.openWrite("admin_commands");
            pyxis.fifo.write("admin_commands", "DUMP\n");
        })
    }

    pyxis.screen = {
        setRotation(rotation) {
            function setRotationDone() {
                pyxis.fifo.close("admin_commands");
                pyxis.plugins.system(`inox-settings-manager --set rotation ${rotation}; inox-restart`);
            }
            pyxis.fifo.openWrite("admin_commands");
            pyxis.fifo.write("admin_commands", "PREPARE_ADMIN\n");
            setTimeout(setRotationDone, 100);
            },
        getRotation() {return pyxis.plugins.system('inox-settings-manager --get rotation').trim();},
    };
    pyxis.apps = {
        tag(app) { return app.path },
        getInstalled() { return getApps(installedApps) },
        getDemos() { return getApps(demosLib) },
        getExamples() { return getApps(examplesLib) },
        getNonLocal() { return getApps(nonLocalLib) },
        getDefault() { return getApps(defaultApp) },
        getByTag(tag) { return getApps(appByTag, tag) },
        install(path) {
            function closeCommandsPipe() { pyxis.fifo.close("admin_commands"); }
            pyxis.fifo.openWrite("admin_commands");
            pyxis.fifo.write("admin_commands", `INSTALL "${path}"\n`);
            setTimeout(closeCommandsPipe, 100);
        },
        uninstall(path) {
            function closeCommandsPipe() { pyxis.fifo.close("admin_commands"); }
            pyxis.fifo.openWrite("admin_commands");
            pyxis.fifo.write("admin_commands", `UNINSTALL "${path}"\n`);
            setTimeout(closeCommandsPipe, 100);
        },
        setDefault(path) {
            function closeCommandsPipe() { pyxis.fifo.close("admin_commands"); }
            pyxis.fifo.openWrite("admin_commands");
            pyxis.fifo.write("admin_commands", `SET_DEFAULT "${path}"\n`);
            pyxis.fifo.write("admin_commands", "SAVE\n");
            setTimeout(closeCommandsPipe, 100);
        }
    };
    pyxis.sysinfo = {
        getIP() {
            return pyxis.plugins.system('hostname -I');
        },
        getHostname() {
            return pyxis.plugins.system('hostname');
        },
        getBrowserVersion() {
            return pyxis.plugins.system("echo Inox; dpkg -s inox | grep 'Version:' | cut -d ' ' -f 2");
        }
    };
    pyxis.wlan = {
        listNetworks() {
            const wpaPrefix = '/sbin/wpa_cli -i wlan0 ';
            const stdout = pyxis.plugins.system(wpaPrefix + 'list_networks');
            const results = stdout.split('\n');
            let output = [];
            for (let i = 1; i < results.length - 1; ++i) {
                const elements = results[i].split('\t');
                let state = 0;
                if (elements.length >= 4 && elements[3] === "[DISABLED]") {
                    state = 2;
                } else if (elements.length >= 4 && elements[3] === "[CURRENT]") {
                    state = 1;
                }
                output.push({name: elements[1], state: state});
            }
            return output;
        },
        connect(ssid, psk) {
            const wpaPrefix = '/sbin/wpa_cli -i wlan0 ';

            // Only one stored network is supported. Clear the list.
            const stdout = pyxis.plugins.system(wpaPrefix + 'list_networks');
            const stored_networks = stdout.split('\n');
            for (let i = 1; i < stored_networks.length - 1; ++i) {
                const net = stored_networks[i].slice(0, stored_networks[i].indexOf('\t'));
                pyxis.plugins.system(wpaPrefix + `remove_network ${net}`);
            }

            const net = pyxis.plugins.system(wpaPrefix + 'add_network').trim();
            pyxis.plugins.system(wpaPrefix + `set_network ${net} ssid '"${ssid}"'`);
            if (psk !== '') {
                pyxis.plugins.system(wpaPrefix + `set_network ${net} psk '"${psk}"'`);
            } else {
                pyxis.plugins.system(wpaPrefix + `set_network ${net} key_mgmt NONE`);
            }
            pyxis.plugins.system(wpaPrefix + `enable_network ${net}`);
            pyxis.plugins.system(wpaPrefix + 'save_config');
            // pyxis.plugins.system(wpaPrefix + 'reconfigure');
        },
        getCountry() {
            const wpaPrefix = '/sbin/wpa_cli -i wlan0 ';
            const result = pyxis.plugins.system(wpaPrefix + 'get country');
            return (result !== "FAIL") ? result : undefined;
        }
    };
}
