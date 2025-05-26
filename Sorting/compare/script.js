const generateBtn = document.getElementById('generate');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const algorithm1Select = document.getElementById('algorithm1');
const algorithm2Select = document.getElementById('algorithm2');
const visualization1 = document.getElementById('mainbody1');
const visualization2 = document.getElementById('mainbody2');
const comparisonCount1 = document.getElementById('comparisons1');
const swapCount1 = document.getElementById('swaps1');
const time1 = document.getElementById('time1');
const comparisonCount2 = document.getElementById('comparisons2');
const swapCount2 = document.getElementById('swaps2');
const time2 = document.getElementById('time2');
const arraySizeInput = document.getElementById('size_slider');
const speedInput = document.getElementById('speed_slider');
const sizeValue = document.getElementById('size_value');
const speedValue = document.getElementById('speed_value');

// Global variables
let array = [];
let delay = 500;
let isSorting = false;
let isPaused = false;
let sortStartTime1, sortStartTime2;
let animationId1, animationId2;
let sortOrder = 'ascending';

// Initialize
arraySizeInput.value = 20;
speedInput.value = 5;
sizeValue.textContent = arraySizeInput.value;
speedValue.textContent = speedInput.value;
generateArray();

// Event listeners
generateBtn.addEventListener('click', generateArray);
startBtn.addEventListener('click', startSorting);
resetBtn.addEventListener('click', reset);
arraySizeInput.addEventListener('input', updateArraySize);
speedInput.addEventListener('input', updateSpeed);
document.getElementById('ascending-btn').addEventListener('click', () => {
    sortOrder = 'ascending';
});
document.getElementById('descending-btn').addEventListener('click', () => {
    sortOrder = 'descending';
});
document.getElementById('pause-btn').addEventListener('click', togglePause);

// Algorithm implementations
const algorithms = {
    bubble: bubbleSort,
    insertion: insertionSort,
    merge: mergeSort,
    quick: quickSort,
    selection: selectionSort
};

function generateArray() {
    if (isSorting) return;
    
    const size = parseInt(arraySizeInput.value);
    array = Array.from({length: size}, () => Math.floor(Math.random() * 100) + 1);
    renderBars();
    resetStats();
}

function renderBars() {
    visualization1.innerHTML = '';
    visualization2.innerHTML = '';
    
    const maxValue = Math.max(...array);
    const containerHeight1 = visualization1.clientHeight;
    const containerHeight2 = visualization2.clientHeight;
    
    array.forEach((value, index) => {
        // For algorithm 1
        const barContainer1 = document.createElement('div');
        barContainer1.className = 'bar-container';
        barContainer1.style.width = `${100 / array.length}%`;
        
        const bar1 = document.createElement('div');
        bar1.className = 'bar';
        bar1.style.height = `${(value / maxValue) * containerHeight1}px`;
        bar1.dataset.value = value;
        
        const barNumber1 = document.createElement('div');
        barNumber1.className = 'bar-number';
        barNumber1.textContent = value;
        
        barContainer1.appendChild(bar1);
        barContainer1.appendChild(barNumber1);
        visualization1.appendChild(barContainer1);
        
        // For algorithm 2
        const barContainer2 = barContainer1.cloneNode(true);
        visualization2.appendChild(barContainer2);
    });
}

async function startSorting() {
    if (isSorting) return;
    
    isSorting = true;
    startBtn.disabled = true;
    generateBtn.disabled = true;
    resetStats();
    
    const algorithm1 = algorithm1Select.value;
    const algorithm2 = algorithm2Select.value;
    
    // Start timers
    sortStartTime1 = performance.now();
    sortStartTime2 = performance.now();
    
    // Run algorithms concurrently
    const array1 = [...array];
    const array2 = [...array];

    try {
        await Promise.all([
            algorithms[algorithm1](array1, visualization1, 1),
            algorithms[algorithm2](array2, visualization2, 2)
        ]);
    } catch (e) {
        console.log("Sorting was interrupted");
    } finally {
        isSorting = false;
        startBtn.disabled = false;
        generateBtn.disabled = false;
    }
}

function reset() {
    if (isSorting) {
        isSorting = false;
        isPaused = false;
        document.getElementById('pause-btn').textContent = "Pause";
    }
    generateArray();
    startBtn.disabled = false;
    generateBtn.disabled = false;
}

function resetStats() {
    comparisonCount1.textContent = '0';
    swapCount1.textContent = '0';
    time1.textContent = '0';
    comparisonCount2.textContent = '0';
    swapCount2.textContent = '0';
    time2.textContent = '0';
}

function updateArraySize() {
    sizeValue.textContent = arraySizeInput.value;
    generateArray();
}

function updateSpeed() {
    speedValue.textContent = speedInput.value;
    delay = 550 - (speedInput.value * 50); // Convert speed to delay (50-500ms)
}

