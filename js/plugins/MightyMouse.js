//==============================================================================
// Mouse & Touch Function Expansions
// MightyMouse.js
//==============================================================================
/*:
* @plugindesc v1.00 This script adds missing mouse functions such as hover
* detection & related event triggering. It also creates drag and drop
* functionality in-game.
* also
* @author Kingpin RBD
*
* @param Drag & Drop Maps
* @parent ---Options---
* @type boolean
* @on YES
* @off NO
* @desc Convert maps drag & drop by default?
* NO - false     YES - true
* @default true
*
* @param Draggable Objects
* @parent ---Options---
* @type boolean
* @on YES
* @off NO
* @desc Make objects draggable by default?
* NO - false     YES - true
* @default true
*
* @param Stackable Objects
* @parent ---Options---
* @type boolean
* @on YES
* @off NO
* @desc Make dropzones stackable by default?
* NO - false     YES - true
* @default false
*
* @param Right-click Trigger
* @parent ---Options---
* @type boolean
* @on YES
* @off NO
* @desc Enable right-click event triggering?
* NO - false     YES - true
* @default true
*
* @param Hover Trigger
* @parent ---Options---
* @type boolean
* @on YES
* @off NO
* @desc Enable event triggering on mouse hover?
* NO - false     YES - true
* @default true
*
* @param Leave Trigger
* @parent ---Options---
* @type boolean
* @on YES
* @off NO
* @desc Enable event triggering on mouse leave?
* NO - false     YES - true
* @default true
*
* @param Center Characters
* @parent ---Options---
* @type boolean
* @on YES
* @off NO
* @desc Center character images?
* NO - false     YES - true
* @default false
*
* @help
* ==============================================================================
* Information
* ==============================================================================
*
* Note: This script will function with Yanfly's core plugin, but I advise not
* comboing it with other plugins that modify mouse/touch commands.
*
* MightyMouse was created mainly to add missing mouse functions including hover
* detection & mouse related event triggering(right-click, mouse hover, & mouse
* leave). It also restricts player click/touch movement to only when clicking
* empty map space. Though unrelated, it also adds proper image-related
* collision detection and optionally centers character images to Game_Character
* based objects including $gamePlayer allowing you to assign big character
* images to the player, events, and vehicles with automatically adjusted and
* corrected passibility. Lastly as a totally unique feature, it also provides
* optional drag and drop functionality to RPG Maker MV.
*
* Note: This script also provides touchscreen equivalents to drag and drop
* functions though they are given untested. Future updates may be able to
* resolve any reported problems, though in the worst-case scenario it will
* likely just be removed.
*
* ==============================================================================
* Instructions & Specifications
* ==============================================================================
*
* Drag and Drop
*
* By default this script will automatically convert maps alongside the player,
* events, & vehicles with assigned images into compatible objects. Theoretically
* any object class that is a child of Game_Character will be given the parameter
* of being draggable by default and all maps made droppable.
*
* Object instances can be made draggable or not by script call. For example:
*
* $gamePlayer.draggable = false;
* $gameMap.event(0).draggable = true;
* $gameMap.vehicle(0).draggable = false;
* $gameMap.boat().draggable = false; //Same result as above line
* AnyGameCharacterObj.draggable = false;
*
* Events can also be made draggable by including the tags <draggable> in either
* its comments or notes section. Draggable objects are assigned unique priority
* when dropped onto stackable dropzones. Objects with the same priorityType will
* obtain a higher priority than the last object of that type stacked.
*
* In order to create uniquely droppable maps, you first want to disable the
* 'Drag & Drop Maps' option within the plugin settings. Next, you want to make
* use of the new function Game_Map.prototype.createDropzone to create custom
* droppable areas for your map. Example:
*
* var newZone = $gameMap.createDropzone(Id, startXtile, startYtile,
* widthInTiles, heightInTiles, stackableFlag);
* var myZone = $gameMap.createDropzone('Zone001', 12, 11, 3, 3, true); //Example
*
* The above code would create a stackable 144x144 pixel dropzone within the
* current map at coordinates(12, 11) and assign it a unique ID of 'Zone001'. The
* stackableFlag can be omitted. Doing so will default the value to that of
* the 'Stackable Objects' plugin option. By default anything successfully
* dropped into a dropzone will adjust to its center-most tile. I recommend odd
* numbered width & height specifications to more easily keep track of where
* objects will land. Larger than 1x1 size dropzones just provide the option of
* dropping in let's say a corner of a zone & having it auto-correct, though 1x1
* tile-sized zones will suit most scenarios fine. You would simply have to be
* more precise on drops.
*
* You can also assign dropzones images and animations like any other
* Game_CharacterBase object. This should enable you to assign them drop-state
* related images and animations. This feature was added with boardgames in
* mind. Thought it might be useful to be able to change/assign an image or
* play an animation on a successful collision, drag, or drop in cases of things
* like trap activations or related status effects & buffs taking affect. Some
* script call examples:
*
* $gameMap.dropzones[id].setImage(charName, charIndex);
*
* $gameMap.dropzones[id].checkObjects();
* if ($gameMap.dropzones[id].isOccupied()) {
*    $gameMap.dropzones[id].displayAnimation(animId, target);
* }
* $gameMap.dropzones[id].reset(); // makes it repeatable if a parallel process
*
* Character images can be made centered by setting an object's .center value to
* true. Character images are not centered by default. Events can also be set
* as centered by including the tag <center> in either its comments or notes
* section.
*
* New Event Triggers
*
* Right-click - Right-clicks are now exclusive to activating events. Disabling
* the Right-click Trigger option will simply disable right-clicks entirely.
*
* HoverStart - In order to make an events activate on mouse hover, include the
* tag <hoverStart> within either its comments or notes section. Leaving the tag
* in  page comments will allow for page specific triggers per page.
*
* LeaveStart - In order to make an event activate on mouse leave, include the
* tag <leaveStart> within either its comments or notes section. Leaving the tag
* in page comments will allow for page specific triggers per page.
*
* If you wish to reference hover status directly:
* Status of objects (Game_Character) - use the function object.checkHover().
* Status of mouse - use the function TouchInput.overTarget().
* ==============================================================================
*/
//==============================================================================

