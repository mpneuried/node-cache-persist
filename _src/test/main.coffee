path = require( "path" )
fs = require( "fs" )
should = require('should')

NodeCachePersist = require( "../." ) 
_moduleInst = null

testFile = path.resolve( "./test/testfile.json" )

contentA = 
	data: 
		"a": 
			v: 23
			t: 0
	stats: 
		hits: 0
		misses: 0
		keys: 1
		ksize: 1
		vsize: 2

contentB = 
	data: 
		"b": 
			v: 1337
			t: 0
		"c": 
			v: 666
			t: Date.now() + 1000
	stats: 
		hits: 0
		misses: 0
		keys: 2
		ksize: 1
		vsize: 2

writeCacheFile = ( content, cb )->
	fs.writeFile testFile, JSON.stringify( content ), ( err )->
		if err
			cb( err )
			return
		cb()
		return
	return



describe "----- node-cache-persist TESTS -----", ->

	before ( done )->
		# TODO add initialisation Code
		writeCacheFile contentA, ( err )=>
			if err
				throw err
				done()
				return

			_moduleInst = new NodeCachePersist( { filepath: testFile } )
			done()
			return

		return

	after ( done )->
		#  TODO teardown
		done()
		return

	describe 'Main Tests', ->

		it "read", ( done )->
			_moduleInst.read ( err )->
				should.not.exist( err )
				_moduleInst.removeAllListeners( "error" )
				done()
				return
			return

		it "get 'a' test", ( done )->
			res = _moduleInst.get( "a" )
			res.should.eql( 23 )
			done()
			return

		it "reset cache", ( done )->
			writeCacheFile contentB, ( err )->
				if err
					throw err
					return
				_moduleInst.read ( err )->
					should.not.exist( err )
					_moduleInst.removeAllListeners( "error" )
					done()
					return
				return
			return

		it "get 'a' test", ( done )->
			res = _moduleInst.get( "a" )
			should.not.exist( res )
			done()
			return

		it "get 'b' test", ( done )->
			res = _moduleInst.get( "b" )
			res.should.eql( 1337 )
			done()
			return

		it "get 'c' test", ( done )->
			res = _moduleInst.get( "c" )
			res.should.eql( 666 )
			done()
			return

		it "get 'c' test after timeout", ( done )->
			@timeout( 5000 )
			setTimeout( ->
				res = _moduleInst.get( "c" )
				should.not.exist( res )
				done()
			, 2000 )
			return

		it "set 'x' to cache", ( done )->
			res = _moduleInst.set( "x", 42 )
			res.should.ok
			done()
			return

		it "write cache to disk", ( done )->
			_moduleInst.write ( err )->
				if err
					throw err
				done()
				return
			return

		it "check disk dump", ( done )->
			fs.readFile testFile, ( err, content )->
				if err
					throw err

				_data = JSON.parse( content )
				_data.should
					.have.property( "data" )
					.and.have.property( "x" )
					.and.have.property( "v" )
					.and.eql( 42 )

				_data.should
					.have.property( "stats" )
					.and.have.property( "keys" )
					.and.eql( 2 )

				done()
				return
			return

		return
	return