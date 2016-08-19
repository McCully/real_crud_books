$(document).ready(function() {
    getBooks();

    // add a book
    $('#book-submit').on('click', postBook);
    $("#book-list").on('click', '.update', putBook);
    $("#book-list").on('click', '.delete', deleteBook);
    $("#genre-select").change(function() {
        orgBook($('select option:selected'));
    });
});
var usedGenres = [];
/**
 * Retrieve books from server and append to DOM
 */
function getBooks() {
    $.ajax({
        type: 'GET',
        url: '/books',
        success: function(books) {
          $('#book-list').empty();
            emptyList();
            console.log('GET /books returns:', books);
            books.forEach(function(book) {
                findGenre(book);
                var $el = $('<div></div>');

                var bookProperties = ['title', 'author', 'published', 'genre'];

                bookProperties.forEach(function(property) {
                    var inputType = 'text';
                    // if(property=='published'){
                    //   // inputType='date';
                    //   book[property] = new Date(book[property]);
                    // }
                    var $input = $('<input type="' + inputType + '"id="' + property + '"name="' + property + '"/>');
                    $input.val(book[property]);
                    $el.append($input);
                });

                $el.data('bookId', book.id);
                $el.append('<button class="update">Update</button>');
                $el.append('<button class="delete">Delete</button>');
                // $el.append('<strong>' + book.title + '</strong>');
                // $el.append(' <em>' + book.author + '</em');
                // $el.append(' <time>' + book.published + '</time>');
                // $el.append(" " + book.edition + "ed ");
                // $el.append(" " + book.publisher);
                $('#book-list').append($el);
            });
        },

        error: function(response) {
            console.log('GET /books fail. No books could be retrieved!');
        },
    });
}
/**
 * Add a new book to the database and refresh the DOM
 */
function postBook() {
    event.preventDefault();

    var book = {};

    $.each($('#book-form').serializeArray(), function(i, field) {
        book[field.name] = field.value;
    });

    $.ajax({
        type: 'POST',
        url: '/books',
        data: book,
        success: function() {
            console.log('POST /books works!');
            $('#book-list').empty();
            getBooks();
        },

        error: function(response) {
            console.log('POST /books does not work...');
        },
    });

}

function putBook() {
    var book = {};
    var input = $(this).parent().children().serializeArray();
    $.each(input, function(i, field) {
        book[field.name] = field.value;
    });
    var bookId = $(this).parent().data('bookId');

    $.ajax({
        type: 'PUT',
        url: '/books/' + bookId,
        data: book,
        success: function() {
            $('#book-list').empty();
            getBooks();
        },

        error: function() {
            console.log('Error PUT /books' + bookId);
        },
    });
}

function deleteBook() {
    var bookId = $(this).parent().data('bookId');
    $.ajax({
        type: 'DELETE',
        url: '/books/' + bookId,
        success: function() {
            console.log('DELETE Success');
            $('#book-list').empty();
            getBooks();
        },
        error: function() {
            console.log("FAILURE");
        }
    });
}

function findGenre(book) {
    var numMatching = 0;
    var $el = $("#genre-select");
    var genre = book.genre;
    var selector = "#" + genre;
    usedGenres.forEach(function(pastGenre) {
        if (genre == pastGenre) {
            numMatching++;
        }
    });
    if (numMatching > 0) {
        numMatching = 0;
        return;
    } else {
        var $input = ('<option id="' + genre + '" value="' + genre + '">' + genre + '</option>');
        $el.append($input);
        $(selector).data('genre', genre);
        usedGenres.push(genre);
    }
}

function orgBook(specificGenre) {
    var selectedGenre = $(specificGenre).data('genre');
    if (selectedGenre == undefined) {
        getBooks();
    } else {
        $.ajax({
            type: 'GET',
            url: '/books',
            success: function(books) {
              $('#book-list').empty();
              emptyList();
                books.forEach(function(book) {
                    findGenre(book);
                    if (book.genre != selectedGenre) {
                        return;
                    } else {
                        var $el = $('<div></div>');

                        var bookProperties = ['title', 'author', 'published', 'genre'];

                        bookProperties.forEach(function(property) {
                            var inputType = 'text';
                            var $input = $('<input type="' + inputType + '"id="' + property + '"name="' + property + '"/>');
                            $input.val(book[property]);
                            $el.append($input);
                        });

                        $el.data('bookId', book.id);
                        $el.append('<button class="update">Update</button>');
                        $el.append('<button class="delete">Delete</button>');
                        $('#book-list').append($el);
                    }
                });
            },

            error: function(response) {
                console.log('GET /books fail. No books could be retrieved!');
            }
        });
    }
}

function emptyList() {
  usedGenres = [];
  clearFields();
    $("#genre-select").empty();
    $('#genre-select').append('<option value="none">--</option>');
    $("#genre-select").append('<option id="all-genres" value="all">All</option>');
}
function clearFields(){
  document.getElementById("title").value = " ";
  document.getElementById("author").value = " ";
  $('#published').replaceWith('<input type="date" id="published" name="published"  class="form-control"/>')
  document.getElementById("genre").value = " ";
}
