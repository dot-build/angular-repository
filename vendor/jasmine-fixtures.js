(function(window, jasmine, JSONHttpRequest) {

	jasmine.getFixtures = function() {
		return jasmine.currentFixtures || (jasmine.currentFixtures = new Fixtures());
	};

	/**
	 * @param {String} url 				JSON Fixture URL
	 * @param {Function} [callback] 	Function to call after load
	 */
	window.loadJSONFixture = jasmine.loadJSONFixture = function(src, callback) {
		function loadFixture(done) {
			jasmine.getFixtures().load(src, done || function noop() {});
		}

		if (arguments.length === 1) {
			return loadFixture;
		}

		loadFixture(callback);
	};

	window.getJSONFixture = jasmine.getJSONFixture = function(src) {
		var fixtures = jasmine.getFixtures();
		return fixtures.get(src);
	};

	jasmine.Fixtures = Fixtures;

	function Fixtures() {
		this.cleanup();
	}

	Fixtures.prototype = {
		constructor: Fixtures,

		/**
		 * @property {String} fixturesPath 	Path to prepend to URLs before loading
		 */
		fixturesPath: 'test/fixtures/',

		/**
		 * @param {String} url 			URL to load into cache
		 * @param {Function} next 		Function to call when the file is loaded
		 */
		load: function(url, next) {
			var self = this;

			if (url in self.$$fixturesCache) {
				return next();
			}

			var request = new JSONHttpRequest();

			request.onload = function(request) {
				self.$$fixturesCache[url] = request.responseJson;
				next();
			};

			request.open('GET', self.fixturesPath + url, true);
			request.send(null);
		},

		/**
		 * Get the parsed content of a fixture from cache. URL must be as same as passed to load()
		 * method
		 *
		 * @param {String} url 		URL of a previously loaded fixture
		 * @return {Object|null} 	Parsed JSON
		 */
		get: function(url) {
			if (url in this.$$fixturesCache) {
				return this.$$fixturesCache[url];
			}

			return null;
		},

		/**
		 * Reset fixtures cache
		 */
		cleanup: function() {
			this.$$fixturesCache = {};
		}
	};

	afterEach(function() {
		if (jasmine.currentFixtures) {
			jasmine.currentFixtures.cleanup();
		}
	});

}(window, window.jasmine, window.JSONHttpRequest));
