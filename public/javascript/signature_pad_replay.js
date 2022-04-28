
class SignaturePadReplay extends SignaturePad {

    stopReplay() {
        this.animated = false;
        this.clear();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async replay(pointGroups, { clear = true } = {}) {
        this.animated = true;
        if (clear) {
            this.clear();
        }
        this._replay(pointGroups, this._drawCurve.bind(this), this._drawDot.bind(this));
        this._data = this._data.concat(pointGroups);
    }

    async _replay(pointGroups, drawCurve, drawDot) {

        for (const group of pointGroups) {
            const { penColor, dotSize, minWidth, maxWidth, points } = group;
            if (points.length > 1) {
                for (let j = 0; j < points.length; j += 1) {
                    if(this.animated){
                        const basicPoint = points[j];
                        if(j > 0){
                            let lapsedTime =basicPoint.time - points[j-1].time;
                            await this.sleep(lapsedTime);
                        }
                        const point = new Point(basicPoint.x, basicPoint.y, basicPoint.pressure, basicPoint.time);
                        this.penColor = penColor;
                        if (j === 0) {
                            this._reset();
                        }
                        const curve = this._addPoint(point);
                        if (curve) {
                            drawCurve(curve, {
                                penColor,
                                dotSize,
                                minWidth,
                                maxWidth,
                            });
                        }
                    }
                }
            }
            else {
                if(this.animated){
                    this._reset();
                    drawDot(points[0], {
                        penColor,
                        dotSize,
                        minWidth,
                        maxWidth,
                    });
                }
            }
        }
        return 'complete';
    }

    record() {
        return this.toData();
    }

    
  
}


class Point {
    constructor(x, y, pressure, time) {
        if (isNaN(x) || isNaN(y)) {
            throw new Error(`Point is invalid: (${x}, ${y})`);
        }
        this.x = +x;
        this.y = +y;
        this.pressure = pressure || 0;
        this.time = time || Date.now();
    }
    distanceTo(start) {
        return Math.sqrt(Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2));
    }
    equals(other) {
        return (this.x === other.x &&
            this.y === other.y &&
            this.pressure === other.pressure &&
            this.time === other.time);
    }
    velocityFrom(start) {
        return this.time !== start.time
            ? this.distanceTo(start) / (this.time - start.time)
            : 0;
    }
}
