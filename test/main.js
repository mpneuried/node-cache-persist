(function() {
  var NodeCachePersist, _moduleInst, contentA, contentB, fs, path, should, testFile, writeCacheFile;

  path = require("path");

  fs = require("fs");

  should = require('should');

  NodeCachePersist = require("../.");

  _moduleInst = null;

  testFile = path.resolve("./test/testfile.json");

  contentA = {
    data: {
      "a": {
        v: 23,
        t: 0
      }
    },
    stats: {
      hits: 0,
      misses: 0,
      keys: 1,
      ksize: 1,
      vsize: 2
    }
  };

  contentB = {
    data: {
      "b": {
        v: 1337,
        t: 0
      },
      "c": {
        v: 666,
        t: Date.now() + 1000
      }
    },
    stats: {
      hits: 0,
      misses: 0,
      keys: 2,
      ksize: 1,
      vsize: 2
    }
  };

  writeCacheFile = function(content, cb) {
    fs.writeFile(testFile, JSON.stringify(content), function(err) {
      if (err) {
        cb(err);
        return;
      }
      cb();
    });
  };

  describe("----- node-cache-persist TESTS -----", function() {
    before(function(done) {
      writeCacheFile(contentA, (function(_this) {
        return function(err) {
          if (err) {
            throw err;
            done();
            return;
          }
          _moduleInst = new NodeCachePersist({
            filepath: testFile
          });
          done();
        };
      })(this));
    });
    after(function(done) {
      done();
    });
    describe('Main Tests', function() {
      it("read", function(done) {
        _moduleInst.read(function(err) {
          should.not.exist(err);
          _moduleInst.removeAllListeners("error");
          done();
        });
      });
      it("get 'a' test", function(done) {
        var res;
        res = _moduleInst.get("a");
        res.should.eql(23);
        done();
      });
      it("reset cache", function(done) {
        writeCacheFile(contentB, function(err) {
          if (err) {
            throw err;
            return;
          }
          _moduleInst.read(function(err) {
            should.not.exist(err);
            _moduleInst.removeAllListeners("error");
            done();
          });
        });
      });
      it("get 'a' test", function(done) {
        var res;
        res = _moduleInst.get("a");
        should.not.exist(res);
        done();
      });
      it("get 'b' test", function(done) {
        var res;
        res = _moduleInst.get("b");
        res.should.eql(1337);
        done();
      });
      it("get 'c' test", function(done) {
        var res;
        res = _moduleInst.get("c");
        res.should.eql(666);
        done();
      });
      it("get 'c' test after timeout", function(done) {
        this.timeout(5000);
        setTimeout(function() {
          var res;
          res = _moduleInst.get("c");
          should.not.exist(res);
          return done();
        }, 2000);
      });
      it("set 'x' to cache", function(done) {
        var res;
        res = _moduleInst.set("x", 42);
        res.should.ok;
        done();
      });
      it("write cache to disk", function(done) {
        _moduleInst.write(function(err) {
          if (err) {
            throw err;
          }
          done();
        });
      });
      it("check disk dump", function(done) {
        fs.readFile(testFile, function(err, content) {
          var _data;
          if (err) {
            throw err;
          }
          _data = JSON.parse(content);
          _data.should.have.property("data").and.have.property("x").and.have.property("v").and.eql(42);
          _data.should.have.property("stats").and.have.property("keys").and.eql(2);
          done();
        });
      });
    });
  });

}).call(this);
