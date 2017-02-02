///<reference path="shape.ts"/>
///<reference path="input.ts"/>
var emola;
(function (emola) {
    var SyntaxNodeType = (function () {
        function SyntaxNodeType(displayStr, tokenStr) {
            this.displayStr = displayStr;
            this.tokenStr = tokenStr;
        }
        SyntaxNodeType.prototype.getDisplayStr = function () {
            return this.displayStr;
        };
        SyntaxNodeType.prototype.getTokenStr = function () {
            return this.tokenStr;
        };
        SyntaxNodeType.PLUS = new SyntaxNodeType('+', '+');
        SyntaxNodeType.MINUS = new SyntaxNodeType('-', '-');
        SyntaxNodeType.DIV = new SyntaxNodeType('/', '/');
        SyntaxNodeType.MUL = new SyntaxNodeType('*', '*');
        SyntaxNodeType.CIRCLE = new SyntaxNodeType('◯', 'circle');
        return SyntaxNodeType;
    }());
    emola.SyntaxNodeType = SyntaxNodeType;
    var PaletteComponent = (function () {
        function PaletteComponent(syntaxNodeType) {
            this.syntaxNodeType = syntaxNodeType;
        }
        PaletteComponent.prototype.draw = function (contextWrapper, rect) {
            rect.draw(contextWrapper);
            var point = new emola.Point(rect.point.x + (rect.size.width / 3), rect.point.y + (rect.size.height * 2 / 3));
            var text = new emola.Text(this.syntaxNodeType.getDisplayStr(), point, new emola.Color(200, 200, 200, 1), 20);
            text.draw(contextWrapper);
        };
        PaletteComponent.prototype.toString = function () {
            return "(" + this.syntaxNodeType.getTokenStr() + ")";
        };
        return PaletteComponent;
    }());
    emola.PaletteComponent = PaletteComponent;
    var Palette = (function () {
        function Palette(rect) {
            this.rect = new emola.Rect(new emola.Point(0, 0), new emola.Size(150, 1000), new emola.Color());
            this.rect = rect;
            this.paletteComponentList = [];
        }
        Palette.prototype.click = function (point) {
            var perHeight = this.rect.size.height / this.paletteComponentList.length;
            for (var i in this.paletteComponentList) {
                var size = new emola.Size(this.rect.size.width, perHeight);
                var rect = new emola.Rect(new emola.Point(this.rect.point.x, this.rect.point.y + perHeight * parseInt(i)), size, new emola.Color(100, 100, 100, 1));
                if (rect.point.x <= point.x && point.x <= rect.point.x + rect.size.width && rect.point.y <= point.y && point.y <= rect.point.y + rect.size.height) {
                    return this.paletteComponentList[i];
                }
            }
            return null;
        };
        Palette.prototype.add = function (paletteComponent) {
            this.paletteComponentList.push(paletteComponent);
        };
        Palette.prototype.draw = function (canvasContext) {
            this.rect.draw(canvasContext);
            var perHeight = this.rect.size.height / this.paletteComponentList.length;
            for (var i in this.paletteComponentList) {
                var size = new emola.Size(this.rect.size.width, perHeight);
                var rect = new emola.Rect(new emola.Point(this.rect.point.x, perHeight * parseInt(i) + this.rect.point.y), size, new emola.Color(100, 100, 100, 1));
                this.paletteComponentList[i].draw(canvasContext, rect);
            }
        };
        return Palette;
    }());
    emola.Palette = Palette;
    var CanvasLayerSet = (function () {
        function CanvasLayerSet() {
            this.palette = this.createOperatorPalette();
            this.toolLayer = new emola.CanvasLayer();
            this.toolLayer.add(this.palette);
            this.displayLayer = new emola.CanvasLayer();
            this.expLayer = new emola.CanvasLayer();
        }
        CanvasLayerSet.prototype.createOperatorPalette = function () {
            var palette = new Palette(new emola.Rect(new emola.Point(0, 0), new emola.Size(50, 251), new emola.Color(10, 97, 50, 1)));
            var paletteComponentPlus = new PaletteComponent(SyntaxNodeType.PLUS);
            var paletteComponentMinus = new PaletteComponent(SyntaxNodeType.MINUS);
            var paletteComponentMul = new PaletteComponent(SyntaxNodeType.MUL);
            var paletteComponentDiv = new PaletteComponent(SyntaxNodeType.DIV);
            var paletteComponentCircle = new PaletteComponent(SyntaxNodeType.CIRCLE);
            palette.add(paletteComponentPlus);
            palette.add(paletteComponentMinus);
            palette.add(paletteComponentMul);
            palette.add(paletteComponentDiv);
            palette.add(paletteComponentCircle);
            return palette;
        };
        CanvasLayerSet.prototype.draw = function (canvasContext) {
            this.expLayer.draw(canvasContext);
            this.toolLayer.draw(canvasContext);
            this.displayLayer.draw(canvasContext);
        };
        CanvasLayerSet.prototype.getDisplayLayer = function () {
            return this.displayLayer;
        };
        CanvasLayerSet.prototype.getPalette = function () {
            return this.palette;
        };
        CanvasLayerSet.prototype.set = function (drawableList) {
            this.expLayer.set(drawableList);
        };
        CanvasLayerSet.prototype.add = function (drawable) {
            this.expLayer.add(drawable);
        };
        CanvasLayerSet.prototype.remove = function (drawable) {
            this.expLayer.remove(drawable);
        };
        CanvasLayerSet.prototype.clear = function () {
            this.expLayer.clear();
            this.displayLayer.clear();
        };
        return CanvasLayerSet;
    }());
    emola.CanvasLayerSet = CanvasLayerSet;
})(emola || (emola = {}));

/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="lang.ts" />
/// <reference path="reader.ts"/>
/// <reference path="shape.ts" />
/// <reference path="syntax_list.ts"/>
/// <reference path="manager.ts"/>
/// <reference path="canvas.ts"/>
/// <reference path="socket.ts"/>
/// <reference path="error.ts"/>
/// <reference path="serializer.ts"/>

var emola;
(function (emola) {
    var InvalidTypeError = (function () {
        function InvalidTypeError(message) {
            this.name = 'InvalidTypeError';
            this.message = message;
        }
        return InvalidTypeError;
    }());
    emola.InvalidTypeError = InvalidTypeError;
    var InvalidArgumentError = (function () {
        function InvalidArgumentError(message) {
            this.name = 'InvalidArgumentError';
            this.message = message;
        }
        return InvalidArgumentError;
    }());
    emola.InvalidArgumentError = InvalidArgumentError;
    var NotFoundError = (function () {
        function NotFoundError(message) {
            this.name = 'NotFoundError';
            this.message = message;
        }
        return NotFoundError;
    }());
    emola.NotFoundError = NotFoundError;
    var UnknownTokenError = (function () {
        function UnknownTokenError(message) {
            this.name = 'UnknownTokenError';
            this.message = message;
        }
        return UnknownTokenError;
    }());
    emola.UnknownTokenError = UnknownTokenError;
})(emola || (emola = {}));

