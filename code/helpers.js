var addCompanies = function(selector, company_list) {

  var company_list2 = ["A","B","VC"];
  var options = selector
    .selectAll('option')
  	.data(company_list2).enter()
  	.append('option')
  		.text(function (d) { return d; });
}

var onchange = function() {
	var selectValue = d3.select('selector').property('value');
  console.log(selectValue);
};