//==============================================================================
// Paramaters
//==============================================================================

var MightyMouse = {};
MightyMouse.Parameters = PluginManager.parameters('MightyMouse');
MightyMouse.Settings = {};
MightyMouse.Settings.DragAndDrop        = eval(String(MightyMouse.Parameters['Drag & Drop Maps']));
MightyMouse.Settings.AllDraggable       = eval(String(MightyMouse.Parameters['Draggable Objects']));
MightyMouse.Settings.AllStackable       = eval(String(MightyMouse.Parameters['Stackable Objects']));
MightyMouse.Settings.Right_click        = eval(String(MightyMouse.Parameters['Right-click Trigger']));
MightyMouse.Settings.HoverStart         = eval(String(MightyMouse.Parameters['Hover Trigger']));
MightyMouse.Settings.LeaveStart         = eval(String(MightyMouse.Parameters['Leave Trigger']));
MightyMouse.Settings.CenterCharacters   = eval(String(MightyMouse.Parameters['Center Characters']));

/**
* Event Tags
*/

MightyMouse.HoverTag      = '<hoverStart>'
MightyMouse.LeaveTag      = '<leaveStart>'
MightyMouse.DragTag       = '<draggable>'
MightyMouse.CenterTag     = '<center>'

/**
* Reads Comments from event pages.
*/

MightyMouse.tagReader = function(pageListObject) {
  var comments = (pageListObject.code == 108 || pageListObject.code == 408) ? true : false;
  return comments;
};

/**
* Searches an active game_event's Comments or Notes sections for tags
*/

MightyMouse.eventReader = function(game_event, tag, action) {
  if (!game_event.page()) {return false;}
  var comments = game_event.list().filter(this.tagReader);
  var result = null;
  var match = false;
  var matchInString = function(string) {
    result = string.match(tag);
    if (result !== null) {
        match = true;
    }
  }
  //Check Comments section first
  if (comments.length > 0) {
    comments.forEach(function(comment) {
        if (match) return;
        matchInString(comment.parameters[0]);
    })
  }
  // Check Notes section last
  if (!match) {
    if (game_event.event().note) {
        matchInString(game_event.event().note);
    }
  }
  if (match){action.call(game_event, result);}
};

//==============================================================================
// TouchInput
//==============================================================================

/**
* Aliases and redefines various TouchInput components to allow for hover
* detection, hover & click event triggering, as well as drag and drop.
* Note :Touch function equivalents are included but untested. Theoretically it
* should work fine.
*/

var _TouchInput_initialize = TouchInput.initialize;
TouchInput.initialize = function() {
  _TouchInput_initialize.call(this);
};

var _TouchInput_clear = TouchInput.clear;
TouchInput.clear = function() {
  _TouchInput_clear.call(this);
  this._prevX = 0;
  this._prevY = 0;
  this._hovering = false;
  this._holding = false;
  this._dragging = false;
  this._dropzone = null;
  this._target = null;
  this._objects = [];
  this.updateHovering();
};

var _TouchInput_update = TouchInput.update;
TouchInput.update = function() {
  _TouchInput_update.call(this);
};

TouchInput.mapX = function() {
  return Math.floor(this._x / 48);
};

TouchInput.mapY = function() {
  return Math.floor(this._y / 48);
};

TouchInput.prevX = function() {
  return Math.floor(this._prevX / 48);
};

TouchInput.prevY = function() {
  return Math.floor(this._prevY / 48);
};

TouchInput.isHovering = function() {
  return this._hovering;
};

TouchInput.isHolding = function() {
  return this._holding;
};

TouchInput.isDragging = function() {
  return this._dragging;
};

TouchInput.getDropzone = function() {
  return this._dropzone;
};

TouchInput.overObject = function() {
  this._objects = [];
  if (!SceneManager._scene){return false;}
  if (!SceneManager._scene._active){return false;}
  for (var i = 0; i < $gameMap.events().length; i++) {
    if ($gameMap.events()[i].checkHover()) {
      if (this._target) {
        if ($gameMap.events()[i] !== this._target) {
          this._objects.push($gameMap.events()[i]);
        }
      } else {
        this._objects.push($gameMap.events()[i]);
      }
    }
  }
  for (var j = 0; j < $gameMap.vehicles.length; j++) {
    if ($gameMap.vehicles()[j].checkHover()) {
      if (this._target) {
        if ($gameMap.vehicles()[j] !== this._target) {
          this._objects.push($gameMap.vehicles()[j]);
        }
      } else {
        this._objects.push($gameMap.vehicles()[j]);
      }
    }
  }
  if ($gamePlayer.checkHover()) {
    if (this._target) {
      if ($gamePlayer !== this._target) {
        this._objects.push($gamePlayer);
      }
    } else {
      this._objects.push($gamePlayer);
    }
  }
  if (this._objects.length > 0) {return true;}
  return false;
};

