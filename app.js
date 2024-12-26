/** Given a search term, search for tv shows from API.
 *  Returns an array of show objects: [ {id, name, summary, image}, ... ].
 */
async function searchShows ( query )
{
    const response = await axios.get( 'http://api.tvmaze.com/search/shows', {
        params: { q: query }
    } );

    return response.data.map( ( result ) =>
    {
        const show = result.show;
        return {
            id: show.id,
            name: show.name,
            summary: show.summary || 'No summary available.',
            image: show.image ? show.image.medium : 'https://tinyurl.com/tv-missing',
        };
    } );
}

/** Populate shows list:
 *  - given list of shows, add shows to DOM
 */
function populateShows ( shows )
{
    const $showsList = $( '#shows-list' );
    $showsList.empty();

    for ( let show of shows )
    {
        const $show = $( `
      <div class="col-md-6 col-lg-3 Show" data-show-id="${ show.id }">
        <div class="card" data-show-id="${ show.id }">
          <img class="card-img-top" src="${ show.image }" alt="${ show.name }">
          <div class="card-body">
            <h5 class="card-title">${ show.name }</h5>
            <p class="card-text">${ show.summary }</p>
            <button class="btn btn-primary episodes-btn">Episodes</button>
          </div>
        </div>
      </div>
    `);
        $showsList.append( $show );
    }
}

/** Given a show ID, get episodes from API.
 *  Returns array of episodes: [ { id, name, season, number }, ... ].
 */
async function getEpisodes ( showId )
{
    const response = await axios.get( `http://api.tvmaze.com/shows/${ showId }/episodes` );

    return response.data.map( ( episode ) => ( {
        id: episode.id,
        name: episode.name,
        season: episode.season,
        number: episode.number,
    } ) );
}

/** Populate episodes list:
 *  - given list of episodes, add to DOM
 */
function populateEpisodes ( episodes )
{
    const $episodesList = $( '#episodes-list' );
    $episodesList.empty();

    for ( let episode of episodes )
    {
        const $item = $( `
      <li>${ episode.name } (season ${ episode.season }, number ${ episode.number })</li>
    `);
        $episodesList.append( $item );
    }

    $( '#episodes-area' ).show();
}

// Handle form submission to search for shows
$( '#search-form' ).on( 'submit', async function ( evt )
{
    evt.preventDefault();

    const query = $( '#search-query' ).val().trim();
    if ( !query ) return;

    const shows = await searchShows( query );
    populateShows( shows );
} );

// Handle click on "Episodes" button
$( '#shows-list' ).on( 'click', '.episodes-btn', async function ()
{
    const showId = $( this ).closest( '.Show' ).data( 'show-id' );
    const episodes = await getEpisodes( showId );
    populateEpisodes( episodes );
} );
