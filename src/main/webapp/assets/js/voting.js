'use strict';

let VotingView = function(m_feastId)
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

let m_uiSystem;
let m_sideBarHidden = true;
let m_cardZoomed = null;
let m_cardWasInfo = false;
let m_comService = null;
let m_roomId = null;
let m_userId = null;
let m_ownerId = 0;

let m_placeImg = null;
let m_copyImg = null;
let m_voteImg = null;
let m_placeDrawer = null;
let m_userDrawer = null;
let m_feastDrawer = null;
let m_buttonDrawer = null;
let m_myUser = null;
let m_selectedPlaceId = 0;
let m_showPlacesMenuButton = null;
let m_showInfoButton = null;
let m_zoomButton = null;
let m_finishButton = null;
let m_loadingImage = null;
let m_usersArea = null;
let m_placesArea = null;
let m_buttonsArea = null;

let m_places = [];
let m_users = [];
let m_feast = null;

let m_commandInProcess = false;

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

let LoadingImage = function(coord, drawer, imgSrc)
{
	this.coord = coord;
	this.drawer = drawer;
	this.img = drawer._system.createImage(imgSrc);
	this.angle = 0;
	this.textArea = new BkText(
		new BkCoord(0.05, 0.05, 0.9, 0.9, 7),
		"Updating suggestions...", LARGE_FONT_NAME);
}

LoadingImage.prototype.start = function(startNow = false)
{
	this.time0 = performance.now();
	if (startNow) this.time0 -= LOADING_IMAGE_DELAY_MS;
	let uiSystem = this.drawer._system;
	uiSystem.add(this);
	uiSystem.canvas.style.cursor = 'wait';
}

LoadingImage.prototype.stop = function()
{
	let uiSystem = this.drawer._system;
	uiSystem.canvas.style.cursor = 'auto';
	uiSystem.remove(this);
}

LoadingImage.prototype.draw = function()
{
	if ((performance.now() - this.time0) >= LOADING_IMAGE_DELAY_MS)
	{
		this.drawer.draw(this);
	}
	this.drawer._system.redraw = true;
}

LoadingImage.prototype.resize = function()
{
	this.textArea.resize();
}

let LoadingImageDrawer = function(system)
{
	this._ctx = system.ctx;
	this._transform = system.transform;
	this._system = system;
}

