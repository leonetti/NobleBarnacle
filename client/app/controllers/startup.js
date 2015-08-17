/*
Angular module for start up costs within the financial model

$scope.data -> contains the data related to start up costs for the
                        financial model. Accessed from the dataFactory object
                        without an extra HTTP request.

RECALL: Within dataFactory.model you have access to the entire model here if you need
        any of that information for analytics or visulaizations. We've only pulled in
        the specific information for display. 
*/

angular.module('mimo.startup', [])
  .controller('startupController', function ($scope, dataFactory, startupFactory){
  $scope.data = dataFactory.model.expenses.startupCosts;
})
  .factory('startupFactory', function(){
    startupFactory = {};
      //place code for manipulation the products data here

    return startupFactory;
})
  .directive('d3Startup', ['$window', '$timeout', 'd3Service', 
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




            /*****************************************
            /* Helper Functions
            /****************************************/

            //filter keys
            //takes an array of objects and a key
            //returns a unique-sorted array of the values for that key
            var getKeysInArray = function(array, key) {
              var keys = {};
              array.forEach(function(obj){
                keys[obj[key]] = true;
              });
              return Object.keys(keys);
            };

            //Find first month
            //return the index for the first month of the given year
            var findFirstMonth = function(item, year) {
              var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

              return months.indexOf(Object.keys(item.money[year]));
            };

            //Find last month
            //return the index for the last month of the given year
            var findLastMonth = function(item, year) {
              var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

              return months.indexOf(item.endDate.month);
            };

            /*****************************************
            /* End Helper Functions
            /****************************************/

            //Build the items

            var buildItems = function(general, lanes){
              var items = [];
              general.forEach(function(item){
                var newItem = {};
                var firstYear = parseInt(Object.keys(item.money));

                var firstMonth = findFirstMonth(item, firstYear);

                newItem.start = new Date(firstYear, firstMonth);
                newItem.end = new Date(firstYear + 2, firstMonth);
                newItem.id = item.name;
                newItem.category = item.name;
                newItem.class = 'past ' + item.name;
                newItem.lane = whichLane(item, lanes);
                items.push(newItem);
              });
              return items;
            };

            //set up the lanes, the lanes are the categories each item will go into
            var buildLanes = function(general) {
              var categories = getKeysInArray(general, 'name');
              var lanes = [];
              var id = 0;
              categories.forEach(function(category){
                var obj = {label: category, id: id};
                lanes.push(obj);
                id++;
              });
              return lanes;
            };

           2
            var whichLane = function(item, lanes){
              // console.log(item)
              // console.log(lanes)
              for(var i = 0; i < lanes.length; i++){
                if(lanes[i].label === item.name){
                  return lanes[i].id;
                }
              }
            };
            
            //set up the lanes
            var lanes = buildLanes(scope.data);
            //console.log(lanes);

            //set up the items
            var items = buildItems(scope.data, lanes);




            var now = new Date();

            //settings for chart
            var margin = {top: 20, right: 90, bottom: 15, left: 150}
              , width = 1740 - margin.left - margin.right
              , height = 600 - 50 - margin.top - margin.bottom
              , miniHeight = lanes.length * 12 + 70
              , mainHeight = height - miniHeight - 50;

            //time scale for the mini display
            var x = d3.time.scale()
              .domain([d3.time.month(d3.min(items, function(d) { return d.start; })),
                   d3.max(items, function(d) { return d.end; })])
              .range([0, width]);

            //time scale for main display
            var x1 = d3.time.scale().range([0, width]);

            var ext = d3.extent(lanes, function(d) { return d.id; });
            var y1 = d3.scale.linear().domain([ext[0], ext[1] + 1]).range([0, mainHeight]);
            var y2 = d3.scale.linear().domain([ext[0], ext[1] + 1]).range([0, miniHeight]);


            //creates the SVG element everything will go into
            var chart = d3.select(ele[0])
              .append('svg')
              // .attr('width', '100%')
              .attr('width', width - 100)
              .attr('height', height)
              // .attr('height', height + margin.top + margin.bottom)
              .attr('class', 'chart');


            chart.append('defs').append('clipPath')
              .attr('id', 'clip')
              .append('rect')
                .attr('width', width)
                .attr('height', mainHeight);
              //creates the main grouping element for the larger lanes
            var main = chart.append('g')
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
              .attr('width', width)
              .attr('height', mainHeight)
              .attr('class', 'main');

              //creates the grouping element for the mini slidable lane
            var mini = chart.append('g')
              .attr('transform', 'translate(' + margin.left + ',' + (mainHeight + 60) + ')')
              .attr('width', width)
              .attr('height', miniHeight)
              .attr('class', 'mini');

            // draw the lanes for the main chart
            main.append('g').selectAll('.laneLines')
              .data(lanes)
              .enter().append('line')
              .attr('x1', 0)
              .attr('y1', function(d) { return d3.round(y1(d.id)) + 0.5; })
              .attr('x2', width)
              .attr('y2', function(d) { return d3.round(y1(d.id)) + 0.5; })
              .attr('stroke', function(d) { return d.label === '' ? 'white' : 'lightgray' });

            // adds the text to each lane in the main display
            main.append('g').selectAll('.laneText')
              .data(lanes)
              .enter().append('text')
              .text(function(d) { return d.label; })
              .attr('x', -10)
              .attr('y', function(d) { return y1(d.id + .5); })
              .attr('dy', '0.5ex')
              .attr('text-anchor', 'end')
              .attr('class', 'laneText');

            // draw the lanes for the mini chart
            mini.append('g').selectAll('.laneLines')
              .data(lanes)
              .enter().append('line')
              .attr('x1', 0)
              .attr('y1', function(d) { return d3.round(y2(d.id)) + 0.5; })
              .attr('x2', width)
              .attr('y2', function(d) { return d3.round(y2(d.id)) + 0.5; })
              .attr('stroke', function(d) { return d.label === '' ? 'white' : 'lightgray' });

              //adds text to each lane in tiny slidable display
            mini.append('g').selectAll('.laneText')
              .data(lanes)
              .enter().append('text')
              .text(function(d) { return d.label; })
              .attr('x', -10)
              .attr('y', function(d) { return y2(d.id + .5); })
              .attr('dy', '0.5ex')
              .attr('text-anchor', 'end')
              .attr('class', 'laneText');

              //creates the axis on the bottom for date
            var x1DateAxis = d3.svg.axis()
              .scale(x1)
              .orient('bottom')
              .ticks(d3.time.months, 1)
              .tickFormat(d3.time.format('%a %d'))
              .tickSize(2, 0, 0);

              //creates month axis on top of display
            var xMonthAxis = d3.svg.axis()
              .scale(x)
              .orient('top')
              .ticks(d3.time.years, 1)
              .tickFormat(d3.time.format('%b %Y'))
              .tickSize(15, 0, 0);

            //axis for the main display
            var x1MonthAxis = d3.svg.axis()
              .scale(x1)
              .orient('top')
              .ticks(d3.time.months, 1)
              .tickFormat(d3.time.format('%b'))
              .tickSize(10, 0, 0);

            // main.append('g')
            //   .attr('transform', 'translate(0,' + mainHeight + ')')
            //   .attr('class', 'main axis date')
            //   .call(x1DateAxis);

            //append X axis for main display
            main.append('g')
              .attr('transform', 'translate(0,0.5)')
              .attr('class', 'main axis month')
              .call(x1MonthAxis)
              .selectAll('text')
                .attr('dx', 5)
                .attr('dy', 12);

            mini.append('g')
              .attr('transform', 'translate(0,0.5)')
              .attr('class', 'axis month')
              .call(xMonthAxis)
              .selectAll('text')
                .attr('dx', 5)
                .attr('dy', 12);

            // draw the items
            var itemRects = main.append('g')
              .attr('clip-path', 'url(#clip)');

            mini.append('g').selectAll('miniItems')
              .data(getPaths(items))
              .enter().append('path')
              .attr('class', function(d) { return 'miniItem ' + d.class; })
              .attr('d', function(d) { return d.path; });

            // invisible hit area to move around the selection window
            mini.append('rect')
              .attr('pointer-events', 'painted')
              .attr('width', width)
              .attr('height', miniHeight)
              .attr('visibility', 'hidden')
              .on('mouseup', moveBrush);

            // draw the selection area
            var brush = d3.svg.brush()
              .x(x)
              .extent([d3.time.month(now),d3.time.month.ceil(now)])
              .on("brush", display);

            //creates the slidable tool on the mini display
            mini.append('g')
              .attr('class', 'x brush')
              .call(brush)
              .selectAll('rect')
                .attr('y', 1)
                .attr('height', miniHeight - 1);

            mini.selectAll('rect.background').remove();
            display();

            function display () {

              var rects, labels
                , minExtent = d3.time.day(brush.extent()[0])
                , maxExtent = d3.time.day(brush.extent()[1])
                , visItems = items.filter(function (d) { return d.start < maxExtent && d.end > minExtent});

              mini.select('.brush').call(brush.extent([minExtent, maxExtent]));   

              x1.domain([minExtent, maxExtent]);

              if ((maxExtent - minExtent) > 1468800000) {
                x1MonthAxis.ticks(d3.time.months, 1).tickFormat(d3.time.format('%b'))    
              }
              else if ((maxExtent - minExtent) > 172800000) {
                x1DateAxis.ticks(d3.time.days, 1).tickFormat(d3.time.format('%a %d'))
                x1MonthAxis.ticks(d3.time.mondays, 1).tickFormat(d3.time.format('%b - Week %W'))
              }
              else {
                x1DateAxis.ticks(d3.time.hours, 4).tickFormat(d3.time.format('%I %p'))
                x1MonthAxis.ticks(d3.time.days, 1).tickFormat(d3.time.format('%b %e'))
              }

              // update the axis
              main.select('.main.axis.date').call(x1DateAxis);
              main.select('.main.axis.month').call(x1MonthAxis)
                .selectAll('text')
                  .attr('dx', 5)
                  .attr('dy', 12);

              // update the item rects
              rects = itemRects.selectAll('rect')
                .data(visItems, function (d) { return d.id; })
                .attr('x', function(d) { return x1(d.start); })
                .attr('width', function(d) { return x1(d.end) - x1(d.start); })
                .attr('class', function(d) { return 'mainItem resizable ' + classifier(d.lane);  });

              //creates the rectangles for both displays
              rects.enter().append('rect')
                .attr('x', function(d) { return x1(d.start); })
                .attr('y', function(d) { return (y1(d.lane) + .1 * y1(1) + 0.5) })
                .attr('width', function(d) { return x1(d.end) - x1(d.start); })
                .attr('height', function(d) { return .8 * y1(1)})
                .attr('rx', '5px')
                .attr('ry', '5px')
                .attr('class', function(d) { return 'mainItem resizable ' + classifier(d.lane)})
                .on('click', editItem);

              rects.exit().remove();

              // update the item labels
              labels = itemRects.selectAll('text')
                .data(visItems, function (d) { return d.id; })
                .attr('x', function(d) { return x1(Math.max(d.start, minExtent)) + 2; });
                    
              //creates the text for each rectangle in the display
              labels.enter().append('text')
                .text(function (d) { return 'Item\n\n\n\n Name: ' + d.id; })
                .attr('x', function(d) { return x1(Math.max(d.start, minExtent)) + 2; })
                .attr('y', function(d) { return y1(d.lane) + .2 * y1(1) + 5})
                .attr('text-anchor', 'start')
                .attr('class', 'itemLabel');

              labels.exit().remove();
            }

            function moveBrush () {
              var origin = d3.mouse(this)
                , point = x.invert(origin[0])
                , halfExtent = (brush.extent()[1].getTime() - brush.extent()[0].getTime()) / 2
                , start = new Date(point.getTime() - halfExtent)
                , end = new Date(point.getTime() + halfExtent);

              brush.extent([start,end]);
              display();
            }

            function editItem (item) {
              var newYear = prompt("Enter a new start year: ");
              var newMonth = prompt("Enter a new start month: ");
              item.start = new Date(newYear, newMonth);
              display();
            }

            // generates a single path for each item class in the mini display
            // ugly - but draws mini 2x faster than append lines or line generator
            // is there a better way to do a bunch of lines as a single path with d3?
            function getPaths(items) {
              var paths = {}, d, offset = .5 * y2(1) + 0.5, result = [];
              for (var i = 0; i < items.length; i++) {
                d = items[i];
                if (!paths[d.class]) paths[d.class] = ''; 
                paths[d.class] += ['M',x(d.start),(y2(d.lane) + offset),'H',x(d.end)].join(' ');
              }

              for (var className in paths) {
                result.push({class: className, path: paths[className]});
              }

              return result;
            }

            function classifier (item){
             if(item % 3 === 0){
               return 'zero';
             }else if( item % 2 === 0){
               return 'one';
             }else if( item % 1 === 0){
               return 'two';
             }
            }

          });
        }}
    }])
