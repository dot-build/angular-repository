angular.module('integration').controller('ProductListController', function(ProductRepository) {
	var vm = this;

	var context = ProductRepository.createContext('list');
	context.initialize();
	// context.update();

	vm.context = context;
});
