document.addEventListener('DOMContentLoaded', () => {
    const getRecommendationBtn = document.querySelector('.btn-open-modal');
    const confirmBtn = document.querySelector('.btn-confirm');
    const closeModalBtn = document.querySelector('.btn-close-modal');
    const testSVGBtn = document.querySelector('.testSVG');
    const modal = document.querySelector('.modal');

    if (getRecommendationBtn) getRecommendationBtn.addEventListener('click', openModal);
    if (confirmBtn) confirmBtn.addEventListener('click', handleConfirm);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (testSVGBtn) testSVGBtn.addEventListener('click', testSVGGeneration);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    if (typeof initializeGenreButtons === 'function') {
        initializeGenreButtons();
    } else {
        console.error('initializeGenreButtons is not defined');
    }
});

function openModal() {
    const modal = document.querySelector('.modal');
    if (modal) modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) modal.style.display = 'none';
    resetGenreSelections();
}

function handleConfirm() {
    const selectedGenres = getSelectedGenres();
    sendSelectedGenres(selectedGenres);
    closeModal();
}

function testSVGGeneration() {
    if (typeof mockMovieData !== 'undefined' && Array.isArray(mockMovieData) && mockMovieData.length > 0) {
        const randomMovie = mockMovieData[Math.floor(Math.random() * mockMovieData.length)];
        createMovieRecommendation(randomMovie);
        const container = document.getElementById('recommendation-container');
        if (container) container.style.display = 'block';
    } else {
        console.error('Mock movie data is not available or is empty');
    }
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
        .text(`${movie.title} (${movie.releaseYear})`);

    // 추가 SVG 요소들...

    container.style('display', 'block');
}

// 전역 스코프에 함수 노출
window.testSVGGeneration = testSVGGeneration;