TouchInput.updateHovering = function() {
  if (Graphics.isInsideCanvas(this._x, this._y)) {
    if (this.overObject()) {
      this._hovering = true;
      this._dragging = false;
    } else {this._hovering = false;}
  }
};

TouchInput.updateDropzone = function() {
  if (Graphics.isInsideCanvas(this._x, this._y)) {
    for (var i = 0; i < $gameMap.dropzones.length; i++) {
      if ($gameMap.dropzones[i].check()) {
        this._dropzone = $gameMap.dropzones[i];
        return;
      } else {
        this._dropzone = null;
      }
    }
  }
};

TouchInput.grabTarget = function() {
  if (this._objects.length < 1) {return;}
  var targets = this._objects.filter(function(obj) {return obj.draggable && obj._characterName !== "";}, this);
  if (targets.length < 1) {return;}
  targets.sort(function(a, b) {return b.priority - a.priority;});
  targets.sort(function(a, b) {return b._priorityType - a._priorityType;});
  this._target = targets[0];
  this._target._initialX = this._target._x;
  this._target._initialY = this._target._y;
  this._target._oldDirFix = this._target._directionFix;
  this._target._oldThrough = this._target._through;
  this._target._oldOpacity = this._target._opacity;
  this._target._oldMoveSpeed = this._target._moveSpeed;
  this._target._directionFix = true;
  this._target._through = true;
  this._target._opacity = 100;
  this._target._moveSpeed = 6;
};

TouchInput.activateEvent = function() {
  for (var i = 0; i < $gameMap.events().length; i++) {
    if ($gameMap.events()[i].checkHover() && $gameMap.events()[i]._trigger === 0) {
      $gameMap.events()[i].start();
      return;
    }
  }
};

TouchInput._onLeftButtonDown = function(event) {
  var x = Graphics.pageToCanvasX(event.pageX);
  var y = Graphics.pageToCanvasY(event.pageY);
  if (Graphics.isInsideCanvas(x, y)) {
    this._mousePressed = true;
    this._pressedTime = 0;
    if (this.overObject()) {
      this.grabTarget();
      if (this._target) {
        this.updateDropzone();
        this._holding = true;
        return;
      } else {
        this._holding = false;
        return;
      }
    }
    this._target = null;
    this._onTrigger(x, y);
  }
};

TouchInput._onRightButtonDown = function(event) {
  var x = Graphics.pageToCanvasX(event.pageX);
  var y = Graphics.pageToCanvasY(event.pageY);
  if (MightyMouse.Settings.Right_click) {
    this._mousePressed = true;
    this._pressedTime = 0;
    if (this.overObject()) {
      this.activateEvent();
    }
  }
};

TouchInput._onMouseMove = function(event) {
  if (!this.isHolding()) {
    var x = Graphics.pageToCanvasX(event.pageX);
    var y = Graphics.pageToCanvasY(event.pageY);
    this._onMove(x, y);
    this.updateHovering();
    if (MightyMouse.Settings.HoverStart) {
      if (this.overObject()) {this.onMouseHover();}
    }
    if (MightyMouse.Settings.LeaveStart) {
      if (!this.overObject()) {this.onMouseLeave();}
    }
  } else if (this.isHolding()) {
    var x = Graphics.pageToCanvasX(event.pageX);
    var y = Graphics.pageToCanvasY(event.pageY);
    this._onDrag(x, y);
    this.updateDropzone();
  }
};

TouchInput._onMouseUp = function(event) {
 if (event.button === 0) {
   if (!this.isHolding()) {
     var x = Graphics.pageToCanvasX(event.pageX);
     var y = Graphics.pageToCanvasY(event.pageY);
     this._mousePressed = false;
     this._onRelease(x, y);
   } else if (this.isHolding()) {
     var x = Graphics.pageToCanvasX(event.pageX);
     var y = Graphics.pageToCanvasY(event.pageY);
     this._mousePressed = false;
     this._onDrop(x, y);
     this._holding = false;
   }
 }
};

TouchInput._onTouchStart = function(event) {
  for (var i = 0; i < event.changedTouches.length; i++) {
    var touch = event.changedTouches[i];
    var x = Graphics.pageToCanvasX(touch.pageX);
    var y = Graphics.pageToCanvasY(touch.pageY);
    if (Graphics.isInsideCanvas(x, y)) {
      this._screenPressed = true;
      this._pressedTime = 0;
      if (event.touches.length >= 2) {
        if (this.overObject()) {
         this.grabTarget();
         if (this._target) {
            this.updateDropzone();
            this._holding = true;
            return;
          } else {
            this._holding = false;
            return;
          }
        }
      } else {
        if (this.overObject()) {
          this.activateEvent();
        } else {
          this._target = null;
          this._onTrigger(x, y);
        }
        event.preventDefault();
      }
    }
  }
};

