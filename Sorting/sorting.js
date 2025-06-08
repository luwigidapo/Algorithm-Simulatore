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
let comparisonHistory = [];

var arrayVal = 15;
arraySize.addEventListener('input', function () {
    selectText.innerHTML = `Size Changed`;
    output.innerHTML = this.value;
    arrayVal = this.value;
    createNewArray(arrayVal);
});

let delay = 128; // Default delay (1x speed)

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
    comparisonHistory = [];
    document.getElementById('comparison-count').textContent = '0';
    document.getElementById('swap-count').textContent = '0';
    document.getElementById('time-count').textContent = '0s';
    document.getElementById('comparison-display').textContent = '';
    updateComparisonHistory();
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

function addToComparisonHistory(val1, val2, comparison, result) {
    const historyEntry = {
        comparison: `${val1} ${comparison} ${val2}`,
        result: result,
        count: comparisonCount,
        timestamp: new Date().toLocaleTimeString(),
        algorithm: currentAlgorithm
    };
    comparisonHistory.push(historyEntry);
    updateComparisonHistory();
}

function updateComparisonHistory() {
    const historyContainer = document.getElementById('comparison-history');
    if (!historyContainer) return;
    
    if (comparisonHistory.length === 0) {
        historyContainer.innerHTML = '<div style="color: #64748b; font-style: italic; text-align: center; padding: 1rem;">No comparisons yet. Start sorting to see comparison history.</div>';
        return;
    }
    
    // Show last 10 comparisons to avoid overwhelming the display
    const recentComparisons = comparisonHistory.slice(-10);
    const historyHTML = recentComparisons.map((entry, index) => {
        const isLatest = index === recentComparisons.length - 1;
        return `
            <div class="comparison-entry ${isLatest ? 'latest' : ''}" style="
                padding: 0.5rem;
                margin: 0.25rem 0;
                background: ${isLatest ? '#e3f2fd' : '#f8fafc'};
                border-radius: 0.375rem;
                border-left: 3px solid ${entry.result ? '#22c55e' : '#ef4444'};
                font-family: 'Courier New', monospace;
                font-size: 0.85rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                ${isLatest ? 'animation: fadeIn 0.3s ease;' : ''}
            ">
                <div style="display: flex; flex-direction: column;">
                    <span style="color: #1e293b; font-weight: 500;">${entry.comparison}</span>
                    <div style="display: flex; gap: 0.5rem; font-size: 0.7rem; color: #64748b;">
                        <span>#${entry.count}</span>
                        <span>•</span>
                        <span>${entry.timestamp}</span>
                        <span>•</span>
                        <span style="font-weight: 600; color: #4f46e5;">${entry.algorithm}</span>
                    </div>
                </div>
                <span style="
                    background: ${entry.result ? '#dcfce7' : '#fee2e2'};
                    color: ${entry.result ? '#166534' : '#dc2626'};
                    padding: 0.2rem 0.4rem;
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                ">${entry.result ? 'TRUE' : 'FALSE'}</span>
            </div>
        `;
    }).join('');
    
    const totalText = comparisonHistory.length > 10 ? 
        `<div style="text-align: center; margin: 0.5rem 0; font-size: 0.8rem; color: #64748b;">Showing last 10 of ${comparisonHistory.length} comparisons</div>` : '';
    
    historyContainer.innerHTML = totalText + historyHTML;
    
    // Auto-scroll to bottom
    historyContainer.scrollTop = historyContainer.scrollHeight;
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
        barContainer.style.position = 'relative';

        const numberLabel = document.createElement("div");
        numberLabel.className = 'bar-number';
        numberLabel.textContent = array[i].number;
        numberLabel.style.fontSize = `${Math.max(8, 14 - Math.floor(array.length / 10))}px`;

        const bar = document.createElement("div");
        bar.style.height = `${array[i].height}px`;
        bar.className = 'bar';
        bar.style.background = 'cyan';

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
    document.querySelectorAll('.comparison-indicator').forEach(indicator => {
        indicator.parentNode?.removeChild(indicator);
    });
}

function resetBarColors() {
    document.querySelectorAll('.bar').forEach(bar => {
        bar.style.background = 'cyan';
    });
}

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

