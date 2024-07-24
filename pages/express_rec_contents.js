document.addEventListener('DOMContentLoaded', () => {
    const getRecommendationBtn = document.querySelector('.btn-open-modal');
    const confirmBtn = document.querySelector('.btn-confirm');
    const closeModalBtn = document.querySelector('.btn-close-modal');
    const modal = document.querySelector('.modal');
    const genreButtons = document.querySelectorAll('.genre-btn');

    getRecommendationBtn.addEventListener('click', openModal);
    confirmBtn.addEventListener('click', handleConfirm);
    closeModalBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    initializeGenreButtons(genreButtons);
});

function generateSVG() {
    // Implement the logic to generate SVG
    // Replace this with your actual implementation
    console.log('Generating SVG...');
}

const testBtn = document.querySelector('.btn-test');
testBtn.addEventListener('click', generateSVG);

function openModal() {
    const modal = document.querySelector('.modal');
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.querySelector('.modal');
    modal.style.display = 'none';
    resetGenreSelections();
}

function handleConfirm() {
    const selectedGenres = getSelectedGenres();
    sendSelectedGenres(selectedGenres);
    closeModal();
  }

function showLoading() {
    const container = document.getElementById('recommendation-container');
    container.innerHTML = '<p>Loading recommendation...</p>';
}

function showError(message) {
    const container = document.getElementById('recommendation-container');
    container.innerHTML = `<p>Error: ${message}</p>`;
}

function displayRecommendation(recommendation) {
    const container = document.getElementById('recommendation-container');
    container.innerHTML = `<p>Recommendation: ${recommendation}</p>`;
}

function sendSelectedGenres(selectedGenres) {
    // Implement the logic to send the selected genres to the server
    // and return a promise that resolves with the recommendation
    return new Promise((resolve, reject) => {
        // Replace this with your actual implementation
        const recommendation = `Recommendation based on selected genres: ${selectedGenres.join(', ')}`;
        resolve(recommendation);
    });
}

function initializeGenreButtons() {
    const genreButtons = document.querySelectorAll('.genre-button');
    genreButtons.forEach(button => {
      button.addEventListener('click', toggleGenreButton);
    });
  }

function toggleGenreButton(event) {
    event.target.classList.toggle('active');
  }

function getSelectedGenres() {
   const genreButtons = document.querySelectorAll('.genre-button.active');
   return Array.from(genreButtons).map(button => button.textContent);
}

function resetGenreSelections() {
    const genreButtons = document.querySelectorAll('.genre-button');
    genreButtons.forEach(button => {
      button.classList.remove('active');
    });
}