TouchInput._onTouchMove = function(event) {
	for (var i = 0; i < event.changedTouches.length; i++) {
    if (this.isHolding()) {
  		var touch = event.changedTouches[i];
      var x = Graphics.pageToCanvasX(touch.pageX);
      var y = Graphics.pageToCanvasY(touch.pageY);
      this._onDrag(x, y);
      this.updateDropzone();
    } else {
		var touch = event.changedTouches[i];
		var x = Graphics.pageToCanvasX(touch.pageX);
		var y = Graphics.pageToCanvasY(touch.pageY);
		this._onMove(x, y);
    }
	}
};

TouchInput._onTouchEnd = function(event) {
	for (var i = 0; i < event.changedTouches.length; i++) {
    if (this.isHolding()) {
		  var touch = event.changedTouches[i];
      var x = Graphics.pageToCanvasX(touch.pageX);
      var y = Graphics.pageToCanvasY(touch.pageY);
      this._screenPressed = false;
      this._onDrop(x, y);
      this._holding = false;
    } else {
  		var touch = event.changedTouches[i];
  		var x = Graphics.pageToCanvasX(touch.pageX);
  		var y = Graphics.pageToCanvasY(touch.pageY);
  		this._screenPressed = false;
  		this._onRelease(x, y);
    }
	}
};

TouchInput.onMouseHover = function() {
  if (!SceneManager._scene){return;}
  if (!SceneManager._scene._active){return;}
  for (var i = 0; i < $gameMap.events().length; i++) {
    if ($gameMap.events()[i].checkHover() && !$gameMessage.isBusy()) {
      if ($gameMap.events()[i].hoverStart && !$gameMap.events()[i].triggered) {
        $gameMap.events()[i].start();
        $gameMap.events()[i].triggered = true;
      } else if ($gameMap.events()[i].leaveStart && !$gameMap.events()[i].triggered) {
        $gameMap.events()[i].triggered = true;
      }
    }
  }
};

TouchInput.onMouseLeave = function() {
  if (!SceneManager._scene){return;}
  if (!SceneManager._scene._active){return;}
  for (var i = 0; i < $gameMap.events().length; i++) {
    if ($gameMap.events()[i].checkLeave() && !$gameMessage.isBusy()) {
      if ($gameMap.events()[i].leaveStart && $gameMap.events()[i].triggered) {
        $gameMap.events()[i].start();
        $gameMap.events()[i].triggered = false;
      } else if ($gameMap.events()[i].hoverStart && $gameMap.events()[i].triggered) {
        $gameMap.events()[i].triggered = false;
      }
    }
  }
};

TouchInput._onMove = function(x, y) {
  this._events.moved = true;
  this._prevX = this._x;
  this._prevY = this._y;
  this._x = x;
  this._y = y;
};

TouchInput._onDrag = function(x, y) {
  this._dragging = true;
  this._prevX = this._x;
  this._prevY = this._y;
  this._x = x;
  this._y = y;
  this._target.drag();
};

TouchInput._onDrop = function(x, y) {
  this._dragging = false;
  this._x = x;
  this._y = y;
  this._target.drop();
};

TouchInput._onClick = function(x, y) {
  this._events.triggered = true;
  this._x = x;
  this._y = y;
  this._date = Date.now();
};

//==============================================================================
// Game_CharacterBase
//==============================================================================

/**
* Image-related collision detection changes
*/

var _Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
Game_CharacterBase.prototype.initMembers = function() {
  _Game_CharacterBase_initMembers.call(this);
  this._dimensions = [0, 0, 0, 0];
  this._coordinates = {x: [], y: []};
  this._projCoords = {x: [], y: []};
};

Game_CharacterBase.prototype.updateDimensions = function() {
  if (this._characterName === '') {
    this._dimensions = [this._x, this._x, this._y, this._y];
    return;
  }
  var bitmap = ImageManager.loadCharacter(this._characterName);
  this._isBigCharacter = ImageManager.isBigCharacter(this._characterName);
  if (this._isBigCharacter) {
    var imgWidth = bitmap.width/3;
    var imgHeight = bitmap.height/4;
  } else {
    var imgWidth = bitmap.width/12;
    var imgHeight = bitmap.height/8;
  }
  x_factor = Math.floor(((imgWidth / 2) - ($gameMap.tileWidth()/2)) / $gameMap.tileWidth());
  if (this.isCentered()) {
    if (this._priorityType === 1) {
      y_factor = 0;
    } else {
      y_factor = Math.floor(((imgHeight / 2) - ($gameMap.tileHeight()/2)) / $gameMap.tileHeight());
    }
  } else {
    if (this._priorityType === 1) {
      y_factor = 0;
    } else {
      y_factor = Math.floor((imgHeight - ($gameMap.tileHeight()/2)) / $gameMap.tileHeight());
    }
  }
  this._dimensions[0] = this._x - x_factor;
  this._dimensions[1] = this._x + x_factor;
  this._dimensions[2] = this._y - y_factor;
  if (this.isCentered()) {
    this._dimensions[3] = this._y + y_factor;
  } else {
    this._dimensions[3] = this._y
  }
};

