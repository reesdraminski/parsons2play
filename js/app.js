const synth = window.speechSynthesis;

let delay;
let firstRun = true;
let hasLocalStorage = false;
let _currentLevel = 0;
const _levels = [
    {
        blocks: [
            "function startGame() {",
            "fill(x, y, PLAYER_COLOR);",
            "fill(WIN.x, WIN.y, FINISH_COLOR);",
            "drawMaze()",
            "}"
        ],
        backgroundCode: "console.log('Use W, A, S, D to move!');\nconst PLAYER_COLOR = \"red\";\nconst MAZE = \"black\";\nconst FINISH_COLOR = \"yellow\";\nconst WIN = {x: 7, y: 7};\n\n// player position\n\nlet x = 0, y = 0;\n\nstartGame();\n\nfunction drawMaze() {\n\tfill(0, 1, MAZE);\n\tfill(0, 2, MAZE);\n\tfill(0, 3, MAZE);\n\tfill(0, 7, MAZE);\n\t\n\tfill(1, 2, MAZE);\n\tfill(1, 5, MAZE);\n\t\n\tfill(2, 4, MAZE);\n\tfill(2, 5, MAZE);\n\tfill(2, 6, MAZE);\n\t\n\tfill(3, 0, MAZE);\n\tfill(3, 1, MAZE);\n\tfill(3, 4, MAZE);\n\t\n\tfill(4, 0, MAZE);\n\t\n\tfill(5, 1, MAZE);\n\tfill(5, 4, MAZE);\n\tfill(5, 5, MAZE);\n\t\n\tfill(6, 5, MAZE);\n\t\n\tfill(7, 0, MAZE);\n\tfill(7, 1, MAZE);\n\tfill(7, 2, MAZE);\n\tfill(7, 3, MAZE);\n\tfill(7, 6, MAZE);\n}\n\ndocument.onkeydown = e => {\n\t// move player up on W\n\tif (e.code == \"KeyW\")\n\t\tif (isInBounds(x, y + 1) && !isMaze(x, y + 1))\n\t\t\ty++;\n\t// move player down on S\n\tif (e.code == \"KeyS\")\n\t\tif (isInBounds(x, y - 1) && !isMaze(x, y - 1))\n\t\t\ty--;\n\t// move player left on A\n\tif (e.code == \"KeyA\")\n\t\tif (isInBounds(x - 1, y) && !isMaze(x - 1, y))\n\t\t\tx--;\n\t// move player right on D\n\tif (e.code == \"KeyD\")\n\t\tif (isInBounds(x + 1, y) && !isMaze(x + 1, y))\n\t\t\tx++;\n\t\n\tclear();\n\t\n\t// detect if user has won\n\tif (x == WIN.x && y == WIN.y)\n\t\tconsole.log(\"You won!\");\n\telse\n\t\tfill(WIN.x, WIN.y, FINISH_COLOR);\n\t\n\tdrawMaze();\n\tfill(x, y, PLAYER_COLOR);\n}\n\nfunction isInBounds(x, y) {\n\tif (x < getWidth() && x >= 0) \n\t\tif (y < getHeight() && y >= 0)\n\t\t\treturn true;\n\t\n\treturn false;\n}\n\nfunction isMaze(x, y) {\n\treturn getFill(x, y) == MAZE;\n}"
    },
    {
        blocks: [
            "function generateMole() {",
            "clear();",
            "const x = Math.floor(Math.random() * getWidth());",
            "const y = Math.floor(Math.random() * getHeight());",
            "fill(x, y, \"brown\");",
            "}"
        ],
        backgroundCode: "let score = 0;\n\n// allow whacking of moles on each tile\nfor (let x = 0; x < getWidth(); x++) {\n\tfor (let y = 0; y < getHeight(); y++) {\n\t\tonClick(x, y, () => whack(x, y));\n\t}\n}\n\nplaceMoles();\n\nasync function placeMoles() {\n\tclear();\n\t\n\tgenerateMole();\n\t\n\tawait sleep(500 + Math.ceil(Math.random() * 750));\n\t\n\tplaceMoles();\n}\n\nfunction whack(x, y) {\n\tif (getFill(x, y) == \"brown\") {\n\t\tscore++;\n\t\t\n\t\tconsole.log(\"Score: \" + score);\n\t\t\n\t\tgenerateMole();\n\t}\t\n}"
    }
];