// Helper functions for algorithms
function updateBarColors(container, indices, action) {
    const bars = container.querySelectorAll('.bar');
    
    // Reset all bars to default color
    bars.forEach(bar => {
        bar.classList.remove('comparing', 'swapping');
        bar.style.backgroundColor = '#3498db';
    });
    
    if (action === 'compare') {
        indices.forEach(i => {
            bars[i].style.backgroundColor = '#f1c40f'; // Yellow for comparing
        });
    } else if (action === 'swap') {
        indices.forEach(i => {
            bars[i].style.backgroundColor = '#e74c3c'; // Red for swapping
        });
    }
    
    // Update statistics
    if (container === visualization1) {
        if (action === 'compare') comparisonCount1.textContent = parseInt(comparisonCount1.textContent) + 1;
        if (action === 'swap') swapCount1.textContent = parseInt(swapCount1.textContent) + 1;
        time1.textContent = Math.floor(performance.now() - sortStartTime1);
    } else {
        if (action === 'compare') comparisonCount2.textContent = parseInt(comparisonCount2.textContent) + 1;
        if (action === 'swap') swapCount2.textContent = parseInt(swapCount2.textContent) + 1;
        time2.textContent = Math.floor(performance.now() - sortStartTime2);
    }
}

function markAllAsSorted(container) {
    const bars = container.querySelectorAll('.bar');
    bars.forEach(bar => {
        bar.classList.add('sorted');
        bar.style.backgroundColor = '#2ecc71'; // Green for sorted
    });
}

// Sleep function for animations
function sleep(ms) {
    return new Promise(resolve => {
        if (isPaused) {
            const interval = setInterval(() => {
                if (!isPaused) {
                    clearInterval(interval);
                    setTimeout(resolve, ms);
                }
            }, 100);
        } else {
            setTimeout(resolve, ms);
        }
    });
}

// Pause/resume functionality
function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pause-btn').textContent = isPaused ? 'Resume' : 'Pause';
}

// Bubble sort implementation
async function bubbleSort(array, container, algorithmNumber) {
    let n = array.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            // Visualize comparison
            updateBarColors(container, [j, j + 1], 'compare');
            await sleep(delay);

            if ((sortOrder === 'ascending' && array[j] > array[j + 1]) || (sortOrder === 'descending' && array[j] < array[j + 1])) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];

                // Visualize swap
                updateBarColors(container, [j, j + 1], 'swap');
                await sleep(delay);
            }
        }
    }
    // Mark all bars as sorted
    markAllAsSorted(container);
}

// Insertion sort implementation
async function insertionSort(array, container, algorithmNumber) {
    const bars = container.querySelectorAll('.bar');
    const n = bars.length;
    const numbers = Array.from(bars).map(bar => parseInt(bar.dataset.value));

    for (let i = 1; i < n; i++) {
        const key = numbers[i];
        let j = i - 1;

        // Highlight bar at `i`
        updateBarColors(container, [i], 'compare');
        await sleep(delay);

        while (j >= 0 &&
            ((sortOrder === 'ascending' && numbers[j] > key) || (sortOrder === 'descending' && numbers[j] < key))
        ) {
            numbers[j + 1] = numbers[j];

            // Perform visual shift (update `bars[j + 1]` with `bars[j]` values)
            bars[j + 1].style.height = bars[j].style.height;
            bars[j + 1].dataset.value = bars[j].dataset.value;
            bars[j + 1].nextElementSibling.textContent = bars[j].nextElementSibling.textContent;

            j--;

            if (j >= 0) {
                updateBarColors(container, [j], 'compare');
            }
            await sleep(delay);
        }

        numbers[j + 1] = key;

        // Update the visual bar at `j + 1` with the key's value
        bars[j + 1].style.height = `${(key / Math.max(...array)) * container.clientHeight}px`;
        bars[j + 1].dataset.value = key;
        bars[j + 1].nextElementSibling.textContent = key;

        updateBarColors(container, [j + 1], 'swap');
        await sleep(delay);
    }

    markAllAsSorted(container);
}

// Merge sort implementation
async function mergeSort(array, container, algorithmNumber) {
    const bars = container.querySelectorAll('.bar');
    const numbers = Array.from(bars).map(bar => parseInt(bar.dataset.value));
    const maxValue = Math.max(...array);

    // Helper function to update visualization
    async function updateVisualization(container, left, right, mergedArray) {
        const bars = container.querySelectorAll('.bar');
        for (let i = left; i <= right; i++) {
            bars[i].style.height = `${(mergedArray[i - left] / maxValue) * container.clientHeight}px`;
            bars[i].dataset.value = mergedArray[i - left];
            bars[i].nextElementSibling.textContent = mergedArray[i - left];
            updateBarColors(container, [i], 'swap');
            await sleep(delay);
        }
        updateBarColors(container, [], 'none');
    }

    async function merge(arr, l, m, r) {
        let n1 = m - l + 1;
        let n2 = r - m;

        // Create temp arrays
        let L = new Array(n1);
        let R = new Array(n2);

        // Copy data to temp arrays L[] and R[]
        for (let i = 0; i < n1; i++)
            L[i] = arr[l + i];
        for (let j = 0; j < n2; j++)
            R[j] = arr[m + 1 + j];

        // Merge the temp arrays back into arr[l..r]
        let i = 0, j = 0, k = l;
        
        while (i < n1 && j < n2) {
            updateBarColors(container, [l + i, m + 1 + j], 'compare');
            await sleep(delay);

            if ((sortOrder === 'ascending' && L[i] <= R[j]) || 
                (sortOrder === 'descending' && L[i] >= R[j])) {
                arr[k] = L[i];
                i++;
            } else {
                arr[k] = R[j];
                j++;
            }
            k++;
        }

        // Copy the remaining elements of L[], if there are any
        while (i < n1) {
            arr[k] = L[i];
            i++;
            k++;
        }

        // Copy the remaining elements of R[], if there are any
        while (j < n2) {
            arr[k] = R[j];
            j++;
            k++;
        }

        // Update visualization
        await updateVisualization(container, l, r, arr.slice(l, r + 1));
    }

    async function sort(arr, l, r) {
        if (l >= r) return;
        
        let m = l + parseInt((r - l) / 2);
        
        await sort(arr, l, m);
        await sort(arr, m + 1, r);
        await merge(arr, l, m, r);
    }

    await sort(numbers, 0, numbers.length - 1);
    markAllAsSorted(container);
}

