// Imports
const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import('resource://gre/modules/osfile.jsm');
var PromiseWorker = Cu.import('resource://gre/modules/PromiseWorker.jsm', {}).BasePromiseWorker;
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
			images: 'chrome://deskcuts/content/resources/images/',
			workers: 'chrome://deskcuts/content/modules/workers/',
		},
		cache_key: Math.random()
	},
	os: {
		name: OS.Constants.Sys.Name.toLowerCase()
	}
};
var bootstrap = this;

// Lazy Imports
const myServices = {};
XPCOMUtils.defineLazyGetter(myServices, 'sb', function () { return Services.strings.createBundle(core.addon.path.locale + 'app.properties?' + core.addon.cache_key); /* Randomize URI to work around bug 719376 */ });

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
	
	var os_conts = ['content-non', 'content-linux', 'content-win', 'content-mac'];
	var cont_to_show;
	switch (core.os.name) {
		case 'linux':
			cont_to_show = 'content-linux';
			break;
		case 'winnt':
			cont_to_show = 'content-win';
			break;
		case 'darwin':
			cont_to_show = 'content-mac';
			break;
		default:
			cont_to_show = 'content-non';
	}
	
	//cont_to_show = os_conts.indexOf(conte_to_show);
	
	for (var i=0; i<os_conts.length; i++) {
		if (os_conts[i] != cont_to_show) {
			var cont = document.getElementById(os_conts[i]);
			cont.style.display = 'none';
		} else {
			var cont = document.getElementById(os_conts[i]);
			cont.classList.add('activeOS');
		}
	}

	var boxwrap = document.getElementById('boxwrap');
	//boxwrap.style.visibility = 'visible';
	boxwrap.style.opacity = '1';
	
	document.querySelector('.activeOS .green').addEventListener('click', createDeskcut, false);
	
	var promise_getMainWorker = SIPWorker('MainWorker', core.addon.path.workers + 'MainWorker.js');
	promise_getMainWorker.then(
		function(aVal) {
			console.log('Fullfilled - promise_getMainWorker - ', aVal);
			// start - do stuff here - promise_getMainWorker
			// end - do stuff here - promise_getMainWorker
		},
		function(aReason) {
			var rejObj = {
				name: 'promise_getMainWorker',
				aReason: aReason
			};
			console.warn('Rejected - promise_getMainWorker - ', rejObj);
		}
	).catch(
		function(aCaught) {
			var rejObj = {
				name: 'promise_getMainWorker',
				aCaught: aCaught
			};
			console.error('Caught - promise_getMainWorker - ', rejObj);
		}
	);
}

function browseTarg(e) {

	var fp = Cc['@mozilla.org/filepicker;1'].createInstance(Ci.nsIFilePicker);
	fp.init(Services.wm.getMostRecentWindow(null), myServices.sb.GetStringFromName('targ-picker-title'), Ci.nsIFilePicker.modeOpen);
	fp.appendFilters(Ci.nsIFilePicker.filterAll);

	var rv = fp.show();
	if (rv == Ci.nsIFilePicker.returnOK) {
		
		var input = e.target.previousSibling;	
		input.value = fp.file.path;

	}// else { // cancelled	}
}

function browseIcon(e) {

	var fp = Cc['@mozilla.org/filepicker;1'].createInstance(Ci.nsIFilePicker);
	fp.init(Services.wm.getMostRecentWindow(null), myServices.sb.GetStringFromName('icon-picker-title'), Ci.nsIFilePicker.modeOpen);
	
	switch (core.os.name) {
		case 'linux':
			fp.appendFilter('Portable Network Graphic (*.png)', '*.png');
			break;
		case 'winnt':
			fp.appendFilter('Windows Icon (*.ico)', '*.ico');
			break;
		case 'darwin':
			fp.appendFilter('Apple Icon Image (*.icns)', '*.icns');
			break;
		default:
			fp.appendFilters(Ci.nsIFilePicker.filterImages);
	}
	var rv = fp.show();
	if (rv == Ci.nsIFilePicker.returnOK) {
		
		var input = e.target.previousSibling;	
		input.value = fp.file.path;

	}// else { // cancelled	}
}