Game_CharacterBase.prototype.updateCoordinates = function() {
  if (this._characterName === '') {
    this._coordinates = {x: [this._x], y: [this._y]};
    return;
  }
  this._coordinates = {x: [], y: []};
  var bitmap = ImageManager.loadCharacter(this._characterName);
  this._isBigCharacter = ImageManager.isBigCharacter(this._characterName);
  if (this._isBigCharacter) {
    var imgWidth = bitmap.width/3;
    var imgHeight = bitmap.height/4;
  } else {
    var imgWidth = bitmap.width/12;
    var imgHeight = bitmap.height/8;
  }
  var sizeX = (this._dimensions[1] - this._dimensions[0]) || 1;
  var sizeY = (this._dimensions[3] - this._dimensions[2]) || 1;
  x_factor = -(Math.floor(sizeX / 2));
  if (this.isCentered()) {
    y_factor = -(Math.floor(sizeY / 2));
  } else {
    y_factor = -(sizeY - 1);
  }
  for (var i = x_factor; i < sizeX; i++) {
    this._coordinates.x.push(this._x + i);
  }
  if (this.isCentered()) {
    for (var j = y_factor; j < sizeY; j++) {
      this._coordinates.y.push(this._y + j);
    }
  } else {
    for (var j = y_factor; j < 0; j++) {
      this._coordinates.y.push(this._y + j);
    }
    this._coordinates.y.push(this._y);
  }
};

Game_CharacterBase.prototype.checkCoordinates = function(dir) {
  if (this._characterName === '') {
    this._projCoords = {x: [$gameMap.roundXWithDirection(this._x, dir)],
    y: [$gameMap.roundYWithDirection(this._y, dir)]};
    return;
  }
  this._projCoords = {x: [], y: []};
  var bitmap = ImageManager.loadCharacter(this._characterName);
  this._isBigCharacter = ImageManager.isBigCharacter(this._characterName);
  if (this._isBigCharacter) {
    var imgWidth = bitmap.width/3;
    var imgHeight = bitmap.height/4;
  } else {
    var imgWidth = bitmap.width/12;
    var imgHeight = bitmap.height/8;
  }
  var sizeX = (this._dimensions[1] - this._dimensions[0]) || 1;
  var sizeY = (this._dimensions[3] - this._dimensions[2]) || 1;
  x_factor = -(Math.floor(sizeX / 2));
  if (this.isCentered()) {
    y_factor = -(Math.floor(sizeY / 2));
  } else {
    y_factor = -(sizeY - 1);
  }
  for (var i = x_factor; i < sizeX; i++) {
    this._projCoords.x.push($gameMap.roundXWithDirection(this._x, dir) + i);
  }
  if (this.isCentered()) {
    for (var j = y_factor; j < sizeY; j++) {
      this._projCoords.y.push($gameMap.roundYWithDirection(this._y, dir) + j);
    }
  } else {
    for (var j = y_factor; j < 0; j++) {
      this._projCoords.y.push($gameMap.roundYWithDirection(this._y, dir) + j);
    }
    this._projCoords.y.push($gameMap.roundYWithDirection(this._y, dir));
  }
};

Game_CharacterBase.prototype.checkCollision = function(x, y) {
  return x >= this._dimensions[0] && x <= this._dimensions[1] &&
  y >= this._dimensions[2] && y <= this._dimensions[3];
};

Game_CharacterBase.prototype.isCollidedWithCharacters = function() {
  this.updateCoordinates();
  var x = this._coordinates.x;
  var y = this._coordinates.y;
  for (var i = 0; i < y.length; i++) {
    for (var j = 0; j < x.length; j++) {
      for (var k = 0; k < $gameMap.events().length; k++) {
        if ($gameMap.events()[k].checkCollision(x[j], y[i])) {
          if ($gameMap.events()[k] === this) {continue;}
          return true;
        }
      }
      for (var l = 0; l < $gameMap.vehicles.length; l++) {
        if ($gameMap.vehicles()[l].checkCollision(x[j], y[i])) {
          if ($gameMap.vehicles()[l] === this) {continue;}
          return true;
        }
      }
      if ($gamePlayer.checkCollision(x[j], y[i])) {
        if ($gamePlayer === this) {return false;}
        return true;
      }
    }
  }
  return false;
};

Game_CharacterBase.prototype.willCollideWithCharacters = function(dir) {
  this.updateCoordinates();
  this.checkCoordinates(dir);
  var x = this._projCoords.x;
  var y = this._projCoords.y;
  for (var i = 0; i < y.length; i++) {
    for (var j = 0; j < x.length; j++) {
      for (var k = 0; k < $gameMap.events().length; k++) {
        if ($gameMap.events()[k].checkCollision(x[j], y[i])) {
          if (($gameMap.events()[k] === this) || ($gameMap.events()[k].isThrough())
          || ($gameMap.events()[k]._characterName === '')) {continue;}
          return true;
        }
      }
      for (var l = 0; l < $gameMap.vehicles.length; l++) {
        if ($gameMap.vehicles()[l].checkCollision(x[j], y[i])) {
          if (($gameMap.vehicles()[l] === this) || (vehicles()[l].isThrough())
          || ($gameMap.vehicles()[l]._characterName === '')) {continue;}
          return true;
        }
      }
      if ($gamePlayer.checkCollision(x[j], y[i])) {
        if (($gamePlayer === this) || ($gamePlayer.isThrough()) ||
        ($gamePlayer._characterName === '')) {return false;}
        return true;
      }
    }
  }
  return false;
};

