angular.module('login', ['lbServices'])

.controller('loginController', function ($scope, User){
  $scope.email = "";
  $scope.password = "";
  $scope.login = function(){
    User.login({
      email: $scope.email,
      password: $scope.password
    }, function(data){
      console.log("success");
      // $location.path("/index.html"); 
      window.location = "/index.html";
      // $scope.$apply(function() {
      //   $location.path("/home"); 
      // });
    }, function(){
      console.log("fail");
      // window.location = '/index.html';
      // $scope.$apply(function() {
        // $location.path("/home"); 
        // $location.absUrl() == 'localhost:3000/index.html'
      // });
      //   $location.path() == '/a'
      // }
      // window.location.href = "localhost:3000/index.html";
      // window.location = "#/employee";
      // $scope.$apply(function() {
      //   $location.path("/index.html"); 
      //   $location.replace();
      // });
      // $location.path('/index.html')
      // $location.replace();
    });   
  }
});