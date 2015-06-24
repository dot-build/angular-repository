

## Repository

	:: extend(Object [prototype])
	# constructor(Object config)
	# createContext(String name)
	# getContext(String name)
	# removeContext(String name)
	# find(String id)
	# save(Object entity)
	# saveAll(Object[] entities)
	# remove(String id)
	# removeAll(String[] id)
	# createQuery()
	# where()
	# findAll(QueryBuilder query)
	# findBy(String field, value)
	# updateContext(RepositoryContext context)


## ContextQueryBuilder

	# constructor()
	# queue()
	# exec


## RepositorySorting

	:: ASC & ::DESC - directions
	:: create
	# constructor
	# add(Array sorting)
	# sort(String name, String direction)
	# invert(String name)
	# remove(String name)
	# reset()
	# toJSON()
	# toArray()
	# getSorting(String name)
	# hasSorting(String name)


## QueryBuilder

	:: create()
	# from(String repository)
	# where(name, operator, value)
	# sort(name, direction)
	# limit(Number limit)
	# skip(Number skip)
	# page(Number page, Number [limit])
	# reset()
	# toJSON()
	


## RepositoryManager

	# hasRepository(String name)
	# addRepository(RepositoryConfig config, Object [properties])
	# getRepository(String name)
	# executeQuery(QueryBuilder query)


## RepositoryQueryBuilder

	# constructor()
	# exec


## RepositoryFilter

	:: operators: LT, LTE, GT, GTE, IN, EQ, LK, ST, END
	:: create(Object[] filters)
	# constructor()
	# getFilter(String name)
	# setState(Array filters)
	# where(String name, String operator, Mixed value)
	# remove(String name)
	# reset()
	# toJSON()
	# toArray()


## DataProviderInterface

	:: extend(Object prototype)
	@ find(), findAll(), remove(), removeAll(), save(), saveAll() - abstract methods


## RepositoryPagination

	:: defaults
	:: create()
	# constructor()
	# toJSON()
	# setState(Object state)
	. pageCount
	# hasPrevious()
	# hasNext()
	# previous()
	# next()
	# first()
	# last()
	# reset()
	# goToPage(Number page, Number [limit])


## RepositoryConfig

	# constructor(Object options)


## RepositoryContext

	# constructor(String name)
	# initialize(Object filters, Object sorting, Object pagination)
	# update()
	# setTimeout(Number timeout)
	# filters()
	# sorting()
	# pagination()
	# reset()
	# toJSON()
	# setData(Object dto)
	# setError(Mixed error)
