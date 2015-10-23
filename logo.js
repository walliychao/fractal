var LOGO = function(opts) {
    var defaults = {
        width: 1000,
        height: 600,
        backgroundColor: '#000',
        color: '#fff',
        step: 100,
        initAx: 1,
        initAy: 0,
        initPx: 300,
        initPy: 500,
        id: 'graph'
    };
    this.opts = {};
    for (key in defaults) {
        this.opts[key] = defaults[key];
    }
    for (key in opts) {
        this.opts[key] = opts[key];
    }
    this.x = this.opts.initPx;
    this.y = this.opts.initPy;
    this.vector = [this.opts.initAx * this.opts.step, this.opts.initAy * this.opts.step];
    this.init.apply(this);
};

LOGO.prototype = {
    constructor: LOGO,
    init: function() {
        var id = this.opts.id;
        var canvas = document.getElementById(id);
        if (!canvas) {
            throw new Error('no canvas found');
        }
        canvas.width = this.opts.width;
        canvas.height = this.opts.height;
        canvas.style.backgroundColor = this.opts.backgroundColor;
        this.ctx = canvas.getContext('2d');
        this.ctx.strokeStyle = this.opts.color;
        this.ctx.moveTo(this.x, this.y);
    },
    forward: function(D) {
        this.x = this.x + this.vector[0] * D;
        this.y = this.y + this.vector[1] * D;
        this.ctx.lineTo(this.x, this.y);
        this.ctx.stroke();
    },
    move: function(D) {
        this.x = this.x + this.vector[0] * D;
        this.y = this.y + this.vector[1] * D;
        this.ctx.moveTo(this.x, this.y);
    },
    turn: function(A) {
        var newV0 = this.vector[0] * Math.cos(-A) - this.vector[1] * Math.sin(-A);
        var newV1 = this.vector[0] * Math.sin(-A) + this.vector[1] * Math.cos(-A);
        this.vector[0] = newV0;
        this.vector[1] = newV1;
    },
    resize: function(S) {
        if (S < 0) {
            this.turn(Math.PI);
            S = -S;
        }
        this.vector[0] *= S;
        this.vector[1] *= S;
    },
    clear: function() {
        this.ctx.clearRect(0, 0, 800, 800);
        this.ctx.closePath();
        this.ctx.beginPath();
    },
    poly: function(N, A) {
        for (var i = 0; i < N; i++) {
            this.forward(1);
            this.turn(A ? A : Math.PI * 2 / N);
        }
    },
    spiral: function(N, A, S) {
        for (var i = 0; i < N; i++) {
            this.forward(1);
            this.turn(A);
            this.resize(S);
        }
    },
    spin: function(N, A, cb) {
        for (var i = 0; i < N; i++) {
            cb();
            this.turn(A);
        }
    },
    scale: function(N, S, cb) {
        for (var i = 0; i < N; i++) {
            cb();
            this.resize(S);
        }
    },
    shift: function(N, D, cb) {
        for (var i = 0; i < N; i++) {
            cb();
            this.move(D);
        }
    },
    // 三角形地垫
    sierpinski: function(level) {
        if (level == 0) {
            this.poly(3, 2 * Math.PI / 3);
        }
        else {
            for (var i = 0; i < 3; i++) {
                this.resize(1/2);
                this.sierpinski(level - 1);
                this.resize(2);
                this.move(1);
                this.turn(2 * Math.PI / 3);
            }
        }
    },
    // 多边形地垫
    polygasket: function(level, N, S) {
        if (level == 0) {
            this.poly(N, 2 * Math.PI / N);
        }
        else {
            for (var i = 0; i < N; i++) {
                this.resize(1/S);
                this.polygasket(level - 1, N, S);
                this.resize(S);
                this.move(1);
                this.turn(2 * Math.PI / N);
            }
        }
    },
    // 分形瑞士国旗
    switzflag: function(level) {
        if (level == 0) {
            this.poly(4, Math.PI / 2);
        }
        else {
            for (var i = 0; i < 4; i++) {
                this.resize(2/5);
                this.switzflag(level - 1);
                this.resize(5/2);
                this.forward(1);
                this.turn(Math.PI / 2);
            }
        }
    },
    // 台阶地垫
    step: function(level) {
        if (level == 0) {
            this.poly(4, Math.PI / 2);
        }
        else {
            this.forward(1);
            this.resize(1/2);
            this.step(level - 1);
            this.resize(2);
            this.turn(Math.PI / 2);
            this.forward(1);
            this.turn(Math.PI / 2);
            this.forward(1);
            this.resize(-1/2);
            this.step(level - 1);
            this.resize(2);
            this.turn(-Math.PI / 2);
            this.forward(1);
            this.turn(Math.PI / 2);
        }
    },
    // koch曲线（三角脉冲）
    koch: function(level) {
        if (level == 0) {
            this.forward(1);
        }
        else {
            this.resize(1/3);
            this.koch(level - 1);
            this.turn(Math.PI / 3);
            this.koch(level - 1);
            this.turn(-2 * Math.PI / 3);
            this.koch(level - 1);
            this.turn(Math.PI / 3);
            this.koch(level -1);
            this.resize(3);
        }
    },
    
    flower: function(name, level) {
        for (var i = 0; i < 5; i++) {
            this[name](level);
            this.turn (2 * Math.PI / 5);
        }
    },
    // 方形脉冲
    rectBump: function(level) {
        if (level == 0) {
            this.forward(1);
        }
        else {
            this.resize(1/3);
            this.rectBump(level - 1);
            this.turn(Math.PI / 2);
            this.rectBump(level - 1);
            this.turn(-Math.PI / 2);
            this.rectBump(level - 1);
            this.turn(-Math.PI / 2);
            this.rectBump(level - 1);
            this.turn(Math.PI / 2);
            this.rectBump(level - 1);
            this.resize(3);
        }
    },
    // C曲线
    triBump: function(level) {
        if (level == 0) {
            this.forward(1);
        }
        else {
            this.resize(1 / Math.sqrt(2));
            this.turn(Math.PI / 4);
            this.triBump(level - 1);
            this.turn(-Math.PI / 2);
            this.triBump(level - 1);
            this.turn(Math.PI / 4);
            this.resize(Math.sqrt(2));
        }
    },
    fireBump: function(level) {
        if (level == 0) {
            this.forward(1);
        }
        else {
            this.resize(1/3);
            this.fireBump(level-1);
            this.turn(Math.PI/6);
            this.resize(Math.sqrt(3));
            this.fireBump(level-1);
            this.turn(-5*Math.PI/6);
            this.resize(1/Math.sqrt(3));
            this.fireBump(level-1);
            this.turn(2*Math.PI/3);
            this.fireBump(level-1);
            this.resize(3);
        }
    },
    fiber: function(level) {
        if (level == 0) {
            this.forward(1);
        }
        else {
            this.resize(1/2);
            this.fiber(level-1);
            this.fiber(level-1);
            this.turn(Math.PI/2);
            this.forward(1);
            this.fiber(level-1);
            this.resize(2);
            this.move(-1);
            this.turn(-Math.PI/2);
        }
    },
    tree: function(level) {
        if (level == 0) {
            this.forward(1);
        }
        else {
            this.forward(1);
            this.turn(Math.PI/6);
            this.resize(3/4);
            this.tree(level-1);
            this.move(-1);
            this.turn(-Math.PI/3);
            this.tree(level-1);
            this.move(-1);
            this.resize(4/3);
            this.turn(Math.PI/6);
        }
    },
    shrub: function(level) {
        if (level == 0) {
            this.forward(1);
        }
        else {
            this.resize(1/2);
            this.shrub(level-1);
            this.turn(Math.PI/4);
            this.shrub(level-1);
            this.move(-1);
            this.turn(-Math.PI/2);
            this.shrub(level-1);
            this.move(-1);
            this.turn(Math.PI/4);
            this.shrub(level-1);
            this.resize(2);
        }
    }
};
