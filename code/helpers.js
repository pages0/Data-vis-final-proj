var addCompanies = function(selector, company_list) {

  var options = selector
    .selectAll('option')
  	.data(company_list).enter()
  	.append('option')
  		.text(function (d) { return d; });
}

var onChange = function() {
	var selectValue = d3.select('select').property('value');
  console.log("Current company = " + selectValue);
  current_company = selectValue;
};
