/* Created  on 4-17-17 by Nick Roberson, Reilly Grant, and Connor GT */
// Used https://bl.ocks.org/mbostock/3883245

d3.select("body").append("svg").attr("width", 960).attr("height",500);

var svg = d3.select("svg"),
    margin = {top: 20, right: 50, bottom: 30, left: 50},
    svg_width = +svg.attr("width") - margin.left - margin.right,
    svg_height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//height and width of svg's

// parse by year-month-day
var parseTime = d3.timeParse("%Y-%m-%d");

var scaleTime = d3.scaleTime().rangeRound([0,svg_width]);

var scaleStock = d3.scaleLinear().rangeRound([svg_height, 0]);
var scaleSocial = d3.scaleLinear().rangeRound([svg_height, 0]);

var stockLine = d3.line()
    .x(function(d) { return scaleTime(d.Date);} )
    .y(function(d) { return scaleStock(d.Close);});

var trendLine =d3.line()
    .x(function(d) { return scaleTime(d.Date);} )
    .y(function(d) { return scaleSocial(d.SearchIndex);});

// queue data for loading here 
d3.queue()
  .defer( d3.csv, 'data/UNITED_STOCK.csv' )
  .defer( d3.csv, 'data/UNITED_GOOGLE_TRENDS.csv' )
  .await( function(error, united_stock, united_google_trends ) {

      united_google_trends=united_google_trends.reverse();
      // process data here!
      var dates = [];

      for (d of united_stock){
	  d.Date = parseTime(d.Date);
	  dates.push(d.Date);
	  d.Close = +d.Close;
      }

      for (d of united_google_trends){
	  d.Date = parseTime(d.Date);
	  dates.push(d.Date);
	  console.log(d);
	  console.log(d.Date);
	  console.log(d.SearchIndex);
	  d.SearchIndex = +d.SearchIndex;
      }      


      scaleTime.domain(d3.extent(dates, function(d) { return d; }));
      
      scaleStock.domain(d3.extent(united_stock, function(d) { return d.Close; }));
      scaleSocial.domain(d3.extent(united_google_trends, function(d) { return d.SearchIndex; }));
      
      g.append("g")
	  .attr("transform", "translate(0," + svg_height + ")")
	  .call(d3.axisBottom(scaleTime))
	  .select(".domain");
      
      g.append("g")
	  .call(d3.axisLeft(scaleStock))
	  .append("text")
	  .attr("fill", "#000")
	  .attr("transform", "rotate(-90)")
	  .attr("y", 6)
	  .attr("dy", "0.71em")
	  .attr("text-anchor", "end")
	  .text("Price ($)");

      g.append("g")
	  .call(d3.axisRight(scaleSocial))
      	  .attr("transform", "translate(" + svg_width + ")")
	  .append("text")
	  .attr("fill", "#000")
	  .attr("transform", "rotate(-90)")
	  .attr("y", 6)
	  .attr("dy", "0.71em")
	  .attr("text-anchor", "end")
	  .text("Social");

       g.append("path")
	  .datum(united_google_trends)
	  .attr("fill", "none")
	  .attr("stroke", "green")
	  .attr("stroke-linejoin", "round")
	  .attr("stroke-linecap", "round")
	  .attr("stroke-width", 1.5)
	  .attr("d", trendLine);
   
      g.append("path")
	  .datum(united_stock)
	  .attr("fill", "none")
	  .attr("stroke", "steelblue")
	  .attr("stroke-linejoin", "round")
	  .attr("stroke-linecap", "round")
	  .attr("stroke-width", 1.5)
	  .attr("d", stockLine);
      
  });
