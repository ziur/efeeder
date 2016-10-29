'use strict';

let BkTransform = function(width, height, ratio = 1)
{
	this.resize(width, height, ratio);
}

BkTransform.prototype.resize = function(width, height, ratio)
{
	this.dx = width * 0.5;
	this.dy = height * 0.5;
	let newRatio = this.dx / this.dy;
	this.scale = (newRatio < ratio) ? (this.dx / ratio) : this.dy;
	this.invScale = 1 / this.scale;
}

BkTransform.prototype.screenToAbsoluteDelta = function (dx, dy)
{
	let scale = this.invScale;
	return {
		dx : dx * scale,
		dy : dy * scale
		};
}

// Returns true if coords a and b are practically the same 
BkTransform.prototype.equalCoords = function(a, b)
{
	let sa = a.toScreen(this);
	let sb = b.toScreen(this);
	return Math.abs(sa.x - sb.x) < 1 && 
		Math.abs(sa.y - sb.y) < 1 &&
		Math.abs(sa.w - sb.w) < 1 &&
		Math.abs(sa.h - sb.h) < 1;
}

let BkCoord = function(x = 0, y = 0, w = 0, h = 0, z = 0, type = 0)
{
	// x,y denotes the center of the object
	// w,h are the dimensions of the object
	// z is the z order of the object for drawing
	// type is the type of coordinates
	this.x = x;
	this.y = y;
	this.z = z;
	this.w = w;
	this.h = h;
	this.type = type;
	
	// Type 0:
	// x, y, w, h are absolute and movable
	// x is guaranteed to be in screen for [-ratio..ratio]
	// y is guaranteed to be in screen for [-1..1]
	// Type 0 can become Type 1 if the object is docked to borders
	// Type 0 can become Type 2 if the object is docked to center

	// Type 1:
	// x, y are relative to the borders and movable
	// x positive is anchored to the left
	// x negative is anchored to the right
	// y positive is anchored to the top
	// y negative is anchored to the bottom
	// x, y negative can use -0.
	// w, h are absolute
	// x is guaranteed to be in screen for [-ratio..ratio]
	// y is guaranteed to be in screen for [-1..1]
	// h, w are proportional to current canvas dimensions [0..1[
	// Becomes Type 0 when undocked
	
	// Type 6:
	// x, y, w, h are relative to current canvas dimensions and fixed
	// x, y are guaranteed to be in screen for [0..1[
	// if x, y are negative [-1..0[ they are relative to right or bottom.
	// h, w are proportional to the current smaller canvas dimension
	// Becomes Type 0 when undocked
	
	// Type 7:
	// x, y, w, h are relative to current canvas dimensions and fixed
	// if x, y are negative [-1..0[ they are relative to right or bottom.
	// x, y are guaranteed to be in screen for [0..1[
	// h, w are proportional to current canvas dimensions [0..1[
	// A negative h or w makes it the complement of a positive w or h in type 6
	// Becomes Type 0 when undocked
	
	// Type 8:
	// x, y, w, h are relative to current canvas dimensions and fixed
	// x, y are guaranteed to be in screen for [0..1[
	// h, w are proportional to current canvas dimensions [0..1[
	// Becomes Type 0 when undocked
}

BkCoord.prototype.toScreen = function(transform)
{
	if (this.type === 0)
	{
		let scale = transform.scale;
		return new BkCoord(
			this.x * scale + transform.dx,
			this.y * scale + transform.dy,
			this.w * scale,
			this.h * scale,
			this.z);
	}
	else if (this.type >= 8)
	{
		let sw = transform.dx * 2;
		let sh = transform.dy * 2;
		return new BkCoord(
			this.x * sw,
			this.y * sh,
			this.w * sw,
			this.h * sh,
			this.z);
	}
	else if (this.type === 6)
	{
		let sw = transform.dx * 2;
		let sh = transform.dy * 2;
		let sm, uw, uh;
		if (sw < sh)
		{
			sm = sw;
			uw = 1;
			uh = sh / sm;
		}
		else
		{
			sm = sh;
			uh = 1;
			uw = sw / sm;
		}
		let w = this.w;
		if (w < 0) w += uw;
		let h = this.h;
		if (h < 0) h += uh;
		
		return new BkCoord(
			(this.x + ((this.x < 0) ? (uw - w * 0.5) : (w * 0.5))) * sm,
			(this.y + ((this.y < 0) ? (uh - h * 0.5) : (h * 0.5))) * sm,
			w * sm,
			h * sm,
			this.z);
	}
	else if (this.type === 7)
	{
		let sw = transform.dx * 2;
		let sh = transform.dy * 2;
		let uw = 1;
		let uh = 1;
		let sm = sw < sh ? sw : sh;
		let w = this.w;
		if (w < 0)
		{
			uw = sw / sm;
			w += uw;
			sw = sm;
		}
		let h = this.h;
		if (h < 0)
		{
			uh = sh / sm;
			h += uh;
			sh = sm;
		}
		return new BkCoord(
			(this.x + ((this.x < 0) ? (uw - w * 0.5) : (w * 0.5))) * sw,
			(this.y + ((this.y < 0) ? (uh - h * 0.5) : (h * 0.5))) * sh,
			w * sw,
			h * sh,
			this.z);
	}	
	return null;
}

BkCoord.prototype.toAbsolute = function(transform)
{
	// Only for non absolute coordinates
	if (this.type >= 8)
	{
		let scale = transform.invScale;
		let sw = transform.dx * 2;
		let sh = transform.dy * 2;
		return new BkCoord(
			(this.x * sw - transform.dx) * scale,
			(this.y * sh - transform.dy) * scale,
			(this.w * sw) * scale,
			(this.h * sh) * scale,
			this.z);
	}
	else if (this.type === 6)
	{
		let scale = 2 * transform.invScale;
		let sw = transform.dx * scale;
		let sh = transform.dy * scale;
		let sm = sw < sh ? sw : sh;
		let w = this.w;
		if (w < 0) w = (1 + w) * sw / sm;
		let h = this.h;
		if (h < 0) h = (1 + h) * sh / sm;
		return new BkCoord(
			(this.x + ((this.x < 0) ? (sw / sm - w * 0.5) : (w * 0.5))) * sm - 0.5 * sw,
			(this.y + ((this.y < 0) ? (sh / sm - h * 0.5) : (h * 0.5))) * sm - 0.5 * sh,
			w * sm,
			h * sm,
			this.z);
	}
	else if (this.type === 7)
	{
		let scale = 2.0 * transform.invScale;
		let sw = transform.dx * scale;
		let sh = transform.dy * scale;
		let uw = 1;
		let uh = 1;
		let sm = sw < sh ? sw : sh;
		let w = this.w;
		if (w < 0)
		{
			uw = sw / sm;
			w += uw;
			sw = sm;
		}
		let h = this.h;
		if (h < 0)
		{
			uh = sh / sm;
			h += uh;
			sh = sm;
		}
		return new BkCoord(
			(this.x + ((this.x < 0) ? (uw - w * 0.5) : (w * 0.5)) - 0.5) * sw,
			(this.y + ((this.y < 0) ? (uh - h * 0.5) : (h * 0.5)) - 0.5) * sh,
			w * sw,
			h * sh,
			this.z);
	}
	else if (this.type === 0)
	{
		return this.clone();
	}
	return null;
}

BkCoord.prototype.toScreenCoord = function(coord)
{
	let nCoord = this.toScreen(new BkTransform(coord.w, coord.h));
	nCoord.x += coord.x - coord.w * 0.5;
	nCoord.y += coord.y - coord.h * 0.5;
	return nCoord;
}

BkCoord.prototype.fromScreen = function(transform)
{
	// Only for absolute coordinates
	if (this.type !== 0) return null;
	
	let scale = transform.invScale;
	return new BkCoord(
		(this.x - transform.dx) * scale,
		(this.y - transform.dy) * scale,
		this.w * scale,
		this.h * scale,
		this.z);
}

BkCoord.prototype.growScaleMin = function(scale)
{
	// Only for absolute coordinates
	if (this.type !== 0) return null;
	
	let amount = this.w < this.h ? this.w : this.h;
	amount *= scale - 1;
	return new BkCoord(
		this.x,
		this.y,
		this.w + amount,
		this.h + amount,
		this.z);
}

