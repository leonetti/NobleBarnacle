/*
This is the MAIN Angular module for the entire application
Every other module for the different views/models are loaded as
dependencies. They are named with the following nameing convention:
      mimo.(data the model is in charge of)
      ie: mimo.model -> in charge of entire model visualization and analytics
          mimo.revenue -> in charge of only revenue specific visualizations and analysis
*/

var mimo = angular.module('mimo', [
  'ngRoute',
  'mimo.model', //model.js
  'mimo.employee', //employee.js
  'mimo.startup', //startup.js
  'mimo.debtAndEquity', //debtAndEquity.js
  'mimo.general', //general.js
  'mimo.revenue', //revenue.js
  'mimo.products', //products.js
]);

/*
Angular Routes

required: ngRoute injected above as a dependecy
*/
mimo.config(['$routeProvider', 
  function($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl: 'app/views/model.html',
        controller: 'modelController' //model.js
      }).
      when('/employee', {
        templateUrl: 'app/views/employee.html',
        controller: 'employeeController' // employee.js
      }).
      when('/startup', {
        templateUrl: 'app/views/startup.html',
        controller: 'startupController' //startup.js
      }).
      when('/equity', {
        templateUrl: 'app/views/debtAndEquity.html',
        controller: 'debtAndEquityController' //debtAndEquity.js
      }).
      when('/general', {
        templateUrl: 'app/views/general.html',
        controller: 'generalController' //general.js
      }).
      when('/revenue', {
        templateUrl: 'app/views/revenue.html',
        controller: 'revenueController' //revenue.js
      }).
      when('/products', {
        templateUrl: 'app/views/products.html',
        controller: 'productsController' //products.js
      })
  }
]);
/*
HTTP rquest factory.

Here is the logic for making a request to the express server for the entire
financial model.
By storing the HTTP results on the dataFactory onbject we can access the entire 
model in every controller without making extra HTTP requests to the server.
*/
mimo.factory('dataFactory', function ($http) {
  var dataFactory = {};
  dataFactory.madeServerRequest = false; //set to false initially
  dataFactory.getModel = function(){
    return $http({
      method: 'GET',
      url: '/model' //end point in express server where the entire model is returned
    }).then(function(results){
      dataFactory.madeServerRequest = true; //set to true so only one request is made
      dataFactory.model = results.data; //return the entire model to the modelFacory object.
    });
  }
  //don't forget to return the dataFactory object so that it can be accessed. 
  //you could refactor this into a service if you want. Only minor nuances between
  //the two in this application.
  return dataFactory;
});
/*
D3 as a service to angular (really its a factory)
This provides D3 as a factory to be used within custom built directives
inside each controller. D3 and angular have some issues playing nicely together
and there were performance issues loading it in the browser and have the D3 code
run/render properly on the ng-views. This allows D3 code to be written directly in 
a directive to render the visualizations seemlessly to the browser.

To utilize this service you'll have to set a .then() after you call D3.

ie: d3Service.d3().then(function(d3) { YOUR D3 CODE HERE });
*/
mimo.factory('d3Service', ['$document', '$window', '$q', '$rootScope',
  function($document, $window, $q, $rootScope) {
    var d = $q.defer(),
        d3service = {
          //return as a promise so we wait for D3 to load and render our scripts
          d3: function() { return d.promise; }
        };
  function onScriptLoad() {
    // Load client in the browser
    $rootScope.$apply(function() { d.resolve($window.d3); });
  }
  var scriptTag = $document[0].createElement('script');
  scriptTag.type = 'text/javascript'; 
  scriptTag.async = true;
  // scriptTag.src = 'http://d3js.org/d3.v3.min.js';
  scriptTag.src = '../bower_components/d3/d3.min.js';
  scriptTag.onreadystatechange = function () {
    if (this.readyState == 'complete') onScriptLoad();
  }
  scriptTag.onload = onScriptLoad;

  var s = $document[0].getElementsByTagName('body')[0];
  s.appendChild(scriptTag);

  return d3service;
}]);