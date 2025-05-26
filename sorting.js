// Global variables
let arraySize = 20;
let speed = 50; // lower is faster
let bars = {
    insertion: [],
    selection: [],
    bubble: [],
    merge: [],
    quick: []
};
let arrays = {
    insertion: [],
    selection: [],
    bubble: [],
    merge: [],
    quick: []
};

// Initialize the visualizer
function initialize() {
    generateRandomArray();
    setupEventListeners();
}

// Generate random array
function generateRandomArray() {
    const newArray = [];
    for (let i = 0; i < arraySize; i++) {
        newArray.push(Math.floor(Math.random() * 100) + 5);
    }
    
    // Set the same array for all algorithms
    for (const algo in arrays) {
        arrays[algo] = [...newArray];
        renderBars(algo);
    }
}

// Generate nearly sorted array
function generateNearlySortedArray() {
    const newArray = [];
    for (let i = 0; i < arraySize; i++) {
        newArray.push(i * 5 + 5);
    }
    
    // Add some randomness
    for (let i = 0; i < arraySize/5; i++) {
        const idx1 = Math.floor(Math.random() * arraySize);
        const idx2 = Math.floor(Math.random() * arraySize);
        [newArray[idx1], newArray[idx2]] = [newArray[idx2], newArray[idx1]];
    }
    
    for (const algo in arrays) {
        arrays[algo] = [...newArray];
        renderBars(algo);
    }
}

// Generate reversed array
function generateReversedArray() {
    const newArray = [];
    for (let i = 0; i < arraySize; i++) {
        newArray.push(100 - (i * 5));
    }
    
    for (const algo in arrays) {
        arrays[algo] = [...newArray];
        renderBars(algo);
    }
}

// Generate array with few unique values
function generateFewUniqueArray() {
    const uniqueValues = [10, 30, 50, 70, 90];
    const newArray = [];
    for (let i = 0; i < arraySize; i++) {
        newArray.push(uniqueValues[Math.floor(Math.random() * uniqueValues.length)]);
    }
    
    for (const algo in arrays) {
        arrays[algo] = [...newArray];
        renderBars(algo);
    }
}