BkCoord.prototype.growPixels = function(pixels)
{
	// Only for absolute coordinates
	if (this.type !== 0) return null;
	return new BkCoord(
		this.x,
		this.y,
		this.w + pixels,
		this.h + pixels,
		this.z);
}

// Resizes to the new w and h moving it relative to sx, sy.
// Use it when resizing a selected object.
// w and h in absolute coordinates, sx, sy in screen coordinates.
BkCoord.prototype.resizeAndMove = function(transform, w, h, sx, sy)
{
	// Only for absolute coordinates
	if (this.type !== 0) return null;
	
	let p = new BkCoord(sx, sy, 0, 0).fromScreen(transform);
	this.x = p.x + (this.x - p.x) * w / this.w;
	this.y = p.y + (this.y - p.y) * h / this.h;
	this.w = w;
	this.h = h;
}

BkCoord.prototype.clone = function(scale)
{
	return new BkCoord(
		this.x,
		this.y,
		this.w,
		this.h,
		this.z,
		this.type);
}

const BK_INV_255 = 1 / 255;
function bkColorToStr(colorNumber)
{
	return 'rgba(' + 
		((colorNumber >> 16) & 0xFF).toString() + ',' +
		((colorNumber >> 8) & 0xFF).toString() + ',' +
		(colorNumber & 0xFF).toString() + ',' +
		(((colorNumber >> 24) & 0xFF) * BK_INV_255).toString() + ')';
}

function bkShadowColor(color)
{
	let alpha = ((color >> 24) & 0xFF) * BK_INV_255;
	let shadowAlpha = (1 - alpha)
	shadowAlpha *= shadowAlpha;
	shadowAlpha = Math.floor((1 - shadowAlpha) * 128);
	let colorIntensity = 1 - alpha;
	
	let r = Math.floor(((color >> 16) & 0xFF) * colorIntensity);
	let g = Math.floor(((color >> 8) & 0xFF) * colorIntensity);
	let b = Math.floor((color & 0xFF) * colorIntensity);
	
	return b + (g << 8) + (r << 16) | (shadowAlpha << 24);
}

function bkColorMix(colorA, colorB)
{
	return ((((colorA >> 1) & 0x7F807F80) + ((colorB >> 1) & 0x7F807F80)) & 0xFF00FF00) |
		((((colorA & 0xFF00FF) + (colorB & 0xFF00FF)) >> 1) & 0x00FF00FF);
}

function bkColorMixRetainAlpha(colorA, colorB)
{
	return ((((colorA & 0xFF00) + (colorB & 0xFF00)) >> 1 ) & 0xFF00) |
		((((colorA & 0xFF00FF) + (colorB & 0xFF00FF)) >> 1) & 0x00FF00FF) |
		(colorA & 0xFF000000);
}

function bkColorMix31(colorA, colorB)
{
	return (((((colorA >> 2) & 0x3FC03FC0) * 3) + ((colorB >> 2) & 0x3FC03FC0)) & 0xFF00FF00) |
		(((((colorA & 0xFF00FF) * 3) + (colorB & 0xFF00FF)) >> 2) & 0x00FF00FF);
}

function bkColorMix31RetainAlpha(colorA, colorB)
{
	return ((((colorA & 0xFF00) * 3 + (colorB & 0xFF00)) >> 2 ) & 0xFF00) |
		(((((colorA & 0xFF00FF) * 3) + (colorB & 0xFF00FF)) >> 2) & 0x00FF00FF) |
		(colorA & 0xFF000000);
}

function bkColorMix13RetainAlpha(colorA, colorB)
{
	return ((((colorA & 0xFF00) + (colorB & 0xFF00) * 3) >> 2 ) & 0xFF00) |
		(((((colorA & 0xFF00FF)) + (colorB & 0xFF00FF) * 3) >> 2) & 0x00FF00FF) |
		(colorA & 0xFF000000);
}

function bkColorDesaturate(color)
{
	let r = (color >> 16) & 0xFF;
	let g = (color >> 8) & 0xFF;
	let b = color & 0xFF;
	let v = Math.round(Math.max(r, g, b) * 0.4 + r * 0.18 + g * 0.348 + b * 0.072);
	return (v * 0x10101) | (color & 0xFF000000);
}

function bkColorSaturate(color)
{
	let r = (color >> 16) & 0xFF;
	let g = (color >> 8) & 0xFF;
	let b = color & 0xFF;
	let m = Math.min(r, g, b);
	let M = Math.max(r, g, b);
	let delta = M - m;
	if (delta === 0) return color;
	
	let factor = M / delta;
	r = Math.floor((r - m) * factor);
	g = Math.floor((g - m) * factor);
	b = Math.floor((b - m) * factor);
	return b + (g << 8) + (r << 16) | (color & 0xff000000);
}

function bkColorDarken(color)
{
	return bkColorMix31RetainAlpha(color, bkColorMix(bkColorSaturate(color), 0));
}
	
function bkColorLighten(color)
{
	let r = (color >> 16) & 0xFF;
	let g = (color >> 8) & 0xFF;
	let b = color & 0xFF;
	let m = Math.max(r, g, b);
	if (m === 0) return (color | 0x808080);
	if (m === 255) return bkColorMixRetainAlpha(color, 0xFFFFFF);
	
	let factor = 255 / m;
	r = Math.round(r * factor);
	g = Math.round(g * factor);
	b = Math.round(b * factor);
	return b + (g << 8) + (r << 16) | (color & 0xff000000);
}

let BkObject = function(coord)
{
	this.coord = coord;
	this.flags = 0;
	this.comparable = null;
	this.area = null;
}

BkObject.prototype.resize = function()
{
}

BkObject.prototype.draw = function()
{
}

function bkObjectIsSelected(o)
{
	return (o.flags & 0x80000000) !== 0;
}

function bkObjectSetSelected(o, state = true)
{
	if (state) o.flags |= 0x80000000; else o.flags &= 0x7FFFFFFF;
}

let BkArea = function(coord, ratio, type, margin, padding, alignmentFlags)
{
	if (coord == null) coord = null;
	this.coord = coord;
	if (ratio == null) ratio = 1;
	this.ratio = ratio;
	// Type 0: Cover all the area, follow the ratio when possible.
	// Type 1: Follow the ratio but cover at least 25% of the area.
	// Type 2: Mandatory ratio
	if (type == null) type = 0;
	this.areaType = type;	
	if (margin == null) margin = 0.04;
	this.margin = margin;	
	if (padding == null) padding = 0.1;
	this.padding = padding;

	// Bit 0x1 Flip horizontally
	// Bit 0x2 Flip vertically
	// Bit 0x4 Center horizontally
	// Bit 0x8 Center vertically
	// Bit 0x10 No left margin
	// Bit 0x20 No right margin
	// Bit 0x40 No top margin
	// Bit 0x80 No bottom margin
	if (alignmentFlags == null) alignmentFlags = 0;	
	this.alignmentFlags = alignmentFlags;
}

let BkSystem = function(canvasName, ratio = null)
{
	this.item = [];
	this.area = [];
	this._isInteracting = false;
	this.__wasInteracting = false;
	this._isDrawing = false;
	this.disabledColor = null;
	this.transform = new BkTransform(1, 1);
	this.canvas = document.getElementById(canvasName);
	this.ctx = this.canvas.getContext('2d');
	this.ratio = (ratio !== null) ? ratio : (window.screen.width / window.screen.height);

	this.redraw = false;
	this.mouse = {
		selected: null,
		hover: null,
		button: 0,
		action: 0,
		x0: 0,
		y0: 0,
		x: 0,
		y: 0,
		dx: 0,
		dy: 0,
		adx: 0,
		ady: 0
	};
	
	this.bgImg = null;
	this.bgImgAlpha = null;
	this.canvas.onclick = this.doOnClick.bind(this);	
};

/**
 * Use this for events triggered several times and you only want to execute a
 * function after the last event was triggered after certain time has elapsed.
 * @returns A function that receives: a function, a delay and an id denoting
 *          the group of events to be consolidated.
 */
let bkDelayCallbackAndExecuteOnce = (function()
{
	var delayCallbackTimers = {};
	return function (callback, delayMs, id) {
		if (delayCallbackTimers[id])
		{
			clearTimeout(delayCallbackTimers[id]);
		}
		delayCallbackTimers[id] = setTimeout(callback, delayMs);
	};
}());

