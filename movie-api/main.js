// API Configuration - Replace with your actual OMDb API key
        const API_KEY = 'de1bf7f1';
        const BASE_URL = 'https://www.omdbapi.com/';
        

        const api = {

            searchMovies: async (query, page = 1) => {
                const url = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&page=${page}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            },
            

            getMovieDetails: async (imdbID) => {
                const url = `${BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            },
            

            getPopularMovies: async (ids) => {
                const movies = [];
                for (const id of ids) {
                    try {
                        const movie = await api.getMovieDetails(id);
                        if (movie.Response === 'True') {
                            movies.push(movie);
                        }
                    } catch (error) {
                        console.warn(`Failed to fetch movie ${id}:`, error);
                    }
                }
                return movies;
            }
        };

        // Popular movie IDs for random display (top-rated movies from IMDB)
        const popularMovieIds = [
            'tt0111161', // The Shawshank Redemption
            'tt0068646', // The Godfather
            'tt0468569', // The Dark Knight
            'tt0076759', // Star Wars
            'tt0109830', // Forrest Gump
            'tt0110912', // Pulp Fiction
            'tt0133093', // The Matrix
            'tt0137523', // Fight Club
            'tt0120737', // The Lord of the Rings: The Fellowship of the Ring
            'tt0816692', // Interstellar
            'tt0108052', // Schindler's List
            'tt0114369', // Se7en
            'tt0172495', // Gladiator
            'tt0110357', // The Lion King
            'tt0088763', // Back to the Future
            'tt0482571', // The Prestige
            'tt0361748', // Inglourious Basterds
            'tt0993846', // The Wolf of Wall Street
            'tt1375666', // Inception
            'tt0407887', // The Departed
            'tt0167260', // The Lord of the Rings: The Return of the King
            'tt0118799', // Life Is Beautiful
            'tt0120815', // Saving Private Ryan
            'tt0172495', // Gladiator
            'tt0110413', // Léon: The Professional
            'tt0060196', // The Good, the Bad and the Ugly
            'tt0114814', // The Usual Suspects
            'tt0119217', // Good Will Hunting
            'tt0082971', // Raiders of the Lost Ark
            'tt0119698', // Princess Mononoke
            'tt0099685', // Goodfellas
            'tt0073486', // One Flew Over the Cuckoo's Nest
            'tt0086190', // Star Wars: Return of the Jedi
            'tt0086879', // Amadeus
            'tt0087843', // Once Upon a Time in America
            'tt0095765', // Cinema Paradiso
            'tt0095327', // Grave of the Fireflies
            'tt0093058', // Full Metal Jacket
            'tt0078748', // Alien
            'tt0075314', // Taxi Driver
            'tt0075148', // Rocky
            'tt0071562', // The Godfather Part II
            'tt0071315', // Chinatown
            'tt0064116', // Butch Cassidy and the Sundance Kid
            'tt0059578', // The Sound of Music
            'tt0057012', // Dr. Strangelove
            'tt0056592', // To Kill a Mockingbird
            'tt0056172', // Lawrence of Arabia
            'tt0054215', // Psycho
            'tt0053125', // Ben-Hur
            'tt0050083', // 12 Angry Men
            'tt0047478', // Seven Samurai
            'tt0047396', // Rear Window
            'tt0043014', // Sunset Blvd.
            'tt0040522', // Bicycle Thieves
            'tt0038650', // It's a Wonderful Life
            'tt0036855', // Double Indemnity
            'tt0034583', // Casablanca
            'tt0033467', // Citizen Kane
            'tt0027977', // Modern Times
            'tt0022100', // M
            'tt0017136', // Metropolis
            'tt0012349', // The Cabinet of Dr. Caligari
            'tt0004972', // The Gold Rush
            'tt0000417', // A Trip to the Moon
            'tt0000439', // The Great Train Robbery
            'tt0000335', // The Passion of Joan of Arc
            'tt0000123', // Frankenstein
            'tt0000142', // The Cabinet of Dr. Caligari
            'tt0000123', // Nosferatu
            'tt0000123'  // Battleship Potemkin
        ];

        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const slider = document.getElementById('slider');
        const sliderDots = document.getElementById('sliderDots');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const randomMoviesContainer = document.getElementById('randomMovies');
        const loadingSkeleton = document.getElementById('loadingSkeleton');
        const movieModal = document.getElementById('movieModal');
        const closeModal = document.getElementById('closeModal');
        const modalContent = document.getElementById('modalContent');
        const themeToggle = document.getElementById('themeToggle');

        let currentSlide = 0;
        let sliderInterval;
        let isDarkTheme = true;


        function generateSkeletonLoaders(count = 12) {
            let skeletonHTML = '';
            for (let i = 0; i < count; i++) {
                skeletonHTML += `
                    <div class="skeleton-card">
                        <div class="skeleton-poster"></div>
                        <div class="skeleton-info">
                            <div class="skeleton-line skeleton-title"></div>
                            <div class="movie-infoo">
                                <div class="skeleton-line skeleton-year"></div>
                                <div class="skeleton-line skeleton-genre"></div>
                            </div>
                        </div>
                    </div>
                `;
            }
            loadingSkeleton.innerHTML = skeletonHTML;
        }


        themeToggle.addEventListener('click', () => {
            isDarkTheme = !isDarkTheme;
            document.body.classList.toggle('light-theme', !isDarkTheme);
            
            const icon = themeToggle.querySelector('i');
            if (isDarkTheme) {
                icon.className = 'fas fa-moon';
            } else {
                icon.className = 'fas fa-sun';
            }
        });


        async function initApp() {
            generateSkeletonLoaders();
            await loadSliderMovies();
            await loadRandomMovies();
            startSlider();
            
        }

        async function loadSliderMovies() {

            const sliderIds = popularMovieIds
                .sort(() => 0.5 - Math.random())
                .slice(0, 5);
            
            let sliderHTML = '';
            let dotsHTML = '';
            
            for (let i = 0; i < sliderIds.length; i++) {
                try {
                    const movie = await api.getMovieDetails(sliderIds[i]);
                    
                    if (movie.Response === 'True') {
                        const bgImage = movie.Poster !== 'N/A' ? movie.Poster : 'https://placehold.co/1200x500/161b22/8b949e?text=No+Poster';
                        
                        sliderHTML += `
                            <div class="slide">
                                <div class="slide-bg" style="background-image: url('${bgImage}')"></div>
                                <div class="slide-overlay">
                                    <h2 class="slide-title">${movie.Title}</h2>
                                    <div class="slide-meta">
                                        <div class="slide-rating">
                                            <i class="fas fa-star"></i> ${movie.imdbRating}
                                        </div>
                                        <div class="slide-year">${movie.Year}</div>
                                        <div class="slide-genre">${movie.Genre.split(',')[0]}</div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                } catch (error) {
                    console.error('Error loading slider movie:', error);
                    // Fallback slide
                    sliderHTML += `
                        <div class="slide">
                            <div class="slide-bg" style="background-image: url('https://placehold.co/1200x500/161b22/8b949e?text=Movie')"></div>
                            <div class="slide-overlay">
                                <h2 class="slide-title">Movie Title</h2>
                                <div class="slide-meta">
                                    <div class="slide-rating">
                                        <i class="fas fa-star"></i> 0.0
                                    </div>
                                    <div class="slide-year">2023</div>
                                    <div class="slide-genre">Drama</div>
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                dotsHTML += `<div class="dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></div>`;
            }
            
            slider.innerHTML = sliderHTML;
            sliderDots.innerHTML = dotsHTML;
            
            // Add event listeners to dots
            document.querySelectorAll('.dot').forEach(dot => {
                dot.addEventListener('click', () => {
                    currentSlide = parseInt(dot.dataset.slide);
                    updateSlider();
                });
            });
        }

        // Load random movies for grid
        async function loadRandomMovies() {
            try {
                // Get 12 random popular movies
                const shuffledIds = [...popularMovieIds].sort(() => 0.5 - Math.random()).slice(0, 12);
                const movies = await api.getPopularMovies(shuffledIds);
                
                let moviesHTML = '';
                for (const movie of movies) {
                    moviesHTML += `
                        <div class="movie-card fade-in" data-imdbid="${movie.imdbID}">
                            <div class="movie-poster">
                                ${movie.Poster !== 'N/A' 
                                    ? `<img src="${movie.Poster}" alt="${movie.Title}">` 
                                    : '<i class="fas fa-image" style="font-size: 2rem; color: var(--gray);"></i>'
                                }
                                ${movie.imdbRating !== 'N/A' 
                                    ? `<div class="movie-rating-badge">
                                        <i class="fas fa-star" style="font-size: 0.7rem;"></i> ${movie.imdbRating}
                                      </div>` 
                                    : ''
                                }
                            </div>
                            <div class="movie-info">
                                <div class="movie-title">${movie.Title}</div>
                                <div class="movie-infoo">
                                    <span class="movie-year">${movie.Year}</span>
                                    <span class="movie-genre">${movie.Genre.split(',')[0]}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                // Hide skeleton and show movies
                loadingSkeleton.style.display = 'none';
                randomMoviesContainer.style.display = 'grid';
                randomMoviesContainer.innerHTML = moviesHTML;
                
                // Add click event listeners to movie cards
                document.querySelectorAll('.movie-card').forEach(card => {
                    card.addEventListener('click', () => {
                        const imdbID = card.dataset.imdbid;
                        showMovieDetails(imdbID);
                    });
                });
            } catch (error) {
                console.error('Error loading random movies:', error);
                loadingSkeleton.style.display = 'none';
                randomMoviesContainer.style.display = 'grid';
                randomMoviesContainer.innerHTML = `
                    <div class="error" style="grid-column: 1 / -1; text-align: center; padding: 3rem 0; font-size: 1.2rem; color: var(--gray);">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3 style="margin: 1rem 0; color: var(--primary);">Failed to load movies</h3>
                        <p>Please check your internet connection and try again.</p>
                    </div>
                `;
            }
        }

        // Search functionality
        async function searchMovies(query) {
            if (!query.trim()) {
                // Reload popular movies if search is cleared
                loadingSkeleton.style.display = 'grid';
                randomMoviesContainer.style.display = 'none';
                await loadRandomMovies();
                document.querySelector('.section-title').textContent = 'Popular Movies';
                return;
            }

            loadingSkeleton.style.display = 'grid';
            randomMoviesContainer.style.display = 'none';
            document.querySelector('.section-title').textContent = `Search Results for "${query}"`;
            
            try {
                const data = await api.searchMovies(query);
                
                if (data.Response === 'True') {
                    let moviesHTML = '';
                    const limitedResults = data.Search.slice(0, 12);
                    
                    // Get full details for each movie
                    const detailedMovies = [];
                    for (const movie of limitedResults) {
                        try {
                            const fullMovie = await api.getMovieDetails(movie.imdbID);
                            if (fullMovie.Response === 'True') {
                                detailedMovies.push(fullMovie);
                            }
                        } catch (error) {
                            console.warn(`Failed to get details for ${movie.imdbID}:`, error);
                        }
                    }
                    
                    for (const movie of detailedMovies) {
                        moviesHTML += `
                            <div class="movie-card fade-in" data-imdbid="${movie.imdbID}">
                                <div class="movie-poster">
                                    ${movie.Poster !== 'N/A' 
                                        ? `<img src="${movie.Poster}" alt="${movie.Title}">` 
                                        : '<i class="fas fa-image" style="font-size: 2rem; color: var(--gray);"></i>'
                                    }
                                    ${movie.imdbRating !== 'N/A' 
                                        ? `<div class="movie-rating-badge">
                                            <i class="fas fa-star" style="font-size: 0.7rem;"></i> ${movie.imdbRating}
                                          </div>` 
                                        : ''
                                    }
                                </div>
                                <div class="movie-info">
                                    <div class="movie-title">${movie.Title}</div>
                                    <div class="movie-infoo">
                                        <span class="movie-year">${movie.Year}</span>
                                        <span class="movie-genre">${movie.Genre.split(',')[0]}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                    
                    loadingSkeleton.style.display = 'none';
                    randomMoviesContainer.style.display = 'grid';
                    randomMoviesContainer.innerHTML = moviesHTML;
                    

                    document.querySelectorAll('.movie-card').forEach(card => {
                        card.addEventListener('click', () => {
                            const imdbID = card.dataset.imdbid;
                            showMovieDetails(imdbID);
                        });
                    });
                } else {
                    loadingSkeleton.style.display = 'none';
                    randomMoviesContainer.style.display = 'grid';
                    randomMoviesContainer.innerHTML = `
                        <div class="error" style="grid-column: 1 / -1; text-align: center; padding: 3rem 0; font-size: 1.2rem; color: var(--gray);">
                            <i class="fas fa-search"></i>
                            <h3 style="margin: 1rem 0; color: var(--primary);">No movies found</h3>
                            <p>Try searching for something else or check your spelling.</p>
                        </div>
                    `;
                }
            } catch (error) {
                loadingSkeleton.style.display = 'none';
                randomMoviesContainer.style.display = 'grid';
                randomMoviesContainer.innerHTML = `
                    <div class="error" style="grid-column: 1 / -1; text-align: center; padding: 3rem 0; font-size: 1.2rem; color: var(--gray);">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3 style="margin: 1rem 0; color: var(--primary);">Something went wrong</h3>
                        <p>Failed to fetch search results. Please try again later.</p>
                    </div>
                `;
                console.error('Error fetching search results:', error);
            }
        }


        function updateSlider() {
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
            

            document.querySelectorAll('.dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % document.querySelectorAll('.slide').length;
            updateSlider();
        }

        function prevSlide() {
            const slideCount = document.querySelectorAll('.slide').length;
            currentSlide = (currentSlide - 1 + slideCount) % slideCount;
            updateSlider();
        }

        function startSlider() {
            sliderInterval = setInterval(nextSlide, 5000);
            
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetSliderInterval();
            });
            
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetSliderInterval();
            });
        }

        function resetSliderInterval() {
            clearInterval(sliderInterval);
            sliderInterval = setInterval(nextSlide, 5000);
        }


        async function showMovieDetails(imdbID) {
            try {
                const movie = await api.getMovieDetails(imdbID);
                
                if (movie.Response === 'True') {
                    let modalHTML = `
                        <div class="modal-poster">
                            ${movie.Poster !== 'N/A' 
                                ? `<img src="${movie.Poster}" alt="${movie.Title}">` 
                                : '<i class="fas fa-image"></i>'
                            }
                        </div>
                        <h2 class="modal-title">${movie.Title} (${movie.Year})</h2>
                        <div class="modal-meta">
                            ${movie.imdbRating !== 'N/A' 
                                ? `<div class="modal-rating">
                                    <i class="fas fa-star"></i> ${movie.imdbRating}/10
                                  </div>` 
                                : ''
                            }
                            <div class="modal-year">${movie.Year}</div>
                            <div class="modal-runtime">${movie.Runtime}</div>
                            <div class="modal-genre">${movie.Genre}</div>
                        </div>
                        <p class="modal-plot">${movie.Plot}</p>
                        <div class="modal-details">
                            <div><span class="modal-label">Director:</span> <span class="modal-value">${movie.Director}</span></div>
                            <div><span class="modal-label">Writers:</span> <span class="modal-value">${movie.Writer}</span></div>
                            <div><span class="modal-label">Cast:</span> <span class="modal-value">${movie.Actors}</span></div>
                            <div><span class="modal-label">Language:</span> <span class="modal-value">${movie.Language}</span></div>
                            <div><span class="modal-label">Country:</span> <span class="modal-value">${movie.Country}</span></div>
                            <div><span class="modal-label">Awards:</span> <span class="modal-value">${movie.Awards}</span></div>
                            <div><span class="modal-label">Box Office:</span> <span class="modal-value">${movie.BoxOffice || 'N/A'}</span></div>
                            <div><span class="modal-label">Production:</span> <span class="modal-value">${movie.Production || 'N/A'}</span></div>
                        </div>
                    `;
                    
                    modalContent.innerHTML = modalHTML;
                    movieModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            } catch (error) {
                console.error('Error fetching movie details:', error);
            }
        }


        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            searchMovies(query);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                searchMovies(query);
            }
        });


        closeModal.addEventListener('click', () => {
            movieModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        movieModal.addEventListener('click', (e) => {
            if (e.target === movieModal) {
                movieModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });


        generateSkeletonLoaders();

        initApp();