class ArrayQueue {
    constructor(capacity = 14) {
        this.capacity = capacity;
        this.queue = new Array(capacity).fill(null);
        this.head = 0;
        this.tail = 0;  // Start tail at 0 instead of -1
        this.size = 0;
    }

    enqueue(value) {
        if (this.size === this.capacity) {
            throw new Error("Queue is full");
        }
        this.queue[this.tail] = value;
        this.tail = (this.tail + 1) % this.capacity;
        this.size++;
    }

    dequeue() {
        if (this.size === 0) {
            throw new Error("Queue is empty");
        }
        const value = this.queue[this.head];
        this.queue[this.head] = null;
        this.head = (this.head + 1) % this.capacity;
        this.size--;
        return value;
    }

    clear() {
        this.queue.fill(null);
        this.head = 0;
        this.tail = 0;  // Reset tail to 0
        this.size = 0;
    }

    isEmpty() {
        return this.size === 0;
    }

    isFull() {
        return this.size === this.capacity;
    }

    getCurrentTailPosition() {
        // Return the position where the next element would be inserted
        return this.size === 0 ? 0 : this.tail;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const queueVisual = document.querySelector("#array-container");
    const arrayBoxes = document.querySelector("#array-boxes");
    const arrayIndices = document.querySelector("#array-indices");
    const sizeValue = document.querySelector("#size_value");
    const queueInput = document.querySelector("#queue-input");
    const enqueueBtn = document.querySelector("#enqueue-btn");
    const dequeueBtn = document.querySelector("#dequeue-btn");
    const clearBtn = document.querySelector("#clear-btn");
    const backBtn = document.querySelector("#back-btn");
    const maximizeBtn = document.querySelector("#maximize-btn");
    const statusDisplay = document.querySelector("#status");
    const speedSlider = document.querySelector("#speed-slider");
    const headValue = document.querySelector("#head-value");
    const tailValue = document.querySelector("#tail-value");

    const queue = new ArrayQueue(14);
    let animationSpeed = 500; // Default speed
    let isAnimating = false;

    function initializeVisualization() {
        // Create array boxes (0-13) vertically with numbers beside each box
        arrayBoxes.innerHTML = '';
        
        for (let i = 0; i < 14; i++) {
            // Create row container
            const row = document.createElement('div');
            row.className = 'array-row';
            
            // Create index number
            const index = document.createElement('div');
            index.className = 'array-index';
            index.textContent = i;
            
            // Create box
            const box = document.createElement('div');
            box.className = 'array-box';
            box.id = `box-${i}`;
            
            // Add index and box to row
            row.appendChild(index);
            row.appendChild(box);
            
            // Add row to container
            arrayBoxes.appendChild(row);
        }
        
        updateVisualization();
    }

    function updateVisualization() {
        // Update size display
        sizeValue.textContent = queue.size;
        
        // Update head and tail displays
        headValue.textContent = queue.isEmpty() ? '0' : queue.head;
        tailValue.textContent = queue.getCurrentTailPosition();
        
        // Update array boxes
        for (let i = 0; i < 14; i++) {
            const box = document.getElementById(`box-${i}`);
            box.className = 'array-box';
            box.textContent = '';
            
            if (queue.queue[i] !== null) {
                box.classList.add('filled');
                box.textContent = queue.queue[i];
            }
            
            // Highlight head and tail positions
            if (!queue.isEmpty()) {
                if (i === queue.head) {
                    box.classList.add('head-position');
                }
            }
            
            // Always show tail position (where next element will go)
            if (i === queue.getCurrentTailPosition()) {
                box.classList.add('tail-position');
            }
        }
        
        // Update status
        if (queue.isEmpty()) {
            statusDisplay.textContent = "Queue is empty - Next element will be added at position 0";
        } else if (queue.isFull()) {
            statusDisplay.textContent = "Queue is full";
        } else {
            statusDisplay.textContent = `Queue has ${queue.size} element(s) - Next element will be added at position ${queue.getCurrentTailPosition()}`;
        }
    }

    async function animateEnqueue(value) {
        if (isAnimating) return;
        isAnimating = true;
        
        try {
            if (queue.isFull()) {
                alert("Queue is full! Cannot enqueue more elements.");
                return;
            }
            
            statusDisplay.textContent = `Enqueuing ${value}...`;
            
            // Get current tail position (where element will be added)
            const tailPosition = queue.getCurrentTailPosition();
            const box = document.getElementById(`box-${tailPosition}`);
            
            // Add enqueue animation
            box.classList.add('animate-enqueue');
            
            // Perform enqueue operation
            queue.enqueue(value);
            
            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, animationSpeed));
            
            // Remove animation class
            box.classList.remove('animate-enqueue');
            
            // Update visualization
            updateVisualization();
            
            statusDisplay.textContent = `Enqueued ${value} at position ${tailPosition}`;
            
        } catch (error) {
            statusDisplay.textContent = error.message;
        } finally {
            isAnimating = false;
        }
    }

    async function animateDequeue() {
        if (isAnimating) return;
        isAnimating = true;
        
        try {
            if (queue.isEmpty()) {
                alert("Queue is empty! Cannot dequeue.");
                return;
            }
            
            statusDisplay.textContent = "Dequeuing...";
            
            const currentHead = queue.head;
            const box = document.getElementById(`box-${currentHead}`);
            const value = queue.queue[currentHead];
            
            // Add dequeue animation
            box.classList.add('animate-dequeue');
            
            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, animationSpeed));
            
            // Perform dequeue operation
            queue.dequeue();
            
            // Remove animation class
            box.classList.remove('animate-dequeue');
            
            // Update visualization
            updateVisualization();
            
            statusDisplay.textContent = `Dequeued ${value} from position ${currentHead}`;
            
        } catch (error) {
            statusDisplay.textContent = error.message;
        } finally {
            isAnimating = false;
        }
    }

    function clearQueue() {
        if (queue.isEmpty()) {
            alert("Queue is already empty");
            return;
        }
        
        if (confirm("Are you sure you want to clear the queue?")) {
            queue.clear();
            updateVisualization();
            statusDisplay.textContent = "Queue cleared";
        }
    }

    // Event listeners
    enqueueBtn.addEventListener('click', function() {
        const value = queueInput.value.trim();
        if (value === "") {
            alert("Please enter a value to enqueue");
            return;
        }
        if (isNaN(value)) {
            alert("Please enter a valid number");
            return;
        }
        animateEnqueue(parseInt(value));
        queueInput.value = "";
    });

    dequeueBtn.addEventListener('click', animateDequeue);
    clearBtn.addEventListener('click', clearQueue);

    // Allow pressing Enter to enqueue
    queueInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const value = queueInput.value.trim();
            if (value !== "" && !isNaN(value)) {
                animateEnqueue(parseInt(value));
                queueInput.value = "";
            }
        }
    });

    // Animation speed control
    speedSlider.addEventListener('input', function() {
        animationSpeed = 1000 - (this.value * 90);
    });

    // Back button
    backBtn.addEventListener('click', function() {
        window.location.href = 'sorting.html';
    });

    // Maximize button
    maximizeBtn.addEventListener('click', function() {
        document.getElementById('fullbody').classList.toggle('maximized');
        this.textContent = document.getElementById('fullbody').classList.contains('maximized') ? 
            'Minimize' : 'Maximize';
    });

    // Initialize the visualization
    initializeVisualization();
});