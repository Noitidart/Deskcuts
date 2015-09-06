var EXPORTED_SYMBOLS = ['ostypes'];

// no need to define core or import cutils as all the globals of the worker who importScripts'ed it are availble here

if (ctypes.voidptr_t.size == 4 /* 32-bit */) {
	var is64bit = false;
} else if (ctypes.voidptr_t.size == 8 /* 64-bit */) {
	var is64bit = true;
} else {
	throw new Error('huh??? not 32 or 64 bit?!?!');
}

var ifdef_UNICODE = true;

var winTypes = function() {

	// ABIs
	if (is64bit) {
	  this.CALLBACK_ABI = ctypes.default_abi;
	  this.ABI = ctypes.default_abi;
	} else {
	  this.CALLBACK_ABI = ctypes.stdcall_abi;
	  this.ABI = ctypes.winapi_abi;
	}

	// C TYPES
	this.char = ctypes.char;
	this.int = ctypes.int;
	this.size_t = ctypes.size_t;
	this.void = ctypes.void_t;

	// SIMPLE TYPES // based on ctypes.BLAH // as per WinNT.h etc
	this.BOOL = ctypes.bool;
	this.BYTE = ctypes.unsigned_char;
	this.CHAR = ctypes.char;
	this.DWORD = ctypes.unsigned_long; // IntSafe.h defines it as: // typedef unsigned long DWORD; // so maybe can change this to ctypes.unsigned_long // i was always using `ctypes.uint32_t`
	this.FXPT2DOT30 = ctypes.long; // http://stackoverflow.com/a/20864995/1828637 // https://github.com/wine-mirror/wine/blob/a7247df6ca54fd1209eff9f9199447643ebdaec5/include/wingdi.h#L150
	this.INT = ctypes.int;
	this.INT_PTR = is64bit ? ctypes.int64_t : ctypes.int;
	this.LONG = ctypes.long;
	this.LONG_PTR = is64bit ? ctypes.int64_t : ctypes.long; // i left it at what i copied pasted it as but i thought it would be `ctypes.intptr_t`
	this.LPCVOID = ctypes.voidptr_t;
	this.LPVOID = ctypes.voidptr_t;
	this.NTSTATUS = ctypes.long; // https://msdn.microsoft.com/en-us/library/cc230357.aspx // typedef long NTSTATUS;
	this.PVOID = ctypes.voidptr_t;
	this.RM_APP_TYPE = ctypes.unsigned_int; // i dont know im just guessing, i cant find a typedef that makes sense to me: https://msdn.microsoft.com/en-us/library/windows/desktop/aa373670%28v=vs.85%29.aspx
	this.SHORT = ctypes.short;
	this.UINT = ctypes.unsigned_int;
	this.UINT_PTR = is64bit ? ctypes.uint64_t : ctypes.unsigned_int;
	this.ULONG = ctypes.unsigned_long;
	this.ULONG_PTR = is64bit ? ctypes.uint64_t : ctypes.unsigned_long; // i left it at what i copied pasted it as, but i thought it was this: `ctypes.uintptr_t`
	this.USHORT = ctypes.unsigned_short;
	this.VARIANT_BOOL = ctypes.short;
	this.VARTYPE = ctypes.unsigned_short;
	this.VOID = ctypes.void_t;
	this.WCHAR = ctypes.jschar;
	this.WORD = ctypes.unsigned_short;

	// ADVANCED TYPES // as per how it was defined in WinNT.h // defined by "simple types"
	this.ATOM = this.WORD;
	this.BOOLEAN = this.BYTE; // http://blogs.msdn.com/b/oldnewthing/archive/2004/12/22/329884.aspx
	this.COLORREF = this.DWORD; // when i copied/pasted there was this comment next to this: // 0x00bbggrr
	this.DWORD_PTR = this.ULONG_PTR;
	this.HANDLE = this.PVOID;
	this.HRESULT = this.LONG;
	this.LPCSTR = this.CHAR.ptr; // typedef __nullterminated CONST CHAR *LPCSTR;
	this.LPCWSTR = this.WCHAR.ptr;
	this.LPARAM = this.LONG_PTR;
	this.LPDWORD = this.DWORD.ptr;
	this.LPSTR = this.CHAR.ptr;
	this.LPWSTR = this.WCHAR.ptr;
	this.LRESULT = this.LONG_PTR;
	this.OLECHAR = this.WCHAR; // typedef WCHAR OLECHAR; // https://github.com/wine-mirror/wine/blob/bdeb761357c87d41247e0960f71e20d3f05e40e6/include/wtypes.idl#L286
	this.PLONG = this.LONG.ptr;
	this.PULONG = this.ULONG.ptr;
	this.PULONG_PTR = this.ULONG.ptr;
	this.PCWSTR = this.WCHAR.ptr;
	this.SIZE_T = this.ULONG_PTR;
	this.SYSTEM_INFORMATION_CLASS = this.INT; // i think due to this search: http://stackoverflow.com/questions/28858849/where-is-system-information-class-defined
	this.TCHAR = ifdef_UNICODE ? this.WCHAR : ctypes.char; // when i copied pasted this it was just ctypes.char and had this comment: // Mozilla compiled with UNICODE/_UNICODE macros and wchar_t = jschar // in "advanced types" section even though second half is ctypes.char because it has something that is advanced, which is the first part, this.WCHAR
	this.WPARAM = this.UINT_PTR;

	// SUPER ADVANCED TYPES // defined by "advanced types"
	this.HBITMAP = this.HANDLE;
	this.HBRUSH = this.HANDLE;
	this.HDC = this.HANDLE;
	this.HFONT = this.HANDLE;
	this.HGDIOBJ = this.HANDLE;
	this.HHOOK = this.HANDLE;
	this.HICON = this.HANDLE;
	this.HINSTANCE = this.HANDLE;
	this.HKEY = this.HANDLE;
	this.HMENU = this.HANDLE;
	this.HMONITOR = this.HANDLE;
	this.HWND = this.HANDLE;
	this.LPCOLESTR = this.OLECHAR.ptr; // typedef [string] const OLECHAR *LPCOLESTR; // https://github.com/wine-mirror/wine/blob/bdeb761357c87d41247e0960f71e20d3f05e40e6/include/wtypes.idl#L288
	this.LPCTSTR = ifdef_UNICODE ? this.LPCWSTR : this.LPCSTR;
	this.LPHANDLE = this.HANDLE.ptr;
	this.LPOLESTR = this.OLECHAR.ptr; // typedef [string] OLECHAR *LPOLESTR; // https://github.com/wine-mirror/wine/blob/bdeb761357c87d41247e0960f71e20d3f05e40e6/include/wtypes.idl#L287 // http://stackoverflow.com/a/1607335/1828637 // LPOLESTR is usually to be allocated with CoTaskMemAlloc()
	this.LPTSTR = ifdef_UNICODE ? this.LPWSTR : this.LPSTR;

	// SUPER DUPER ADVANCED TYPES // defined by "super advanced types"
	this.HCURSOR = this.HICON;
	this.HMODULE = this.HINSTANCE;
	this.WNDENUMPROC = ctypes.FunctionType(this.CALLBACK_ABI, this.BOOL, [this.HWND, this.LPARAM]); // "super advanced type" because its highest type is `this.HWND` which is "advanced type"

	// inaccrurate types - i know these are something else but setting them to voidptr_t or something just works and all the extra work isnt needed
	this.MONITOR_DPI_TYPE = ctypes.unsigned_int;
	this.PCIDLIST_ABSOLUTE = ctypes.voidptr_t; // https://github.com/west-mt/ssbrowser/blob/452e21d728706945ad00f696f84c2f52e8638d08/chrome/content/modules/WindowsShortcutService.jsm#L115
	this.PIDLIST_ABSOLUTE = ctypes.voidptr_t;
	this.WIN32_FIND_DATA = ctypes.voidptr_t;
	this.WINOLEAPI = ctypes.voidptr_t; // i guessed on this one

	// STRUCTURES
	// consts for structures
	var struct_const = {
		CCHDEVICENAME: 32,
		CCHFORMNAME: 32
	};

	// SIMPLE STRUCTS // based on any of the types above
	this.BITMAPINFOHEADER = ctypes.StructType('BITMAPINFOHEADER', [
		{ biSize: this.DWORD },
		{ biWidth: this.LONG },
		{ biHeight: this.LONG },
		{ biPlanes: this.WORD },
		{ biBitCount: this.WORD },
		{ biCompression: this.DWORD },
		{ biSizeImage: this.DWORD },
		{ biXPelsPerMeter: this.LONG },
		{ biYPelsPerMeter: this.LONG },
		{ biClrUsed: this.DWORD },
		{ biClrImportant: this.DWORD }
	]);
	this.CIEXYZ = ctypes.StructType('CIEXYZ', [
		{ ciexyzX: this.FXPT2DOT30 },
		{ ciexyzY: this.FXPT2DOT30 },
		{ ciexyzZ: this.FXPT2DOT30 }
	]);
	this.DISPLAY_DEVICE = ctypes.StructType('_DISPLAY_DEVICE', [
		{ cb:			this.DWORD },
		{ DeviceName:	this.TCHAR.array(32) },
		{ DeviceString:	this.TCHAR.array(128) },
		{ StateFlags:	this.DWORD },
		{ DeviceID:		this.TCHAR.array(128) },
		{ DeviceKey:	this.TCHAR.array(128) }
	]);
	this.POINT = ctypes.StructType('tagPOINT', [
		{ x: this.LONG },
		{ y: this.LONG }
	]);
	this.POINTL = ctypes.StructType('_POINTL', [ // https://github.com/wine-mirror/wine/blob/7eddb864b36d159fa6e6807f65e117ca0a81485c/include/windef.h#L368
		{ x: this.LONG },
		{ y: this.LONG }
	]);
	this.RGBQUAD = ctypes.StructType('RGBQUAD', [
		{ rgbBlue:		this.BYTE },
		{ rgbGreen:		this.BYTE },
		{ rgbRed:		this.BYTE },
		{ rgbReserved:	this.BYTE }
	]);
	this.RAWINPUTDEVICE = ctypes.StructType('tagRAWINPUTDEVICE', [ // https://msdn.microsoft.com/en-us/library/windows/desktop/ms645565%28v=vs.85%29.aspx
		{ usUsagePage: this.USHORT },
		{ usUsage: this.USHORT },
		{ dwFlags: this.DWORD },
		{ hwndTarget: this.HWND }
	]);
    this.RECT = ctypes.StructType('_RECT', [ // https://msdn.microsoft.com/en-us/library/windows/desktop/dd162897%28v=vs.85%29.aspx
        { left: this.LONG },
        { top: this.LONG },
        { right: this.LONG },
        { bottom: this.LONG }
    ]);
	this.SECURITY_ATTRIBUTES = ctypes.StructType('_SECURITY_ATTRIBUTES', [ // https://msdn.microsoft.com/en-us/library/windows/desktop/aa379560%28v=vs.85%29.aspx
		{ 'nLength': this.DWORD },
		{ 'lpSecurityDescriptor': this.LPVOID },
		{ 'bInheritHandle': this.BOOL }
	]);
	
	// ADVANCED STRUCTS // based on "simple structs" to be defined first
	this.LPSECURITY_ATTRIBUTES = this.SECURITY_ATTRIBUTES.ptr;
}

