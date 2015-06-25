# # NodeCachePersist

# ### extends [NPM:MPBasic](https://cdn.rawgit.com/mpneuried/mpbaisc/master/_docs/index.coffee.html)

#
# ### Exports: *Class*
#
# Extend node-cache to add the methods `.read()` and `.write()` to dump and load the cache to/from the disk.
# 

_ = require( "lodash" )


path = require( "path" )
fs = require( "fs" )

NodeCache = require( "node-cache" )

class NodeCachePersist extends require( "node-cache" )


	###	
	## constructor 
	###
	constructor: ( options )->
		super

		# extend the errors with the errors from this persist module
		_.extend( @_ERRORS, @_PERRORS )

		# process the options
		@filepath = path.resolve( options.filepath or "./node-cache.json" )
		return

	###
	## read
	
	`nodecachepersist.read( host )`
	
	read the data from the configured `filepath`
	
	@param { Function } [cb] optional callback to catch errors. It's also possible to catch teh errors by the `error` event
	
	@api public
	###
	read: ( cb )=>
		fs.readFile @filepath, ( err, fileContent )=>
			if err
				_cerr = @_error( "EFILENOTFOUND", err )
				@emit "error", _cerr
				cb( _cerr ) if cb?
				return
			@_processCacheDump( fileContent, cb )
			return
		return

	###
	## _processCacheDump
	
	`nodecachepersist._processCacheDump( host )`
	
	process the datat from the dump file and replace the cache with the data from the dump
	
	@param { String } fileContent The content of the dump file
	@param { Function } [cb] optional callback to catch errors. It's also possible to catch teh errors by the `error` event
	
	@api private
	###
	_processCacheDump: ( fileContent, cb )=>
		try
			_cache = JSON.parse( fileContent )
		catch err
			_cerr = @_error( "EFILEPARSE", err )
			@emit "error", _cerr
			cb( _cerr ) if cb?
			return _cerr

		if not _cache.stats? or not _cache.data?
			_cerr = @_error( "EFILEINVALID", err )
			@emit "error", _cerr
			cb( _cerr ) if cb?
			return _cerr


		@stats = _cache.stats
		@data = _cache.data

		@emit "reset"
		cb()
		return null

	###
	## write
	
	`nodecachepersist.write( host )`
	
	dump the cache to the configured `filepath`
	
	@param { Function } [cb] optional callback to catch errors. It's also possible to catch teh errors by the `error` event
	
	@api public
	###
	write: ( cb )=>
		try
			_sData = JSON.stringify( { stats: @stats, data: @data } )
		catch err
			_cerr = @_error( "ESTRINGIFYDATA", err )
			@emit "error", _cerr
			cb( _cerr ) if cb?
			return

		fs.writeFile @filepath, _sData, ( err )=>

			if err
				_cerr = @_error( "EWRITETOFILE", err )
				@emit "error", _cerr
				cb( _cerr ) if cb?
				return
			cb(null)
			@emit "dumped"
			return

		return

	###
	## _PERRORS
	
	`nodecachepersist.ERRORS()`
	
	Error detail mapping extension

	###
	_PERRORS:
		"EFILENOTFOUND": "The file defined in `options.filepath` was not found"
		"EFILEPARSE": "The file defined in `options.filepath` is not a valid json"
		"EFILEINVALID": "The file defined in `options.filepath` is not a valid node-cache dump"
		"ESTRINGIFYDATA": "It's not possibel to serialize the data. Please make sure you only cache simple values."
		"EWRITETOFILE": "Cannot write dump to disk"


#export this class
module.exports = NodeCachePersist