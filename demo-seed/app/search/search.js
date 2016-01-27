'use strict';

angular.module("groupByDemo.search",['ui.bootstrap'])
	.controller('searchCtrl', ['$scope', '$uibModal', 'apiService', '$routeParams', '$filter', 
			function ($scope, $uibModal, apiService, $routeParams, $filter) {

		$scope.currentPage = 1;

		var view_model = this;

		view_model.refinements = [];
		view_model.query = $routeParams.query;
		view_model.pageSize = 30;
		view_model.resultSummary =  "";
		view_model.navigation = {};

	    $scope.sortFields = [
	        {'display': 'Relevancy', 			'field': '_relevance', 	'order' : 'Descending'},
	        {'display': 'Price - Low to High', 	'field': 'price', 		'order' : 'Ascending'},
	        {'display': 'Price - High to Low', 	'field': 'price', 		'order' : 'Descending'},
	        {'display': 'Rating', 				'field': 'Qrating', 	'order' : 'Descending'}
	    ];

		//augment the navigation with additional info needed to render
		view_model.updateNavModel = function(navModel, navFromSearch, selectedRefinements){

			angular.forEach(navFromSearch, function(nav){

				navModel[nav.displayName] = navModel[nav.displayName] || {};
				var model = navModel[nav.displayName];
				model.raw = nav;

				if(!nav.range) { return; }

				//keep existing values if a refinement is already applied
				var currentVal = $filter('filter')(selectedRefinements, { navigationName : nav.name, type : 'Range'});	
				console.log(currentVal);
				if(currentVal.length > 0) { return; }

				var lo_bucket = 0;
				var hi_bucket = 0;
				// get the smallest and largest buckets
				angular.forEach(nav.refinements, function(ref){
					lo_bucket = Math.min(ref.low, lo_bucket);
					hi_bucket = Math.max(ref.high, hi_bucket);
				});

				model.slider = {
					min : currentVal.length > 0 ? currentVal[0].low : lo_bucket,  
					max : currentVal.length > 0 ? currentVal[0].high : hi_bucket,
					options : { 
						id : nav.name, 
						floor: lo_bucket, 
						ceil: hi_bucket,
						onEnd: function(id, low, high) {
							console.log(id + " " + low + " " + high);
							view_model.refine(id, { low : low, high : high }, 'Range');
						}
					}
				} 
			});

			return navModel;

		}

		view_model.search = function () {

			var sortParam = {};

			// Don't set sort if it's not initialized, meaning when 
			//	this function is called. Defaults to relevance, so that
			//	should be the first parameter always.
			if(typeof $scope.sort !== 'undefined'){
				sortParam.field = $scope.sort.field;
				sortParam.order = $scope.sort.order;
			}
			else {
				sortParam.field = '_relevance';	
			}

			var parameters = {
				skip : view_model.pageSize * ($scope.currentPage - 1),
				pageSize : view_model.pageSize,
				query : view_model.query,
				refinements : view_model.refinements,
				sort: sortParam
			};

		  	apiService.search(parameters).success(function(data){
				view_model.totalRecordCount = data.totalRecordCount;
				view_model.resultList = data.records;
				view_model.navigation = view_model.updateNavModel(view_model.navigation, data.availableNavigation, view_model.refinements );
				view_model.selectedNavigation = data.selectedNavigation;

				var firstResult = view_model.pageSize * ($scope.currentPage - 1) + 1;
				var lastResult =  Math.min( firstResult + view_model.pageSize - 1, view_model.totalRecordCount);
				view_model.resultSummary =  firstResult.toString() + " - " + lastResult.toString() + " of " +  view_model.totalRecordCount.toString() + " Products";

				console.log(data);
				console.log(view_model);

			});
		};

		view_model.refine = function(navigation, refinement_value, type) {

			console.log("add refinement: " + navigation + " -->  " + refinement_value);
			
			var refinement = {}
			refinement.type = type;
			refinement.navigationName = navigation;
			
			switch(type){
				case "Range":
					refinement.low = refinement_value.low;
					refinement.high = refinement_value.high;

					//remove any existing values for this refinement
					view_model.refinements = $filter('filter')(view_model.refinements, function(o) { 
						return !(o.navigationName === navigation && o.type === "Range")
					});	

					break;
				case "Value":
					refinement.value = refinement_value;
					break;
			}

			view_model.refinements.push( refinement );

			view_model.search();
		}

		view_model.unrefine = function(navigation, refinement_value) {

			console.log("remove refinement: " + navigation + " -->  " + refinement_value);

			view_model.refinements = $filter('filter')(view_model.refinements, function(o) { 
				return !(o.navigationName === navigation && o.value === refinement_value)
			});	

			view_model.search();
		} 

		view_model.inspect = function(product_id){

			console.log(product_id);

			var modalInstance = $uibModal.open({
			  animation: true,
			  templateUrl: "/inspect/inspect.tpl.html",
			  controller: "inspectCtrl as inspect",
			  size: "lg",
			  resolve : {
			  	id : function () { return product_id; }
			  }
			});
		}

		view_model.search();

	}])