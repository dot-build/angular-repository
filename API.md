

## DataProviderInterface
	::extend
	abstract methods
	can* methods


## RepositoryConfig
	constructor(Object options)


## Repository
	::extend
	constructor(Object config)
	createContext(String name)
	getContext(String name)
	removeContext(String name)
	findOne(String id)
	save(Object entity)
	remove(String id)
	updateContext(RepositoryContext context)


## RepositoryContextFilter
	::create
	constructor
	getFilter(String name)
	import(Array filters)
	where(String name, String operator, Mixed value)
	remove(String name)
	reset()
	toJSON()
	toArray()


## RepositoryContextSorting
	::create
	constructor
	add(Array sorting)
	sort(String name, String direction)
	invert(String name)
	remove(String name)
	reset()
	toJSON()
	toArray()


## RepositoryContextPagination
	::create
	constructor
	toJSON()
	setState(Object state)
	pageCount
	hasPrevious()
	hasNext()
	previous()
	next()
	first()
	last()
	reset()
	goToPage(Number page, Number [limit])


## RepositoryContext
	constructor(String name)
	initialize(Object filters, Object sorting, Object pagination)
	update()
	filters()
	sorting()
	pagination()
	reset()
	toJSON
	setData(Object dto)
	setError(Mixed error)


## RepositoryManager
	hasRepository(String name)
	addRepository(RepositoryConfig config, Object [properties])
	getRepository(String name)