// Quick sort implementation
async function quickSort(array, container, algorithmNumber) {
    const bars = container.querySelectorAll('.bar');
    const n = bars.length;
    const numbers = Array.from(bars).map(bar => parseInt(bar.dataset.value));

    async function partition(numbers, low, high) {
        const pivot = numbers[high];
        let i = low - 1;

        updateBarColors(container, [high], 'compare');
        await sleep(delay);

        for (let j = low; j < high; j++) {
            updateBarColors(container, [j], 'compare');
            await sleep(delay);

            if ((sortOrder === 'ascending' && numbers[j] < pivot) || (sortOrder === 'descending' && numbers[j] > pivot)) {
                i++;
                [numbers[i], numbers[j]] = [numbers[j], numbers[i]];

                bars[i].style.height = `${(numbers[i] / Math.max(...array)) * container.clientHeight}px`;
                bars[i].dataset.value = numbers[i];
                bars[i].nextElementSibling.textContent = numbers[i];

                bars[j].style.height = `${(numbers[j] / Math.max(...array)) * container.clientHeight}px`;
                bars[j].dataset.value = numbers[j];
                bars[j].nextElementSibling.textContent = numbers[j];

                updateBarColors(container, [i, j], 'swap');
                await sleep(delay);
            }
        }

        [numbers[i + 1], numbers[high]] = [numbers[high], numbers[i + 1]];

        bars[i + 1].style.height = `${(numbers[i + 1] / Math.max(...array)) * container.clientHeight}px`;
        bars[i + 1].dataset.value = numbers[i + 1];
        bars[i + 1].nextElementSibling.textContent = numbers[i + 1];

        bars[high].style.height = `${(numbers[high] / Math.max(...array)) * container.clientHeight}px`;
        bars[high].dataset.value = numbers[high];
        bars[high].nextElementSibling.textContent = numbers[high];

        updateBarColors(container, [i + 1, high], 'swap');
        await sleep(delay);

        return i + 1;
    }

    async function quickSortRecursive(numbers, low, high) {
        if (low < high) {
            const pi = await partition(numbers, low, high);

            await quickSortRecursive(numbers, low, pi - 1);
            await quickSortRecursive(numbers, pi + 1, high);
        }
    }

    await quickSortRecursive(numbers, 0, n - 1);
    markAllAsSorted(container);
}

// Selection sort implementation
async function selectionSort(array, container, algorithmNumber) {
    const bars = container.querySelectorAll('.bar');
    const n = bars.length;
    const numbers = Array.from(bars).map(bar => parseInt(bar.dataset.value));

    for (let i = 0; i < n - 1; i++) {
        let minMaxIdx = i;
        for (let j = i + 1; j < n; j++) {
            updateBarColors(container, [minMaxIdx, j], 'compare');
            await sleep(delay);

            if ((sortOrder === 'ascending' && numbers[j] < numbers[minMaxIdx]) || (sortOrder === 'descending' && numbers[j] > numbers[minMaxIdx])) {
                minMaxIdx = j;
            }
        }

        if (minMaxIdx !== i) {
            [numbers[i], numbers[minMaxIdx]] = [numbers[minMaxIdx], numbers[i]];

            bars[i].style.height = `${(numbers[i] / Math.max(...array)) * container.clientHeight}px`;
            bars[i].dataset.value = numbers[i];
            bars[i].nextElementSibling.textContent = numbers[i];

            bars[minMaxIdx].style.height = `${(numbers[minMaxIdx] / Math.max(...array)) * container.clientHeight}px`;
            bars[minMaxIdx].dataset.value = numbers[minMaxIdx];
            bars[minMaxIdx].nextElementSibling.textContent = numbers[minMaxIdx];

            updateBarColors(container, [i, minMaxIdx], 'swap');
            await sleep(delay);
        }
    }

    markAllAsSorted(container);
}
