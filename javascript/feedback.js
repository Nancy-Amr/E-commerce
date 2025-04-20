console.log('feedback.js loaded');

function initializeStarRating() {
    const stars = document.querySelectorAll('.rating i');
    const ratingInput = document.getElementById('rating-value');

    console.log('Found stars:', stars.length);

    if (stars.length === 0) {
        console.warn('No stars found. The DOM might not be ready.');
        return;
    }

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const rating = star.getAttribute('data-rating');
            highlightStars(rating);
        }, { capture: true });

        star.addEventListener('mouseout', () => {
            const selectedRating = ratingInput.value || 0;
            highlightStars(selectedRating);
        }, { capture: true });

        star.addEventListener('click', () => {
            console.log('Star clicked:', star.getAttribute('data-rating'));
            const rating = star.getAttribute('data-rating');
            ratingInput.value = rating;
            highlightStars(rating);
        }, { capture: true });
    });

    function highlightStars(rating) {
        stars.forEach(star => {
            const starRating = star.getAttribute('data-rating');
            if (starRating <= rating) {
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
    }

    // Handle form submission to prevent interference
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Form submitted:', {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                rating: document.getElementById('rating-value').value,
                feedback: document.getElementById('feedback').value
            });
        });
    }
}

// Try initializing immediately
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    initializeStarRating();
});

// Fallback: Retry after a delay in case main.js modifies the DOM
setTimeout(() => {
    console.log('Retrying star initialization after delay');
    initializeStarRating();
}, 1000);