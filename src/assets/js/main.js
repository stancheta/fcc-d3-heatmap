/* globals XMLHttpRequest, d3 */

(function() {
  var dataURL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

  var getData = function(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = JSON.parse(request.responseText);
        callback(data);
      } else {
        // We reached our target server, but it returned an error
        console.log('The Server Returned an Error');
      }
    };
    request.onerror = function() {
      // There was a connection error of some sort
      console.log('There was a connection error');
    };
    request.send();
  };

  var handleData = function(data) {
    var baseTemp = data.baseTemperature;
    var mVariance = data.monthlyVariance;

    var margin = {top: 100, right: 100, bottom: 70, left: 100},
      width = 1350 - margin.left - margin.right,
      height = 750 - margin.top - margin.bottom;

    var svg = d3.select('.chart').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    mVariance.forEach(function(d) {
      d.year = +d.year;
      d.month = +d.month;
      d.variance = +d.variance;
    });

    var minYear = d3.min(mVariance, function(d) { return d.year; });
    var maxYear = d3.max(mVariance, function(d) { return d.year; });
    var minDate = new Date(minYear, 0);
    var maxDate = new Date(maxYear, 0);
    var maxVariance = d3.max(mVariance, function(d) { return d.variance; });
    var minVariance = d3.min(mVariance, function(d) { return d.variance; });

    var color = d3.scale.linear().domain([0, 6, 11]).range(['#6996AD', '#FFF68F', '#660000']);
    var colorScale = d3.scale.linear().domain([minVariance + baseTemp, maxVariance + baseTemp]).range([0,11]);
    var roundTen = function(num) { return Math.floor(num * 10) / 10};
    var roundThousand = function(num) { return Math.floor(num * 1000) / 1000};
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];

    var x = d3.time.scale().domain([minDate, maxDate]).range([0, width]);
    var y = d3.scale.linear().domain([11, 0]).range([height - (margin.bottom + 50), 0]);

    var yAxis = d3.svg.axis()
                  .scale(y)
                  .orient('left')
                  .innerTickSize(0)
                  .outerTickSize(0)
                  .tickFormat(function(d) { return months[d]; });

    var xAxis = d3.svg.axis()
                  .scale(x)
                  .orient('bottom')
                  .ticks(d3.time.years, 10);

    var tooltip = d3.select('.chart')
                .append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0);

    var heatmap = svg.selectAll(".heatmap")
                    .data(mVariance)
                    .enter().append('rect')
                    .attr('class', 'bin')
                    .attr('x', function(d) { return (x(new Date(d.year, 0))); })
                    .attr('y', function(d) { return y((d.month - 1)); })
                    .attr('width', 3)
                    .attr('height', 40)
                    .style('fill', function(d) { return color(colorScale(d.variance + baseTemp)); })
                    .on('mouseover', function(d) {
                       tooltip.transition()
                              .duration(100)
                              .style('opacity', 0.9);
                       tooltip.html(
                         '<strong>' + d.year + ' - ' + months[(d.month - 1)] + '</strong><br>' +
                         '<strong>' + roundThousand(d.variance + baseTemp) + '</strong><br> ' +
                         d.variance
                        )
                        .style('left', (d3.event.pageX + 20) + 'px')
                        .style('top', (d3.event.pageY - 20) + 'px');
                    })
                    .on('mouseout', function() {
                      tooltip.transition()
                             .duration(200)
                             .style('opacity', 0);
                    });

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(' + 0 + ',' + 20 + ')')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -225)
        .attr('y', -100)
        .attr('dy', '.71em')
        .style('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .text('months');

    svg.append('g')
       .attr('class', 'x-axis')
       .attr('transform', 'translate(0,' + (height - 80) + ')')
       .call(xAxis)
       .append('text')
       .attr('x', width / 2)
       .attr('y', 45)
       .attr('dy', '.71em')
       .style('text-anchor', 'middle')
       .style('font-weight', 'bold')
       .text('years');

    var legend = svg.selectAll('.legend')
                .data(color)
                .enter().append('g')
                .attr('class', 'legend')
                .attr("transform", function(d, i) { return "translate(" + i * 40 + ", 0)"; });

    legend.append("rect")
          .attr("x", width - 400)
          .attr("y", height - 15)
          .attr("width", 40)
          .attr("height", 15)
          .style("fill", function(d, i) { return color(i); });

    legend.append("text")
        .attr("x", width - 380)
        .attr("y", height + 15)
        .style("text-anchor", "middle")
        .text(function(d, i) { return roundTen((maxVariance + baseTemp) * i * 0.1); });
  };

  // setup
  getData(dataURL, handleData);
})();
