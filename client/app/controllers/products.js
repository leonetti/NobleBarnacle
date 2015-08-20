/*
Angular module for products within the financial model

$scope.data -> contains the data related to products data for the
                        financial model. Accessed from the dataFactory object
                        without an extra HTTP request.

RECALL: Within dataFactory.model you have access to the entire model here if you need
        any of that information for analytics or visulaizations. We've only pulled in
        the specific information for display. 
*/

angular.module('mimo.products', ['lbServices'])
  .controller('productsController', function ($scope, dataFactory, productsFactory){
    productsFactory.get(function(data){
      // console.log("YO", dataFactory.model);
      // data.then();
      $scope.data = data; 
      console.log(data) 
    });
  // $scope.data = dataFactory.model.products;
})
  .factory('productsFactory', function(Product){
    productsFactory = {
      get: function(cb) {
        Product.find({filter: { limit: 10 }},function(response) {
          cb(response);
          console.log("response", response);
        }, function(error) {
          
        });
      }
    };
    return productsFactory;
})
  .directive('d3Products', ['$window', '$timeout', 'd3Service', 
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
          var unwatch = scope.$watchCollection('data', function(newValue, oldValue) {
              console.log('data')
              if(newValue){
                console.log("yoo", newValue)
                init();
                unwatch(); 
              }
            });

          function init() {
            d3Service.d3().then(function(d3) {
              //place your D3 code here
              //IMPORTANT...
              //remember your code needs to operate on the scope.data object
              /*****************************************
              /* Function to prep raw db data for d3
              /****************************************/

              /*
              params: product
              returns: array of objects that represent one month, 
                [{month1}, {month2}, .... , {monthn}]
                each has the following properties
                => index
                => sales: number of units sold for that month
                => revenue: revenue for the month
                => netRevenue: sum of all revenue to date
                => cog: cost of goods sold
                => netCog: sum of all cogs to date
                => commiss: total commissions paid for the month
                => netCommiss: sum of all commiss to date
                => gp: gross profit for the month
                => newGp: sum of all gross profit to date
                => gpm: gropss profit margin for the month
              */

              var prepProductData = function(product) {
                var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                //set up the object
                var data = [];
                data.pricePerUnit = product.pricePerUnit;
                data.gp = product.pricePerUnit - product.costOfProductionPerUnit;
                data.commission = product.commission;
                //go through each year in order
                product.years.forEach(function(year, i) {
                  //go through the monthlySales in order
                  months.forEach(function(month, j) {
                    var newMonth = {};
                    var index = (i * 12) + j;
                    newMonth.i = index;
                    newMonth.sales = product.sales[year][month];
                    newMonth.revenue = newMonth.sales * product.pricePerUnit;
                    newMonth.netRevenue = newMonth.revenue + (data[index - 1] ? data[index - 1].netRevenue : 0);
                    newMonth.cog = newMonth.sales * product.costOfProductionPerUnit;
                    newMonth.netCog = newMonth.cog + (data[index - 1] ? data[index - 1].netCog : 0);
                    newMonth.commiss = newMonth.revenue * product.commission;
                    newMonth.netCommiss = newMonth.commiss + (data[index - 1] ? data[index - 1].netCommiss : 0);
                    newMonth.gp = newMonth.revenue - newMonth.cog; 
                    newMonth.netGp = newMonth.gp + (data[index - 1] ? data[index - 1].netGp : 0);
                    newMonth.gpm = newMonth.netRevenue / newMonth.gp;
                    data.push(newMonth);
                  })
                })
                return data;
              }


              var data = prepProductData(scope.data[0]);

              /*****************************************
              /* General Settings for chart
              /****************************************/

              //settings for chart
              var margin = {top: 20, right: 40, bottom: 15, left: 150}, 
                  width = 1100 - margin.left - margin.right,
                  height = 720 - margin.top - margin.bottom, 
                  miniHeight = 200,
                  mainHeight = height - miniHeight - 50,
                  unitsSoldHeight = mainHeight * .2
                  barHeight = mainHeight - unitsSoldHeight;
                  barsPadding = 1; 

              //X scale for the mini display
              var x0 = d3.scale.linear().domain([0, data.length]).range([0, width]);
              //X scale for main display
              var x1 = d3.scale.linear().domain([0, data.length]).range([0, width]);
              //Y scale for the mini display
              var y0 = d3.scale.linear().domain([0, d3.max(data, function(data){ return data.netRevenue; })]).range([0, miniHeight]);
              //Y scale for the main display
              var y1 = d3.scale.linear().domain([0, d3.max(data, function(data){ return data.netRevenue })]).range([0, barHeight]);

              /*****************************************
              /* Draw the main groups
              /****************************************/

              //group that will hold all the other groups
              var chart = d3.select(ele[0])
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .attr('class', 'chart');

              // chart.append('defs')
              //       .append('clipPath')
              //       .attr('id', 'clip')
              //         .append('rect')
              //           .attr('width', width)
              //           .attr('height', mainHeight);

              //Create the group for the main view
              var main = chart.append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .attr('width', width)
                .attr('height', mainHeight)
                .attr('class', 'main');

              //Create the group for the mini view
              var mini = chart.append('g')
                .attr('transform', 'translate(' + margin.left + ',' + (mainHeight + 60) + ')')
                .attr('width', width)
                .attr('height', miniHeight)
                .attr('class', 'mini');

              //Create the group for the units sold
              var unitsSold = main.append('g')
                .attr('width', width)
                .attr('height', unitsSoldHeight)
                .attr('fill', '8E44AD')
                .attr('class', 'unitsSold');

              //Create the group for the main bars
              var mainBars = main.append('g')
                .attr('transform', 'translate(' + margin.left + ',' + (margin.top + unitsSoldHeight) + ')') 
                .attr('width', width)
                .attr('height', mainHeight - unitsSoldHeight)
                .attr('class', 'mainBars');

              var update = function(data) {
              // draw the vertical lines for the main chart
              main.append('g').selectAll('.monthLine')
                .data(data)
                .enter().append('line')
                .attr('x1', function(d) { return x1(d.i) })
                .attr('y1', 0)
                .attr('x2', function(d) { return x1(d.i) })
                .attr('y2', mainHeight)
                .attr('class', 'monthLine')
                .attr('stroke', 'lightgray');

              /*****************************************
              /* Draw left sidebar lables on the chart
              /****************************************/

              //units sold label
              chart.append('text')
                .text('Units Sold')
                .attr('x', margin.left / 2 )
                .attr('text-anchor', 'middle')
                .attr('y', unitsSoldHeight / 2);

              //product settings label
              var productLabel = chart.append('g')
                .attr('class', 'product-params')
                .attr('transform', 'translate(0,' + ((barHeight / 2) - 100) + ')');

              productLabel.append('text')
                .text('Price: $' + data.pricePerUnit)
                .attr('text-anchor', 'middle')
                .attr('x', margin.left / 2);

              productLabel.append('text')
                .text('GP: $' + data.gp)
                .attr('text-anchor', 'middle')
                .attr('y', 20)
                .attr('fill', '#2ECC71')
                .attr('x', margin.left / 2);

              productLabel.append('text')
                .text('Commission: ' + data.commission)
                .attr('text-anchor', 'middle')
                .attr('y', 40)
                .attr('fill', '#F39D11')
                .attr('x', margin.left / 2);

              //Create groups for each month
              var monthGroups = unitsSold.selectAll('.monthGroup')
                .data(data)
                .enter().append('g')
                .attr('class', 'monthGroup')
                .attr( 'width', (x1(1) - x1(0)) )
                .attr('height', mainHeight)
                .attr('transform', function(d){ return 'translate(' + x1(d.i) + ',' + 0 + ')' });

              /*****************************************
              /* Draw circles in the main view
              /****************************************/

              //append groups for the circles
              var circleGroups = monthGroups.append('g')
                .attr( 'class', 'circleGroup' )
                .attr( 'width', (x1(1) - x1(0)) )
                .attr( 'height', (x1(1) - x1(0)) );

              //draw the green circles
              circleGroups.append('circle')
                .attr( 'r', (x1(1) - x1(0)) * .4 )
                .attr( 'cx', (x1(1) - x1(0)) / 2 )
                .attr('cy', (x1(1) - x1(0)) / 2 )
                .attr('class', 'unitsSold')
                .attr('fill', '#2ECC71');

              //draw the text for the amount of units sold
              circleGroups.append('text')
                  .text(function(d){ return "" + d.sales })
                  .attr('text-anchor', 'middle')
                  .attr('x', (x1(1) - x1(0)) / 2 )
                  .attr('y', ((x1(1) - x1(0)) / 2) + 5)
                  .on('click', function(d){ 
                    d.sales = 150; 
                    console.log(d);
                    update(d);
                  });

              /*****************************************
              /* Draw bars in the main view
              /****************************************/

              //create the groups for the bars
              var barGroups = monthGroups.append('g')
                .attr('class', 'barGroups')
                .attr( 'width', (x1(1) - x1(0)) )
                .attr('height', mainHeight - unitsSoldHeight);

              //draw the commission rectangles
              barGroups.append('rect')
                .attr('width', (x1(1) - x1(0)) )
                .attr('height', function(d){ return y1(d.netCommiss) })
                .attr('y', function(d){ return mainHeight - y1(d.netCommiss) })
                .attr('fill', '#F39D11');

              //draw the cog rectangles
              barGroups.append('rect')
                .attr('width', (x1(1) - x1(0)) )
                .attr('y', function(d){ return mainHeight - y1(d.netCommiss) - y1(d.netCog) })
                .attr('fill', '#E74C3C')
                .attr('height', 0)
                .transition()
                .attr('height', function(d){ return y1(d.netCog) })
                .duration(1000);

              //draw the gross product
              barGroups.append('rect')
                .attr('width', (x1(1) - x1(0)) )
                .attr('y', function(d){ return mainHeight - y1(d.netCommiss) - y1(d.netCog) -y1(d.netGp) })
                .attr('fill', '#2ECC71')
                .attr('height', 0)
                .transition()
                .attr('height', function(d){ return y1(d.netGp) })
                .duration(1000);

              };

              update(data);


            });
          }
        }}
    }])
