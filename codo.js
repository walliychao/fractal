var Affine = function(x, y, isVec) {
    if (x) {
        this.x = x;
    }
    else {
        this.x = 0;
    }
    if (y) {
        this.y = y;
    }
    else {
        this.y = 0;
    }
    if (isVec) {
        this.z = 0;
    }
    else {
        this.z = 1;
    }
};
Affine.prototype = {
    constructor: Affine,
    isVector: function() {
        if (typeof this.x === 'number' && typeof this.y === 'number' && this.z === 0) {
            return true;
        }
        else return false;
    },
    isPoint: function() {
        if (typeof this.x === 'number' && typeof this.y === 'number' && this.z === 1) {
            return true;
        }
        else return false;
    },
    vector: function(P, Q) {
        if (P.isPoint() && Q.isPoint()) {
            return new Affine(Q.x - P.x, Q.y - P.y, true);
        }
        else return;
    },
    transform: function(points, M) {
        if (!points.length) {
            M = points;
            return new Affine(
                this.x * M[0][0] + this.y * M[0][1] + this.z * M[0][2],
                this.x * M[1][0] + this.y * M[1][1] + this.z * M[1][2],
                this.z === 0 ? true : false 
            );
        }
        else if (M && M.isMutation()) {
            var pointsNew = [];
            for (var i = 0, l = points.length; i < l; i++) {
                pointsNew.push(new Affine(
                    points[i].x * M[0][0] + points[i].y * M[0][1] + points[i].z * M[0][2],
                    points[i].x * M[1][0] + points[i].y * M[1][1] + points[i].z * M[1][2],
                    points[i].z === 0 ? true : false 
                ));
            }
            return pointsNew;
        }
        return;
    }
};
var Mutation = function(array1, array2, array3) {
    var temp1 = [0, 0, 0];
    var temp2 = [0, 0, 0];
    var temp3 = [0, 0, 0];
    if (array1 && array1.length === 3) {
        temp1[0] = array1[0];
        temp1[1] = array1[1];
        temp1[2] = array1[2];
    }
    if (array2 && array2.length === 3) {
        temp2[0] = array2[0];
        temp2[1] = array2[1];
        temp2[2] = array2[2];
    }
    if (array3 && array3.length === 3) {
        temp3[0] = array3[0];
        temp3[1] = array3[1];
        temp3[2] = array3[2];
    }
    this[0] = temp1;
    this[1] = temp2;
    this[2] = temp3;
    return this;
};
Mutation.prototype = {
    isMutation: function() {
        if (this[0] && this[0].length === 3
            && this[1] && this[1].length === 3
            && this[2] && this[2].length === 3) {
            return true;
        }
        else return false;
    },
    // 平移
    trans: function(V) {
        if (V && V.isVector()) {
            return new Mutation([1, 0, V.x], [0, 1, V.y], [0, 0, 1]);
        }
        return;
    },
    // 旋转
    rot: function(theta, Q) {
        if (!Q) {
            Q = new Affine(0, 0);
        }
        if (Q && Q.isPoint()) {
            var array1 = [Math.cos(-theta), -Math.sin(-theta), Q.x * (1 - Math.cos(-theta)) + Q.y * Math.sin(-theta)];
            var array2 = [Math.sin(-theta), Math.cos(-theta), Q.y * (1 - Math.cos(-theta)) - Q.x * Math.sin(-theta)];
            var array3 = [0, 0, 1];
            return new Mutation(array1, array2, array3);
        }
        return;
    },
    // 放缩
    scale: function(s, Q, V) {
        if (!Q) {
            Q = new Affine(0, 0);
        }
        // 均匀放缩
        if (Q && Q.isPoint() && !V) {
            var array1 = [s, 0, Q.x * (1 - s)];
            var array2 = [0, s, Q.y * (1 - s)];
            var array3 = [0, 0, 1];
            return new Mutation(array1, array2, array3);
        }
        // 非均匀放缩
        if (Q && Q.isPoint() && V && V.isVector()) {
            var M1 = new Mutation([V.x, -V.y, Q.x], [V.y, V.x, Q.y], [0, 0, 1]);
            var M2 = new Mutation([s * V.x, -V.y, Q.x], [s * V.y, V.x, Q.y], [0, 0, 1]);
            return this.compose(this.invert(M1), M2);
        }
        return;
    },
    image: function(P1, P2, P3, Q1, Q2, Q3) {
        if (P1 && P1.isPoint() && P2 && P2.isPoint() && P3 && P3.isPoint()
            && Q1 && Q1.isPoint() && Q2 && Q2.isPoint() && Q3 && Q3.isPoint()) {
            var M1 = new Mutation([P1.x, P2.x, P3.x], [P1.y, P2.y, P3.y], [1, 1, 1]);
            var M2 = new Mutation([Q1.x, Q2.x, Q3.x], [Q1.y, Q2.y, Q3.y], [1, 1, 1]);
            return this.compose(this.invert(M1), M2);
        }
        return;
    },
    invert: function(M) {
        if (!M.isMutation()) {
             M = new Mutation(this[0], this[1], this[2]);
        }
        else if (M[2][0] === 0 && M[2][1] === 0 && M[2][2] === 1) {
            var temp = M[0][0] * M[1][1] - M[1][0] * M[0][1];

            var array1 = [M[1][1] / temp, -M[0][1] / temp,
                (M[0][1] * M[1][2] - M[1][1] * M[0][2]) / temp];

            var array2 = [-M[1][0] / temp, M[0][0] / temp,
                (M[1][0] * M[0][2] - M[0][0] * M[1][2]) / temp];

            var array3 = [0, 0, 1];
            return new Mutation(array1, array2, array3);
        }
        else if (M[2][0] === 1 && M[2][1] === 1 && M[2][2] === 1) {
            var temp = M[0][0] * (M[1][1] - M[1][2])
             + M[0][1] * (M[1][2] - M[1][0])
             + M[0][2] * (M[1][0] - M[1][1]);

            var array1 = [(M[1][1] - M[1][2]) / temp, (M[0][2] - M[0][1]) / temp,
                (M[0][1] * M[1][2] - M[1][1] * M[0][2]) / temp];

            var array2 = [(M[1][2] - M[1][0]) / temp, (M[0][0] - M[0][2]) / temp,
                (M[1][0] * M[0][2] - M[0][0] * M[1][2]) / temp];

            var array3 = [(M[1][0] - M[1][1]) / temp, (M[0][1] - M[0][0]) / temp,
                (M[0][0] * M[1][1] - M[1][0] * M[0][1]) / temp];
            return new Mutation(array1, array2, array3);
        }
    },
    compose: function(M1, M2) {
        if (!M2) {
            M2 = new Mutation(M1[0], M1[1], M1[2]);
            M1 = new Mutation(this[0], this[1], this[2]);
        }
        if (M1 && M1.isMutation() && M2 && M2.isMutation()) {
            var array1 = [
                M1[0][0] * M2[0][0] + M1[1][0] * M2[0][1] + M1[2][0] * M2[0][2],
                M1[0][1] * M2[0][0] + M1[1][1] * M2[0][1] + M1[2][1] * M2[0][2],
                M1[0][2] * M2[0][0] + M1[1][2] * M2[0][1] + M1[2][2] * M2[0][2]
            ];
            var array2 = [
                M1[0][0] * M2[1][0] + M1[1][0] * M2[1][1] + M1[2][0] * M2[1][2],
                M1[0][1] * M2[1][0] + M1[1][1] * M2[1][1] + M1[2][1] * M2[1][2],
                M1[0][2] * M2[1][0] + M1[1][2] * M2[1][1] + M1[2][2] * M2[1][2]
            ];
            var array3 = [
                M1[0][0] * M2[2][0] + M1[1][0] * M2[2][1] + M1[2][0] * M2[2][2],
                M1[0][1] * M2[2][0] + M1[1][1] * M2[2][1] + M1[2][1] * M2[2][2],
                M1[0][2] * M2[2][0] + M1[1][2] * M2[2][1] + M1[2][2] * M2[2][2]
            ];
            return new Mutation(array1, array2, array3);
        }
        return;
    },
    multi: function(s, M) {
        if (!M) {
            M = new Mutation(this[0], this[1], this[2]);
        }
        if (M && M.isMutation()) {
            var array1 = [s * M[0][0], s * M[0][1], s * M[0][2]];
            var array2 = [s * M[1][0], s * M[1][1], s * M[1][2]];
            var array3 = [s * M[2][0], s * M[2][1], s * M[2][2]];
            return new Mutation(array1, array2, array3);
        }
        return;
    },
    add: function(M1, M2) {
        if (!M2) {
            M2 = new Mutation(M1[0], M1[1], M2[2]);
            M1 = new Mutation(this[0], this[1], this[2]);
        }
        if (M1 && M1.isMutation() && M2 && M2.isMutation()) {
            var array1 = [
                M1[0][0] + M2[0][0],
                M1[0][1] + M2[0][1],
                M1[0][2] + M2[0][2]
            ];
            var array2 = [
                M1[1][0] + M2[1][0],
                M1[1][1] + M2[1][1],
                M1[1][2] + M2[1][2]
            ];
            var array3 = [
                M1[2][0] + M2[2][0],
                M1[2][1] + M2[2][1],
                M1[2][2] + M2[2][2]
            ];
            return new Mutation(array1, array2, array3);
        }
        return;
    } 
};
var CODO = function(opts) {
    var defaults = {
        width: 1000,
        height: 600,
        backgroundColor: '#000',
        color: '#fff',
        step: 100,
        centrX: 300,
        centrY: 300,
        id: 'graph'
    };
    this.opts = {};
    for (key in defaults) {
        this.opts[key] = defaults[key];
    }
    for (key in opts) {
        this.opts[key] = opts[key];
    }
    this.centrQ = new Affine(this.opts.centrX, this.opts.centrY);
    this.initP = new Affine(this.opts.centrX + this.opts.step, this.opts.centrY);
    this.initV = new Affine(this.opts.step, 0, true);
    this.Mutation = new Mutation();
    this.init.apply(this);
};
CODO.prototype = {
    constructor: CODO,
    init: function() {
        var id = this.opts.id;
        var canvas = document.getElementById(id);
        if (!canvas) {
            throw new Error('no canvas found');
        }
        canvas.width = this.opts.width;
        canvas.height = this.opts.height;
        canvas.style.backgroundColor = this.opts.backgroundColor;
        var top = canvas.offsetLeft;
        var left = canvas.offsetTop;
        var me = this;
        canvas.addEventListener('click', function(e) {
            console.log(e.clientX - top, e.clientY - left);
            me.ctx.rect(e.clientX - top, e.clientY - left, 3, 3);
            me.ctx.fill();
        });
        this.ctx = canvas.getContext('2d');
        this.ctx.strokeStyle = this.opts.color;
        this.ctx.fillStyle = this.opts.color;
    },
    line: function(points) {
        if (points && points.length === 2) {
            this.ctx.moveTo(points[0].x, points[0].y);
            this.ctx.lineTo(points[1].x, points[1].y);
            this.ctx.stroke();
        }
    },
    path: function(points) {
        if (!points.length) {
            return;
        }
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (var i = 1, l = points.length; i < l & l > 1; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.lineTo(points[0].x, points[0].y);
        this.ctx.stroke();
        this.ctx.closePath();
    },
    polyVerts: function(N, P, Q) {
        if (!P) {
            P = this.initP;
        }
        if (!Q) {
            Q = this.centrQ;
        }
        var points = [];
        var theta = 2 * Math.PI / N;
        var M = this.Mutation;
        for (var i = 0; i < N; i++) {
            M = M.rot(i * theta, Q);
            points.push(P.transform(M));
        }
        this.path(points);
        return points;
    },
    ellipsis: function(N, s, P, Q) {
        if (!P) {
            P = this.initP;
        }
        if (!Q) {
            Q = this.centrQ;
        }
        var V = this.initV; 
        var points = [];
        var theta = 2 * Math.PI / N;
        var M = this.Mutation, P0;
        s = +s;
        for (var i = 0; i < N; i++) {
            M = M.rot(i * theta, Q);
            P0 = P.transform(M);
            M = M.scale(s, Q, V);
            points.push(P0.transform(M));

        }
        this.path(points);
        return points;
    },
    random: function(N, s, P, Q) {
        if (!P) {
            P = this.initP;
        }
        if (!Q) {
            Q = this.centrQ;
        }
        var V = this.initV; 
        var points = [];
        var theta = 2 * Math.PI / N;
        var M = this.Mutation, P0;
        s = +s;
        for (var i = 0; i < N; i++) {
            M = M.rot(i * theta, Q);
            P0 = P.transform(M);
            M = M.scale(1 + (Math.random() - 0.5) * s, Q);
            points.push(P0.transform(M));

        }
        this.path(points);
        return points;
    },
    sierpinski: function(n) {
        // get init {P0}
        var points = [new Affine(100, 500), new Affine(500, 500), new Affine(300, 500 - 200 * Math.pow(3, 0.5)), new Affine(100, 500)];
        // get Ms
        var M = this.Mutation;
        var P = this.initP;
        var M0 = M.scale(0.5, points[0]);
        var M1 = M.scale(0.5, points[1]);
        var M2 = M.scale(0.5, points[2]);
        var pSet = [points];
        var pointsNew = [];
        var index = 0;
        for (var i = 0; i < n; i++) {
            for (var j = 0, l = Math.pow(3, i); j < l; j++) {
                pSet.push(P.transform(pSet[index + j], M0));
                pSet.push(P.transform(pSet[index + j], M1));
                pSet.push(P.transform(pSet[index + j], M2));
            }
            pSet.splice(0, l);
        }
        for (var i = 0, l = pSet.length; i < l; i++) {
            this.ctx.moveTo(pSet[i][0].x, pSet[i][0].y);
            for (k = 1; k < pSet[i].length; k++) {
                this.ctx.lineTo(pSet[i][k].x, pSet[i][k].y);
            }
        }
        this.ctx.stroke();
    },
    fiber: function(n) {
        // get init {P0}
        var points = [new Affine(100, 500), new Affine(500, 500), new Affine(500, 100)];
        // get Ms
        var M = this.Mutation;
        var P = this.initP;
        var M0 = M.scale(0.5, points[0]);
        var M1 = M.scale(0.5, points[1]);
        var M2 = M.image(new Affine(100, 500), new Affine(500, 500), new Affine(500, 100), new Affine(500, 300), new Affine(500, 100), new Affine(300, 100));
        var pSet = [points];
        var pointsNew = [];
        var index = 0;
        for (var i = 0; i < n; i++) {
            for (var j = 0, l = Math.pow(3, i); j < l; j++) {
                pSet.push(P.transform(pSet[index + j], M0));
                pSet.push(P.transform(pSet[index + j], M1));
                pSet.push(P.transform(pSet[index + j], M2));
            }
            pSet.splice(0, l);
        }
        for (var i = 0, l = pSet.length; i < l; i++) {
            this.ctx.moveTo(pSet[i][0].x, pSet[i][0].y);
            for (k = 1; k < pSet[i].length; k++) {
                this.ctx.lineTo(pSet[i][k].x, pSet[i][k].y);
            }
        }
        this.ctx.stroke();
    },
    animateSiFi: function(n) {
        // get init {P0}
        var points = [new Affine(100, 500), new Affine(500, 500), new Affine(300, 500 - 200 * Math.pow(3, 0.5)), new Affine(100, 500)];
        var M = this.Mutation;
        var P = this.initP;
        var MSi = [], MFi = [];
        MSi[0] = M.scale(0.5, points[0]);
        MSi[1] = M.scale(0.5, points[1]);
        MSi[2] = M.scale(0.5, points[2]);

        MFi[0] = M.scale(0.5, points[0]);
        MFi[1] = M.scale(0.5, points[1]);
        MFi[2] = M.image(new Affine(100, 500), new Affine(500, 500), new Affine(500, 100), new Affine(500, 300), new Affine(500, 100), new Affine(300, 100));

        var x = 0;
        var that = this;
        var timer = setInterval(function() {
            var M0 = M.add(M.multi(1 - x, MSi[0]), M.multi(x, MFi[0]));
            var M1 = M.add(M.multi(1 - x, MSi[1]), M.multi(x, MFi[1]));
            var M2 = M.add(M.multi(1 - x, MSi[2]), M.multi(x, MFi[2]));
            that.ctx.clearRect(0, 0, 800, 800);

            var pSet = [points];
            var pointsNew = [];
            var index = 0;
            for (var i = 0; i < n; i++) {
                for (var j = 0, l = Math.pow(3, i); j < l; j++) {
                    pSet.push(P.transform(pSet[index + j], M0));
                    pSet.push(P.transform(pSet[index + j], M1));
                    pSet.push(P.transform(pSet[index + j], M2));
                }
                pSet.splice(0, l);
            }
             that.ctx.beginPath();
            for (var i = 0, l = pSet.length; i < l; i++) {
                that.ctx.moveTo(pSet[i][0].x, pSet[i][0].y);
                for (k = 1; k < pSet[i].length; k++) {
                    that.ctx.lineTo(pSet[i][k].x, pSet[i][k].y);
                }
            }
            that.ctx.stroke();
             that.ctx.closePath();
            x += 0.1;
            if (x >= 1) {
                clearInterval(timer);
            }
        }, 700);
    },
    step: function(n) {
        // get init {P0}
        var points = [new Affine(200, 300), new Affine(300, 300), new Affine(300, 200), new Affine(200, 200), new Affine(200, 300)];
        // get Ms
        var M = this.Mutation;
        var P = this.initP;
        var M0 = M.image(new Affine(200, 300), new Affine(300, 300), new Affine(200, 200), new Affine(200, 200), new Affine(250, 200), new Affine(200, 150));
        var M1 = M.image(new Affine(200, 300), new Affine(300, 300), new Affine(200, 200), new Affine(300, 300), new Affine(350, 300), new Affine(300, 250));
        var pSet = [points];
        var pointsNew = [];
        var index = 0;
        for (var i = 0; i < n; i++) {
            for (var j = 0, l = Math.pow(2, i); j < l; j++) {
                pSet.push(P.transform(pSet[index + j], M0));
                pSet.push(P.transform(pSet[index + j], M1));
            }
            index += l;
        }
        for (var i = 0, l = pSet.length; i < l; i++) {
            this.ctx.moveTo(pSet[i][0].x, pSet[i][0].y);
            for (k = 1; k < pSet[i].length; k++) {
                this.ctx.lineTo(pSet[i][k].x, pSet[i][k].y);
            }
        }
        this.ctx.stroke();
    },
    tree: function(n) {
        // get init {P0}
        var points = [new Affine(300, 500), new Affine(300, 400)];
        // get Ms
        var M = this.Mutation;
        var P = this.initP;
        points.push(points[1].transform(M.scale(0.75, points[0]).compose(M.rot(Math.PI/6, points[0])).compose(M.trans(new Affine(0, -100, true)))));
        points.push(points[1].transform(M.scale(0.75, points[0]).compose(M.rot(-Math.PI/6, points[0])).compose(M.trans(new Affine(0, -100, true)))));
        
        var M0 = M.scale(0.75, new Affine(300, 500)).compose(M.rot(Math.PI/6, new Affine(300, 500))).compose(M.trans(new Affine(0, -100, true)));
        var M1 = M.scale(0.75, new Affine(300, 500)).compose(M.rot(-Math.PI/6, new Affine(300, 500))).compose(M.trans(new Affine(0, -100, true)));
        var pSet = [points];
        var pointsNew = [];
        var index = 0;
        for (var i = 0; i < n; i++) {
            for (var j = 0, l = Math.pow(2, i); j < l; j++) {
                pSet.push(P.transform(pSet[index + j], M0));
                pSet.push(P.transform(pSet[index + j], M1));
            }
            index += l;
        }
        for (var i = 0, l = pSet.length; i < l; i++) {
            this.ctx.moveTo(pSet[i][0].x, pSet[i][0].y);
            this.ctx.lineTo(pSet[i][1].x, pSet[i][1].y);
            this.ctx.lineTo(pSet[i][2].x, pSet[i][2].y);
            this.ctx.moveTo(pSet[i][1].x, pSet[i][1].y);
            this.ctx.lineTo(pSet[i][3].x, pSet[i][3].y);
        }
        this.ctx.stroke();
    },
    tri: function(n) {
        // get init {P0}
        var points = [new Affine(200, 300), new Affine(300, 300), new Affine(300, 200)];
        // get Ms
        var M = this.Mutation;
        var P = this.initP;
        var M0 = M.image(new Affine(200, 300), new Affine(300, 300), new Affine(300, 200), new Affine(200, 300), new Affine(250, 350), new Affine(300, 300));
        var M1 = M.image(new Affine(200, 300), new Affine(300, 300), new Affine(300, 200), new Affine(300, 300), new Affine(350, 250), new Affine(300, 200));
        var pSet = [points];
        var pointsNew = [];
        var index = 0;
        for (var i = 0; i < n; i++) {
            for (var j = 0, l = Math.pow(2, i); j < l; j++) {
                pSet.push(P.transform(pSet[index + j], M0));
                pSet.push(P.transform(pSet[index + j], M1));
            }
            index += l;
        }
        for (var i = 0, l = pSet.length; i < l; i++) {
            this.ctx.moveTo(pSet[i][0].x, pSet[i][0].y);
            this.ctx.lineTo(pSet[i][1].x, pSet[i][1].y);
            this.ctx.lineTo(pSet[i][2].x, pSet[i][2].y);
        }
        this.ctx.stroke();
    },
    animateSeTr: function(n) {
        // get init {P0}
        var points = [new Affine(200, 400), new Affine(300, 400), new Affine(300, 300), new Affine(200, 300), new Affine(200, 400)];
        var M = this.Mutation;
        var P = this.initP;
        var MSe = [], MTr = [];
        MSe[0] = M.image(new Affine(200, 400), new Affine(300, 400), new Affine(200, 300), new Affine(200, 300), new Affine(250, 300), new Affine(200, 250));
        MSe[1] = M.image(new Affine(200, 400), new Affine(300, 400), new Affine(200, 300), new Affine(300, 400), new Affine(350, 400), new Affine(300, 350));

        //MTr[0] = M.image(new Affine(200, 300), new Affine(300, 300), new Affine(300, 200), new Affine(200, 300), new Affine(250, 350), new Affine(300, 300));
        //MTr[1] = M.image(new Affine(200, 300), new Affine(300, 300), new Affine(300, 200), new Affine(300, 300), new Affine(350, 250), new Affine(300, 200));

        MTr[0] = M.scale(0.75, new Affine(250, 400)).compose(M.rot(Math.PI/6, new Affine(250, 400))).compose(M.trans(new Affine(0, -100, true)));
        MTr[1] = M.scale(0.75, new Affine(250, 400)).compose(M.rot(-Math.PI/6, new Affine(250, 400))).compose(M.trans(new Affine(0, -100, true)));

        var x = 0;
        var that = this;
        var timer = setInterval(function() {
            var M0 = M.add(M.multi(1 - x, MSe[0]), M.multi(x, MTr[0]));
            var M1 = M.add(M.multi(1 - x, MSe[1]), M.multi(x, MTr[1]));
            that.ctx.clearRect(0, 0, 800, 800);

            var pSet = [points];
            var pointsNew = [];
            var index = 0;
            for (var i = 0; i < n; i++) {
                for (var j = 0, l = Math.pow(2, i); j < l; j++) {
                    pSet.push(P.transform(pSet[index + j], M0));
                    pSet.push(P.transform(pSet[index + j], M1));
                }
                index += l;
            }
             that.ctx.beginPath();
            for (var i = 0, l = pSet.length; i < l; i++) {
                that.ctx.moveTo(pSet[i][0].x, pSet[i][0].y);
                for (k = 1; k < pSet[i].length; k++) {
                    that.ctx.lineTo(pSet[i][k].x, pSet[i][k].y);
                }
            }
            that.ctx.stroke();
             that.ctx.closePath();
            x += 0.1;
            if (x >= 1) {
                clearInterval(timer);
            }
        }, 700);
    },
    koch: function(n) {
        // get init {P0}
        var points = [new Affine(300, 500), new Affine(300, 400), new Affine(300, 300), new Affine(300, 200)];
        
        // get Ms
        var M = this.Mutation;
        var P = this.initP;
        points.splice(2, 0, points[2].transform(M.rot(Math.PI/3, points[1])));
        var M0 = M.scale(1/3, new Affine(300, 500));
        var M1 = M.scale(1/3, new Affine(300, 500)).compose(M.trans(new Affine(0, -100, true))).compose(M.rot(Math.PI/3, new Affine(300, 400)));
        var M2 = M.scale(1/3, new Affine(300, 200)).compose(M.trans(new Affine(0, 100, true))).compose(M.rot(-Math.PI/3, new Affine(300, 300)));
        var M3 = M.scale(1/3, new Affine(300, 200));
        var pSet = [points];
        var pointsNew = [];
        for (var i = 0; i < n; i++) {
            for (var j = 0, l = Math.pow(4, i); j < l; j++) {
                pSet.push(P.transform(pSet[j], M0));
                pSet.push(P.transform(pSet[j], M1));
                pSet.push(P.transform(pSet[j], M2));
                pSet.push(P.transform(pSet[j], M3));
            }
            pSet.splice(0, l);
        }
        for (var i = 0, l = pSet.length; i < l; i++) {
            this.ctx.moveTo(pSet[i][0].x, pSet[i][0].y);
            this.ctx.lineTo(pSet[i][1].x, pSet[i][1].y);
            this.ctx.lineTo(pSet[i][2].x, pSet[i][2].y);
            this.ctx.lineTo(pSet[i][3].x, pSet[i][3].y);
            this.ctx.lineTo(pSet[i][4].x, pSet[i][4].y);
        }
        this.ctx.stroke();
    },
    shrub: function(n) {
        // get init {P0}
        var points = [new Affine(300, 500), new Affine(300, 350), new Affine(300, 200)];    
        // get Ms
        var M = this.Mutation;
        var P = this.initP;

        points.splice(2, 0, points[2].transform(M.rot(Math.PI/4, points[1])));
        points.push(points[3].transform(M.rot(-Math.PI/4, points[1])));
        var M0 = M.scale(0.5, new Affine(300, 500));
        var M1 = M.scale(0.5, new Affine(300, 500)).compose(M.trans(new Affine(0, -150, true))).compose(M.rot(Math.PI/4, new Affine(300, 350)));
        var M2 = M.scale(0.5, new Affine(300, 500)).compose(M.trans(new Affine(0, -150, true)));
        var M3 = M.scale(0.5, new Affine(300, 500)).compose(M.trans(new Affine(0, -150, true))).compose(M.rot(-Math.PI/4, new Affine(300, 350)));
        var pSet = [points];
        var pointsNew = [];
        for (var i = 0; i < n; i++) {
            for (var j = 0, l = Math.pow(4, i); j < l; j++) {
                pSet.push(P.transform(pSet[j], M0));
                pSet.push(P.transform(pSet[j], M1));
                pSet.push(P.transform(pSet[j], M2));
                pSet.push(P.transform(pSet[j], M3));
            }
            pSet.splice(0, l);
        }
        for (var i = 0, l = pSet.length; i < l; i++) {
            this.ctx.moveTo(pSet[i][0].x, pSet[i][0].y);
            this.ctx.lineTo(pSet[i][1].x, pSet[i][1].y);
            this.ctx.lineTo(pSet[i][2].x, pSet[i][2].y);
            this.ctx.lineTo(pSet[i][3].x, pSet[i][3].y);
            this.ctx.lineTo(pSet[i][4].x, pSet[i][4].y);
        }
        this.ctx.stroke();
    },
    animateKoSh: function(n) {
        // get init {P0}
        var points = [new Affine(300, 500), new Affine(300, 400), new Affine(300, 300), new Affine(300, 200)];
        var M = this.Mutation;
        var P = this.initP;
        points.splice(2, 0, points[2].transform(M.rot(Math.PI/3, points[1])));

        var MKo = [], MSh = [];
        MKo[0] = M.scale(1/3, new Affine(300, 500));
        MKo[1] = M.scale(1/3, new Affine(300, 500)).compose(M.trans(new Affine(0, -100, true))).compose(M.rot(Math.PI/3, new Affine(300, 400)));
        MKo[2] = M.scale(1/3, new Affine(300, 200)).compose(M.trans(new Affine(0, 100, true))).compose(M.rot(-Math.PI/3, new Affine(300, 300)));
        MKo[3] = M.scale(1/3, new Affine(300, 200));

        MSh[0] = M.scale(0.5, new Affine(300, 500));
        MSh[1] = M.scale(0.5, new Affine(300, 500)).compose(M.trans(new Affine(0, -150, true))).compose(M.rot(Math.PI/4, new Affine(300, 350)));
        MSh[2] = M.scale(0.5, new Affine(300, 500)).compose(M.trans(new Affine(0, -150, true)));
        MSh[3] = M.scale(0.5, new Affine(300, 500)).compose(M.trans(new Affine(0, -150, true))).compose(M.rot(-Math.PI/4, new Affine(300, 350)));

        var x = 0;
        var that = this;
        var timer = setInterval(function() {
            var M0 = M.add(M.multi(1 - x, MKo[0]), M.multi(x, MSh[0]));
            var M1 = M.add(M.multi(1 - x, MKo[1]), M.multi(x, MSh[1]));
            var M2 = M.add(M.multi(1 - x, MKo[2]), M.multi(x, MSh[2]));
            var M3 = M.add(M.multi(1 - x, MKo[3]), M.multi(x, MSh[3]));
            that.ctx.clearRect(0, 0, 800, 800);

            var pSet = [points];
            var pointsNew = [];
            for (var i = 0; i < n; i++) {
                for (var j = 0, l = Math.pow(2, i); j < l; j++) {
                    pSet.push(P.transform(pSet[j], M0));
                    pSet.push(P.transform(pSet[j], M1));
                    pSet.push(P.transform(pSet[j], M2));
                    pSet.push(P.transform(pSet[j], M3));
                }
                pSet.splice(0, l);
            }
             that.ctx.beginPath();
            for (var i = 0, l = pSet.length; i < l; i++) {
                that.ctx.moveTo(pSet[i][0].x, pSet[i][0].y);
                for (k = 1; k < pSet[i].length; k++) {
                    that.ctx.lineTo(pSet[i][k].x, pSet[i][k].y);
                }
            }
            that.ctx.stroke();
             that.ctx.closePath();
            x += 0.1;
            if (x >= 1) {
                clearInterval(timer);
            }
        }, 700);
    },
    fern: function(n) {
        P0 = new Affine(0, 0);
        MSet = [];
        MSet.push(new Mutation(
            [0, 0, 0], [0, 0.16, 0], [0, 0, 1]
        ));
        MSet.push(new Mutation(
            [0.2, -0.26, 0], [0.23, 0.22, 1.6], [0, 0, 1]
        ));
        MSet.push(new Mutation(
            [-0.15, 0.28, 0], [0.26, 0.24, 0.44], [0, 0, 1]
        ));
        MSet.push(new Mutation(
            [0.85, 0.04, 0], [-0.04, 0.85, 1.6], [0, 0, 1]
        ));
        var p1 = 0.01, p2 = 0.07, p3 = 0.07, p4 = 0.85;
        var r, Pn, M;
        var result = [[P0.x, P0.y]];
        for (var i = 0; i < n; i++) {
            r = Math.random();
            if (r < p1) {
                M = MSet[0];
            }
            else if (r < p1 + p2) {
                M = MSet[1];
            }
            else if (r < p1 + p2 + p3) {
                M = MSet[2];
            }
            else {
                M = MSet[3];
            }
            Pn = P0.transform(M);
            result.push([Pn.x, Pn.y]);
            P0 = Pn;
        }
        for (var i = 0, l = result.length; i < l; i++) {
            this.ctx.rect((result[i][0] * 40) + 500, 500 - (result[i][1] * 40), 1, 1);
        }
        this.ctx.fill();
    },
    helix: function(p, n) {
        var M = this.Mutation;
        var M1 = M.image(new Affine(376, 412), new Affine(526, 296), new Affine(348, 188),
            new Affine(340, 381), new Affine(516, 329), new Affine(390, 191));

        var M2 = M.image(new Affine(376, 412), new Affine(526, 296), new Affine(348, 188),
            new Affine(432, 212), new Affine(498, 150), new Affine(462, 88));

        var P0 = new Affine(300, 400);
        var p1 = p;
        var r, Pn, M;
        var result = [[P0.x, P0.y]];
        for (var i = 0; i < n; i++) {
            r = Math.random();
            if (r < p1) {
                M = M1;
            }
            else if (r < 1) {
                M = M2;
            }
            Pn = P0.transform(M);
            result.push([Pn.x, Pn.y]);
            P0 = Pn;
        }
        for (var i = 0, l = result.length; i < l; i++) {
            this.ctx.rect(result[i][0], result[i][1], 1, 1);
        }
        this.ctx.fill();
    },
    animateHelix: function(n) {
        var M = this.Mutation;
        var M1 = M.image(new Affine(376, 412), new Affine(526, 296), new Affine(348, 188),
            new Affine(340, 381), new Affine(516, 329), new Affine(390, 191));

        var M2 = M.image(new Affine(376, 412), new Affine(526, 296), new Affine(348, 188),
            new Affine(432, 212), new Affine(498, 150), new Affine(462, 88));

        var that = this;
        var p = 0;
        var timer = setInterval(function() {
            var P0 = new Affine(300, 400);
            var p1 = p, p2 = 1 - p;
            var r, Pn, M;
            var result = [[P0.x, P0.y]];
            for (var i = 0; i < n; i++) {
                r = Math.random();
                if (r < p1) {
                    M = M1;
                }
                else if (r < p1 + p2) {
                    M = M2;
                }
                Pn = P0.transform(M);
                result.push([Pn.x, Pn.y]);
                P0 = Pn;
            }
            that.ctx.clearRect(0, 0, 800, 800);
            that.ctx.beginPath();
            for (var i = 0, l = result.length; i < l; i++) {
                that.ctx.rect(result[i][0], result[i][1], 1, 1);
            }
            that.ctx.fill();
            that.ctx.closePath();
            p += 0.05;
            if (p > 1) {
                clearInterval(timer);
            }
        }, 700);
    }
};
