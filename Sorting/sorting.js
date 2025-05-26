const output = document.querySelector('#size_value');
const bars = document.querySelector("#mainbody");
const arraySize = document.querySelector('#size_slider');
const selectText = document.querySelector('.selected');
output.innerHTML = arraySize.value;

// Audio files
var beep = new Audio('beep.mp3');
var mouseclick = new Audio('Mouseclick.mp3');
var done = new Audio('wrong.mp3');

let comparisonCount = 0;
let swapCount = 0;
let sortStartTime = 0;
let timerInterval = null;
let isPaused = false;
let shouldReset = false;
let sortingActive = false;
let resolvePause = null;
let sortOrder = 'ascending';

var arrayVal = 15;
arraySize.addEventListener('input', function () {
    selectText.innerHTML = `Size Changed`;
    output.innerHTML = this.value;
    arrayVal = this.value;
    createNewArray(arrayVal);
});

let delay = 512; // Default delay (1x speed)

const speedOptions = document.querySelectorAll('.speed-option');
speedOptions.forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.speed-option').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        delay = parseInt(this.getAttribute('data-speed'));
        document.getElementById('current_speed').textContent = this.textContent;
    });
});

let array = [];
createNewArray(arrayVal);

function resetCounters() {
    comparisonCount = 0;
    swapCount = 0;
    document.getElementById('comparison-count').textContent = '0';
    document.getElementById('swap-count').textContent = '0';
    document.getElementById('time-count').textContent = '0s';
    document.getElementById('comparison-display').textContent = '';
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function startTimer() {
    sortStartTime = Date.now();
    timerInterval = setInterval(() => {
        if (!isPaused) {
            const elapsed = (Date.now() - sortStartTime) / 1000;
            document.getElementById('time-count').textContent = `${elapsed.toFixed(1)}s`;
        }
    }, 100);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function incrementComparison() {
    comparisonCount++;
    document.getElementById('comparison-count').textContent = comparisonCount;
}

function incrementSwap() {
    swapCount++;
    document.getElementById('swap-count').textContent = swapCount;
}

function updateComparisonDisplay(val1, val2, comparison) {
    document.getElementById('comparison-display').textContent = `${val1} ${comparison} ${val2}`;
}

function createNewArray(arrayVal, customArray = null) {
    resetCounters();
    deleteChild();
    array = [];

    const maxHeight = 400;
    const minHeight = 20;
    const maxNumber = 1000;

    if (customArray && customArray.length > 0) {
        const maxCustomValue = Math.max(...customArray);
        const minCustomValue = Math.min(...customArray);

        for (let i = 0; i < customArray.length; i++) {
            const height = minHeight + ((customArray[i] - minCustomValue) / (maxCustomValue - minCustomValue)) * (maxHeight - minHeight);
            array.push({ height, number: customArray[i] });
        }
    } else {
        for (let i = 0; i < arrayVal; i++) {
            const ratio = i / (arrayVal - 1);
            const height = Math.floor(ratio * (maxHeight - minHeight) + minHeight);
            const number = Math.floor(ratio * maxNumber);
            array.push({ height, number });
        }

        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    for (let i = 0; i < array.length; i++) {
        const barContainer = document.createElement("div");
        barContainer.className = 'bar-container';
        barContainer.style.width = `${(96 / array.length)}vw`;
        barContainer.style.position = 'relative'; // Important for indicators

        const numberLabel = document.createElement("div");
        numberLabel.className = 'bar-number';
        numberLabel.textContent = array[i].number;
        numberLabel.style.fontSize = `${Math.max(8, 14 - Math.floor(array.length / 10))}px`;

        const bar = document.createElement("div");
        bar.style.height = `${array[i].height}px`;
        bar.className = 'bar';
        bar.style.background = 'cyan'; // Default color

        barContainer.appendChild(numberLabel);
        barContainer.appendChild(bar);
        bars.appendChild(barContainer);
    }
}

function deleteChild() {
    while (bars.firstChild) {
        bars.removeChild(bars.firstChild);
    }
}

const newArray = document.querySelector("#generate");
newArray.addEventListener("click", function () {
    createNewArray(arrayVal);
    enableSortingBtn();
    enableSizeSlider();
});

function disableSortingBtn() {
    document.querySelector(".BubbleSort").disabled = true;
    document.querySelector(".InsertionSort").disabled = true;
    document.querySelector(".MergeSort").disabled = true;
    document.querySelector(".QuickSort").disabled = true;
    document.querySelector(".SelectionSort").disabled = true;
    document.querySelector(".HeapSort").disabled = true;  
}

function enableSortingBtn() {
    document.querySelector(".BubbleSort").disabled = false;
    document.querySelector(".InsertionSort").disabled = false;
    document.querySelector(".MergeSort").disabled = false;
    document.querySelector(".QuickSort").disabled = false;
    document.querySelector(".SelectionSort").disabled = false;
    document.querySelector(".HeapSort").disabled = false;
}

function disableSizeSlider() {
    document.querySelector("#size_slider").disabled = true;
}

function enableSizeSlider() {
    document.querySelector("#size_slider").disabled = false;
}

function disableNewArrayBtn() {
    document.querySelector("#generate").disabled = true;
}

function enableNewArrayBtn() {
    document.querySelector("#generate").disabled = false;
}

function createComparisonIndicator(index1, index2) {
    const barContainers = document.querySelectorAll('.bar-container');
    const element1 = barContainers[index1];
    const element2 = barContainers[index2];
    removeComparisonIndicators();

    const arrow = document.createElement('div');
    arrow.className = 'comparison-arrow';
    arrow.innerHTML = '⇄';

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.bottom = '0';
    container.style.width = '100%';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.appendChild(arrow);
    element1.appendChild(container);
}

function removeComparisonIndicators() {
    document.querySelectorAll('.comparison-arrow').forEach(arrow => arrow.parentNode?.remove());
    // Also remove any comparison indicators from insertion sort
    document.querySelectorAll('.comparison-indicator').forEach(indicator => {
        indicator.parentNode?.removeChild(indicator);
    });
}

// Reset bar colors helper
function resetBarColors() {
    document.querySelectorAll('.bar').forEach(bar => {
        bar.style.background = 'cyan';
    });
}

// Add comparison indicator for heap sort
function addHeapComparisonIndicator(index, text, color) {
    removeHeapComparisonIndicator(index);
    
    const barContainer = document.querySelectorAll('.bar-container')[index];
    const indicator = document.createElement('div');
    indicator.className = 'heap-comparison-indicator';
    indicator.textContent = text;
    indicator.style.position = 'absolute';
    indicator.style.top = '-25px';
    indicator.style.left = '50%';
    indicator.style.transform = 'translateX(-50%)';
    indicator.style.backgroundColor = color || '#333';
    indicator.style.color = 'white';
    indicator.style.padding = '2px 5px';
    indicator.style.borderRadius = '3px';
    indicator.style.fontSize = '10px';
    indicator.style.zIndex = '10';
    indicator.style.whiteSpace = 'nowrap';
    
    barContainer.appendChild(indicator);
    return indicator;
}

function removeHeapComparisonIndicator(index) {
    const barContainer = document.querySelectorAll('.bar-container')[index];
    if (!barContainer) return;
    
    const indicator = barContainer.querySelector('.heap-comparison-indicator');
    if (indicator) {
        barContainer.removeChild(indicator);
    }
}

function removeAllHeapIndicators() {
    document.querySelectorAll('.heap-comparison-indicator').forEach(indicator => {
        indicator.parentNode?.removeChild(indicator);
    });
}

async function waitforme(milisec) {
    if (shouldReset) {
        shouldReset = false;
        throw new Error('Reset requested');
    }

    sortingActive = true;
    let startTime = Date.now();
    let elapsed = 0;

    while (elapsed < milisec) {
        if (shouldReset) {
            sortingActive = false;
            throw new Error('Reset requested');
        }

        if (isPaused) {
            await new Promise(resolve => { resolvePause = resolve; });
        }

        elapsed = Date.now() - startTime;
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    sortingActive = false;
    return '';
}

function swapping(index1, index2) {
    const barContainers = document.querySelectorAll('.bar-container');
    const element1 = barContainers[index1];
    const element2 = barContainers[index2];
    const bar1 = element1.querySelector('.bar');
    const bar2 = element2.querySelector('.bar');
    const tempHeight = bar1.style.height;
    bar1.style.height = bar2.style.height;
    bar2.style.height = tempHeight;

    const num1 = element1.querySelector('.bar-number');
    const num2 = element2.querySelector('.bar-number');
    const tempText = num1.textContent;
    num1.textContent = num2.textContent;
    num2.textContent = tempText;

    incrementSwap();
}

function togglePause() {
    isPaused = !isPaused;
    const pauseBtn = document.getElementById('pause-btn');
    if (isPaused) {
        pauseBtn.textContent = "Resume";
        pauseBtn.style.backgroundColor = "#2ecc71";
        stopTimer();
    } else {
        pauseBtn.textContent = "Pause";
        pauseBtn.style.backgroundColor = "#f39c12";
        startTimer();
        if (resolvePause) {
            resolvePause();
            resolvePause = null;
        }
    }
}

function resetSorting() {
    shouldReset = true;
    isPaused = false;
    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn.textContent = "Pause";
    pauseBtn.style.backgroundColor = "#f39c12";

    if (resolvePause) {
        resolvePause();
        resolvePause = null;
    }

    createNewArray(arrayVal);
    enableSortingBtn();
    enableSizeSlider();
    enableNewArrayBtn();
}

document.getElementById('custom-array-btn').addEventListener('click', function() {
    const input = document.getElementById('custom-array-input').value;
    const numbers = input.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));

    if (numbers.length > 60) {
        alert('Maximum array size is 60. Only the first 60 numbers will be used.');
        numbers.length = 60;
    }

    if (numbers.length > 0) {
        createNewArray(numbers.length, numbers);
    } else {
        alert('Please enter valid numbers separated by commas.');
    }
});

document.getElementById('upload-array-btn').addEventListener('click', function() {
    document.getElementById('array-file-input').click();
});

document.getElementById('array-file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const numbers = content.split(/[\s,]+/).map(num => parseInt(num.trim())).filter(num => !isNaN(num));
            if (numbers.length > 60) {
                alert('Maximum array size is 60. Only the first 60 numbers will be used.');
                numbers.length = 60;
            }

            if (numbers.length > 0) {
                createNewArray(numbers.length, numbers);
            } else {
                alert('No valid numbers found in the file.');
            }
        } catch (error) {
            alert('Error reading file: ' + error.message);
        }
    };
    reader.readAsText(file);
});

