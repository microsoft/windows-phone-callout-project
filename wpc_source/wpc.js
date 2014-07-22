(function (window, document) {

var _autostart = true;
var _nav = window.navigator;

window.addEventListener('load', bootstrap, false);

function bootstrap () {
	window.removeEventListener('load', bootstrap, false);

	if ( !_autostart ) {
		return;
	}

	setTimeout(function () {
		new WPC();
	}, 500);
}

function WPC (options) {
	_autostart = false;

	this.options = _extend({}, WPC.defaults);
	_extend(this.options, options);

	// this has to work only on Windows Phone
	if ( !WPC.isMobileIE && !this.options.debug ) {
		return;
	}

	// load session
	var defaultSession = {
		displayAfter: 0,			// display the message after this timestamp
		lastDisplayTime: 0,			// last time we displayed the message
		displayCount: 0,			// number of times the message has been shown
		optedout: false				// has the user opted out
	};
	this.session = JSON.parse(localStorage.getItem(this.options.session));
	this.session = this.session || defaultSession;

	// check if we can use the local storage
	try {
		localStorage.setItem(this.options.session, JSON.stringify(this.session));
		WPC.hasLocalStorage = true;
	} catch (e) {
		WPC.hasLocalStorage = false;
	}

	if ( WPC.hasLocalStorage ) {
		// user can opt-out
		if ( this.session.optedout ) {
			return;
		}

		var now = Date.now();

		// respect the display pace
		if ( now - this.session.lastDisplayTime < this.options.pace * 60000 ) {
			return;
		}

		// obey the maximum number of display count
		if ( this.options.maxDisplayCount && this.session.displayCount >= this.options.maxDisplayCount ) {
			return;
		}

		// obey the display after timestamp
		if ( this.session.displayAfter ) {
			if ( now < this.session.displayAfter ) {
				return;
			} else {
				this.session.displayAfter = 0;
				this._updateSession();
			}
		}
	}

	// grab the appid or exit on fail
	if ( !this.options.appId ) {
		var metaAppId = document.querySelector('meta[name=wpc-appid]');

		if ( !metaAppId || !metaAppId.content ) {
			console.log('WPC Warning: No meta wpc-appid found! Please add the "wpc-appid" meta tag to your page head or pass the "appid" option to the script constructor.');
			return;
		}

		this.options.appId = metaAppId.content;
	}

	// get the tile image, will be displayed alongside with the message
	if ( !this.options.tileImage ) {
		var tileImage = document.querySelector('meta[name=msapplication-TileImage]');

		if ( tileImage && tileImage.content ) {
			this.options.tileImage = tileImage.content;
		} else {
			// default icon
			this.options.tileImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVAAAAFQCAMAAADeNtbrAAACu1BMVEX///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+DBvXuAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAALiUAAC4lAfime+0AAAAHdElNRQfeBwIQMxbgULB1AAAHsklEQVR42u3d/X/TRADH8fuTiw8URAdjUlCEqoBTFMqTdEykgECZiHSgozyMTZyMwXhY243+GW68mq0PaXO5XJrL3ef7A7yW5q7rm8vlcrkGIYxK5sCp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';
		}
	}

	// get the background color
	if ( !this.options.tileColor ) {
		var tileColor = document.querySelector('meta[name=msapplication-TileColor]');

		if ( tileColor && tileColor.content ) {
			this.options.tileColor = tileColor.content;
		}
	}

	this.options.tileColor = this.options.tileColor || '#01a4ef';	// default to light blue background

	// set the text color
	if ( !this.options.tileTextColor ) {
		this.options.tileTextColor = _textColor(this.options.tileColor);
	}

	// get the callout message
	if ( !this.options.message ) {
		this.options.message = WPC.locale[WPC.language];
	}

	// create the main container object
	this.container = document.createElement('div');
	this.container.className = 'wpc-container';
	this.container.style.opacity = '0';

	if ( this.options.tileTextColor ) {
		this.container.style.color = this.options.tileTextColor;
	}
	if ( this.options.tileColor ) {
		this.container.style.backgroundColor = this.options.tileColor;
	}

	this.container.innerHTML = this.options.message.replace('%appLink', 'http://windowsphone.com/s?appId=' + this.options.appId).replace('%textColor', this.options.tileTextColor);
	this.container.innerHTML += '<div class="wpc-icon" style="background-image:url(' + this.options.tileImage + ')"></div>';

	if ( this.options.closeButton ) {
		var close = document.createElement('button');
		close.className = 'close';
		close.onclick = this.hide.bind(this);
		this.container.appendChild(close);
	}

	this.bindUpdateViewport = this._updateViewport.bind(this);
	this.bindResize = this._resize.bind(this);

	window.addEventListener('resize', this.bindResize, false);
	window.addEventListener('scroll', this.bindResize, false);

	document.body.insertBefore(this.container, document.body.firstChild);

	var that = this;
	setTimeout(function () {
		that._translate('-110%', 0);
		that._updateViewport();

		that.container.style.opacity = '1';

		that.show();
	}, 10);
}

WPC.prototype = {
	// show the callout
	show: function () {
		if ( this.onscreen ) {
			return;
		}

		this.onscreen = true;

		// update the last display time
		this.session.lastDisplayTime = Date.now();

		// increment the display count
		if ( this.options.maxDisplayCount ) {
			this.session.displayCount++;
		}

		this._updateSession();

		this._translate('0', 500);

		if ( this.options.onShow ) {
			this.options.onShow.call(this);
		}
	},

	// hide the callout
	hide: function (e) {
		if ( !this.onscreen ) {
			return;
		}

		// if event is set, we are coming from user interaction so set the next display 30 minutes in the future
		if ( e ) {
			if ( this.options.closeAction == 'optout' ) {
				this.optOut();
			} else {
				this.session.displayAfter = Date.now() + 1000*60*30;
				this._updateSession();
			}
		}

		this._translate('-110%', 500);

		this.bindDestroy = this.destroy.bind(this);
		this.container.addEventListener('transitionend', this.bindDestroy, false);
		this.container.addEventListener('webkitTransitionEnd', this.bindDestroy, false);
		this.container.addEventListener('MSTransitionEnd', this.bindDestroy, false);

		if ( this.options.onHide ) {
			this.options.onHide.call(this);
		}
	},

	// destroy the callout, unload the listeners, remove the elements
	destroy: function () {
		this.container.removeEventListener('transitionend', this.bindDestroy, false);
		this.container.removeEventListener('webkitTransitionEnd', this.bindDestroy, false);
		this.container.removeEventListener('MSTransitionEnd', this.bindDestroy, false);

		this.bindResize = null;
		this.bindDestroy = null;
		this.bindUpdateViewport = null;

		this.container.parentNode.removeChild(this.container);
		this.container = null;

		window.removeEventListener('resize', this.bindResize, false);
		window.removeEventListener('scroll', this.bindResize, false);
	},

	// optout, the callout is never shown again
	optOut: function () {
		this.session.optedout = true;
		this._updateSession();
	},

	// it clears the local storage, userfull for testing
	clearSession: function () {
		this.session = {};
		this._updateSession();
	},

	// reposition and resize the callout based on zoom factor and viewport position
	_updateViewport: function () {
		this.container.style.width = window.innerWidth + 2 + 'px';

		if ( this.options.follow ) {
			this.container.style.left = window.pageXOffset - 1 + 'px';
			this.container.style.top = window.pageYOffset - 1 + 'px';
		} else {
			this.container.style.left = '-1px';
			this.container.style.top = '-1px';
		}

		var clientWidth = document.documentElement.clientWidth;
		var orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
		var screenWidth = orientation == 'portrait' ? screen.width : screen.height;

		this.scale = window.innerWidth > clientWidth ? 1 : screenWidth / window.innerWidth;

		this.container.style.fontSize = 10 / this.scale + 'px';
	},

	// prevent the _updateViewport function to be fired too often
	_resize: function () {
		clearTimeout(this.resizeTimer);
		this.resizeTimer = setTimeout(this.bindUpdateViewport, 100);
	},

	// perform the slide in/out animation
	_translate: function (pos, time) {
		pos = 'translate(0,' + pos + ')';
		time = time + 'ms';

		// translating on all browsers, just for the sake of completeness
		this.container.style.webkitTransitionDuration = time;
		this.container.style.mozTransitionDuration = time;
		this.container.style.msTransitionDuration = time;
		this.container.style.oTransitionDuration = time;
		this.container.style.transitionDuration = time;

		this.container.style.webkitTransform = pos;
		this.container.style.mozTransform = pos;
		this.container.style.msTransform = pos;
		this.container.style.oTransform = pos;
		this.container.style.transform = pos;
	},

	// update the local storage
	_updateSession: function () {
		if ( !WPC.hasLocalStorage ) {
			return;
		}

		localStorage.setItem(this.options.session, JSON.stringify(this.session));
	}
};

WPC.isMobileIE = _nav.userAgent.indexOf('Windows Phone') > -1;

WPC.defaults = {
	session: 'com.nokia.wpc',	// local storage name
	appId: '',					// the ID of the WP Store application, overrides meta wpc-appid
	tileImage: '',				// the image to be displayed in the callout
	tileColor: '',				// the background color for the callout
	tileTextColor: '',			// the text color for the callout
	message: '',				// user defined message, if not set use default messages in current locale
	debug: false,				// true = execute the script on any device (including desktop)
	closeButton: true,			// should we show a close button?
	maxDisplayCount: 0,			// how many times to show the callout (0: always)
	pace: 0,					// every how many minutes to show the callout again (0: every time)
	follow: false,				// follow the viewport of stay fixed on top
	closeAction: 'postpone'		// postpone || optout
};

// ** language support **

WPC.locale = {
	en_us: '<p>This is the message in English. You should really install the native application. This copy must be edited of course.<br><a class="wpc-button" style="border-color:%textColor" href="%appLink" target="_top">Download the app</a></p>',
	it_it: '<p>Questo è il messaggio in Italiano. Dovresti veramente installare l\'applicatione nativa. Questo testo deve essere modificato ovviamente.<br><a class="wpc-button" style="border-color:%textColor" href="%appLink" target="_top">Scarica l\'app</a></p>'
};

WPC.language = _nav.language || _nav.userLanguage || '';
WPC.language = WPC.language.toLowerCase().replace('-', '_');
WPC.language = WPC.language in WPC.locale ? WPC.language : 'en_us';

// ** utilities **

// merge objects
function _extend (target, obj) {
	for ( var i in obj ) {
		target[i] = obj[i];
	}

	return target;
}

// find the text color based on the background
function _textColor (bg) {
	bg = bg.replace(/[^0-9a-f]/gi, '');
	var r = parseInt(bg.substr(0, 2), 16),
		g = parseInt(bg.substr(2, 2), 16),
		b = parseInt(bg.substr(4, 2), 16);

	return 0.299 * r + 0.587 * g + 0.114 * b <= 128 ? 'white' : 'black';
}

window.WPC = WPC;

})(window, document);