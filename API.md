

## DataProviderInterface

	extend(Object prototype)
	findOne(), findAll(), remove(), save() - abstract methods
	canGet(endpoint, id)
	canList(endpoint, id)
	canSave(endpoint, entity)
	describe('canRemove(endpoint, id)


## RepositoryConfig

	constructor(Object options)


## Repository

	extend(Object [prototype])
	constructor(Object config)
	createContext(String name)
	getContext(String name)
	removeContext(String name)
	
	findOne(String id)
	save(Object entity)
	remove(String id)
	createQuery()
	findAll(QueryBuilder query)
	updateContext(RepositoryContext context)


## RepositoryContextFilter

	operators: LT, LTE, GT, GTE, IN, EQ, LK, ST, END
	constructor()
	create(Object[] filters)
	getFilter(String name)
	import(Array filters)
	where(String name, String operator, Mixed value)
	remove(String name)
	reset()
	toJSON()
	toArray()


## RepositoryContextSorting

	directions: ASC DESC
	constructor
	create
	add(Array sorting)
	sort(String name, String direction)
	invert(String name)
	remove(String name)
	reset()
	toJSON()
	toArray()
	getSorting(String name)
	hasSorting(String name)


## RepositoryContextPagination

	create
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
	toJSON()
	setData(Object dto)
	setError(Mixed error)


## QueryBuilder

	create()
	from(String repository)
	where(name, operator, value)
	sort(name, direction)
	limit(Number limit)
	skip(Number skip)
	toJSON()


## RepositoryManager

	hasRepository(String name)
	addRepository(RepositoryConfig config, Object [properties])
	getRepository(String name)
	executeQuery(QueryBuilder query)
