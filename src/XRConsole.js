import { CanvasTexture, DoubleSide, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, } from 'three';
import { MessageType } from './Message.js';
import { XRConsoleFactory } from './XRConsoleFactory.js';
import { wrap}  from './word-wrap.js';
const DEFAULT_OPTIONS = {
    pixelWidth: 1024,
    pixelHeight: 512,
    actualWidth: 1,
    actualHeight: 1,
    horizontalPadding: 5,
    verticalPadding: 5,
    fontSize: 16,
    showTimestamp: true,
    messageType: MessageType.All,
    backgroundColor: '#222222',
    logColor: '#FFFFFF',
    errorColor: '#D0342C',
    warningColor: '#FF7900',
    infoColor: '#76B947',
    debugColor: '#0E86D4',
};
export class XRConsole extends Object3D {
    constructor(options = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        super();
        /**
         * flag to indicate that the console canvas needs to be updated
         */
        this.needsUpdate = true;
        this._options = {
            pixelWidth: (_a = options.pixelWidth) !== null && _a !== void 0 ? _a : DEFAULT_OPTIONS.pixelWidth,
            pixelHeight: (_b = options.pixelHeight) !== null && _b !== void 0 ? _b : DEFAULT_OPTIONS.pixelHeight,
            actualWidth: (_c = options.actualWidth) !== null && _c !== void 0 ? _c : DEFAULT_OPTIONS.actualWidth,
            actualHeight: (_d = options.actualHeight) !== null && _d !== void 0 ? _d : DEFAULT_OPTIONS.actualHeight,
            horizontalPadding: (_e = options.horizontalPadding) !== null && _e !== void 0 ? _e : DEFAULT_OPTIONS.horizontalPadding,
            verticalPadding: (_f = options.verticalPadding) !== null && _f !== void 0 ? _f : DEFAULT_OPTIONS.verticalPadding,
            fontSize: (_g = options.fontSize) !== null && _g !== void 0 ? _g : DEFAULT_OPTIONS.fontSize,
            showTimestamp: (_h = options.showTimestamp) !== null && _h !== void 0 ? _h : DEFAULT_OPTIONS.showTimestamp,
            messageType: options.messageType || DEFAULT_OPTIONS.messageType,
            backgroundColor: (_j = options.backgroundColor) !== null && _j !== void 0 ? _j : DEFAULT_OPTIONS.backgroundColor,
            logColor: (_k = options.logColor) !== null && _k !== void 0 ? _k : DEFAULT_OPTIONS.logColor,
            errorColor: (_l = options.errorColor) !== null && _l !== void 0 ? _l : DEFAULT_OPTIONS.errorColor,
            warningColor: (_m = options.warningColor) !== null && _m !== void 0 ? _m : DEFAULT_OPTIONS.warningColor,
            infoColor: (_o = options.infoColor) !== null && _o !== void 0 ? _o : DEFAULT_OPTIONS.infoColor,
            debugColor: (_p = options.debugColor) !== null && _p !== void 0 ? _p : DEFAULT_OPTIONS.debugColor,
        };
        this._canvas = document.createElement('canvas');
        this._canvas.width = this._options.pixelWidth;
        this._canvas.height = this._options.pixelHeight;
        this.panelMesh = new Mesh(new PlaneGeometry(options.actualWidth, options.actualHeight), new MeshBasicMaterial({
            side: DoubleSide,
            map: new CanvasTexture(this._canvas),
        }));
        this.add(this.panelMesh);
    }
    get innerHeight() {
        return this._options.pixelHeight - this._options.verticalPadding * 2;
    }
    get innerWidth() {
        return this._options.pixelWidth - this._options.horizontalPadding * 2;
    }
    /**
     * Renders the console to the canvas
     * @returns void
     */
    render() {
        // clear canvas
        const context = this._canvas.getContext('2d');
        context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        context.fillStyle = this._options.backgroundColor;
        context.fillRect(0, 0, this._canvas.width, this._canvas.height);
        // measure text
        context.font = `${this._options.fontSize}px monospace`;
        context.textBaseline = 'bottom';
        const textMetrics = context.measureText('M');
        const lineHeight = textMetrics.actualBoundingBoxAscent * 1.2;
        const numLines = Math.ceil(this.innerHeight / lineHeight);
        const numCharsPerLine = Math.floor(this.innerWidth / textMetrics.width);
        const messages = XRConsoleFactory.getInstance().getMessages(this._options.messageType, numLines);
        const lines = this._generateLines(messages, numCharsPerLine);
        this._renderLines(lines, lineHeight, textMetrics.width, context);
        this.panelMesh.material.map.dispose();
        this.panelMesh.material.map = new CanvasTexture(this._canvas);
        this.needsUpdate = false;
    }
    /**
     * Renders lines of text to the canvas
     * @param lines - The lines to render
     * @param lineHeight - The height of a line in pixels
     * @param charWidth - The width of a character in pixels
     * @param context - The canvas context to render to
     * @returns void
     */
    _getColorForMessageType(messageType) {
        switch (messageType) {
            case MessageType.Log:
                return this._options.logColor;
            case MessageType.Error:
                return this._options.errorColor;
            case MessageType.Warning:
                return this._options.warningColor;
            case MessageType.Info:
                return this._options.infoColor;
            case MessageType.Debug:
                return this._options.debugColor;
        }
        throw new Error('Invalid message type');
    }
    /**
     * Generates lines of text to render
     * @param messages - The messages to generate lines for
     * @param numCharsPerLine - The number of characters that can fit on a line
     * @returns lines - The lines to render
     */
    _generateLines(messages, numCharsPerLine) {
        const lines = [];
        messages.forEach((message) => {
            const timestamp = this._options.showTimestamp
                ? buildReadableTimestamp(message.timestamp) + ' '
                : '';
            const textLines = wrapText(message.content, numCharsPerLine - timestamp.length);
            const localLines = [];
            textLines.forEach((textLine, index) => {
                localLines.unshift({
                    text: index == 0 ? timestamp + textLine : textLine,
                    color: this._getColorForMessageType(message.type),
                    indent: index == 0 ? 0 : timestamp.length,
                });
            });
            lines.push(...localLines);
        });
        return lines;
    }
    /**
     * Renders lines of text to the canvas
     * @param lines - The lines to render
     * @param lineHeight - The height of a line
     * @param charWidth - The width of a character
     * @param context - The canvas context to render to
     */
    _renderLines(lines, lineHeight, charWidth, context) {
        let y = Math.min(this.innerHeight, lines.length * lineHeight) +
            this._options.verticalPadding;
        lines.forEach((line) => {
            context.fillStyle = line.color;
            context.fillText(line.text, line.indent * charWidth + this._options.horizontalPadding, y);
            y -= lineHeight;
        });
    }
    updateMatrixWorld(force) {
        super.updateMatrixWorld(force);
        if (this.needsUpdate) {
            this.render();
        }
    }
}
/**
 * Wraps text to a given number of characters per line
 * @param text - text to wrap
 * @param numCharsPerLine - number of characters per line
 * @returns array of lines
 */
const wrapText = (text, numCharsPerLine) => {
    const lines = [];
    const unwrappedLines = text.split('\n');
    unwrappedLines.forEach((line) => {
        const wrappedLines = wrap(line, {
            width: numCharsPerLine,
            indent: '',
            trim: true,
        }).split('\n');
        wrappedLines.forEach((wrappedLine) => {
            lines.push(wrappedLine);
        });
    });
    return lines;
};
/**
 * builds a readable timestamp from a timestamp in milliseconds
 * @param timestamp - timestamp in milliseconds
 * @returns readable timestamp
 */
const buildReadableTimestamp = (timestamp) => {
    const pad = (n, s = 2) => `${new Array(s).fill(0)}${n}`.slice(-s);
    const d = new Date(timestamp);
    return `[${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`;
};