///<reference path="shape.ts"/>
var emola;
(function (emola) {
    var MouseInput = (function () {
        function MouseInput() {
            this.clickPoint = new emola.Point(10, 10);
            this.drugPoint = new emola.Point(20, 20);
            this.dropPoint = new emola.Point(30, 30);
        }
        return MouseInput;
    }());
    emola.MouseInput = MouseInput;
    var KeyboardInput = (function () {
        function KeyboardInput() {
        }
        return KeyboardInput;
    }());
    emola.KeyboardInput = KeyboardInput;
    var InputManager = (function () {
        function InputManager() {
            this.mouse = new MouseInput();
            this.keyboard = new KeyboardInput();
        }
        return InputManager;
    }());
    emola.InputManager = InputManager;
})(emola || (emola = {}));

///<reference path="error.ts"/>
///<reference path="manager.ts"/>
var emola;
(function (emola) {
    var AtomType = (function () {
        function AtomType() {
        }
        AtomType.getAtoms = function () {
            return [
                AtomType.FN,
                AtomType.IF,
                AtomType.DEF,
                AtomType.DEFN,
                AtomType.DO,
                AtomType.SEND,
                AtomType.LET,
                AtomType.QUOTE,
                AtomType.EVAL,
                AtomType.PLUS,
                AtomType.MINUS,
                AtomType.DIV,
                AtomType.MUL,
                AtomType.EQUAL,
                AtomType.GREATER,
                AtomType.LESS,
                AtomType.GREATEREQUAL,
                AtomType.LESSEQUAL,
                AtomType.DRAW,
                AtomType.POINT,
                AtomType.COLOR,
                AtomType.CIRCLE,
                AtomType.CLEAR,
                AtomType.RECT,
                AtomType.LINE,
                AtomType.SIZE,
                AtomType.TEXT,
                AtomType.WINDOW,
            ];
        };
        /* lang */
        AtomType.FN = 'fn';
        AtomType.IF = 'if';
        AtomType.DEF = 'def';
        AtomType.DEFN = 'defn';
        AtomType.DO = 'do';
        AtomType.SEND = 'send';
        AtomType.VAR = 'var';
        AtomType.LET = 'let';
        AtomType.QUOTE = 'quote';
        AtomType.EVAL = 'eval';
        /* type */
        AtomType.TRUE = 'true';
        AtomType.FALSE = 'false';
        AtomType.STR = 'str';
        AtomType.NUMBER = 'number';
        /* math */
        AtomType.PLUS = '+';
        AtomType.MINUS = '-';
        AtomType.DIV = '/';
        AtomType.MUL = '*';
        AtomType.EQUAL = '=';
        AtomType.GREATER = '>';
        AtomType.LESS = '<';
        AtomType.GREATEREQUAL = '>=';
        AtomType.LESSEQUAL = '<=';
        /* visual */
        AtomType.DRAW = 'draw';
        AtomType.POINT = 'point';
        AtomType.COLOR = 'color';
        AtomType.CIRCLE = 'circle';
        AtomType.CLEAR = 'clear';
        AtomType.LINE = 'line';
        AtomType.RECT = 'rect';
        AtomType.SIZE = 'size';
        AtomType.TEXT = 'text';
        AtomType.WINDOW = 'window';
        return AtomType;
    }());
    emola.AtomType = AtomType;
    var Atom = (function () {
        function Atom(type, value) {
            if (value === void 0) { value = null; }
            this.type = type;
            this.value = value;
        }
        Atom.isAtom = function (atom) {
            return atom instanceof Atom;
        };
        Atom.isAtomToken = function (token) {
            return AtomType.getAtoms().indexOf(token) >= 0;
        };
        Atom.prototype.equalToType = function (type) {
            return this.type === type;
        };
        Atom.prototype.evalSyntax = function (env) {
            switch (this.type) {
                case AtomType.TRUE:
                    return true;
                case AtomType.FALSE:
                    return false;
                case AtomType.STR:
                    return this.value;
                case AtomType.NUMBER:
                    return Number(this.value);
                case AtomType.VAR:
                    var foundEnv = env.findEnv(this.value);
                    if (foundEnv) {
                        var foundValue = foundEnv.get(this.value);
                        return foundValue;
                    }
                    throw new emola.InvalidTypeError('Target key of environment is not found.');
                default:
                    throw new emola.InvalidTypeError('Unknown reserved word.');
            }
        };
        return Atom;
    }());
    emola.Atom = Atom;
    var Env = (function () {
        function Env(outer) {
            this.outer = outer;
            this.dict = {};
        }
        Env.prototype.update = function (key, value) {
            this.dict[key] = value;
        };
        Env.prototype.get = function (key) {
            return this.dict[key];
        };
        Env.prototype.findEnv = function (key) {
            if (this.outer === null && !this.dict[key]) {
                throw new emola.NotFoundError('symbol:' + key + ' is not found in env.');
            }
            if (this.dict[key]) {
                return this;
            }
            return this.outer.findEnv(key);
        };
        return Env;
    }());
    emola.Env = Env;
    var Fn = (function () {
        function Fn(args, evalable, env) {
            this.args = args;
            this.expList = evalable;
            this.env = env;
        }
        Fn.prototype.evalSyntax = function (env) {
            // 引数のenvは見ない
            return this.expList.evalSyntax(this.env);
        };
        return Fn;
    }());
    emola.Fn = Fn;
    var Quote = (function () {
        function Quote(list) {
            this.list = list;
        }
        Quote.prototype.evalSyntax = function (env) {
            this.env = env;
            return this;
        };
        Quote.prototype.exec = function () {
            return this.list.evalSyntax(this.env);
        };
        return Quote;
    }());
    emola.Quote = Quote;
})(emola || (emola = {}));

/// <reference path="lang.ts" />
/// <reference path="reader.ts"/>
/// <reference path="shape.ts" />
/// <reference path="syntax_list.ts"/>
/// <reference path="canvas.ts"/>
var emola;
(function (emola) {
    var DrawingDirector = (function () {
        function DrawingDirector(canvasContext) {
            this.canvasContext = canvasContext;
            this.graphList = [];
            this.canvasLayerSet = new emola.CanvasLayerSet();
        }
        DrawingDirector.prototype.hasId = function (id) {
            for (var i in this.graphList) {
                if (this.graphList[i].hasId(id)) {
                    return true;
                }
            }
            return false;
        };
        DrawingDirector.prototype.clearCanvasContext = function () {
            this.canvasContext.clear();
        };
        DrawingDirector.prototype.addDisplayElement = function (text) {
            var displayLayer = this.canvasLayerSet.getDisplayLayer();
            displayLayer.add(text);
        };
        DrawingDirector.prototype.add = function (drawing) {
            this.graphList.push(drawing);
        };
        DrawingDirector.prototype.remove = function (drawing) {
            this.graphList.forEach(function (element) {
                element.remove(drawing);
            });
        };
        DrawingDirector.prototype.clear = function () {
            this.graphList = [];
            this.canvasLayerSet.clear();
        };
        DrawingDirector.prototype.draw = function () {
            for (var i = 0; i < this.graphList.length; i++) {
                if (this.graphList[i].rotate) {
                    this.graphList[i].rotate(0.01);
                }
                this.graphList[i].draw(this.canvasContext);
            }
            this.canvasLayerSet.set(this.graphList);
            this.canvasLayerSet.draw(this.canvasContext);
        };
        DrawingDirector.prototype.getPalette = function () {
            return this.canvasLayerSet.getPalette();
        };
        DrawingDirector.prototype.getListObject = function (point, drawing) {
            for (var i in this.graphList) {
                var targetListObject = this.graphList[i].getListObject(point);
                if (targetListObject && targetListObject !== drawing) {
                    return targetListObject;
                }
            }
        };
        return DrawingDirector;
    }());
    emola.DrawingDirector = DrawingDirector;
})(emola || (emola = {}));