// Render bars for an algorithm
function renderBars(algo, highlighted = []) {
    const container = document.getElementById(`${algo}-bars`);
    container.innerHTML = '';
    
    bars[algo] = [];
    for (let i = 0; i < arrays[algo].length; i++) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${arrays[algo][i]}%`;
        
        if (highlighted.includes(i)) {
            bar.style.backgroundColor = '#ff6b6b';
        }
        
        container.appendChild(bar);
        bars[algo].push(bar);
    }
}

// Highlight bars during sorting
function highlightBars(algo, indexes, color = '#ff6b6b') {
    indexes.forEach(i => {
        bars[algo][i].style.backgroundColor = color;
    });
}

// Reset bars color after sorting
function resetBarColors(algo) {
    bars[algo].forEach(bar => {
        bar.style.backgroundColor = '#4a6bff';
    });
}

// Swap two elements in array and update visualization
async function swap(algo, i, j) {
    [arrays[algo][i], arrays[algo][j]] = [arrays[algo][j], arrays[algo][i]];
    
    // Highlight the bars being swapped
    highlightBars(algo, [i, j]);
    
    // Update heights
    bars[algo][i].style.height = `${arrays[algo][i]}%`;
    bars[algo][j].style.height = `${arrays[algo][j]}%`;
    
    // Add delay for visualization
    await new Promise(resolve => setTimeout(resolve, speed));
    
    // Reset color
    bars[algo][i].style.backgroundColor = '#4a6bff';
    bars[algo][j].style.backgroundColor = '#4a6bff';
}

// Sorting algorithms
async function insertionSort(algo) {
    const arr = arrays[algo];
    for (let i = 1; i < arr.length; i++) {
        let j = i;
        while (j > 0 && arr[j] < arr[j - 1]) {
            await swap(algo, j, j - 1);
            j--;
        }
    }
    resetBarColors(algo);
}

async function selectionSort(algo) {
    const arr = arrays[algo];
    for (let i = 0; i < arr.length - 1; i++) {
        let minIndex = i;
        highlightBars(algo, [minIndex], '#feca57');
        
        for (let j = i + 1; j < arr.length; j++) {
            highlightBars(algo, [j], '#ff9ff3');
            await new Promise(resolve => setTimeout(resolve, speed/2));
            
            if (arr[j] < arr[minIndex]) {
                bars[algo][minIndex].style.backgroundColor = '#4a6bff';
                minIndex = j;
                highlightBars(algo, [minIndex], '#feca57');
            } else {
                bars[algo][j].style.backgroundColor = '#4a6bff';
            }
        }
        
        if (minIndex !== i) {
            await swap(algo, i, minIndex);
        } else {
            bars[algo][i].style.backgroundColor = '#4a6bff';
        }
    }
    resetBarColors(algo);
}

async function bubbleSort(algo) {
    const arr = arrays[algo];
    let swapped;
    for (let i = 0; i < arr.length - 1; i++) {
        swapped = false;
        for (let j = 0; j < arr.length - i - 1; j++) {
            highlightBars(algo, [j, j+1], '#ff6b6b');
            await new Promise(resolve => setTimeout(resolve, speed));
            
            if (arr[j] > arr[j + 1]) {
                await swap(algo, j, j + 1);
                swapped = true;
            } else {
                resetBarColors(algo);
            }
        }
        if (!swapped) break;
    }
    resetBarColors(algo);
}

async function mergeSort(algo) {
    async function merge(l, m, r) {
        const n1 = m - l + 1;
        const n2 = r - m;
        const L = new Array(n1);
        const R = new Array(n2);

        for (let i = 0; i < n1; i++) L[i] = arrays[algo][l + i];
        for (let j = 0; j < n2; j++) R[j] = arrays[algo][m + 1 + j];

        let i = 0, j = 0, k = l;

        while (i < n1 && j < n2) {
            highlightBars(algo, [l + i, m + 1 + j], '#ff6b6b');
            await new Promise(resolve => setTimeout(resolve, speed));

            if (L[i] <= R[j]) {
                arrays[algo][k] = L[i];
                bars[algo][k].style.height = `${arrays[algo][k]}%`;
                i++;
            } else {
                arrays[algo][k] = R[j];
                bars[algo][k].style.height = `${arrays[algo][k]}%`;
                j++;
            }
            k++;
            await new Promise(resolve => setTimeout(resolve, speed));
        }

        while (i < n1) {
            arrays[algo][k] = L[i];
            bars[algo][k].style.height = `${arrays[algo][k]}%`;
            i++;
            k++;
            await new Promise(resolve => setTimeout(resolve, speed));
        }

        while (j < n2) {
            arrays[algo][k] = R[j];
            bars[algo][k].style.height = `${arrays[algo][k]}%`;
            j++;
            k++;
            await new Promise(resolve => setTimeout(resolve, speed));
        }
        resetBarColors(algo);
    }

    async function sort(l, r) {
        if (l >= r) return;
        const m = l + Math.floor((r - l) / 2);
        await sort(l, m);
        await sort(m + 1, r);
        await merge(l, m, r);
    }

    await sort(0, arrays[algo].length - 1);
    resetBarColors(algo);
}

async function quickSort(algo) {
    async function partition(low, high) {
        const pivot = arrays[algo][high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            highlightBars(algo, [j, high], '#ff6b6b');
            await new Promise(resolve => setTimeout(resolve, speed));

            if (arrays[algo][j] < pivot) {
                i++;
                await swap(algo, i, j);
            }
            resetBarColors(algo);
        }

        await swap(algo, i + 1, high);
        return i + 1;
    }

    async function sort(low, high) {
        if (low < high) {
            const pi = await partition(low, high);
            await sort(low, pi - 1);
            await sort(pi + 1, high);
        }
    }

    await sort(0, arrays[algo].length - 1);
    resetBarColors(algo);
}

// Event listeners
function setupEventListeners() {
    // Play buttons for each algorithm
    document.querySelectorAll('.play').forEach(button => {
        button.addEventListener('click', async function() {
            const algo = this.getAttribute('data-algo');
            this.disabled = true;
            
            switch(algo) {
                case 'insertion':
                    await insertionSort(algo);
                    break;
                case 'selection':
                    await selectionSort(algo);
                    break;
                case 'bubble':
                    await bubbleSort(algo);
                    break;
                case 'merge':
                    await mergeSort(algo);
                    break;
                case 'quick':
                    await quickSort(algo);
                    break;
            }
            
            this.disabled = false;
        });
    });
    
    // Data generation buttons
    document.getElementById('random').addEventListener('click', generateRandomArray);
    document.getElementById('nearly-sorted').addEventListener('click', generateNearlySortedArray);
    document.getElementById('reversed').addEventListener('click', generateReversedArray);
    document.getElementById('few-unique').addEventListener('click', generateFewUniqueArray);
    
    // Play all button
    document.getElementById('play-all').addEventListener('click', async function() {
        this.disabled = true;
        const playButtons = document.querySelectorAll('.play');
        
        for (const button of playButtons) {
            button.click();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.disabled = false;
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);