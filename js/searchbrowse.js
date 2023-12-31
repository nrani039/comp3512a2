    //Javascript for the Radar Chart was found on Chart.js: https://www.chartjs.org/docs/latest/charts/radar.html

    const creditButton = document.getElementById("creditButton");
    function creditDropdown() {
    creditButton.style.display='block';
    const timeout = setTimeout(stopCredits, 5000);
    }


    function stopCredits(){
        creditButton.style.display='none';
    }

    document.addEventListener("DOMContentLoaded", function () {

        const artistList = JSON.parse(content);
        const tableContainer = document.getElementById("table-container");
        const playlistContainer = document.getElementById("playlist-container");
        const singleSongContainer = document.getElementById("single-song-container");
        const searchContainer = document.getElementById("search-container");
        const dropdown = document.getElementById("dropdown");

        const selectArtists = document.getElementById("selectArtists")
        const selectGenres = document.getElementById("selectGenre")

        const radioGenres = document.getElementById("radioGenres");
        const labelGenres = document.getElementById("radioGenreLabel");

        const radioArtists = document.getElementById("radioArtists");
        const labelArtists = document.getElementById("radioArtistLabel");

        const titleInput = document.getElementById("titleFilter");
        const titleRadio = document.getElementById("radioTitle");
        const labelTitle = document.getElementById("radioTitleLabel");

        const url = 'https://www.randyconnolly.com/funwebdev/3rd/api/music/songs-nested.php';

        const loader = document.createElement('div');
        loader.textContent = 'Loading...';

        const filterButton=document.getElementById("filterButton");
        filterButton.addEventListener('click', function () {
            applyFilter();
        });

        const clearButton=document.getElementById("clearButton");
        clearButton.addEventListener('click', function () {
            clearSelection();
        });


        function toggleRowSelection(row) {
            row.classList.toggle("selected");
        }


        tableContainer.addEventListener("click", function (event) {
            const clickedElement = event.target;

            if (clickedElement.tagName === "TD" && clickedElement.parentNode.tagName === "TR") {
                toggleRowSelection(clickedElement.parentNode);
            }
        });


        let songs = [];
        let sortColumn = null;
        let sortDirection = 1;

        let songStorage=localStorage.getItem("songs");
        if(songStorage){
            songs.push(...JSON.parse(songStorage));

        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('songData', JSON.stringify(data));
                songs = Array.isArray(data) ? data : [];

                const artists = [...new Set(songs.map(song => song.artist.name))];
    
                const genres = [...new Set(songs.map(song => song.genre.name))];

                artists.forEach(artist => {
                    const optionArtist = document.createElement('option');
                    optionArtist.textContent = artist;
                    selectArtists.appendChild(optionArtist);
                });

                genres.forEach(genre => {
                    const optionGenre = document.createElement('option');
                    optionGenre.textContent = genre;
                    selectGenres.appendChild(optionGenre);
                });

                headers.forEach((header, index) => {
                    const headerCell = headerRow.cells[index];
                    headerCell.addEventListener('click', function () {
                        sortTable(index);
                    });
                });

                loader.style.display = 'none';
                tableContainer.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                loader.textContent = 'Error fetching data';
            });
        

        const headers = ["Title ^", "Artist ^", "Year ^", "Popularity ^", "Genre ^"];
        const table = document.createElement("table");
        const headerRow = table.insertRow(0);

        function createHeaderCell(headerText, columnIndex) {
            const header = document.createElement("th");
            header.innerHTML = "<b>" + headerText + "</b>";
            header.addEventListener("click", function () {
                sortTable(columnIndex);
            });
            return header;
        }

        for (const headerText of headers) {
            headerRow.appendChild(createHeaderCell(headerText, headers.indexOf(headerText)));
        }

        function getColumnValue(song, columnIndex) {
            const column = ["title", "artist.name", "year", "details.popularity", "genre.name"];
            let value = song;
            for (const prop of column[columnIndex].split('.')) {
                value = value && value[prop];
            }
            return value;
        

        }

        function makeTable(songs) {

            table.innerHTML = "";
            const headerRow = table.insertRow(0);
        
            for (const headerText of headers) {
                headerRow.appendChild(createHeaderCell(headerText, headers.indexOf(headerText)));
            }
        
            for (const song of songs) {
                const row = table.insertRow();
        
                row.addEventListener('click', function () {
                    hideSearchPage();
                    showSingleSongView(song);
                });
        
                for (const headerText of headers) {
                    const cell = row.insertCell();
                    cell.innerHTML = getColumnValue(song, headers.indexOf(headerText));
                    cell.dataset.songId = song.song_id;
                }
        
                const addButton = document.createElement('button');
                addButton.textContent = 'Add';
                addButton.addEventListener('click', function (event) {
                    event.stopPropagation() ;
                    const selectedSongs = [song.song_id];
                    addToPlaylist(selectedSongs);
            
                });
                row.appendChild(addButton);
            }
        
            tableContainer.innerHTML = "";
            tableContainer.appendChild(table);

        }



        function sortTable(columnIndex) {
            if (sortColumn === null) {
                sortColumn = columnIndex;
            } else if (sortColumn === columnIndex) {
                sortDirection *= -1;
            } else {
                sortDirection = 1;
                sortColumn = columnIndex;
            }

            songs.sort(function (a, b) {
                const columnA = getColumnValue(a, columnIndex);
                const columnB = getColumnValue(b, columnIndex);
                return columnA < columnB ? -sortDirection : (columnA > columnB ? sortDirection : 0);
            });

            applyFilter();
        }


        function addToPlaylist(selectedSongs) {
            const playlistTable = document.getElementById("playlist-table");
        

            if (!playlistTable.querySelector('thead')) {
                const headerRow = playlistTable.createTHead().insertRow();
                const headerKeys = ["Title", "Year", "Artist", "Popularity", "Genre"];
                headerKeys.forEach(headerKey => {
                    const headerCell = headerRow.insertCell();
                    headerCell.innerHTML = headerKey;
                });
            }
        
            for (const songId of selectedSongs) {
                const song = songs.find(song => song.song_id == songId);
        
                if (song) {
                    const row = playlistTable.insertRow();
        
                    row.addEventListener('click', function () {
                        showSingleSongView(song);
                    });
        
                    const keysToDisplay = ["title", "year", "artist.name", "details.popularity", "genre.name"];
        
                    keysToDisplay.forEach(key => {
                        const cell = row.insertCell();
                        const keyParts = key.split('.');
                        let value = song;
                        for (const part of keyParts) {
                            value = value && value[part];
                        }
                        cell.innerHTML = value || "";
                    });
        
                    const removeButton = document.createElement('button');
                    removeButton.textContent = 'Remove';
                    removeButton.addEventListener('click', function (event) {
                        event.stopPropagation();
                        removeSongFromPlaylist(row);
                    });
                    const removeCell = row.insertCell();
                    removeCell.appendChild(removeButton);
                }
            }
        }
        
    function removeSongFromPlaylist(row) {
        const playlistTable = document.getElementById("playlist-table");
        playlistTable.deleteRow(row.rowIndex);
    }

    function hidePlaylistView() {
        playlistContainer.style.display = 'none';
    }

    function hideSingleSong(){
        singleSongContainer.style.display = 'none';
    }

    function showSearchPage(){
        searchContainer.style.display = 'block';
    }

    function toMinutes(time){
        const minutes = Math.floor(time/60);
        const seconds = time % 60;
        return{
            minutes: minutes,
            seconds: seconds
        };
    }

    const playlistButton = document.getElementById("playlistButton");
    playlistButton.addEventListener('click', function(){
        hideSearchPage();
    })

    const closeButtonP = document.getElementById("closeViewPlaylist");
    closeButtonP.addEventListener('click', function(){
        showSearchPage();
        hidePlaylistView();
    })

    const closeButtonSS = document.getElementById("closeViewSS");
    closeButtonSS.addEventListener('click', function(){
        showSearchPage();    
        hideSingleSong();
    })



    function showSingleSongView(song){
        hidePlaylistView();
        singleSongContainer.style.display = 'block';
        
        //fast facts list
        const titleElement = document.getElementById('factsTitle').textContent= "Title: " +song.title;
        const artistElement = document.getElementById('factsArtist').textContent= "Artist: " +song.artist.name;
        const yearElement = document.getElementById('factsYear').textContent= "Year: " +song.year;
        const genre = document.getElementById('factsGenre').textContent= "Genre: " +song.genre.name;
        const totalTime = toMinutes(song.details.duration);
        const duration = document.getElementById('factsDuration').textContent= "Duration: " +totalTime.minutes + ":" + totalTime.seconds;

        //analysis data list
        const analysisData=document.getElementById("analyticsTable")

        const bpm = document.getElementById("bpm").textContent="BPM: " + song.details.bpm;
        const energy = document.getElementById("energy").textContent="Energy: " + song.analytics.energy;
        const danceability = document.getElementById('danceability').textContent="Danceability: " + song.analytics.danceability;
        const liveness = document.getElementById('liveness').textContent="Liveness: " + song.analytics.liveness;
        const valence = document.getElementById('valence').textContent="Valence: " + song.analytics.valence;
        const acousticness = document.getElementById('acousticness').textContent="Acousticness: " + song.analytics.acousticness;
        const speechiness = document.getElementById('speechiness').textContent="Speechiness: " + song.analytics.speechiness;
        const popularity = document.getElementById('popularity').textContent="Popularity: " + song.details.popularity;
        const loudness = document.getElementById('loudness').textContent="Loudness: " + song.details.loudness;

        const ctx = document.getElementById('myChart');
    
        new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Danceability', 'Energy', 'Valence', 'Speechiness', 'Loudness', 'Liveness'],
            datasets: [{
            label: song.title + " Information",
            data: [song.analytics.danceability, song.analytics.energy, song.analytics.valence, 
                song.analytics.speechiness, song.details.loudness, song.analytics.liveness],
            borderWidth: 1,
            backgroundColor: 'rgba(5, 140, 66, 0.5)',
            
            }]
        },
        options: {
            scales: {
            y: {
                beginAtZero: false
            }
            }
        }
        });
    }


        function hideSearchPage() {
        searchContainer.style.display = "none";
    
            playlistContainer.style.display = 'block';
        }

            function applyFilter() {
            const selectedFilterType = document.querySelector('input[name="filterType"]:checked').value;

        
            const titleFilter = titleInput.value.toLowerCase();
        
            
            let selectedValue;
            if (selectedFilterType === 'genres') {
                selectedValue = selectGenres.value;
            } else if (selectedFilterType === 'artists') {
                selectedValue = selectArtists.value;
            } else if (selectedFilterType === 'title') {
                
                selectedValue = '';
            }
        
            
            let filteredSongs = songs;
        
            if (selectedFilterType !== 'title' && selectedValue) {
                filteredSongs = filteredSongs.filter(song => {
                    if (selectedFilterType === 'genres') {
                        return song.genre.name === selectedValue && song.title.toLowerCase().includes(titleFilter);
                    } else if (selectedFilterType === 'artists') {
                        return song.artist.name === selectedValue && song.title.toLowerCase().includes(titleFilter);
                    }
                });
            } else if (selectedFilterType === 'title') {
            
                filteredSongs = filteredSongs.filter(song => song.title.toLowerCase().includes(titleFilter));
            }
        
            makeTable(filteredSongs);
        
            tableContainer.style.display = filteredSongs.length > 0 ? 'block' : 'none';
        }

            function clearSelection() {
            const selectedCells = document.querySelectorAll('.selected');
            selectedCells.forEach(cell => cell.classList.remove('selected'));

            document.querySelector('input[name="filterType"]:checked').checked = false;
            titleInput.value = ''; 
            tableContainer.innerHTML = '';

        }

    });











        











