// Built by LucyBot. www.lucybot.com
var base_url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";

var makeNYTAPICall = function(company_name, begin_date, end_date) {
  if(company_name.includes('_')) {
    company_name = company_name.replace("_"," ");
    console.log(company_name);
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
    //console.log(result);
    set_news(result);
  }).fail(function(err) {
    throw err;
  });
};

var set_news = function(news) {
  console.log(news.response.docs);
  var news_list = d3.select('#news');
  var date = "";
  for(story of news.response.docs) {
    console.log(story.snippet);
    date = story.pub_date.substring(0,10);
    news_list.append('p').html("<strong style='font-size:13pt'>" + story.headline.main + "</strong> <br/>"
                               + date + "<br/> <strong>Snippet:</strong> " + story.snippet);
  };
};

var reset_news = function() {
  var news_list = d3.select('#news').selectAll('p').remove();

}
