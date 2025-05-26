async function bubbleSort(array, container, algorithmNumber) {
    const bars = container.querySelectorAll('.bar');
    const n = bars.length;
    const numbers = Array.from(bars).map(bar => parseInt(bar.textContent));

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            updateBarColors(container, [j, j + 1], 'compare');
            await sleep(delay);

            if ((sortOrder === 'ascending' && numbers[j] > numbers[j + 1]) || (sortOrder === 'descending' && numbers[j] < numbers[j + 1])) {
                [numbers[j], numbers[j + 1]] = [numbers[j + 1], numbers[j]];

                // Swap heights and text content in bars (no color update yet)
                const tempHeight = bars[j].style.height;
                bars[j].style.height = bars[j + 1].style.height;
                bars[j + 1].style.height = tempHeight;

                const tempText = bars[j].textContent;
                bars[j].textContent = bars[j + 1].textContent;
                bars[j + 1].textContent = tempText;

                updateBarColors(container, [j, j + 1], 'swap');
                await sleep(delay);
            }
        }
    }
    markAllAsSorted(container);
}
