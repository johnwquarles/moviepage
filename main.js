var FIREBASE_URL = "https://movieagenda.firebaseio.com/movielist.json";
var API_URL = "http://www.omdbapi.com/?t=";
var $SUBMITBUTTON = $(".submit");
var $TEXTFIELD = $(".textfield");
var $MOVIEINFO = $(".movie-info");
var $MOVIETABLECONTAINER = $(".movie-table-container");
var movie_info_obj;

initialLoad();

$SUBMITBUTTON.click(function(event) {
  event.preventDefault();
  var movie_title = $TEXTFIELD.val();
  var request_url = API_URL + movie_title.split(" ").join("+");
  $.get(request_url, addMovieInfo, 'jsonp');
})

$MOVIEINFO.on('click', '.add-button', function(event) {
  event.preventDefault();
  writeToFirebase(movie_info_obj);
})

$MOVIETABLECONTAINER.on('click', 'button', function(event) {
  event.preventDefault();
  deleteFromFirebase($(this).closest('tr').attr('data_id'));
  $(this).closest('tr').fadeOut(500, function() {
    $(this).closest('tr').remove();
    if (!($('td').length)) {
      $('table').remove();
    }
  });
})

function addMovieInfo(obj) {
  movie_info_obj = obj;
  $MOVIEINFO.empty();
  if (!(obj.Year)) {
    $MOVIEINFO.append(makeError());
    return false;
  }
  $MOVIEINFO.append(makeMovieInfo(obj));
}

function makeError() {
  var $error = $('<p>(´Ａ｀。) No results!</p>')
  $error.addClass("error");
  return $error;
}

function makeMovieInfo(obj) {
  var $info_container = $('<div></div>');
  $info_container.addClass("info-container");
  var $title = $("<p>" + obj.Title + "</p>");
  $title.addClass("title");
  var $year = $("<p>" + obj.Year + "</p>");
  var $director = $("<p>Director: " + obj.Director + "</p>");
  var $plot = $("<p>" + obj.Plot + "</p>");
  var $rating = $("<p>" + obj.Rated + "</p>");
  var $runtime = $("<p>" + obj.Runtime + "</p>");
  var $add_button = $("<button>Add to my list</button>");
  $add_button.addClass("add-button btn btn-default btn-success");
  if (obj.Poster !== "N/A") {
    var $poster = $("<img src='" + obj.Poster + "'></img>");
    $poster.addClass("pull-left");
    $info_container.append($poster)
  }
  $info_container.append($title).append($year).append($director).append($plot).append($runtime).append($add_button);
  return $info_container;
}

function addToTable(obj, id) {
  if (!($("table").length)) {
    $MOVIETABLECONTAINER.append(makeTableHeader());
  }
  $("table").append(makeTableRow(obj, id));
}

function makeTableHeader() {
  var $table= $("<table></table>");
  $table.addClass("table table-striped");
  var $header_row = $("<tr></tr>");
  var $header_elements = $("<th></th><th>Title</th><th>Year</th><th>Rating</th><th></th>");
  $header_row.append($header_elements);
  $table.append($header_row);
  return $table;
}

function makeTableRow(obj, id) {
  var $row = $("<tr></tr>");
  var $poster_td;
  $row.attr("data_id", id || obj.data_id);
  obj.Poster === "N/A" ? $poster_td = $("<td>Not found!</td>") : $poster_td = $("<td><img src='" + obj.Poster + "'></src>");
  $other_rows = $("<td>" + obj.Title + "</td><td>" + obj.Year + "</td><td>" + obj.Rated + "</td><td><button>Watched</button></td>");
  $other_rows.find("button").addClass("btn btn-default btn-danger");
  $row.append($poster_td).append($other_rows);
  return $row;
}

function writeToFirebase(obj) {
  $.post(FIREBASE_URL, JSON.stringify(obj), function(response) {
    obj.data_id = response.name;
    addToTable(obj);
  })
}

function deleteFromFirebase(id) {
  var deleteUrl = FIREBASE_URL.slice(0, -5) + '/' + id + '.json';
  $.ajax({url: deleteUrl, type: 'DELETE'});
}

function initialLoad2() {
  $.get(FIREBASE_URL, function(db_data) {
    db_data && Object.keys(db_data).forEach(function(key) {
      addToTable(db_data[key], key);
    })
  })
}

function initialLoad() {
  $.get(FIREBASE_URL, function(db_data) {
    db_data && _(db_data).forEach(function(value, key) {
      addToTable(value, key);
    }).value();
  })
}
