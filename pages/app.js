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
        if (selectedGenres.positiveGenres.length === 0 && selectedGenres.negativeGenres.length === 0) {
            showErrorMessage('Please select at least one genre before confirming.');
            return;
        }
        sendSelectedGenres(selectedGenres);
    } else {
        showErrorMessage('An error occurred while processing your selection.');
    }
    closeModal();
}

function sendSelectedGenres(genres) {
    console.log('Sending selected genres:', genres);
    // 여기에서 서버로 데이터를 보내는 로직을 구현합니다.
    // 예를 들어, fetch를 사용하여 서버에 요청을 보낼 수 있습니다:
    
    fetch('/api/recommend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(genres),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Recommendation received:', data);
        // 여기에서 받은 추천 결과를 처리합니다.
        // 예를 들어, createMovieRecommendation 함수를 호출할 수 있습니다.
        if (data.movie) {
            createMovieRecommendation(data.movie);
        } else {
            showErrorMessage('No recommendation available based on your preferences.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showErrorMessage('An error occurred while fetching recommendations.');
    });
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