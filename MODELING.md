+ Repository
	- create/read/update/delete/find items

+ Context
	- store search context for repository searches

+ Service
	- Abstraction of CRUD operations used inside repository

+ EntityManager
	- Manages named repositories and respective services
	- Provides a central point to access different resources

+ DataProvider
	- implements a interface to search items

+ context binding directives
	- uses the ngModel API to bind view-model changes to context updates