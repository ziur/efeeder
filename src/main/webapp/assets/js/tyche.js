'use strict';

let TicheView = function(m_feastId, m_buyerId, m_feast, m_place, m_drawnLots)
{

const BUTTON_COLOR = 0xFF26A69A;
const LIGHTEN_BUTTON_COLOR = bkColorLighten(BUTTON_COLOR);
const BUTTON_HOVER_COLOR = bkColorMix31(BUTTON_COLOR, LIGHTEN_BUTTON_COLOR);
const USER_COLOR = 0xFFFFFFFF;
const SELECTED_USER_COLOR = bkColorMix31(USER_COLOR, LIGHTEN_BUTTON_COLOR);
const BOARD_COLOR_STR = '#fff';
const LARGE_FONT_NAME = 'Roboto';
const FONT_NAME = 'Tahoma';
const MAX_SMALL_FONT_SIZE = 26;
const LOADING_IMAGE_DELAY_MS = 400;
const BUBBLES_FRAMES_ANIMATION = 300;

let m_uiSystem;
let m_buttonDrawer;
let m_finishButton;
let m_buttonsArea;
let m_cardsArea;
let m_bubbles;
let m_comService;
let m_userId;
let m_commandInProcess = false;
let m_copyImg = null;

function buttonOnClick(mouse)
{
	if ((mouse.buttons === 1) && (!this.isDisabled))
	{
		this.isChecked = !this.isChecked;
		this.drawer._system.redraw = true;
	}
}

function buttonOnGuiAction()
{
	this.drawer._system.redraw = true;
}

let Button = function(coord, drawer, text, onclick = null, imgSrc = null)
{
	this.coord = coord;
	this.drawer = drawer;
	this.isChecked = false;
	this.isSelected = false;
	this.isDisabled = false;
	this.onclick = onclick === null ? buttonOnClick.bind(this) : onclick;
	this.onmousedown = buttonOnGuiAction.bind(this);
	this.onmouseup = buttonOnGuiAction.bind(this);
	
	this.isCircle = coord.w === coord.h;
	this.textArea = new BkText(
		new BkCoord(0.1, 0.1, 0.8, 0.8, 7),
		text, FONT_NAME);
	this.img = drawer._system.createImage(imgSrc);
}

Button.prototype.draw = function()
{
	this.drawer.draw(this);
}

Button.prototype.resize = function()
{
	this.textArea.resize();
}

let ButtonDrawer = function(system)
{
	this._ctx = system.ctx;
	this._transform = system.transform;
	this._system = system;
}

ButtonDrawer.prototype.draw = function(o)
{
	let coord = o.coord.toParentScreen(this._transform);
	let ctx = this._ctx;
	let color;
	
	if (!o.isDisabled)
	{
		let isHovered = o === this._system.mouse.hover;
		color = o.isSelected ? LIGHTEN_BUTTON_COLOR :
			(isHovered ? BUTTON_HOVER_COLOR : BUTTON_COLOR);
		let coordShadow = coord.growScaleMin((isHovered || o.isChecked) ? 1.2 : 1.1);
		let shadowColor;
		if (o.isChecked || (this._system.mouse.selected === o &&
			this._system.mouse.buttons === 1 && isHovered))
		{
			coord.y += coord.h * 0.05;
			coordShadow.y += coord.h * 0.05;
			shadowColor = 0xFF000000;
			color = bkColorMix(BUTTON_HOVER_COLOR, LIGHTEN_BUTTON_COLOR);
		}
		else
		{
			coordShadow.y += coordShadow.h * 0.1;
			shadowColor = bkShadowColor(color);
		}
		
		if (o.isCircle)
		{
			bkDrawShadowCircle(ctx, coordShadow, 0.5, shadowColor);
		}
		else
		{
			bkDrawShadowRect(ctx, coordShadow, 0.2, shadowColor);
		}
	}
	else
	{
		color = bkColorDesaturate(BUTTON_COLOR);
	}
	
	bkDrawGlassButton(ctx, coord, color, true, o.isCircle ? 0.5 : 0.05);
	
	if (o.img == null || !o.img.isReady)
	{
		ctx.fillStyle = '#fff';
		o.textArea.draw(ctx, coord);
	}
	else
	{
		let iCoord = o.imgScale ? coord.growScaleMin(o.imgScale) : coord;
		o.img.drawFit(ctx, iCoord);
	}
}

const MAX_ANIMATION_COUNTER = 3;
let Bubbles = function(coord, drawer, drawnLots, buyerId)
{
	this.coord = coord;
	this.drawer = drawer;
	this.animationCounter = MAX_ANIMATION_COUNTER;
	this.animationFrames = BUBBLES_FRAMES_ANIMATION;
	this.bubbles = [];
	for (let i = 0; i < drawnLots.length; ++i)
	{
		this.add(drawnLots[i], false);
	}
	this._updateWinner();
}

Bubbles.prototype._updateWinner = function()
{
	this.bubbles = this.bubbles.sort(function (a, b) {
		return a.dice - b.dice;
	});
	
	if (this.bubbles.length > 0)
	{
		this.winnerId = this.bubbles[this.bubbles.length - 1].userId;
	}
	this.animationFrames = BUBBLES_FRAMES_ANIMATION;
	this.animationCounter = MAX_ANIMATION_COUNTER;
}

let _dummyEscape = document.createElement('textarea');
function escapeHtml(html)
{
    _dummyEscape.textContent = html;
    return _dummyEscape.innerHTML;
}

const BUBBLE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" height="256" width="256" version="1.1" ><defs><radialGradient id="a" gradientUnits="userSpaceOnUse" cy="900" cx="100" gradientTransform="matrix(2.1 .7 -.5 1.5 300 -500)" r="120"><stop stop-color="rgba(255,255,255,.3)" offset="0"/><stop stop-color="#0" offset="1"/></radialGradient><radialGradient id="b" gradientUnits="userSpaceOnUse" cy="500" cx="125" gradientTransform="matrix(1 0 0 1 0 430)" r="170"><stop stop-color="#1" offset="0"/><stop stop-color="#2" offset="1"/></radialGradient></defs><g transform="translate(0 -796)"><g><circle cx="128" cy="925" r="119" fill="url(#a)"/><path d="m21 972c48 99 184 91 220-15 9-39-35-27-67-31-32-3-46 34-97 33-50-1-60-5-56 13z" fill="url(#b)"/><path d="m235 877c-47-100-184-91-219 15-9 39 35 27 67 31 32 3 46-34 97-33 50 1 60 6 56-13z" fill="url(#b)"/></g><g fill="#fff"><circle cx="94" cy="903" r="9"/><circle cx="69" cy="874" r="6"/><circle cx="50" cy="853" r="4"/><circle cx="154" cy="951" r="9"/><circle cx="180" cy="980" r="6"/><circle cx="199" cy="999" r="4"/></g><text font-family="Forte" font-size="40px" style="text-anchor:middle;text-align:center" fill="#000"><tspan x="126" y="908">T1</tspan><tspan x="126" y="958">T2</tspan></text></g></svg>';

Bubbles.prototype.add = function(bubble, updateWinner = true)
{
	bubble.x = (bubble.dice & 0xFFF) / 0xFFF - 0.5;
	bubble.y = ((bubble.dice >> 17) & 0xFFF) / 0xFFF - 0.5;
	bubble.dx = ((bubble.dice & 0x7FFF) / 0x7FFF - 0.5) * 0.1;
	bubble.dy = (((bubble.dice >> 15) & 0x7FFF) / 0x7FFF - 0.5) * 0.1;
	let color = bkColorLighten(bubble.dice & 0xFFFFFF);
	bubble.img = new Image();
	let dataStr = BUBBLE_SVG.
		replace('#0', bkColorToStr(color | 0x80000000)).
		replace('#1', bkColorToStr(bkColorMix31(color, 0xFFFFFF))).
		replace('#2', bkColorToStr(bkColorMix31(color, 0) | 0x30000000)).
		replace('T1', escapeHtml(bubble.name)).
		replace('T2', escapeHtml(bubble.lastName));

	bubble.img.src = 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(dataStr);
	this.bubbles.push(bubble);
	if (updateWinner) this._updateWinner();
}

Bubbles.prototype.draw = function()
{
	this.drawer.draw(this);
}

Bubbles.prototype.resize = function()
{
}

let BubbleDrawer = function(system)
{
	this._ctx = system.ctx;
	this._transform = system.transform;
	this._system = system;
}

BubbleDrawer.prototype.draw = function(o)
{
	const DIAMETER_FACTOR = 0.2;
	let coord = o.coord.toScreen(this._transform);
	let ctx = this._ctx;

	let min = coord.w < coord.h ? coord.w : coord.h;
	const DIAMETER = min * DIAMETER_FACTOR;
	let count = o.bubbles.length

	for (let i = 0; i < count; ++i)
	{
		let item = o.bubbles[i];
		if (m_buyerId !== 0)
		{
			if (item.userId !== m_buyerId) continue;
		}
		if (item.userId !== o.winnerId)
		{
			item.dy += 0.0001;
		}
		else
		{
			item.dy -= 0.0001;
		}
		item.x += item.dx;
		if (item.x > .5)
		{
			item.x = .5;
			item.dx *= -0.9;
		}
		if (item.x < -.5)
		{
			item.x = -.5;
			item.dx *= -0.9;
		}
		item.y += item.dy;
		if (item.y > .5)
		{
			item.y = .5;
			item.dy *= -0.9;
		}
		if (item.y < -.5)
		{
			item.y = -.5;
			item.dy *= -0.9;
		}
		item.d = DIAMETER * (1.5 - item.y);
		item.dx *= 0.99;
		item.dy *= 0.99;
	}

	for (let i = 0; i < count; ++i)
	{
		let a = o.bubbles[i];
		for (let j = i + 1; j < count; ++j)
		{
			let b = o.bubbles[j];
			let dx = a.x - b.x;
			let dy = a.y - b.y;
			let d2 = dx * dx + dy * dy;
			let angle = Math.atan2(dy, dx);
			let ndx = Math.cos(angle);
			let ndy = Math.sin(angle);
			let ar = DIAMETER_FACTOR * (1.5 - a.y) * 0.5;
			let br = DIAMETER_FACTOR * (1.5 - b.y) * 0.5;
			let d = Math.sqrt(d2) - ar - br;
			if (d < 0)
			{
				let r = -d * 0.4;
				a.dx *= 0.99;
				a.dy *= 0.99;
				b.dx *= 0.99;
				b.dy *= 0.99;
				a.dx += r * ndx;
				b.dx -= r * ndx;
				a.dy += r * ndy;
				b.dy -= r * ndy;
			}
			else
			{
				let force = 0.0000002 / d2;
				let ddx = force * ndx;
				let ddy = force * ndy;
				a.dx += ddx;
				b.dx += -ddx;
				a.dy += ddy;
				b.dy += -ddy;
			}
		}
	}

	for (let i = 0; i < count; ++i)
	{
		let item = o.bubbles[i];
		if (m_buyerId !== 0)
		{
			if (item.userId !== m_buyerId) continue;
		}
		item.img.draw(ctx, new BkCoord(
			coord.x + item.x * (coord.w - item.d),
			coord.y + item.y * (coord.h - item.d),
			item.d, item.d));
		if ((Math.abs(item.dy) > 1E-4) || (Math.abs(item.dx) > 1E-4))
		{
			o.animationCounter = MAX_ANIMATION_COUNTER;
		}
	}

	if (o.animationFrames > 0)
	{
		--o.animationFrames;
		if (o.animationFrames === 0 && m_buyerId === 0)
		{
			m_finishButton.isDisabled = o.winnerId !== m_userId;
			if (o.winnerId === m_userId)
			{
				let oldCoord = m_finishButton.coord;
				m_finishButton.coord = new BkCoord(0.5,0.5,1,1,8);
				m_finishButton.nextCoord = oldCoord;
				m_finishButton.nextCoord.ticks = MAX_ANIMATION_TICKS;
			}
		}
	}

	if (o.animationCounter > 0)
	{
		--o.animationCounter;
		this._system.redraw = true;
	}
}

function timeStampToString(timeStamp)
{
	let date = new Date(timeStamp);
	return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

let Feast = function(coord, drawer, name,
	voteTime, orderTime, payTime, eventTime, ownerName, imgSrc)
{
	this.coord = coord;
	this.drawer = drawer;
	this._name = null;
	this._description = null;
	this.setName(name);
	let description = "Owner:\n    " + ownerName +
		"\nVoting ends at:\n    " + timeStampToString(voteTime) +
		"\nOrder ends at:\n    " + timeStampToString(orderTime) +
		"\nPayment ends at:\n    " + timeStampToString(payTime) +
		"\nEvent starts at:\n    " + timeStampToString(eventTime);
	this.setDescription(description.replace(/ /g,"\u00A0"));
	this.img = drawer._system.createImage(imgSrc);
}

Feast.prototype.setName = function(name)
{
	if (this._name !== name)
	{
		this._name = name;
		this.textArea = new BkTextArea(
			new BkCoord(0, -1E-9, -1E-9, 0.26, 6),
			name, LARGE_FONT_NAME, 0.6, 4);
	}
}

Feast.prototype.setDescription = function(description)
{
	if (this._description !== description)
	{
		this._description = description;
		this.descriptionTextArea = new BkTextArea(
			new BkCoord(0, 0.3, -1E-9, -0.3, 6),
			description, FONT_NAME, MAX_SMALL_FONT_SIZE, 3 | 0x10);
	}
}

Feast.prototype.draw = function()
{
	this.drawer.draw(this);
}

Feast.prototype.resize = function()
{
	this.textArea.resize();
	this.descriptionTextArea.resize();
}

let FeastDrawer = function(system)
{
	this._ctx = system.ctx;
	this._transform = system.transform;
	this._system = system;
}

FeastDrawer.prototype.draw = function(o)
{
	let coord = o.coord.toScreen(this._transform);
	let ctx = this._ctx;
	let hover = this._system.mouse.hover;
	let isHovered = (o === hover) || (hover && hover.coord && o === hover.coord.parent);
	let showDetails = o.showInfo;
	
	bkDrawShadowRect(ctx, coord, 14, isHovered ? 0xD0000000 : 0x40000000);

	ctx.fillStyle = BOARD_COLOR_STR;
	bkFillRect(ctx, coord);
	
	if (!showDetails)
	{
		let imgCoord = new BkCoord(0, 0, -0.3, -0.3, 7).toScreenCoord(coord);
		imgCoord.w = coord.w;
		imgCoord.x = coord.x;
	
		if (o.img !== null)
		{
			if (o.img.isReady) o.img.drawFit(ctx, imgCoord);
		}
	}
	
	o.textArea.coord.y = showDetails ? 0 : -1E-9;

	coord = coord.growScaleMin(0.94);
	ctx.fillStyle = '#000';
	o.textArea.draw(ctx, coord);
	if (showDetails)
	{
		o.descriptionTextArea.fontHeight = o.textArea._currentFontHeight;
		if (o.descriptionTextArea.fontHeight > MAX_SMALL_FONT_SIZE)
		{
			o.descriptionTextArea.fontHeight = MAX_SMALL_FONT_SIZE;
		}
		o.descriptionTextArea.draw(ctx, coord);
	}
}

let Place = function(coord, drawer, id, name, description, phone, direction, imgSrc)
{
	this.id = id;
	this.coord = coord;
	this.drawer = drawer;
	this.showInfo = false;
	this._name = null;
	this._description = null;
	this._footer  = null;
	this.img = drawer._system.createImage(imgSrc);
	this.copyButton = new Button(
		new BkCoord(-0.025, -0.025, 0.25, 0.25, 6),
		m_buttonDrawer, "Copy");
	this.copyButton.coord.parent = this;
	this.copyButton.img = m_copyImg;
	this.copyButton.imgScale = 0.65;
	this.setTextFields(name, description, phone, direction);
}

Place.prototype.setTextFields = function(name, description, phone, direction)
{
	if (this._name !== name)
	{
		this._name = name;
		this.textArea = new BkTextArea(
			new BkCoord(0, -1E-9, -0.35, 0.26, 6),
			name, LARGE_FONT_NAME, 0.6, 3 | 0x100);
	}

	if (this._description !== description)
	{
		this._description = description;
		this.descriptionTextArea = new BkTextArea(
			new BkCoord(0, -0.32, 1, 0.3, 7),
			description, FONT_NAME, 1, 3 | 0x110);
	}
	
	let footer = 'Phone: ' + phone + '\n' + direction;
	if (this._footer !== footer)
	{
		this._footer = footer;
		this.footerTextArea = new BkTextArea(
			new BkCoord(0, -1E-9, 1, 0.24, 7),
			footer, FONT_NAME, 1, 6);
	}	
}

Place.prototype.draw = function()
{
	this.drawer.draw(this);
}

Place.prototype.resize = function()
{
	this.textArea.resize();
	this.descriptionTextArea.resize();
	this.footerTextArea.resize();
	this.copyButton.resize();
}

let PlaceDrawer = function(system)
{
	this._ctx = system.ctx;
	this._transform = system.transform;
	this._system = system;
}

PlaceDrawer.prototype.draw = function(o)
{
	let coord = o.coord.toScreen(this._transform);
	let ctx = this._ctx;
	
	let hover = this._system.mouse.hover;
	let isHovered = (o === hover) || (hover && hover.coord && o === hover.coord.parent);
	let isUserHovered = (hover !== null) && (o.id === hover.placeId);
	let showDetails = o.showInfo;

	bkDrawShadowRect(ctx, coord, 14,
		isUserHovered ? 0xFF000000 : (isHovered ? 0xD0000000 : 0x40000000));

	ctx.fillStyle = BOARD_COLOR_STR;
	bkFillRect(ctx, coord);
	
	if (!showDetails)
	{
		let imgCoord = new BkCoord(0, 0, -0.3, -0.3, 7).toScreenCoord(coord);
		imgCoord.w = coord.w;
		imgCoord.x = coord.x;
	
		if (o.img === null)
		{
			if (m_placeImg.isReady) m_placeImg.drawFit(ctx, imgCoord);
		}
		else
		{
			if (o.img.isReady) o.img.drawFill(ctx, imgCoord);
		}
	}
	
	o.textArea.coord.y = showDetails ? 0 : -1E-9;
	o.copyButton.coord.y = showDetails ? 0.025 : -0.025;
	
	coord = coord.growScaleMin(0.94);
	ctx.fillStyle = '#000';
	o.textArea.draw(ctx, coord);
	if (showDetails)
	{
		o.descriptionTextArea.fontHeight = o.textArea._currentFontHeight;
		if (o.descriptionTextArea.fontHeight > MAX_SMALL_FONT_SIZE)
		{
			o.descriptionTextArea.fontHeight = MAX_SMALL_FONT_SIZE;
		}
		o.descriptionTextArea.draw(ctx, coord);
		o.footerTextArea.fontHeight = o.descriptionTextArea._currentFontHeight;
		o.footerTextArea.draw(ctx, coord);
	}
}

function webSocketCloseConnection()
{
	m_comService.disconnect();
}

function webSocketHandleOnMessage(event)
{
	m_commandInProcess = false;
	//m_loadingImage.stop();
	
	$.each(event.events, function(index, item) {
		let eventType = Object.getOwnPropertyNames(item.event)[0];
		let event = item.event[eventType];
		switch (eventType) {
			case "org.jala.efeeder.servlets.websocket.avro.WelcomeEvent":
				console.log("Web sockets ready");
				break;
			case "org.jala.efeeder.servlets.websocket.avro.DrawLotsEvent":
				handleDrawLotsEvent(event.userId, event.name, event.lastName, event.dice);
				break;
			case "org.jala.efeeder.servlets.websocket.avro.SetBuyerEvent":
				handleSetBuyerEvent(event.userId);
				break;
		}
	});
}

function handleDrawLotsEvent(userId, name, lastName, dice)
{
	console.log("DrawLots: userId: " + userId + ", name: " + name + ", lastName: " + lastName + ", dice: " + dice);
	let count = m_bubbles.length;
	for (let i = 0; i < count; ++i)
	{
		if (m_bubbles[i].userId === userId) return;
	}
	m_bubbles.add({userId:userId, name:name, lastName:lastName, dice:dice});
	m_uiSystem.redraw = true;
}

function gotoPayment()
{
	// We don't want to store current state in history, otherwise use href.
	window.location.replace("payment?id_food_meeting=" + m_feastId.toString());
}

function handleSetBuyerEvent(userId)
{
	console.log("SetBuyer: UserId: " + userId);
	m_buyerId = userId;
	m_finishButton.isDisabled = true;
	m_uiSystem.redraw = true;
	gotoPayment();
}

function onResize()
{
	let topPos = $("nav").height();
	let usableHeight = $(document).height() - topPos;
	$('#mainCanvas').get(0).style =
		"position:fixed;padding:0;margin:0;left:0;width:100%;top:" +
		topPos + "px;height:" + usableHeight +"px";
	let ratio = m_uiSystem.canvas.clientWidth / m_uiSystem.canvas.clientHeight;
	if (ratio > 1)
	{
		m_bubbles.coord = new BkCoord(0, 0, 0.58, 1, 7);
		m_cardsArea.coord = new BkCoord(0.58, 0, 0.35, 1, 7);
		m_buttonsArea.coord = new BkCoord(0.93, 0.005, 0.065, 0.99, 7);
	}
	else
	{
		m_bubbles.coord = new BkCoord(0, 0, 1, 0.58, 7);
		m_cardsArea.coord = new BkCoord(0, 0.58, 1, 0.35, 7);
		m_buttonsArea.coord = new BkCoord(0.005, 0.93, 0.99, 0.065, 7);
	}
}

function cardMouseDown()
{
	let uiSystem = this.drawer._system;
	let mouse = uiSystem.mouse;
	if (mouse.buttons === 1)
	{
		this.showInfo = !this.showInfo;
		uiSystem.redraw = true;
	}
}

function copyClick()
{
	let uiSystem = this.drawer._system;
	let mouse = uiSystem.mouse;
	if (mouse.buttons !== 1) return;
	
	let o = mouse.hover.coord.parent;
	if (o)
	{
		let text = "";
		if (o._name) text += o._name;
		if (o._description) text = text.concat("\n", o._description);
		if (o._footer) text = text.concat("\n", o._footer);
		var textArea = document.createElement("textarea");
		textArea.style = "";
		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.select();
		try {document.execCommand('copy');} catch(e) {console.log(e);}
		document.body.removeChild(textArea);
	}
}

function onMouseHover()
{
	this.redraw = true;
}

function generateUi()
{
	m_uiSystem = new BkSystem('mainCanvas');
	m_uiSystem.onresize = onResize;
	m_uiSystem.disabledColor = 'rgba(0,0,0,0.5)';

	m_copyImg = m_uiSystem.createImage('/assets/img/copy.svg');
	
	m_buttonDrawer = new ButtonDrawer(m_uiSystem);

	m_buttonsArea = new BkArea(null, 1, 2, null, null, 0x3);
	m_cardsArea = new BkArea(null, null, null, 0.02, 0.03);
	m_uiSystem.addArea(m_buttonsArea);
	m_uiSystem.addArea(m_cardsArea);

	m_finishButton = new Button(
		new BkCoord(),
		m_buttonDrawer, "Finish", finishClick, '/assets/img/finish.svg');
	m_finishButton.area = m_buttonsArea;
	m_finishButton.comparable = 0;
	m_finishButton.isDisabled = m_userId !== m_buyerId;

	m_uiSystem.add(m_finishButton);

	m_feast = new Feast(new BkCoord(), new FeastDrawer(m_uiSystem),
			m_feast.name, m_feast.voteTime, m_feast.orderTime,
			m_feast.payTime, m_feast.eventTime,
			m_feast.ownerName, m_feast.imgSrc);
	m_feast.area = m_cardsArea;
	m_feast.comparable = 0;
	m_feast.onmousedown = cardMouseDown.bind(m_feast);
	m_uiSystem.add(m_feast);
	
	m_place = new Place(new BkCoord(), new PlaceDrawer(m_uiSystem),
			m_place.id, m_place.name, m_place.description,
			m_place.phone, m_place.direction, m_place.image_link);
	m_place.onmousedown = cardMouseDown.bind(m_place);
	m_place.copyButton.onclick = copyClick.bind(m_place);
	m_place.area = m_cardsArea;
	m_feast.comparable = 1;
	m_uiSystem.add(m_place);
	m_uiSystem.add(m_place.copyButton);
	
	m_bubbles = new Bubbles(new BkCoord(), new BubbleDrawer(m_uiSystem),
		m_drawnLots, m_buyerId);
		
	m_uiSystem.add(m_bubbles);

	m_uiSystem.onmousehover = onMouseHover;
}

function initialize()
{
	console.log("Feast id: " + m_feastId + ", Buyer id: " + m_buyerId +
		", Feast: " + JSON.stringify(m_feast) +
		", Place: " + JSON.stringify(m_place) +
		", Drawn lots: " + JSON.stringify(m_drawnLots));

	m_userId = parseInt(Cookies.get("userId"));
	generateUi();

	m_comService = new CommunicationService();
	m_comService.onMessage(webSocketHandleOnMessage);
	m_comService.connect('ws://' + location.host + '/ws', m_feastId.toString());

	$(window).on("load", function() {
		run();
	});

	$(window).on('beforeunload', function() {
		webSocketCloseConnection();
	});
}

function run()
{
	$("#preloader").hide();
	m_uiSystem.startDrawing();
	m_uiSystem.startInteracting();
}

function finishClick()
{
	if (this.isDisabled) return;

	if (m_userId === m_buyerId)
	{
		gotoPayment();
		return;
	}

	m_comService.sendMessage({
		user: 0,
		room: m_feastId.toString(),
		command: "SetBuyer",
		events: [
			{
				event: {
					SetBuyerEvent: {
						userId: 0
					}
				}
			}
		]
	});
}

initialize();
};

let ef_tycheView = new TicheView(g_feastId, g_buyerId, g_feastJson, g_placeJson, g_drawnLotsJson);