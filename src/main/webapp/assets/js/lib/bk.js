'use strict';

let BkTransform = function(width, height, ratio)
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

let BkCoord = function(x, y, w, h, z = 0, type = 0)
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
	// h, w are proportional to current canvas dimensions
	// Type 1 can become Type 0 if the object is undocked
	
	// Type 6:
	// x, y, w, h are relative to current canvas dimensions and fixed
	// x, y are guaranteed to be in screen for [0..1]
	// if x, y are negative [-1..0[ they are relative to right or bottom.
	// h, w are proportional to the current smaller canvas dimension
	
	// Type 7:
	// x, y, w, h are relative to current canvas dimensions and fixed
	// if x, y are negative [-1..0[ they are relative to right or bottom.
	// x, y are guaranteed to be in screen for [0..1]
	// h, w are proportional to current canvas dimensions
	
	// Type 8 and later:
	// Automatic distribution of objects inside an area
	// x defines an order and it is displayed depending on type:
	//   8: Higher orders are displayed in the middle in bigger size.
	// y contains {x, y} normalized to current size, order and scale
	// sx [0..1[ 
	// sy floor([0..1[ * 1048576)
	// y = sx + sy
	// w contains {w, h} preferred absolute size [0..16[
	// sw [0..16[ * 1/16
	// sh floor([0..16[ * 1/16 * 1048576)
	// w = sw + sh
	// h contains {w, h} normalized to current size, order and scale
	// sw [0..1[ 
	// sh floor([0..1[ * 1048576)
	// h = sw + sh
	// Type 2 can become Type 0 if the object is undocked
}

const BKCOORD_P_HIGH = 1048576;
const BKCOORD_P_D_FACTOR = 16;

const BKCOORD_P_INV_HIGH = 1 / BKCOORD_P_HIGH;
const BKCOORD_P_D_INV_FACTOR = 1 / BKCOORD_P_D_FACTOR;
const BKCOORD_P_P_HIGH = (BKCOORD_P_HIGH - 1) / BKCOORD_P_HIGH;
const BKCOORD_P_D_HIGH = BKCOORD_P_D_FACTOR * BKCOORD_P_P_HIGH;

function BkCoordDimToNum(w, h)
{
	if (w < 0) w = 0;
	if (w > BKCOORD_P_D_HIGH) w = BKCOORD_P_D_HIGH;
	if (h < 0) h = 0;
	if (h > BKCOORD_P_D_HIGH) h = BKCOORD_P_D_HIGH;
	w *= BKCOORD_P_D_INV_FACTOR;
	h *= BKCOORD_P_D_INV_FACTOR;
	return Math.floor(h * BKCOORD_P_HIGH) + w;
}

function BkCoordNumToDim(n)
{
	let x = n;
	let y = Math.floor(x);
	x -= y;
	y *= BKCOORD_P_INV_HIGH;
	x *= BKCOORD_P_D_FACTOR;
	y *= BKCOORD_P_D_FACTOR;
	return {w:x, h:y};
}

function BkCoordPosToNum(x, y)
{
	if (x < 0) x = 0;
	if (x > BKCOORD_P_P_HIGH) x = BKCOORD_P_P_HIGH;
	if (y < 0) y = 0;
	if (y > BKCOORD_P_P_HIGH) y = BKCOORD_P_P_HIGH;
	return Math.floor(y * BKCOORD_P_HIGH) + x;
}

