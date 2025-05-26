var beep = new Audio('beep.mp3');
var mouseclick = new Audio('Mouseclick.mp3');
var done = new Audio('wrong.mp3');

const MergeSortButton = document.querySelector(".MergeSort");
MergeSortButton.addEventListener('click', async function () {
    mouseclick.play();
    selectText.innerHTML = `Merge Sort (${sortOrder})..`;
    
    // Update info panels
    document.getElementById('algorithm-definition').innerHTML = `
        <p><strong>Merge Sort</strong> is a divide-and-conquer algorithm that divides the input array into two halves, sorts them recursively, and then merges the sorted halves.</p>
        <p><strong>How it works:</strong></p>
        <ol>
            <li>Divide the unsorted list into n sublists, each containing one element</li>
            <li>Repeatedly merge sublists to produce new sorted sublists</li>
            <li>Continue until there is only one sublist remaining</li>
        </ol>
        <p>This is the sorted list.</p>
    `;
    
    document.getElementById('code_java').innerHTML = 
`void mergeSort(int arr[], int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        
        merge(arr, l, m, r);
    }
}

void merge(int arr[], int l, int m, int r) {
    int n1 = m - l + 1;
    int n2 = r - m;
    
    int L[] = new int[n1];
    int R[] = new int[n2];
    
    for (int i = 0; i < n1; ++i)
        L[i] = arr[l + i];
    for (int j = 0; j < n2; ++j)
        R[j] = arr[m + 1 + j];
        
    int i = 0, j = 0, k = l;
    
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        k++;
    }
    
    while (i < n1) {
        arr[k] = L[i];
        i++;
        k++;
    }
    
    while (j < n2) {
        arr[k] = R[j];
        j++;
        k++;
    }
}`;

    document.getElementById('time').innerHTML = 
`Time Complexity:
- Worst Case: O(n log n) - All cases
- Average Case: O(n log n) - All cases
- Best Case: O(n log n) - All cases

Space Complexity: O(n) - Requires auxiliary space`;

    disableSortingBtn();
    disableSizeSlider();
    disableNewArrayBtn();
    resetCounters();
    startTimer();
    
    try {
        const barContainers = document.querySelectorAll('.bar-container');
        removeComparisonIndicators(); // Clear any existing indicators
        shouldReset = false; // Reset the flag before starting
        await MergeSort(barContainers, 0, barContainers.length - 1);
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

async function MergeSort(barContainers, l, r) {
    if (l >= r) {
        return;
    }
    
    const m = l + Math.floor((r - l) / 2);
    
    // Add partition indicators
    addComparisonIndicator(l, `Left ${l}-${m}`, '#A020F0');
    addComparisonIndicator(m, `Mid`, '#A020F0');
    addComparisonIndicator(r, `Right ${m+1}-${r}`, '#A020F0');
    
    await waitforme(delay);
    if (shouldReset) {
        resetBarColors();
        removeComparisonIndicators();
        throw new Error("Sorting interrupted");
    }
    
    await MergeSort(barContainers, l, m);
    if (shouldReset) {
        resetBarColors();
        removeComparisonIndicators();
        throw new Error("Sorting interrupted");
    }
    
    await MergeSort(barContainers, m + 1, r);
    if (shouldReset) {
        resetBarColors();
        removeComparisonIndicators();
        throw new Error("Sorting interrupted");
    }
    
    // Remove partition indicators before merge
    removeComparisonIndicator(l);
    removeComparisonIndicator(m);
    removeComparisonIndicator(r);
    
    await Merge(barContainers, l, m, r);
}

async function Merge(barContainers, l, m, r) {
    const n1 = m - l + 1;
    const n2 = r - m;
    
    // Highlight left and right halves
    for (let i = l; i <= m; i++) {
        barContainers[i].querySelector('.bar').style.background = '#ff9999';
        addComparisonIndicator(i, "Left", '#ff9999');
    }
    for (let i = m + 1; i <= r; i++) {
        barContainers[i].querySelector('.bar').style.background = '#ffff99';
        addComparisonIndicator(i, "Right", '#ffff99');
    }
    
    await waitforme(delay);
    if (shouldReset) {
        resetBarColors();
        removeComparisonIndicators();
        throw new Error("Sorting interrupted");
    }
    
    // Create temp arrays
    const leftValues = [];
    const leftHeights = [];
    const rightValues = [];
    const rightHeights = [];
    
    for (let i = 0; i < n1; i++) {
        leftValues.push(parseInt(barContainers[l + i].querySelector('.bar-number').textContent));
        leftHeights.push(barContainers[l + i].querySelector('.bar').style.height);
    }
    for (let j = 0; j < n2; j++) {
        rightValues.push(parseInt(barContainers[m + 1 + j].querySelector('.bar-number').textContent));
        rightHeights.push(barContainers[m + 1 + j].querySelector('.bar').style.height);
    }
    
    let i = 0, j = 0, k = l;
    
    while (i < n1 && j < n2) {
        if (shouldReset) {
            resetBarColors();
            removeComparisonIndicators();
            throw new Error("Sorting interrupted");
        }
        
        // Highlight current elements being compared
        if (l + i < barContainers.length) {
            barContainers[l + i].querySelector('.bar').style.background = 'red';
            addComparisonIndicator(l + i, "Comparing", 'red');
        }
        if (m + 1 + j < barContainers.length) {
            barContainers[m + 1 + j].querySelector('.bar').style.background = 'yellow';
            addComparisonIndicator(m + 1 + j, "Comparing", 'yellow');
        }
        
        incrementComparison();
        
        let comparisonResult;
        if (sortOrder === 'ascending') {
            comparisonResult = leftValues[i] <= rightValues[j];
            updateComparisonDisplay(leftValues[i], rightValues[j], comparisonResult ? '<=' : '>');
        } else {
            comparisonResult = leftValues[i] >= rightValues[j];
            updateComparisonDisplay(leftValues[i], rightValues[j], comparisonResult ? '>=' : '<');
        }
        
        await waitforme(delay);
        beep.play();
        
        // Remove comparison indicators
        if (l + i < barContainers.length) removeComparisonIndicator(l + i);
        if (m + 1 + j < barContainers.length) removeComparisonIndicator(m + 1 + j);
        
        if (comparisonResult) {
            barContainers[k].querySelector('.bar').style.height = leftHeights[i];
            barContainers[k].querySelector('.bar-number').textContent = leftValues[i].toString();
            addComparisonIndicator(k, "Merged", 'lightgreen');
            i++;
        } else {
            barContainers[k].querySelector('.bar').style.height = rightHeights[j];
            barContainers[k].querySelector('.bar-number').textContent = rightValues[j].toString();
            addComparisonIndicator(k, "Merged", 'lightgreen');
            j++;
            incrementSwap();
        }
        
        barContainers[k].querySelector('.bar').style.background = 'lightgreen';
        k++;
        
        updateComparisonDisplay('', '', '');
        await waitforme(delay);
        removeComparisonIndicator(k - 1);
    }
    
    while (i < n1) {
        if (shouldReset) {
            resetBarColors();
            removeComparisonIndicators();
            throw new Error("Sorting interrupted");
        }
        
        barContainers[k].querySelector('.bar').style.height = leftHeights[i];
        barContainers[k].querySelector('.bar-number').textContent = leftValues[i].toString();
        barContainers[k].querySelector('.bar').style.background = 'lightgreen';
        addComparisonIndicator(k, "Merged", 'lightgreen');
        i++;
        k++;
        await waitforme(delay);
        beep.play();
        removeComparisonIndicator(k - 1);
    }
    
    while (j < n2) {
        if (shouldReset) {
            resetBarColors();
            removeComparisonIndicators();
            throw new Error("Sorting interrupted");
        }
        
        barContainers[k].querySelector('.bar').style.height = rightHeights[j];
        barContainers[k].querySelector('.bar-number').textContent = rightValues[j].toString();
        barContainers[k].querySelector('.bar').style.background = 'lightgreen';
        addComparisonIndicator(k, "Merged", 'lightgreen');
        j++;
        k++;
        await waitforme(delay);
        beep.play();
        removeComparisonIndicator(k - 1);
    }
    
    if (!shouldReset) {
        for (let x = l; x <= r; x++) {
            barContainers[x].querySelector('.bar').style.background = 'rgb(0,255,0)';
        }
    }
}

// Helper functions for comparison indicators
function addComparisonIndicator(index, text, color) {
    // First remove any existing indicator at this position
    removeComparisonIndicator(index);
    
    const barContainer = document.querySelectorAll('.bar-container')[index];
    if (!barContainer) return null;
    
    const indicator = document.createElement('div');
    indicator.className = 'comparison-indicator';
    indicator.textContent = text;
    indicator.style.position = 'absolute';
    indicator.style.top = '-25px';
    indicator.style.left = '50%';
    indicator.style.transform = 'translateX(-50%)';
    indicator.style.backgroundColor = color || '#333';
    indicator.style.color = 'black';
    indicator.style.padding = '2px 5px';
    indicator.style.borderRadius = '3px';
    indicator.style.fontSize = '12px';
    indicator.style.zIndex = '10';
    indicator.style.whiteSpace = 'nowrap';
    
    // Add arrow
    const arrow = document.createElement('div');
    arrow.style.position = 'absolute';
    arrow.style.bottom = '-8px';
    arrow.style.left = '50%';
    arrow.style.transform = 'translateX(-50%)';
    arrow.style.width = '0';
    arrow.style.height = '0';
    arrow.style.borderLeft = '6px solid transparent';
    arrow.style.borderRight = '6px solid transparent';
    arrow.style.borderTop = `8px solid ${color || '#333'}`;
    
    indicator.appendChild(arrow);
    barContainer.appendChild(indicator);
    
    return indicator;
}

function removeComparisonIndicator(index) {
    const barContainer = document.querySelectorAll('.bar-container')[index];
    if (!barContainer) return;
    
    const indicator = barContainer.querySelector('.comparison-indicator');
    if (indicator) {
        barContainer.removeChild(indicator);
    }
}

function removeComparisonIndicators() {
    document.querySelectorAll('.comparison-indicator').forEach(indicator => {
        indicator.parentNode?.removeChild(indicator);
    });
}

function resetBarColors() {
    const bars = document.querySelectorAll('.bar');
    bars.forEach(el => {
        el.style.background = '';
    });
}