BkSystem.prototype.doOnResize = function()
{
	bkDelayCallbackAndExecuteOnce(this.resize.bind(this), 200, 'resize');
}

BkSystem.prototype.resize = function()
{
	this.ctx.save();
	if (this.onresize) this.onresize();

	this.width = this.canvas.clientWidth;
	this.height = this.canvas.clientHeight;
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	this.__screenCoord = new BkCoord(
		this.width * 0.5, this.height * 0.5, this.width, this.height);
	this.transform.resize(this.width, this.height, this.ratio);
	this.redistribute(false);

	// Execute custom resize for each UI object
	let count = this.item.length;
	for (let i = 0; i < count; ++i)
	{
		this.item[i].resize();
	}
	this.redraw = true;
	this.ctx.restore();
}

function bkOnImageLoad()
{
	this.uiSystem.redraw = true;
	this.isReady = true;
}

/**
 * @param src Image source.
 * @param imgObject The object previous reference to the image. If src and
 *        imgObject.src are the same the image is not created again.
 * @return Either a new image or imgObject if src is the same.
 */
BkSystem.prototype.createImage = function(src, imgObject = null)
{
	if ((src === null) || (0 === src.length)) return imgObject;
	
	// If property is undefined, null or src doesn't match with the new src
	if ((imgObject === null) || (imgObject.src !== src))
	{
		imgObject = new Image();
		imgObject.src = src;
		imgObject.uiSystem = this;
		imgObject.isReady = false;
		imgObject.addEventListener("load", bkOnImageLoad.bind(imgObject), false);
	}
	return imgObject;
}

BkSystem.prototype.setBackgroundImage = function(src, alpha = null)
{
	this.bgImg = this.createImage(src);
	this.bgImgAlpha = alpha;
}

function _bkGetSquareDist(w, h, n)
{
	if (w <= 0 || h <= 0 || n <= 0) return new BkCoord(1, 1, 0);

	// check against full h
	let xh = Math.ceil(Math.sqrt(n * (h / w)));
	let yh = Math.floor(xh * (w / h));
	while (xh * yh < n)
	{
		if (yh < 1)
		{
			yh = 1;
			xh = Math.ceil(yh * (h / w));
		}
		else
		{
			++xh;
			yh = Math.floor(xh * (w / h));
		}
	}
	let lh = h / xh;

	// check against full w
	let xw = Math.ceil(Math.sqrt(n * (w / h)));
	let yw = Math.floor(xw * (h / w));
	while (xw * yw < n)
	{
		if (yw < 1)
		{
			yw = 1;
			xw = Math.ceil(yw * (w / h));
		}
		else
		{
			++xw;
			yw = Math.floor(xw * (h / w));
		}
	}
	let lw = w / xw;
	
	if (lw < lh)
	{
		xw = yh;
		yw = xh;
		lw = lh;
	}
	
	// Prefer lower differences in dimensions
	if ((xw - 1) * yw >= n) --xw;
	if (xw * (yw - 1) >= n) --yw;
	return new BkCoord(xw, yw, lw);
}

function _bkGetRectDist(w, h, boxRatio, count)
{
	let sw = w / boxRatio;
	let result = _bkGetSquareDist(sw, h, count);
	result.h = result.w;
	result.w *= boxRatio;
	return result;
}

BkSystem.prototype.redistribute = function(updateSizesAndRedraw = true)
{
	let count = this.area.length;
	for (let i = 0; i < count; ++i)
	{
		this.redistributeArea(i, this.area[i], updateSizesAndRedraw);
	}
	
	if (updateSizesAndRedraw)
	{
		this.redraw = true;
	}
}

BkSystem.prototype.redistributeArea = function(id, area, updateSizes)
{
	let objects = [];
	{
		const count = this.item.length;
		for (let i = 0; i < count; ++i)
		{
			if (this.item[i].area === area)
			{
				objects.push(this.item[i]);
			}
		}
	}
	
	const count = objects.length;
	if (count <= 0) return;
	
	if (typeof objects[0].comparable === 'number')
	{
		objects.sort(function(a, b){return a.comparable - b.comparable;});
	}
	else
	{
		objects.sort(function(a, b){
				return +(a.comparable > b.comparable) || +(a.comparable === b.comparable) - 1;
			});
	}
	
	// We are interested in width and height proportional to screen
	let coord = area.coord.toScreen(this.transform);
	let sw = coord.w;
	let sh = coord.h;

	let factorW, factorH;
	if (sw < sh)
	{
		factorW = 1;
		factorH = sw / sh;
	}
	else
	{
		factorW = sh / sw;
		factorH = 1;
	}
	
	let marginW = area.margin * factorW;
	sw *= (1 - marginW);
	let marginH = area.margin * factorH;
	sh *= (1 - marginH);

	// We need coordinates in the [0..1[ range
	coord = area.coord;
	let padW, padH, cellW, cellH;
	
	let nPadding = area.ratio >= 1 ? area.padding : area.padding * area.ratio;
	let cellRatio = (area.ratio + nPadding) / (1 + nPadding);
	let dim = _bkGetRectDist(sw, sh, cellRatio, count);
	
	if (area.areaType <= 1)
	{
		if (area.areaType === 0)
		{
			// Use all the space
			if (dim.x > dim.y)
			{
				dim.x = Math.ceil(count / dim.y);
			}
			else
			{
				dim.y = Math.ceil(count / dim.x);
			}
		}
		
		cellW = (1 - marginW) / dim.x;
		cellH = (1 - marginH) / dim.y;
		
		if (cellW * sw < cellH * sh)
		{
			padW = area.padding;
			padH = area.padding * (cellW * sw) / (cellH * sh);
		}
		else
		{
			padW = area.padding * (cellH * sh) / (cellW * sw);
			padH = area.padding;
		}
	}
	else if (area.areaType == 2)
	{
		cellW = (1 - marginW) * (dim.w * dim.x) / (dim.x * sw);
		cellH = (1 - marginH) * (dim.h * dim.y) / (dim.y * sh);
		
		padW = 1 - (area.ratio / (area.ratio + nPadding));
		padH = 1 - (1 / (1 + nPadding));
	}

	
	let oPadW = padW;
	let rowCols, x, y, w, h, o, oIsSelected;
	let index = 0;
	
	let flipFlagW = area.alignmentFlags & 1;
	let flipFlagH = area.alignmentFlags & 2;
	let centerFlagW = area.alignmentFlags & 4;
	let centerFlagH = area.alignmentFlags & 8;
	
	let flipFactorW = flipFlagW ? -1 : 1;
	let flipFactorH = flipFlagH ? -1 : 1;
	
	let offsetW = marginW * 0.5;
	if (centerFlagW)
	{
		//let usedX = Math.ceil(count / dim.y);
		offsetW += ((1 - marginW) - (dim.x * cellW)) * 0.5;
	}
	let offsetH = marginH * 0.5;
	if (centerFlagH)
	{
		let usedY = Math.ceil(count / dim.x);
		offsetH += ((1 - marginH) - (usedY * cellH)) * 0.5;
	}

	offsetW = flipFlagW ? (1 - offsetW) : offsetW;
	offsetH = flipFlagH ? (1 - offsetH) : offsetH;
	
	for (let j = 0; j < dim.y; ++j)
	{
		rowCols = dim.x;
		
		if (area.areaType === 0)
		{
			if ((j === 0) && ((dim.y * dim.x) > count))
			{
				rowCols = count - (dim.y - 1) * dim.x;
			}
			cellW = (1 - marginW) / rowCols;
			padW = oPadW * rowCols / dim.x;
		}

		for (let i = 0; i < rowCols; ++i)
		{
			if (index >= count) break;
			o = objects[index];
			oIsSelected = bkObjectIsSelected(o);
			
			factorW = oIsSelected ? cellW : cellW * (1 - padW);
			factorH = oIsSelected ? cellH : cellH * (1 - padH);
			
			x = (cellW * flipFactorW * (i + 0.5) + offsetW) * coord.w + coord.x;
			y = (cellH * flipFactorH * (j + 0.5) + offsetH) * coord.h + coord.y;
			w = factorW * coord.w;
			h = factorH * coord.h;
			
			if (updateSizes && (o.coord.type >= 8))
			{
				o.nextCoord = new BkCoord(x, y, w, h, 0, 8);
			}
			else
			{
				delete o.nextCoord;
				o.coord.x = x;
				o.coord.y = y;
				o.coord.w = w;
				o.coord.h = h;
				o.coord.z = 0;
				o.coord.type = 8;
			}
			
			++index;
		}
	}
	
	if (updateSizes)
	{
		for (let i = 0; i < count; ++i)
		{
			objects[i].resize();
		}
	}
}

