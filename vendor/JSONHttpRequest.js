(function() {
	'use strict';

	function JSONHttpRequest() {}

	JSONHttpRequest.prototype = {
		constructor: JSONHttpRequest,

		onload: false,

		/**
		 * @param {String} url 			JSON URL to load
		 * @param {Boolean} [async] 	Default: true
		 */
		open: function(method, url, async) {
			var request = new XMLHttpRequest(),
				self = this;

			method = method || 'GET';
			async = async === undefined ? true : !!async;

			request.overrideMimeType('application/json');
			request.onreadystatechange = function() {
				var json;

				if (self.onreadystatechange) {
					self.onreadystatechange();
				}

				if (request.readyState < 4) return;

				if (request.status < 400 && request.responseText) {
					json = self.parse(request.responseText);
					request.responseJson = json;
				} else {
					json = null;
				}

				if (self.onload) {
					self.onload(self.request);
				}
			};

			request.open(method, url, async);
			self.request = request;

			return request;
		},

		send: function(data) {
			this.request.send(data === undefined ? null : data);
		},

		abort: function() {
			if (this.request) {
				this.request.abort();
			}
		},

		parse: function(text) {
			try {
				return JSON.parse(text) || null;
			} catch (e) {
				return null;
			}
		}
	};

	window.JSONHttpRequest = JSONHttpRequest;
})();
