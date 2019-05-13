'use strict';

(function() {

  let episodesData = ""; //current data
  let seasonsData = "";
  let svgContainer = ""; // keep SVG reference in global scope

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);

    //get and use multiple csv files
    Promise.all([d3.csv("./data/Episodes+ (SimpsonsData).csv"),
    d3.csv("./data/Seasons (SimpsonsData).csv")])
    .then(function(files) {
      episodesData = files[0];
      seasonsData = files[1];
      makeBarGraph();
    })
  }

  function makeBarGraph() {
      // data = data;

      var margin = {top: 10, right: 20, bottom: 20, left: 10},
      width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
      
      // get arrays of years and views
      let date = episodesData.map((row) => row["Original air date"]);
      let years = getUniqueYears(date);
      // let view = data.map((row) => row["U.S. Viewers"]);
      let views = seasonsData.map((row) => +row['Avg. Viewers (mil)'])

      // scale, draw, and label x-axis
      makeAxes(width, height, years, views);
  
      // // plot data as points and add tooltip functionality
      plotData(width, height, years, views);
  
      // draw title and axes labels
      makeLabels();
    }

    //make a list of unique years
    function getUniqueYears(date) {
      let uniqueYears = [];
      for (let i = 0; i < date.length; i++) {
          let year = +parseDate(date[i]);
          if (!uniqueYears.includes(year)) {
              uniqueYears.push(year);
          }
      }

      return uniqueYears;
    }

    //get only the year of string of date
    function parseDate(date) {
      let parseYear = d3.timeFormat("%Y");
      return parseYear(new Date(date));
    }

    //draw axes and ticks
    function makeAxes(width, height, x, y) {

      var xScale = d3.scaleBand()
          .domain(x)
          .range([0, width]);

      var yScale = d3.scaleLinear()
        .domain([d3.max(y) + 2, 0])
        .range([30, height]);

      var xAxis = d3.axisBottom()
        .scale(xScale);

      var yAxis = d3.axisLeft()
        .scale(yScale);

      svgContainer.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(50," + height + ")")
          .call(xAxis)
          .selectAll("text")
          .style("font-size", "8px")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "-.55em")
            .attr("transform", "rotate(-90)" );

      svgContainer.append("g")
          .attr("class", "y axis")
          .attr('transform', 'translate(50, 0)')
          .call(yAxis);
    }
  
    // make title and axes labels
    function makeLabels() {
      svgContainer.append('text')
        .attr('x', 130)
        .attr('y', 20)
        .style('font-size', '14pt')
        .text("Average Viewership By Season");
  
      svgContainer.append('text')
        .attr('transform', 'translate(15, 300)rotate(-90)')
        .style('font-size', '10pt')
        .text('Avg. Viewers (in millions)');

      //legend
      svgContainer.append('text')
        .attr('x', 400)
        .attr('y', 60)
        .style('font-size', '10pt')
        .text("Viewership Data");
      svgContainer.append('rect')
        .attr('x', 425)
        .attr('y', 70)
        .attr('height', 10)
        .attr('width', 10)
        .attr('fill', "#4286f4")
      svgContainer.append('text')
        .attr('x', 440)
        .attr('y', 80)
        .style('font-size', '10pt')
        .text("Actual");
      svgContainer.append('rect')
        .attr('x', 425)
        .attr('y', 90)
        .attr('height', 10)
        .attr('width', 10)
        .attr('fill', "gray")
      svgContainer.append('text')
        .attr('x', 440)
        .attr('y', 100)
        .style('font-size', '10pt')
        .text("Estimated");
    }

    // plot all the data points on the SVG
    // and add tooltip functionality
    function plotData(width, height, x, y) {

      // mapping functions
      let xMap = x;
      let yValue = function(d) {return +d["Avg. Viewers (mil)"];}
      let yScale = d3.scaleLinear()
        .domain([d3.max(y) + 2, 0])
        .range([30, height]);
      let yMap = function (d) { return yScale(yValue(d));};
  
      // make tooltip
      let div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  
      // append data to SVG and make bars with labels
      let chart = svgContainer.selectAll('.dot')
        .data(seasonsData)
        .enter()

      chart.append('rect')
        .attr('x', function(d, i) {return (width / xMap.length) * i + 53;})
        .attr('y', yMap)
        .attr('height', function(d) {return height - yMap(d);})
        .attr('width', '15')
        .attr('fill', function(d) {
            if (d.Data === "Estimated") {
              return "gray";
            } return "#4286f4";
          })
          // add tooltip functionality to points
          .on("mouseover", (d) => {
            div.transition()
              .duration(200)
              .style("opacity", .9);
            div.html("Season # " + d.Year + "<br/>" +
                      "Year: " + d.Year + "<br/>" +
                      "Episodes: " + d.Episodes + "<br/>" +
                      "Avg Viewers (mil): " + d["Avg. Viewers (mil)"] + "<br/>" +
                      "Most Watched Episode: " + d["Most watched episode"] + "<br/>" +
                      "Viewers (mil): " + d["Viewers (mil)"])
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout", (d) => {
            div.transition()
              .duration(500)
              .style("opacity", 0);
          });

      chart.append("text")
        .text(function (d) {return d["Avg. Viewers (mil)"];})
        .attr('x', function(d, i) {return (width / xMap.length) * i + 60;})
        .attr('y', function(d) {return yMap(d) - 3;})
        .style('font-size', '7pt')
        .style("text-anchor", "middle");
      
      //average line
      let avgVal = d3.mean(seasonsData, function (d) {return d["Avg. Viewers (mil)"];})
      avgVal = Math.round(avgVal * 10) / 10;

      chart.append('line')
      .attr('x1', 50)
      .attr("y1", yScale(avgVal))
			.attr("x2", 500)
			.attr("y2", yScale(avgVal))
      .attr('stroke', 'black')
      .attr('stroke-width', 2);

      //average line label
      chart.append('rect')
      .attr('x', 55)
      .attr('y', 255)
      .attr('width', 23)
      .attr('height', 12)
      .style('fill', 'lightgray');

      chart.append("text")
      .text(avgVal)
      .attr('x', 55)
      .attr('y', 265)
      .style('font-size', '8pt');
    }
})();