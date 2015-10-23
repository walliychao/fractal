var Complex = function(a, b) {
    this[0] = a;
    this[1] = b;
};
Complex.prototype = {
    constructor: Complex,
    add: function(Z1, Z2) {
        if (!Z2) {
            Z2 = Z1;
            Z1 = new Complex(this[0], this[1]);
        }
        return new Complex(Z1[0] + Z2[0], Z1[1] + Z2[1]);
    },
    multiply: function(Z1, Z2) {
        if (!Z2) {
            Z2 = Z1;
            Z1 = new Complex(this[0], this[1]);
        }
        return new Complex(Z1[0] * Z2[0] - Z1[1] * Z2[1], Z1[1] * Z2[0] + Z1[0] * Z2[1]);
    },
    module: function() {
        return Math.sqrt(this[0] * this[0] + this[1] * this[1]);
    },
    // d: pixel distance
    julia: function(d, s, c, n) {
        var Z0, Z1;
        var C = new Complex(c[0], c[1]);
        var ZSet = [];
        for (var i = -d; i <= d; i++) {
            for (var j = -d; j <= d; j++) {
                Z0 = new Complex(i/d*s, j/d*s);
                for (var k = 0; k < n; k++) {
                    Z1 = Z0.multiply(Z0).add(C);
                    if (Z1.module() < 2){
                        Z0 = Z1;
                    }
                    else {
                        break;
                    }
                }
                ZSet.push(k);
            }
        }
        return ZSet;
    },
    // q: the central point, d: pixel distance, s: amplify size
    mandelbrot: function(d, s, q, n) {
        var Z0, C;
        var ZSet = [];
        for (var i = -d; i <= d; i++) {
            for (var j = -d; j <= d; j++) {
                Z0 = new Complex(0, 0);
                C = new Complex(i/d*s + q[0], j/d*s + q[1]);
                for (var k = 0; k < n; k++) {
                    Z1 = Z0.multiply(Z0).add(C);
                    if (Z1.module() < 2){
                        Z0 = Z1;
                    }
                    else {
                        break;
                    }
                }
                if (!k) {
                    console.log(i + '  ' + j);
                }
                ZSet.push(k);
            }
        }
        return ZSet;
    } 
};
