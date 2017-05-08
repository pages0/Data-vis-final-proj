
//http://stackoverflow.com/questions/8489500/how-do-i-subtract-one-week-from-this-date-in-jquery

function formatDate (d){
    var day;
    var month;
    var year;
    var weekago = new Date(d.getFullYear(),d.getMonth()-1,d.getUTCDay());;
    return [""+weekago.getFullYear()+dateParseHelper(weekago.getMonth()+1)+
    dateParseHelper(weekago.getUTCDay()+1),
    ""+d.getFullYear()+dateParseHelper(d.getMonth()+1)+dateParseHelper(d.getUTCDay()+1)];
}


function dateParseHelper (num){
    if (num<10){
	return "0"+num;
    }
    else
    {
	return ""+num;
    }

}

function appendLine(x1,y1,x2,y2) {
  var line = d3.select('svg').append("line")
        .attr("class","mouse_line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
}

function removeLine() {
  d3.select('svg').selectAll('mouse_line').remove();
}