Game_CharacterBase.prototype.canPass = function(x, y, d) {
	var x2 = $gameMap.roundXWithDirection(x, d);
	var y2 = $gameMap.roundYWithDirection(y, d);
	if (!$gameMap.isValid(x2, y2)) {
		return false;
	}
	if (this.isThrough() || this.isDebugThrough()) {
		return true;
	}
	if (!this.isMapPassable(x, y, d)) {
		return false;
	}
	if (this.willCollideWithCharacters(d)) {
		return false;
	}
	return true;
};

Game_CharacterBase.prototype.moveStraight = function(d) {
    this.setMovementSuccess(this.canPass(this._x, this._y, d));
    if (this.isMovementSucceeded()) {
        this.setDirection(d);
        this._x = $gameMap.roundXWithDirection(this._x, d);
        this._y = $gameMap.roundYWithDirection(this._y, d);
        this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(d));
        this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(d));
        this.increaseSteps();
        this.updateCoordinates();
    } else {
        this.setDirection(d);
        this.checkEventTriggerTouchFront(d);
    }
};

Game_Player.prototype.isCollided = function(x, y) {
	if (this.isThrough()) {
		return false;
	} else {
		return this.isCollidedWithCharacters() || this._followers.isSomeoneCollided(x, y);
	}
};

//==============================================================================
// Game_Character
//==============================================================================

/**
* Aliases and expands Game_Character to make all children drag and drop friendly
*/

var _Game_Character_initMembers = Game_Character.prototype.initMembers;
Game_Character.prototype.initMembers = function() {
  _Game_Character_initMembers.call(this);
  this._draggable = MightyMouse.Settings.AllDraggable;
  this._centered = MightyMouse.Settings.CenterCharacters;
  this._priority = 0;
  this._initialX = this._x;
  this._initialY = this._y;
  this._oldDirFix = this._directionFix;
  this._oldThrough = this._through;
  this._oldOpacity = this._opacity;
  this._oldMoveSpeed = this._moveSpeed;
};

Object.defineProperties(Game_Character.prototype, {
  draggable: { get: function() { return this._draggable; }, configurable: true },
  center: { get: function() { return this._centered; }, configurable: true },
  priority: { get: function() { return this._priority; }, configurable: true }

});

Game_Character.prototype.isDraggable = function() {
  return this._draggable;
};

Game_Character.prototype.isCentered = function() {
  return this._centered;
};

Game_Character.prototype.setPriority = function(value) {
  return this._priority = Number(value);
};

Game_Character.prototype.screenZ = function() {
  return (this._priorityType * 2 + 1) + this._priority;
};

Game_Character.prototype.checkHover = function() {
  var x = TouchInput.mapX();
  var y = TouchInput.mapY();
  this.updateDimensions();
  return x >= this._dimensions[0] && x <= this._dimensions[1] &&
  y >= this._dimensions[2] && y <= this._dimensions[3];
};

Game_CharacterBase.prototype.checkLeave = function() {
  var x = TouchInput.prevX();
  var y = TouchInput.prevY();
  this.updateDimensions();
  return x >= this._dimensions[0] && x <= this._dimensions[1] &&
  y >= this._dimensions[2] && y <= this._dimensions[3] && !this.checkHover();
};

Game_Character.prototype.drag = function() {
  this.setPosition(TouchInput.mapX(), TouchInput.mapY());
  this.refresh();
  if (this === $gamePlayer) {
    this.followers().synchronize(this._x, this._y);
    this.followers().update();
    this.followers().refresh();
  }
};

Game_Character.prototype.drop = function() {
  if (TouchInput.getDropzone()) {
    TouchInput.getDropzone().catch(this);
    this.refresh();
    return;
  } else {
    this.setPosition(this._initialX, this._initialY);
    this._directionFix = this._oldDirFix;
    this._through = this._oldThrough;
    this._opacity = this._oldOpacity;
    this._moveSpeed = this._oldMoveSpeed;
    TouchInput._target = null;
    this.refresh();
    if (this === $gamePlayer) {
      this.followers().synchronize(this._x, this._y);
      this.followers().update();
      this.followers().refresh();
    }
  }
};

//==============================================================================
// Game_Event
//==============================================================================

var _Game_Event_initMembers = Game_Event.prototype.initMembers;
Game_Event.prototype.initMembers = function() {
  _Game_Event_initMembers.call(this);
  this._hoverStart = false;
  this._leaveStart = false;
  this._triggered = false;
};

Object.defineProperties(Game_Event.prototype, {
  hoverStart: { get: function() { return this._hoverStart; }, configurable: true },
  leaveStart: { get: function() { return this._leaveStart; }, configurable: true },
});

var _Game_Event_setupPage = Game_Event.prototype.setupPage;
Game_Event.prototype.setupPage = function() {
  _Game_Event_setupPage.call(this);
  this.checkTags();
};