LoadingImageDrawer.prototype.draw = function(o)
{
	if ((o.img !== null) && o.img.isReady)
	{
		let coord = o.coord.toScreen(this._transform);
		let ctx = this._ctx;
		ctx.save();
		ctx.translate(coord.x, coord.y);
		ctx.rotate(o.angle);
		ctx.translate(-coord.x, -coord.y);
		o.img.draw(ctx, coord);
		ctx.restore();
		o.angle += 0.1;
		if (o.angle > 2* Math.PI) o.angle -= 2* Math.PI;
		ctx.fillStyle = '#555';
		o.textArea.draw(ctx, coord);
	}
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
	let description = "Owner: " + ownerName +
		"\n\nVoting ends at:\n" + timeStampToString(voteTime) +
		"\n\nOrder ends at:\n" + timeStampToString(orderTime) +
		"\n\nPayment ends at:\n" + timeStampToString(payTime) +
		"\n\nEvent starts at:\n" + timeStampToString(eventTime);
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


let User = function(coord, drawer, id, name, placeId)
{
	this.id = id;
	this.coord = coord;
	this.drawer = drawer;
	this.placeId = placeId;
	this.isChecked = false;
	this._name = null;
	this.setName(name);
}

User.prototype.setName = function(name)
{
	if (this._name !== name)
	{
		this._name = name;	
		this.textArea = new BkTextArea(
			new BkCoord(0.1, 0.05, -1.1, 0.9, 6),
			name,
			FONT_NAME,
			0.5);
	}
}

User.prototype.draw = function()
{
	this.drawer.draw(this);
}

User.prototype.resize = function()
{
	this.textArea.resize();
}

let UserDrawer = function(system)
{
	this._ctx = system.ctx;
	this._transform = system.transform;
	this._system = system;
}

UserDrawer.prototype.draw = function(o)
{
	let coord = o.coord.toScreen(this._transform);
	let ctx = this._ctx;
	let isHovered = o === this._system.mouse.hover;
	let isSelected = m_myUser === o;
	
	bkDrawShadowRect(ctx, coord, 10,
		o.isChecked ? 0xFF000000 : (isHovered ? 0xD0000000 : 0x40000000));
	
	let color = isSelected ? SELECTED_USER_COLOR : USER_COLOR;
	
	ctx.fillStyle = bkColorToStr(color);
	bkFillRect(ctx, coord);

	ctx.fillStyle = '#000';
	o.textArea.draw(ctx, coord);
	if (o.placeId > 0)
	{
		m_voteImg.drawFit(ctx, new BkCoord(-0.15, 0.15, 0.7, 0.7, 6).toScreenCoord(coord));
	}
}

let Place = function(coord, drawer, id, name, description, phone, direction, votes, imgSrc, isSelected)
{
	this.id = id;
	this.coord = coord;
	this.drawer = drawer;
	this.showInfo = false;
	this._name = null;
	this._description = null;
	this._footer  = null;
	this.img = drawer._system.createImage(imgSrc);
	this.voteButton = new Button(
		new BkCoord(-0.025, -0.025, 0.25, 0.25, 6),
		m_buttonDrawer, votes.toString());
	this.voteButton.coord.parent = this;
	this.voteButton.imgScale = 0.65;
	this.voteButton.isSelected = isSelected;

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
	this.voteButton.resize();
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
	o.voteButton.coord.y = showDetails ? 0.025 : -0.025;
	o.voteButton.img = showDetails ? m_copyImg : null;
	
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

function isPlace(o)
{
	return m_places.indexOf(o) !== -1;
}

function getPlaceById(placeId)
{
	let count = m_places.length;
	for (let i = 0; i < count; ++i)
	{
		if (m_places[i].id === placeId) return m_places[i];
	}
	return null;
}

function getUserById(userId)
{
	let count = m_users.length;
	for (let i = 0; i < count; ++i)
	{
		if (m_users[i].id === userId) return m_users[i];
	}
	return null;
}

function getOrderList(list, getComparable)
{
	const count = list.length;
	let indexesBuffer = new ArrayBuffer(count * 4);
	let indexes = new Int32Array(indexesBuffer);

	let tempList = [];
	for (let i = 0; i < count; ++i)
	{
		tempList.push({key:getComparable(list[i]), value:i});
	}

	tempList.sort(function(a, b) {
			return +(a.key > b.key) || +(a.key === b.key) - 1;
		});

	for (let i = 0; i < count; ++i)
	{
		indexes[tempList[i].value] = i;
	}
	
	return indexes;
}

function processUserPlaceJson(json)
{
	console.log(JSON.stringify(json));
	
	if (!json.users || !json.places)
	{
		return;
	}
	
	if (json.feast != null)
	{
		m_ownerId = json.feast.ownerId;
		if (m_ownerId <= 0)
		{
			finishAction();
			return;
		}
	}
	
	let count = m_users.length;
	for (let i = 0; i < count; ++i)
	{
		m_users[i].drawer = null;
	}
	
	m_selectedPlaceId = 0;
	m_myUser = null;
	let list = json.users;
	count = list.length;
	for (let i = 0; i < count; ++i)
	{
		let userId = list[i].userId;
		let item = getUserById(userId);
		
		if (item === null)
		{
			item = new User(new BkCoord(), m_userDrawer, userId,
				list[i].name, list[i].placeId);
			m_users.push(item);
			item.area = m_usersArea;
			m_uiSystem.add(item);
		}
		else
		{
			item.drawer = m_userDrawer;
			item.setName(list[i].name);
			item.placeId = list[i].placeId;
		}
		
		item.comparable = list[i].name.toLowerCase();

		if (m_userId === userId)
		{
			m_myUser = item;
			m_selectedPlaceId = item.placeId;
		}
	}
	
	list = [];
	count = m_users.length;
	for (let i = 0; i < count; ++i)
	{
		if (m_users[i].drawer === null)
		{
			m_uiSystem.remove(m_users[i]);
		}
		else
		{
			list.push(m_users[i]);
		}
	}
	m_users = list;
	
	count = m_places.length;
	for (let i = 0; i < count; ++i)
	{
		m_places[i].drawer = null;
	}
	
	let topCount = 0;
	let topVotes = 0;
	list = json.places;
	let indexes = getOrderList(list, function(o){return o.name.toLowerCase();});
	count = list.length;
	for (let i = 0; i < count; ++i)
	{
		let placeId = list[i].id;
		let item = getPlaceById(placeId);
		let isSelected = m_selectedPlaceId === placeId;
		let votes = list[i].votes;
		if (item === null)
		{
			item = new Place(new BkCoord(),
				m_placeDrawer,
				list[i].id, list[i].name, list[i].description,
				list[i].phone, list[i].direction,
				votes, list[i].image_link,
				isSelected);

			item.onmousedown = placeMouseDown.bind(item);
			item.voteButton.onclick = placeClick.bind(item);
			
			m_places.push(item);
			item.area = m_placesArea;
			m_uiSystem.add(item);
			m_uiSystem.add(item.voteButton);
		}
		else
		{
			item.drawer = m_placeDrawer;
			item.voteButton.isSelected = isSelected;
			item.voteButton.textArea.text = votes.toString();
			item.setTextFields(
				list[i].name, list[i].description,
				list[i].phone, list[i].direction);
			item.img = m_placeDrawer._system.createImage(list[i].image_link, item.img);
		}
		
		if (votes >= topVotes)
		{
			if (votes === topVotes)
			{
				++topCount;
			}
			else
			{
				topVotes = votes;
				topCount = 1;
			}
		}

		item.comparable = (indexes[i] / count) - votes * 2;
		if (isSelected) --item.comparable;
		item.area = m_placesArea;
		bkObjectSetSelected(item, isSelected);
	}
	
	list = [];
	count = m_places.length;
	for (let i = 0; i < count; ++i)
	{
		if (m_places[i].drawer === null)
		{
			m_uiSystem.remove(m_places[i].voteButton);
			m_uiSystem.remove(m_places[i]);
		}
		else
		{
			list.push(m_places[i]);
		}
	}
	m_places = list;
	
	if (json.feast != null)
	{
		let feast = json.feast;
		m_feast = new Feast(new BkCoord(), m_feastDrawer, feast.name,
			feast.voteTime, feast.orderTime, feast.payTime, feast.eventTime,
			feast.ownerName, feast.imgSrc);
		m_feast.area = m_placesArea;
		m_feast.comparable = Number.MAX_SAFE_INTEGER;
		m_feast.onmousedown = placeMouseDown.bind(m_feast);
		m_uiSystem.add(m_feast);
	}

	if (m_ownerId === m_userId)
	{
		m_finishButton.isDisabled = topCount !== 1;
		m_uiSystem.add(m_finishButton);
	}
	else
	{
		m_uiSystem.remove(m_finishButton);
	}
	
	upTimeBrightenedUsers(m_uiSystem.mouse.hover);
	
	m_uiSystem.redistribute();
}

function showPlacesClick(mouse)
{
	if (mouse.buttons === 1)
	{
		showSideBar();
	}
}

/**
 * @param feastId Positive integer id
 * @param placeId Positive integer id, or -1 to remove current suggestion
 */
function addSuggestion(feastId, placeId)
{
	if (m_ownerId <= 0) return;
	if (isNaN(placeId)) return;
	
	hideSideBar();
	m_commandInProcess = true;
	m_loadingImage.start();
	m_comService.sendMessage({
			user: 0,
			room: "vote_" + feastId.toString(),
			command: "CreateSuggestion",
			events:[{
				event:{ 
					CreateSuggestionEvent:{
						feastId: feastId,
						placeId: placeId,
						places: "",
						users: "",
						}
					}
				}]
		});
}

function placeMouseDown()
{
	let uiSystem = this.drawer._system;
	let mouse = uiSystem.mouse;
	if (mouse.buttons === 1)
	{
		if (m_zoomButton.isChecked)
		{
			let count = m_places.length;
			if (m_cardZoomed === null)
			{
				m_cardWasInfo = this.showInfo;
				m_cardZoomed = this;
				this.showInfo = true;
				for (let i = 0; i < count; ++i)
				{
					uiSystem.remove(m_places[i]);
					if (m_places[i].voteButton) uiSystem.remove(m_places[i].voteButton);
				}
				uiSystem.remove(m_feast);
				uiSystem.add(this);
				if (this.voteButton) uiSystem.add(this.voteButton);
				
			}
			else
			{
				this.showInfo = m_cardWasInfo;
				m_cardZoomed = null;
				for (let i = 0; i < count; ++i)
				{
					uiSystem.add(m_places[i]);
					if (m_places[i].voteButton) uiSystem.add(m_places[i].voteButton);
				}
				if (m_showInfoButton.isChecked) uiSystem.add(m_feast);
			}
			
			uiSystem.redistribute();
		}
		else
		{
			this.showInfo = !this.showInfo;
			uiSystem.redraw = true;
		}
	}
}

function zoomClick()
{
	let uiSystem = this.drawer._system;
	let mouse = m_uiSystem.mouse;
	if ((mouse.buttons === 1) && (!this.isDisabled))
	{
		this.isChecked = !this.isChecked;
		
		if (!this.isChecked && m_cardZoomed)
		{
			let count = m_places.length;
			for (let i = 0; i < count; ++i)
			{
				uiSystem.add(m_places[i]);
				if (m_places[i].voteButton) uiSystem.add(m_places[i].voteButton);
			}
			if (m_showInfoButton.isChecked) uiSystem.add(m_feast);
			m_cardZoomed.showInfo = m_cardWasInfo;
			m_cardZoomed = null;
		}
		
		uiSystem.redistribute();
	}
}


function placeClick()
{
	let uiSystem = this.drawer._system;
	let mouse = uiSystem.mouse;
	if (mouse.buttons !== 1) return;
	
	if (this.showInfo)
	{
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
	else if (!m_commandInProcess)
	{
		let placeId = this.voteButton.isSelected ? -1 : this.id;
		this.voteButton.isSelected = !this.voteButton.isSelected;
		uiSystem.redraw = true;
		addSuggestion(m_feastId, placeId);
		return;
	}
}

function upTimeBrightenedUsers(hover)
{
	let hoverId = -1;
	if (hover)
	{
		if (isPlace(hover))
		{
			hoverId = hover.id;
		}
		else if (hover.coord && isPlace(hover.coord.parent))
		{
			hoverId = hover.coord.parent.id;
		}
	}
	
	for (let i = 0, count = m_users.length; i < count; ++i) 
	{
		m_users[i].isChecked = hoverId === m_users[i].placeId;
	}
}

function showInfoClick()
{
	let mouse = m_uiSystem.mouse;
	if ((mouse.buttons === 1) && (!this.isDisabled))
	{
		this.isChecked = !this.isChecked;
		
		if (this.isChecked)
		{
			this.drawer._system.add(m_feast);
		}
		else
		{
			this.drawer._system.remove(m_feast);
		}
		this.drawer._system.redistribute();
	}
}

function onCanvasClick()
{
	if (m_uiSystem._isInteracting)
	{
		hideSideBar();
	}
}

function onMouseHover()
{
	upTimeBrightenedUsers(this.mouse.hover);
	this.redraw = true;
}

function handleWsOnMessage(event)
{
	m_commandInProcess = false;
	m_loadingImage.stop();
	
	$.each(event.events, function(index, item) {
		let eventType = Object.getOwnPropertyNames(item.event)[0];
		switch (eventType) {
			case "org.jala.efeeder.servlets.websocket.avro.WelcomeEvent":
				break;
			case "org.jala.efeeder.servlets.websocket.avro.CloseVotingEvent":
				m_ownerId = 0;
				finishAction();
				break;
			case "org.jala.efeeder.servlets.websocket.avro.CreateSuggestionEvent":
				let eventMessage = item.event[eventType];
				eventMessage.users = JSON.parse(eventMessage.users);
				eventMessage.places = JSON.parse(eventMessage.places);
				processUserPlaceJson(eventMessage);
				break;
		}
	});
}

function finishClick()
{
	if (this.isDisabled) return;
	
	$.ajax({
		url: '/action/SetWinnerPlace?feastId=' + m_feastId.toString(),
		success: function(result){
			finishAction();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
		}
	});
	
}

function finishAction()
{
	// We don't want to store current state in history, otherwise use href.
	window.location.replace(
		"action/order?id_food_meeting=" + m_feastId.toString());
}

function onResize()
{
	let topPos = $("nav").height();
	let usableHeight = $(document).height() - topPos;
	$('#mainCanvas').get(0).style =
		"position:fixed;padding:0;margin:0;left:0;width:100%;top:" +
		topPos + "px;height:" + usableHeight +"px";
	let mainSideNav = $('#mainSideNav').get(0);
	mainSideNav.style.top = topPos + "px";
	mainSideNav.style.height = usableHeight + "px";

	let ratio = m_uiSystem.canvas.clientWidth / m_uiSystem.canvas.clientHeight;
	if (ratio > 2.76)
	{
		m_placesArea.coord = new BkCoord(0, 0, 0.75, 1, 7);
		m_usersArea.coord = new BkCoord(0.75, 0, 0.2, 1, 7);
		m_buttonsArea.coord = new BkCoord(0.95, 0.02, 0.045, 0.96, 7);
	}
	else if (ratio <= 0.8)
	{
		m_placesArea.coord = new BkCoord(0, 0, 1, 0.73, 7);
		m_usersArea.coord = new BkCoord(0, 0.73, 1, 0.2, 7);
		m_buttonsArea.coord = new BkCoord(0.005, 0.93, 0.99, 0.065, 7);
	
	}
	else
	{
		m_placesArea.coord = new BkCoord(0, 0, 0.76, 1, 7);
		m_usersArea.coord = new BkCoord(0.76, 0, 0.24, 0.88, 7);
		m_buttonsArea.coord = new BkCoord(0.76, 0.88, 0.235, 0.11, 7);
	}
}

function showSideBar()
{
	if (!m_sideBarHidden) return;

	let nav = $('#mainSideNav').get(0);
	if (nav)
	{
		nav.style.visibility = 'visible';
		nav.style.left = '0px';
	}

	m_uiSystem.stopInteracting();
	m_sideBarHidden = false;
}

function hideSideBar()
{
	if (m_sideBarHidden) return;
	
	let nav = $('#mainSideNav').get(0);
	if (nav)
	{
		nav.style.visibility = 'hidden';
		nav.style.left = '-' + nav.offsetWidth + 'px';
	}
	
	m_uiSystem.startInteracting();
	m_sideBarHidden = true;
}

function run()
{
	m_uiSystem = new BkSystem('mainCanvas');
	m_uiSystem.onresize = onResize;
	
	m_usersArea = new BkArea(null, 5.083, 1, null, 0.12);
	m_placesArea = new BkArea();
	m_buttonsArea = new BkArea(null, 1, 2, null, null, 0x3);	
	m_uiSystem.addArea(m_usersArea);
	m_uiSystem.addArea(m_placesArea);
	m_uiSystem.addArea(m_buttonsArea);
	m_voteImg = m_uiSystem.createImage('/assets/img/vote.svg');
	m_placeImg = m_uiSystem.createImage('/assets/img/place.svg');
	m_copyImg = m_uiSystem.createImage('/assets/img/copy.svg');

	m_uiSystem.disabledColor = 'rgba(0,0,0,0.5)';
	m_placeDrawer = new PlaceDrawer(m_uiSystem);
	m_userDrawer = new UserDrawer(m_uiSystem);
	m_feastDrawer = new FeastDrawer(m_uiSystem);

	m_buttonDrawer = new ButtonDrawer(m_uiSystem);
	m_showPlacesMenuButton = new Button(
		new BkCoord(),
		m_buttonDrawer, "Places", showPlacesClick, '/assets/img/places.svg');
	m_showPlacesMenuButton.area = m_buttonsArea;
	m_showPlacesMenuButton.comparable = 0;
	
	m_showInfoButton = new Button(
		new BkCoord(),
		m_buttonDrawer, "Info", showInfoClick, '/assets/img/info.svg');
	m_showInfoButton.area = m_buttonsArea;
	m_showInfoButton.comparable = 1;
	m_showInfoButton.isChecked = true;
	
	m_zoomButton = new Button(
		new BkCoord(),
		m_buttonDrawer, "Zoom", zoomClick, '/assets/img/grow.svg');
	m_zoomButton.area = m_buttonsArea;
	m_zoomButton.comparable = 2;
	
	m_finishButton = new Button(
		new BkCoord(),
		m_buttonDrawer, "Finish", finishClick, '/assets/img/finish.svg');
	m_finishButton.area = m_buttonsArea;
	m_finishButton.comparable = 3;
	
	m_uiSystem.add(m_showPlacesMenuButton);
	m_uiSystem.add(m_showInfoButton);
	m_uiSystem.add(m_zoomButton);

	m_uiSystem.onmousehover = onMouseHover;
	m_uiSystem.onclick = onCanvasClick;
	
	m_loadingImage = new LoadingImage(
		new BkCoord(0, 0, 1, 1),
		new LoadingImageDrawer(m_uiSystem),
		'/assets/img/wait.svg');

	// Communication
	m_roomId = "vote_" + m_feastId.toString();
	m_userId = parseInt(Cookies.get("userId"));
	
	m_comService = new CommunicationService();
	m_comService.onMessage(handleWsOnMessage);
	m_comService.connect('ws://' + location.host + '/ws', m_roomId);
	
	$.ajax({
		url: '/action/getSuggestions?feastId=' + m_feastId.toString(),
		success: function(result){
			$("#preloader").hide();
			m_uiSystem.startDrawing();
			processUserPlaceJson(result);
			if (m_selectedPlaceId === 0)
			{
				showSideBar();
			}
			else
			{
				m_uiSystem.startInteracting();
			}
		}
	});	
}

function initChronometer() {
	$(".countdown").attr("data-date", $('#voting_time').val());
	$('.countdown').countdown({
		refresh: 1000,
		offset: 0,
		onEnd: function() {
			return;
		},
		render: function(date) {
			if (date.days !== 0) {
				this.el.innerHTML = date.days + " DAYS";
			} else {
				this.el.innerHTML = this.leadingZeros(date.hours) + ":" +
				this.leadingZeros(date.min) + "." +
				this.leadingZeros(date.sec);
				if (date.min <= 30 && date.hours === 0){
					$(".countdown").css('color', 'red');
				}
			}
		}
	});
}

function initialize()
{
	initChronometer();
	$('#mainSideNav').get(0).style = "position:fixed;visibility:hidden;width:300px;left:-300px;top:" +
		$("nav").height() + "px;margin:0;padding-bottom:60px;background-color:#fff; overflow:auto;z-index:1;transition:visibility 1s,left 1s;"
	$('#mainCanvas').get(0).className = "";
}

initialize();
return {
	run:run,
	addSuggestion:addSuggestion
};

}

let ef_votingView = new VotingView(g_feastId);

$(window).on("load", function() {
	ef_votingView.run();
});