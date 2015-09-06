'use strict';

// Imports
importScripts('resource://gre/modules/osfile.jsm');
importScripts('resource://gre/modules/workers/require.js');

// Globals
var core = {
	addon: {
		path: {
			content: 'chrome://naow/content/',
		}
	},
	os: {
		name: OS.Constants.Sys.Name.toLowerCase()
	}
};

var OSStuff = {}; // global vars populated by init, based on OS

// Imports that use stuff defined in chrome
// I don't import ostypes_*.jsm yet as I want to init core first, as they use core stuff like core.os.isWinXP etc
// imported scripts have access to global vars on MainWorker.js
importScripts(core.addon.path.content + 'modules/cutils.jsm');
importScripts(core.addon.path.content + 'modules/ctypes_math.jsm');

// Setup PromiseWorker
var PromiseWorker = require('resource://gre/modules/workers/PromiseWorker.js');

var worker = new PromiseWorker.AbstractWorker();
worker.dispatch = function(method, args = []) {
	return self[method](...args);
},
worker.postMessage = function(...args) {
	self.postMessage(...args);
};
worker.close = function() {
	self.close();
};
worker.log = function(...args) {
	dump('Worker: ' + args.join(' ') + '\n');
};
self.addEventListener('message', msg => worker.handleMessage(msg));

////// end of imports and definitions

function init(objCore) {
	//console.log('in worker init');
	
	// merge objCore into core
	// core and objCore is object with main keys, the sub props
	
	core = objCore;

	// if (core.os.toolkit == 'gtk2') {
		// core.os.name = 'gtk';
	// }
	
	// I import ostypes_*.jsm in init as they may use things like core.os.isWinXp etc
	switch (core.os.toolkit.indexOf('gtk') == 0 ? 'gtk' : core.os.name) {
		case 'winnt':
		case 'winmo':
		case 'wince':
			importScripts(core.addon.path.content + 'modules/ostypes_win.jsm');
			break
		case 'gtk':
			// uses os.file
			break;
		case 'darwin':
			importScripts(core.addon.path.content + 'modules/ostypes_mac.jsm');
			break;
		default:
			throw new Error({
				name: 'addon-error',
				message: 'Operating system, "' + OS.Constants.Sys.Name + '" is not supported'
			});
	}
	
	// OS Specific Init
	switch (core.os.toolkit.indexOf('gtk') == 0 ? 'gtk' : core.os.name) {
		default:
			// do nothing special
	}
	
	return true;
}

// Start - Addon Functionality
function makeCut(aCreate_name, aTarget_osPath, aOptions={}) {
	// aPath can be a url, it is a js string
	
	switch (core.os.toolkit.indexOf('gtk') == 0 ? 'gtk' : core.os.name) {
		case 'winnt':
			
					// aOptions supported:
						// none
						
					// create hardlink
					// returns true/false
					// directory must be different otherwise hard link fails to make, it makes a blank file, clicking it, pops open the windows "use what program to open this" thing
					// names can be different. // update of icon name or target path updates to the other. // update of file name does not propogate to the other
						// when make hardlink, the name can be different however the extension must be the same otherwise the hardlink doesnt connect and when you try to open windows asks you "open it with what?"
					// path_create and path_target must include extenions
					
					// cannot make hard link of a directory, files only
					
					var aTarget_extWithDot = aTarget_osPath.substr(aTarget_osPath.lastIndexOf('.'));
					
					var rez_CreateHardLink = ostypes.API('CreateHardLink')(OS.Path.join(OS.Constants.Path.desktopDir, aCreate_name + aTarget_extWithDot), aTarget_osPath, null);
					console.info('rez_CreateHardLink:', rez_CreateHardLink.toString(), uneval(rez_CreateHardLink));
					if (ctypes.winLastError != 0) {
						if (ctypes.winLastError == ostypes.CONST.ERROR_ALREADY_EXISTS) {
							// it already exists so it was already made so just return true MAYBE
							// console.log('CreateHardLink got winLastError for already existing, its rez was:', rez_CreateHardLink, 'but lets return true as if hard link was already made then no need to make again, all hardlinks update right away to match all from what it is hard linekd to');
						}
						console.error('Failed rez_CreateHardLink, winLastError:', ctypes.winLastError);
						throw new Error('win-' + ctypes.winLastError);
					}
					return rez_CreateHardLink;
				
			break;
		case 'gtk':
			
				// create .desktop
				
			
			break;
		case 'darwin':
			
				// create applescript launcher
				
			
			break;
		default:
			console.error('os not supported');
	}
	
}

// End - Addon Functionality