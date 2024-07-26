// API의 기본 URL을 설정합니다. 실제 배포 시 이 URL을 적절히 변경해야 합니다.
const API_BASE_URL = 'http://localhost:8000';

// Top 20 영화를 가져오는 함수
async function getTop20Movies() {
    try {
        const response = await fetch(`${API_BASE_URL}/top20`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const movies = await response.json();
        return movies;
    } catch (error) {
        console.error("Could not fetch top 20 movies:", error);
        return [];
    }
}

// 장르 기반 추천을 받는 함수
async function getRecommendations(positiveGenres, negativeGenres) {
    try {
        const response = await fetch(`${API_BASE_URL}/recommend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                positive: positiveGenres,
                negative: negativeGenres
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const recommendedMovies = await response.json();
        return recommendedMovies;
    } catch (error) {
        console.error("Could not fetch recommendations:", error);
        return [];
    }
}

// 영화 목록을 화면에 표시하는 함수
function displayMovies(movies) {
    const container = document.getElementById('recommendation-container');
    container.innerHTML = ''; // 기존 내용을 지웁니다.

    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.className = 'movie';
        movieElement.innerHTML = `
            <h2>${movie.title}</h2>
            <p>Rating: ${movie.rating}</p>
            <p>IMDB Score: ${movie.imdb_score}</p>
            <p>Genres: ${movie.genres.join(', ')}</p>
            <p>Director: ${movie.director}</p>
            <p>Cast: ${movie.cast}</p>
            <p>${movie.description}</p>
        `;
        container.appendChild(movieElement);
    });
}

// 페이지 로드 시 Top 20 영화를 표시합니다.
window.addEventListener('load', async () => {
    const top20Movies = await getTop20Movies();
    displayMovies(top20Movies);
});

// 추천 받기 버튼 클릭 시 추천을 요청합니다.
document.querySelector('.btn-confirm').addEventListener('click', async () => {
    const positiveGenres = Array.from(document.querySelectorAll('#positive-buttons .selected'))
        .map(button => button.textContent);
    const negativeGenres = Array.from(document.querySelectorAll('#negative-buttons .selected'))
        .map(button => button.textContent);

    const recommendedMovies = await getRecommendations(positiveGenres, negativeGenres);
    displayMovies(recommendedMovies);
});