///<reference path="syntax_list.ts"/>
var emola;
(function (emola) {
    var TokenReader = (function () {
        function TokenReader(line) {
            if (line === void 0) { line = ""; }
            this.tokenizedList = [];
            if (line != "") {
                this.add(line);
            }
        }
        TokenReader.prototype.add = function (line) {
            this.tokenizedList = this.tokenizedList.concat(Tokenizer.tokenize(line));
        };
        TokenReader.prototype.next = function () {
            if (this.tokenizedList.length === 0) {
                return null;
            }
            return this.tokenizedList.shift();
        };
        return TokenReader;
    }());
    emola.TokenReader = TokenReader;
    var Tokenizer = (function () {
        function Tokenizer() {
        }
        Tokenizer.tokenize = function (inputStr) {
            return inputStr.split('(').join(' ( ').split(')').join(' ) ').split(' ')
                .filter(function (str) { return str ? true : false; })
                .map(function (ele) {
                var parsedFloat = parseFloat(ele);
                return isNaN(parsedFloat) ? ele : parsedFloat;
            });
        };
        return Tokenizer;
    }());
    emola.Tokenizer = Tokenizer;
    var Atomizer = (function () {
        function Atomizer() {
        }
        Atomizer.atomize = function (token) {
            if (token === emola.AtomType.TRUE) {
                return new emola.Atom(emola.AtomType.TRUE);
            }
            else if (token === emola.AtomType.FALSE) {
                return new emola.Atom(emola.AtomType.FALSE);
            }
            else if (typeof token === 'number') {
                return new emola.Atom(emola.AtomType.NUMBER, token);
            }
            else if (typeof token === 'string') {
                if (token[0] === '"' || token[0] === "'") {
                    return new emola.Atom(emola.AtomType.STR, token.slice(1, -1));
                }
                else if (emola.Atom.isAtomToken(token)) {
                    return new emola.Atom(token, null);
                }
                else {
                    return new emola.Atom(emola.AtomType.VAR, token);
                }
            }
            throw new emola.UnknownTokenError("Couldn't find the token in AtomType.");
        };
        return Atomizer;
    }());
    emola.Atomizer = Atomizer;
    var Parser = (function () {
        function Parser() {
        }
        Parser.parse = function (tokenReader, parentList) {
            if (parentList === void 0) { parentList = null; }
            var syntaxList = [];
            while (true) {
                var token = tokenReader.next();
                if (token === '(') {
                    syntaxList.push(Parser.parse(tokenReader, parentList));
                }
                else if (token === ')') {
                    return emola.ExpList.create(syntaxList, parentList);
                }
                else if (token === null) {
                    break;
                }
                else {
                    syntaxList.push(Atomizer.atomize(token));
                }
            }
            return syntaxList[0];
        };
        Parser.parseAndEval = function (tokenReader, env) {
            if (env === void 0) { env = null; }
            if (!env)
                env = new emola.Env(null);
            var parsedList = Parser.parse(tokenReader);
            return parsedList.evalSyntax(env);
        };
        Parser.readAndEval = function (tokenReader, line, env) {
            tokenReader.add(line);
            return Parser.parseAndEval(tokenReader, env);
        };
        return Parser;
    }());
    emola.Parser = Parser;
})(emola || (emola = {}));

///<reference path="syntax_list.ts"/>
var emola;
(function (emola) {
    var TreeSerializer = (function () {
        function TreeSerializer() {
        }
        TreeSerializer.serialize = function (graphExpList) {
            var output = '(';
            var expList = graphExpList.expList;
            for (var i in expList) {
                if (!(expList[i] instanceof emola.Atom)) {
                    output += TreeSerializer.serialize(expList[i]);
                    continue;
                }
                if (emola.Atom.isAtomToken(expList[i].type)) {
                    output += expList[i].type;
                }
                else {
                    output += expList[i].value;
                }
                output += ' ';
            }
            output += ')';
            return output;
        };
        return TreeSerializer;
    }());
    emola.TreeSerializer = TreeSerializer;
})(emola || (emola = {}));