function createDeskcut() {
	
	var name = document.querySelector('.activeOS .name').value.trim();
	var target = document.querySelector('.activeOS .target').value.trim();
	
	if (name.length == 0 || target.length == 0) {
		alert(myServices.sb.GetStringFromName('name-and-target-required'));
		return;
	}
	
	var aOptions = {};
	var args = [name, target, aOptions];
	switch (core.os.name) {
		case 'linux':
		
				// aOptions.blah = 'blah';
				var icon = document.querySelector('.activeOS .icon').value.trim();
				if (icon.length > 0) {
					aOptions.icon = icon;
				}
				
				var nonapp = document.querySelector('.activeOS #checkTargetNonApp').checked;
				aOptions.nonapp = nonapp;
				
				// if nonapp is true, worker will test if its a directory, if its not, then will set type to "Link"
				
			break;
		case 'winnt':
		
				// aOptions.blah = 'blah';
				
			break;
		case 'darwin':
		
				// aOptions.blah = 'blah';
				
			break;
		default:
			throw new Error('os not supported');
	}
	
	var promise_makeCut = MainWorker.post('makeCut', args);
	promise_makeCut.then(
		function(aVal) {
			console.log('Fullfilled - promise_makeCut - ', aVal);
			// start - do stuff here - promise_makeCut
			alert(myServices.sb.GetStringFromName('create-ok'));
			// end - do stuff here - promise_makeCut
		},
		function(aReason) {
			var rejObj = {name:'promise_makeCut', aReason:aReason};
			console.warn('Rejected - promise_makeCut - ', rejObj);
			var errorTxt;
			try {
				errorTxt = myServices.sb.GetStringFromName('error-' + aReason.message.substr(aReason.message.indexOf(': ') + 2));
			} catch (ex) {
				errorTxt = myServices.sb.GetStringFromName('error-?');
			}
			alert(myServices.sb.formatStringFromName('create-failed', [errorTxt], 1));
			// deferred_createProfile.reject(rejObj);
		}
	).catch(
		function(aCaught) {
			var rejObj = {name:'promise_makeCut', aCaught:aCaught};
			console.error('Caught - promise_makeCut - ', rejObj);
			// deferred_createProfile.reject(rejObj);
		}
	);
}

// start - common helper functions
function aReasonMax(aReason) {
	var deepestReason = aReason;
	while (deepestReason.hasOwnProperty('aReason') || deepestReason.hasOwnProperty()) {
		if (deepestReason.hasOwnProperty('aReason')) {
			deepestReason = deepestReason.aReason;
		} else if (deepestReason.hasOwnProperty('aCaught')) {
			deepestReason = deepestReason.aCaught;
		}
	}
	return deepestReason;
}
function Deferred() {
	// update 062115 for typeof
	if (typeof(Promise) != 'undefined' && Promise.defer) {
		//need import of Promise.jsm for example: Cu.import('resource:/gree/modules/Promise.jsm');
		return Promise.defer();
	} else if (typeof(PromiseUtils) != 'undefined'  && PromiseUtils.defer) {
		//need import of PromiseUtils.jsm for example: Cu.import('resource:/gree/modules/PromiseUtils.jsm');
		return PromiseUtils.defer();
	} else {
		/* A method to resolve the associated Promise with the value passed.
		 * If the promise is already settled it does nothing.
		 *
		 * @param {anything} value : This value is used to resolve the promise
		 * If the value is a Promise then the associated promise assumes the state
		 * of Promise passed as value.
		 */
		this.resolve = null;

		/* A method to reject the assocaited Promise with the value passed.
		 * If the promise is already settled it does nothing.
		 *
		 * @param {anything} reason: The reason for the rejection of the Promise.
		 * Generally its an Error object. If however a Promise is passed, then the Promise
		 * itself will be the reason for rejection no matter the state of the Promise.
		 */
		this.reject = null;

		/* A newly created Pomise object.
		 * Initially in pending state.
		 */
		this.promise = new Promise(function(resolve, reject) {
			this.resolve = resolve;
			this.reject = reject;
		}.bind(this));
		Object.freeze(this);
	}
}
function SIPWorker(workerScopeName, aPath, aCore=core) {
	// "Start and Initialize PromiseWorker"
	// returns promise
		// resolve value: jsBool true
	// aCore is what you want aCore to be populated with
	// aPath is something like `core.addon.path.content + 'modules/workers/blah-blah.js'`
	
	// :todo: add support and detection for regular ChromeWorker // maybe? cuz if i do then ill need to do ChromeWorker with callback
	
	var deferredMain_SIPWorker = new Deferred();

	if (!(workerScopeName in bootstrap)) {
		bootstrap[workerScopeName] = new PromiseWorker(aPath);
		
		if ('addon' in aCore && 'aData' in aCore.addon) {
			delete aCore.addon.aData; // we delete this because it has nsIFile and other crap it, but maybe in future if I need this I can try JSON.stringify'ing it
		}
		
		var promise_initWorker = bootstrap[workerScopeName].post('init', [aCore]);
		promise_initWorker.then(
			function(aVal) {
				console.log('Fullfilled - promise_initWorker - ', aVal);
				// start - do stuff here - promise_initWorker
				deferredMain_SIPWorker.resolve(true);
				// end - do stuff here - promise_initWorker
			},
			function(aReason) {
				var rejObj = {name:'promise_initWorker', aReason:aReason};
				console.warn('Rejected - promise_initWorker - ', rejObj);
				deferredMain_SIPWorker.reject(rejObj);
			}
		).catch(
			function(aCaught) {
				var rejObj = {name:'promise_initWorker', aCaught:aCaught};
				console.error('Caught - promise_initWorker - ', rejObj);
				deferredMain_SIPWorker.reject(rejObj);
			}
		);
		
	} else {
		deferredMain_SIPWorker.reject('Something is loaded into bootstrap[workerScopeName] already');
	}
	
	return deferredMain_SIPWorker.promise;
	
}
// end - common helper functions

document.addEventListener('DOMContentLoaded', init, false);