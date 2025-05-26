var beep = new Audio('beep.mp3');
var mouseclick = new Audio('Mouseclick.mp3');
var done = new Audio('wrong.mp3');

const SelectionSortButton = document.querySelector(".SelectionSort");
SelectionSortButton.addEventListener('click', async function () {
    mouseclick.play();
    selectText.innerHTML = `Selection Sort (${sortOrder})..`;
    
    // Update info panels
    document.getElementById('algorithm-definition').innerHTML = `
        <p><strong>Selection Sort</strong> is an in-place comparison sorting algorithm that divides the input list into two parts.</p>
        <p><strong>How it works:</strong></p>
        <ol>
            <li>Find the minimum (or maximum) element in the unsorted portion</li>
            <li>Swap it with the first unsorted element</li>
            <li>Repeat the process for the remaining unsorted portion</li>
        </ol>
        <p>The algorithm maintains two subarrays: sorted and unsorted.</p>
    `;
    
    document.getElementById('code_java').innerHTML = 
`void selectionSort(int arr[]) {
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
}`;

    document.getElementById('time').innerHTML = 
`Time Complexity:
- Worst Case: O(n²) - All cases
- Average Case: O(n²) - All cases
- Best Case: O(n²) - Even when array is sorted

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

async function SelectionSort() {
    shouldReset = false;
    const barContainers = document.querySelectorAll('.bar-container');
    
    for (let i = 0; i < barContainers.length - 1; i++) {
        if (shouldReset) {
            resetBarColors();
            removeComparisonIndicators();
            return;
        }
        
        let targetIndex = i;
        // Highlight the current target position
        barContainers[i].querySelector('.bar').style.background = 'rgb(250, 5, 54)';
        addComparisonIndicator(i, "Current Min", 'rgb(250, 5, 54)');
        
        for (let j = i + 1; j < barContainers.length; j++) {
            if (shouldReset) {
                resetBarColors();
                removeComparisonIndicators();
                return;
            }
            
            // Highlight the element being compared
            barContainers[j].querySelector('.bar').style.background = 'rgb(245, 212, 24)';
            addComparisonIndicator(j, "Comparing", 'rgb(245, 212, 24)');
            
            incrementComparison();
            
            let shouldUpdateTarget = false;
            if (sortOrder === 'ascending') {
                shouldUpdateTarget = parseInt(barContainers[j].querySelector('.bar-number').textContent) < 
                                    parseInt(barContainers[targetIndex].querySelector('.bar-number').textContent);
                updateComparisonDisplay(
                    parseInt(barContainers[j].querySelector('.bar-number').textContent),
                    parseInt(barContainers[targetIndex].querySelector('.bar-number').textContent),
                    '<'
                );
            } else {
                shouldUpdateTarget = parseInt(barContainers[j].querySelector('.bar-number').textContent) > 
                                    parseInt(barContainers[targetIndex].querySelector('.bar-number').textContent);
                updateComparisonDisplay(
                    parseInt(barContainers[j].querySelector('.bar-number').textContent),
                    parseInt(barContainers[targetIndex].querySelector('.bar-number').textContent),
                    '>'
                );
            }
            
            await waitforme(delay);
            
            if (shouldUpdateTarget) {
                // Reset previous target's color if it wasn't the original position
                if (targetIndex !== i) {
                    barContainers[targetIndex].querySelector('.bar').style.background = 'cyan';
                    removeComparisonIndicator(targetIndex);
                }
                
                targetIndex = j;
                // Update the new target indicator
                removeComparisonIndicator(j);
                addComparisonIndicator(j, "New Min", 'rgb(250, 5, 54)');
            } else {
                barContainers[j].querySelector('.bar').style.background = 'cyan';
                removeComparisonIndicator(j);
            }
            
            updateComparisonDisplay('', '', '');
        }
        
        if (!shouldReset) {
            // Only count as a swap if we actually need to swap elements
            if (targetIndex !== i) {
                // Add swap indicators
                addComparisonIndicator(i, "Swapping ⇄", 'red');
                addComparisonIndicator(targetIndex, "Swapping ⇄", 'red');
                
                await waitforme(delay);
                
                // Perform the swap - DON'T call incrementSwap() here
                // The swapping() function will handle the counter increment
                swapping(targetIndex, i);
                beep.play();
                
                await waitforme(delay);
                
                // Remove swap indicators
                removeComparisonIndicator(i);
                removeComparisonIndicator(targetIndex);
            }
            
            // Mark the sorted element
            barContainers[i].querySelector('.bar').style.background = 'rgb(0,255,0)';
            removeComparisonIndicator(i);
            
            // Reset the target element's color if it wasn't swapped
            if (targetIndex !== i) {
                barContainers[targetIndex].querySelector('.bar').style.background = 'cyan';
            }
        }
    }
    
    if (!shouldReset) {
        // Mark the last element as sorted
        barContainers[barContainers.length - 1].querySelector('.bar').style.background = 'rgb(0,255,0)';
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