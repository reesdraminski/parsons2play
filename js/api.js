const table = document.getElementById("mosaic");
let _keyMap = {};

/**
 * Bind the onkeydown event to our handler function that allows for the onKey() function.
 */
document.onkeydown = e => _handleKeyDown(e);

/**
 * Handles onkeydown events with the keyMap that the user can define with their onKey() declarations.
 * @param {Event} e 
 */
function _handleKeyDown(e) {
    // if the key has a function mapped to it
    if (e.key in _keyMap) {
        // call the function that is mapped to the key
        _keyMap[e.key]();
    }
}

/**
 * Pause execution.
 * @param {Number} ms 
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
* The class that allows for color interaction.
*/
class Color {
    /**
    * Get the RGB components of an input.
    * 
    * @param {any} color 
    * @returns {array} colorComponents
    */
    static getComponents(color) {
        // Set hidden pixel to be our color to test
        let colorTest = document.getElementById("colorTest");
        colorTest.style.backgroundColor = color;

        // Get the computed color
        let computedColor = window.getComputedStyle(colorTest).getPropertyValue("background-color");
        computedColor = computedColor.replace("rgb(", "").replace(")", "");

        // Split into array and convert to integers
        let colorComponents = computedColor.split(", ").map((x) => parseInt(x, 10)); 

        return colorComponents;
    }

    /**
    * Check if all the passed colors are the same.
    * 
    * @param  {...any} colors 
    */
    static isSame(...colors) {
        // flatten array
        if (colors.length)
            colors = colors.flat();

        // if there are more than two colors, compare them
        if (colors.length >= 2) {
            // normalize colors so they are all in "R, G, B" format
            for (let i = 0; i < colors.length; i++) {
                let color = colors[i];

                // if in hex or color name format, turn into rgb format
                if (!color.includes(",") || color.includes("rgb")) {
                    color = Color.getComponents(color);

                    // convert the colorComponents array of each color into R, G, B format
                    color = color.join(",");
                }
                    
                // update colors array
                colors[i] = color;
            }

            // check if all the colors are equal
            return colors.every(color => color == colors[0]);
        }
    }

    /**
    * Generates a random color.
    */
    static random() {
        const letters = "0123456789ABCDEF";

        let color = "#";
        for (let i = 0; i < 6; i++) 
            color += letters[Math.floor(Math.random() * 16)];
                
        return color;
    };

    /**
    * Invert the color.
    */
static invert(color) {
        // Set hidden pixel to be our color to test
        var colorTest = document.getElementById("colorTest");
        colorTest.style.backgroundColor = color;

        // Get the computed color
        var color = window.getComputedStyle(colorTest).getPropertyValue("background-color");
        color = color.replace("rgb(", "").replace(")", "");

        // Split into array and convert to integers
        let colorValues = color.split(", ").map(function(x) { 
            return parseInt(x, 10);
        });

        // Invert red, green, and blue color values
        colorValues[0] = 255 - colorValues[0];
        colorValues[1] = 255 - colorValues[1];
        colorValues[2] = 255 - colorValues[2];

        // Return the new color in rgb() format
        return "rgb(" + colorValues.join(", ") + ")";
    };
}

class Tile {
    constructor(cellRef) {
        // set the cell propery of the object to the reference to HTML TableCell
        this.cell = cellRef;

        // defaults
        this._borderColor = "black";
        this._borderStyle = "solid";
        this._borderWidth = 1;
        this._color = "#eeeeee";
        this._gradient = "";
        this._text = "";
    }

    static setSize(size) {
        // change the size of table cells
        const sheet = new CSSStyleSheet();
        sheet.replaceSync("td { padding: " + size + "px }");

        // apply the stylesheet to the document
        if (document.adoptedStyleSheets)
            document.adoptedStyleSheets = document.adoptedStyleSheets.concat(sheet);
        else
            document.adoptedStyleSheets = [sheet];
    }

    static setRadius(radius) {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync("td { border-radius: " + radius + "%; }");

        // apply the stylesheet to the document
        if (document.adoptedStyleSheets)
            document.adoptedStyleSheets = document.adoptedStyleSheets.concat(sheet);
        else
            document.adoptedStyleSheets = [sheet];
    }

    get cellRef() {
        return this.cell;
    }

    get borderColor() {
        return this._borderColor;
    }
    
    set borderColor(color) {
        this._borderColor = color;

        this.cell.style.borderColor = color;
    }

    setBorderColor(color) {
        // without the underscore means its calling the setter
        this.borderColor = color;

        return this;
    }

    get borderStyle() {
        return this._borderStyle;
    }

    set borderStyle(borderStyle) {
        this._borderStyle = borderStyle;

        this.cell.style.borderStyle = borderStyle;
    }

    setBorderStyle(borderStyle) {
        // without the underscore means its calling the setter
        this.borderStyle = borderStyle;

        return this;
    }

    get borderWidth() {
        return this._borderWidth;
    }

    set borderWidth(width) {
        // if the width is a number, add px
        if (!isNaN(width))
            this._borderWidth = width + "px";
        // if is already in px form or is word aka not a number
        else
            this._borderWidth = width;

        this.cell.style.borderWidth = this._borderWidth;
    }

