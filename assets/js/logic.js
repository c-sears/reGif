$(() => {
    var appID = 'lgZa3QKsTwoxJSlrDPrfRJYtJG31zlRe';

    var viewingFavs = false;
    var displayingRandom = false;

    var searchFor = '',
        searchNum = 9
        searchRating = 'r';

    var favsArray = JSON.parse(localStorage.getItem('favorites'));

    if (!Array.isArray(favsArray)){
        favsArray = [];
    }
  
    var mainFunctions = {
        getGifs: () => {
            var giphyURL = 'https://api.giphy.com/v1/gifs/search';
                giphyURL += '?' + $.param({
                    'api_key': appID,
                    'q': searchFor,
                    'limit': searchNum,
                    'rating': searchRating
                })
        
            $.ajax({
                url: giphyURL,
                method: 'GET'
            }).then((results) => {
                let gifs = results.data;
                // Clear all of the elements and start with a new set
                $('#my_new_gifs').empty();
                // Calling the function that updates the DOM using my results from the ajax call as the parameter
                mainFunctions.showGifs(gifs);
            })
        },
        showGifs: (gifs, callNum) => {
            for (var i = 0; i < gifs.length;  i++){
            // Creating all of the required elements (if there's an easier way to do this I would love to hear about it!!)
            var gif_container = $('<div>').addClass('col-lg-4 col-md-6 col-xs-12 gif_container set-height');
            var gif_box = $('<div>').addClass('card gif_box');
            var card_img = $('<img>')
                .addClass('card-img w-100 d-block images')
                .attr({
                    'data-state': 'still',
                    'data-value': i,
                    'data-rating': gifs[i].rating,
                    'data-animated': gifs[i].images.fixed_width.url,
                    'data-still': gifs[i].images.fixed_width_still.url
                });
            // adding an if statement to check if I am creating a new element off of a random gif, if true.. change the data states with `i` to callNum
            if (displayingRandom){
                card_img.attr({
                    'data-value': callNum,
                })
            };
            var card_ovrl = $('<div>').addClass('card-img-overlay d-inlineblock hover_animate').attr('data-gif-num', i);
            if (displayingRandom){
                card_ovrl.attr('data-gif-num', callNum)
            }
            var card_rating = $('<h4>').addClass('rating');
            // Checking to see if viewingFavs is false in which case it will create a button to add gif to favs
            if (!viewingFavs){
                var fav_btn = $('<button class="btn btn-dark">').addClass('saveToFave').attr('data-value', i);
                // Creating the heart icon that will allow users to save gif to favorites
                var icon = $('<i id="fav_icon">').addClass('typcn typcn-heart-full-outline');
                // inserting the new icon into the button
                fav_btn.html(icon);
            }
            // Assembling all of the peices
            gif_container.html(gif_box);
            gif_box.append(card_img);
            gif_box.append(card_ovrl);
            card_ovrl.html(card_rating);
            card_ovrl.append(fav_btn);
            // almost done.. filling in each of these new elements with the new data
            card_img.attr('src', gifs[i].images.fixed_width_still.url);
            card_rating.text('Rating: ' + gifs[i].rating);
            // and.. finally.. we append this new card to the row
            $('#my_new_gifs').prepend(gif_container);
            }
        },
        newBtn: () => {
            let newBtn = $('<button class="btn btn-primary bg-info">');
            newBtn.addClass('click_to_gif');
            newBtn.text($('#searchGif').val());
            $('#searchGif').val('');
            $('#buttons').append(newBtn);
        },
        saveFavorites: (elem) => {
            // Creating a new objects to store the favorites into before pushing it to the 'favorites' array in localStorage
            var localObject = {
                images: {
                    fixed_width_still: {
                        url: ''
                    },
                    fixed_width: {
                        url: ''
                    }
                },
                rating: ''
            };
            var test_value = elem.attr('data-value');
            $('.images').each((l, elem) => {
                var arg_value = $(elem).attr('data-value');
                if (arg_value == test_value){
                    localObject.images.fixed_width_still.url = $(elem).attr('data-still');
                    localObject.images.fixed_width.url = $(elem).attr('data-animated')
                    localObject.rating = $(elem).attr('data-rating');
                    // Push these values to the favsArray (global scope)
                    favsArray.push(localObject);
                    // Update the favsArray item in localStorage
                    localStorage.setItem('favorites', JSON.stringify(favsArray));
                }
            })
        },
        showFavorites: () => {
            mainFunctions.showGifs(favsArray)
        },
        clearHistory: () => {
            favsArray = [];
            localStorage.removeItem('favorites'); // remove the favorites key from local storage. Eliminates bug on refresh after clearing faves.
            $('#my_new_gifs').empty(); // clear all of the gifs
        },
        getRandomGifs: (callNum) => {
            var giphyURL = 'https://api.giphy.com/v1/gifs/random';
                giphyURL += '?' + $.param({
                    'api_key': appID,
                    'rating': searchRating
                });

                $.ajax({
                    url: giphyURL,
                    method: 'GET'
                }).then((results) => {
                    var holderArray = []; // creating an empty array that will be pushed a single value equal to the json object results from the ajax call
                    var gif = results.data; // this is actually pretty cool.. since I loop through this function 9 times (probably inefecient, but.. eh) I can assign results.data to a variable and pass it into the mainFunctions.showGifs method as a parameter.. idk.. I think it's pretty cool
                    holderArray.push(gif);
                    mainFunctions.showGifs(holderArray, callNum);
                    console.log(gif)
                });
        },
        toggleGif: (passAlong) => {
            var currentGif = ($(passAlong).attr('data-gif-num'));
            $('.images').each((l, elem) => {
                var argGif = $(elem).attr('data-value')
                if (argGif == currentGif){
                    let state = $(elem).attr('data-state');
                    if (state === 'still'){
                        $(elem).attr('src', $(elem).attr('data-animated'));
                        $(elem).attr('data-state', 'animated');
                    } else if(state === 'animated'){
                        $(elem).attr('src', $(elem).attr('data-still'));
                        $(elem).attr('data-state', 'still');
                    }
                }
            });
        }
    }

    
    // It doesn't search.. it adds a button
    $('#subGifSrch').on('click', mainFunctions.newBtn);
        
    $('#searchGif').on('keyup', (e) => {
        e.preventDefault();
        if (e.keyCode == 13){
            mainFunctions.newBtn();
        };
    });
    
    
    $('#buttons').on('click', '.click_to_gif', (e) => {
        searchFor = e.target.innerText;
        // set viewingFavs to false so the searh query will return items with fav button
        viewingFavs = false;
        mainFunctions.getGifs();
    });

    $(document).on('click', '.saveToFave', function() {
        var elem = $(this);
        mainFunctions.saveFavorites(elem);
    });

    $(document).on('mouseenter', '.hover_animate', (elem) => {
        var passAlong = elem.target;
        mainFunctions.toggleGif(passAlong);
    });

    $(document).on('mouseleave', '.hover_animate', (elem) => {
        var passAlong = elem.target;
        mainFunctions.toggleGif(passAlong);
    });

    $(document).on('click', '.hover_animate', (elem) => {
        var passAlong = elem.target;
        mainFunctions.toggleGif(passAlong);
    })

    $('.favorites').click(() =>{
        // Clear all of the elements and start with a new set
        $('#my_new_gifs').empty();
        // Set viewingFavs to true
        viewingFavs = true;
        // Calling the function that updates the DOM using my results from the ajax call as the parameter
        mainFunctions.showGifs(favsArray);
    })

    $('#clearHistory').click(mainFunctions.clearHistory);
    
    // button that calls sends 9 calls to the GIPHY API to show 9 random gifs on the screen
    $(document).on('click', '#getRandom', () => {
        displayingRandom = true;
        $('#my_new_gifs').empty();
        var callNum = 0;
        for (var i = 0; i < 9; i++){
            mainFunctions.getRandomGifs(callNum);
            callNum += 1;
        }
    })
})