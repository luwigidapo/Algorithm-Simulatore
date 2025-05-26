const stackBody = document.querySelector("#stack-layout");
    const sizeValue = document.querySelector("#size_value");
    const stackInput = document.querySelector("#stack-input");
    const pushBtn = document.querySelector("#push-btn");
    const popBtn = document.querySelector("#pop-btn");
    const clearBtn = document.querySelector("#clear-btn");
    const backBtn = document.querySelector("#back-btn");
    const maximizeBtn = document.querySelector("#maximize-btn");
    const topBox = document.querySelector(".top-box");
    const stackContainer = document.getElementById("stack-container");
    const MAX_SIZE = 15;

    let stack = [];

    function updateStackVisualization() {
        sizeValue.textContent = stack.length;
        topBox.textContent = stack.length ? stack[stack.length - 1] : '';

        stackContainer.innerHTML = '';

        for (let i = MAX_SIZE - 1; i >= 0; i--) {
            const stackSlotContainer = document.createElement('div');
            stackSlotContainer.className = 'stack-slot-container';

            const stackSlot = document.createElement('div');
            stackSlot.className = 'stack-slot';
            stackSlot.textContent = i < stack.length ? stack[stack.length - 1 - i] : '';
            if (i < stack.length) {
                stackSlot.classList.add('filled');
            }
            stackSlotContainer.appendChild(stackSlot);

            const stackIndex = document.createElement('div');
            stackIndex.className = 'stack-index';
            stackIndex.textContent = i;
            stackSlotContainer.appendChild(stackIndex);

            stackContainer.appendChild(stackSlotContainer);
        }
    }

    function pushToStack() {
        if (stack.length >= MAX_SIZE) {
            return alert("Stack overflow!");
        }

        const inputValues = stackInput.value.split(',').map(item => item.trim());

        for (const value of inputValues) {
            if (stack.length >= MAX_SIZE) {
                alert("Stack overflow! Not all values could be pushed.");
                break;
            }

            if (value) {
                stack.push(value);
            }
        }

        stackInput.value = '';
        updateStackVisualization();
    }

    function popFromStack() {
        if (stack.length === 0) {
            return alert("Stack underflow!");
        }

        const poppedValue = stack.pop();
        alert(`Popped value: ${poppedValue}`);
        updateStackVisualization();
    }

    function clearStack() {
        if (stack.length === 0) {
            return alert("Stack is already empty");
        }
        if (!confirm("Are you sure you want to clear the stack?")) {
            return;
        }
        stack = [];
        updateStackVisualization();
    }

    pushBtn.addEventListener('click', pushToStack);
    popBtn.addEventListener('click', popFromStack);
    clearBtn.addEventListener('click', clearStack);

    stackInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            pushToStack();
        }
    });

    backBtn.addEventListener('click', () => window.location.href = 'sorting.html');

    maximizeBtn.addEventListener('click', () => {
        document.getElementById('fullbody').classList.toggle('maximized');
        maximizeBtn.textContent = document.getElementById('fullbody').classList.contains('maximized') ? 'Minimize' : 'Maximize';
    });

    updateStackVisualization();