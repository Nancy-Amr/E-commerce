console.log('feedback.js loaded');

function initializeStarRating() {
    if (!window.location.pathname.includes('feedback.html')) {
        console.log('Not on feedback page, skipping initialization.');
        return;
    }

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
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('feedback-form');
    if (!form) return;
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        
        const formData = {
          FullName: document.getElementById('name')?.value.trim() || '',
          Email: document.getElementById('email')?.value.trim() || '',
          Rating: parseInt(document.getElementById('rating-value')?.value) || 0,
          Feedback: document.getElementById('feedback')?.value.trim() || ''
        };
  
        // Validate required fields before sending
        if (!formData.FullName || !formData.Email || !formData.Rating || !formData.Feedback) {
          throw new Error('All fields are required');
        }
  
        const response = await fetch('http://localhost:5000/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Submission failed');
        }
  
        alert('Feedback submitted successfully!');
        form.reset();
        
      } catch (error) {
        console.error('Submission error:', error);
        alert(`Error: ${error.message}`);
      } finally {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = false;
      }
    });
});
document.getElementById('feedback-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Critical - stops page reload
    
    const formData = {
      FullName: document.getElementById('name').value.trim(),
      Email: document.getElementById('email').value.trim(),
      Rating: parseInt(document.getElementById('rating-value').value),
      Feedback: document.getElementById('feedback').value.trim()
    };
  
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
  
      if (!response.ok) throw new Error(await response.text());
      
      const result = await response.json();
      showNotification('success', 'Feedback submitted successfully!');
      
    } catch (error) {
      showNotification('error', error.message);
    }
  });
  
  function showNotification(type, message) {
    const notif = document.getElementById('notification');
    notif.textContent = message;
    notif.className = `alert alert-${type} show`; // Added 'show' class
    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => notif.textContent = '', 300); // Wait for fade-out
    }, 5000);
  }

setTimeout(() => {
    console.log('Retrying star initialization after delay');
    initializeStarRating();
}, 1000);