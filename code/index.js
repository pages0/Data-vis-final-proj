/* Created  on 4-17-17 by Nick Roberson, Reilly Grant, and Connor GT */
// Used https://bl.ocks.org/mbostock/3883245

d3.select("body").append("svg").attr("width", 1000).attr("height",600);

var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
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

// queue data for loading here 
d3.queue()
  .defer( d3.csv, 'data/UNITED_STOCK.csv' )
  .defer( d3.csv, 'data/UNITED_GOOGLE_TRENDS.csv' )
  .await( function(error, united_stock, united_google_trends ) {

    // process data here!
      for (d in united_stock){
	  d.Date = parseTime(d.Date);
	  d.Close = +d.Close;
      }
      for (d in united_google_trends){
	  d.Date = parseTime(d.Date);
	  d.Close = +d.Close;
      }      
      
      scaleTime.domain(d3.extent(united_stock, function(d) { return d.Date; }));
      scaleStock.domain(d3.extent(united_stock, function(d) { return d.Close; }));
      
      g.append("g")
	  .attr("transform", "translate(0," + svg_height + ")")
	  .call(d3.axisBottom(scaleTime))
	  .select(".domain")
	  .remove();
      
      g.append("g")
	  .call(d3.axisLeft(scaleStock))
	  .append("text")
	  .attr("fill", "#000")
	  .attr("transform", "rotate(-90)")
	  .attr("y", 6)
	  .attr("dy", "0.71em")
	  .attr("text-anchor", "end")
	  .text("Price ($)");

      console.log(united_stock);
      console.log(stockLine);
      
      g.append("path")
	  .datum(united_stock)
	  .attr("fill", "none")
	  .attr("stroke", "steelblue")
	  .attr("stroke-linejoin", "round")
	  .attr("stroke-linecap", "round")
	  .attr("stroke-width", 1.5)
	  .attr("d", stockLine);
      
  });