    setBorderWidth(width) {
        // without the underscore means its calling the setter
        this.borderWidth = width;

        return this;
    }

    get color() {
        // return Color.getComponents(this._color);
        return this._color;
    }

    set color(color) {
        // set color of Tile object
        this._color = color;

        // get rid of any gradient it has
        this.cell.style.backgroundImage = "";

        // set background color
        this.cell.style.backgroundColor = color;
    }

    setColor(color) {
        // without the underscore means its calling the setter
        this.color = color;

        return this;
    }

    get gradient() {
        return this._gradient;
    }

    set gradient(colors) {
        // get rid of any color it has
        this.color = "";
        
        this._gradient = colors;

        // set the pixel gradient
        this.cell.style.backgroundImage = '-webkit-linear-gradient(' + colors.join(", ") + ')';
    }

    set backgroundImage(url) {
        this._backgroundImage = url;

        this.cell.style.background = "url(" + url + ")";
        this.cell.style.backgroundSize = "cover";
    }

    get backgroundImage() {
        return this._backgroundImage;
    }

    set transform(transform) {
        this.cell.style.transform = transform;
    }

    setGradient(...colors) {
        this.gradient = colors;

        return this;
    }

    get text() {
        return this._text;
    }

    set text(text) {
        this._text = text;

        this.cell.innerText = text;
    }

    setText(text) {
        this.text = text;

        return this;
    }

    get onClick() {
        return this._onClick;
    }

    set onClick(func) {
        this._onClick = func;

        // set the DOM onclick property to the function
        this.cell.onclick = func;
    }

    setOnClick(func) {
        // without the underscore means its calling the setter
        this.onClick = func;

        return this;
    }

    get onMouseOver() {
        return this._onMouseOver;
    }

    set onMouseOver(func) {
        this._onMouseOver = func;

        // set DOM onmouseover property to the function
        this.cell.onmouseover = func;
    }

    setOnMouseOver(func) {
        this.onMouseOver = func;

        return this;
    }
}

/**
* The Mosaic class.
*/
class Mosaic {
    constructor(width, height) {
        // set the height and width
        this._height = height;
        this._width  = width;

        // clear any leftover table HTML
        table.innerHTML = "";

        // create grid without tiles
        this._tiles = [...Array(this._width)].map(x => Array(this._height));

        // create table with height and width parameters
        for (let y = 0; y < this._height; y++) {
            let tableRow = table.insertRow(y);

            for (let x = 0; x < this._width; x++)  {
                let tile = new Tile(tableRow.insertCell(x));

                this._tiles[x][this._height - 1 - y] = tile;
            }
        }
    };
                
    /**
    * Set the height of the Mosaic object.
    */
    set height(height) {
        // this._height = height;
    }

    /**
    * Get the width of the Mosaic object.
    */
    set width(width) {
        // this._width = width;
    }
                
    /**
    * Get the height of the Mosaic object.
    */
    get height() {
        return this._height;
    }

    /**
    * Get the width of the Mosaic object.
    */
    get width() {
        return this._width;
    }

    get tiles() {
        return this._tiles;
    }

    /**
    * Get the raw DOM element from the table in case the user wants to do something 
    * outside of the normal Mosaic API.
    */
    getTile(x, y) {
        // bounds checking
        if (x >= 0 && x < this._width && y >= 0 && y < this._height)
            return this._tiles[x][y];
    }
                
    /**
    * Set the tile color at x, y.
    */
    setTileColor(x, y, color) {
        // bounds checking
        if (x >= 0 && x < this._width && y >= 0 && y < this._height) 
            this.getTile(x, y).color = color;
    }

    /**
    * Get the tile color at x, y.
    */
    getTileColor(x, y) {
        // bounds checking
        if (x >= 0 && x < this._width && y >= 0 && y < this._height)
            return this.getTile(x, y).color;
    }

    /*
    * Give the pixel a color gradient.
    */
    setTileGradient(x, y, ...colors) {
        // bounds checking
        if (x >= 0 && x < this._width && y >= 0 && y < this._height)
            this.getTile(x, y).gradient = colors;
    }

    /*
    * Give the pixel a color gradient.
    */
    getTileGradient(x, y) {
        // bounds checking
        if (x >= 0 && x < this._width && y >= 0 && y < this._height)
            return this.getTile(x, y).gradient;
    }

    /**
    * Set the background image of the Tile.
    * @param {Number} x 
    * @param {Number} y 
    * @param {String} url 
    */
    setTileBackgroundImage(x, y, url) {
        // bounds checking
        if (x >= 0 && x < this._width && y >= 0 && y < this._height)
            this.getTile(x, y).backgroundImage = url;
    }

    /**
    * 
    * @param {Number} x 
    * @param {Number} y 
    * @returns {String} url
    */
    getTileBackgroundImage(x, y) {
        // bounds checking
        if (x >= 0 && x < this._width && y >= 0 && y < this._height)
            return this.getTile(x, y).backgroundImage;
    }

