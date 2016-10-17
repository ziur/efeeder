'use strict';

let BkTransform = function(width, height, ratio = 1)
{
	this.resize(width, height, ratio);
}

BkTransform.prototype.resize = function(width, height, ratio)
{
	this.dx = Math.floor(width * 0.5);
	this.dy = Math.floor(height * 0.5);
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
		let sm = sw < sh ? sw : sh;
		let w = this.w;
		let h = this.h;
		return new BkCoord(
			(this.x + ((this.x < 0) ? (sw / sm - w * 0.5) : (w * 0.5))) * sm,
			(this.y + ((this.y < 0) ? (sh / sm - h * 0.5) : (h * 0.5))) * sm,
			w * sm,
			h * sm,
			this.z);
	}
	else if (this.type === 7)
	{
		let sw = transform.dx * 2;
		let sh = transform.dy * 2;
		let w = this.w;
		let h = this.h;
		return new BkCoord(
			(this.x + ((this.x < 0) ? (1 - w * 0.5) : (w * 0.5))) * sw,
			(this.y + ((this.y < 0) ? (1 - h * 0.5) : (h * 0.5))) * sh,
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
		let h = this.h;
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
		let w = this.w;
		let h = this.h;

		return new BkCoord(
			(this.x + ((this.x < 0) ? (1 - w * 0.5) : (w * 0.5)) - 0.5) * sw,
			(this.y + ((this.y < 0) ? (1 - h * 0.5) : (h * 0.5)) - 0.5) * sh,
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

BkCoord.prototype.anisotropicGrow = function(scale)
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
	r = Math.floor(r * factor);
	g = Math.floor(g * factor);
	b = Math.floor(b * factor);
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

let BkArea = function(coord, ratio = 1, type = 0, padding = 0.04)
{
	this.coord = coord;
	this.ratio = ratio;
	this.padding = padding;
	// Type 0: Cover all the area, follow the ratio when possible.
	// Type 1: Follow the ratio but cover at least 25% of the area.
	// Type 2: Mandatory ratio, align to top left.
	// Type 3: Mandatory ratio, align to bottom right.
	this.__type = type;
}

let BkSystem = function(canvasName, ratio = null)
{
	this.item = [];
	this.area = [];
	this.__running = false;
	this.transform = new BkTransform(1, 1);
	this.canvas = document.getElementById(canvasName);
	this.ctx = this.canvas.getContext('2d');
	this.ratio = (ratio !== null) ? ratio : (window.screen.width / window.screen.height);

	this.redraw = false;
	this.mouse = {
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
	this.resize();
};

BkSystem.prototype.resize = function()
{
	this.width = this.canvas.clientWidth;
	this.height = this.canvas.clientHeight;
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	this.__screenCoord = new BkCoord(this.width * 0.5, this.height * 0.5, this.width, this.height);

	this.transform.resize(this.width, this.height, this.ratio);
	
	this.redistribute(false);
	
	// Execute custom resize for each UI object
	let count = this.item.length;
	for (let i = 0; i < count; ++i)
	{
		this.item[i].resize();
	}

	this.draw();
}

function bkOnImageLoad()
{
	this.bkSystem.redraw = true;
	this.isReady = true;
}

BkSystem.prototype.createImage = function(src)
{
	if ((src === null) || (0 === src.length)) return null;
	let img = new Image();
	img.src = src;
	img.bkSystem = this;
	img.isReady = false;
	img.addEventListener("load", bkOnImageLoad.bind(img), false);
	return img;
}

BkSystem.prototype.setImage = function(object, src, propertyName = 'img')
{
	// If property is undefined, null or src doesn't math with the new src
	if ((object[propertyName] == null) || (object[propertyName].src !== src))
	{
		object[propertyName] = this.createImage(src);
	}
}

BkSystem.prototype.setBackgroundImage = function(src, alpha = null)
{
	this.bgImg = this.createImage(src);
	this.bgImgAlpha = alpha;
}

function _bkGetDivisorsForRatio(n, ratio) 
{
	if (n <= 1) return {w:1, h:1};
		
	let sqrtN = Math.sqrt(n);
	let sqrtInvRatio = Math.sqrt(1 / ratio);
	let w = sqrtN * sqrtInvRatio * ratio;
	let h = sqrtN * sqrtInvRatio;
	
	w = Math.floor(w);
	h = Math.floor(h);
	
	if (w < 1) 
	{
		return {w:1, h:n};
	}
	if (h < 1) 
	{
		return {w:n, h:1};
	}
	
	if (w * h < n)
	{
		if (ratio > 1)
		{
			++w;
			if ((h * w) < n)
			{
				--w;
				++h;
				if ((h * w) < n)
				{
					++w;
				}
			}
		}
		else
		{
			++h;
			if ((h * w) < n)
			{
				--h;
				++w;
				if ((h * w) < n)
				{
					++h;
				}
			}
		}
	}
	
	while ((h * w) >= (n + w))
	{
		--h;
	}
	
	while ((h * w) >= (n + h))
	{
		--w;
	}	

	return {w:w, h:h};
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
	// We need coordinates in the [0..1[ range
	coord = area.coord;
	let padding = area.padding * (sw < sh ? sw : sh);
	let padH = padding / sh;
	let padW = padding / sw;
	let cellH, cellW;
	let dim;
	if (area.__type <= 1)
	{
		dim = _bkGetDivisorsForRatio(count, sw / (sh * area.ratio));
		if (area.__type === 1)
		{
			let cellRatio = (sw * dim.h) / (sh * dim.w);
			if ((dim.w === 1) && (cellRatio < area.ratio))
			{
				let n = Math.floor(area.ratio * sh / sw);
				if (n > dim.h)
				{
					if (n - dim.h > 3) n = dim.h + 3;
					dim.h = n;
				}
			}
			
			if ((dim.h === 1) && (cellRatio > area.ratio))
			{
				let n = Math.floor(sw / (area.ratio * sh))
				if (n > dim.w)
				{
					if (n - dim.w > 3) n = dim.w + 3;
					dim.w = n;
				}
			}
		}
		
		/* Equation for pad calculation: 
			1 = (w + p) * n + p
			1 - p = (w + p) * n
			(1 - p) / n = w + p
			((1 - p) / n) - p = w
		*/

		cellH = ((1 - padH) / dim.h) - padH;
		cellW = ((1 - padW) / dim.w) - padW;
	}
	else if ((area.__type >= 2) && (area.__type <= 3))
	{
		let distributionRatio = sw / (sh * area.ratio);
		let hCount = distributionRatio >= 1 ? 1 : Math.floor(1 / distributionRatio);
		let wCount = distributionRatio <= 1 ? 1 : Math.floor(distributionRatio);
		let x = Math.ceil(Math.sqrt(count / (hCount * wCount)));
		dim = {w: wCount * x, h: hCount * x};
		
		if (distributionRatio >= 1)
		{
			cellH = ((1 - padH) / dim.h) - padH;
			cellW = cellH / distributionRatio;
		}
		else
		{
			cellW = ((1 - padW) / dim.w) - padW;
			cellH = cellW * distributionRatio;
		}
		
		if (area.__type == 3)
		{
			
		}
	}
	
	let rowCols, x, y, w, h, o, oIsSelected, selectedFactorW, selectedFactorH;
	let index = 0;
	for (let j = 0; j < dim.h; ++j)
	{
		rowCols = dim.w;
		
		if (area.__type === 0)
		{
			if ((j === 0) && ((dim.h * dim.w) > count))
			{
				rowCols = count - (dim.h - 1) * dim.w;
			}
			cellW = ((1 - padW) / rowCols) - padW;
		}

		for (let i = 0; i < rowCols; ++i)
		{
			if (index >= count) break;
			o = objects[index];
			oIsSelected = bkObjectIsSelected(o);
			
			selectedFactorW = oIsSelected ? (cellW + padW) / cellW : 1;
			selectedFactorH = oIsSelected ? (cellH + padH) / cellH : 1;
			
			x = ((cellW + padW) * i + padW + cellW * 0.5) * coord.w + coord.x;
			y = ((cellH + padH) * j + padH + cellH * 0.5) * coord.h + coord.y;
			w = cellW * selectedFactorW * coord.w;
			h = cellH * selectedFactorH * coord.h;
			
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
			i.draw();
		}
	}

	if (__bkSystems.length <= 0) return;
	
	window.requestAnimationFrame(bkMainUpdateFrame);
}

BkSystem.prototype.doOnClick = function(e)
{
	if (this.onclick) this.onclick();
	
	return false;
}

BkSystem.prototype.doOnMouseOut = function(e)
{
	if (this.onmouseout) this.onmouseout();
	
	this.mouse.button = 0;
	return false;
}

BkSystem.prototype.doOnMouseUp = function(e)
{
	let rect = this.canvas.getBoundingClientRect();
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	this.mouse.x = x;
	this.mouse.y = y;
	
	let sCoord = this.__screenCoord;
	let sFactor = 1 / (sCoord.x < sCoord.y ? sCoord.x : sCoord.y);
	let dx = (x - this.mouse.x0) * sFactor;
	let dy = (y - this.mouse.y0) * sFactor;
	let adx = this.mouse.adx * sFactor;
	let ady = this.mouse.ady * sFactor;
	
	this.mouse.action = 0;
	if (adx * 0.2 >= ady) 
	{
		if (dx >= 0.05)
		{
			this.mouse.action = 1;
		}
		else if (dx <= -0.05)
		{
			this.mouse.action = 3;
		}
	}
	else if (ady * 0.2 >= adx) 
	{
		if (dy >= 0.05)
		{
			this.mouse.action = 4;
		}
		else if (dy <= -0.05)
		{
			this.mouse.action = 2;
		}
	}
	
	if (this.onmouseup) this.onmouseup();
	
	this.mouse.button = 0;
	return false;
}

BkSystem.prototype.doOnMouseDown = function(e)
{
	let rect = this.canvas.getBoundingClientRect();
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	this.mouse.x0 = x
	this.mouse.y0 = y
	this.mouse.x = x;
	this.mouse.y = y;
	this.mouse.dx = 0;
	this.mouse.dy = 0;
	this.mouse.adx = 0;
	this.mouse.ady = 0;
	this.mouse.button = e.which;
	this.mouse.action = 0;

	if (this.onmousedown) this.onmousedown();
	
	return false;
}

BkSystem.prototype.doOnMouseMove = function(e)
{
	let rect = this.canvas.getBoundingClientRect();
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	this.mouse.dx = x - this.mouse.x;
	this.mouse.dy = y - this.mouse.y;
	this.mouse.x = x;
	this.mouse.y = y;
	this.mouse.adx += Math.abs(this.mouse.dx);
	this.mouse.ady += Math.abs(this.mouse.dy);
	
	this.onmousemove();
	return false;
}

BkSystem.prototype.doOnContextMenu = function(e)
{
	if (this.oncontextmenu) this.oncontextmenu();
	
	return false;
}

BkSystem.prototype.run = function()
{
	if (this.__running === true) return;
	this.__running = true;
	
	let first = __bkSystems.length === 0;
	
	window.addEventListener("resize", this.resize.bind(this), false);
	
	if (this.onmousemove)
	{
		this.canvas.onmousemove = this.doOnMouseMove.bind(this);
	}
	
	this.canvas.onmousedown = this.doOnMouseDown.bind(this);
	this.canvas.onmouseup = this.doOnMouseUp.bind(this);
	this.canvas.onmouseout = this.doOnMouseOut.bind(this);
	this.canvas.onclick = this.doOnClick.bind(this);
	this.canvas.oncontextmenu = this.doOnContextMenu.bind(this);

	__bkSystems.push(this);
	
	if (first) bkMainUpdateFrame();
}

BkSystem.prototype.stop = function()
{
	if (this.__running === false) return;
	this.__running = false;
	
	window.removeEventListener("resize", this.resize.bind(this), false);
	
	this.canvas.onclick = null;
	this.canvas.mouseout = null;
	this.canvas.mouseup = null;
	this.canvas.mousemove = null;
	this.canvas.mousedown = null;
	
	let i = __bkSystems.indexOf(this);
	if (i !== -1) __bkSystems.splice(i, 1);
}

BkSystem.prototype.draw = function()
{
	this.redraw = false;
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
	this.ctx.font = "12px Arial";
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
function bkDrawRectangle(ctx, coord)
{
	ctx.rect(coord.x - coord.w * 0.5, coord.y - coord.h * 0.5, coord.w, coord.h);
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
	let coordInner = coord.anisotropicGrow(0.96);
	let lighterColor = bkColorLighten(color);
	let darkColorStr = bkColorToStr(bkColorDarken(color));
	let colorStr = bkColorToStr(color);
	let lighterColorStr = bkColorToStr(lighterColor);
	
	ctx.lineWidth = (coord.w - coordInner.w);
	
	let x = coord.x + coord.w * 0.5;
	let y = coord.y + coord.h * 0.5;
	let grad;
	
	if (drawFlat)
	{
		let lightColorStr = bkColorToStr(bkColorMix31(color, lighterColor));
		let r = (coord.w < coord.h) ? coord.h : coord.w;
		grad = ctx.createRadialGradient(x, y, 0, x, y, r);
		grad.addColorStop(0, lighterColorStr);
		grad.addColorStop(0.2, colorStr);
		grad.addColorStop(0.4, lightColorStr);
		grad.addColorStop(0.6, colorStr);
		grad.addColorStop(0.7, lightColorStr);
		grad.addColorStop(0.9, colorStr);
		grad.addColorStop(1, lightColorStr);
	}
	else
	{
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
	let x0 = Math.floor(coord.x - coord.w * 0.5);
	let y0 = Math.floor(coord.y - coord.h * 0.5);
	let w = Math.floor(coord.w);
	let h = Math.floor(coord.h);
	let x1 = x0 + w;
	let y1 = y0 + h;
	
	blur = Math.floor(blur * (w < h ? w : h));
	let blur2 = blur * 2;
	
	ctx.fillStyle = colStr;
	ctx.beginPath();
	ctx.rect(x0 + blur, y0 + blur, w - blur2, h - blur2);
	ctx.fill();
	
	let grad = ctx.createLinearGradient(
		0, y0, 0, y0 + blur);
	grad.addColorStop(0, fade);
	grad.addColorStop(1, colStr);
	
	ctx.fillStyle = grad;
	ctx.beginPath();
	ctx.rect(x0 + blur, y0, w - blur2, blur);
	ctx.fill();
	
	grad = ctx.createLinearGradient(
		0, y1 - blur, 0, y1);
	grad.addColorStop(0, colStr);
	grad.addColorStop(1, fade);
	
	ctx.fillStyle = grad;
	ctx.beginPath();
	ctx.rect(x0 + blur, y1 - blur, w - blur2, blur);
	ctx.fill();
	
	grad = ctx.createLinearGradient(
		x0, 0, x0 + blur, 0);
	grad.addColorStop(0, fade);
	grad.addColorStop(1, colStr);
	
	ctx.fillStyle = grad;
	ctx.beginPath();
	ctx.rect(x0, y0 + blur, blur, h - blur2);
	ctx.fill();
	
	grad = ctx.createLinearGradient(
		x1 - blur, 0, x1, 0);
	grad.addColorStop(0, colStr);
	grad.addColorStop(1, fade);

	ctx.fillStyle = grad;
	ctx.beginPath();
	ctx.rect(x1 - blur, y0 + blur, blur, h - blur2);
	ctx.fill();
	
	let x = x0 + blur;
	let y = y0 + blur;
	
	grad = ctx.createRadialGradient(x, y, 0, x, y, blur)
	grad.addColorStop(0, colStr);
	grad.addColorStop(1, fade);
	ctx.fillStyle = grad;
	ctx.beginPath();
	ctx.rect(x - blur, y - blur, blur, blur);
	ctx.fill();
	
	y = y1 - blur;
	
	grad = ctx.createRadialGradient(x, y, 0, x, y, blur)
	grad.addColorStop(0, colStr);
	grad.addColorStop(1, fade);
	ctx.fillStyle = grad;
	ctx.beginPath();
	ctx.rect(x - blur, y, blur, blur);
	ctx.fill();
	
	x = x1 - blur;
	
	grad = ctx.createRadialGradient(x, y, 0, x, y, blur)
	grad.addColorStop(0, colStr);
	grad.addColorStop(1, fade);
	ctx.fillStyle = grad;
	ctx.beginPath();
	ctx.rect(x, y, blur, blur);
	ctx.fill();
	
	y = y0 + blur;
	
	grad = ctx.createRadialGradient(x, y, 0, x, y, blur)
	grad.addColorStop(0, colStr);
	grad.addColorStop(1, fade);
	ctx.fillStyle = grad;
	ctx.beginPath();
	ctx.rect(x, y - blur, blur, blur);
	ctx.fill();
}

function bkDrawGlassBoard(ctx, coord, col, drawShadow = false, plainColor = false)
{
	let innerCoord = coord.anisotropicGrow(0.98);
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

	let c = coord.anisotropicGrow(0.9);
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

// Just one text line resized to fit in coord.
// Text can be changed at any time.
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
	this.fontHeight = null;
}

BkText.prototype.draw = function(ctx, screenCoord, border = null)
{
	if (this.text.length <= 0) return;
	
	let coord = this.coord.toScreenCoord(screenCoord);
	let done = (this.__oldText === this.text) && (this.fontHeight !== null);
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

// Several text lines auto distributed and resized to fit inside coord.
// Doesn't allow text changes.
let BkTextArea = function(coord, text, fontName, fontRelHeight = 0.5,
	alignment = 4, leadingFactor = 1.2)
{
	this.lines = [];
	this.fontName = fontName;
	this.fontRelHeight = fontRelHeight;
	this.alignment = alignment;
	// relative to the coord to provide when drawing
	this.coord = coord;
	this.leadingFactor = leadingFactor;
	this.padding = 0;
	this._fontHeight = null;
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
		this._fontHeight = 0;
		return;
	}
	
	if (this._fontHeight !== null) 
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
		this._fontHeight = 0;
		return;
	}
	let epsilon = 0.5;
	let minh = 0;
	let maxh = desiredHeight * this.fontRelHeight;
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
		this._fontHeight = 0;
		return;
	}
	this._fontHeight = h;
	/**************************************************************************/
	
	// Fix ugly two lines for centred and left padding alignments
	if ((this.__linesIndexesUsed == 2) && ((this.alignment % 3) > 0) && ((this.alignment % 3) < 2))
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
		// Fix padding for left padding alignments
		if (Math.floor(this.alignment) !== this.alignment)
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
	let fontH = this._fontHeight;
	
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
	
	switch(alignment)
	{
	case 4:  // Center middle
		ctx.textAlign = 'center';
		x = coord.x;
		y = coord.y - lineHeight * (maxLines - 1) * 0.5;
		break;
	case 3:  // Left middle
		ctx.textAlign = 'left';
		x = coord.x - coord.w * 0.5;
		y = coord.y - lineHeight * (maxLines - 1) * 0.5;
		break;
	case 3.5:// Left middle with padding
		ctx.textAlign = 'left';
		x = coord.x + (padding - 1) * coord.w * 0.5;
		y = coord.y - lineHeight * (maxLines - 1) * 0.5;
		break;
	case 5:  // Right middle
		ctx.textAlign = 'right';
		x = coord.x + coord.w * 0.5;
		y = coord.y - lineHeight * (maxLines - 1) * 0.5;
		break;
	case 0:  // Left top
		ctx.textAlign = 'left';
		x = coord.x - coord.w * 0.5;
		y = coord.y + (fontH - coord.h) * 0.5;
		break;
	case 0.5:  // Left top with padding
		ctx.textAlign = 'left';
		x = coord.x + (padding - 1) * coord.w * 0.5;
		y = coord.y + (fontH - coord.h) * 0.5;
		break;
	case 1:  // Center top
		ctx.textAlign = 'center';
		x = coord.x;
		y = coord.y + (fontH - coord.h) * 0.5;
		break;
	case 2:  // Right top
		ctx.textAlign = 'right';
		x = coord.x + coord.w * 0.5;
		y = coord.y + (fontH - coord.h) * 0.5;
		break;
	case 6:  // Left bottom
		ctx.textAlign = 'left';
		x = coord.x - coord.w * 0.5;
		y = coord.y + (coord.h - fontH) * 0.5 - lineHeight * (maxLines - 1);
		break;
	case 6.5:  // Left bottom with padding
		ctx.textAlign = 'left';
		x = coord.x + (padding - 1) * coord.w * 0.5;
		y = coord.y + (coord.h - fontH) * 0.5 - lineHeight * (maxLines - 1);
		break;
	case 7:  // Center bottom
		ctx.textAlign = 'center';
		x = coord.x;
		y = coord.y + (coord.h - fontH) * 0.5 - lineHeight * (maxLines - 1);
		break;
	case 8:  // Right bottom
		ctx.textAlign = 'right';
		x = coord.x + coord.w * 0.5;
		y = coord.y + (coord.h - fontH) * 0.5 - lineHeight * (maxLines - 1);
		break;
	}
	
	// Adjusting to middle
	y += fontH * 0.35;

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