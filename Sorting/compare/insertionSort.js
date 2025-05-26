async function insertionSort(array, container, algorithmNumber) {
    const bars = container.querySelectorAll('.bar');
    const n = bars.length;
    const numbers = Array.from(bars).map(bar => parseInt(bar.dataset.value));
    const maxValue = Math.max(...array);

    for (let i = 1; i < n; i++) {
        const key = numbers[i];
        let j = i - 1;

        // Highlight the current key being inserted
        updateBarColors(container, [i], 'compare');
        await sleep(delay);

        while (j >= 0 &&
            ((sortOrder === 'ascending' && numbers[j] > key) || 
             (sortOrder === 'descending' && numbers[j] < key))
        ) {
            // Highlight the comparison
            updateBarColors(container, [j], 'compare');
            await sleep(delay);

            numbers[j + 1] = numbers[j];

            // Perform visual shift
            bars[j + 1].style.height = bars[j].style.height;
            bars[j + 1].dataset.value = bars[j].dataset.value;
            bars[j + 1].nextElementSibling.textContent = bars[j].nextElementSibling.textContent;

            // Highlight the shift
            updateBarColors(container, [j, j + 1], 'swap');
            await sleep(delay);

            j--;

            // Clear previous comparison highlights
            if (j >= 0) {
                updateBarColors(container, [], 'none');
            }
        }

        numbers[j + 1] = key;

        // Update the final position of the key
        bars[j + 1].style.height = `${(key / maxValue) * container.clientHeight}px`;
        bars[j + 1].dataset.value = key;
        bars[j + 1].nextElementSibling.textContent = key;

        // Highlight the final placement
        updateBarColors(container, [j + 1], 'swap');
        await sleep(delay);

        // Clear all highlights before next iteration
        updateBarColors(container, [], 'none');
    }

    markAllAsSorted(container);
}