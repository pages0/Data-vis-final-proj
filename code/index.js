/* Created  on 4-17-17 by Nick Roberson, Reilly Grant, and Connor GT */
// Used https://bl.ocks.org/mbostock/3883245

var NYTData = null;

//Display Amazon by Default
displayData('AMAZON_INC');

// Read in the list of possible companies to search through
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

//Displays the data associated with the filename given
function displayData(FileName) {

    //Resets the news display, and sets the default time frame
    reset_news();
  makeNYTAPICall(FileName,'20170301','20170401');

    //Update the SVG
  d3.select("svg").remove();
  d3.select('#svg_area').append("svg").attr("width", 850).attr("height",450)

  var svg = d3.select("svg");
  var margin = {top: 20, right: 200, bottom: 30, left: 50};
  var svg_width = +svg.attr("width") - margin.left - margin.right;
  var svg_height = +svg.attr("height") - margin.top - margin.bottom;
  var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Generate the mouse line
  var line = d3.select('svg').append("line")
        .attr("class","mouse_line")
        .attr("x1", 0)
        .attr("y1", svg_height + margin.top)
        .attr("x2", 0)
        .attr("y2", margin.top);

  svg.on('mousemove', function() {
    var mouse_x = d3.mouse(this);
    if(mouse_x[0] > margin.left && mouse_x[0] < svg_width + margin.left) {
      var x = mouse_x[0];
      line.attr("x1",x+"px");
      line.attr("x2",x+"px");
    }
  });

        // Generate a legend
  var legend_titles = ["Stock Price","Google Tends"];
  var legend_colors = ["steelblue","green"];

    // Generate a legend
    for(var i=0; i<=1; i++) {
      svg.append('rect')
        .attr('x', svg.attr("width") - 150)
        .attr('y', 100 + 30 * i)
        .attr('width', 25)
        .attr('height', 25)
        .attr('stroke', '#000')
        .attr('stroke-width', '0.5px')
	.attr('fill',legend_colors[i]);

      svg.append('text')
        .attr('x', svg.attr("width") - 120)
        .attr('y', 118 + 30 * i)
        .attr('font-family', 'sans-serif')
        .attr('font-size', '10pt')
        .text(legend_titles[i]);
    }

    //Add to the the legend
    var data_titles = ["stock-date","stock-data","pop-date","pop-data"];

    for(var i=0; i<4; i++) {
      svg.append('text')
        .attr('x', svg.attr("width") - 150)
        .attr('y', 178 + 30 * i)
        .attr('font-family', 'sans-serif')
        .attr('font-size', '10pt')
        .attr('id',data_titles[i]);
    }

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
     
    for (d of data_stock){
      d.Date = parseTime(d.Date);
      d.Close = +d.Close;
    }

    for (d of data_google_trends){
      d.Date = parseTime(d.Date);
      d.Popularity = +d.Popularity;
    }

      // Parses the date information so that we can restrict the x axis to dates
      //that are covered by both the stock and trends data
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

        // Scale the graph
        scaleTime.domain([minExtent, maxExtent]);
        scaleStock.domain(d3.extent(data_stock, function(d) { return d.Close; }));
        scaleSocial.domain(d3.extent(data_google_trends, function(d) { return d.Popularity; }));

      //Append the Axis, and the Lines
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
	      d3.select('#stock-date')
		  .text("Date: " + (d.Date.getMonth()+1)+
			'/'+d.Date.getUTCDate()+'/'+d.Date.getFullYear());
	      d3.select('#stock-data')
		  .text('Closing Price: ' + (Math.floor(d.Close*100)/100));
	  }).on('mouseout',function() {
	      d3.select(this)
		  .transition()
		  .style('fill','steelblue')
		  .attr('r',1.7);
	  }).on('click', function(d){
              var dateRange = formatDate(d.Date);
              reset_news();
              makeNYTAPICall(FileName,dateRange[0],dateRange[1]);
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
	      d3.select('#pop-date')
		  .text("Date: " + (d.Date.getMonth()+1)+
			'/'+d.Date.getUTCDate()+'/'+d.Date.getFullYear());
	      d3.select('#pop-data')
		  .text('Popularity: ' + d.Popularity);
	  }).on('mouseout',function() {
	      d3.select(this)
		  .transition()
		  .style('fill','green')
		  .attr('r',3);
	  }).on('click', function(d){
        var dateRange = formatDate(d.Date);
        reset_news();
              makeNYTAPICall(FileName,dateRange[0],dateRange[1]);
	  }).style("opacity",0)
	    .transition()
      .duration(1000)
      .style("opacity",1);


      });
    }