var winInit = function() {
	var self = this;

	this.IS64BIT = is64bit;

	this.TYPE = new winTypes();

	// CONSTANTS
	this.CONST = {
		BI_BITFIELDS: 3,
		BI_RGB: 0,
		BITSPIXEL: 12,
		CCHDEVICENAME: 32,
		DIB_RGB_COLORS: 0,
		DISPLAY_DEVICE_ATTACHED_TO_DESKTOP: 1, // same as DISPLAY_DEVICE_ACTIVE
		DISPLAY_DEVICE_PRIMARY_DEVICE: 4,
		DISPLAY_DEVICE_MIRRORING_DRIVER: 8,
		DM_BITSPERPEL: 0x00040000,
		DM_DISPLAYFREQUENCY: 0x00400000,
		DM_PELSHEIGHT: 0x00100000,
		DM_PELSWIDTH: 0x00080000,
		ENUM_CURRENT_SETTINGS: self.TYPE.DWORD.size == 4 ? /*use 8 letters for size 4*/ self.TYPE.DWORD('0xFFFFFFFF') : /*size is 8 so use 16 letters*/ self.TYPE.DWORD('0xFFFFFFFFFFFFFFFF'),
		ENUM_REGISTRY_SETTINGS: self.TYPE.DWORD.size == 4 ? self.TYPE.DWORD('0xFFFFFFFE') : self.TYPE.DWORD('0xFFFFFFFFFFFFFFFE'),
		HORZRES: 8,
		LOGPIXELSX: 88,
		LOGPIXELSY: 90,
		MONITOR_DEFAULTTONEAREST: 2,
		S_OK: 0,
		SRCCOPY: self.TYPE.DWORD('0x00CC0020'),
		VERTRES: 10,
		HWND_TOPMOST: self.TYPE.HWND(-1), // toString: "ctypes.voidptr_t(ctypes.UInt64("0xffffffff"))" cannot do self.TYPE.HWND('-1') as that puts out `TypeError: can't convert the string "-1" to the type ctypes.voidptr_t`
		SWP_NOSIZE: 1,
		SWP_NOMOVE: 2,
		SWP_NOREDRAW: 8,
		MDT_Effective_DPI: 0,
		MDT_Angular_DPI: 1,
		MDT_Raw_DPI: 2,
		MDT_Default: 0, // MDT_Effective_DPI
		WS_VISIBLE: 0x10000000,
		GWL_STYLE: -16,
		SW_SHOWNORMAL: 1,
		SEE_MASK_INVOKEIDLIST: 0x0000000C // 12
	};

	var _lib = {}; // cache for lib
	var lib = function(path) {
		//ensures path is in lib, if its in lib then its open, if its not then it adds it to lib and opens it. returns lib
		//path is path to open library
		//returns lib so can use straight away

		if (!(path in _lib)) {
			//need to open the library
			//default it opens the path, but some things are special like libc in mac is different then linux or like x11 needs to be located based on linux version
			switch (path) {
				/* for libc which is unix
				case 'libc':

					if (core.os.name == 'darwin') {
						_lib[path] = ctypes.open('libc.dylib');
					} else if (core.os.name == 'freebsd') {
						_lib[path] = ctypes.open('libc.so.7');
					} else if (core.os.name == 'openbsd') {
						_lib[path] = ctypes.open('libc.so.61.0');
					} else if (core.os.name == 'sunos') {
						_lib[path] = ctypes.open('libc.so');
					} else {
						throw new Error({
							name: 'watcher-api-error',
							message: 'Path to libc on operating system of , "' + OS.Constants.Sys.Name + '" is not supported for kqueue'
						});
					}

					break;
				*/
				default:
					try {
						_lib[path] = ctypes.open(path);
					} catch (ex) {
						throw new Error({
							name: 'addon-error',
							message: 'Could not open ctypes library path of "' + path + '"',
							ex_msg: ex.message
						});
					}
			}
		}
		return _lib[path];
	};

	// start - function declares
	var _api = {};
	this.API = function(declaration) { // it means ensureDeclared and return declare. if its not declared it declares it. else it returns the previously declared.
		if (!(declaration in _api)) {
			_api[declaration] = preDec[declaration](); //if declaration is not in preDec then dev messed up
		}
		return _api[declaration];
	};

	// start - predefine your declares here
	var preDec = { //stands for pre-declare (so its just lazy stuff) //this must be pre-populated by dev // do it alphabateized by key so its ez to look through
		CreateHardLink: function() {
			/* https://msdn.microsoft.com/en-us/library/windows/desktop/aa363860%28v=vs.85%29.aspx
			 * BOOL WINAPI CreateHardLink(
			 *   __in_        LPCTSTR lpFileName,
			 *   __in_        LPCTSTR lpExistingFileName,
			 *   __reserved_  LPSECURITY_ATTRIBUTES lpSecurityAttributes
			 * );
			 */
			return lib('kernel32').declare('CreateHardLinkW', self.TYPE.ABI,
				self.TYPE.BOOL,					// return
				self.TYPE.LPCTSTR,				// lpFileName
				self.TYPE.LPCTSTR,				// lpExistingFileName
				self.TYPE.LPSECURITY_ATTRIBUTES	// lpSecurityAttributes
			);
		}
	};
	// end - predefine your declares here
	// end - function declares

	this.HELPER = {
		checkHRESULT: function(hr /*HRESULT*/, funcName /*jsStr*/) {
			if(parseInt(cutils.jscGetDeepest(hr)) < 0) {
				throw new Error('HRESULT ' + hr + ' returned from function ' + funcName);
			}
		},
		CLSIDFromString: function(lpsz /*jsStr*/) {
			// lpsz should look like: "886D8EEB-8CF2-4446-8D02-CDBA1DBDCF99" no quotes
			var GUID_or_IID = self.TYPE.GUID();

			var pieces = lpsz.split('-');

			GUID_or_IID.Data1 = parseInt(pieces[0], 16);
			GUID_or_IID.Data2 = parseInt(pieces[1], 16);
			GUID_or_IID.Data3 = parseInt(pieces[2], 16);

			var piece34 = pieces[3] + '' + pieces[4];

			for (var i=0; i<8; i++) {
			  GUID_or_IID.Data4[i] = parseInt(piece34.substr(i*2,2), 16);
			};

			return GUID_or_IID;
		}
	};
}

var ostypes = new winInit();