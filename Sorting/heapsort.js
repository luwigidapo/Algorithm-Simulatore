var beep = new Audio('beep.mp3');
var mouseclick = new Audio('Mouseclick.mp3');
var done = new Audio('wrong.mp3');

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

    document.getElementById('code_java').innerHTML = `void heapSort(int arr[]) {
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
    int largest = i; // Initialize largest as root
    int l = 2 * i + 1;
    int r = 2 * i + 2;

    // If left child is larger than root
    if (l < n && arr[l] > arr[largest])
        largest = l;

    // If right child is larger than largest so far
    if (r < n && arr[r] > arr[largest])
        largest = r;

    // If largest is not root
    if (largest != i) {
        int swap = arr[i];
        arr[i] = arr[largest];
        arr[largest] = swap;

        // Recursively heapify the affected sub-tree
        heapify(arr, n, largest);
    }
}`;

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
        await (sortOrder === 'ascending' ? HeapSort : heapSortDesc)();
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

async function HeapSort() {
    shouldReset = false;
    const barContainers = document.querySelectorAll('.bar-container');
    const n = barContainers.length;

    // Helper function to swap elements (without counting for heapify operations)
    async function swapElements(index1, index2, countSwap = false) {
        const tempHeight = barContainers[index1].querySelector('.bar').style.height;
        const tempText = barContainers[index1].querySelector('.bar-number').textContent;

        barContainers[index1].querySelector('.bar').style.height = barContainers[index2].querySelector('.bar').style.height;
        barContainers[index1].querySelector('.bar-number').textContent = barContainers[index2].querySelector('.bar-number').textContent;

        barContainers[index2].querySelector('.bar').style.height = tempHeight;
        barContainers[index2].querySelector('.bar-number').textContent = tempText;

        // Only count as swap if specified (for main extraction swaps)
        if (countSwap) {
            incrementSwap();
        }
        
        beep.play();
        await waitforme(delay);
    }

    async function heapify(n, i) {
        let largest = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;

        if (l < n) {
            incrementComparison();
            if (parseInt(barContainers[l].querySelector('.bar-number').textContent) > parseInt(barContainers[largest].querySelector('.bar-number').textContent)) {
                largest = l;
            }
        }

        if (r < n) {
            incrementComparison();
            if (parseInt(barContainers[r].querySelector('.bar-number').textContent) > parseInt(barContainers[largest].querySelector('.bar-number').textContent)) {
                largest = r;
            }
        }

        if (largest !== i) {
            // Heapify swaps are not counted as main swaps
            await swapElements(i, largest, false);
            await heapify(n, largest);
        }
    }

    // Build max heap (rearrange array) - these swaps are not counted
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        if (shouldReset) {
            resetBarColors();
            removeComparisonIndicators();
            return;
        }
        await heapify(n, i);
    }

    // Extract elements from the heap one by one - these swaps ARE counted
    for (let i = n - 1; i > 0; i--) {
        if (shouldReset) {
            resetBarColors();
            removeComparisonIndicators();
            return;
        }
        // This is the main swap that moves the largest element to its final position
        await swapElements(0, i, true); // Count this swap
        await heapify(i, 0);
    }

    if (!shouldReset) {
        barContainers.forEach(container => {
            container.querySelector('.bar').style.background = 'rgb(0,255,0)';
        });
    }
}

async function heapSortDesc() {
    shouldReset = false;
    const barContainers = document.querySelectorAll('.bar-container');
    const n = barContainers.length;

    // Helper function to swap elements (without counting for heapify operations)
    async function swapElements(index1, index2, countSwap = false) {
        const tempHeight = barContainers[index1].querySelector('.bar').style.height;
        const tempText = barContainers[index1].querySelector('.bar-number').textContent;

        barContainers[index1].querySelector('.bar').style.height = barContainers[index2].querySelector('.bar').style.height;
        barContainers[index1].querySelector('.bar-number').textContent = barContainers[index2].querySelector('.bar-number').textContent;

        barContainers[index2].querySelector('.bar').style.height = tempHeight;
        barContainers[index2].querySelector('.bar-number').textContent = tempText;

        // Only count as swap if specified (for main extraction swaps)
        if (countSwap) {
            incrementSwap();
        }
        
        beep.play();
        await waitforme(delay);
    }

    async function heapify(n, i) {
        let smallest = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;

        if (l < n) {
            incrementComparison();
            if (parseInt(barContainers[l].querySelector('.bar-number').textContent) < parseInt(barContainers[smallest].querySelector('.bar-number').textContent)) {
                smallest = l;
            }
        }

        if (r < n) {
            incrementComparison();
            if (parseInt(barContainers[r].querySelector('.bar-number').textContent) < parseInt(barContainers[smallest].querySelector('.bar-number').textContent)) {
                smallest = r;
            }
        }

        if (smallest !== i) {
            // Heapify swaps are not counted as main swaps
            await swapElements(i, smallest, false);
            await heapify(n, smallest);
        }
    }

    // Build min heap (rearrange array) - these swaps are not counted
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        if (shouldReset) {
            resetBarColors();
            removeComparisonIndicators();
            return;
        }
        await heapify(n, i);
    }

    // Extract elements from the heap one by one - these swaps ARE counted
    for (let i = n - 1; i > 0; i--) {
        if (shouldReset) {
            resetBarColors();
            removeComparisonIndicators();
            return;
        }
        // This is the main swap that moves the smallest element to its final position
        await swapElements(0, i, true); // Count this swap
        await heapify(i, 0);
    }

    if (!shouldReset) {
        barContainers.forEach(container => {
            container.querySelector('.bar').style.background = 'rgb(0,255,0)';
        });
    }
}