let __bkSystems = [];

function bkMainUpdateFrame()
{
	for (let i of __bkSystems)
	{
		if (i.redraw)
		{
			i.__draw();
		}
	}

	if (__bkSystems.length <= 0) return;
	
	window.requestAnimationFrame(bkMainUpdateFrame);
}

BkSystem.prototype.doOnClick = function(e)
{
	if (!this._isInteracting)
	{
		if (this.__wasInteracting)
		{
			this.__wasInteracting = false;
			return false;
		}
		
		this.startInteracting();
	}
	
	if (this.onclick) this.onclick();
	return false;
}

BkSystem.prototype.doOnMouseMove = function(e)
{
	let rect = this.canvas.getBoundingClientRect();
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	let mouse = this.mouse;
	mouse.buttons = e.buttons;
	mouse.dx = x - mouse.x;
	mouse.dy = y - mouse.y;
	mouse.x = x;
	mouse.y = y;
	mouse.adx += Math.abs(mouse.dx);
	mouse.ady += Math.abs(mouse.dy);
	
	if (this.onmousehover)
	{
		let hover = this.select(mouse.x, mouse.y);
		if (mouse.hover !== hover)
		{
			mouse.hover = hover;
			this.onmousehover();
		}
	}
	
	if (this.onmousemove) this.onmousemove();
	return false;
}

BkSystem.prototype.doOnMouseEnter = function(e)
{
	let mouse = this.mouse;
	if (e.buttons !== mouse.buttons)
	{
		mouse.selected = null;
	}
	
	if (this.onmouseenter) this.onmouseenter();
	
	return false;
}

BkSystem.prototype.doOnMouseOut = function(e)
{
	let mouse = this.mouse;
	
	if (this.onmousehover)
	{
		if (mouse.hover !== null)
		{
			mouse.hover = null;
			this.onmousehover();
		}
	}
	
	if (this.onmouseout) this.onmouseout();
	
	return false;
}

BkSystem.prototype.doOnMouseUp = function(e)
{
	let rect = this.canvas.getBoundingClientRect();
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	let mouse = this.mouse;
	mouse.x = x;
	mouse.y = y;
	
	let sCoord = this.__screenCoord;
	let sFactor = 1 / (sCoord.x < sCoord.y ? sCoord.x : sCoord.y);
	let dx = (x - mouse.x0) * sFactor;
	let dy = (y - mouse.y0) * sFactor;
	let adx = mouse.adx * sFactor;
	let ady = mouse.ady * sFactor;
	
	mouse.action = 0;
	if (adx * 0.2 >= ady) 
	{
		if (dx >= 0.05)
		{
			mouse.action = 1;
		}
		else if (dx <= -0.05)
		{
			mouse.action = 3;
		}
	}
	else if (ady * 0.2 >= adx) 
	{
		if (dy >= 0.05)
		{
			mouse.action = 4;
		}
		else if (dy <= -0.05)
		{
			mouse.action = 2;
		}
	}
	
	let selected = this.select(mouse.x, mouse.y);
	if (mouse.selected === selected)
	{
		if (selected !== null && selected.onclick)
		{
			selected.onclick(mouse);
		}
	}
	if (selected !== null && selected.onmouseup)
	{
		selected.onmouseup(mouse);
	}
	
	if (this.onmouseup) this.onmouseup();
	
	this.mouse.buttons = 0;
	this.mouse.selected = null;
	return false;
}

BkSystem.prototype.doOnMouseDown = function(e)
{
	let rect = this.canvas.getBoundingClientRect();
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	let mouse = this.mouse;
	mouse.x0 = x
	mouse.y0 = y
	mouse.x = x;
	mouse.y = y;
	mouse.dx = 0;
	mouse.dy = 0;
	mouse.adx = 0;
	mouse.ady = 0;
	mouse.buttons = e.buttons;
	mouse.action = 0;
	
	let selected = this.select(mouse.x, mouse.y);
	if (mouse.selected !== selected)
	{
		mouse.selected = selected;
	}
	if (selected !== null && selected.onmousedown)
	{
		selected.onmousedown(mouse);
	}
	if (this.onmousedown) this.onmousedown();
	
	return false;
}

BkSystem.prototype.doOnContextMenu = function(e)
{
	if (this.oncontextmenu) this.oncontextmenu();
	
	return false;
}

/**
 * Register to resize events and drawing updates
 */
BkSystem.prototype.startDrawing = function()
{
	if (this._isDrawing === true) return;
	this._isDrawing = true;
	
	let first = __bkSystems.length === 0;
	
	window.addEventListener("resize", this.doOnResize.bind(this), false);
	
	this.resize();	
	
	__bkSystems.push(this);
	if (first) bkMainUpdateFrame();
}

BkSystem.prototype.stopDrawing = function()
{
	if (this._isDrawing === false) return;
	this._isDrawing = false;
	
	window.removeEventListener("resize", this.doOnResize.bind(this), false);
	
	let i = __bkSystems.indexOf(this);
	if (i !== -1) __bkSystems.splice(i, 1);
}

/**
 * Start processing input events
 */
BkSystem.prototype.startInteracting = function()
{
	if (this._isInteracting === true) return;
	
	if (this.onmousemove || this.onmousehover)
	{
		this.canvas.onmousemove = this.doOnMouseMove.bind(this);
	}
	this.canvas.onmouseout = this.doOnMouseOut.bind(this);
	this.canvas.onmouseenter = this.doOnMouseEnter.bind(this);
	this.canvas.onmouseup = this.doOnMouseUp.bind(this);
	this.canvas.oncontextmenu = this.doOnContextMenu.bind(this);
	this.canvas.onmousedown = this.doOnMouseDown.bind(this);
	
	this._isInteracting = true;
	if (this.disabledColor != null) this.redraw = true;
}

/**
 * Stop processing input events
 */
BkSystem.prototype.stopInteracting = function()
{
	if (this._isInteracting === false) return;
	this.__wasInteracting = true;
	
	this.canvas.onmousemove = null;
	this.canvas.onmouseout = null;
	this.canvas.onmouseenter = null;
	this.canvas.onmouseup = null;
	this.canvas.oncontextmenu = null;
	this.canvas.onmousedown = null;
	
	this._isInteracting = false;
	if (this.disabledColor != null) this.redraw = true;
}

BkSystem.prototype.__draw = function()
{
	this.redraw = false;
	if ((this.width < 1) || (this.height < 1)) return;
	
	this.ctx.clearRect(0, 0, this.width, this.height);
	if (this.bgImg !== null)
	{
		if (this.bgImgAlpha !== null) this.ctx.globalAlpha = this.bgImgAlpha;
		this.bgImg.drawFit(this.ctx, this.__screenCoord);
		if (this.bgImgAlpha !== null) this.ctx.globalAlpha = 1;
	}
	
	let count = this.item.length;
	
	
	for (let i = 0; i < count; ++i)
	{
		let o = this.item[i];
		if (o.coord.type >= 8 && o.nextCoord !== undefined)
		{
			let nextCoord = o.nextCoord;
			let coord = o.coord;
			
			if ((coord.type !== nextCoord.type) || this.transform.equalCoords(coord, nextCoord))
			{
				o.coord = nextCoord;
				delete o.nextCoord;
			}
			else
			{
				coord.x = coord.x * 0.875 + nextCoord.x * 0.125;
				coord.y = coord.y * 0.875 + nextCoord.y * 0.125;
				coord.w = coord.w * 0.875 + nextCoord.w * 0.125;
				coord.h = coord.h * 0.875 + nextCoord.h * 0.125;
				o.resize();
				this.redraw = true;
			}
		}
		o.draw();
	}
	
	if (!this._isInteracting && this.disabledColor != null)
	{
		this.ctx.fillStyle = this.disabledColor;
		bkFillRect(this.ctx, this.__screenCoord);
	}	
}

BkSystem.prototype.add = function(o)
{ 
	if (this.item.indexOf(o) === -1) this.item.push(o);
}