document.getElementById('maximize-btn').addEventListener('click', function() {
    document.getElementById('fullbody').classList.toggle('maximized');
    this.textContent = document.getElementById('fullbody').classList.contains('maximized') ? 'Minimize' : 'Maximize';
});

document.getElementById('ascending-btn').addEventListener('click', function() {
    sortOrder = 'ascending';
    this.style.backgroundColor = '#27ae60';
    document.getElementById('descending-btn').style.backgroundColor = '#e74c3c';
});

document.getElementById('descending-btn').addEventListener('click', function() {
    sortOrder = 'descending';
    this.style.backgroundColor = '#c0392b';
    document.getElementById('ascending-btn').style.backgroundColor = '#2ecc71';
});

document.getElementById('pause-btn').addEventListener('click', togglePause);
document.getElementById('reset-btn').addEventListener('click', resetSorting);

// Code examples for different algorithms and languages
const codeExamples = {
    'BubbleSort': {
        'java': `void bubbleSort(int arr[]) {
    int n = arr.length;
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
}`,
        'cpp': `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                swap(arr[j], arr[j+1]);
            }
        }
    }
}`
    },
    'InsertionSort': {
        'java': `void insertionSort(int arr[]) {
    int n = arr.length;
    for (int i = 1; i < n; ++i) {
        int key = arr[i];
        int j = i - 1;
        
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`,
        'cpp': `void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`
    },
    'HeapSort': {
        'java': `void heapSort(int arr[]) {
    int n = arr.length;

    // Build heap (rearrange array)
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);

    // Extract elements from heap
    for (int i = n - 1; i > 0; i--) {
        // Move current root to end
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;

        // Heapify the reduced heap
        heapify(arr, i, 0);
    }
}

void heapify(int arr[], int n, int i) {
    int largest = i;
    int l = 2 * i + 1;
    int r = 2 * i + 2;

    if (l < n && arr[l] > arr[largest])
        largest = l;

    if (r < n && arr[r] > arr[largest])
        largest = r;

    if (largest != i) {
        int swap = arr[i];
        arr[i] = arr[largest];
        arr[largest] = swap;

        heapify(arr, n, largest);
    }
}`,
        'cpp': `void heapSort(int arr[], int n) {
    // Build heap
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);

    // Extract elements from heap
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}

void heapify(int arr[], int n, int i) {
    int largest = i;
    int l = 2 * i + 1;
    int r = 2 * i + 2;

    if (l < n && arr[l] > arr[largest])
        largest = l;

    if (r < n && arr[r] > arr[largest])
        largest = r;

    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}`
    },
    'MergeSort': {
        'java': `void mergeSort(int arr[], int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        
        merge(arr, l, m, r);
    }
}`,
        'cpp': `void mergeSort(int arr[], int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        
        merge(arr, l, m, r);
    }
}`
    },
    'QuickSort': {
        'java': `void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
        'cpp': `void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`
    },
    'SelectionSort': {
        'java': `void selectionSort(int arr[]) {
    int n = arr.length;
    
    for (int i = 0; i < n-1; i++) {
        int min_idx = i;
        for (int j = i+1; j < n; j++)
            if (arr[j] < arr[min_idx])
                min_idx = j;
        
        int temp = arr[min_idx];
        arr[min_idx] = arr[i];
        arr[i] = temp;
    }
}`,
        'cpp': `void selectionSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++) {
        int min_idx = i;
        for (int j = i+1; j < n; j++)
            if (arr[j] < arr[min_idx])
                min_idx = j;
        
        swap(arr[min_idx], arr[i]);
    }
}`
    }
};

const languages = ['java', 'cpp'];
let currentAlgorithm = 'InsertionSort';
let currentLanguageIndex = 0;

document.getElementById('prev-language').addEventListener('click', function() {
    currentLanguageIndex = (currentLanguageIndex - 1 + languages.length) % languages.length;
    updateCodeExample();
});

document.getElementById('next-language').addEventListener('click', function() {
    currentLanguageIndex = (currentLanguageIndex + 1) % languages.length;
    updateCodeExample();
});

function updateCodeExample() {
    const language = languages[currentLanguageIndex];
    const codeText = codeExamples[currentAlgorithm][language];
    document.getElementById('code_java').textContent = codeText;
    document.getElementById('code-language').textContent = `Code in (${language})`;
}

// Update the algorithm when sorting buttons are clicked
const sortingButtons = document.querySelectorAll('#buttons > button');
sortingButtons.forEach(button => {
    button.addEventListener('click', function() {
        currentAlgorithm = this.className;
        updateCodeExample();
    });
});

// HEAP SORT IMPLEMENTATION
async function HeapSort() {
    shouldReset = false;
    const barContainers = document.querySelectorAll('.bar-container');
    const n = barContainers.length;

    // Helper function to swap elements with visual feedback
    async function swapElements(index1, index2, countSwap = false) {
        // Highlight bars being swapped
        barContainers[index1].querySelector('.bar').style.background = 'red';
        barContainers[index2].querySelector('.bar').style.background = 'red';
        
        addHeapComparisonIndicator(index1, 'Swap', 'red');
        addHeapComparisonIndicator(index2, 'Swap', 'red');
        
        await waitforme(delay / 2);

        const tempHeight = barContainers[index1].querySelector('.bar').style.height;
        const tempText = barContainers[index1].querySelector('.bar-number').textContent;

        barContainers[index1].querySelector('.bar').style.height = barContainers[index2].querySelector('.bar').style.height;
        barContainers[index1].querySelector('.bar-number').textContent = barContainers[index2].querySelector('.bar-number').textContent;

        barContainers[index2].querySelector('.bar').style.height = tempHeight;
        barContainers[index2].querySelector('.bar-number').textContent = tempText;

        if (countSwap) {
            incrementSwap();
        }
        
        beep.play();
        await waitforme(delay / 2);
        
        // Remove indicators
        removeHeapComparisonIndicator(index1);
        removeHeapComparisonIndicator(index2);
        
        // Reset colors
        barContainers[index1].querySelector('.bar').style.background = 'orange';
        barContainers[index2].querySelector('.bar').style.background = 'orange';
    }

    async function heapify(n, i) {
        let largest = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;

        // Highlight current node
        barContainers[i].querySelector('.bar').style.background = 'yellow';
        addHeapComparisonIndicator(i, 'Root', 'yellow');

        if (l < n) {
            barContainers[l].querySelector('.bar').style.background = 'lightblue';
            addHeapComparisonIndicator(l, 'Left', 'lightblue');
            
            incrementComparison();
            if (sortOrder === 'ascending' && parseInt(barContainers[l].querySelector('.bar-number').textContent) > parseInt(barContainers[largest].querySelector('.bar-number').textContent)) {
                largest = l;
            } else if (sortOrder === 'descending' && parseInt(barContainers[l].querySelector('.bar-number').textContent) < parseInt(barContainers[largest].querySelector('.bar-number').textContent)) {
                largest = l;
            }
            
            await waitforme(delay / 3);
        }

        if (r < n) {
            barContainers[r].querySelector('.bar').style.background = 'lightgreen';
            addHeapComparisonIndicator(r, 'Right', 'lightgreen');
            
            incrementComparison();
            if (sortOrder === 'ascending' && parseInt(barContainers[r].querySelector('.bar-number').textContent) > parseInt(barContainers[largest].querySelector('.bar-number').textContent)) {
                largest = r;
            } else if (sortOrder === 'descending' && parseInt(barContainers[r].querySelector('.bar-number').textContent) < parseInt(barContainers[largest].querySelector('.bar-number').textContent)) {
                largest = r;
            }
            
            await waitforme(delay / 3);
        }

        if (largest !== i) {
            await swapElements(i, largest, false);
            
            // Clear indicators before recursive call
            removeAllHeapIndicators();
            resetBarColors();
            
            await heapify(n, largest);
        } else {
            // Clear indicators if no swap needed
            removeAllHeapIndicators();
            resetBarColors();
        }
    }

    // Build heap phase
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        if (shouldReset) {
            resetBarColors();
            removeAllHeapIndicators();
            return;
        }
        await heapify(n, i);
    }

    // Extraction phase
    for (let i = n - 1; i > 0; i--) {
        if (shouldReset) {
            resetBarColors();
            removeAllHeapIndicators();
            return;
        }
        
        // This is the main extraction swap - count it
        await swapElements(0, i, true);
        
        // Mark sorted element
        barContainers[i].querySelector('.bar').style.background = 'green';
        
        await heapify(i, 0);
    }

    if (!shouldReset) {
        // Final coloring
        barContainers.forEach(container => {
            container.querySelector('.bar').style.background = 'rgb(0,255,0)';
        });
        removeAllHeapIndicators();
    }
}

// Heapsort button functionality
const HeapSortButton = document.querySelector(".HeapSort");
HeapSortButton.addEventListener('click', async function () {
    mouseclick.play();
    selectText.innerHTML = `Heap Sort (${sortOrder})..`;

    // Update info panels
    document.getElementById('algorithm-definition').innerHTML = `
        <p><strong>Heap Sort</strong> is a comparison-based sorting algorithm that uses a binary heap data structure.</p>
        <p><strong>How it works:</strong></p>
        <ol>
            <li>Build a max-heap (or min-heap) from the input data</li>
            <li>Swap the root element with the last element of the heap</li>
            <li>Reduce the heap size by 1 and heapify the root</li>
            <li>Repeat until the heap is empty</li>
        </ol>
        <p>This algorithm has an optimal O(n log n) time complexity.</p>
    `;

    document.getElementById('time').innerHTML = `Time Complexity:
- Worst Case: O(n log n) - All cases
- Average Case: O(n log n) - All cases
- Best Case: O(n log n) - All cases

Space Complexity: O(1) - In-place sorting`;

    disableSortingBtn();
    disableSizeSlider();
    disableNewArrayBtn();
    resetCounters();
    startTimer();

    try {
        await HeapSort();
        if (!shouldReset) {
            done.play();
            selectText.innerHTML = `Sorting Complete!`;
            stopTimer();
        }
    } catch (e) {
        console.log("Sorting was interrupted");
    }

    enableSortingBtn();
    enableSizeSlider();
    enableNewArrayBtn();
});