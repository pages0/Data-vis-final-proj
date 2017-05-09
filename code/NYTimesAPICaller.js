// Built by LucyBot. www.lucybot.com
var base_url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";

//Given the formated begining and ending dates,
// as well as the company name, calls the New York Times API
var makeNYTAPICall = function(company_name, begin_date, end_date) {
  if(company_name.includes('_')) {
    company_name = company_name.replace("_"," ");
  }
  if(company_name == 'WENDYS'){
	  company_name ='WENDY\'S'
  }
  var url = base_url + '?' + $.param({
    'api-key': "55d0b896b15d4157bb77cf88f0c6625b",
    'q' : company_name,
    'begin_date' : begin_date,
    'end_date' : end_date,
    'hl' : 'true',
    'sort' : 'newest'
  });
  $.ajax({
    url: url,
    method: 'GET',
  }).done(function(result) {
    console.log(result);
    set_news(result);
  }).fail(function(err) {
    throw err;
  });
};

//Updates the visual display of the news
var set_news = function(news) {

  var news_list = d3.select('#news');
  var date = "";
  for(story of news.response.docs) {

    date = story.pub_date.substring(0,10);
    news_list.append('div')
              .attr('class','card')
              .style('opacity','0')
              .html("<a href=" + story.web_url + "> <strong style='font-size:13pt'>" + story.headline.main + "</strong></a> <br/>"
                     + date + "<br/> <strong>Snippet:</strong> " + story.snippet)
              .transition(500)
                .style('opacity','1');
  };
};

var reset_news = function() {
  var news_list = d3.select('#news')
                    .selectAll('div')
                    .transition(500)
                      .style('opacity','0')
                    .remove();
}
