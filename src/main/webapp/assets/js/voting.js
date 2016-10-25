'use strict';

let VotingView = function(m_feastId)
{

const BUTTON_COLOR = 0xFF26A69A;
const VOTES_COLOR = BUTTON_COLOR;
const SELECTED_VOTES_COLOR = bkColorLighten(VOTES_COLOR);
const BUTTON_HOVER_COLOR = bkColorMix31(BUTTON_COLOR, SELECTED_VOTES_COLOR);
const USER_COLOR = 0xFFFFFFFF;
const SELECTED_USER_COLOR = bkColorMix31(USER_COLOR, SELECTED_VOTES_COLOR);
const BOARD_COLOR_STR = '#fff';
const LARGE_FONT_NAME = 'Roboto';
const FONT_NAME = 'Tahoma';

let m_uiSystem;
let m_sideBarHidden = false;
let m_comService = null;
let m_roomId = null;
let m_userId = null;
let m_ownerId = 0;
let m_winnerPlaceId = 0;

let m_shrinkImg = null;
let m_growImg = null;
let m_placeImg = null;
let m_placeDrawer = null;
let m_userDrawer = null;
let m_myUser = null;
let m_showPlacesMenuButton = null;
let m_showInfoButton = null;
let m_finishButton = null;
let m_waitImage = null;
let m_usersArea = null;
let m_placesArea = null;

let m_commandInProcess = false;

function ef_buttonOnClick(mouse)
{
	if ((mouse.buttons === 1) && (!this.isDisabled))
	{
		this.isChecked = !this.isChecked;
		this.drawer._system.redraw = true;
	}
}

function ef_buttonOnGuiAction()
{
	this.drawer._system.redraw = true;
}

let ef_WaitImage = function(coord, drawer, imgSrc)
{
	this.coord = coord;
	this.drawer = drawer;
	this.img = drawer._system.createImage(imgSrc);
	this.angle = 0;
	this.textArea = new BkText(
		new BkCoord(0.05, 0.05, 0.9, 0.9, 0, 7),
		"Updating suggestions...", LARGE_FONT_NAME);	
}

ef_WaitImage.prototype.start = function()
{
	this.time0 = performance.now();
	this.drawer._system.add(this);
}

ef_WaitImage.prototype.stop = function()
{
	this.drawer._system.remove(this);
}

ef_WaitImage.prototype.draw = function()
{
	if ((performance.now() - this.time0) > 500)
	{
		this.drawer.draw(this);
	}
	this.drawer._system.redraw = true;
}

ef_WaitImage.prototype.resize = function()
{
	this.textArea.resize();
}

let ef_WaitImageDrawer = function(system)
{
	this._ctx = system.ctx;
	this._transform = system.transform;
	this._system = system;
}

ef_WaitImageDrawer.prototype.draw = function(o)
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

let ef_Button = function(coord, drawer, text, onclick = null, imgSrc = null)
{
	this.coord = coord;
	this.drawer = drawer;
	this.isChecked = false;
	this.isDown = false;
	this.isDisabled = false;
	this.onclick = onclick === null ? ef_buttonOnClick.bind(this) : onclick;
	this.onmousedown = ef_buttonOnGuiAction.bind(this);
	this.onmouseup = ef_buttonOnGuiAction.bind(this);
	
	this.isCircle = coord.w === coord.h;
	this.textArea = new BkText(
		new BkCoord(0.05, 0.1, 0.9, 0.9, 0, 7),
		text, FONT_NAME);
	this.img = drawer._system.createImage(imgSrc);
}

ef_Button.prototype.draw = function()
{
	this.drawer.draw(this);
}

ef_Button.prototype.resize = function()
{
	this.textArea.resize();
}

let ef_ButtonDrawer = function(system)
{
	this._ctx = system.ctx;
	this._transform = system.transform;
	this._system = system;
}

ef_ButtonDrawer.prototype.draw = function(o)
{
	let coord = o.coord.toScreen(this._transform);
	let ctx = this._ctx;
	let color;
	
	if (!o.isDisabled)
	{
		let isHovered = o === this._system.mouse.hover;
		color = isHovered ? BUTTON_HOVER_COLOR : BUTTON_COLOR;
		let shadowColor;
		let coordShadow = coord.growScaleMin((isHovered || o.isChecked) ? 1.2 : 1.1);
		//if (o.isChecked || ((this._system.mouse.buttons === 1) && isHovered))
		if (o.isChecked || ((this._system.mouse.selected === o) && isHovered))
		{
			coord.y += coord.h * 0.05;
			coordShadow.y += coord.h * 0.05;
			shadowColor = 0xFF000000;
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
			coord.x = Math.floor(coord.x);
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
		o.img.drawFit(ctx, coord);
	}
}

let ef_User = function(coord, drawer, id, name, placeId)
{
	this.id = id;
	this.coord = coord;
	this.drawer = drawer;
	this.placeId = placeId;
	this.isChecked = false;
	this.setName(name);
}

ef_User.prototype.setName = function(name)
{
	this.textArea = new BkTextArea(
		new BkCoord(0.1, 0.1, 0.8, 0.8, 0, 7),
		name,
		FONT_NAME,
		0.6);
}

ef_User.prototype.draw = function()
{
	this.drawer.draw(this);
}

ef_User.prototype.resize = function()
{
	this.textArea.resize();
}

let ef_UserDrawer = function(system)
{
	this._ctx = system.ctx;
	this._transform = system.transform;
	this._system = system;
}

ef_UserDrawer.prototype.draw = function(o)
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
}

let ef_Place = function(coord, drawer, id, name, description, phone, direction, votes, imgSrc, isSelected)
{
	this.id = id;
	this.coord = coord;
	this.drawer = drawer;
	this.votes = votes;
	this.isSelected = isSelected;
	this.__name = null;
	this.__description = null;
	this.__footer  = null;
	this.img = drawer._system.createImage(imgSrc);
	
	this.votesText = new BkText(
		new BkCoord(-0.025, -0.025, 0.25, 0.25, 0, 6), null, LARGE_FONT_NAME);
	
	this.setTextFields(name, description, phone, direction);
}

ef_Place.prototype.setTextFields = function(name, description, phone, direction)
{
	if (this.__name !== name)
	{
		this.__name = name;
		this.textArea = new BkTextArea(
			new BkCoord(0, -1E-9, -0.35, 0.26, 0, 6),
			name, LARGE_FONT_NAME, 0.6, 3 | 0x100);
	}

	if (this.__description !== description)
	{
		this.__description = description;
		this.descriptionTextArea = new BkTextArea(
			new BkCoord(0, -0.35, 1, 0.3, 0, 7),
			description, FONT_NAME, 20, 3 | 0x110);
	}
	
	let footer = 'Phone: ' + phone + '\nAddress: ' + direction;
	if (this.__footer !== footer)
	{
		this.__footer = footer;
		this.footerTextArea = new BkTextArea(
			new BkCoord(0, -1E-9, 1, 0.2, 0, 7),
			footer, FONT_NAME, 20, 6);
	}	
}

ef_Place.prototype.draw = function()
{
	this.drawer.draw(this);
}

ef_Place.prototype.resize = function()
{
	this.textArea.resize();
	this.descriptionTextArea.resize();
	this.footerTextArea.resize();
	this.votesText.resize();
}

let ef_PlaceDrawer = function(system)
{
	this._ctx = system.ctx;
	this._transform = system.transform;
	this._system = system;
}

ef_PlaceDrawer.prototype.draw = function(o)
{
	let coord = o.coord.toScreen(this._transform);
	let ctx = this._ctx;
	
	let hover = this._system.mouse.hover;
	let isHovered = (o === hover);
	let isUserHovered = (hover !== null) && (o.id === hover.placeId);
	let showDetails = m_showInfoButton.isChecked;

	bkDrawShadowRect(ctx, coord, 14,
		isUserHovered ? 0xFF000000 : (isHovered ? 0xD0000000 : 0x40000000));

	ctx.fillStyle = BOARD_COLOR_STR;
	bkFillRect(ctx, coord);
	
	if (!showDetails)
	{
		let imgCoord = new BkCoord(0, 0, -0.3, -0.3, 0, 7).toScreenCoord(coord);
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
	o.votesText.coord.y = showDetails ? 0.025 : -0.025;
	
	let votesCoord = o.votesText.coord.toScreenCoord(coord).growScaleMin(1.05);
	bkDrawGlassButton(ctx, votesCoord, o.isSelected ? SELECTED_VOTES_COLOR : VOTES_COLOR, true, 0.5);
	ctx.fillStyle = '#fff';
	o.votesText.text = o.votes.toString();
	o.votesText.draw(ctx, coord);
	
	coord = coord.growScaleMin(0.94);
	
	if (showDetails)
	{
		
		ctx.fillStyle = '#000';
		o.descriptionTextArea.draw(ctx, coord);
		o.footerTextArea.draw(ctx, coord);
	}
	
	ctx.fillStyle = '#000';
	o.textArea.draw(ctx, coord);
}

let ef_places = [];
function ef_isPlace(o)
{
	return ef_places.indexOf(o) !== -1;
}

function ef_getPlaceById(placeId)
{
	let count = ef_places.length;
	for (let i = 0; i < count; ++i)
	{
		if (ef_places[i].id === placeId) return ef_places[i];
	}
	return null;
}

let ef_users = [];
function ef_getUserById(userId)
{
	let count = ef_users.length;
	for (let i = 0; i < count; ++i)
	{
		if (ef_users[i].id === userId) return ef_users[i];
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
	
	if (json.ownerId != null)
	{
		m_ownerId = json.ownerId;
		if (m_ownerId <= 0)
		{
			finishAction();
			return;
		}
	}
	
	let count = ef_users.length;
	for (let i = 0; i < count; ++i)
	{
		ef_users[i].drawer = null;
	}
	
	let selectedPlaceId = null;
	m_myUser = null;
	let list = json.users;
	count = list.length;
	for (let i = 0; i < count; ++i)
	{
		let userId = list[i].userId;
		let item = ef_getUserById(userId);
		
		if (item === null)
		{
			item = new ef_User(new BkCoord(), m_userDrawer, userId,
				list[i].name, list[i].placeId);
			ef_users.push(item);
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
			selectedPlaceId = item.placeId;
		}
	}
	
	list = [];
	count = ef_users.length;
	for (let i = 0; i < count; ++i)
	{
		if (ef_users[i].drawer === null)
		{
			m_uiSystem.remove(ef_users[i]);
		}
		else
		{
			list.push(ef_users[i]);
		}
	}
	ef_users = list;
	
	count = ef_places.length;
	for (let i = 0; i < count; ++i)
	{
		ef_places[i].drawer = null;
	}
	
	let topCount = 0;
	let topVotes = 0;
	let winnerPlaceId = 0;
	list = json.places;
	let indexes = getOrderList(list, function(o){return o.name.toLowerCase();});
	count = list.length;
	for (let i = 0; i < count; ++i)
	{
		let placeId = list[i].id;
		let item = ef_getPlaceById(placeId);
		let isSelected = selectedPlaceId === placeId;
		let votes = list[i].votes;
		if (item === null)
		{
			item = new ef_Place(new BkCoord(),
				m_placeDrawer,
				list[i].id, list[i].name, list[i].description,
				list[i].phone, list[i].direction,
				votes, list[i].image_link,
				isSelected);
				
			item.onclick = addSuggestionClick.bind(item);
			
			ef_places.push(item);
			item.area = m_placesArea;
			m_uiSystem.add(item);
		}
		else
		{
			item.drawer = m_placeDrawer;
			item.isSelected = isSelected;
			item.votes = votes;
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
				winnerPlaceId = placeId;
			}
		}

		item.comparable = (indexes[i] / count) - votes * 2;
		if (isSelected) --item.comparable;
		item.area = m_placesArea;
		bkObjectSetSelected(item, isSelected);
	}
	
	list = [];
	count = ef_places.length;
	for (let i = 0; i < count; ++i)
	{
		if (ef_places[i].drawer === null)
		{
			m_uiSystem.remove(ef_places[i]);
		}
		else
		{
			list.push(ef_places[i]);
		}
	}
	ef_places = list;
	
	if ( m_ownerId === m_userId)
	{
		m_finishButton.isDisabled = topCount !== 1;
		m_winnerPlaceId = winnerPlaceId;
		m_uiSystem.add(m_finishButton);
	}
	else
	{
		m_uiSystem.remove(m_finishButton);
	}	
	
	updateBrightenedUsers(m_uiSystem.mouse.hover);
	
	m_uiSystem.redistribute();
}

function showPlacesClick(mouse)
{
	if (mouse.buttons === 1)
	{
		restoreSideBar();
	}
}

function restoreSideBar()
{
	if (!m_sideBarHidden) return;

	let nav = $('#mainSideNav').get(0);
	if (nav)
	{
		nav.style.visibility = 'visible';
		nav.style.left = '0px';
	}
	
	m_uiSystem.stopInteracting();
	m_showPlacesMenuButton.isEnabled = false;
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
	m_showPlacesMenuButton.isEnabled = true;
	m_sideBarHidden = true;
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
	m_waitImage.start();
	m_uiSystem.canvas.cursor = 'progress';

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

function addSuggestionClick()
{
	if (!m_commandInProcess)
	{
		let placeId = this.isSelected ? -1 : this.id;
		this.isSelected = !this.isSelected;

		m_uiSystem.redraw = true;
		
		addSuggestion(m_feastId, placeId);
	}
}

function updateBrightenedUsers(hover)
{
	let hoverId = ((hover !== null) && ef_isPlace(hover)) ? hover.id : -1;
	for (let i = 0, count = ef_users.length; i < count; ++i) 
	{
		ef_users[i].isChecked = hoverId === ef_users[i].placeId;
	}
}

function onMouseHover()
{
	updateBrightenedUsers(this.mouse.hover);
	this.redraw = true;
}

function handleWsOnMessage(event)
{
	m_commandInProcess = false;
	m_waitImage.stop();
	m_uiSystem.canvas.cursor = 'auto';
	
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
}

function initializeElement()
{
	$(".button-collapse").sideNav();

	$('#mainSideNav').get(0).style = "position:fixed;width: 300px;left: 0;top: " +
		$("nav").height() + "px;margin: 0;height: 100%;height: calc(100% + 60px);height: -moz-calc(100%);padding-bottom: 60px;background-color: #fff;overflow:auto;z-index:1;transition: visibility 1s, left 1s;"
	
	$('#mainCanvas').get(0).parentElement.className = "";
	$('.drag-target').get(0).style="visibility:hidden";	
}

function run()
{
	initializeElement();
	
	m_uiSystem = new BkSystem('mainCanvas');
	m_uiSystem.disabledColor = 'rgba(0,0,0,0.5)';
	m_shrinkImg = m_uiSystem.createImage('/assets/img/shrink.svg');
	m_growImg = m_uiSystem.createImage('/assets/img/grow.svg');
	m_placeImg = m_uiSystem.createImage('/assets/img/place.svg');

	m_usersArea = new BkArea(new BkCoord(0.01,0.121,0.23,0.88,0,7), 5.083, 1, 0, 0.12);
	m_uiSystem.addArea(m_usersArea);
	m_placesArea = new BkArea(new BkCoord(0.24,0,0.76,1,0,7));
	m_uiSystem.addArea(m_placesArea);
	let buttonsArea = new BkArea(new BkCoord(0.01,0.01,0.23,0.1,0,7), 1, 2, 0);
	m_uiSystem.addArea(buttonsArea);
	
	m_uiSystem.setBackgroundImage('/assets/img/place.svg', 0.2);
	m_placeDrawer = new ef_PlaceDrawer(m_uiSystem);
	m_userDrawer = new ef_UserDrawer(m_uiSystem);

	let buttonDrawer = new ef_ButtonDrawer(m_uiSystem);
	m_showPlacesMenuButton = new ef_Button(
		new BkCoord(),
		buttonDrawer, "Places", showPlacesClick, '/assets/img/places.svg');
	m_showPlacesMenuButton.area = buttonsArea;
	m_showPlacesMenuButton.comparable = 0;
	
	m_showInfoButton = new ef_Button(
		new BkCoord(),
		buttonDrawer, "Info", null, '/assets/img/info.svg');
	m_showInfoButton.area = buttonsArea;
	m_showInfoButton.comparable = 1;
	
	m_finishButton = new ef_Button(
		new BkCoord(),
		buttonDrawer, "Finish", finishClick, '/assets/img/finish.svg');
	m_finishButton.area = buttonsArea;
	m_finishButton.comparable = 2;
	
	m_uiSystem.add(m_showPlacesMenuButton);
	m_uiSystem.add(m_showInfoButton);
	
	m_userDrawer = new ef_UserDrawer(m_uiSystem);
	m_waitImage = new ef_WaitImage(
		new BkCoord(0,0,1,1),
		new ef_WaitImageDrawer(m_uiSystem),
		'/assets/img/wait.svg');

	m_uiSystem.onmousehover = onMouseHover;
	m_uiSystem.onresize = onResize;
		
	// Communication
	m_roomId = "vote_" + m_feastId.toString();
	m_userId = parseInt(Cookies.get("userId"));
	
	m_comService = new CommunicationService();
	m_comService.onMessage(handleWsOnMessage);
	m_comService.connect('ws://' + location.host + '/ws', m_roomId);
	
	$.ajax({
		url: '/action/getSuggestions?feastId=' + m_feastId.toString(),
		success: function(result){
			processUserPlaceJson(result);
		}
	});	
	
	m_uiSystem.startDrawing();
}

return {
	run:run,
	addSuggestion:addSuggestion
};

}

let ef_votingView = new VotingView(g_feastId);

$(window).on("load", function() {
	ef_votingView.run();
});