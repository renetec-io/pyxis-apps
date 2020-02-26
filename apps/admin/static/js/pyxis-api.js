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
    let installed = new Set();
    lib.apps.forEach((app) => {
        installed.add(pyxis.apps.tag(app));
    });
    for (i in lib.other) {
        let library = lib.other[i];
        if (library.local === false) {
            library.apps.forEach((app) => {
                app.installed = installed.has(pyxis.apps.tag(app));
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

if (typeof(pyxis) == "undefined") {
    // Define mock Pyxis APIs
    window.pyxis={};
    pyxis.screen = {
        setRotation(orientation) { },
        getRotation() {return 'normal'},
    };

    let dump = '{"apps": [{"path": "Pyxis-wifi", "name": "wifi", "version": "1.0"},{"path": "Pyxis-admin", "name": "admin", "version": "0.1"}], "admin": {"name": "admin", "version": "0.1"}, "default": {"name": "admin", "version": "0.1"}, "other": [{"path": "/opt/inox/apps/", "local": true, "apps": [{"path": "Pyxis-wifi", "name": "wifi", "version": "1.0"}, {"path": "Pyxis-admin", "name": "admin", "version": "0.1"}, {"path": "screenrotation", "name": "screen-settings", "version": "0.1"}, {"path": "sysinfo", "name": "sysinfo", "version": "0.1"}]}, {"path": "/media//UNTITLED.vfat", "local": false, "apps": [{"path": "svg-animation-traveler", "name": "The_Traveler_Animation", "version": "1.0"}]},{"path":"/opt/inox/apps/demos","local":true,"apps":[{"name":"Beer Machine","version":"0.1"},{"name":"Toaster UI","version":"0.1"}]}]}';
    pyxis.apps = {
        tag(app) { return app.name + "-" + app.version },
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
        getNonLocal() {
            return new Promise((resolve) => {
                resolve(nonLocalLib(dump));
            })
        },
        install(path, name, version) {
            console.log(`INSTALL "${path}" "${name}" "${version}"`);
        },
        getDefault() {
            return new Promise((resolve) => {
                resolve(defaultApp(dump));
            })
        },
        setDefault(name, version) {
            console.log(`SET_DEFAULT "${name}" "${version}"`);
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
        },
        navigateToCredits() {}
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
        tag(app) { return app.name + "-" + app.version },
        getInstalled() { return getApps(installedApps) },
        getDemos() { return getApps(demosLib) },
        getNonLocal() { return getApps(nonLocalLib) },
        getDefault() { return getApps(defaultApp) },
        getByTag(tag) { return getApps(appByTag, tag) },
        install(path, name, version) {
            function closeCommandsPipe() { pyxis.fifo.close("admin_commands"); }
            pyxis.fifo.openWrite("admin_commands");
            pyxis.fifo.write("admin_commands", `INSTALL "${path}" "${name}" "${version}"\n`);
            pyxis.fifo.write("admin_commands", "SAVE\n");
            setTimeout(closeCommandsPipe, 100);
        },
        setDefault(name, version) {
            function closeCommandsPipe() { pyxis.fifo.close("admin_commands"); }
            pyxis.fifo.openWrite("admin_commands");
            pyxis.fifo.write("admin_commands", `SET_DEFAULT "${name}" "${version}"\n`);
            pyxis.fifo.write("admin_commands", "SAVE\n");
            pyxis.fifo.write("admin_commands", "PREPARE_DEFAULT\n");
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
            return 'Inox ' + pyxis.plugins.system("dpkg -s inox | grep 'Version:' | cut -d ' ' -f 2");
        },
        navigateToCredits() {
            pyxis.plugins.system('echo "chrome://credits" > /tmp/pyxis-override-url.txt');
            pyxis.plugins.system('/opt/inox/inox-restart');
        }
    };
    pyxis.wlan = {
        listNetworks() {
            const wpaPrefix = '/sbin/wpa_cli -i wlan0 ';
            const stdout = pyxis.plugins.system(wpaPrefix + 'list_networks');
            const results = stdout.split('\n');
            var output = [];
            for (var i = 1; i < results.length - 1; ++i) {
                const elements = results[i].split('\t');
                var state = 0;
                if (elements.length >= 4 && elements[3] == "[DISABLED]") {
                    state = 2;
                } else if (elements.length >= 4 && elements[3] == "[CURRENT]") {
                    state = 1;
                }
                output.push({name: elements[1], state: state});
            }
            return output;
        },
        connect(ssid, psk) {
            const wpaPrefix = '/sbin/wpa_cli -i wlan0 ';
            const net = 0;
            pyxis.plugins.system(wpaPrefix + `set_network ${net} ssid '"${ssid}"'`);
            pyxis.plugins.system(wpaPrefix + `set_network ${net} psk '"${psk}"'`);
            pyxis.plugins.system(wpaPrefix + 'save_config');
            pyxis.plugins.system(wpaPrefix + 'reconfigure');
        }
    };
}
