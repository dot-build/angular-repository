angular.module('integration').controller('ProductListController', function(ProductRepository) {
	var vm = this;

	var context = ProductRepository.createContext('list');
	context.initialize();

	vm.context = context;
});
