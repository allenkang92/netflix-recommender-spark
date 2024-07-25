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
        showErrorMessage('An error occurred while initializing the application.');
    }

    if (!isDataLoaded()) {
        console.warn('Movie data is not loaded. Some features may not work.');
        showErrorMessage('Movie data is not loaded. Some features may not work.');
    }
});


function openModal() {
    const modal = document.querySelector('.modal');
    if (modal) modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) modal.style.display = 'none';
    if (typeof resetGenreSelections === 'function') {
        resetGenreSelections();
    }
}

function handleConfirm() {
    if (typeof getSelectedGenres === 'function') {
        const selectedGenres = getSelectedGenres();
        sendSelectedGenres(selectedGenres);
    }
    closeModal();
}

function sendSelectedGenres(genres) {
    console.log('Sending selected genres:', genres);
    // 여기에 실제 서버로 데이터를 보내는 로직을 구현합니다.
}

function testSVGGeneration() {
    if (isDataLoaded()) {
        try {
            const randomMovie = mockMovieData[Math.floor(Math.random() * mockMovieData.length)];
            if (typeof createMovieRecommendation === 'function') {
                createMovieRecommendation(randomMovie);
            } else {
                throw new Error('createMovieRecommendation function is not defined');
            }
        } catch (error) {
            console.error('Error in SVG generation:', error);
            showErrorMessage('An error occurred while generating the movie recommendation.');
        }
    } else {
        showErrorMessage('Movie data is not available. Please try again later.');
    }
}

function isDataLoaded() {
    return typeof mockMovieData !== 'undefined' && Array.isArray(mockMovieData) && mockMovieData.length > 0;
}

function showErrorMessage(message) {
    const container = document.getElementById('recommendation-container');
    if (container) {
        container.innerHTML = `<p style="color: red; font-size: 16px; padding: 20px; background-color: #ffeeee; border: 1px solid #ffcccc; border-radius: 5px;">${message}</p>`;
        container.style.display = 'block';
    } else {
        console.error('Error container not found. Message:', message);
        alert(message); // 폴백으로 alert 사용
    }
}

// 전역 스코프에 필요한 함수들을 노출합니다.
window.testSVGGeneration = testSVGGeneration;