BkSystem.prototype.remove = function(o)
{ 
	let i = this.item.indexOf(o);
	if (i !== -1) this.item.splice(i, 1);
}

BkSystem.prototype.addArea = function(o)
{ 
	let index = this.area.indexOf(o);
	if (index === -1)
	{
		index = this.area.length;
		this.area.push(o);
	}
	return index;
}

BkSystem.prototype.removeAllAreas = function()
{
	this.area = [];
}

BkSystem.prototype.moveToTail = function(o)
{
	if (o === null) return;

	let i = this.item.indexOf(o);
	if (i < 0) return;

	this.item.splice(i, 1);
	this.item.push(o);
}

BkSystem.prototype.bringToFront = function(o)
{
	this.moveToTail(o);
}

BkSystem.prototype.undock = function(o)
{
	if (o === null) return false;
	
	if (!o.area) return false;
	
	o.area = null;
	o.coord = o.coord.toAbsolute(this.transform);
	this.redistribute();
	return true;
}

BkSystem.prototype.dockToArea = function(o, x, y)
{
	if (o === null) return false;

	let p = new BkCoord(x, y).fromScreen(this.transform);

	let count = this.area.length;
	for (let i = count - 1; i >= 0; --i)
	{
		let c = this.area[i].coord;
		if (c.type !== 0)
		{
			c = c.toAbsolute(this.transform);
		}
		
		if ((p.x >= (c.x - c.w * 0.5)) && (p.x < (c.x + c.w * 0.5)) &&
			(p.y >= (c.y - c.h * 0.5)) && (p.y < (c.y + c.h * 0.5)))
		{
			o.area = this.area[i];
			this.redistribute();
			return true;
		}
	}

	return false;
}

BkSystem.prototype.select = function(x, y)
{ 
	let count = this.item.length;
	if (count <= 0) return null;
	
	let p = new BkCoord(x, y).fromScreen(this.transform);
	for (let i = count - 1; i >= 0; --i)
	{
		let c = this.item[i].coord;
		if (c.type !== 0)
		{
			c = c.toAbsolute(this.transform);
		}
		
		if ((p.x >= (c.x - c.w * 0.5)) && (p.x < (c.x + c.w * 0.5)) &&
			(p.y >= (c.y - c.h * 0.5)) && (p.y < (c.y + c.h * 0.5)))
		{
			return this.item[i];
		}
	}

	return null;
}

BkSystem.prototype.move = function(o, dx, dy)
{ 
	if (o === null) return false;
	
	let coord = o.coord;
	if (coord.type !== 0) return false;
	
	let d = this.transform.screenToAbsoluteDelta(dx, dy);
	coord.x += d.dx;
	coord.y += d.dy;
	return true;
}

BkSystem.prototype.writeToScreenXY = function(text, x, y)
{
	this.ctx.textAlign = "left";
	this.ctx.textBaseline = "top";
	this.ctx.font = "12px Serif";
	this.ctx.fillStyle = "#000";
	this.ctx.fillText(text, x, y);
}

BkSystem.prototype.writeToScreen = function(text)
{
	this.writeToScreenXY(text, 2, 10);
}

Image.prototype.drawFit = function(ctx, coord)
{
	try
	{
		let w = this.width;
		let h = this.height;
		let f = ((w * coord.h) > (coord.w * h)) ?
			(coord.w / this.width) : (coord.h / this.height);
		w *= f;
		h *= f;
		ctx.drawImage(this, 0, 0, this.width, this.height,
			coord.x - w * 0.5, coord.y - h * 0.5,
			w, h);
	}
	catch(err)
	{
	}
}

Image.prototype.draw = function(ctx, coord)
{
	try
	{
		ctx.drawImage(this, 0, 0, this.width, this.height,
			coord.x - coord.w * 0.5, coord.y - coord.h * 0.5,
			coord.w, coord.h);
	}
	catch(err)
	{
	}
}

Image.prototype.drawFill = function(ctx, coord)
{
	try
	{
		let x = 0;
		let y = 0;
		let w = this.width;
		let h = this.height;
		if ((w * coord.h) < (coord.w * h))
		{
			h = (w * coord.h) / coord.w;
			y = (this.height - h) * 0.5;
		}
		else
		{
			w = (h * coord.w) / coord.h;
			x = (this.width - w) * 0.5;
		}
		
		ctx.drawImage(this, x, y, w, h,
			coord.x - coord.w * 0.5, coord.y - coord.h * 0.5,
			coord.w, coord.h);
	}
	catch(err)
	{
	}
}

// The following functions only use screen coordinates
function bkFillRect(ctx, coord)
{
	ctx.fillRect(coord.x - coord.w * 0.5, coord.y - coord.h * 0.5, coord.w, coord.h);
}

function bkDrawRoundRectangle(ctx, coord, relRadius)
{
	let w = coord.w;
	let h = coord.h;
	let x = coord.x - w * 0.5;
	let y = coord.y - h * 0.5;
	let r = (w < h ? w : h) * relRadius;

	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}

function bkDrawGlassButton(ctx, coord, color, drawFlat = false, relRadius = 0.125)
{
	let lighterColor = bkColorLighten(color);
	let darkColorStr = bkColorToStr(bkColorDarken(color));
	let colorStr = bkColorToStr(color);
	let lighterColorStr = bkColorToStr(lighterColor);
	let x = coord.x + coord.w * 0.5;
	let y = coord.y + coord.h * 0.5;
	let grad;
	if (drawFlat)
	{
		ctx.lineWidth = (coord.w < coord.h ? coord.w : coord.h) * 0.06;
		grad = colorStr;
	}
	else
	{
		ctx.lineWidth = coord.w * 0.04;
		let lightColorStr = bkColorToStr(bkColorMix(lighterColor, color));
		grad = ctx.createLinearGradient(x, y - coord.h, x, y);
		grad.addColorStop(0, lighterColorStr);
		grad.addColorStop(0.1, colorStr);
		grad.addColorStop(0.3, lightColorStr);
		grad.addColorStop(0.33, darkColorStr);
		grad.addColorStop(0.5, colorStr);
		grad.addColorStop(0.85, colorStr);
		grad.addColorStop(1, lighterColorStr);
	}
	
	ctx.fillStyle = grad;
	bkDrawRoundRectangle(ctx, coord, relRadius);
	ctx.fill();
	ctx.save();
	ctx.clip();
	
	grad = ctx.createLinearGradient(
		coord.x - coord.w * 0.5,
		coord.y - coord.h * 0.5,
		coord.x + coord.w * 0.5,
		coord.y + coord.h * 0.5);
	grad.addColorStop(0, colorStr);
	grad.addColorStop(0.15, lighterColorStr);
	grad.addColorStop(0.2, '#fff');
	grad.addColorStop(0.25, lighterColorStr);
	grad.addColorStop(0.5, colorStr);
	grad.addColorStop(0.7, darkColorStr);
	grad.addColorStop(0.8, colorStr);
	grad.addColorStop(0.85, lighterColorStr);
	grad.addColorStop(0.9, '#fff');
	grad.addColorStop(0.95, lighterColorStr);
	grad.addColorStop(1, colorStr);

	ctx.strokeStyle = grad;
	bkDrawRoundRectangle(ctx, coord, relRadius);
	ctx.stroke();
	
	ctx.restore();
}

function _bkDrawGlassScrew(ctx, x, y, r)
{
	ctx.translate(x, y);
	ctx.beginPath();
	ctx.arc(0, 0, r, 0, 2 * Math.PI);
	ctx.fill();
	ctx.translate(-x, -y);
}

function bkDrawShadowCircle(ctx, coord, blur, col)
{
	let fadeCol = col & 0xFFFFFF;
	let fade13Col = bkColorMix31(col, fadeCol);
	let fade31Col = bkColorMix31(fadeCol, col);
	
	let colStr = bkColorToStr(col);
	let fade13Str = bkColorToStr(fade13Col);
	let fade31Str = bkColorToStr(fade31Col);
	let fadeStr = bkColorToStr(fadeCol);

	let x = coord.x;
	let y = coord.y;
	let r = (coord.w < coord.h ? coord.w : coord.h) * 0.5;
	let grad = ctx.createRadialGradient(
		x, y, r * (1 - blur), x, y, r);
	grad.addColorStop(0, colStr);
	grad.addColorStop(0.2, fade13Str);
	grad.addColorStop(0.6, fade31Str);
	grad.addColorStop(1, fadeStr);
	ctx.fillStyle = grad;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.fill();
}

