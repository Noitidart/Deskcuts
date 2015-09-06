'use strict';

// Imports
importScripts('resource://gre/modules/osfile.jsm');
importScripts('resource://gre/modules/workers/require.js');

// Globals
var core = {
	addon: {
		path: {
			content: 'chrome://deskcuts/content/',
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
		case 'darwin':
		
			OSStuff.FileUtils_PERMS_DIRECTORY = 493;
		
		default:
			// do nothing special
	}
	
	return true;
}

// Start - Addon Functionality
function makeCut(aCreate_name, aTarget_string, aOptions={}) {
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
					
					var aTarget_extWithDot = aTarget_string.substr(aTarget_string.lastIndexOf('.'));
					
					var rez_CreateHardLink = ostypes.API('CreateHardLink')(OS.Path.join(OS.Constants.Path.desktopDir, aCreate_name + aTarget_extWithDot), aTarget_string, null);
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
				var cmdArr = [
					'[Desktop Entry]',
					'Name=' + aCreate_name
					// 'Comment=Web Application',
					// 'Icon=' + path_icon
				];

				if (aOptions.icon) {
					cmdArr.push('Icon=' + aOptions.icon);
				}
				
				if (!aOptions.nonapp) {
					cmdArr.push('Type=Application');
					cmdArr.push('Exec=' + aTarget_string);
				} else {
					cmdArr.push('Type=Link');
					cmdArr.push('URL=' + aTarget_string);
					/*
					// check if dir, if it is set type=Directory
					var isDir = false;
					try {
						var stat = OS.File.stat(aTarget_string);
						console.log('stat:', stat);
						isDir = stat.isDir;
					} catch(ex) {
						isDir = false;
					}
					if (stat.isDir) {
						cmdArr.push('Type=Directory');
						cmdArr.push('URL=' + aTarget_string);
					} else {
						cmdArr.push('Type=Link');
						cmdArr.push('URL=' + aTarget_string);						
					}
					// else then set to URL
					*/
				}
				
				var cmdStr = cmdArr.join('\n');
				
				var path_toFile = OS.Path.join(OS.Constants.Path.desktopDir, aCreate_name + '.desktop');
				
				try {
					var promise_writeScript = OS.File.writeAtomic(path_toFile, cmdStr, {encoding:'utf-8', /*unixMode:0o4777,*/ noOverwrite:true}); // doing unixMode:0o4777 here doesn't work, i have to `OS.File.setPermissions(path_toFile, {unixMode:0o4777})` after the file is made
				} catch(ex) {
					console.error('ex caught on writescript:', ex);
					throw new Error('nix-' + ex.unixErrno);
				}
				
				var promise_setPermsScript = OS.File.setPermissions(path_toFile, {unixMode:0o4777});
			
			break;
		case 'darwin':
			
				// create applescript launcher
				
				var dirApp = OS.Path.join(OS.Constants.Path.desktopDir, aCreate_name + '.app');
				var dirContents = OS.Path.join(dirApp, 'Contents');
				var dirMacOS = OS.Path.join(dirContents, 'MacOS');
				var fileScript = OS.Path.join(dirMacOS, aCreate_name);
				var dirResources = OS.Path.join(dirContents, 'Resources');
				var filePlist = OS.Path.join(dirContents, 'Info.plist');
				if (aOptions.icon_ospath) {
					var fileIcon = OS.Path.join(dirResources, 'appicon.icns');
				}
				
				//step 1
				OS.File.makeDir(dirApp, {unixMode: OSStuff.FileUtils_PERMS_DIRECTORY, ignoreExisting: true});
				
				//step 2
				OS.File.makeDir(dirContents, {unixMode: OSStuff.FileUtils_PERMS_DIRECTORY, ignoreExisting: true});
				
				//step 3 - grouping in this step means i can make any dir in any order
				OS.File.makeDir(dirMacOS, {unixMode: OSStuff.FileUtils_PERMS_DIRECTORY, ignoreExisting: true});
				OS.File.makeDir(dirResources, {unixMode: OSStuff.FileUtils_PERMS_DIRECTORY, ignoreExisting: true});

				OS.File.writeAtomic(filePlist, '<?xml version="1.0" encoding="UTF-8"?>\
													<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\
													<plist version="1.0">\
														<dict>\
															<key>CFBundleAllowMixedLocalizations</key>\
															<true/>\
															<key>CFBundleDevelopmentRegion</key>\
															<string>English</string>\
															<key>CFBundleExecutable</key>\
															<string>' + escapeXML(aCreate_name) + '</string>\
															<key>CFBundleIconFile</key>\
															<string>appicon</string>\
															<key>CFBundleIdentifier</key>\
															<string>com.apple.ScriptEditor.id.' + escapeXML(aCreate_name + Math.random()) + '</string>\
															<key>CFBundleInfoDictionaryVersion</key>\
															<string>6.0</string>\
															<key>CFBundleName</key>\
															<string>' + escapeXML(aCreate_name) + '</string>\
															<key>CFBundlePackageType</key>\
															<string>APPL</string>\
															<key>CFBundleShortVersionString</key>\
															<string>1.0</string>\
															<key>CFBundleSignature</key>\
															<string>aplt</string>\
															<key>LSUIElement</key>\
															<string>true</string>\
														</dict>\
													</plist>', {encoding:'utf-8', /*unixMode: OSStuff.FileUtils_PERMS_DIRECTORY,*/ noOverwrite: true}); //note: i dont think writeAtomic has unixMode option so i do setPermissions
				 
				//step 4 - after dirMacOS is made
				OS.File.writeAtomic(fileScript, '#!/bin/sh\nexec ' + aTarget_string, {encoding:'utf-8', /*unixMode: OSStuff.FileUtils_PERMS_DIRECTORY,*/ noOverwrite: true});
				if (aOptions.icon_ospath) {
					OS.File.copy(iconpath, fileIcon, {noOverwrite:false}); // this should happen after dirResources is made
				}
				OS.File.setPermissions(filePlist, {unixMode: OSStuff.FileUtils_PERMS_DIRECTORY}); // after plist is made
				
				// step 5 - have to set perms on scipt, so after script is made
				OS.File.setPermissions(fileScript, {unixMode: OSStuff.FileUtils_PERMS_DIRECTORY});
				
				// xattr the .app
			break;
		default:
			console.error('os not supported');
			throw new Error('os-unsupported');
	}
	
}

// End - Addon Functionality

// Start - Common helper functions
function escapeXML(aStr) {
  return aStr.toString()
             .replace(/&/g, '&amp;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&apos;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;');
}
// End - Common helper functions