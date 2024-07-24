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
    console.log("필터링된 결과 업데이트");
}

function initializeGenreButtons() {
    createPositiveGenreButtons();
    createNegativeGenreButtons();
}

// 전역 스코프에 함수 노출
window.initializeGenreButtons = initializeGenreButtons;