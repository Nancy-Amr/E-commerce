document.addEventListener("DOMContentLoaded", function () {
    const viewButtons = document.querySelectorAll(".btn-view");
    const updateButtons = document.querySelectorAll(".btn-update");
    const statusSelects = document.querySelectorAll(".status-select");
    
    const modalOverlay = document.getElementById("view-modal");
    const modalContent = document.getElementById("order-details-content");
    const closeModalBtn = document.querySelector(".close-modal");
  
    // Mock data
    const orderData = {
      "ORD-1234": {
        customer: "Jane Doe",
        items: ["Premium T-Shirt x2", "Designer Jeans x1"],
        total: "$168.45",
        status: "Processing"
      }
    };
  
    // Initialize status selects
    statusSelects.forEach(select => {
      updateSelectStyle(select);
      
      select.addEventListener("change", () => {
        const orderId = select.getAttribute("data-order-id");
        const newStatus = select.value;
        
        alert(`Status for ${orderId} changed to "${newStatus}"`);
        updateSelectStyle(select);
      });
    });
  
    // View handler
    viewButtons.forEach(button => {
      button.addEventListener("click", () => {
        const orderId = button.getAttribute("data-order-id");
        const order = orderData[orderId];
  
        if (order) {
          modalContent.innerHTML = `
            <p><strong>Customer:</strong> ${order.customer}</p>
            <p><strong>Items:</strong> ${order.items.join(", ")}</p>
            <p><strong>Total:</strong> ${order.total}</p>
            <p><strong>Status:</strong> <span class="status-select status-${order.status.toLowerCase()}">${order.status}</span></p>
          `;
        } else {
          modalContent.innerHTML = "<p>Order not found.</p>";
        }
  
        modalOverlay.classList.add("active");
      });
    });
  
    // Update button (frontend only)
    updateButtons.forEach(button => {
      button.addEventListener("click", () => {
        const orderId = button.getAttribute("data-order-id");
        alert(`Pretend updating order ${orderId} 😄`);
      });
    });
  
    // Close modal
    closeModalBtn.addEventListener("click", () => {
      modalOverlay.classList.remove("active");
    });
  
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove("active");
      }
    });
  });
  
  function updateSelectStyle(select) {
    const status = select.value;
    
    // Remove all status classes
    select.classList.remove(
      "status-processing", 
      "status-shipped", 
      "status-delivered", 
      "status-canceled"
    );
    
    // Add the current status class
    select.classList.add(`status-${status}`);
  }