function BkCoordNumToPos(n)
{
	let x = n;
	let y = Math.floor(x);
	x -= y;
	y *= BKCOORD_P_INV_HIGH;
	return {x:x, y:y};
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
		
		let x = this.y;
		let y = Math.floor(x);
		x -= y;
		y *= BKCOORD_P_INV_HIGH;
		
		let w = this.h;
		let h = Math.floor(w);
		w = w - h;
		h *= BKCOORD_P_INV_HIGH;
		
		return new BkCoord(
			x * sw,
			y * sh,
			w * sw * BKCOORD_P_D_FACTOR,
			h * sh * BKCOORD_P_D_FACTOR,
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
		
		let x = this.y;
		let y = Math.floor(x);
		x -= y;
		y *= BKCOORD_P_INV_HIGH;
		
		let w = this.h;
		let h = Math.floor(w);
		w = w - h;
		h *= BKCOORD_P_INV_HIGH;
		
		return new BkCoord(
			(x * sw - transform.dx) * scale,
			(y * sh - transform.dy) * scale,
			(w * sw) * scale * BKCOORD_P_D_FACTOR,
			(h * sh) * scale * BKCOORD_P_D_FACTOR,
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
	return null;
}

BkCoord.prototype.toScreenCoord = function(coord)
{
	let nCoord = this.toScreen(new BkTransform(coord.w, coord.h, 1));
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
function BkColorToStr(colorNumber)
{
	return 'rgba(' + 
		((colorNumber >> 16) & 0xFF).toString() + ',' +
		((colorNumber >> 8) & 0xFF).toString() + ',' +
		(colorNumber & 0xFF).toString() + ',' +
		(((colorNumber >> 24) & 0xFF) * BK_INV_255).toString() + ')';
}

function BkShadowColor(color)
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

function BkColorMix(colorA, colorB)
{
	return ((((colorA >> 1) & 0x7F807F80) + ((colorB >> 1) & 0x7F807F80)) & 0xFF00FF00) |
		((((colorA & 0xFF00FF) + (colorB & 0xFF00FF)) >> 1) & 0x00FF00FF);
}

function BkColorMix31(colorA, colorB)
{
	return (((((colorA >> 2) & 0x3FC03FC0) * 3) + ((colorB >> 2) & 0x3FC03FC0)) & 0xFF00FF00) |
		(((((colorA & 0xFF00FF) * 3) + (colorB & 0xFF00FF)) >> 2) & 0x00FF00FF);
}

function BkColorDarken(color)
{
	let r = (color >> 16) & 0xFF;
	let g = (color >> 8) & 0xFF;
	let b = color & 0xFF;
	let m = Math.min(r, g, b);
	let M = Math.max(r, g, b);
	let delta = M - m;
	if (delta === 0) return BkColorMix(color, color & 0xFF000000);
	
	let factor = M / delta;
	r = Math.floor((r - m) * factor);
	g = Math.floor((g - m) * factor);
	b = Math.floor((b - m) * factor);
	return b + (g << 8) + (r << 16) | (color & 0xff000000);
}
	
function BkColorLighten(color)
{
	let r = (color >> 16) & 0xFF;
	let g = (color >> 8) & 0xFF;
	let b = color & 0xFF;
	let m = Math.max(r, g, b);
	if (m === 0) return (color | 0x808080);
	
	let factor = 255 / m;
	r = Math.floor(r * factor);
	g = Math.floor(g * factor);
	b = Math.floor(b * factor);
	return b + (g << 8) + (r << 16) | (color & 0xff000000);
}

function BkColorExtremeLighten(color)
{
	if ((color & 0xFFFFFF) === 0) return 0xFFFFFFFF;
	
	let r = (color >> 16) & 0xFF;
	let g = (color >> 8) & 0xFF;
	let b = color & 0xFF;
	let factor = 1 / Math.max(r, g, b);

	r = Math.floor(Math.sqrt(r * factor) * 255);
	g = Math.floor(Math.sqrt(g * factor) * 255);
	b = Math.floor(Math.sqrt(b * factor) * 255);
	
	return b + (g << 8) + (r << 16) | 0xff000000;
}

let BkObject = function(coord)
{
	this.coord = coord;
	this.flags = 0;
}

BkObject.prototype.resize = function()
{
}

BkObject.prototype.draw = function()
{
}

let BkArea = function(coord, ratio = 1, padding = 0.04)
{
	this.coord = coord;
	this.ratio = ratio;
	this.padding = padding;
}

function BkObjectIsSelected(o)
{
	return (o.flags & 0x80000000) !== 0;
}

function BkObjectSetSelected(o)
{
	o.flags |= 0x80000000;
}

let BkSystem = function(canvasName, ratio = null)
{
	this.item = [];
	this.area = [];
	this.__running = false;
	this.selectedIndex = -1;
	this.selectedDx = 0;
	this.selectedDy = 0;
	this.transform = new BkTransform(1, 1, 1);
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
		dy: 0
	};
	
	this.bgImg = null;
	this.resize();
};

BkSystem.prototype.resize = function()
{
	this.width = this.canvas.clientWidth;
	this.height = this.canvas.clientHeight;
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	this.__coord = new BkCoord(this.width * 0.5, this.height * 0.5, this.width, this.height);

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

BkSystem.prototype.createImage = function(src)
{
	if ((src === null) || (0 === src.length)) return null;
	let img = new Image();
	img.src = src;
	img.addEventListener("load", this.onImageLoad.bind(this), false);
	return img;
}

/*
BkSystem.prototype.getCoord = function()
{
	return this.__coord;
}*/

BkSystem.prototype.setBackgroundImage = function(src)
{
	this.bgImg = this.createImage(src);
}

function _getDivisorsCloseToRatio(n, ratio) 
{
	//console.log("n: " + n + ", r: " + ratio);
	if (n <= 1) return {w:1, h:1};
		
	let sqrtN = Math.sqrt(n);
	let sqrtInvRatio = Math.sqrt(1 / ratio);
	let w = sqrtN * sqrtInvRatio * ratio;
	let h = sqrtN * sqrtInvRatio;
	//console.log("w: " + w + ", h: " + h);
	
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

	//console.log("w: " + w + ", h: " + h);
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
			if (this.item[i].coord.type >= 8)
			{
				if (this.item[i].coord.z === id)
				{
					objects.push(this.item[i]);
				}
			}
		}
	}
	
	const count = objects.length;
	if (count <= 0) return;
	
	objects.sort(function(a, b) {
		return a.coord.x < b.coord.x;
	});
	
	let selItem = this.selectedIndex < 0 ? null : this.item[this.selectedIndex];

	let coord = area.coord.toScreenCoord(this.__coord);
	let minorDim = coord.w < coord.h ? coord.w: coord.h;
	let padding = area.padding * minorDim;
	let padH = padding / coord.h;
	let padW = padding / coord.w;
	
	let dim = _getDivisorsCloseToRatio(count, coord.w / (coord.h * area.ratio));
	
	coord = area.coord;
	
	let cellH = ((1 - padH) / dim.h) - padH;
	
	/*
	1 = (w + p) * n + p
	1 - p = (w + p) * n
	(1 - p) / n = w + p
	((1 - p) / n) - p = w
	*/
	
	let index = 0;
	for (let j = 0; j < dim.h; ++j)
	{
		let rowCols = dim.w;
		
		if (((j + 1) * dim.w) > count)
		{
			rowCols = count - (j * dim.w);
		}
		
		let cellW = ((1 - padW) / rowCols) - padW;

		for (let i = 0; i < dim.w; ++i)
		{
			if (index >= count) break;
			let o = objects[index];
			let oIsSelected = BkObjectIsSelected(o);
			
			let selectedFactorW = oIsSelected ? (cellW + padW) / cellW : 1;
			let selectedFactorH = oIsSelected ? (cellH + padH) / cellH : 1;
			
			let c = o.coord;
			c.h = BkCoordDimToNum(
				cellW * selectedFactorW * coord.w,
				cellH * selectedFactorH * coord.h);
			c.y = BkCoordPosToNum(
				((cellW + padW) * (rowCols - 1 - i) + padW + cellW * 0.5) * coord.w + coord.x,
				((cellH + padH) * (dim.h - 1 - j) + padH + cellH * 0.5) * coord.h + coord.y);
			
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

let BkSystemInstancesList = [];

function BkMainUpdateFrame()
{
	for (let i of BkSystemInstancesList)
	{
		if (i.redraw)
		{
			i.draw();
		}
	}

	if (BkSystemInstancesList.length <= 0) return;
	
	window.requestAnimationFrame(BkMainUpdateFrame);
}

BkSystem.prototype.doOnClick = function(e)
{
	this.onclick();
	
	e.preventDefault();
	e.stopPropagation();
	return false;
}

BkSystem.prototype.doOnMouseOut = function(e)
{
	if (this.onmouseout) this.onmouseout();
	
	this.mouse.button = 0;
	e.preventDefault();
	e.stopPropagation();
	return false;
}

BkSystem.prototype.doOnMouseUp = function(e)
{
	if (this.onmouseup) this.onmouseup();
	
	this.mouse.button = 0;
	e.preventDefault();
	e.stopPropagation();
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
	
	this.onmousemove();
	
	e.preventDefault();
	e.stopPropagation();
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
	this.mouse.button = e.which;
	this.mouse.action = 0;

	if (this.onmousedown) this.onmousedown();
	
	e.preventDefault();
	e.stopPropagation();
	return false;
}


BkSystem.prototype.run = function()
{
	if (this.__running === true) return;
	this.__running = true;
	
	let first = BkSystemInstancesList.length === 0;
	
	window.addEventListener("resize", this.resize.bind(this), false);
	
	if (this.onmousemove)
	{
		this.canvas.addEventListener("mousemove", this.doOnMouseMove.bind(this), false);
	}
	
	this.canvas.addEventListener("mousedown", this.doOnMouseDown.bind(this), false);
	this.canvas.addEventListener("mouseup", this.doOnMouseUp.bind(this), false);
	this.canvas.addEventListener("mouseout", this.doOnMouseOut.bind(this), false);
	
	if (this.onclick)
	{
		this.canvas.addEventListener("click", this.doOnClick.bind(this), false);
	}

	BkSystemInstancesList.push(this);
	
	if (first) BkMainUpdateFrame();
}

BkSystem.prototype.stop = function()
{
	if (this.__running === false) return;
	this.__running = false;
	
	window.removeEventListener("resize", this.resize.bind(this), false);
	
	this.canvas.removeEventListener("click", this.doOnClick.bind(this), false);
	this.canvas.removeEventListener("mouseout", this.doOnMouseOut.bind(this), false);
	this.canvas.removeEventListener("mouseup", this.doOnMouseUp.bind(this), false);
	this.canvas.removeEventListener("mousemove", this.doOnMouseMove.bind(this), false);
	this.canvas.removeEventListener("mousedown", this.doOnMouseDown.bind(this), false);
	
	let i = BkSystemInstancesList.indexOf(this);
	if (i !== -1) BkSystemInstancesList.splice(i, 1);
}

BkSystem.prototype.draw = function()
{
	this.redraw = false;
	this.ctx.clearRect(0, 0, this.width, this.height);
	if (this.bgImg !== null)
	{
		this.bgImg.drawFit(this.ctx, this.__coord);
	}
	
	let count = this.item.length;
	for (let i = 0; i < count; ++i)
	{
		this.item[i].draw();
	}
}

BkSystem.prototype.onImageLoad = function()
{
	this.redraw = true;
}

BkSystem.prototype.create = function(coord)
{ 
	let o = new BkObject(coord)
	this.item.push(o);
	return o;
}

BkSystem.prototype.add = function(o)
{ 
	if (this.item.indexOf(o) === -1) this.item.push(o);
}

BkSystem.prototype.remove = function(o)
{ 
	let i = this.item.indexOf(o);
	if (i === this.selectedIndex) this.selectedIndex = -1;
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

BkSystem.prototype.isSelected = function(o)
{
	let index = this.item.indexOf(o);
	if (index === -1) return false;
	return this.selectedIndex === index;
}

BkSystem.prototype.unselect = function()
{
	this.selectedIndex = -1;
}

BkSystem.prototype.select = function(x, y)
{ 
	let sdx = 0;
	let sdy = 0;
	let selectedIndex = -1;
	let count = this.item.length;
	if (count <= 0) return;
	
	let coord = new BkCoord(x, y, 0, 0).fromScreen(this.transform);
	for (let i = count - 1; i >= 0; --i)
	{
		let p = this.item[i].coord;
		if (p.type !== 0)
		{
			p = p.toAbsolute(this.transform);
		}
			
		if ((coord.x >= (p.x - p.w * 0.5)) && (coord.x < (p.x + p.w * 0.5)) &&
			(coord.y >= (p.y - p.h * 0.5)) && (coord.y < (p.y + p.h * 0.5)))
		{
			sdx = p.x - coord.x;
			sdy = p.y - coord.y;
			selectedIndex = i;
			break;
		}
	}
	
	/*
	if ((selectedIndex >= 0) && (selectedIndex !== (this.item.length - 1)))
	{
		let selectedItem = this.item[selectedIndex];
		this.item.splice(selectedIndex, 1);
		this.item.push(selectedItem);
		selectedIndex = this.item.length - 1;
	}*/
	
	this.selectedIndex = selectedIndex;
	this.selectedDx = sdx;
	this.selectedDy = sdy;
}

BkSystem.prototype.moveSelected = function(x, y)
{ 
	if (this.selectedIndex < 0) return;
	
	let selectedItem = this.item[this.selectedIndex];
	let coord = selectedItem.coord;
	if (coord.type !== 0)
	{
		coord = coord.toAbsolute(this.transform);
		selectedItem.coord = coord;
		this.redistribute();
	}
	let nCoord = new BkCoord(x, y, 0, 0).fromScreen(this.transform);
	coord.x = nCoord.x + this.selectedDx;
	coord.y = nCoord.y + this.selectedDy;
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
	let width = coord.w;
	let height = coord.h;
	let x = coord.x - width * 0.5;
	let y = coord.y - height * 0.5;
	let radius = (width < height ? width: height) * relRadius;
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}

function bkDrawGlassButton(ctx, coord, color, drawFlat = false, relRadius = 0.125)
{
	let coordInner = coord.anisotropicGrow(0.96);
	let lighterColor = BkColorLighten(color);
	let darkColorStr = BkColorToStr(BkColorDarken(color));
	let colorStr = BkColorToStr(color);
	let lightColorStr = BkColorToStr(BkColorMix(lighterColor, color));
	let lighterColorStr = BkColorToStr(lighterColor);
	
	ctx.lineWidth = (coord.w - coordInner.w);
	
	let x = coord.x + coord.w * 0.5;
	let y = coord.y + coord.h * 0.5;
	let r = (coord.w < coord.h) ? coord.h : coord.w;
	
	let grad;
	
	if (!drawFlat)
	{
		let lightestColor = BkColorExtremeLighten(color);
		let lightestColorStr = BkColorToStr(lightestColor);
		
		grad = ctx.createRadialGradient(x, y, 0, x, y, r);
		grad.addColorStop(0, lightestColorStr);
		grad.addColorStop(0.1, lighterColorStr);
		grad.addColorStop(0.2, lightColorStr);
		grad.addColorStop(0.3, colorStr);
		grad.addColorStop(0.65, darkColorStr);
		grad.addColorStop(0.7, colorStr)
		grad.addColorStop(0.71, lightColorStr);
		grad.addColorStop(0.72, lighterColorStr);
		grad.addColorStop(0.73, lightColorStr);
		grad.addColorStop(1, colorStr);
	}
	else
	{
		grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
		grad.addColorStop(0, lighterColorStr);
		grad.addColorStop(0.05, lightColorStr);
		grad.addColorStop(0.25, colorStr);
		grad.addColorStop(0.48, darkColorStr);
		grad.addColorStop(0.49, colorStr)
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

function bkDrawShadowRect(ctx, coord, blur, col)
{
	let shadowCol = BkShadowColor(col);
	let colStr = BkColorToStr(shadowCol);
	let fade = BkColorToStr(shadowCol & 0xFFFFFF);
	let x0 = Math.floor(coord.x - coord.w * 0.5);
	let y0 = Math.floor(coord.y - coord.h * 0.5);
	let w = Math.floor(coord.w);
	let h = Math.floor(coord.h);
	let x1 = x0 + w;
	let y1 = y0 + h;
	
	blur = Math.floor(blur);
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
	let lineWidth = coord.w - innerCoord.w;
	
	let darkerCol = BkColorDarken(col);
	let darkCol = BkColorMix(darkerCol, col);
	let color = BkColorToStr(col);
	let lightColor = BkColorToStr(BkColorLighten(col));
	let darkColor = BkColorToStr(darkCol);
	let darkerColor = BkColorToStr(darkerCol);
	
	if (drawShadow)
	{
		let sCoord = coord.clone();
		sCoord.x += lineWidth * 4;
		sCoord.y += lineWidth * 4;
		bkDrawShadowRect(ctx, sCoord, lineWidth * 2, col);
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
	grd.addColorStop(0.13,lightColor);
	grd.addColorStop(0.15,"#fff");
	grd.addColorStop(0.17,lightColor);
	grd.addColorStop(0.2,color);
	grd.addColorStop(0.5,darkerColor);
	grd.addColorStop(0.6,color);
	grd.addColorStop(0.63,lightColor);
	grd.addColorStop(0.65,"#fff");
	grd.addColorStop(0.67,lightColor);
	grd.addColorStop(0.7,color);
	grd.addColorStop(1,darkerColor);

	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = grd;
	
	ctx.beginPath();
	ctx.rect(coord.x - coord.w * 0.5 + lineWidth * 0.5,
		coord.y - coord.h * 0.5 + lineWidth * 0.5,
		coord.w - lineWidth, coord.h - lineWidth);
	ctx.stroke();
	
	let grad;
	if (!plainColor)
	{
		ctx.globalAlpha = 0.75;
		grad=ctx.createRadialGradient(x - w,y - h * 0.3,0,x - w,y - h * 0.3,w * 2);
		grad.addColorStop(0,darkColor);
		grad.addColorStop(0.45,color);
		grad.addColorStop(0.455,darkerColor);
		grad.addColorStop(1,darkColor);
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
		grad=ctx.createRadialGradient(x + w * 0.1,y + h * 2,0,x + w * 0.1,y + h * 2,h * 3);
		grad.addColorStop(0.6,color);
		grad.addColorStop(0.75,darkerColor);
		grad.addColorStop(0.755,color);
		grad.addColorStop(1,darkColor);
		

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
	grad.addColorStop(0.2, lightColor);
	grad.addColorStop(0.35, color);
	grad.addColorStop(0.8, darkerColor);
	ctx.fillStyle = grad;

	let c = coord.anisotropicGrow(0.9);
	_bkDrawGlassScrew(ctx, c.x - c.w * 0.5, c.y - c.h * 0.5, lineWidth);
	_bkDrawGlassScrew(ctx, c.x + c.w * 0.5, c.y - c.h * 0.5, lineWidth);
	_bkDrawGlassScrew(ctx, c.x - c.w * 0.5, c.y + c.h * 0.5, lineWidth);
	_bkDrawGlassScrew(ctx, c.x + c.w * 0.5, c.y + c.h * 0.5, lineWidth);
}

let BkTextArea = function(coord, text, fontName, fontRelHeight = 0.5,
	alignment = 4, leadingFactor = 1.2)
{
	this.lines = [];
	this.fontName = fontName;
	this.baseFontRelHeight = fontRelHeight;
	this.alignment = alignment;
	// relative to the coord to provide when drawing
	this.coord = coord;
	this.fontRelHeight = null;
	this.leadingFactor = leadingFactor;
	this.padding = 0;
	
	this.words = text.split(' ');
	this.text = this.words.join(' ');
	
	let count = this.words.length;
	this.__endPositionBuffer = new ArrayBuffer(count * 4);
	this.__endPosition = new Int32Array(this.__endPositionBuffer);
	this.__textWidthBuffer = new ArrayBuffer(count * 4);
	this.__textWidth = new Int32Array(this.__textWidthBuffer);
	this.__spaceWidth = 0;
	this.__linesIndexesBuffer = new ArrayBuffer(count * 4);
	this.__linesIndexes = new Int32Array(this.__linesIndexesBuffer);
	this.__linesIndexesUsed = 0;

	let index = 0;
	for (let i = 0; i < count; ++i)
	{
		index += this.words[i].length;
		this.__endPosition[i] = index;
		++index;
	}
}

BkTextArea.prototype.resize = function()
{
	this.fontRelHeight = null;
}

BkTextArea.prototype.defineLines = function(ctx, maxWidth, height)
{
	let posCount = this.__endPosition.length;
	if (posCount <= 0)
	{
		this.__linesIndexesUsed = 0;
		return 0;
	}
	
	ctx.font = (this.fontRelHeight * height).toString() + 'px ' + this.fontName;
	
	let count = this.words.length;
	for (let i = 0; i < count; ++i)
	{
		this.__textWidth[i] = ctx.measureText(this.words[i]).width;
	}
	let spaceWidth = ctx.measureText(' ').width;
	this.__spaceWidth = spaceWidth;
	let minPadding = maxWidth;
	let baseIndex = 0;
	let linesCount = 0;
	let done = false;
	while (baseIndex < posCount)
	{
		let prevlineWidth, lineWidth = 0;
		let usedWords = 0;
		do
		{
			prevlineWidth = lineWidth;
			if (baseIndex + usedWords >= posCount)
			{
				done = true;
				break;
			}
			
			if (usedWords !== 0) lineWidth += spaceWidth;
			lineWidth += this.__textWidth[baseIndex + usedWords];

			++usedWords;
		}
		while (lineWidth < maxWidth);
		
		if (usedWords > 1)
		{
			if (!done)
			{
				--usedWords;
			}
		}
		else
		{
			// Only one word that doesn't even fit
			prevlineWidth = lineWidth;
		}
		
		this.__linesIndexes[linesCount++] = baseIndex + usedWords - 1;
		
		baseIndex += usedWords;
		let padding = maxWidth - prevlineWidth;
		if (padding < minPadding)
		{
			minPadding = padding;
		}
	}
	
	this.__linesIndexesUsed = linesCount;
	return minPadding / maxWidth;
}

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

BkTextArea.prototype.adjustLines = function(ctx, width, height)
{
	this.fontRelHeight = this.baseFontRelHeight;
	for (let i = 0; i < 3; ++i)
	{
		//console.log("Retry: " + i);
		let newfactor, factor = 1;
		let oldFontHeight = (this.fontRelHeight * height);
		// Shrink if one word line does not fit
		let padding = this.defineLines(ctx, width, height);
				
		this.padding = padding;
		if (padding < 0)
		{
			newfactor = 1 / (1 - padding);
			if (newfactor < factor) factor = newfactor;
		}
		
		// Shrink if height does not fit
		padding = 1 - this.fontRelHeight * 
			(this.leadingFactor * (this.__linesIndexesUsed - 1) + 1);
		if (padding < 0)
		{
			newfactor = 1 / (1 - padding);
			if (newfactor < factor) factor = newfactor;
		}
		
		
		if (factor < 1)
		{
			if (i < 2)
			{
				factor = Math.sqrt(factor);
			}
			
			this.fontRelHeight *= factor;
			// Make sure the updated height changes 
			if ((oldFontHeight - (this.fontRelHeight * height)) < 1)
			{
				if (oldFontHeight <= 1)
				{
					this.fontRelHeight = 0;
				}
				else
				{
					this.fontRelHeight = (oldFontHeight - 1) / height;
				}
			}
			
			continue;
		}
		
		break;
	}
	
	// Fix ugly two lines 
	if (this.__linesIndexesUsed == 2)
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
		// Fix padding
		let padding0 = width - this._getLineWidth(0);
		let padding1 = width - this._getLineWidth(1);
		
		this.padding = (padding0 < padding1 ? padding0 : padding1) / width;
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
	this.lines = lines;
}

BkTextArea.prototype.draw = function(ctx, screenCoord, border = null)
{
	if (this.words.length <= 0) return;
	
	let coord = this.coord.toScreenCoord(screenCoord);
	
	if (this.fontRelHeight === null)
	{
		this.adjustLines(ctx, coord.w, coord.h);
	}
	
	let fontH = (this.fontRelHeight * coord.h);
	if (fontH < 1) return;
	
	ctx.font = fontH.toString() +'px ' + this.fontName;
	let lineHeight = fontH * this.leadingFactor;
	let maxLines = this.lines.length;
	let x, y;
	
	ctx.textBaseline = 'top';
	
	switch(this.alignment)
	{
	case 4:  // Center middle
		ctx.textAlign = 'center';
		x = coord.x;
		y = coord.y - (lineHeight * (maxLines - 1) + fontH) * 0.5;
		break;
	case 3:  // Left middle
		ctx.textAlign = 'left';
		x = coord.x - coord.w * 0.5;
		y = coord.y - (lineHeight * (maxLines - 1) + fontH) * 0.5;
		break;
	case 3.5:// Left middle with padding
		ctx.textAlign = 'left';
		x = coord.x - (1 - this.padding) * coord.w * 0.5;
		y = coord.y - (lineHeight * (maxLines - 1) + fontH) * 0.5;
		break;
	case 5:  // Right middle
		ctx.textAlign = 'right';
		x = coord.x + coord.w * 0.5;
		y = coord.y - (lineHeight * (maxLines - 1) + fontH) * 0.5;
		break;
	case 0:  // Left top
		ctx.textAlign = 'left';
		x = coord.x - coord.w * 0.5;
		y = coord.y - coord.h * 0.5;
		break;
	case 0.5:  // Left top with padding
		ctx.textAlign = 'left';
		x = coord.x + (this.padding - 1) * coord.w * 0.5;
		y = coord.y - coord.h * 0.5;
		break;
	case 1:  // Center top
		ctx.textAlign = 'center';
		x = coord.x;
		y = coord.y - coord.h * 0.5;
		break;
	case 2:  // Right top
		ctx.textAlign = 'right';
		x = coord.x + coord.w * 0.5;
		y = coord.y - coord.h * 0.5;
		break;
	case 6:  // Left bottom
		ctx.textAlign = 'left';
		x = coord.x - coord.w * 0.5;
		y = coord.y + coord.h * 0.5 - (lineHeight * (maxLines - 1) + fontH);
		break;
	case 6.5:  // Left bottom with padding
		ctx.textAlign = 'left';
		x = coord.x + (this.padding - 1) * coord.w * 0.5;
		y = coord.y + coord.h * 0.5 - (lineHeight * (maxLines - 1) + fontH);
		break;
	case 7:  // Center bottom
		ctx.textAlign = 'center';
		x = coord.x;
		y = coord.y + coord.h * 0.5 - (lineHeight * (maxLines - 1) + fontH);
		break;
	case 8:  // Right bottom
		ctx.textAlign = 'right';
		x = coord.x + coord.w * 0.5;
		y = coord.y + coord.h * 0.5 - (lineHeight * (maxLines - 1) + fontH);
		break;
	}
	
	let lines = this.lines;

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