function bkDrawShadowRect(ctx, coord, blur, col)
{
	let colStr = bkColorToStr(col);
	let fade = bkColorToStr(col & 0xFFFFFF);
	let w = coord.w;
	let h = coord.h;
	if (blur > 1)
	{
		w += blur;
		h += blur;
	}
	else
	{
		blur *= (w < h ? w : h);
	}
	let x0 = coord.x - w * 0.5;
	let y0 = coord.y - h * 0.5;
	
	let x1 = x0 + w;
	let y1 = y0 + h;
	let blur2 = blur * 2;
	
	ctx.fillStyle = colStr;
	ctx.fillRect(x0 + blur, y0 + blur, w - blur2, h - blur2);
	
	let grad = ctx.createLinearGradient(
		0, y0, 0, y0 + blur);
	grad.addColorStop(0, fade);
	grad.addColorStop(1, colStr);
	
	ctx.fillStyle = grad;
	ctx.fillRect(x0 + blur, y0, w - blur2, blur);
	
	grad = ctx.createLinearGradient(
		0, y1 - blur, 0, y1);
	grad.addColorStop(0, colStr);
	grad.addColorStop(1, fade);
	
	ctx.fillStyle = grad;
	ctx.fillRect(x0 + blur, y1 - blur, w - blur2, blur);
	
	grad = ctx.createLinearGradient(
		x0, 0, x0 + blur, 0);
	grad.addColorStop(0, fade);
	grad.addColorStop(1, colStr);
	
	ctx.fillStyle = grad;
	ctx.fillRect(x0, y0 + blur, blur, h - blur2);
	
	grad = ctx.createLinearGradient(
		x1 - blur, 0, x1, 0);
	grad.addColorStop(0, colStr);
	grad.addColorStop(1, fade);

	ctx.fillStyle = grad;
	ctx.fillRect(x1 - blur, y0 + blur, blur, h - blur2);
	
	let x = x0 + blur;
	let y = y0 + blur;
	
	grad = ctx.createRadialGradient(x, y, 0, x, y, blur)
	grad.addColorStop(0, colStr);
	grad.addColorStop(1, fade);
	ctx.fillStyle = grad;
	ctx.fillRect(x - blur, y - blur, blur, blur);
	
	y = y1 - blur;
	
	grad = ctx.createRadialGradient(x, y, 0, x, y, blur)
	grad.addColorStop(0, colStr);
	grad.addColorStop(1, fade);
	ctx.fillStyle = grad;
	ctx.fillRect(x - blur, y, blur, blur);
	
	x = x1 - blur;
	
	grad = ctx.createRadialGradient(x, y, 0, x, y, blur)
	grad.addColorStop(0, colStr);
	grad.addColorStop(1, fade);
	ctx.fillStyle = grad;
	ctx.fillRect(x, y, blur, blur);
	
	y = y0 + blur;
	
	grad = ctx.createRadialGradient(x, y, 0, x, y, blur)
	grad.addColorStop(0, colStr);
	grad.addColorStop(1, fade);
	ctx.fillStyle = grad;
	ctx.fillRect(x, y - blur, blur, blur);
}

function bkDrawGlassBoard(ctx, coord, col, drawShadow = false, plainColor = false)
{
	let innerCoord = coord.growScaleMin(0.98);
	let lineWidth = (coord.w < coord.h) ? (coord.w - innerCoord.w) : (coord.h - innerCoord.h);
	
	let darkerCol = bkColorDarken(col);
	let darkCol = bkColorMix(darkerCol, col);
	let color = bkColorToStr(col);
	let lightCol = bkColorLighten(col);
	let lighterColor = bkColorToStr(lightCol);
	let darkColor = bkColorToStr(darkCol);
	let darkerColor = bkColorToStr(darkerCol);
	
	if (drawShadow)
	{
		let sCoord = coord.clone();
		sCoord.x += lineWidth * 2;
		sCoord.y += lineWidth * 2;
		bkDrawShadowRect(ctx, sCoord, 0.03, bkShadowColor(col));
	}
	
	let x = coord.x;
	let y = coord.y;
	let w = coord.w;
	let h = coord.h;
	let x0 = x - w * 0.5;
	let y0 = y - h * 0.5;
	let m = w < h ? w : h;
	let grd=ctx.createLinearGradient(x0,y0,x0 + w,y0 + h);
	
	grd.addColorStop(0,darkerColor);
	grd.addColorStop(0.1,color);
	grd.addColorStop(0.13,lighterColor);
	grd.addColorStop(0.15,"#fff");
	grd.addColorStop(0.17,lighterColor);
	grd.addColorStop(0.2,color);
	grd.addColorStop(0.5,darkerColor);
	grd.addColorStop(0.6,color);
	grd.addColorStop(0.63,lighterColor);
	grd.addColorStop(0.65,"#fff");
	grd.addColorStop(0.67,lighterColor);
	grd.addColorStop(0.7,color);
	grd.addColorStop(1,darkerColor);

	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = grd;
	
	ctx.beginPath();
	ctx.rect(coord.x - coord.w * 0.5 + lineWidth * 0.5,
		coord.y - coord.h * 0.5 + lineWidth * 0.5,
		coord.w - lineWidth, coord.h - lineWidth);
	ctx.stroke();
	
	let lightColor;
	let grad;
	if (!plainColor)
	{
		lightColor = bkColorToStr(bkColorMix31(col, lightCol));
		grad=ctx.createRadialGradient(x - w,y - h * 0.3,0,x - w,y - h * 0.3,w * 2);
		grad.addColorStop(0,color);
		grad.addColorStop(0.45,lightColor);
		grad.addColorStop(0.455,darkerColor);
		grad.addColorStop(1,color);
		ctx.fillStyle = grad;
	}
	else
	{
		ctx.fillStyle = color;
	}
	
	ctx.beginPath();
	ctx.rect(innerCoord.x - innerCoord.w * 0.5,
		innerCoord.y - innerCoord.h * 0.5,
		innerCoord.w, innerCoord.h);
	ctx.fill();
	
	if (!plainColor)
	{
		ctx.globalAlpha = 0.5;
		grad=ctx.createRadialGradient(x + w * 0.1,y + h * 2,0,x + w * 0.1,y + h * 2,h * 3);
		grad.addColorStop(0.6,color);
		grad.addColorStop(0.75,darkerColor);
		grad.addColorStop(0.755,lightColor);
		grad.addColorStop(1,color);
		

		ctx.fillStyle = grad;
		ctx.beginPath();
		ctx.rect(innerCoord.x - innerCoord.w * 0.5,
			innerCoord.y - innerCoord.h * 0.5,
			innerCoord.w, innerCoord.h);
		ctx.fill();
		ctx.globalAlpha = 1;
	}
	
	grad = ctx.createLinearGradient(
		 - lineWidth,  - lineWidth,  + lineWidth,  + lineWidth);
	grad.addColorStop(0.2, lighterColor);
	grad.addColorStop(0.35, color);
	grad.addColorStop(0.8, darkerColor);
	ctx.fillStyle = grad;

	let c = coord.growScaleMin(0.9);
	_bkDrawGlassScrew(ctx, c.x - c.w * 0.5, c.y - c.h * 0.5, lineWidth);
	_bkDrawGlassScrew(ctx, c.x + c.w * 0.5, c.y - c.h * 0.5, lineWidth);
	_bkDrawGlassScrew(ctx, c.x - c.w * 0.5, c.y + c.h * 0.5, lineWidth);
	_bkDrawGlassScrew(ctx, c.x + c.w * 0.5, c.y + c.h * 0.5, lineWidth);
}