/**
 * Initialize the UI components.
 */
(function init() {
    // create splitter panel
    $(".panel-left").resizable({
        handleSelector: ".splitter",
        resizeHeight: false
    });

    // make the code bank and solution divs connected sortables
    $("#bank, #solution").sortable({
        connectWith: ".connected"
    });

    // bind to console.log and console.error
    bindLogging();

    // add the levels to the selector menu
    const levelSelector = document.getElementById("levelSelector");
    for (let i = 1; i <= _levels.length; i++) {
        // create a menu item to open the lesson
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.innerText = i;
        a.onclick = () => setLevel(i);
        li.appendChild(a);

        // add the level to the selector menu
        levelSelector.append(li);
    }

    // start at level 1
    setLevel(0);
})();

/**
 * Set the level.
 * @param {Number} levelNum 
 */
function setLevel(levelNum) {
    // clear the code bank
    document.getElementById("bank").innerHTML = "";

    // get the level selector element
    const levelSelector = document.getElementById("levelSelector");

    // get rid of previous active
    if (_currentLevel - 1 > 0) {
        levelSelector.children[_currentLevel].children[0].classList.remove("active");
    }

    // change the current level
    _currentLevel = levelNum;
    
    // show the level as active
    levelSelector.children[_currentLevel].children[0].classList.add("active");

    // render the code blocks
    const code = JSON.parse(JSON.stringify(_levels[_currentLevel].blocks));
    shuffleArray(code);
    code.forEach(line => renderCodeBlock(line));
}

/**
 * Get the background code that is seperate from the sub-problem that the user is solving.
 * @returns {String} backgroundCode
 */
function getBackgroundCode() {
    return _levels[_currentLevel ].backgroundCode;
}

/**
 * Render the code block in the code bank element.
 * @param {String} code 
 */
function renderCodeBlock(code) {
    const codeBank = document.getElementById("bank");

    // create code block element
    const el = document.createElement("pre");
    el.innerHTML = code;

    // add code mirror className so syntax highlighting works
    el.className = "cm-s-default";

    // run CodeMirror syntax highlighting on the code
    CodeMirror.runMode(code, { name: "javascript" }, el);

    codeBank.appendChild(el);
}

/**
 * Shuffle an array.
 * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 * @param {any[]} array 
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Reset the various states that that need should be done on every run of
 * new code.
 */
function resetStates() {
    // clear the console log view
    clearConsole();

    // clear event listeners
    clearEventListeners();
}

/**
 * Display the editor on the mobile view.
 */
function editMobile() {
    // turn off auto-run
    autoRun = false;

    // turn on button glow
    document.getElementById("execute").classList.toggle("button-glow");

    // display the code editor
    document.getElementsByClassName("panel-left")[0].style.display = "";
}

/**
 * Run the code on mobile mode.
 */
function runMobile() {
    // hide code editor
    document.getElementsByClassName("panel-left")[0].style.display = "none";

    // turn off button flow
    document.getElementById("execute").classList.toggle("button-glow");

    // run the user code
    runCode();
}

/**
 * Get rid of event listeners that would otherwise persist across code execution.
 */
function clearEventListeners() {
    document.onclick = () => {};
    document.onkeypress = () => {};
    document.onkeyup = () => {};
    document.onmouseover = () => {};
}

/**
 * Clear the contents of the onscreen console.
 */
function clearConsole() {
    document.getElementById("console").innerHTML = "";
}

/**
 * Handle the run code button click to run code for the first time.
 */
function runCode() {
    // clear console
    clearConsole();

    resetStates();

    // run the user's code for the first time
    executeCode();
}

/**
 * Stop the code from running.
 */
function stopRunning() {
    // clear all intervals from Mosiac.loop()
    for (let i = 1; i < 999999; i++)
        window.clearInterval(i);
}

