const genres = ['action', 'animation', 'comedy', 'crime', 'documentation', 'drama', 'european', 'family', 'fantasy', 'history', 'horror', 'music', 'reality', 'romance', 'scifi', 'sport', 'thriller', 'war', 'western'];

let positiveGenres = [];
let negativeGenres = [];

function createPositiveGenreButtons() {
    const container = document.getElementById('positive-buttons');
    genres.forEach(genre => {
        const button = document.createElement('button');
        button.textContent = genre;
        button.id = `${genre}-positive-btn`;
        button.addEventListener('click', () => positiveGenre(genre));
        container.appendChild(button);
    });
}

function createNegativeGenreButtons() {
    const container = document.getElementById('negative-buttons');
    genres.forEach(genre => {
        const button = document.createElement('button');
        button.textContent = genre;
        button.id = `${genre}-negative-btn`;
        button.addEventListener('click', () => negativeGenre(genre));
        container.appendChild(button);
    });
}

function positiveGenre(genre) {
    const index = positiveGenres.indexOf(genre);
    const button = document.getElementById(`${genre}-positive-btn`);
    if (index === -1) {
        positiveGenres.push(genre);
        button.classList.add('positive');
    } else {
        positiveGenres.splice(index, 1);
        button.classList.remove('positive');
    }
    updateFilteredResults();
}

function negativeGenre(genre) {
    const index = negativeGenres.indexOf(genre);
    const button = document.getElementById(`${genre}-negative-btn`);
    if (index === -1) {
        negativeGenres.push(genre);
        button.classList.add('negative');
    } else {
        negativeGenres.splice(index, 1);
        button.classList.remove('negative');
    }
    updateFilteredResults();
}

function updateFilteredResults() {
    console.log("Positive Genres:", positiveGenres);
    console.log("Negative Genres:", negativeGenres);
    // 여기에 실제 필터링 로직을 구현합니다.
}

function initializeGenreButtons() {
    createPositiveGenreButtons();
    createNegativeGenreButtons();
}

function getSelectedGenres() {
    return {
        positiveGenres: positiveGenres,
        negativeGenres: negativeGenres
    };
}

function resetGenreSelections() {
    positiveGenres = [];
    negativeGenres = [];
    genres.forEach(genre => {
        const positiveButton = document.getElementById(`${genre}-positive-btn`);
        const negativeButton = document.getElementById(`${genre}-negative-btn`);
        if (positiveButton) positiveButton.classList.remove('positive');
        if (negativeButton) negativeButton.classList.remove('negative');
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

    // 영화 제목
    svg.append("text")
        .attr("x", 20)
        .attr("y", 40)
        .attr("fill", "#ffffff")
        .attr("font-size", "24px")
        .text(`${movie.title} (${movie.releaseYear})`);

    // 평점, 상영 시간, IMDb 점수
    svg.append("text")
        .attr("x", 20)
        .attr("y", 70)
        .attr("fill", "#cccccc")
        .attr("font-size", "16px")
        .text(`Rating: ${movie.rating} | Runtime: ${movie.runtime} min | IMDb: ${movie.imdbScore}`);

    // IMDb 점수 시각화
    const scoreX = 20;
    const scoreY = 90;
    const scoreWidth = 50;
    const scoreHeight = 25;
    svg.append("rect")
        .attr("x", scoreX)
        .attr("y", scoreY)
        .attr("width", scoreWidth)
        .attr("height", scoreHeight)
        .attr("fill", "#f5c518")
        .attr("rx", 5);

    svg.append("text")
        .attr("x", scoreX + scoreWidth / 2)
        .attr("y", scoreY + scoreHeight / 2 + 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#000000")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(movie.imdbScore.toFixed(1));

    // 장르
    svg.append("text")
        .attr("x", scoreX + scoreWidth + 10)
        .attr("y", scoreY + scoreHeight / 2 + 5)
        .attr("fill", "#cccccc")
        .attr("font-size", "14px")
        .text(`Genres: ${movie.genres.join(", ")}`);

    // 감독
    svg.append("text")
        .attr("x", 20)
        .attr("y", 140)
        .attr("fill", "#ffffff")
        .attr("font-size", "16px")
        .text(`Director: ${movie.director}`);

    // 출연진
    svg.append("text")
        .attr("x", 20)
        .attr("y", 170)
        .attr("fill", "#cccccc")
        .attr("font-size", "14px")
        .text(`Cast: ${movie.cast.join(", ")}`);

    // 줄거리
    const description = svg.append("text")
        .attr("x", 20)
        .attr("y", 200)
        .attr("fill", "#ffffff")
        .attr("font-size", "14px");

    wrapText(description, movie.description, 760);

    container.style('display', 'block');
}

function wrapText(text, str, width) {
    let words = str.split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1,
        x = text.attr("x"),
        y = text.attr("y"),
        dy = 0,
        tspan = text.text(null)
                    .append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", dy + "em");
    while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", ++lineNumber * lineHeight + dy + "em")
                        .text(word);
        }
    }
}

// 전역 스코프에 필요한 함수들을 노출합니다.
window.initializeGenreButtons = initializeGenreButtons;
window.getSelectedGenres = getSelectedGenres;
window.resetGenreSelections = resetGenreSelections;
window.createMovieRecommendation = createMovieRecommendation;