function _bkSplitText(text)
{
	let result = [];
	let endLine = true;
	let count = text.length;
	let i = 0;
	let start;
	while (i < count)
	{
		start = i;
		while (text[i] === ' ')
		{
			++i;
			if (i >= count)
			{
				return result;
			}
		}
		
		if (endLine)
		{
			endLine = false;
		}
		else if (start < i)
		{
			// Avoid consuming space after end line
			++start;
		}
		
		while ((text[i] !== ' ') && (text[i] !== '\n')) 
		{
			++i;
			if (i >= count)
			{
				result.push(text.substring(start, i));
				return result;
			}
		}
		
		if (text[i] === '\n')
		{
			endLine = true;
			++i;
		}
		else
		{
			// detect case: '   \n'
			let j = i + 1;
			while ((j < count) && (text[j] === ' '))
			{
				++j;
			}
			
			if (text[j] === '\n')
			{
				result.push(text.substring(start, i) + '\n');
				i = j + 1;
				continue;
			}
		}
		
		result.push(text.substring(start, i));
	}
	return result;
}

function _bkCountRightSpaces(text)
{
	let i = text.length - 1;
	while (i >= 0)
	{
		let c = text[i];
		if ((c !== ' ') && (c !== '\n') && (c !== '\r') && (c !== '\t'))
		{
			break;
		}
		--i;
	}
	return text.length - (i + 1);
}

function _bkSetFlagsFixWords(flags, words)
{
	let count = words.length;
	for (let i = 0; i < count; ++i)
	{
		let spaceCount = _bkCountRightSpaces(words[i]);
		if (spaceCount > 0)
		{
			flags[i] = 1;
			words[i] = words[i].slice(0, -spaceCount);
		}
		else
		{
			flags[i] = 0;
		}
	}
}

/**
 * Just one text line resized to fit in coord.
 * Text can be changed at any time.
 */
let BkText = function(coord, text, fontName, alignment = 4)
{
	this.fontName = fontName;
	this.alignment = alignment;
	this.fontHeight = null;
	this.__oldText = null;
	// relative to the coord to provide when drawing
	this.coord = coord;
	this.text = text;
}

BkText.prototype.resize = function()
{
	this.__oldText = null;
}

BkText.prototype.draw = function(ctx, screenCoord, border = null)
{
	if (this.text.length <= 0) return;
	
	let coord = this.coord.toScreenCoord(screenCoord);
	let done = this.__oldText === this.text;
	if (!done)
	{
		this.fontHeight = coord.h;
		this.__oldText = this.text;
	}

	for(;;)
	{
		if (this.fontHeight < 1) return;
		
		ctx.font = this.fontHeight.toString() + 'px ' + this.fontName;
		
		if (done) break;
		
		let tw = ctx.measureText(this.text).width;
		if (coord.w >= tw) break;
		
		this.fontHeight *= coord.w / tw;
		done = true;
	}

	_bkDrawTextLines(ctx, [this.text], coord, this.fontHeight, this.alignment, border);
}

/**
 * Several text lines auto distributed and resized to fit inside coord.
 * Doesn't allow text changes.
 * @param fontHeight From 0 to 1: Maximum of area height
 *                   Above 1: Maximum height in pixels
 * @param alignment Nine available [0..8] from top left to bottom right.
 *                  Flag: 0x10 Pad when not horizontally centered.
 *                  Flag: 0x100 Avoid non symmetric two lines 
 * @param leadingFactor Spacing between lines, multiplied by font height gives
 *                      the line height.
 */
let BkTextArea = function(coord, text, fontName, fontHeight = 0.5,
	alignment = 4, leadingFactor = 1.2)
{
	this.lines = [];
	this.fontName = fontName;
	this.fontHeight = fontHeight;
	this.alignment = alignment;
	// relative to the coord to provide when drawing
	this.coord = coord;
	this.leadingFactor = leadingFactor;
	this.padding = 0;
	this._currentFontHeight = null;
	this._requiresResize = true;
	
	this.words = _bkSplitText(text);
	{
		let count = this.words.length;
		this.__flagsBuffer = new ArrayBuffer(count);
		this.__flags = new Uint8Array(this.__flagsBuffer);
		_bkSetFlagsFixWords(this.__flags, this.words);
		
		this.text = this.words.join(' ');
		this.__endPositionBuffer = new ArrayBuffer(count * 4);
		this.__endPosition = new Int32Array(this.__endPositionBuffer);
		this.__textWidthBuffer = new ArrayBuffer(count * 2);
		this.__textWidth = new Int16Array(this.__textWidthBuffer);
		this.__spaceWidth = 0;
		this.__measuredFontHeight = null;
		this.__measuredW = 0.01;
		this.__measuredH = 0.01;
		this.__linesIndexesBuffer = new ArrayBuffer(count * 4);
		this.__linesIndexes = new Int16Array(this.__linesIndexesBuffer);
		this.__linesIndexesUsed = 0;

		let index = 0;
		for (let i = 0; i < count; ++i)
		{
			index += this.words[i].length;
			this.__endPosition[i] = index;
			++index;
		}
	}
}

BkTextArea.prototype.resize = function()
{
	this._requiresResize = true;
}

BkTextArea.prototype.defineLines = function(maxWidth, fontHeight)
{
	maxWidth *= this.__measuredFontHeight / fontHeight;
	
	let prevlineWidth, lineWidth, usedWords;
	let spaceWidth = this.__spaceWidth;
	let maxLineWidth = 0;
	let baseIndex = 0;
	let linesCount = 0;
	let done = false;
	let count = this.words.length;
	while (baseIndex < count)
	{
		lineWidth = 0;
		usedWords = 0;
		do
		{
			prevlineWidth = lineWidth;
			if (usedWords !== 0)
			{
				if (this.__flags[baseIndex + usedWords - 1])
				{
					break;
				}
			}
			
			if (baseIndex + usedWords >= count)
			{
				done = true;
				break;
			}
			
			if (usedWords !== 0) lineWidth += spaceWidth;
			lineWidth += this.__textWidth[baseIndex + usedWords];
			++usedWords;
		}
		while (lineWidth < maxWidth);
		
		if ((usedWords > 1) && !done)
		{
			if (lineWidth >= maxWidth)
			{
				lineWidth = prevlineWidth;
				--usedWords;
			}
		}
		
		this.__linesIndexes[linesCount++] = baseIndex + usedWords - 1;
		
		baseIndex += usedWords;
		if (maxLineWidth < lineWidth)
		{
			maxLineWidth = lineWidth;
		}
	}
	
	this.__linesIndexesUsed = linesCount;
	this.padding = 1 - maxLineWidth / maxWidth;
	return fontHeight * (this.leadingFactor * (this.__linesIndexesUsed - 1) + 1);
}

BkTextArea.prototype._getLineWidthRelative = function(index)
{
	let wordStart = index ? (this.__linesIndexes[index - 1] + 1) : 0;
	let wordEnd = this.__linesIndexes[index];
	let lineWidth = 0;
	
	for (let i = wordStart; i <= wordEnd; ++i)
	{	
		if (i > wordStart) lineWidth += this.__spaceWidth;
		lineWidth += this.__textWidth[i];
	}
	return lineWidth;
}

// Returns line width for font height = this.__measuredFontHeight
BkTextArea.prototype._getLineWidth = function(index)
{
	let wordStart = index ? (this.__linesIndexes[index - 1] + 1) : 0;
	let wordEnd = this.__linesIndexes[index];
	let lineWidth = 0;
	
	for (let i = wordStart; i <= wordEnd; ++i)
	{	
		if (i > wordStart) lineWidth += this.__spaceWidth;
		lineWidth += this.__textWidth[i];
	}
	
	return lineWidth;
}

BkTextArea.prototype.__measureText = function(ctx, fontHeight, precision)
{
	if (Math.abs(fontHeight - this.__measuredFontHeight) < 0.1) return;
	
	ctx.font = fontHeight.toString() + 'px ' + this.fontName;
	
	// Check if measure is necessary
	let oldSampleWidth = this.__textWidth[0];
	let sampleWidth = ctx.measureText(this.words[0]).width;

	if ((this.__measuredFontHeight !== null) &&
		(fontHeight > 16) && (this.__measuredFontHeight > 16) &&
		(Math.floor(precision * oldSampleWidth / this.__measuredFontHeight) ===
			Math.floor(precision * sampleWidth / fontHeight))) return;

	this.__textWidth[0] = sampleWidth;
	
	// Measure each word
	const wordCount = this.words.length;
	for (let i = 1; i < wordCount; ++i)
	{
		this.__textWidth[i] = ctx.measureText(this.words[i]).width;
	}
	this.__spaceWidth = ctx.measureText(' ').width;
	this.__measuredFontHeight = fontHeight;
}

