var beep = new Audio('beep.mp3');
var mouseclick = new Audio('Mouseclick.mp3');
var done = new Audio('wrong.mp3');

const QuickSortButton = document.querySelector(".QuickSort");
QuickSortButton.addEventListener('click', async function () {
    mouseclick.play();
    selectText.innerHTML = `Quick Sort (${sortOrder})..`;
    
    // Update info panels
    document.getElementById('algorithm-definition').innerHTML = `
        <p><strong>Quick Sort</strong> is a divide-and-conquer algorithm that selects a 'pivot' element and partitions the array around the pivot.</p>
        <p><strong>How it works:</strong></p>
        <ol>
            <li>Pick an element as pivot (here we use last element)</li>
            <li>Partition the array such that elements less than pivot come before and greater elements come after</li>
            <li>Recursively apply the above steps to the sub-arrays</li>
        </ol>
        <p>This is one of the most efficient sorting algorithms.</p>
    `;
    
    document.getElementById('code_java').innerHTML = 
`int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    
    return i + 1;
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`;

    document.getElementById('time').innerHTML = 
`Time Complexity:
- Worst Case: O(n²) - When partition always picks greatest/smallest element
- Average Case: O(n log n) - Expected case with random data
- Best Case: O(n log n) - When partition picks middle element

Space Complexity: O(log n) - Due to recursion stack`;

    disableSortingBtn();
    disableSizeSlider();
    disableNewArrayBtn();
    resetCounters();
    startTimer();
    
    try {
        const barContainers = document.querySelectorAll('.bar-container');
        removeComparisonIndicators(); // Clear any existing indicators
        resetBarColors(); // Reset all colors before starting
        shouldReset = false; // Reset the flag before starting
        
        await QuickSort(barContainers, 0, barContainers.length - 1);
        
        if (!shouldReset) {
            done.play();
            selectText.innerHTML = `Sorting Complete!`;
            stopTimer();
            // Final coloring
            barContainers.forEach(container => {
                container.querySelector('.bar').style.background = 'rgb(0,255,0)';
            });
        }
    } catch (e) {
        console.log("Sorting was interrupted");
    }
    
    enableSortingBtn();
    enableSizeSlider();
    enableNewArrayBtn();
});

async function QuickSort(barContainers, low, high) {
    if (shouldReset) {
        resetBarColors();
        removeComparisonIndicators();
        throw new Error("Sorting reset");
    }

    if (low < high) {
        // Add partition range indicator
        addComparisonIndicator(low, `Partition ${low}-${high}`, '#888');
        addComparisonIndicator(high, `Pivot`, 'red');
        
        const pi = await partition(barContainers, low, high);
        
        if (pi === -1) return; // Partition was interrupted
        
        // Remove partition indicators before recursion
        removeComparisonIndicator(low);
        removeComparisonIndicator(high);
        
        await QuickSort(barContainers, low, pi - 1);
        await QuickSort(barContainers, pi + 1, high);
    } else if (low >= 0 && high >= 0 && low < barContainers.length && high < barContainers.length) {
        // Base case - mark these as sorted
        barContainers[high].querySelector('.bar').style.background = 'rgb(0,255,0)';
        barContainers[low].querySelector('.bar').style.background = 'rgb(0,255,0)';
    }
}

async function partition(barContainers, low, high) {
    if (shouldReset) {
        resetBarColors();
        removeComparisonIndicators();
        return -1;
    }

    beep.play();
    const pivotValue = parseInt(barContainers[high].querySelector('.bar-number').textContent);
    
    // Highlight pivot
    barContainers[high].querySelector('.bar').style.background = 'red';
    addComparisonIndicator(high, "Pivot", 'red');
    
    let i = low - 1;
    
    for (let j = low; j <= high - 1; j++) {
        if (shouldReset) {
            resetBarColors();
            removeComparisonIndicators();
            return -1;
        }
        
        // Highlight current element being compared
        barContainers[j].querySelector('.bar').style.background = 'yellow';
        addComparisonIndicator(j, "Comparing", 'yellow');
        
        await waitforme(delay);
        
        // Only increment comparison counter here
        incrementComparison();
        
        let shouldSwap;
        if (sortOrder === 'ascending') {
            shouldSwap = parseInt(barContainers[j].querySelector('.bar-number').textContent) < pivotValue;
            updateComparisonDisplay(
                parseInt(barContainers[j].querySelector('.bar-number').textContent),
                pivotValue,
                '<'
            );
        } else {
            shouldSwap = parseInt(barContainers[j].querySelector('.bar-number').textContent) > pivotValue;
            updateComparisonDisplay(
                parseInt(barContainers[j].querySelector('.bar-number').textContent),
                pivotValue,
                '>'
            );
        }
        
        if (shouldSwap) {
            i++;
            
            // Only swap and count if elements are different (not already in correct position)
            if (i !== j) {
                // Add swap indicators
                addComparisonIndicator(i, "Swapping ⇄", 'orange');
                addComparisonIndicator(j, "Swapping ⇄", 'orange');
                
                await waitforme(delay);
                
                swapping(i, j);
                beep.play();
                
                await waitforme(delay);
                
                // Remove swap indicators
                removeComparisonIndicator(i);
                removeComparisonIndicator(j);
            }
            
            // Update colors after swap or if already in position
            barContainers[i].querySelector('.bar').style.background = 'orange';
            barContainers[j].querySelector('.bar').style.background = 'orange';
        } else {
            barContainers[j].querySelector('.bar').style.background = 'pink';
        }
        
        // Remove comparison indicator
        removeComparisonIndicator(j);
        updateComparisonDisplay('', '', '');
    }
    
    i++;
    await waitforme(delay);
    
    // Only swap pivot if it's not already in the correct position
    if (i !== high) {
        // Add final swap indicators for pivot
        addComparisonIndicator(i, "Final Swap ⇄", 'purple');
        addComparisonIndicator(high, "Final Swap ⇄", 'purple');
        
        await waitforme(delay);
        
        swapping(i, high);
        beep.play();
        
        await waitforme(delay);
        
        // Remove swap indicators
        removeComparisonIndicator(i);
        removeComparisonIndicator(high);
    }
    
    // Update colors after final swap
    barContainers[high].querySelector('.bar').style.background = 'pink';
    barContainers[i].querySelector('.bar').style.background = 'green';
    
    // Remove pivot indicator
    removeComparisonIndicator(high);
    
    // Reset colors for next partition
    for (let k = low; k <= high; k++) {
        if (barContainers[k].querySelector('.bar').style.background !== 'green') {
            barContainers[k].querySelector('.bar').style.background = 'cyan';
        }
    }
    
    return i;
}

// Helper functions remain the same as in previous implementation