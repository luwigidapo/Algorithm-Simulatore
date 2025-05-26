// functions.js

// Global variables
let isPaused = false;
let pauseResolve = null;
let sortingInProgress = false;
let currentSortingAlgorithm = null;

// Function to handle custom array input
function handleCustomArrayInput() {
    if (sortingInProgress) {
        alert('Please wait for the current sorting to complete or pause it first.');
        return;
    }

    const input = document.getElementById('array-input').value;
    const numbers = input.split(',')
                        .map(num => parseInt(num.trim()))
                        .filter(num => !isNaN(num));
    
    if (numbers.length > 30) {
        alert('Array size cannot exceed 30 elements');
        return;
    }
    
    if (numbers.length > 0) {
        // Update the array size slider to match the custom array length
        document.getElementById('size_slider').value = numbers.length;
        document.getElementById('size_value').textContent = numbers.length;
        
        // Generate the array with custom numbers
        generateNewArray(numbers);
    } else {
        alert('Please enter valid numbers separated by commas');
    }
}

// Pause/resume functionality
async function checkPaused() {
    if (isPaused) {
        document.getElementById('pause-btn').textContent = 'Resume';
        await new Promise(resolve => {
            pauseResolve = resolve;
        });
        document.getElementById('pause-btn').textContent = 'Pause';
    }
}

function togglePause() {
    isPaused = !isPaused;
    if (!isPaused && pauseResolve) {
        pauseResolve();
        pauseResolve = null;
    }
}

// Function to disable buttons during sorting
function disableButtons(disabled) {
    const buttons = [
        document.getElementById('generate'),
        document.getElementById('submit-array'),
        document.querySelector('.BubbleSort'),
        document.querySelector('.SelectionSort'),
        document.querySelector('.InsertionSort'),
        document.querySelector('.MergeSort'),
        document.querySelector('.QuickSort'),
        document.getElementById('size_slider')
    ];
    
    buttons.forEach(button => {
        button.disabled = disabled;
    });
    
    // Pause button should always be enabled when sorting
    document.getElementById('pause-btn').disabled = !sortingInProgress;
}

// Initialize event listeners
function initializeFunctions() {
    // Custom array input
    document.getElementById('submit-array').addEventListener('click', handleCustomArrayInput);
    
    // Pause button
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    
    // Disable pause button initially
    document.getElementById('pause-btn').disabled = true;
    
    // Add event listeners for sorting buttons to track current algorithm
    const sortingButtons = [
        { button: document.querySelector('.BubbleSort'), algo: 'bubble' },
        { button: document.querySelector('.SelectionSort'), algo: 'selection' },
        { button: document.querySelector('.InsertionSort'), algo: 'insertion' },
        { button: document.querySelector('.MergeSort'), algo: 'merge' },
        { button: document.querySelector('.QuickSort'), algo: 'quick' }
    ];
    
    sortingButtons.forEach(({ button, algo }) => {
        button.addEventListener('click', () => {
            currentSortingAlgorithm = algo;
        });
    });
}

// Call initialize when the script loads
initializeFunctions();

// Export functions if using modules
// export { checkPaused, disableButtons };