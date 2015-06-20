// Imports
const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import('resource://gre/modules/osfile.jsm');
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/XPCOMUtils.jsm');

// Globals
const core = {
	addon: {
		name: 'Deskcuts',
		id: 'Deskcuts@jetpack',
		path: {
			name: 'deskcuts',
			content: 'chrome://deskcuts/content/',
			locale: 'chrome://deskcuts/locale/',
			resources: 'chrome://deskcuts/content/resources/',
			images: 'chrome://deskcuts/content/resources/images/'
		}
	},
	os: {
		name: OS.Constants.Sys.Name.toLowerCase()
	}
};

// Lazy Imports
const myServices = {};
XPCOMUtils.defineLazyGetter(myServices, 'sb', function () { return Services.strings.createBundle(core.addon.path.locale + 'bootstrap.properties?' + Math.random()); /* Randomize URI to work around bug 719376 */ });

function extendCore() {
	// adds some properties i use to core
	switch (core.os.name) {
		case 'winnt':
		case 'winmo':
		case 'wince':
			core.os.version = parseFloat(Services.sysinfo.getProperty('version'));
			// http://en.wikipedia.org/wiki/List_of_Microsoft_Windows_versions
			if (core.os.version == 6.0) {
				core.os.version_name = 'vista';
			}
			if (core.os.version >= 6.1) {
				core.os.version_name = '7+';
			}
			if (core.os.version == 5.1 || core.os.version == 5.2) { // 5.2 is 64bit xp
				core.os.version_name = 'xp';
			}
			break;
			
		case 'darwin':
			var userAgent = myServices.hph.userAgent;
			//console.info('userAgent:', userAgent);
			var version_osx = userAgent.match(/Mac OS X 10\.([\d\.]+)/);
			//console.info('version_osx matched:', version_osx);
			
			if (!version_osx) {
				throw new Error('Could not identify Mac OS X version.');
			} else {
				var version_osx_str = version_osx[1];
				var ints_split = version_osx[1].split('.');
				if (ints_split.length == 1) {
					core.os.version = parseInt(ints_split[0]);
				} else if (ints_split.length >= 2) {
					core.os.version = ints_split[0] + '.' + ints_split[1];
					if (ints_split.length > 2) {
						core.os.version += ints_split.slice(2).join('');
					}
					core.os.version = parseFloat(core.os.version);
				}
				// this makes it so that 10.10.0 becomes 10.100
				// 10.10.1 => 10.101
				// so can compare numerically, as 10.100 is less then 10.101
				
				//core.os.version = 6.9; // note: debug: temporarily forcing mac to be 10.6 so we can test kqueue
			}
			break;
		default:
			// nothing special
	}
	
	core.os.toolkit = Services.appinfo.widgetToolkit.toLowerCase();
	core.os.xpcomabi = Services.appinfo.XPCOMABI;
	
	core.firefox = {};
	core.firefox.version = Services.appinfo.version;
	
	console.log('done adding to core, it is now:', core);
}

function init() {
	extendCore();
	//document.body.textContent = 'You are using: ' + core.os.name;
	
	var os_conts = ['content-non', 'content-linux', 'content-win'];
	var cont_to_show;
	switch (core.os.name) {
		case 'linux':
			cont_to_show = 'content-linux';
			break;
		case 'winnt':
			cont_to_show = 'content-win';
			break;
		default:
			cont_to_show = 'content-non';
	}
	
	//cont_to_show = os_conts.indexOf(conte_to_show);
	
	for (var i=0; i<os_conts.length; i++) {
		if (os_conts[i] != cont_to_show) {
			var cont = document.getElementById(os_conts[i]);
			cont.style.display = 'none';
		}
	}

	var boxwrap = document.getElementById('boxwrap');
	//boxwrap.style.visibility = 'visible';
	boxwrap.style.opacity = '1';
}

document.addEventListener('DOMContentLoaded', init, false);