Game_Event.prototype.checkTags = function() {
  if (!this.page()) {return;}
  MightyMouse.eventReader(this, MightyMouse.HoverTag, function() {
    this._hoverStart = true;
    this._trigger = 0;
    return;
  });
  MightyMouse.eventReader(this, MightyMouse.LeaveTag, function() {
    this._leaveStart = true;
    this._trigger = 0;
    return;
  });
  MightyMouse.eventReader(this, MightyMouse.DragTag, function() {
    this._draggable = true;
    return;
  });
  MightyMouse.eventReader(this, MightyMouse.CenterTag, function() {
    this._centered = true;
    return;
  });
};

//==============================================================================
// Game_Map
//==============================================================================

/**
* Aliases and expands Game_Map for automated and custom dropzone creation
*/

var _Game_Map_initialize = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function() {
  _Game_Map_initialize.call(this);
  this._dropzones = [];
};

Game_Map.prototype.setup = function(mapId) {
  if (!$dataMap) {
      throw new Error('The map data is not available');
  }
  this._mapId = mapId;
  this._tilesetId = $dataMap.tilesetId;
  this._displayX = 0;
  this._displayY = 0;
  if (MightyMouse.Settings.DragAndDrop) {
    this.setupDropzones();
  }
  this.refereshVehicles();
  this.setupEvents();
  this.setupScroll();
  this.setupParallax();
  this.setupBattleback();
  this._needsRefresh = false;
};

/**
* [read-only] Direct reference to the dropzone container.
*
* @static
* @property dropzones
* @type Array
*/
Object.defineProperty(Game_Map.prototype, 'dropzones', {
  get: function() {
    return this._dropzones;
  },
  configurable: true
});

/**
* This used by default to create 48x48 pixel dropzones across the entire map
*/

Game_Map.prototype.setupDropzones = function() {
  this._dropzones = [];
  var dimensionsX = this.screenTileX();
  var dimensionsY = this.screenTileY();
  for (var y = 0; y < dimensionsY; y++) {
    for (var x = 0; x < dimensionsX; x++) {
      var id = (y * dimensionsX) + x;
      this._dropzones.push(new Game_Dropzone(this._mapId, id, x, y, 1, 1));
    }
  }
};

/**
* Use this to create individual customized dropzones anywhere on the map. It
* returns a reference to that zone as well.
*
* @method createDropzone
* @param id {string} Unique reference ID i.e. AttackZone1, SafeZone6, or 001
* @param x {number} horizontal tile position
* @param y {number} vertical tile position
* @param width {number} max width in 48x48 tiles
* @param height {number} max height in 48x48 tiles
* @param stackable {bool} whether objects can stack in this zone or not
*/

Game_Map.prototype.createDropzone = function(id, x, y, width, height, stackable) {
  var sx = Math.round(x);
  var sy = Math.round(y);
  var w = Math.round(width);
  var h = Math.round(height);
  var dz = new Game_Dropzone(this._mapId, id, sx, sy, w, h, stackable);
  this._dropzones.push(dz);
  return dz;
};

//==============================================================================
// Game_Dropzone
//==============================================================================

/**
* The container class for handing drops
*/

function Game_Dropzone() {
  this.initialize.apply(this, arguments);
}

Game_Dropzone.prototype = Object.create(Game_CharacterBase.prototype);
Game_Dropzone.prototype.constructor = Game_Dropzone;

Object.defineProperties(Game_Dropzone.prototype, {
  mapId: { get: function() { return this._mapId; }, configurable: true },
  id: { get: function() { return this._id; }, configurable: true },
  width: { get: function() { return this._width; }, configurable: true },
  height: { get: function() { return this._height; }, configurable: true },
  triggered: { get: function() { return this._triggered; }, configurable: true },
  stackable: { get: function() { return this._stackable; }, configurable: true },
  objects: { get: function() { return this._objects; }, configurable: true }
});

Game_Dropzone.prototype.initialize = function(mapId, id, x, y, width, height, stackable) {
  Game_CharacterBase.prototype.initialize.call(this);
  this._mapId = mapId;
  this._id = String(id);
  this._width = width;
  this._height = height;
  this._dimensions = [x * $gameMap.tileWidth(), y * $gameMap.tileHeight(),  x *
    $gameMap.tileWidth() + (width * $gameMap.tileWidth()), y *
    $gameMap.tileHeight() + (height * $gameMap.tileHeight())];
  this._stackable = stackable || MightyMouse.Settings.AllStackable;
  this._priorityType = 0;
  this._moveType = 0;
  this._directionFix = true;
  this._through = true;
  this._walkAnime = false;
  this._triggered = false;       //reserved flag for animations
  this._objects = [];            //any objects currently occupying this dropzone
  this.setPosition(x, y);
  this._sprite = new Sprite_Character(this);
};

Game_Dropzone.prototype.updateDimensions = function() {
  this._dimensions = this._dimensions;
  return;
};

Game_Dropzone.prototype.centerX = function() {
  return Math.round((this._width - 1) / 2) + this._x;
};

Game_Dropzone.prototype.centerY = function() {
  return Math.round((this._height - 1) / 2) + this._y;
};

/**
* Checks whether current mouse position is within dropzone bounds
*/

Game_Dropzone.prototype.check = function() {
  if (TouchInput.x >= this._dimensions[0] && TouchInput.x <= this._dimensions[2]) {
    if (TouchInput.y >= this._dimensions[1] && TouchInput.y <= this._dimensions[3]) {
      this.checkObjects();
      if (this._stackable) {
        return true;
      } else {
        return !this.isOccupied();
      }
    }
  }
  return false;
};