    /**
    * Set the tile border color at x, y.
    */
    setTileBorderColor(x, y, color) {
        // bounds checking
        if (x >= 0 && x < this._width && y >= 0 && y < this._height)
            this.getTile(x, y).borderColor = color;
    }

    /**
    * Get the tile border color at x, y.
    */
    getTileBorderColor(x, y) {
        // bounds checking
        if (x >= 0 && x < this._width && y >= 0 && y < this._height) 
            return this.getTile(x, y).borderColor;
    }

    /**
    * Set the tile border width at x, y.
    */
    setTileBorderWidth(x, y, width) {
        // bounds checking
        if (x >= 0 && x < this._width && y >= 0 && y < this._height) 
            this.getTile(x, y).borderWidth = width;
    }

    /**
    * Set the tile border color at x, y.
    */
    getTileBorderWidth(x, y) {
        // bounds checking
        if (x >= 0 && x < this._width && y >= 0 && y < this._height) 
            return this.getTile(x, y).borderWidth;
    }

    /**
    * Set the tile border style at x, y.
    */
    setTileBorderStyle(x, y, style) {
        // bounds checking
        if (x >= 0 && x < this._width && y >= 0 && y < this._height)
            this.getTile(x, y).borderStyle = style;
    }

    /**
    * Get the tile border style at x, y.
    */
    getBorderStyle(x, y) {
        // bounds checking
        if (x >= 0 && x < this._width && y >= 0 && y < this._height)
            return this.getTile(x, y).borderStyle;
    }

    /**
    * Set tile border properties at x, y.
    */
    setTileBorder(x, y, color, width, style) {
        setTileBorderColor(x, y, color);
        setTileBorderWidth(x, y, width);
        setTileBorderStyle(x, y, style);
    }

    /**
    * Set tile inner text.
    */
    setTileText(x, y, text) {
        // bounds checking
        if (x >= 0 && x < this._width && y >= 0 && y < this._height) 
            this.getTile(x, y).text = text;
    }

    /**
    * Get tile inner text.
    */
    getTileText(x, y) {
        // bounds checking
        if (x >= 0 && x < this._width && y >= 0 && y < this._height)
            return this.getTile(x, y).text;
    }

    /**
    * Set the tile click function.
    */
    setTileOnClick(x, y, func) {
        // bounds checking
        if (x >= 0 && x < this._width && y >= 0 && y < this._height) 
            this.getTile(x, y).onClick = func;
    }

    /**
    * Set the tile mouseover function.
    */
    setTileOnMouseOver(x, y, func) {
        // bounds checking
        if (x >= 0 && x < this._width && y >= 0 && y < this._height)
            this.getTile(x, y).onMouseOver = func;
    }

    /**
    * A wrapper function to allow animation looping.
    */
    static loop(func, time) {
        this.loopId = setInterval(func, time);
    }

    static stopLoop() {
        clearInterval(this.loopId);

        this.loopId = 0;
    }

    /**
    * Clear the Mosaic's tile color values.
    */
    clear() {
        for (let x = 0; x < this._width; x++) {
            for (let y = 0; y < this._height; y++) {
                this.getTile(x, y).backgroundImage = "";
                this.getTile(x, y).cellRef.style.border = "1px solid black";
                this.getTile(x, y).transform = "";
                this.getTile(x, y).color = "#eeeeee";
            }
        }
    }
}

/**
 * A class that wraps audio-related Web APIs.
 */
class Player {
    static setVoice(voice) {
        this.voice = voice;
    }

    static play(url) {
        const audio = new Audio(url);

        audio.play();
    }

    static speak(text) {
        const utterThis = new SpeechSynthesisUtterance(text);

        if (this.voice)
            utterThis.voice = this.voice;

        window.speechSynthesis.speak(utterThis);
    }

    static getVoices() {
        return window.speechSynthesis.getVoices().map(voice => voice);
    }
}

let _moz = new Mosaic(8, 8);
let level = 0;

/**
 * Reset states for Mosaic.
 */
function _reset() {
    _moz.clear();
}

/**
 * Clear the grid.
 */
function clear() {
    _moz.clear();
}

/**
 * Gets the color of a specific tile.
 * @param {Number} x 
 * @param {Number} y 
 * @returns {String} fillColor
 */
function getFill(x, y) {
    return _moz.getTile(x, y).color;
}

/**
 * Set the color of a specific tile.
 * @param {Number} x 
 * @param {Number} y 
 * @param {String} color 
 */
function fill(x, y, color) {
    // if x or y are not numbers, invalid call
    if (isNaN(x) || isNaN(y)) return;

    // set the Mosaic tile color
    _moz.setTileColor(x, y, color);
}

/**
 * Set the onclick function of a specfic tile.
 * @param {Number} x 
 * @param {Number} y 
 * @param {Function} func 
 */
function onClick(x, y, func) {
    _moz.setTileOnClick(x, y, func);
}

/**
 * Get the height of the grid.
 * @returns {Number} height
 */
function getHeight() {
    return _moz.height;
}

/**
 * Get the width of the grid.
 * @returns {Number} width
 */
function getWidth() {
    return _moz.width;
}