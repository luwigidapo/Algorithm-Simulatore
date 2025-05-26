import { pause } from './sorting.js';

export async function quickSort(array, updateUI) {
    await quickSortHelper(array, 0, array.length - 1, updateUI);
}

async function quickSortHelper(array, low, high, updateUI) {
    if (low < high) {
        const pi = await partition(array, low, high, updateUI);
        
        await quickSortHelper(array, low, pi - 1, updateUI);
        await quickSortHelper(array, pi + 1, high, updateUI);
    }
}

async function partition(array, low, high, updateUI) {
    const pivot = array[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        await updateUI(j, high, 'compare');
        await pause();
        
        if (array[j] < pivot) {
            i++;
            
            [array[i], array[j]] = [array[j], array[i]];
            await updateUI(i, j, 'swap');
            await pause();
        }
    }
    
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    await updateUI(i + 1, high, 'swap');
    await pause();
    
    return i + 1;
}
