'use strict'
angular.module('NeolantApp', [])

.config(['storageProvider', (storageProvider) => {
	storageProvider.setUseLocalStorage(true)
}])


.provider('storage', function(){
	let useLocalStorage = false
	return {
		setUseLocalStorage: (b) => useLocalStorage = b,

		$get: ['$http', function($http){
			return {
				useLocalStorage: useLocalStorage,


				addItem: function(newItem){
					if(useLocalStorage){
						return new Promise((resolve, reject) => {
							let currentItems = []
							if (localStorage.getItem('items')){
								currentItems = JSON.parse(localStorage.getItem('items'))
							}
							currentItems.push(newItem)
							try {
								localStorage.setItem('items', JSON.stringify(currentItems))
								setTimeout(
									() => resolve(JSON.parse(localStorage.getItem('items'))),
									1000
								)

							} catch (e){
								reject('Error')
							}
						})
					}
					else {
						return $http.post('api/v1/add', newItem)
					}
				},


				getItems: function() {
					if(useLocalStorage) {
						return new Promise(
							(resolve) => {
								setTimeout(
									() => resolve(JSON.parse(localStorage.getItem('items'))), 1000
								)
							}
						)
					}
					else {
						return $http.get('api/v1/get')
					}
				}
			}
		}]
	}
})


.controller('MainCtrl', ['$scope', 'storage', function($scope, storage) {
	$scope.activeItemIndex = 0

	$scope.newItemName = ''
	$scope.newItemDesc = ''
	$scope.isLoading = true

	$scope.items = []

	this.$onInit = () => this.getItems()


	this.getItems = function() {
		$scope.isLoading = true
		storage.getItems()
		.then(
			items => {
				$scope.items = items
				$scope.isLoading = false
				$scope.$digest()
			},
			data => {
				console.log('error:', data)
			}
		)
	}


	$scope.setItemActive = function($index){
		$scope.activeItemIndex = $index
	}


	$scope.addNewItem = () => {
		$scope.isLoading = true
		storage.addItem({
			name: $scope.newItemName,
			description: $scope.newItemDesc
		})
		.then(
			(data) => {
				$scope.items = data
				$scope.newItemName = ''
				$scope.newItemDesc = ''
				$scope.isLoading = false
				$scope.$digest()
			},
			data => {
				$scope.isLoading = false
				console.log(data)
			}
		)
	}


}])
