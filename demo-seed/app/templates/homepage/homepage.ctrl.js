'use strict';

angular.module('groupByDemo.templates', [])
	.controller('homepageCtrl', [ 'apiService', 'sharedData', function(apiService, sharedData){

		var vm = this;

		sharedData.query = "";

		vm.zonemapping = ["TL","TM","TR","BL","BM","BR"];

		var parameters = {
			pageSize : 0,
			query : "",
			customUrlParams: [ { key: "page", value: "home" } ] ,
			fields : "",
		};

		  	console.time("search");
	  	apiService.search(parameters).success(function(data){
	  		console.timeEnd("search");

	  		vm.content = data.template.zones;

			console.log(data);
		});

	}]);