///<reference path="canvas.ts"/>
var emola;
(function (emola) {
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        Point.copy = function (point) {
            return new Point(point.x, point.y);
        };
        Point.prototype.move = function (point) {
            this.x = point.x;
            this.y = point.y;
        };
        Point.prototype.add = function (point) {
            this.x += point.x;
            this.y += point.y;
        };
        Point.prototype.toString = function () {
            return '{x: ' + this.x + ', y: ' + this.y + '}';
        };
        return Point;
    }());
    emola.Point = Point;
    var Size = (function () {
        function Size(width, height) {
            this.width = width;
            this.height = height;
        }
        Size.prototype.move = function (size) {
            this.width = size.width;
            this.height = size.height;
        };
        return Size;
    }());
    emola.Size = Size;
    var Color = (function () {
        function Color(r, g, b, a) {
            if (r === void 0) { r = 0; }
            if (g === void 0) { g = 0; }
            if (b === void 0) { b = 0; }
            if (a === void 0) { a = 1; }
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        Color.copy = function (color) {
            return new Color(color.r, color.g, color.b, color.a);
        };
        Color.prototype.move = function (color) {
            this.r = color.r;
            this.g = color.g;
            this.b = color.b;
            this.a = color.a;
        };
        Color.Red = new Color(255, 0, 0, 1);
        Color.Green = new Color(0, 255, 0, 1);
        Color.Blue = new Color(0, 0, 255, 1);
        Color.BaseGlay = new Color(100, 100, 100, 0.3);
        Color.BaseYellow = new Color(255, 255, 200);
        return Color;
    }());
    emola.Color = Color;
    var Rect = (function () {
        function Rect(point, size, color) {
            if (color === void 0) { color = new Color(); }
            this.point = point;
            this.size = size;
            this.color = color;
        }
        Rect.prototype.move = function (point, size, color) {
            this.point.move(point);
            this.size.move(size);
            this.color.move(color);
        };
        Rect.prototype.isContact = function (point) {
            return !!(this.point.x <= point.x && point.x <= this.point.x + this.size.width
                && this.point.y <= point.y && point.y <= this.point.y + this.size.height);
        };
        Rect.prototype.draw = function (context) {
            context.drawRect(this);
        };
        return Rect;
    }());
    emola.Rect = Rect;
    var Text = (function () {
        function Text(description, point, color, fontSize, fontType) {
            if (fontSize === void 0) { fontSize = Text.DEFAULT_FONT_SIZE; }
            if (fontType === void 0) { fontType = Text.DEFAULT_FONT_TYPE; }
            this.description = description;
            this.point = point;
            this.color = color;
            this.fontSize = fontSize;
            this.fontType = fontType;
        }
        Text.prototype.draw = function (context) {
            context.drawText(this);
        };
        Text.DEFAULT_FONT_TYPE = "Hiragino Kaku Gothic ProN";
        Text.DEFAULT_FONT_SIZE = 18;
        return Text;
    }());
    emola.Text = Text;
    var Circle = (function () {
        function Circle(point, radius, color) {
            this.point = new Point(0, 0);
            this.size = new Size(100, 100);
            this.point = point;
            this.size = new Size(2 * radius, 2 * radius);
            this.radius = radius;
            this.color = color;
        }
        Circle.prototype.move = function (point, radius, color) {
            this.point.move(point);
            this.radius = radius;
            this.color.move(color);
        };
        Circle.prototype.draw = function (context) {
            context.drawCircle(this);
        };
        Circle.prototype.isMet = function (point) {
            return !!(this.point.x - this.radius <= point.x && point.x <= this.point.x + this.radius && this.point.y - this.radius <= point.y && point.y <= this.point.y + this.radius);
        };
        return Circle;
    }());
    emola.Circle = Circle;
    var Line = (function () {
        function Line(from, to, color) {
            if (color === void 0) { color = new Color(); }
            this.from = from;
            this.to = to;
            this.color = color;
        }
        Line.prototype.draw = function (context) {
            context.drawLine(this);
        };
        return Line;
    }());
    emola.Line = Line;
    var CanvasContext = (function () {
        function CanvasContext(context) {
            this.context = context;
            this.width = context.canvas.width;
            this.height = context.canvas.height;
            this.offsetLeft = context.canvas.offsetLeft;
            this.offsetTop = context.canvas.offsetTop;
        }
        CanvasContext.create = function (canvas) {
            if (!canvas || !canvas.getContext) {
                return null;
            }
            return new CanvasContext(canvas.getContext('2d'));
        };
        CanvasContext.prototype.drawCircle = function (circle) {
            this.context.beginPath();
            this.context.fillStyle = 'rgba(' + circle.color.r + ' ,' + circle.color.g + ' ,' + circle.color.b + ' ,' + circle.color.a + ')';
            this.context.arc(circle.point.x, circle.point.y, circle.radius, 0, Math.PI * 2, false);
            this.context.fill();
        };
        CanvasContext.prototype.drawRect = function (rect) {
            this.context.fillStyle = 'rgb(' + rect.color.r + ' ,' + rect.color.g + ' ,' + rect.color.b + ')';
            this.context.fillRect(rect.point.x, rect.point.y, rect.size.width, rect.size.height);
        };
        CanvasContext.prototype.drawLine = function (line) {
            this.context.beginPath();
            this.context.moveTo(line.from.x, line.from.y);
            this.context.lineTo(line.to.x, line.to.y);
            this.context.stroke();
        };
        CanvasContext.prototype.drawText = function (textObject) {
            this.context.fillStyle = 'rgb(' + textObject.color.r + ' ,' + textObject.color.g + ' ,' + textObject.color.b + ')';
            this.context.font = textObject.fontSize + "px " + "\'" + textObject.fontType + "\'";
            this.context.fillText(textObject.description, textObject.point.x, textObject.point.y, 1000);
        };
        CanvasContext.prototype.drawImage = function (path, point) {
            var img = new Image();
            img.src = path;
            this.context.drawImage(img, point.x, point.y);
        };
        CanvasContext.prototype.clear = function () {
            var sizeWidth = this.context.canvas.clientWidth;
            var sizeHeight = this.context.canvas.clientHeight;
            this.context.clearRect(0, 0, sizeWidth, sizeHeight);
        };
        return CanvasContext;
    }());
    emola.CanvasContext = CanvasContext;
    var CanvasLayer = (function () {
        function CanvasLayer() {
            this.drawableList = [];
        }
        CanvasLayer.prototype.draw = function (canvasContext) {
            this.drawableList.forEach(function (e) { return e.draw(canvasContext); });
        };
        CanvasLayer.prototype.add = function (drawable) {
            this.drawableList.push(drawable);
        };
        CanvasLayer.prototype.set = function (drawableList) {
            this.drawableList = drawableList;
        };
        CanvasLayer.prototype.remove = function (drawable) {
            for (var i in this.drawableList) {
                if (this.drawableList[i] === drawable) {
                    this.drawableList.splice(parseInt(i), 1);
                    return null;
                }
            }
        };
        CanvasLayer.prototype.clear = function () {
            this.drawableList = [];
        };
        return CanvasLayer;
    }());
    emola.CanvasLayer = CanvasLayer;
})(emola || (emola = {}));

///<reference path="reader.ts"/>
///<reference path="emola.ts"/>
var emola;
(function (emola) {
    var Socket = (function () {
        function Socket() {
            if (typeof WebSocket !== 'undefined') {
                this.socket = new WebSocket("ws://" + Socket.DEFAULT_HOST + ":" + Socket.DEFAULT_PORT);
                this.socket.onopen = function (event) { return console.log("web socket connection is established."); };
            }
        }
        Socket.prototype.onMessage = function (callback) {
            this.socket.onmessage = callback;
        };
        Socket.prototype.send = function (message) {
            this.socket.send(message);
        };
        Socket.DEFAULT_PORT = 5000;
        Socket.DEFAULT_HOST = "localhost";
        return Socket;
    }());
    emola.Socket = Socket;
})(emola || (emola = {}));

