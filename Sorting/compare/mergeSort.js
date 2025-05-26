import { pause } from './sorting.js';

export async function mergeSort(array, updateUI) {
    await mergeSortHelper(array, 0, array.length - 1, updateUI);
}

async function mergeSortHelper(array, left, right, updateUI) {
    if (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        await mergeSortHelper(array, left, mid, updateUI);
        await mergeSortHelper(array, mid + 1, right, updateUI);
        await merge(array, left, mid, right, updateUI);
    }
}

async function merge(array, left, mid, right, updateUI) {
    let n1 = mid - left + 1;
    let n2 = right - mid;
    
    let L = new Array(n1);
    let R = new Array(n2);
    
    for (let i = 0; i < n1; i++) {
        L[i] = array[left + i];
    }
    for (let j = 0; j < n2; j++) {
        R[j] = array[mid + 1 + j];
    }
    
    let i = 0, j = 0, k = left;
    
    while (i < n1 && j < n2) {
        await updateUI(left + i, mid + 1 + j, 'compare');
        await pause();
        
        if (L[i] <= R[j]) {
            array[k] = L[i];
            i++;
        } else {
            array[k] = R[j];
            j++;
        }
        
        k++;
    }
    
    while (i < n1) {
        array[k] = L[i];
        i++;
        k++;
    }
    
    while (j < n2) {
        array[k] = R[j];
        j++;
        k++;
    }
    
    // Visualize the merged array
    for (let x = left; x <= right; x++) {
        await updateUI(x, undefined, 'swap');
        await pause();
    }
}
