
var OverlayImage = Class({
    initialize: function () {
        this.src = LoadedImageFiles['overlayImg'].src;
        this.plane = new PIXI.mesh.Plane(new PIXI.Texture(
                new PIXI.BaseTexture(LoadedImageFiles['overlayImg'])
            ));
        this.centerAxis();
        this.transparency(0.5);
        this.center();

        this.plane.interactive = false;
        this.plane
            .on('pointerdown', onPointerDown)
            .on('pointerup', onPointerUp)
            .on('pointerupoutside', onPointerUp)
            .on('pointermove', onPointerMove);

        function onPointerDown(evt) {
            this.isdown = true;
            this.prevX = evt.data.global.x;
            this.prevY = evt.data.global.y;
        }

        function onPointerUp() {
            this.isdown = false;
            this.prevX = undefined;
            this.prevY = undefined;
        }

        function onPointerMove(evt) {
            if (!this.isdown || panZoomActive) return;
            let dx = evt.data.global.x - this.prevX;
            let dy = evt.data.global.y - this.prevY;
            let editor = $('canvas')[0].editor;
            editor.overlayImg.moveTo(this.x + dx, this.y + dy);
            this.prevX = evt.data.global.x;
            this.prevY = evt.data.global.y;
            editor.render();
        }

        $(document)
            .bind('keydown.overlay',
                function (e) {
                    if (e.key == 'i' && this.overlayRealAlpha === undefined) {
                        let editor = $('canvas')[0].editor;
                        this.overlayRealAlpha = editor.overlayImg.plane.alpha;
                        editor.overlayImg.plane.alpha = 1;
                        editor.render();
                    }
                })
            .bind('keyup.overlay',
                function (e) {
                    if (e.key == 'i') {
                        let editor = $('canvas')[0].editor;
                        editor.overlayImg.plane.alpha = this.overlayRealAlpha;
                        this.overlayRealAlpha = undefined;
                        editor.render();
                    }
                })

        this.ctrller = new dat.GUI({ autoPlace: false });
        this.ctrller.domElement.id = 'overlayController';
        var overlayInfo = { size: 1, fineSize: 0, rot: 0, fineRot: 0, alpha: 0.5, overlayImg: this };
        this.ctrller.add(overlayInfo, 'size').min(0.2).step(0.01).max(5).listen()
            .name('size (rough)')
            .onChange(function (value) {
                let editor = $('canvas')[0].editor;
                let hasScaled = this.object.overlayImg.scale(value + this.object.fineSize);
                if (!hasScaled)
                    this.object.size =
                        this.object.overlayImg.plane.scale.x
                        - this.object.fineSize;
                editor.render();
            });
        this.ctrller.add(overlayInfo, 'fineSize').min(-0.05).step(0.001).max(0.05).listen()
            .name('size (fine)')
            .onChange(function (value) {
                let editor = $('canvas')[0].editor;
                let hasScaled = this.object.overlayImg.scale(this.object.size + value);
                if (!hasScaled)
                    this.object.size =
                        this.object.overlayImg.plane.scale.x
                        - this.object.size;
                editor.render();
            });
        this.ctrller.add(overlayInfo, 'rot').min(-Math.PI).step(Math.PI / 60).max(Math.PI).listen()
            .name('rotation (rough)')
            .onChange(function (value) {
                let editor = $('canvas')[0].editor;
                this.object.overlayImg.rotate(this.object.fineRot + value);
                editor.render();
            });
        this.ctrller.add(overlayInfo, 'fineRot').min(-Math.PI / 20).step(Math.PI / 1200).max(Math.PI / 20).listen()
            .name('rotation (fine)')
            .onChange(function (value) {
                let editor = $('canvas')[0].editor;
                this.object.overlayImg.rotate(this.object.rot + value);
                editor.render();
            });
        this.ctrller.add(overlayInfo, 'alpha').min(0).step(0.05).max(1).listen()
            .name('transparency')
            .onChange(function (value) {
                let editor = $('canvas')[0].editor;
                this.object.overlayImg.transparency(value);
                editor.render();
            });
        this.backgroundInfo = {
            green: false
        }
        this.backgroundInfo.DOM = this.ctrller.add(this.backgroundInfo, 'green').listen()
            .name('green screen')
            .onChange(function (value) {
                if (value)
                    $('.canvas-box').css('background', '#00b140');
                else
                    $('.canvas-box').css('background', '');
            });
        $('body').append(this.ctrller.domElement);
        $(this.ctrller.domElement).css('opacity', 0);
    },
    getImage: function () {
        return this.plane;
    },
    setImage: function (imageUrl) {
        let newImg = new Image();
        newImg.src = imageUrl;
        this.src = newImg.src;
        this.updatingImg = [];
        newImg.onload = function () {
            that.plane.texture = new PIXI.Texture(
                    new PIXI.BaseTexture(newImg)
                );
            setTimeout(ontexload, 100);
        }
        var that = this;
        var attempts = 0;
        function ontexload() {
            if (!that.plane.texture.baseTexture.hasLoaded
                && that.plane.texture.baseTexture.isLoading
                && attempts < 15) {
                attempts++;
                setTimeout(ontexload, 100);
            }
            let requests = that.updatingImg;
            that.updatingImg = undefined;
            that.centerAxis();
            that.center();
            if (requests) {
                for (var i = 0; i < requests.length; i++) {
                    let request = requests[i];
                    that[request.call](request.val);
                }
            }
            $('canvas')[0].editor.render();
        }
    },
    toggleController: function (bool) {
        let $ctrller = $('#overlayController');
        if (bool === undefined)
            bool = ($ctrller.css('opacity') == 0);
        if (bool) {
            $ctrller.css('opacity', 1);
            this.plane.interactive = true;
        }
        else {
            $ctrller.css('opacity', 0);
            this.plane.interactive = false;
        }
    },
    center: function () {
        if (this.updatingImg) {
            this.updatingImg.push({
                call: 'center'
            });
            return;
        }
        this.plane.x = 0.5 * EDITOR_SIZE.x;
        this.plane.y = 0.5 * EDITOR_SIZE.y;
    },
    moveTo: function (x, y) {
        this.moveToX(x);
        this.moveToY(y);
    },
    moveToX: function (val) {
        if (val === undefined || typeof val !== 'number') {
            return;
        }
        if (this.updatingImg) {
            this.updatingImg.push({
                call: 'moveToX',
                val: val
            });
            return;
        }
        if (val < 0.5 * (EDITOR_SIZE.x - CANVAS_PIXEL_SCALE * CANVAS_SIZE.x - this.plane.width) + 10) {
            val = 0.5 * (EDITOR_SIZE.x - CANVAS_PIXEL_SCALE * CANVAS_SIZE.x - this.plane.width) + 10;
        }
        if (val > 0.5 * (EDITOR_SIZE.x + CANVAS_PIXEL_SCALE * CANVAS_SIZE.x + this.plane.width) - 10) {
            val = 0.5 * (EDITOR_SIZE.x + CANVAS_PIXEL_SCALE * CANVAS_SIZE.x + this.plane.width) - 10;
        }
        this.plane.x = val;
    },
    moveToY: function (val) {
        if (val === undefined || typeof val !== 'number') {
            return;
        }
        if (this.updatingImg) {
            this.updatingImg.push({
                call: 'moveToY',
                val: val
            });
            return;
        }
        if (val < 0.5 * (EDITOR_SIZE.y - CANVAS_PIXEL_SCALE * CANVAS_SIZE.y - this.plane.height) + 10) {
            val = 0.5 * (EDITOR_SIZE.y - CANVAS_PIXEL_SCALE * CANVAS_SIZE.y - this.plane.height) + 10;
        }
        if (val > 0.5 * (EDITOR_SIZE.y + CANVAS_PIXEL_SCALE * CANVAS_SIZE.y + this.plane.height) - 10) {
            val = 0.5 * (EDITOR_SIZE.y + CANVAS_PIXEL_SCALE * CANVAS_SIZE.y + this.plane.height) - 10;
        }
        this.plane.y = val;
    },
    transparency: function (val) {
        if (val === undefined || typeof val !== 'number') {
            return;
        }
        if (this.updatingImg) {
            this.updatingImg.push({
                call: 'transparency',
                val: val
            });
            return;
        }
        if (val < 0 || val > 1) {
            return;
        }
        this.plane.alpha = val;
    },
    scale: function (val) {
        if (val === undefined || typeof val !== 'number') {
            return;
        }
        if (this.updatingImg) {
            this.updatingImg.push({
                call: 'scale',
                val: val
            });
            return;
        }
        let minSideLen = Math.min(this.plane.width, this.plane.height);
        if (val * minSideLen < 10 || val * minSideLen > 10000) {
            return;
        }
        let origScale = this.plane.scale.x;
        this.plane.scale.x = val;
        this.plane.scale.y = val;
        if (this.plane.x < 0.5 * (EDITOR_SIZE.x - CANVAS_PIXEL_SCALE * CANVAS_SIZE.x - this.plane.width) + 10
            || this.plane.x > 0.5 * (EDITOR_SIZE.x + CANVAS_PIXEL_SCALE * CANVAS_SIZE.x + this.plane.width) - 10
            || this.plane.y < 0.5 * (EDITOR_SIZE.y - CANVAS_PIXEL_SCALE * CANVAS_SIZE.y - this.plane.height) + 10
            || this.plane.y > 0.5 * (EDITOR_SIZE.y + CANVAS_PIXEL_SCALE * CANVAS_SIZE.y + this.plane.height) - 10) {
            this.plane.scale.x = origScale;
            this.plane.scale.y = origScale;
            return false;
        }
        return true;
    },
    rotate: function (val) {
        if (val === undefined || typeof val !== 'number') {
            return;
        }
        if (this.updatingImg) {
            this.updatingImg.push({
                call: 'rotate',
                val: val
            });
            return;
        }
        if (val < -Math.PI || val > Math.PI) {
            let isNeg = false;
            if (val < 0) {
                isNeg = true;
                val = -val;
            }
            val = val % Math.PI;
            if (isNeg) val = -val;
        }
        this.plane.rotation = val;
    },
    centerAxis: function () {
        if (this.updatingImg) {
            this.updatingImg.push({
                call: 'centerAxis',
                val: undefined
            });
            return;
        }
        this.plane.pivot.x = 0.5 * this.plane.width / this.plane.scale.x;
        this.plane.pivot.y = 0.5 * this.plane.height / this.plane.scale.y;
    },
    toSAML: function () {
        return '<overlay-img src="' + this.src
            + '" pos-x="' + this.plane.x
            + '" pos-y="' + this.plane.y
            + '" scale="' + this.plane.scale.x
            + '" rot="' + this.plane.rotation
            + '" alpha="' + this.plane.alpha
            + '" green-screen="' + this.backgroundInfo.green
            + '"/>';
    }
});