/**
* Checks whether any Game_Character objects are currently occupying this dropzone.
*/

Game_Dropzone.prototype.isOccupied = function() {
  return this._objects.length > 0;
};

/**
* Records any Game_Character objects that are currently occupying this dropzone.
*/

Game_Dropzone.prototype.checkObjects = function() {
  var objects = [];
  for (var i = 0; i < $gameMap.events().length; i++) {
    if ($gameMap.events()[i]._x >= this._x && $gameMap.events()[i]._x <= (this._x * this._width)) {
      if ($gameMap.events()[i]._y >= this._y && $gameMap.events()[i]._y <= (this._y * this._height)) {
        if (TouchInput._target !== $gameMap.events()[i]) {
          objects.push($gameMap.events()[i]);
        }
      }
    }
  }
  for (var j = 0; j < $gameMap.vehicles.length; j++) {
    if ($gameMap.vehicles()[j]._x >= this._x && $gameMap.vehicles()[j]._x <= (this._x * this._width)) {
      if ($gameMap.vehicles()[j]._y >= this._y && $gameMap.vehicles()[j]._y <= (this._y * this._height)) {
        if (TouchInput._target !== $gameMap.vehicles()[j]) {
          objects.push($gameMap.vehicles()[j]);
        }
      }
    }
  }
  if ($gamePlayer.x >= this._x && $gamePlayer.x <= (this._x * this._width)) {
    if ($gamePlayer.y >= this._y && $gamePlayer.y <= (this._y * this._height)) {
      if (TouchInput._target !== $gamePlayer) {
        objects.push($gamePlayer);
      }
    }
  }
  this._objects = objects.filter(function(obj) {return obj.draggable && obj._characterName !== "";}, this);
  this._objects.sort(function(a, b) {return b.priority - a.priority;});
  this._objects.sort(function(a, b) {return b._priorityType - a._priorityType;});
};

/**
* Handles successfull dropzone drags
*/

Game_Dropzone.prototype.catch = function(target) {
  if (this._objects.length > 0) {
    target.setPriority(this._objects[0].priority + 1);
  } else {
    target.setPriority(0);
  }
  this._objects.push(target);
  this._objects.sort(function(a, b) {return b.priority - a.priority;});
  target.setPosition(this.centerX(), this.centerY());
  target._directionFix = target._oldDirFix;
  target._through = target._oldThrough;
  target._opacity = target._oldOpacity;
  target._moveSpeed = target._oldMoveSpeed;
  if (target === $gamePlayer) {
    target.followers().synchronize(this._x, this._y);
    target.followers().update();
    target.followers().refresh();
  }
  TouchInput._target = null;
};

Game_Dropzone.prototype.reset = function() {
  this._priorityType = 0;
  this._directionFix = true;
  this._through = true;
  this._animationId = 0;
  this._animationPlaying = false;
  this._triggered = false;
};

Game_Dropzone.prototype.displayAnimation = function(animationId, target) {
  if (target) {
    if (!target.isAnimationPlaying()) {
      if (!this._triggered) {
        target.requestAnimation(animationId);
        this._triggered = true;
      }
    }
  } else {
    this.requestAnimation(animationId);
    this._sprite.update();
    this._triggered = true;
  }
};

//==============================================================================
// Sprite_Character
//==============================================================================

/**
* Center event images to event
*/

Sprite_Character.prototype.update = function() {
	Sprite_Base.prototype.update.call(this);
  if (this._character && this._character._centered) {
    this.anchor.y = 0.66;
  } else {
    this.anchor.y = 1;
  }
	this.updateBitmap();
	this.updateFrame();
	this.updatePosition();
	this.updateAnimation();
	this.updateBalloon();
	this.updateOther();
};

//==============================================================================
// Spriteset_Map
//==============================================================================

/**
* Added sprites for dropzone images and animations
*/

Spriteset_Map.prototype.createCharacters = function() {
	this._characterSprites = [];
	this._eventSprites = [];
  $gameMap.dropzones.forEach(function(dropzone) {
    this._characterSprites.push(dropzone._sprite);
  }, this);
	$gameMap.events().forEach(function(event) {
		this._characterSprites.push(new Sprite_Character(event));
	}, this);
	$gameMap.vehicles().forEach(function(vehicle) {
		this._characterSprites.push(new Sprite_Character(vehicle));
	}, this);
	$gamePlayer.followers().reverseEach(function(follower) {
		this._characterSprites.push(new Sprite_Character(follower));
	}, this);
	this._characterSprites.push(new Sprite_Character($gamePlayer));
	for (var i = 0; i < this._characterSprites.length; i++) {
		this._tilemap.addChild(this._characterSprites[i]);
	}
};

//==============================================================================
// Scene Changes
//==============================================================================

/**
* This restricts player click/touch movement to only occurring when clicking or
* touching unoccupied map areas only & only when not holding an object.
*/

Scene_Map.prototype.isMapTouchOk = function() {
  if (TouchInput.overObject() || TouchInput.isHolding()) {return false;}
  return this.isActive() && $gamePlayer.canMove();
};