function compareValues(val1, val2, operator) {
    let result;
    let comparison;
    
    switch (operator) {
        case '>':
            result = val1 > val2;
            comparison = '>';
            break;
        case '<':
            result = val1 < val2;
            comparison = '<';
            break;
        case '>=':
            result = val1 >= val2;
            comparison = '≥';
            break;
        case '<=':
            result = val1 <= val2;
            comparison = '≤';
            break;
        case '==':
            result = val1 === val2;
            comparison = '=';
            break;
        default:
            result = val1 > val2;
            comparison = '>';
    }
    
    incrementComparison();
    updateComparisonDisplay(val1, val2, comparison);
    addToComparisonHistory(val1, val2, comparison, result);
    
    return result;
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
    const numbers = input.split(/[,\s]+/).map(num => parseInt(num.trim())).filter(num => !isNaN(num));

    if (numbers.length > 60) {
        alert('Maximum array size is 60. Only the first 60 numbers will be used.');
        numbers.length = 60;
    }

    if (numbers.length > 0) {
        createNewArray(numbers.length, numbers);
    } else {
        alert('Please enter valid numbers separated by commas or spaces.');
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
            const numbers = content.split(/[,\s]+/).map(num => parseInt(num.trim())).filter(num => !isNaN(num));
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
    document.getElementById('code-language').textContent = `💻 Code (${language})`;
}

// Update the algorithm when sorting buttons are clicked
const sortingButtons = document.querySelectorAll('#buttons > button');
sortingButtons.forEach(button => {
    button.addEventListener('click', function() {
        currentAlgorithm = this.className;
        updateCodeExample();
    });
});

// BUBBLE SORT IMPLEMENTATION
async function BubbleSort() {
    shouldReset = false;
    const barContainers = document.querySelectorAll('.bar-container');
    const n = barContainers.length;
    
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (shouldReset) {
                resetBarColors();
                return;
            }
            
            // Highlight the bars being compared
            barContainers[j].querySelector('.bar').style.background = 'red';
            barContainers[j + 1].querySelector('.bar').style.background = 'red';
            
            createComparisonIndicator(j, j + 1);
            
            const val1 = parseInt(barContainers[j].querySelector('.bar-number').textContent);
            const val2 = parseInt(barContainers[j + 1].querySelector('.bar-number').textContent);
            
            if (sortOrder === 'ascending') {
                if (compareValues(val1, val2, '>')) {
                    await swapping(j, j + 1);
                }
            } else {
                if (compareValues(val1, val2, '<')) {
                    await swapping(j, j + 1);
                }
            }
            
            await waitforme(delay);
            
            // Reset colors except for sorted elements
            if (j < n - i - 1) {
                barContainers[j].querySelector('.bar').style.background = 'cyan';
                barContainers[j + 1].querySelector('.bar').style.background = 'cyan';
            }
            
            removeComparisonIndicators();
        }
        
        // Mark the sorted element
        barContainers[n - 1 - i].querySelector('.bar').style.background = 'green';
    }
    
    if (!shouldReset) {
        // Final coloring
        barContainers[0].querySelector('.bar').style.background = 'green';
    }
}