///<reference path="emola.ts"/>
///<reference path="lang.ts"/>
///<reference path="shape.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var emola;
(function (emola) {
    var ExpList = (function () {
        function ExpList(list, parent) {
            if (parent === void 0) { parent = null; }
            this.list = list;
            this.parent = parent;
        }
        ExpList.create = function (syntaxList, parentList) {
            var firstList = syntaxList[0];
            var syntaxMap = {};
            /* lang */
            syntaxMap[emola.AtomType.FN] = GraphFnList;
            syntaxMap[emola.AtomType.IF] = GraphIfList;
            syntaxMap[emola.AtomType.DEF] = GraphDefList;
            syntaxMap[emola.AtomType.DEFN] = GraphDefnList;
            syntaxMap[emola.AtomType.DO] = GraphDoList;
            syntaxMap[emola.AtomType.SEND] = GraphSendList;
            syntaxMap[emola.AtomType.LET] = GraphLetList;
            syntaxMap[emola.AtomType.QUOTE] = GraphQuoteList;
            syntaxMap[emola.AtomType.EVAL] = GraphEvalList;
            /* math */
            syntaxMap[emola.AtomType.PLUS] = GraphPlusList;
            syntaxMap[emola.AtomType.MINUS] = GraphMinusList;
            syntaxMap[emola.AtomType.DIV] = GraphDivList;
            syntaxMap[emola.AtomType.MUL] = GraphMulList;
            syntaxMap[emola.AtomType.EQUAL] = GraphEqualList;
            syntaxMap[emola.AtomType.GREATER] = GraphGreaterList;
            syntaxMap[emola.AtomType.LESS] = GraphLessList;
            syntaxMap[emola.AtomType.GREATEREQUAL] = GraphGreaterEqualList;
            syntaxMap[emola.AtomType.LESSEQUAL] = GraphLessEqualList;
            /* graphic */
            syntaxMap[emola.AtomType.DRAW] = GraphDrawList;
            syntaxMap[emola.AtomType.POINT] = GraphPointList;
            syntaxMap[emola.AtomType.COLOR] = GraphColorList;
            syntaxMap[emola.AtomType.CIRCLE] = GraphCircleList;
            syntaxMap[emola.AtomType.CLEAR] = GraphClearList;
            syntaxMap[emola.AtomType.LINE] = GraphLineList;
            syntaxMap[emola.AtomType.RECT] = GraphRectList;
            syntaxMap[emola.AtomType.SIZE] = GraphSizeList;
            syntaxMap[emola.AtomType.TEXT] = GraphTextList;
            syntaxMap[emola.AtomType.WINDOW] = GraphWindowList;
            var TargetFunction = syntaxMap[firstList.type];
            if (!TargetFunction) {
                TargetFunction = GraphVarList;
            }
            return new TargetFunction(syntaxList, parentList);
        };
        ExpList.prototype.push = function (element) {
            return this.list.push(element);
        };
        ExpList.prototype.remove = function (listObject) {
            for (var index in this.list) {
                if (this.list[index] == listObject) {
                    this.list.splice(index, 1);
                }
                if (this.list[index] instanceof ExpList) {
                    this.list[index].remove(listObject);
                }
            }
        };
        ExpList.prototype.pop = function () {
            return this.list.pop();
        };
        ExpList.prototype.add = function (listObject) {
            this.list.push(listObject);
        };
        return ExpList;
    }());
    emola.ExpList = ExpList;
    var GraphExpList = (function () {
        function GraphExpList(expList, parent) {
            if (parent === void 0) { parent = null; }
            this.expList = expList;
            // グラフィック要素
            this.radius = 50;
            this.theta = 0;
            this.nodeColor = emola.Color.BaseYellow;
            this.leafColor = new emola.Color(102, 102, 102);
            this.listColor = new emola.Color(50, 50, 50, 0.2);
            this.parent = parent;
            if (parent) {
                this.point = null;
            }
            else {
                var x = Math.random() * 600;
                var y = Math.random() * 300;
                this.point = new emola.Point(Math.floor(100 + x), Math.floor(100 + y));
            }
            this.id = new Date().toDateString() + '_' + Math.random();
        }
        GraphExpList.prototype.hasId = function (id) {
            for (var i in this.expList) {
                if (this.expList[i] instanceof GraphExpList && this.expList[i].hasId(id)) {
                    return true;
                }
            }
            if (this.id === id) {
                return true;
            }
            return false;
        };
        GraphExpList.prototype.push = function (element) {
            return this.expList.push(element);
        };
        GraphExpList.prototype.remove = function (listObject) {
            for (var index in this.expList) {
                if (this.expList[index] == listObject) {
                    this.expList.splice(index, 1);
                }
                if (this.expList[index] instanceof GraphExpList) {
                    this.expList[index].remove(listObject);
                }
            }
        };
        GraphExpList.prototype.rotate = function (theta) {
            this.theta += theta;
            for (var i = 0; i < this.expList.length; i++) {
                if (this.expList[i] instanceof GraphExpList) {
                    this.expList[i].rotate(theta);
                }
            }
        };
        GraphExpList.prototype.pop = function () {
            return this.expList.pop();
        };
        GraphExpList.prototype.draw = function (context) {
            for (var i = 1; i < this.expList.length; i++) {
                this.theta += 2 * Math.PI / (this.expList.length - 1);
                var point = new emola.Point(this.point.x + this.radius * Math.cos(this.theta), this.point.y + this.radius * Math.sin(this.theta));
                if (this.expList[i] instanceof GraphExpList) {
                    point = new emola.Point(this.point.x + this.radius * 3 * Math.cos(this.theta), this.point.y + this.radius * 3 * Math.sin(this.theta));
                    this.expList[i].point = point;
                    this.expList[i].draw(context);
                }
                else {
                    var circle = new emola.Circle(point, GraphExpList.LEAF_RADIUS, this.leafColor);
                    circle.draw(context);
                    this.drawText(this.expList[i], context, point, new emola.Color(200, 200, 200));
                }
            }
            (new emola.Circle(this.point, this.radius, this.listColor)).draw(context);
            var nodeCircle = new emola.Circle(this.point, GraphExpList.NODE_RADIUS, this.nodeColor);
            nodeCircle.draw(context);
            this.drawText(this.expList[0], context, this.point, new emola.Color(100, 100, 100));
        };
        GraphExpList.prototype.anim = function () {
            var _this = this;
            var registeredNodeColor = emola.Color.copy(this.nodeColor);
            for (var i = 0; i < this.expList.length; i++) {
                if (this.expList[i] instanceof GraphExpList) {
                    this.expList[i].anim();
                }
                var firstTimerId = window.setInterval(function () {
                    _this.nodeColor = emola.Color.Red;
                    clearInterval(firstTimerId);
                }, 500);
                var secondTimerId = window.setInterval(function () {
                    _this.nodeColor = registeredNodeColor;
                    clearInterval(secondTimerId);
                }, 1000);
                ;
            }
        };
        GraphExpList.prototype.drawText = function (atom, context, point, color) {
            var textString;
            if (atom.value) {
                textString = atom.value;
            }
            else {
                textString = atom.type;
            }
            var text = new emola.Text(textString, point, color);
            text.draw(context);
        };
        GraphExpList.prototype.isMet = function (point) {
            return !!(this.point.x - GraphExpList.NODE_RADIUS <= point.x && point.x <= this.point.x + GraphExpList.NODE_RADIUS &&
                this.point.y - GraphExpList.NODE_RADIUS <= point.y && point.y <= this.point.y + GraphExpList.NODE_RADIUS);
        };
        GraphExpList.prototype.getListObject = function (point) {
            if (this.isMet(point)) {
                return this;
            }
            for (var i in this.expList) {
                var leafListObject = this.expList[i];
                if (leafListObject instanceof GraphExpList && leafListObject.getListObject(point)) {
                    return leafListObject;
                }
            }
            return null;
        };
        GraphExpList.prototype.add = function (listObject) {
            this.expList.push(listObject);
        };
        GraphExpList.NODE_RADIUS = 20;
        GraphExpList.LEAF_RADIUS = 15;
        return GraphExpList;
    }());
    emola.GraphExpList = GraphExpList;
    // lang
    var GraphDefList = (function (_super) {
        __extends(GraphDefList, _super);
        function GraphDefList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(0, 153, 68, 0.3);
        }
        GraphDefList.prototype.evalSyntax = function (env) {
            this.assert();
            var keyName = this.expList[1].value;
            var value = this.expList[2].evalSyntax(env);
            env.update(keyName, value);
            return null;
        };
        GraphDefList.prototype.assert = function () {
            if (this.expList.length !== 3) {
                throw new Error("InvalidArgumentException");
            }
            if (this.expList[1].type !== emola.AtomType.VAR) {
                throw new Error("InvalidAtomTypeTypeException");
            }
        };
        return GraphDefList;
    }(GraphExpList));
    emola.GraphDefList = GraphDefList;
    var GraphDefnList = (function (_super) {
        __extends(GraphDefnList, _super);
        function GraphDefnList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(0, 158, 150, 0.3);
        }
        // (defn hoge (x y) (+ x y))
        GraphDefnList.prototype.evalSyntax = function (env) {
            this.assert();
            var symbol = this.expList[1];
            var args = this.expList[2].expList;
            var expList = this.expList[3];
            env.update(symbol.value, new emola.Fn(args, expList, new emola.Env(env)));
            return null;
        };
        GraphDefnList.prototype.assert = function () {
            if (this.expList.length !== 4) {
                throw new Error("InvalidArgumentException");
            }
        };
        return GraphDefnList;
    }(GraphExpList));
    emola.GraphDefnList = GraphDefnList;
    var GraphLetList = (function (_super) {
        __extends(GraphLetList, _super);
        function GraphLetList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(0, 134, 209, 0.3);
        }
        // (let (x 1) (+ x 1 1))
        GraphLetList.prototype.evalSyntax = function (env) {
            var lets = this.expList[1].expList;
            var expList = this.expList[2];
            var newEnv = new emola.Env(env);
            for (var i = 0; i < lets.length; i = i + 2) {
                newEnv.update(lets[i].value, lets[i + 1].evalSyntax(newEnv));
            }
            return expList.evalSyntax(newEnv);
        };
        return GraphLetList;
    }(GraphExpList));
    emola.GraphLetList = GraphLetList;
    var GraphIfList = (function (_super) {
        __extends(GraphIfList, _super);
        function GraphIfList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(146, 7, 131, 0.3);
        }
        GraphIfList.prototype.evalSyntax = function (env) {
            this.assert();
            var testExp = this.expList[1];
            var thenExp = this.expList[2];
            var elseExp = this.expList[3];
            if (testExp.evalSyntax(env)) {
                return thenExp.evalSyntax(env);
            }
            else {
                return elseExp.evalSyntax(env);
            }
        };
        GraphIfList.prototype.assert = function () {
            if (this.expList.length !== 4) {
                throw new Error("InvalidArgumentException");
            }
        };
        return GraphIfList;
    }(GraphExpList));
    emola.GraphIfList = GraphIfList;
    var GraphDoList = (function (_super) {
        __extends(GraphDoList, _super);
        function GraphDoList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(228, 0, 127, 0.3);
        }
        GraphDoList.prototype.evalSyntax = function (env) {
            var expList = this.expList.slice(1);
            var result = expList.map(function (elem) { return elem.evalSyntax(env); });
            return result[result.length - 1]; // 配列の最後の要素を取り出す
        };
        return GraphDoList;
    }(GraphExpList));
    emola.GraphDoList = GraphDoList;
    var GraphFnList = (function (_super) {
        __extends(GraphFnList, _super);
        function GraphFnList() {
            _super.apply(this, arguments);
        }
        GraphFnList.prototype.evalSyntax = function (env) {
            var args = this.expList[1].expList; // directで見てる
            var expList = this.expList[2];
            return new emola.Fn(args, expList, env);
        };
        return GraphFnList;
    }(GraphExpList));
    emola.GraphFnList = GraphFnList;
    var GraphNestList = (function (_super) {
        __extends(GraphNestList, _super);
        function GraphNestList() {
            _super.apply(this, arguments);
        }
        GraphNestList.prototype.evalSyntax = function (env) {
            var func = this.expList[0].evalSyntax(env);
            var args = this.expList[0].slice(1);
            return func.exec(args, env);
        };
        return GraphNestList;
    }(GraphExpList));
    emola.GraphNestList = GraphNestList;
    var GraphVarList = (function (_super) {
        __extends(GraphVarList, _super);
        function GraphVarList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(229, 0, 106, 0.3);
        }
        GraphVarList.prototype.evalSyntax = function (env) {
            this.assert();
            var func;
            // 一番目の引数が((piyo 1 2) 2)みたいな形式の時
            if (this.expList[0] instanceof GraphVarList) {
                func = this.expList[0].evalSyntax(env);
            }
            else {
                func = env.findEnv(this.expList[0].value).get(this.expList[0].value);
            }
            var realArgsList = this.expList.slice(1);
            if (func.args.length !== realArgsList.length) {
                throw new emola.InvalidArgumentError("Wrong args count");
            }
            for (var i = 0; i < realArgsList.length; i++) {
                func.env.dict[func.args[i].value] = realArgsList[i].evalSyntax(env); //valueをdirectに指定しているけど良くない
            }
            return func.evalSyntax(env);
        };
        GraphVarList.prototype.assert = function () {
        };
        return GraphVarList;
    }(GraphExpList));
    emola.GraphVarList = GraphVarList;
    var GraphQuoteList = (function (_super) {
        __extends(GraphQuoteList, _super);
        function GraphQuoteList(list, parent, point) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(0, 100, 0, 0.2);
        }
        GraphQuoteList.prototype.exec = function () {
            this.assert();
            var list = this.expList[1];
            return list.evalSyntax(this.env);
        };
        GraphQuoteList.prototype.evalSyntax = function (env) {
            this.env = env;
            return this;
        };
        GraphQuoteList.prototype.assert = function () {
            if (this.expList[0].type !== emola.AtomType.QUOTE) {
                throw new Error("InvalidAtomTypeTypeException");
            }
        };
        return GraphQuoteList;
    }(GraphExpList));
    emola.GraphQuoteList = GraphQuoteList;
    var GraphSendList = (function (_super) {
        __extends(GraphSendList, _super);
        function GraphSendList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(230, 0, 51, 0.3);
        }
        GraphSendList.prototype.evalSyntax = function (env) {
            this.assert();
            var object = this.expList[1].evalSyntax(env);
            var methodName = this.expList[2].value;
            var args = this.expList.slice(3).map(function (x) { return x.evalSyntax(env); });
            return object[methodName].apply(object, args);
        };
        GraphSendList.prototype.assert = function () {
        };
        return GraphSendList;
    }(GraphExpList));
    emola.GraphSendList = GraphSendList;
    var GraphEvalList = (function (_super) {
        __extends(GraphEvalList, _super);
        function GraphEvalList() {
            _super.apply(this, arguments);
        }
        GraphEvalList.prototype.evalSyntax = function (env) {
            if (this.expList[1].type === emola.AtomType.VAR) {
                var value = this.expList[1].value;
                var quote = env.findEnv(value).get(value);
                return quote.exec();
            }
            return this.expList[1].exec(env);
        };
        return GraphEvalList;
    }(GraphExpList));
    emola.GraphEvalList = GraphEvalList;
    var GraphWindowList = (function (_super) {
        __extends(GraphWindowList, _super);
        function GraphWindowList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(0, 160, 233, 0.3);
        }
        GraphWindowList.prototype.evalSyntax = function (env) {
            return window;
        };
        return GraphWindowList;
    }(GraphExpList));
    emola.GraphWindowList = GraphWindowList;
    // arithmetic
    var GraphPlusList = (function (_super) {
        __extends(GraphPlusList, _super);
        function GraphPlusList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(230, 0, 18, 0.3);
        }
        GraphPlusList.prototype.evalSyntax = function (env) {
            var sum = 0;
            for (var i = 1; i < this.expList.length; i++) {
                sum += this.expList[i].evalSyntax(env);
            }
            return sum;
        };
        return GraphPlusList;
    }(GraphExpList));
    emola.GraphPlusList = GraphPlusList;
    var GraphMinusList = (function (_super) {
        __extends(GraphMinusList, _super);
        function GraphMinusList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(0, 160, 233, 0.3);
        }
        GraphMinusList.prototype.evalSyntax = function (env) {
            var sum = 0;
            for (var i = 1; i < this.expList.length; i++) {
                if (i === 1) {
                    sum = this.expList[i].evalSyntax(env);
                }
                else {
                    sum -= this.expList[i].evalSyntax(env);
                }
            }
            return sum;
        };
        return GraphMinusList;
    }(GraphExpList));
    emola.GraphMinusList = GraphMinusList;
    var GraphMulList = (function (_super) {
        __extends(GraphMulList, _super);
        function GraphMulList(list, parent, point) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(143, 195, 31, 0.3);
        }
        GraphMulList.prototype.evalSyntax = function (env) {
            var sum = 1;
            for (var i = 1; i < this.expList.length; i++) {
                sum *= this.expList[i].evalSyntax(env);
            }
            return sum;
        };
        return GraphMulList;
    }(GraphExpList));
    emola.GraphMulList = GraphMulList;
    var GraphDivList = (function (_super) {
        __extends(GraphDivList, _super);
        function GraphDivList(list, parent, point) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(96, 25, 134, 0.3);
        }
        GraphDivList.prototype.evalSyntax = function (env) {
            var sum = 1;
            for (var i = 1; i < this.expList.length; i++) {
                if (i === 1) {
                    sum = this.expList[i].evalSyntax(env);
                }
                else {
                    sum /= this.expList[i].evalSyntax(env);
                }
            }
            return sum;
        };
        return GraphDivList;
    }(GraphExpList));
    emola.GraphDivList = GraphDivList;
    // elational operator
    var GraphEqualList = (function (_super) {
        __extends(GraphEqualList, _super);
        function GraphEqualList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = emola.Color.BaseGlay;
        }
        GraphEqualList.prototype.evalSyntax = function (env) {
            return this.expList[1].evalSyntax(env) === this.expList[2].evalSyntax(env);
        };
        return GraphEqualList;
    }(GraphExpList));
    emola.GraphEqualList = GraphEqualList;
    var GraphGreaterList = (function (_super) {
        __extends(GraphGreaterList, _super);
        function GraphGreaterList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(0, 104, 183, 0.3);
        }
        GraphGreaterList.prototype.evalSyntax = function (env) {
            return this.expList[1].evalSyntax(env) > this.expList[2].evalSyntax(env);
        };
        return GraphGreaterList;
    }(GraphExpList));
    emola.GraphGreaterList = GraphGreaterList;
    var GraphGreaterEqualList = (function (_super) {
        __extends(GraphGreaterEqualList, _super);
        function GraphGreaterEqualList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(29, 32, 136, 0.3);
        }
        GraphGreaterEqualList.prototype.evalSyntax = function (env) {
            return this.expList[1].evalSyntax(env) >= this.expList[2].evalSyntax(env);
        };
        return GraphGreaterEqualList;
    }(GraphExpList));
    emola.GraphGreaterEqualList = GraphGreaterEqualList;
    var GraphLessList = (function (_super) {
        __extends(GraphLessList, _super);
        function GraphLessList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(243, 152, 0, 0.3);
        }
        GraphLessList.prototype.evalSyntax = function (env) {
            return this.expList[1].evalSyntax(env) < this.expList[2].evalSyntax(env);
        };
        return GraphLessList;
    }(GraphExpList));
    emola.GraphLessList = GraphLessList;
    var GraphLessEqualList = (function (_super) {
        __extends(GraphLessEqualList, _super);
        function GraphLessEqualList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(255, 251, 0, 0.3);
        }
        GraphLessEqualList.prototype.evalSyntax = function (env) {
            return this.expList[1].evalSyntax(env) <= this.expList[2].evalSyntax(env);
        };
        return GraphLessEqualList;
    }(GraphExpList));
    emola.GraphLessEqualList = GraphLessEqualList;
    // graph
    var GraphDrawList = (function (_super) {
        __extends(GraphDrawList, _super);
        function GraphDrawList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(235, 97, 0, 0.3);
        }
        GraphDrawList.prototype.evalSyntax = function (env, drawingManager) {
            var figure = this.expList[1].evalSyntax(env);
            drawingManager.addDisplayElement(figure);
            return null;
        };
        return GraphDrawList;
    }(GraphExpList));
    emola.GraphDrawList = GraphDrawList;
    var GraphPointList = (function (_super) {
        __extends(GraphPointList, _super);
        function GraphPointList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(146, 7, 131, 0.3);
        }
        GraphPointList.prototype.evalSyntax = function (env) {
            this.assert();
            return new emola.Point(this.expList[1].evalSyntax(env), this.expList[2].evalSyntax(env));
        };
        GraphPointList.prototype.assert = function () {
            if (this.expList[1] === undefined || this.expList[2] === undefined || this.expList.length > 3) {
                throw 'point arguments are illegal.';
            }
        };
        return GraphPointList;
    }(GraphExpList));
    emola.GraphPointList = GraphPointList;
    var GraphCircleList = (function (_super) {
        __extends(GraphCircleList, _super);
        function GraphCircleList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(229, 0, 127, 0.3);
        }
        GraphCircleList.prototype.evalSyntax = function (env) {
            var pointList = this.expList[1];
            var radius = this.expList[2];
            var colorList = this.expList[3];
            return new emola.Circle(pointList.evalSyntax(env), radius.evalSyntax(env), colorList.evalSyntax(env));
        };
        return GraphCircleList;
    }(GraphExpList));
    emola.GraphCircleList = GraphCircleList;
    var GraphLineList = (function (_super) {
        __extends(GraphLineList, _super);
        function GraphLineList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(143, 195, 31, 0.3);
        }
        GraphLineList.prototype.evalSyntax = function (env) {
            var startPointList = this.expList[1];
            var endPointList = this.expList[2];
            return new emola.Line(startPointList.evalSyntax(env), endPointList.evalSyntax(env));
        };
        return GraphLineList;
    }(GraphExpList));
    emola.GraphLineList = GraphLineList;
    var GraphSizeList = (function (_super) {
        __extends(GraphSizeList, _super);
        function GraphSizeList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(255, 251, 0, 0.3);
        }
        GraphSizeList.prototype.evalSyntax = function (env) {
            var width = this.expList[1];
            var height = this.expList[2];
            return new emola.Size(width.evalSyntax(env), height.evalSyntax(env));
        };
        return GraphSizeList;
    }(GraphExpList));
    emola.GraphSizeList = GraphSizeList;
    var GraphRectList = (function (_super) {
        __extends(GraphRectList, _super);
        function GraphRectList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(0, 160, 233, 0.3);
        }
        GraphRectList.prototype.evalSyntax = function (env) {
            var pointList = this.expList[1];
            var sizeList = this.expList[2];
            if (this.expList.length >= 3) {
                var colorList = this.expList[3];
                return new emola.Rect(pointList.evalSyntax(env), sizeList.evalSyntax(env), colorList.evalSyntax(env));
            }
            return new emola.Rect(pointList.evalSyntax(env), sizeList.evalSyntax(env));
        };
        return GraphRectList;
    }(GraphExpList));
    emola.GraphRectList = GraphRectList;
    var GraphClearList = (function (_super) {
        __extends(GraphClearList, _super);
        function GraphClearList() {
            _super.apply(this, arguments);
        }
        GraphClearList.prototype.evalSyntax = function (_, drawingManager) {
            drawingManager.clear();
            return null;
        };
        return GraphClearList;
    }(GraphExpList));
    emola.GraphClearList = GraphClearList;
    var GraphColorList = (function (_super) {
        __extends(GraphColorList, _super);
        function GraphColorList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(235, 97, 0, 0.3);
        }
        GraphColorList.prototype.evalSyntax = function (env) {
            this.assert();
            return new emola.Color(this.expList[1].evalSyntax(env), this.expList[2].evalSyntax(env), this.expList[3].evalSyntax(env));
        };
        GraphColorList.prototype.assert = function () {
            if (this.expList[1] === undefined || this.expList[2] === undefined || this.expList[3] === undefined || this.expList.length > 4) {
                throw new emola.InvalidArgumentError('color arguments are illegal.');
            }
        };
        return GraphColorList;
    }(GraphExpList));
    emola.GraphColorList = GraphColorList;
    var GraphTextList = (function (_super) {
        __extends(GraphTextList, _super);
        function GraphTextList(list, parent) {
            _super.call(this, list, parent);
            this.listColor = new emola.Color(229, 0, 106, 0.3);
        }
        GraphTextList.prototype.evalSyntax = function (env) {
            var str = this.expList[1].evalSyntax(env);
            var point = this.expList[2].evalSyntax(env);
            var color = this.expList[3].evalSyntax(env);
            return new emola.Text(str, point, color);
        };
        return GraphTextList;
    }(GraphExpList));
    emola.GraphTextList = GraphTextList;
})(emola || (emola = {}));

