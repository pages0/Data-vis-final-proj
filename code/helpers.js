
//http://stackoverflow.com/questions/8489500/how-do-i-subtract-one-week-from-this-date-in-jquery

function formatDate (d){
    var day;
    var month;
    var year;
    var weekago = new Date(d.getTime() -(60)*60*24*1*1000);
    return [""+d.getFullYear()+"|"+dateParseHelper(d.getMonth())+"|"+dateParseHelper(d.getDay()),
	    ""+weekago.getFullYear()+"|"+dateParseHelper(weekago.getMonth())+"|"+
	    dateParseHelper(weekago.getDay())];
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
