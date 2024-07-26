const genres = ['action', 'animation', 'comedy', 'crime', 'documentation', 'drama', 'european', 'family', 'fantasy', 'history', 'horror', 'music', 'reality', 'romance', 'scifi', 'sport', 'thriller', 'war', 'western'];
let positiveGenres = [];
let negativeGenres = [];

function initializeGenreButtons() {
    createGenreButtons('positive-buttons', positiveGenres, 'positive');
    createGenreButtons('negative-buttons', negativeGenres, 'negative');
}

function createGenreButtons(containerId, genreArray, className) {
    const container = document.getElementById(containerId);
    genres.forEach(genre => {
        const button = document.createElement('button');
        button.textContent = genre;
        button.id = `${genre}-${className}-btn`;
        button.addEventListener('click', () => toggleGenre(genre, genreArray, className));
        container.appendChild(button);
    });
}

function toggleGenre(genre, genreArray, className) {
    const index = genreArray.indexOf(genre);
    const button = document.getElementById(`${genre}-${className}-btn`);
    if (index === -1) {
        genreArray.push(genre);
        button.classList.add(className);
    } else {
        genreArray.splice(index, 1);
        button.classList.remove(className);
    }
    console.log(`${className} genres:`, genreArray);
}

function resetGenreSelections() {
    positiveGenres = [];
    negativeGenres = [];
    genres.forEach(genre => {
        document.getElementById(`${genre}-positive-btn`).classList.remove('positive');
        document.getElementById(`${genre}-negative-btn`).classList.remove('negative');
    });
}

function sendSelectedGenres() {
    const data = {
        positiveGenres: positiveGenres,
        negativeGenres: negativeGenres
    };

    showLoading();

    fetch('/api/recommend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch recommendations');
        }
        return response.json();
    })
    .then(result => {
        console.log('Success:', result);
        createMovieRecommendation(result.recommendedMovie);
    })
    .catch((error) => {
        console.error('Error:', error);
        showError(error.message);
    });
}

function createMovieRecommendation(movie) {
    const container = d3.select("#recommendation-container");
    container.selectAll("*").remove();

    const svg = container.append("svg")
        .attr("viewBox", "0 0 800 400")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "auto");

    svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "#141414");

    svg.append("text")
        .attr("x", 20)
        .attr("y", 40)
        .attr("fill", "#ffffff")
        .attr("font-size", 24)
        .text(movie.title);

    svg.append("text")
        .attr("x", 20)
        .attr("y", 70)
        .attr("fill", "#cccccc")
        .attr("font-size", 16)
        .text(`Rating: ${movie.rating} | Runtime: ${movie.runtime} min`);

    const button = svg.append("g")
        .attr("transform", "translate(650, 360)")
        .style("cursor", "pointer");

    button.append("rect")
        .attr("width", 130)
        .attr("height", 30)
        .attr("rx", 15)
        .attr("fill", "#e50914");

    button.append("text")
        .attr("x", 65)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#ffffff")
        .text("More Info");
}