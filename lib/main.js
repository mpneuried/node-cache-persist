(function() {
  var NodeCache, NodeCachePersist, _, fs, path,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require("lodash");

  path = require("path");

  fs = require("fs");

  NodeCache = require("node-cache");

  NodeCachePersist = (function(superClass) {
    extend(NodeCachePersist, superClass);


    /*	
    	## constructor
     */

    function NodeCachePersist(options) {
      this.write = bind(this.write, this);
      this._processCacheDump = bind(this._processCacheDump, this);
      this.read = bind(this.read, this);
      NodeCachePersist.__super__.constructor.apply(this, arguments);
      _.extend(this._ERRORS, this._PERRORS);
      this.filepath = path.resolve(options.filepath || "./node-cache.json");
      return;
    }


    /*
    	## read
    	
    	`nodecachepersist.read( host )`
    	
    	read the data from the configured `filepath`
    	
    	@param { Function } [cb] optional callback to catch errors. It's also possible to catch teh errors by the `error` event
    	
    	@api public
     */

    NodeCachePersist.prototype.read = function(cb) {
      fs.readFile(this.filepath, (function(_this) {
        return function(err, fileContent) {
          var _cerr;
          if (err) {
            _cerr = _this._error("EFILENOTFOUND", err);
            _this.emit("error", _cerr);
            if (cb != null) {
              cb(_cerr);
            }
            return;
          }
          _this._processCacheDump(fileContent, cb);
        };
      })(this));
    };


    /*
    	## _processCacheDump
    	
    	`nodecachepersist._processCacheDump( host )`
    	
    	process the datat from the dump file and replace the cache with the data from the dump
    	
    	@param { String } fileContent The content of the dump file
    	@param { Function } [cb] optional callback to catch errors. It's also possible to catch teh errors by the `error` event
    	
    	@api private
     */

    NodeCachePersist.prototype._processCacheDump = function(fileContent, cb) {
      var _cache, _cerr, err;
      try {
        _cache = JSON.parse(fileContent);
      } catch (_error) {
        err = _error;
        _cerr = this._error("EFILEPARSE", err);
        this.emit("error", _cerr);
        if (cb != null) {
          cb(_cerr);
        }
        return _cerr;
      }
      if ((_cache.stats == null) || (_cache.data == null)) {
        _cerr = this._error("EFILEINVALID", err);
        this.emit("error", _cerr);
        if (cb != null) {
          cb(_cerr);
        }
        return _cerr;
      }
      this.stats = _cache.stats;
      this.data = _cache.data;
      this.emit("reset");
      cb();
      return null;
    };


    /*
    	## write
    	
    	`nodecachepersist.write( host )`
    	
    	dump the cache to the configured `filepath`
    	
    	@param { Function } [cb] optional callback to catch errors. It's also possible to catch teh errors by the `error` event
    	
    	@api public
     */

    NodeCachePersist.prototype.write = function(cb) {
      var _cerr, _sData, err;
      try {
        _sData = JSON.stringify({
          stats: this.stats,
          data: this.data
        });
      } catch (_error) {
        err = _error;
        _cerr = this._error("ESTRINGIFYDATA", err);
        this.emit("error", _cerr);
        if (cb != null) {
          cb(_cerr);
        }
        return;
      }
      fs.writeFile(this.filepath, _sData, (function(_this) {
        return function(err) {
          if (err) {
            _cerr = _this._error("EWRITETOFILE", err);
            _this.emit("error", _cerr);
            if (cb != null) {
              cb(_cerr);
            }
            return;
          }
          cb(null);
          _this.emit("dumped");
        };
      })(this));
    };


    /*
    	## _PERRORS
    	
    	`nodecachepersist.ERRORS()`
    	
    	Error detail mapping extension
     */

    NodeCachePersist.prototype._PERRORS = {
      "EFILENOTFOUND": "The file defined in `options.filepath` was not found",
      "EFILEPARSE": "The file defined in `options.filepath` is not a valid json",
      "EFILEINVALID": "The file defined in `options.filepath` is not a valid node-cache dump",
      "ESTRINGIFYDATA": "It's not possibel to serialize the data. Please make sure you only cache simple values.",
      "EWRITETOFILE": "Cannot write dump to disk"
    };

    return NodeCachePersist;

  })(require("node-cache"));

  module.exports = NodeCachePersist;

}).call(this);