// BubbleSort button functionality
const BubbleSortButton = document.querySelector(".BubbleSort");
BubbleSortButton.addEventListener('click', async function () {
    mouseclick.play();
    selectText.innerHTML = `Bubble Sort (${sortOrder})..`;

    // Update info panels
    document.getElementById('algorithm-definition').innerHTML = `
        <p><strong>Bubble Sort</strong> is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.</p>
        <p><strong>How it works:</strong></p>
        <ol>
            <li>Compare each pair of adjacent elements from the beginning of the array</li>
            <li>If they are in the wrong order, swap them</li>
            <li>Repeat until the array is sorted</li>
        </ol>
        <p>This algorithm has O(n²) time complexity in the worst and average cases.</p>
    `;

    document.getElementById('time').innerHTML = `Time Complexity:
- Worst Case: O(n²) - When array is reverse sorted
- Average Case: O(n²) - Randomly shuffled array
- Best Case: O(n) - When array is already sorted

Space Complexity: O(1) - In-place sorting`;

    disableSortingBtn();
    disableSizeSlider();
    disableNewArrayBtn();
    resetCounters();
    startTimer();

    try {
        await BubbleSort();
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

// INSERTION SORT IMPLEMENTATION
async function InsertionSort() {
    shouldReset = false;
    const barContainers = document.querySelectorAll('.bar-container');
    const n = barContainers.length;
    
    for (let i = 1; i < n; i++) {
        if (shouldReset) {
            resetBarColors();
            return;
        }
        
        const key = parseInt(barContainers[i].querySelector('.bar-number').textContent);
        let j = i - 1;
        
        // Highlight the current key
        barContainers[i].querySelector('.bar').style.background = 'yellow';
        
        while (j >= 0) {
            if (shouldReset) {
                resetBarColors();
                return;
            }
            
            const currentVal = parseInt(barContainers[j].querySelector('.bar-number').textContent);
            
            // Highlight the comparison
            barContainers[j].querySelector('.bar').style.background = 'red';
            createComparisonIndicator(j, i);
            
            if (sortOrder === 'ascending') {
                if (!compareValues(currentVal, key, '>')) break;
            } else {
                if (!compareValues(currentVal, key, '<')) break;
            }
            
            await waitforme(delay / 2);
            
            // Move the element
            barContainers[j + 1].querySelector('.bar').style.height = barContainers[j].querySelector('.bar').style.height;
            barContainers[j + 1].querySelector('.bar-number').textContent = barContainers[j].querySelector('.bar-number').textContent;
            
            // Reset color after moving
            barContainers[j].querySelector('.bar').style.background = 'cyan';
            
            j--;
            await waitforme(delay / 2);
        }
        
        // Place the key in its correct position
        barContainers[j + 1].querySelector('.bar').style.height = `${array[i].height}px`;
        barContainers[j + 1].querySelector('.bar-number').textContent = key.toString();
        
        // Reset colors
        barContainers[j + 1].querySelector('.bar').style.background = 'orange';
        removeComparisonIndicators();
        
        await waitforme(delay);
    }
    
    if (!shouldReset) {
        // Final coloring
        barContainers.forEach(container => {
            container.querySelector('.bar').style.background = 'green';
        });
    }
}

// InsertionSort button functionality
const InsertionSortButton = document.querySelector(".InsertionSort");
InsertionSortButton.addEventListener('click', async function () {
    mouseclick.play();
    selectText.innerHTML = `Insertion Sort (${sortOrder})..`;

    // Update info panels
    document.getElementById('algorithm-definition').innerHTML = `
        <p><strong>Insertion Sort</strong> is a simple sorting algorithm that builds the final sorted array one item at a time.</p>
        <p><strong>How it works:</strong></p>
        <ol>
            <li>Start with the second element (index 1) as the key</li>
            <li>Compare the key with elements before it, moving larger elements one position up</li>
            <li>Insert the key into its correct position in the sorted part</li>
            <li>Repeat for all elements</li>
        </ol>
        <p>This algorithm has O(n²) time complexity in the worst and average cases, but O(n) in the best case.</p>
    `;

    document.getElementById('time').innerHTML = `Time Complexity:
- Worst Case: O(n²) - When array is reverse sorted
- Average Case: O(n²) - Randomly shuffled array
- Best Case: O(n) - When array is already sorted

Space Complexity: O(1) - In-place sorting`;

    disableSortingBtn();
    disableSizeSlider();
    disableNewArrayBtn();
    resetCounters();
    startTimer();

    try {
        await InsertionSort();
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

// SELECTION SORT IMPLEMENTATION
async function SelectionSort() {
    shouldReset = false;
    const barContainers = document.querySelectorAll('.bar-container');
    const n = barContainers.length;
    
    for (let i = 0; i < n - 1; i++) {
        if (shouldReset) {
            resetBarColors();
            return;
        }
        
        let minIndex = i;
        barContainers[minIndex].querySelector('.bar').style.background = 'yellow';
        
        for (let j = i + 1; j < n; j++) {
            if (shouldReset) {
                resetBarColors();
                return;
            }
            
            // Highlight the comparison
            barContainers[j].querySelector('.bar').style.background = 'red';
            createComparisonIndicator(minIndex, j);
            
            const minVal = parseInt(barContainers[minIndex].querySelector('.bar-number').textContent);
            const currentVal = parseInt(barContainers[j].querySelector('.bar-number').textContent);
            
            if (sortOrder === 'ascending') {
                if (compareValues(currentVal, minVal, '<')) {
                    // Reset previous min color
                    barContainers[minIndex].querySelector('.bar').style.background = 'cyan';
                    minIndex = j;
                    barContainers[minIndex].querySelector('.bar').style.background = 'yellow';
                }
            } else {
                if (compareValues(currentVal, minVal, '>')) {
                    // Reset previous min color
                    barContainers[minIndex].querySelector('.bar').style.background = 'cyan';
                    minIndex = j;
                    barContainers[minIndex].querySelector('.bar').style.background = 'yellow';
                }
            }
            
            await waitforme(delay);
            
            // Reset color if not the new min
            if (j !== minIndex) {
                barContainers[j].querySelector('.bar').style.background = 'cyan';
            }
            
            removeComparisonIndicators();
        }
        
        if (minIndex !== i) {
            await swapping(i, minIndex);
        }
        
        // Mark the sorted element
        barContainers[i].querySelector('.bar').style.background = 'green';
    }
    
    if (!shouldReset) {
        // Final coloring
        barContainers[n - 1].querySelector('.bar').style.background = 'green';
    }
}

// SelectionSort button functionality
const SelectionSortButton = document.querySelector(".SelectionSort");
SelectionSortButton.addEventListener('click', async function () {
    mouseclick.play();
    selectText.innerHTML = `Selection Sort (${sortOrder})..`;

    // Update info panels
    document.getElementById('algorithm-definition').innerHTML = `
        <p><strong>Selection Sort</strong> is an in-place comparison sorting algorithm that divides the input list into two parts: the sublist of items already sorted and the sublist of items remaining to be sorted.</p>
        <p><strong>How it works:</strong></p>
        <ol>
            <li>Find the minimum (or maximum) element in the unsorted part</li>
            <li>Swap it with the first element of the unsorted part</li>
            <li>Move the boundary between sorted and unsorted parts one element forward</li>
            <li>Repeat until the array is sorted</li>
        </ol>
        <p>This algorithm has O(n²) time complexity in all cases.</p>
    `;

    document.getElementById('time').innerHTML = `Time Complexity:
- Worst Case: O(n²) - All cases
- Average Case: O(n²) - All cases
- Best Case: O(n²) - All cases

Space Complexity: O(1) - In-place sorting`;

    disableSortingBtn();
    disableSizeSlider();
    disableNewArrayBtn();
    resetCounters();
    startTimer();

    try {
        await SelectionSort();
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

// MERGE SORT IMPLEMENTATION
async function MergeSort() {
    shouldReset = false;
    const barContainers = document.querySelectorAll('.bar-container');
    const n = barContainers.length;
    const numbers = Array.from(barContainers).map(container => 
        parseInt(container.querySelector('.bar-number').textContent)
    );
    const heights = Array.from(barContainers).map(container => 
        container.querySelector('.bar').style.height
    );

    async function mergeSort(start, end) {
        if (start >= end || shouldReset) return;

        const mid = Math.floor((start + end) / 2);
        
        await mergeSort(start, mid);
        if (shouldReset) return;
        await mergeSort(mid + 1, end);
        if (shouldReset) return;
        
        await merge(start, mid, end);
    }

    async function merge(start, mid, end) {
        const leftSize = mid - start + 1;
        const rightSize = end - mid;
        
        const leftArray = new Array(leftSize);
        const rightArray = new Array(rightSize);
        const leftHeights = new Array(leftSize);
        const rightHeights = new Array(rightSize);
        
        // Copy data to temp arrays
        for (let i = 0; i < leftSize; i++) {
            leftArray[i] = numbers[start + i];
            leftHeights[i] = heights[start + i];
        }
        for (let j = 0; j < rightSize; j++) {
            rightArray[j] = numbers[mid + 1 + j];
            rightHeights[j] = heights[mid + 1 + j];
        }
        
        let i = 0, j = 0, k = start;
        
        while (i < leftSize && j < rightSize) {
            if (shouldReset) return;
            
            // Highlight the bars being compared
            barContainers[start + i].querySelector('.bar').style.background = 'red';
            barContainers[mid + 1 + j].querySelector('.bar').style.background = 'red';
            createComparisonIndicator(start + i, mid + 1 + j);
            
            let comparisonResult;
            if (sortOrder === 'ascending') {
                comparisonResult = compareValues(leftArray[i], rightArray[j], '<=');
            } else {
                comparisonResult = compareValues(leftArray[i], rightArray[j], '>=');
            }
            
            if (comparisonResult) {
                numbers[k] = leftArray[i];
                heights[k] = leftHeights[i];
                i++;
            } else {
                numbers[k] = rightArray[j];
                heights[k] = rightHeights[j];
                j++;
            }
            
            // Update the visualization
            barContainers[k].querySelector('.bar').style.height = heights[k];
            barContainers[k].querySelector('.bar-number').textContent = numbers[k].toString();
            barContainers[k].querySelector('.bar').style.background = 'orange';
            
            await waitforme(delay);
            
            // Reset colors
            if (i < leftSize) barContainers[start + i].querySelector('.bar').style.background = 'cyan';
            if (j < rightSize) barContainers[mid + 1 + j].querySelector('.bar').style.background = 'cyan';
            removeComparisonIndicators();
            
            k++;
        }
        
        // Copy remaining elements of leftArray
        while (i < leftSize) {
            if (shouldReset) return;
            
            numbers[k] = leftArray[i];
            heights[k] = leftHeights[i];
            
            barContainers[k].querySelector('.bar').style.height = heights[k];
            barContainers[k].querySelector('.bar-number').textContent = numbers[k].toString();
            barContainers[k].querySelector('.bar').style.background = 'orange';
            
            await waitforme(delay);
            
            i++;
            k++;
        }
        
        // Copy remaining elements of rightArray
        while (j < rightSize) {
            if (shouldReset) return;
            
            numbers[k] = rightArray[j];
            heights[k] = rightHeights[j];
            
            barContainers[k].querySelector('.bar').style.height = heights[k];
            barContainers[k].querySelector('.bar-number').textContent = numbers[k].toString();
            barContainers[k].querySelector('.bar').style.background = 'orange';
            
            await waitforme(delay);
            
            j++;
            k++;
        }
        
        // Reset colors for the merged section
        for (let x = start; x <= end; x++) {
            barContainers[x].querySelector('.bar').style.background = 'cyan';
        }
    }

    await mergeSort(0, n - 1);
    
    if (!shouldReset) {
        // Final coloring
        barContainers.forEach(container => {
            container.querySelector('.bar').style.background = 'green';
        });
    }
}

// MergeSort button functionality
const MergeSortButton = document.querySelector(".MergeSort");
MergeSortButton.addEventListener('click', async function () {
    mouseclick.play();
    selectText.innerHTML = `Merge Sort (${sortOrder})..`;

    // Update info panels
    document.getElementById('algorithm-definition').innerHTML = `
        <p><strong>Merge Sort</strong> is a divide-and-conquer algorithm that divides the input array into two halves, sorts them recursively, and then merges the two sorted halves.</p>
        <p><strong>How it works:</strong></p>
        <ol>
            <li>Divide the unsorted list into n sublists, each containing one element</li>
            <li>Repeatedly merge sublists to produce new sorted sublists</li>
            <li>Continue until there is only one sublist remaining, which is the sorted list</li>
        </ol>
        <p>This algorithm has O(n log n) time complexity in all cases.</p>
    `;

    document.getElementById('time').innerHTML = `Time Complexity:
- Worst Case: O(n log n) - All cases
- Average Case: O(n log n) - All cases
- Best Case: O(n log n) - All cases

Space Complexity: O(n) - Requires temporary arrays`;

    disableSortingBtn();
    disableSizeSlider();
    disableNewArrayBtn();
    resetCounters();
    startTimer();

    try {
        await MergeSort();
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

// QUICK SORT IMPLEMENTATION
async function QuickSort() {
    shouldReset = false;
    const barContainers = document.querySelectorAll('.bar-container');
    const n = barContainers.length;
    const numbers = Array.from(barContainers).map(container => 
        parseInt(container.querySelector('.bar-number').textContent)
    );
    const heights = Array.from(barContainers).map(container => 
        container.querySelector('.bar').style.height
    );

    async function quickSort(start, end) {
        if (start >= end || shouldReset) return;
        
        const pivotIndex = await partition(start, end);
        if (shouldReset) return;
        
        await quickSort(start, pivotIndex - 1);
        if (shouldReset) return;
        await quickSort(pivotIndex + 1, end);
    }

    async function partition(start, end) {
        const pivotValue = numbers[end];
        barContainers[end].querySelector('.bar').style.background = 'purple';
        addHeapComparisonIndicator(end, 'Pivot', 'purple');
        
        let pivotIndex = start;
        
        for (let i = start; i < end; i++) {
            if (shouldReset) {
                resetBarColors();
                removeAllHeapIndicators();
                return -1;
            }
            
            // Highlight the comparison
            barContainers[i].querySelector('.bar').style.background = 'red';
            barContainers[pivotIndex].querySelector('.bar').style.background = 'yellow';
            createComparisonIndicator(i, end);
            
            let comparisonResult;
            if (sortOrder === 'ascending') {
                comparisonResult = compareValues(numbers[i], pivotValue, '<');
            } else {
                comparisonResult = compareValues(numbers[i], pivotValue, '>');
            }
            
            if (comparisonResult) {
                // Swap elements
                [numbers[i], numbers[pivotIndex]] = [numbers[pivotIndex], numbers[i]];
                [heights[i], heights[pivotIndex]] = [heights[pivotIndex], heights[i]];
                
                // Update visualization
                barContainers[i].querySelector('.bar').style.height = heights[i];
                barContainers[i].querySelector('.bar-number').textContent = numbers[i].toString();
                barContainers[pivotIndex].querySelector('.bar').style.height = heights[pivotIndex];
                barContainers[pivotIndex].querySelector('.bar-number').textContent = numbers[pivotIndex].toString();
                
                incrementSwap();
                
                pivotIndex++;
            }
            
            await waitforme(delay);
            
            // Reset colors
            barContainers[i].querySelector('.bar').style.background = 'cyan';
            if (pivotIndex > start) {
                barContainers[pivotIndex - 1].querySelector('.bar').style.background = 'cyan';
            }
            removeComparisonIndicators();
        }
        
        // Swap pivot to its final place
        [numbers[pivotIndex], numbers[end]] = [numbers[end], numbers[pivotIndex]];
        [heights[pivotIndex], heights[end]] = [heights[end], heights[pivotIndex]];
        
        barContainers[pivotIndex].querySelector('.bar').style.height = heights[pivotIndex];
        barContainers[pivotIndex].querySelector('.bar-number').textContent = numbers[pivotIndex].toString();
        barContainers[end].querySelector('.bar').style.height = heights[end];
        barContainers[end].querySelector('.bar-number').textContent = numbers[end].toString();
        
        incrementSwap();
        
        // Reset colors
        barContainers[pivotIndex].querySelector('.bar').style.background = 'green';
        barContainers[end].querySelector('.bar').style.background = 'cyan';
        removeAllHeapIndicators();
        
        await waitforme(delay);
        
        return pivotIndex;
    }

    await quickSort(0, n - 1);
    
    if (!shouldReset) {
        // Final coloring
        barContainers.forEach(container => {
            container.querySelector('.bar').style.background = 'green';
        });
    }
}

// QuickSort button functionality
const QuickSortButton = document.querySelector(".QuickSort");
QuickSortButton.addEventListener('click', async function () {
    mouseclick.play();
    selectText.innerHTML = `Quick Sort (${sortOrder})..`;

    // Update info panels
    document.getElementById('algorithm-definition').innerHTML = `
        <p><strong>Quick Sort</strong> is a divide-and-conquer algorithm that selects a 'pivot' element and partitions the array around the pivot.</p>
        <p><strong>How it works:</strong></p>
        <ol>
            <li>Select a pivot element (here we use the last element)</li>
            <li>Partition the array so elements less than pivot come before, greater come after</li>
            <li>Recursively apply to the sub-arrays</li>
        </ol>
        <p>This algorithm has O(n log n) time complexity on average, but O(n²) in the worst case.</p>
    `;

    document.getElementById('time').innerHTML = `Time Complexity:
- Worst Case: O(n²) - When pivot is smallest or largest element
- Average Case: O(n log n) - Randomly shuffled array
- Best Case: O(n log n) - Balanced partitions

Space Complexity: O(log n) - Recursion stack`;

    disableSortingBtn();
    disableSizeSlider();
    disableNewArrayBtn();
    resetCounters();
    startTimer();

    try {
        await QuickSort();
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
            
            const leftVal = parseInt(barContainers[l].querySelector('.bar-number').textContent);
            const largestVal = parseInt(barContainers[largest].querySelector('.bar-number').textContent);
            
            if (sortOrder === 'ascending') {
                if (compareValues(leftVal, largestVal, '>')) {
                    largest = l;
                }
            } else {
                if (compareValues(leftVal, largestVal, '<')) {
                    largest = l;
                }
            }
            
            await waitforme(delay / 3);
        }

        if (r < n) {
            barContainers[r].querySelector('.bar').style.background = 'lightgreen';
            addHeapComparisonIndicator(r, 'Right', 'lightgreen');
            
            const rightVal = parseInt(barContainers[r].querySelector('.bar-number').textContent);
            const largestVal = parseInt(barContainers[largest].querySelector('.bar-number').textContent);
            
            if (sortOrder === 'ascending') {
                if (compareValues(rightVal, largestVal, '>')) {
                    largest = r;
                }
            } else {
                if (compareValues(rightVal, largestVal, '<')) {
                    largest = r;
                }
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
