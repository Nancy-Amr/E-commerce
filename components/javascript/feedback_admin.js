document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('feedbackTableBody');
    const searchInput = document.getElementById('searchInput');
    const ratingFilter = document.getElementById('ratingFilter');
    const refreshBtn = document.getElementById('refreshBtn');
    const emptyState = document.getElementById('emptyState');

    // Fetch and display feedback
    async function fetchFeedback() {
    try {
        console.log('Fetching feedback...');
        const response = await fetch('/api/feedback');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error('Failed to fetch feedback');
        }
        
        const feedbacks = await response.json();
        console.log('Received feedback:', feedbacks); // Add this line
        displayFeedback(feedbacks);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load feedback. Please try again.');
    }
}

function displayFeedback(feedbacks) {
    tableBody.innerHTML = '';
    
    if (feedbacks.length === 0) {
        emptyState.classList.remove('d-none');
        return;
    }
    
    emptyState.classList.add('d-none');
    
    feedbacks.forEach(feedback => {
        const row = document.createElement('tr');
        row.className = 'feedback-card';
        
        // Use fallbacks for missing fields
        const email = feedback.Email || feedback.bool1 || 'No email';
        const fullName = feedback.FullName || 'Anonymous';
        const feedbackText = feedback.Feedback || 'No feedback text';
        const rating = feedback.Rating || 0;
        
        // Format date
        const date = new Date(feedback.createdAt || Date.now());
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        // Create rating stars
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating 
                ? '<i class="fas fa-star rating-stars"></i>' 
                : '<i class="far fa-star rating-stars"></i>';
        }
        
        row.innerHTML = `
            <td>${fullName}</td>
            <td><a href="mailto:${email}">${email}</a></td>
            <td>${stars}</td>
            <td>${feedbackText}</td>
            <td>${formattedDate}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${feedback._id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteFeedback);
    });
}

    // Delete feedback
    async function deleteFeedback(e) {
        const feedbackId = e.currentTarget.getAttribute('data-id');
        if (!confirm('Are you sure you want to delete this feedback?')) return;
        
        try {
            const response = await fetch(`/api/feedback/${feedbackId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete feedback');
            
            fetchFeedback(); // Refresh the list
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete feedback. Please try again.');
        }
    }

    // Filter feedback
    function filterFeedback() {
        const searchTerm = searchInput.value.toLowerCase();
        const ratingValue = ratingFilter.value;
        
        const rows = tableBody.querySelectorAll('tr');
        let visibleCount = 0;
        
        rows.forEach(row => {
            const name = row.cells[0].textContent.toLowerCase();
            const email = row.cells[1].textContent.toLowerCase();
            const feedback = row.cells[3].textContent.toLowerCase();
            const rating = row.querySelectorAll('.fa-star.fas').length;
            
            const matchesSearch = name.includes(searchTerm) || 
                                email.includes(searchTerm) || 
                                feedback.includes(searchTerm);
            
            const matchesRating = ratingValue === '0' || rating === parseInt(ratingValue);
            
            if (matchesSearch && matchesRating) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });
        
        emptyState.classList.toggle('d-none', visibleCount > 0);
    }

    // Event listeners
    searchInput.addEventListener('input', filterFeedback);
    ratingFilter.addEventListener('change', filterFeedback);
    refreshBtn.addEventListener('click', fetchFeedback);

    // Initial load
    fetchFeedback();
});