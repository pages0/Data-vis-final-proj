/* Created  on 4-17-17 by Nick Roberson, Reilly Grant, and Connor GT */
// Used https://bl.ocks.org/mbostock/3883245

var NYTData = null;

displayData('AMAZON_INC');

d3.queue()
.defer( d3.csv, 'data/NAMES.csv' )
.await(function(error , names) {
  var dropDown =
  d3.select('#filters')
  .append('select')
  .attr('id','companies')
  .on('change',function() {
    displayData(d3.select(this).node().value);
  });

  dropDown.selectAll('option')
  .data(names)
  .enter()
  .append('option')
  .attr('value', function(d){
    return d.FileName;
  }).text(function(d){
    return d.Name;
  });
});




function displayData(FileName) {

  // just an example call, FileName works but we need to figute out the sliding
  // date window to properly use this.
  // Date format = YYYYMMDD with no dashes.

  reset_news();
  makeNYTAPICall(FileName,'20170301','20170401');

  d3.select("svg").remove();
  d3.select('#svg_area').append("svg").attr("width", 800).attr("height",450)
  //.style("opacity",0)
  //.transition()
  //.duration(1000)
  //.style("opacity",1);

  var svg = d3.select("svg"),
  margin = {top: 20, right: 50, bottom: 30, left: 50},
  svg_width = +svg.attr("width") - margin.left - margin.right,
      svg_height = +svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
  .defer( d3.csv, 'data/'+FileName+'_STOCK.csv' )
  .defer( d3.csv, 'data/'+FileName+'_GOOGLE_TRENDS.csv' )
  .await( function(error, data_stock, data_google_trends ) {

    data_google_trends=data_google_trends.reverse();
    // process data here!
    var dates = [];


    for (d of data_stock){
      d.Date = parseTime(d.Date);
      dates.push(d.Date);
      d.Close = +d.Close;
    }

    for (d of data_google_trends){
      d.Date = parseTime(d.Date);
      dates.push(d.Date);
      d.Popularity = +d.Popularity;
    }

    // min and max dates
    var maxDate_google_trends = d3.max(data_google_trends, function(d) { return d.Date });
    var maxDate_data_stock = d3.max(data_stock, function(d) { return d.Date });
    var minDate_google_trends = d3.min(data_google_trends, function(d) { return d.Date });
    var minDate_data_stock = d3.min(data_stock, function(d) { return d.Date });

    var minExtent = d3.max([minDate_google_trends,minDate_data_stock]);
    var maxExtent = d3.min([maxDate_google_trends,maxDate_data_stock]);

    data_google_trends=data_google_trends.filter(
      function(d)
      {
        return d.Date < maxExtent && d.Date > minExtent;
      });
      data_stock=data_stock.filter(
        function(d)
        {
          return d.Date < maxExtent && d.Date > minExtent;
        });

        // Scales the graph
        scaleTime.domain([minExtent, maxExtent]);
        scaleStock.domain(d3.extent(data_stock, function(d) { return d.Close; }));
        scaleSocial.domain(d3.extent(data_google_trends, function(d) { return d.Popularity; }));

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
        .datum(data_google_trends)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", trendLine)
        .style("opacity",0)
        .transition()
        .duration(1000)
        .style("opacity",1);

      g.append("path")
        .datum(data_stock)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
          .attr("stroke-width", 1.5)
          .attr("d", stockLine)
	  .style("opacity",0)
	  .transition()
          .duration(1000)
          .style("opacity",1);

      // Adding Tool tips
      // From an obsure place on stack exchange

      svg.selectAll('.stock-tip')
	  .data(data_stock)
	  .enter()
	  .append("circle")
	  .attr("r",1.7)
	  .style("fill", "steelblue")
	  .style("pointer-events","all")
	  .attr('cx', function(d){
	      return margin.left+scaleTime(d.Date);
	  })
      	  .attr('cy', function(d){
	      return margin.top+scaleStock(d.Close);
	  }).on('mouseover',function(d){
	      d3.selectAll('div.stock-tip-text')
		  .remove();
	      d3.select(this)
		  .transition()
		  .style('fill','red')
		  .attr('r',5);
	      d3.select('body')
		  .append('div')
		  .attr('class','stock-tip-text')
		  .html('<p>' + "Date: " + d.Date + '</br>Closing Price: ' + d.Close + '</p>')
	  }).on('mouseout',function() {
	      d3.select(this)
		  .transition()
		  .style('fill','steelblue')
		  .attr('r',1.7);
	  }).style("opacity",0)
	    .transition()
      .duration(1000)
      .style("opacity",1);

      svg.selectAll('.social-tip')
	  .data(data_google_trends)
	  .enter()
	  .append("circle")
	  .attr("r",3)
	  .style("fill", "green")
	  .style("pointer-events","all")
	  .attr('cx', function(d){
	      return margin.left+scaleTime(d.Date);
	  })
      	  .attr('cy', function(d){
	      return margin.top+scaleSocial(d.Popularity);
	  }).on('mouseover',function(d){
	      d3.selectAll('div.google-tip-text')
		  .remove();
	      d3.select(this)
		  .transition()
		  .style('fill','red')
		  .attr('r',5);
	      d3.select('body')
		  .append('div')
		  .attr('class','google-tip-text')
		  .html('<p>' + "Date: " + d.Date + '</br>Popularity: ' + d.Popularity + '</p>')
	  }).on('mouseout',function() {
	      d3.select(this)
		  .transition()
		  .style('fill','green')
		  .attr('r',3);
	  }).on('click', function(d){
	      console.log((d.Date));
	      console.log((d.Date.getMonth()));
	      console.log((d.Date.getDay()));
	      console.log((d.Date.getFullYear()));
	      console.log(formatDate(d.Date));
        var dateRange = formatDate(d.Date);
        reset_news();
        makeNYTAPICall(FileName,dateRange[0],dateRange[1]);
	      //makeNYTAPICall(FileName,'20170301','20170401');
	  }).style("opacity",0)
	    .transition()
      .duration(1000)
      .style("opacity",1);


      });
    }
