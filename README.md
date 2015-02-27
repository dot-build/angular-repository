# angular-repository

A data layer to automate the transport of information from any source

## Introduction

This library implements a thin layer of abstraction between service endpoints and consumers who need
to do data manipulation (CRUD).

## DataProviderInterface

The actual communication with any kind of service is done with a `DataProvider`, which implements
the methods defined in the `DataProviderInterface`. Each method has the responsibility of do
server calls and return a `Promise`. The methods are:

* findAll(endpoint, parameters)
* findOne(endpoint, id)
* save(endpoint, entity)
* remove(endpoint, id)

## Repository

`Repository` is the top-level API consumable by other parts of the app. It has the following methods:

* createContext(contextName)
* removeContext(contextName)
* getContext(contextName)
* updateContext(context)
* findOne(endpoint, id)
* save(endpoint, entity)
* remove(endpoint, id)

It all starts with the `RepositoryManager`, where a `Repository` is created, using a 
`RepositoryConfig` to define its parameters. Each repository performs some operations
using a `DataProvider` object, which is passed in as a configuration.

The repositories are also registered in the `$injector`, and can later be injected into
controllers, services or other components.

```javascript
// the name 'Product' is used to create the injectable name 'ProductRepository'
// the repository can also be found with RepositoryManager.getRepository('Product');
var repositoryConfig = new RepositoryConfig({
	name: 'Product',
	endpoint: '/products',
	dataProvider: MyDataProvider
});

RepositoryManager.addRepository(repositoryConfig);
```

## Using the registered Repository

The most common operations can be done directly in the repository, such as create, update, retrieve
or remove entities. The only one that has a different mechanism is the search, which is done through
context objects, called `RepositoryContext`. Each context is created only once, and it lasts in the
manager until you manually destroy it, so you won't lose the context on page changes (except a full
refresh with Ctrl+R)

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
	endpoint: '/products',
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