var emola;
(function (emola) {
    var Console = (function () {
        function Console(htmlString, func) {
            this.commandContainer = $(htmlString);
            this.callbackList = func;
        }
        Console.prototype.init = function () {
            $('#emola-console').append(this.commandContainer);
            this.commandContainer.console({
                promptLabel: 'Emola> ',
                commandValidate: function (line) {
                    return line !== "";
                },
                commandHandle: this.callbackList,
                autofocus: true,
                animateScroll: true,
                promptHistory: true,
                charInsertTrigger: function (keycode, line) {
                    return true;
                }
            });
        };
        return Console;
    }());
    emola.Console = Console;
    var Main = (function () {
        function Main() {
        }
        Main.drawLoop = function (drawingManager) {
            setTimeout(Main.drawLoop, 15, drawingManager);
            drawingManager.clearCanvasContext();
            drawingManager.draw();
        };
        Main.getPosition = function (e) {
            var pageX = e.pageX;
            var pageY = e.pageY;
            var rect = e.target.getBoundingClientRect();
            var x = pageX - rect.left;
            var y = pageY - rect.top;
            if (!(rect.height === 500 && rect.width === 870)) {
                return new emola.Point(200, 200);
            }
            return new emola.Point(x, y);
        };
        Main.getDrawingObject = function (drawing, e, drawingManager, tokenReader) {
            var point = Main.getPosition(e);
            var palette = drawingManager.getPalette();
            var widgetComponent = palette.click(point);
            if (widgetComponent) {
                var parsedObject = Main.createParsedObject(widgetComponent.toString(), tokenReader);
                parsedObject.point = emola.Point.copy(point);
                if (parsedObject.draw) {
                    drawingManager.add(parsedObject);
                }
            }
            return drawingManager.getListObject(point, drawing);
        };
        Main.createParsedObject = function (line, tokenReader) {
            tokenReader.add(line);
            return emola.Parser.parse(tokenReader);
        };
        Main.read = function (parsedList, tokenReader, env, drawingDirector) {
            var result;
            try {
                if (parsedList.draw) {
                    drawingDirector.add(parsedList);
                }
                result = parsedList.evalSyntax(env, drawingDirector);
            }
            catch (e) {
                result = e.name + ": " + '"' + e.message + '"';
            }
            return [{ msg: "=> " + result, className: "jquery-console-message-value" }];
        };
        Main.start = function () {
            var druggingObject = null;
            var drugging = false;
            var socket = new emola.Socket();
            var env = new emola.Env(null);
            var drawingDirector;
            var tokenReader = new emola.TokenReader();
            $(document).ready(function () {
                var canvas = document.getElementById('canvas');
                var canvasContext = emola.CanvasContext.create(canvas);
                if (canvasContext !== null) {
                    drawingDirector = new emola.DrawingDirector(canvasContext);
                    Main.drawLoop(drawingDirector);
                }
                var console = new Console('<div class="console">', function (line) {
                    var parsedObject = Main.createParsedObject(line, tokenReader);
                    return Main.read(parsedObject, tokenReader, env, drawingDirector);
                });
                console.init();
                socket.onMessage(function (event) {
                    var json = JSON.parse(event.data);
                    if (!drawingDirector.hasId(json.id)) {
                        var parsedObject = Main.createParsedObject(json.exp, tokenReader);
                        //parsedObject.id = json.id;
                        return Main.read(parsedObject, tokenReader, env, drawingDirector);
                    }
                });
            });
            $(window).mousedown(function (e) {
                drugging = true;
                var drawing = Main.getDrawingObject(null, e, drawingDirector, tokenReader);
                if (drawing) {
                    druggingObject = drawing;
                }
            });
            $(window).mouseup(function (e) {
                drugging = false;
                if (druggingObject) {
                    var drawing = Main.getDrawingObject(druggingObject, e, drawingDirector, tokenReader);
                    if (drawing && druggingObject != drawing) {
                        drawing.add(druggingObject);
                    }
                    druggingObject = null;
                }
            });
            $(window).mousemove(function (e) {
                if (drugging && druggingObject) {
                    druggingObject.point = Main.getPosition(e);
                }
            });
            $(window).dblclick(function (e) {
                var drawing = Main.getDrawingObject(druggingObject, e, drawingDirector, tokenReader);
                if (drawing) {
                    //drawing.anim();
                    var point = emola.Point.copy(drawing.point);
                    point.y += 20;
                    drawingDirector.addDisplayElement(new emola.Text(emola.TreeSerializer.serialize(drawing), point, new emola.Color()));
                    var json = {
                        'id': drawing.id,
                        'exp': emola.TreeSerializer.serialize(drawing)
                    };
                    socket.send(JSON.stringify(json));
                    var result = drawing.evalSyntax(env, drawingDirector);
                    var text = new emola.Text(result, drawing.point, new emola.Color());
                    drawingDirector.addDisplayElement(text);
                }
            });
        };
        return Main;
    }());
    Main.start();
})(emola || (emola = {}));
