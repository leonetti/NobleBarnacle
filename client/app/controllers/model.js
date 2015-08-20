angular.module('mimo.model', [])
  .controller('modelController', function ($scope, dataFactory, modelFactory){
  $scope.data = dataFactory.model;

  /*
  getModel makes makes an http request to get the model data from the 
  database. However, it only makes an http request one time on page
  load. After that the data is stored within dataFactory and can be
  called between an controller.

  Other controllers could have similar functions if you wanted to make
  specific http requests or POST data to the database. They would go here
  in this current implementation
  */
  $scope.getModel = function(){
    dataFactory.getModel().then(function(results){
      console.log('Recieved Model for user');
    })
  }
})
  .factory('modelFactory', function(){
    modelFactory = {};
      //place code for manipulation the employee data here

    return modelFactory;
})
  .directive('d3Model', ['$window', '$timeout', 'd3Service', 
    function($window, $timeout, d3Service) {
      return {
        restrict: 'ACE',
        scope: {
          data: "=" //this binds $scope.data to scope.data. Use scope.data inside D3
        },
        //run as a link directive rather that the compile directive
        //this runs once the html/directives are compiiled and they will
        //be ready to go when the view is loaded.
        link: function(scope, ele, attrs) {
          d3Service.d3().then(function(d3) {
            //place your D3 code here
            //IMPORTANT...
            //remember your code needs to operate on the scope.data object
          });
        }}
    }])
