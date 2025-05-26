var beep = new Audio('beep.mp3');
var mouseclick = new Audio('Mouseclick.mp3');
var done = new Audio('wrong.mp3');

const InsertionSortButton = document.querySelector(".InsertionSort");
InsertionSortButton.addEventListener('click', async function () {
    mouseclick.play();
    selectText.innerHTML = `Insertion Sort (${sortOrder})..`;
    
    // Update info panels
    document.getElementById('algorithm-definition').innerHTML = `
        <p><strong>Insertion Sort</strong> is a simple sorting algorithm that builds the final sorted array one item at a time.</p>
        <p><strong>How it works:</strong></p>
        <ol>
            <li>Start from the second element</li>
            <li>Compare it with the elements before it</li>
            <li>Shift the greater elements one position up</li>
            <li>Insert the current element in its correct position</li>
            <li>Repeat until the array is sorted</li>
        </ol>
        <p>It is much less efficient on large lists than more advanced algorithms.</p>
    `;
    
    document.getElementById('code_java').innerHTML = 
`void insertionSort(int arr[]) {
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
}`;

    document.getElementById('time').innerHTML = 
`Time Complexity:
- Worst Case: O(n²) - When array is reverse sorted
- Average Case: O(n²) - Randomly distributed elements
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
            // Final coloring
            document.querySelectorAll('.bar').forEach(bar => {
                bar.style.background = 'rgb(0,255,0)';
            });
        }
    } catch (e) {
        console.log("Sorting was interrupted");
    }
    
    enableSortingBtn();
    enableSizeSlider();
    enableNewArrayBtn();
});

async function InsertionSort() {
    shouldReset = false;
    const barContainers = document.querySelectorAll('.bar-container');
    
    for (let i = 1; i < barContainers.length; i++) {
        if (shouldReset) {
            resetBarColors();
            removeComparisonIndicators();
            return;
        }
        
        let j = i - 1;
        const keyHeight = barContainers[i].querySelector('.bar').style.height;
        const keyValue = parseInt(barContainers[i].querySelector('.bar-number').textContent);
        
        // Highlight the key element
        barContainers[i].querySelector('.bar').style.background = 'rgb(250, 5, 54)';
        addComparisonIndicator(i, "Key", 'rgb(250, 5, 54)');
        
        await waitforme(delay);
        if (shouldReset) {
            resetBarColors();
            removeComparisonIndicators();
            return;
        }

        let comparisonResult;
        if (sortOrder === 'ascending') {
            comparisonResult = j >= 0 && parseInt(barContainers[j].querySelector('.bar-number').textContent) > keyValue;
        } else {
            comparisonResult = j >= 0 && parseInt(barContainers[j].querySelector('.bar-number').textContent) < keyValue;
        }

        while (comparisonResult) {
            incrementComparison();
            
            // Clear previous indicators
            removeComparisonIndicator(j);
            
            // Add comparison indicator
            addComparisonIndicator(j, "Comparing", 'rgb(245, 212, 24)');
            
            if (sortOrder === 'ascending') {
                updateComparisonDisplay(parseInt(barContainers[j].querySelector('.bar-number').textContent), keyValue, '>');
            } else {
                updateComparisonDisplay(parseInt(barContainers[j].querySelector('.bar-number').textContent), keyValue, '<');
            }
            
            barContainers[j].querySelector('.bar').style.background = 'rgb(9, 102, 2)';
            
            // Perform the shift - this counts as one swap/move operation
            barContainers[j + 1].querySelector('.bar').style.height = barContainers[j].querySelector('.bar').style.height;
            barContainers[j + 1].querySelector('.bar-number').textContent = barContainers[j].querySelector('.bar-number').textContent;
            
            // Add shift indicator
            const shiftIndicator = addComparisonIndicator(j, "Shifting →", 'red');
            
            incrementSwap(); // Count this shift operation
            beep.play();
            
            await waitforme(delay);
            
            // Remove the shift indicator
            if (shiftIndicator && shiftIndicator.parentNode) {
                shiftIndicator.parentNode.removeChild(shiftIndicator);
            }
            
            if (shouldReset) {
                resetBarColors();
                removeComparisonIndicators();
                return;
            }

            // Update colors for sorted portion
            for (let k = i; k >= 0; k--) {
                barContainers[k].querySelector('.bar').style.background = 'rgb(3, 252, 11)';
            }

            j--;
            
            if (sortOrder === 'ascending') {
                comparisonResult = j >= 0 && parseInt(barContainers[j].querySelector('.bar-number').textContent) > keyValue;
            } else {
                comparisonResult = j >= 0 && parseInt(barContainers[j].querySelector('.bar-number').textContent) < keyValue;
            }
        }
        
        incrementComparison(); // Count the final comparison that exits the loop
        updateComparisonDisplay('', '', '');
        
        if (!shouldReset) {
            // Insert the key in its correct position
            barContainers[j + 1].querySelector('.bar').style.height = keyHeight;
            barContainers[j + 1].querySelector('.bar-number').textContent = keyValue.toString();
            barContainers[j + 1].querySelector('.bar').style.background = 'rgb(3, 252, 11)';
            
            // Remove all indicators
            removeComparisonIndicator(i);
            if (j + 1 !== i) {
                removeComparisonIndicator(j + 1);
            }
        }
    }
    
    if (!shouldReset) {
        // Final coloring of all bars
        barContainers.forEach(container => {
            container.querySelector('.bar').style.background = 'rgb(0,255,0)';
        });
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
    indicator.style.color = 'white';
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