var beep = new Audio('beep.mp3');
var mouseclick = new Audio('Mouseclick.mp3');
var done = new Audio('wrong.mp3');

const BubbleSortButton = document.querySelector(".BubbleSort");
BubbleSortButton.addEventListener('click', async function () {
    mouseclick.play();
    selectText.innerHTML = `Bubble Sort (${sortOrder})..`;
    
    // Update info panels
    document.getElementById('algorithm-definition').innerHTML = `
        <p><strong>Bubble Sort</strong> is a simple sorting algorithm that repeatedly steps through the list, 
        compares adjacent elements and swaps them if they are in the wrong order.</p>
        <p><strong>How it works:</strong></p>
        <ol>
            <li>Start from the first element</li>
            <li>Compare with the next element</li>
            <li>Swap if they are in the wrong order</li>
            <li>Repeat until no more swaps are needed</li>
        </ol>
        <p>The algorithm gets its name because smaller elements "bubble" to the top of the list.</p>
    `;
    
    document.getElementById('code_java').innerHTML = 
`void bubbleSort(int arr[]) {
    int n = arr.length;
    for (int i = 0; i < n-1; i++)
        for (int j = 0; j < n-i-1; j++)
            if (arr[j] > arr[j+1]) {
                // swap
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
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
        await BubbleSort();
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

async function BubbleSort() {
    shouldReset = false;
    const barContainers = document.querySelectorAll('.bar-container');
    
    for (let i = 0; i < barContainers.length - 1; i++) {
        if (shouldReset) {
            resetBarColors();
            removeComparisonIndicators();
            return;
        }
        
        for (let j = 0; j < barContainers.length - i - 1; j++) {
            if (shouldReset) {
                resetBarColors();
                removeComparisonIndicators();
                return;
            }
            
            const num1 = parseInt(barContainers[j].querySelector('.bar-number').textContent);
            const num2 = parseInt(barContainers[j + 1].querySelector('.bar-number').textContent);
            const bar1 = barContainers[j].querySelector('.bar');
            const bar2 = barContainers[j + 1].querySelector('.bar');
            
            // Highlight current pair being compared
            bar1.style.background = 'rgb(250, 5, 54)';
            bar2.style.background = 'rgb(250, 5, 54)';
            
            // Add comparison indicators
            addComparisonIndicator(j, "Current", 'rgb(250, 5, 54)');
            addComparisonIndicator(j + 1, "Next", 'rgb(250, 5, 54)');
            
            incrementComparison();
            
            let shouldSwap = false;
            let comparisonSymbol = '';
            
            if (sortOrder === 'ascending') {
                shouldSwap = num1 > num2;
                comparisonSymbol = shouldSwap ? '>' : '<=';
            } else {
                shouldSwap = num1 < num2;
                comparisonSymbol = shouldSwap ? '<' : '>=';
            }
            
            updateComparisonDisplay(num1, num2, comparisonSymbol);
            
            await waitforme(delay);
            if (shouldReset) {
                resetBarColors();
                removeComparisonIndicators();
                return;
            }
            
            if (shouldSwap) {
                // Add swap indicators
                addComparisonIndicator(j, "Swapping ⇄", 'orange');
                addComparisonIndicator(j + 1, "Swapping ⇄", 'orange');
                
                // Perform the swap (this counts as one swap operation)
                await swapping(j, j + 1);  // Added await here to ensure swap completes
                beep.play();
                // Removed the separate incrementSwap() call since swapping() should handle it
                
                await waitforme(delay);
                if (shouldReset) {
                    resetBarColors();
                    removeComparisonIndicators();
                    return;
                }
                
                // Remove swap indicators
                removeComparisonIndicator(j);
                removeComparisonIndicator(j + 1);
            }
            
            // Remove comparison indicators
            removeComparisonIndicator(j);
            removeComparisonIndicator(j + 1);
            
            // Update colors after comparison
            bar1.style.background = 'rgb(245, 212, 24)';
            bar2.style.background = 'rgb(245, 212, 24)';
            
            updateComparisonDisplay('', '', '');
        }
        
        if (!shouldReset) {
            // Mark the last element as sorted
            barContainers[barContainers.length - 1 - i].querySelector('.bar').style.background = 'rgb(0,255,0)';
        }
    }
    
    if (!shouldReset) {
        // Mark the first element as sorted (in case it wasn't already)
        barContainers[0].querySelector('.bar').style.background = 'rgb(0,255,0)';
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