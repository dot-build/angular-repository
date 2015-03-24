# angular-repository

A layer to abstract the data transport on higher level components (controllers, directives...).

## Introduction

This library implements a thin layer of abstraction between service endpoints and consumers who need
to do data manipulation (CRUD). It is best used with RESTful backend providers.

## DataProviderInterface

The actual communication with any kind of service is done with a `DataProvider`, which implements
the methods defined in the `DataProviderInterface`. 

Each method has the responsibility of do server calls and return a `Promise`. The methods are:

* find(endpoint, id)
* findAll(endpoint, parameters)
* save(endpoint, entity)
* saveAll(endpoint, entitySet)
* remove(endpoint, id)
* removeAll(endpoint, ids)

## Repository

`Repository` is the actual top-level API consumable by other parts of the app. It has the following methods:

* findOne(endpoint, id)
* findAll(query)
* save(endpoint, entity)
* saveAll(endpoint, entities)
* remove(endpoint, id)
* removeAll(endpoint, ids)

It all starts with the `RepositoryManager`, where a `Repository` is registered.

You must register a repository to each resource existing in the backend.

To ensure the configuration is correct, you must create a `RepositoryConfig` instance to define the
repository parameters. Each repository performs some operations using a `DataProvider` object, which
is passed in as a configuration to this instance.

Here's an example:

```javascript

// MyBackendProvider is an extension of DataProvider that implements the communication
// User is the repository name. When you inject a repository, the name is added with a `Repository` suffix
// so the final name will be `UserRepository` for *injection only*.
// The repository can also be found with RepositoryManager.getRepository('User');
var userConfig = new RepositoryConfig({
	name: 'User',
	dataProvider: MyBackendProvider
});

// Here you are registering this repository
RepositoryManager.addRepository(userConfig);

```

## Using the registered Repository

The most common operations can be done directly in the repository, such as create, update, retrieve
or remove entities. 

The only one that has a different mechanism is the search, which is done through
context objects, called `RepositoryContext`, or via QueryBuilders.

The query builders are a light object containing only the parameters required to perform a search.

The RepositoryContext are an extension of queries, maintaining also the data that comes from backend
whenever a parameter changes, or the last error.

Each context is created only once, and it lasts in the manager until you manually destroy it, 
so you won't lose the context state on page changes (except a full refresh with Ctrl+R), whereas
`QueryBuilder` instances are disposable.

Here's a context example:

```javascript

function ProductListController(ProductRepository) {
	var context = ProductRepository.getContext('product-list');

	// if this context was not created before, initialize it
	if (!context) {
		context = ProductRepository.createContext('product-list');
		context.initialize();
	}

	// triggers a context update to get up-to-date data
	context.update();

	this.context = context;
}

// assuming there's a $stateParams object with the productId to edit
function ProductEditController(ProductRepository, $stateParams) {
	var editor = this;
	ProductRepository.findOne(productId).then(function(product){
		editor.product = product;
	});

	editor.save = function() {
		ProductRepository.save(editor.product);
	};
}

```

In the list view our context object is exposed, so we have access to his state and current data:

```html
<div class="product-list">
	<div ng-repeat="product in context.data">
		<h2 ng-bind="product.name"></h2>
		<p ng-bind="product.description"></p>
	</div>
</div>
```

## Adding methods and properties to a Repository

During the repository creation additional methods and properties can be added:

```javascript
var repositoryConfig = new RepositoryConfig({
	name: 'product',
	dataProvider: MyDataProvider
});

var customProperties = {
	updateProductStatus: function(product, status) {
		product.status = status;
		return this.save(product);
	}
};

RepositoryManager.addRepository(repositoryConfig, customProperties);
```

Now if `ProductRepository` is injected anywhere it will have the `updateProductStatus` method

## API

The full API of each component is [listed here](https://github.com/darlanalves/angular-repository/blob/master/API.md)