/**
* https://github.com/chinchang/web-maker/blob/master/src/utils.js
* @param {String} code 
* @param {Number} timeout 
*/
function addInfiniteLoopProtection(code, timeout=2000) {
    let loopId = 1;
    let patches = [];
    let varPrefix = '_wmloopvar';
    let varStr = 'var %d = Date.now();\n';
    let checkStr = `\nif (Date.now() - %d > ${timeout}) { stopRunning(); throw new Error("Infinite loop detected. Please make changes and press Run Code when you are ready to try again."); break;}\n`;

    try {
        esprima.parse(
            code,
            {
                tolerant: true,
                range: true
            },
            function(node) {
                switch (node.type) {
                    case 'DoWhileStatement':
                    case 'ForStatement':
                    case 'ForInStatement':
                    case 'ForOfStatement':
                    case 'WhileStatement':
                        let start = 1 + node.body.range[0];
                        let end = node.body.range[1];
                        let prolog = checkStr.replace('%d', varPrefix + loopId);
                        let epilog = '';

                        if (node.body.type !== 'BlockStatement') {
                            // `while(1) doThat()` becomes `while(1) {doThat()}`
                            prolog = '{' + prolog;
                            epilog = '}';
                            --start;
                        }

                        patches.push({
                            pos: start,
                            str: prolog
                        });

                        patches.push({
                            pos: end,
                            str: epilog
                        });

                        patches.push({
                            pos: node.range[0],
                            str: varStr.replace('%d', varPrefix + loopId)
                        });

                        ++loopId;

                        break;

                    default:
                        break;
                }
            }
        );

        /* eslint-disable no-param-reassign */
        patches
            .sort((a, b) => b.pos - a.pos)
            .forEach(patch => code = code.slice(0, patch.pos) + patch.str + code.slice(patch.pos));
    }
    catch (e) {

    }

    /* eslint-disable no-param-reassign */
    return code;
}

/**
 * Execute user's code.
 */
function executeCode() {
    // Clear all intervals if its an animation
    for (let i = 1; i < 999999; i++)
        window.clearInterval(i);

    const blocks = document.getElementById("solution").children;
    let lines = [];
    for (const block of blocks) {
        lines.push(block.innerText);
    }

    // instrument code to prevent infinite loops
    let code = "(async function() {\n_reset();\n" + getBackgroundCode() + "\n" + lines.join("\n") + "})().catch(e => console.error(e))";
    
    // add code as a script to page + execute
    let script = document.createElement('script');
    try {
        // If its first time executing something
        if (firstRun) {
            // Add script tag
            script.appendChild(document.createTextNode(code));
            document.body.appendChild(script);
        }
        else {
            // Remove old code
            document.body.removeChild(document.body.lastChild);

            // Add new code
            script.appendChild(document.createTextNode(code));
            document.body.appendChild(script);
        }
                        
        firstRun = false;
    } 
    catch (e) {
        script.text = code;
        document.body.appendChild(script);
    }
}

/**
 * Bind console.log and console.error and window.error to redirect to the console element.
 */
function bindLogging() {
    // handle errors that come from editor.js
    window.onerror = (message, url, lineNum, colNum, error) => console.error(message);

    const oldLog = console.log;
    const oldError = console.error;
    const oldClear = console.clear;

    const consoleEl = document.getElementById("console");

    console.log = function(message) {
        // stringify JSON and arrays
        if (message && typeof message == "object") {
            // create code block as pre to keep whitespace
            const el = document.createElement("div");

            // add code mirror className so syntax highlighting works
            el.className = "cm-s-default";
                        
            // run CodeMirror syntax highlighting on the code
            // CodeMirror.runMode(JSON.stringify(message), { name: "javascript" }, el);
            consoleEl.innerHTML = JSON.stringify(message);

            consoleEl.appendChild(el);
        }
        else {
            // Append value to the end if there is already log output
            if (consoleEl.innerHTML)
                consoleEl.innerHTML += "<br>" + message;
            // Set the new value of log output
            else
                consoleEl.innerHTML = message;
        }

        consoleEl.scrollTop = consoleEl.scrollHeight;

        oldLog.apply(console, arguments);
    };

    console.error = function(message) {
        const consoleEl = document.getElementById("console");

        if (consoleEl.innerHTML)
            consoleEl.innerHTML += "<span style='color: red'><br>" + message + "</span>";
        // Set the new value of error output
        else
            consoleEl.innerHTML = "<span style='color: red'>" + message + "</span>";

        oldError.apply(console, arguments);
    }

    console.clear = () => {
        consoleEl.innerHTML = "";

        oldClear.apply(console);
    }
}