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

function positiveGenre(genre) {
    const index = positiveGenres.indexOf(genre);
    const button = document.getElementById(`${genre}-positive-btn`);
    if (index === -1) {
        positiveGenres.push(genre);
        button.classList.add('positive');
        console.log(`${genre} 추가됨`);
    } else {
        positiveGenres.splice(index, 1);
        button.classList.remove('positive');
        console.log(`${genre} 제거됨`);
    }
    console.log("현재 선택된 장르:", positiveGenres);
    updateFilteredResults();
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

function negativeGenre(genre) {
    const index = negativeGenres.indexOf(genre);
    const button = document.getElementById(`${genre}-negative-btn`);
    if (index === -1) {
        negativeGenres.push(genre);
        button.classList.add('negative');
        console.log(`${genre} 추가됨`);
    } else {
        negativeGenres.splice(index, 1);
        button.classList.remove('negative');
        console.log(`${genre} 제거됨`);
    }
    console.log("현재 선택된 장르:", negativeGenres);
    updateFilteredResults();
}

function updateFilteredResults() {
    console.log("필터링된 결과 업데이트");
}

const modal = document.querySelector('.modal');
const btnOpenModal = document.querySelector('.btn-open-modal');
const btnCloseModal = document.querySelector('.btn-close-modal');
const btnConfirm = document.querySelector('.btn-confirm');

btnOpenModal.addEventListener("click", () => {
    modal.style.display = "flex";
});

btnCloseModal.addEventListener("click", () => {
    modal.style.display = "none";
    positiveGenres = [];
    negativeGenres = [];
    resetGenreButtons();
});

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
        positiveGenres = [];
        negativeGenres = [];
        resetGenreButtons();
    }
});

btnConfirm.addEventListener("click", () => {
    sendSelectedGenres();
    modal.style.display = "none";
});

function sendSelectedGenres() {
    const data = {
        positiveGenres: positiveGenres,
        negativeGenres: negativeGenres
    };

    fetch('/api/user-preferences', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log('성공:', result);
        createMovieRecommendation(result.recommendedMovie);
    })
    .catch((error) => {
        console.error('에러:', error);
    });
}

function resetGenreButtons() {
    genres.forEach(genre => {
        const positiveButton = document.getElementById(`${genre}-positive-btn`);
        const negativeButton = document.getElementById(`${genre}-negative-btn`);
        positiveButton.classList.remove('positive');
        negativeButton.classList.remove('negative');
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

document.addEventListener('DOMContentLoaded', () => {
    createPositiveGenreButtons();
    createNegativeGenreButtons();
});