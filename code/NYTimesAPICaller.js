// Built by LucyBot. www.lucybot.com
var base_url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";

var makeNYTAPICall = function(company_name, begin_date, end_date) {

  var url = base_url + '?' + $.param({
    'api-key': "55d0b896b15d4157bb77cf88f0c6625b",
    'q' : company_name,
    'begin_date' : begin_date,
    'end_date' : end_date
  });

  $.ajax({
    url: url,
    method: 'GET',
  }).done(function(result) {
    //console.log(result);
    set_news(result);
  }).fail(function(err) {
    throw err;
  });
};

var set_news = function(news) {
  console.log(news.response.docs);
  var news_list = d3.select('#news');

  for(story of news.response.docs) {
    console.log(story.snippet);
    news_list.append('p').text(story.snippet);
  };
};

var reset_news = function() {
  var news_list = d3.select('#news').selectAll('p').remove();

}
