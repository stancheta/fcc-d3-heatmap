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

    var maxYear = d3.max(mVariance, function(d) { return d.year; });
    var minYear = d3.min(mVariance, function(d) { return d.year; });
    var maxVariance = d3.max(mVariance, function(d) { return d.variance; });
    var minVariance = d3.min(mVariance, function(d) { return d.variance; });

    var color = d3.scale.linear().domain([0, 6, 11]).range(['#6996AD', '#FFF68F', '#660000']);
    var colorScale = d3.scale.linear().domain([minVariance + baseTemp, maxVariance + baseTemp]).range([0,11]);
    var roundThousand = function(num) { return Math.floor(num * 1000) / 1000};
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
    var x = d3.scale.linear().domain([minYear, maxYear]).range([0, width / 1.3]);
    var y = d3.scale.linear().domain([11, 0]).range([height - margin.bottom, 0]);

    var tooltip = d3.select('.chart')
                .append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0);

    var heatmap = svg.selectAll(".heatmap")
                    .data(mVariance)
                    .enter().append('rect')
                    .attr('class', 'bin')
                    .attr('x', function(d) { return (x(d.year) + ((d.year - minYear) + 1)); })
                    .attr('y', function(d) { return y((d.month - 1)); })
                    // .attr("transform", function(d, i) { return "translate(" + i * 5 + ", 0)"; })
                    .attr('width', 3)
                    .attr('height', 45)
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

    var legend = svg.selectAll('.legend')
                .data(color)
                .enter().append('g')
                .attr('class', 'legend')
                .attr("transform", function(d, i) { return "translate(" + i * 30 + ", 0)"; });

    legend.append("rect")
          .attr("x", width - 290)
          .attr("y", height + 10)
          .attr("width", 30)
          .attr("height", 15)
          .style("fill", function(d, i) { return color(i); });

    legend.append("text")
        .attr("x", width - 175)
        .attr("y", 5)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d, i) { return colorScale[i]; });
    console.log(data);
  };

  // setup
  getData(dataURL, handleData);
})();