BkTextArea.prototype.adjustLines = function(ctx, desiredWidth, desiredHeight)
{
	this._requiresResize = false;
	
	if ((this.words.length <= 0) || (desiredHeight < 1))
	{
		this._currentFontHeight = 0;
		return;
	}
	
	if (this._currentFontHeight !== null) 
	{
		// Not necessary if dimensions change less than one pixel
		if (Math.abs(this.__measuredW - desiredWidth) < 1 && 
			Math.abs(this.__measuredH - desiredHeight) < 1)
		{
			return;
		}
	}

	/**************************************************************************/
	// Guessing the biggest font height without overflowing the target area
	/**************************************************************************/
	let h = Math.sqrt((desiredWidth * desiredHeight * 1.618) / this.text.length);
	if (h < 1)
	{
		this._currentFontHeight = 0;
		return;
	}
	let epsilon = 0.5;
	let minh = 0;
	let maxh = this.fontHeight * (this.fontHeight > 1 ? 1 : desiredHeight);
	
	let useSqrtApproximation = true;
	let besth = null;
	let minimumError = desiredHeight;
	let e, e0, h0, th, de, dh, adh, h_a, h_b;
	
	if (h > maxh) h = maxh;
	this.__measureText(ctx, h, 128);
	th = this.defineLines(desiredWidth, h);
	
	for (let i = 4;; --i)
	{
		// Verify if there is a word that couldn't fit in width
		if (this.padding < 0)
		{
			h /= 1 - this.padding;
			if (h < 1) break;
			
			if (h > maxh) h = maxh;
			this.__measureText(ctx, h, 1024);
			th = this.defineLines(desiredWidth, h);
			
			// Check if fits
			if (th <= desiredHeight)
			{
				if (this.padding < 0)
				{
					--h;
					this.__measureText(ctx, h, 1024);
					th = this.defineLines(desiredWidth, h);
				}
				else if (h <= 16)
				{
					// Last calculation may shrink small fonts far than necessary
					++h;
					if (h > maxh) h = maxh;
					
					this.__measureText(ctx, h, 1024);
					th = this.defineLines(desiredWidth, h);

					if ((this.padding < 0) || (th > desiredHeight))
					{
						--h;
						this.__measureText(ctx, h, 1024);
						this.defineLines(desiredWidth, h);
					}
				}
				besth = h;
				break;
			}
			maxh = h - epsilon;
		}

		e0 = e;
		e = th - desiredHeight;

		if (e <= 0)
		{
			if (-e < minimumError)
			{
				// We need the negative closer to zero
				besth = h;
				minimumError = -e;
				// Stop if we got lucky
				if (e === 0) break;
			}
		}
		if (i <= 0) break;
		
		if (e < 0) minh = h + epsilon;
		if (e > 0) maxh = h - epsilon;
		if (minh >= maxh) break;
		
		if (useSqrtApproximation)
		{
			// Second guess
			h0 = h;
			h *= Math.sqrt(desiredHeight / th);
			if (h > maxh) h = maxh;
			if (h < minh) h = minh;
			useSqrtApproximation = false;
		}
		else
		{
			// Third and later guesses
			dh = h - h0;
			de = e - e0;

			h0 = h;
			if (de === 0)
			{
				h_a = (minh + maxh) * 0.5;
				adh = Math.abs(dh);
				h_b = h + (e < 0) ? adh : -adh;
				if (h_b > maxh) h_b = maxh;
				if (h_b < minh) h_b = minh;
				h = (Math.abs(h_a - h) < Math.abs(h_b - h)) ? h_a : h_b;
			}
			else
			{
				h -= e * (dh / de);
				if (h > maxh) h = maxh;
				if (h < minh) h = minh;
			}
		}
		
		this.__measureText(ctx, h, 8192 >> (i * 2));
		th = this.defineLines(desiredWidth, h);
	}
	if ((besth !== null) && (besth !== h))
	{
		h = besth;
		this.__measureText(ctx, h, 8192);
		this.defineLines(desiredWidth, h);
	}
	if (h < 1)
	{
		this._currentFontHeight = 0;
		return;
	}
	this._currentFontHeight = h;
	/**************************************************************************/
	
	// Fix ugly two lines for centred and left padding alignments
	if ((this.__linesIndexesUsed == 2) && (this.alignment & 0x100))
	{
		while (this.__linesIndexes[0] >= 1)
		{
			if (this._getLineWidth(0) > this._getLineWidth(1) * 1.5)
			{
				--this.__linesIndexes[0];
				if (this._getLineWidth(0) > this._getLineWidth(1) * 0.8)
				{
					continue;
				}
				++this.__linesIndexes[0];
			}
			break;
		}
		// Fix padding when matters
		if (this.alignment & 0x10)
		{
			let w0 = this._getLineWidth(0);
			let w1 = this._getLineWidth(1);
			this.padding = 1 - (w0 > w1 ? w0 : w1) * h / (this.__measuredFontHeight * desiredWidth);
		}
	}
	
	let endPos = this.__endPosition;
	let text = this.text;
	let lines = [];
	for (let i = 0; i < this.__linesIndexesUsed; ++i)
	{
		lines.push(text.substring(
			(i === 0 ? 0 : endPos[this.__linesIndexes[i - 1]] + 1), 
			endPos[this.__linesIndexes[i]]));
	}

	this.__measuredW = desiredWidth;
	this.__measuredH = desiredHeight
	this.lines = lines;
}

BkTextArea.prototype.draw = function(ctx, screenCoord, border = null)
{
	if (this.words.length <= 0) return;
	
	let coord = this.coord.toScreenCoord(screenCoord);
	if (this._requiresResize) this.adjustLines(ctx, coord.w, coord.h);
	let fontH = this._currentFontHeight;
	
	if (fontH < 1) return;
	
	ctx.font = fontH.toString() +'px ' + this.fontName;
	_bkDrawTextLines(ctx, this.lines, coord, fontH, this.alignment, border, this.padding, this.leadingFactor);
}

function _bkDrawTextLines(ctx, lines, coord, fontH, alignment, border, padding = 0, leadingFactor = 1)
{
	let maxLines = lines.length;
	let lineHeight = fontH * leadingFactor;
	let x, y;
	
	// Firefox and Chrome agree on alphabetic
	ctx.textBaseline = 'alphabetic';

	// Get flags information
	padding = (alignment & 0x10) ? padding * coord.w : 0;
	
	// Remove flags
	alignment &= 0xF;
	
	// Horizontal alignment
	x = coord.x;
	let hAlignment = alignment % 3;
	switch(hAlignment)
	{
	case 1:
		ctx.textAlign = 'center';
		break;
	case 0:
		ctx.textAlign = 'left';
		x += (padding - coord.w) * 0.5;
		break;
	case 2:
		ctx.textAlign = 'right';
		x += (coord.w - padding) * 0.5;
		break;
	}

	// Adjusting to middle from alphabetic
	y = coord.y + fontH * 0.35;
	
	// Vertical alignment
	switch(alignment - hAlignment)
	{
	case 0:
		y += (fontH - coord.h) * 0.5;
		break;
	case 3:
		y += lineHeight * (1 - maxLines) * 0.5;
		break;
	case 6:
		y += (coord.h - fontH) * 0.5 + lineHeight * (1 - maxLines);
		break;
	}

	// Draw text border
	if ((border !== null) && (fontH >= 4))
	{
		if (fontH < 60)
		{
			let oldStyle = ctx.fillStyle;
			ctx.fillStyle = border;
			let amount = fontH < 30 ? 1 : 1.45;
			for (let i = 0; i < maxLines; ++i)
			{
				let py = y + lineHeight * i;
				ctx.fillText(lines[i], x + amount, py);
				ctx.fillText(lines[i], x - amount, py);
				ctx.fillText(lines[i], x, py + amount);
				ctx.fillText(lines[i], x, py - amount);
			}
			ctx.fillStyle = oldStyle;
		}
		else
		{
			ctx.lineWidth = (fontH >= 100) ? 4 : (fontH * 0.04);
			ctx.strokeStyle = border;
			for (let i = 0; i < maxLines; ++i)
			{
				ctx.strokeText(lines[i], x, y + lineHeight * i);
			}
		}
	}
	
	for (let i = 0; i < maxLines; ++i)
	{
		ctx.fillText(lines[i], x, y + lineHeight * i);
	}
}