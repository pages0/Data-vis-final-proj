/* Created  on 4-17-17 by Nick Roberson, Reilly Grant, and Connor GT */
// Used https://bl.ocks.org/mbostock/3883245

d3.select('#svg_area').append("svg").attr("width", 800).attr("height",450);

var svg = d3.select("svg");
var margin = {top: 20, right: 50, bottom: 30, left: 50};
var svg_width = +svg.attr("width") - margin.left - margin.right;
var svg_height = +svg.attr("height") - margin.top - margin.bottom;
var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// data_map holds the data objects of all the companies we are looking at.
// object key = company name
// object data = an object with the stock data and the social data in it.
// access it like:
//     data_map["United Airlines"].stock_data
//     data_map["United Airlines"].social_data
var data_map = {};
var current_company = "Pepsi";

var selector = d3.select('#filters')
                  .append('select')
      	          .attr('class','select')
                  .on('change', onChange);

var company_names= ["United", "Starbucks", "Pepsi", "Wendys", "Tesla"];
var companies;
company_names.sort();
addCompanies(selector,company_names);
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
    .y(function(d) { return scaleSocial(d.Popularity);});

// queue data for loading here
d3.queue()
  .defer( d3.csv, 'data/UNITED_STOCK.csv' )
  .defer( d3.csv, 'data/UNITED_GOOGLE_TRENDS.csv' )
  .defer( d3.csv, 'data/PEPSI_STOCK.csv' )
  .defer( d3.csv, 'data/PEPSI_GOOGLE_TRENDS.csv' )
  .defer( d3.csv, 'data/WENDYS_STOCK.csv' )
  .defer( d3.csv, 'data/WENDYS_GOOGLE_TRENDS.csv' )
  .defer( d3.csv, 'data/STARBUCKS_STOCK.csv' )
  .defer( d3.csv, 'data/STARBUCKS_GOOGLE_TRENDS.csv' )
  .defer( d3.csv, 'data/TESLA_STOCK.csv' )
  .defer( d3.csv, 'data/TESLA_GOOGLE_TRENDS.csv' )
  .await( function(error, united_stock, united_google_trends,
                          pepsi_stock, pepsi_google_trends,
                          wendys_stock, wendys_google_trends,
                          starbucks_stock, starbucks_google_trends,
                          tesla_stock, tesla_google_trends) {

      united_google_trends = united_google_trends.reverse();
      pepsi_google_trends = pepsi_google_trends.reverse();
      wendys_google_trends = wendys_google_trends.reverse();
      starbucks_google_trends = starbucks_google_trends.reverse();
      tesla_google_trends = tesla_google_trends.reverse();
      companies = { Pepsi : { stock : pepsi_stock,
                                  social : pepsi_google_trends,
                                  dates : null,
                                  name : "Pepsi"},
                        Starbucks : { stock : starbucks_stock,
                                      social : starbucks_google_trends,
                                      dates : null,
                                      name : "Starbucks"},
                        Tesla : { stock : tesla_stock,
                                  social : tesla_google_trends,
                                  dates : null,
                                  name : "Tesla"},
                        Wendys : { stock : wendys_stock,
                                   social : wendys_google_trends,
                                   dates : null,
                                   name : "Wendys"},
                        United : { stock : united_stock,
                                   social : united_google_trends,
                                   dates : null,
                                   name : "United Airlines"}
                      };

      for (company in companies) {
        //console.log(companies[company]);
        var dates = [];
        // process the stock data
        for (d of companies[company].stock) {
            //console.log(d);
            d.Date = parseTime(d.Date);
            dates.push(d.Date);
            d.Close = +d.Close;
        }
        companies[company].dates = dates;

        // process the social data
        for (d of companies[company].social) {
             //console.log(d);
             d.Date = parseTime(d.Date);
             dates.push(d.Date);
             //console.log(d);
             //console.log(d.Date);
             //console.log(d.Popularity);
             d.Popularity = +d.Popularity;
        }
      }
      //console.log(d3.extent(united_stock, function(d) { return d.Date; }));
      //console.log(d3.max(united_stock, function(d) { return d.Date; }));
      //console.log(d3.min(united_stock, function(d) { return d.Date; }));
      //console.log(d3.min(united_google_trends, function(d) { return d.Date; }));

      setScales(companies[current_company]);
      drawAxis();
      drawPaths();
  });

var updateChart = function() {
  console.log("Calling updateChart()");
  setScales(companies[current_company]);
  removeLines();
  drawPaths();
  drawAxis();
};

var setScales = function(company_data) {
  scaleTime.domain(d3.extent(company_data.stock, function(d) { return d.Date; }));
  scaleTime.domain(d3.extent(company_data.dates, function(d) { return d; }));
  scaleStock.domain(d3.extent(company_data.stock, function(d) { return d.Close; }));
  scaleSocial.domain(d3.extent(company_data.social, function(d) { return d.Popularity; }));
}

var removeLines = function() {
  g.selectAll("path").remove();
  g.selectAll("g").remove();
};

var drawPaths = function() {
  console.log(current_company + " : " + companies[current_company].socialx);
  if (companies[current_company].social != null && companies[current_company].stock != null) {
    g.append("path")
     .datum(companies[current_company].social )
     .attr("fill", "none")
     .attr("stroke", "green")
     .attr("stroke-linejoin", "round")
     .attr("stroke-linecap", "round")
     .attr("stroke-width", 1.5)
     .attr("d", trendLine);

    g.append("path")
     .datum(companies[current_company].stock)
     .attr("fill", "none")
     .attr("stroke", "steelblue")
     .attr("stroke-linejoin", "round")
     .attr("stroke-linecap", "round")
     .attr("stroke-width", 1.5)
     .attr("d", stockLine);
   }
  };

var drawAxis = function() {
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
  };
