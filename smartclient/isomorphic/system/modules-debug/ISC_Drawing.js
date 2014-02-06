
/*

  SmartClient Ajax RIA system
  Version v9.0p_2014-02-05/LGPL Deployment (2014-02-05)

  Copyright 2000 and beyond Isomorphic Software, Inc. All rights reserved.
  "SmartClient" is a trademark of Isomorphic Software, Inc.

  LICENSE NOTICE
     INSTALLATION OR USE OF THIS SOFTWARE INDICATES YOUR ACCEPTANCE OF
     ISOMORPHIC SOFTWARE LICENSE TERMS. If you have received this file
     without an accompanying Isomorphic Software license file, please
     contact licensing@isomorphic.com for details. Unauthorized copying and
     use of this software is a violation of international copyright law.

  DEVELOPMENT ONLY - DO NOT DEPLOY
     This software is provided for evaluation, training, and development
     purposes only. It may include supplementary components that are not
     licensed for deployment. The separate DEPLOY package for this release
     contains SmartClient components that are licensed for deployment.

  PROPRIETARY & PROTECTED MATERIAL
     This software contains proprietary materials that are protected by
     contract and intellectual property law. You are expressly prohibited
     from attempting to reverse engineer this software or modify this
     software for human readability.

  CONTACT ISOMORPHIC
     For more information regarding license rights and restrictions, or to
     report possible license violations, please contact Isomorphic Software
     by email (licensing@isomorphic.com) or web (www.isomorphic.com).

*/

if(window.isc&&window.isc.module_Core&&!window.isc.module_Drawing){isc.module_Drawing=1;isc._moduleStart=isc._Drawing_start=(isc.timestamp?isc.timestamp():new Date().getTime());if(isc._moduleEnd&&(!isc.Log||(isc.Log && isc.Log.logIsDebugEnabled('loadTime')))){isc._pTM={ message:'Drawing load/parse time: ' + (isc._moduleStart-isc._moduleEnd) + 'ms', category:'loadTime'};
if(isc.Log && isc.Log.logDebug)isc.Log.logDebug(isc._pTM.message,'loadTime');
else if(isc._preLog)isc._preLog[isc._preLog.length]=isc._pTM;
else isc._preLog=[isc._pTM]}isc.definingFramework=true;

if (window.isc && isc.version != "v9.0p_2014-02-05/LGPL Deployment") {
    isc.logWarn("SmartClient module version mismatch detected: This application is loading the core module from "
        + "SmartClient version '" + isc.version + "' and additional modules from 'v9.0p_2014-02-05/LGPL Deployment'. Mixing resources from different "
        + "SmartClient packages is not supported and may lead to unpredictable behavior. If you are deploying resources "
        + "from a single package you may need to clear your browser cache, or restart your browser."
        + (isc.Browser.isSGWT ? " SmartGWT developers may also need to clear the gwt-unitCache and run a GWT Compile." : ""));
}







//------------------------------------------------------------------------------------------
//  detect native drawing capabilities by browser version
//------------------------------------------------------------------------------------------
isc.Browser.hasCANVAS = isc.Browser.geckoVersion >= 20051107 || isc.Browser.safariVersion >= 181 ||
                        isc.Browser.isIE9 ||
                        (!isc.Browser.isIE && typeof(document.createElement("canvas").getContext) === "function");
isc.Browser.hasSVG = isc.Browser.geckoVersion >= 20051107; // || isc.Browser.safariVersion >= ???

isc.Browser.hasVML = isc.Browser.isIE && isc.Browser.version >= 5;
isc.Browser.defaultDrawingType =
                              //isc.Browser.hasSVG ? "svg" :
                              isc.Browser.hasCANVAS ? "bitmap" :
                              isc.Browser.hasVML ? "vml" :
                              "none";

isc._$xlinkNS = "http://www.w3.org/1999/xlink";
isc._$svgNS = "http://www.w3.org/2000/svg";

isc.defineClass("SVGStringConversionContext").addClassProperties({
    _$xlink: "xlink"
});
isc.SVGStringConversionContext.addProperties({
    _nextSvgDefNum: 1,

    //> @attr svgStringConversionContext.printForExport (Boolean : true : IR)
    // Whether the conversion to SVG source is being requested for print export.
    //<

    printForExport: true,

    xlinkPrefix: isc.SVGStringConversionContext._$xlink
});
isc.SVGStringConversionContext.addMethods({
    init : function () {
        this.Super("init", arguments);
        this.svgDefStrings = {};
    },

    getNextSvgDefNumber : function () {
        return this._nextSvgDefNum++;
    }
});

//------------------------------------------------------------------------------------------
//> @class DrawPane
//
// Container for DrawLine, DrawOval, DrawPath, and other DrawItem-based components. These components
// provide consistent cross-browser APIs for rendering shapes using using the browsers' built in
// vector graphics capabilities. These include
// <code>SVG (Scalable Vector Graphics)</code> where available, <code>VML (Vector Markup
// Language)</code> for Microsoft browsers, and the HTML5 <code>&lt;canvas&gt;</code> tag.
// <P>
// You can use any of the following approaches to create DrawPanes and DrawItems:
// <P>
// <dl>
// <dt>DrawPane only</dt>
// <dd> Create a DrawPane with drawItems set to an array of DrawItem instances or DrawItem
// declaration objects, and it will manage those DrawItems. </dd>
// <dt>DrawItem only</dt>
// <dd> Create and draw a DrawItem, and it will use a default DrawPane, which you can
//      access via the drawPane property, eg myDrawItem.drawPane.bringToFront().</dd>
// <dt>Both</dt>
// <dd>Create DrawPanes with or without initial drawItems, then create DrawItems
//     with their drawPane property set to an existing DrawPane instance.</dd>
// </dl>
//
// <var class="smartgwt"><p>To use DrawPane in SmartGWT, include the Drawing module
// in your application by including <code>&lt;inherits name="com.smartgwt.Drawing"/&gt;</code>
// in your GWT module XML. </p></var>
//
// @inheritsFrom Canvas
// @treeLocation Client Reference/Drawing
// @visibility drawing
//<
//------------------------------------------------------------------------------------------



isc.defineClass("DrawPane", "Canvas").addProperties({

drawingType: isc.Browser.defaultDrawingType, // vml, bitmap, svg, none

// enable drag scrolling by default
canDrag: false,
dragAppearance:"none",
cursor: "all-scroll",

// allows the DrawPane to be placed above other widgets and not interfere with finding drop
// targets
isMouseTransparent: true,

//> @attr drawPane.rotation (float : 0 : IRW)
// Rotation in degrees for the DrawPane as a whole about the center of the DrawPane. Positive
// is clockwise. Negative is counterclockwise.
// @setter drawPane.rotate()
// @visibility drawing
//<
rotation:0,

//> @attr drawPane.zoomLevel (float : 1 : IRW)
// Zoom for the DrawPane as a whole, where 1 is normal size.
// @setter drawPane.zoom()
// @visibility drawing
//<
zoomLevel: 1,

translate: null,

// Do we support fractional coords? Depends on drawing type
supportsFractionalCoordinates : function () {

    var drawingType = this.drawingType;
    if (drawingType == "bitmap") return true;
    if (drawingType == "vml") return true;
    // Untested in svg
//    if (drawingType == "svg") return true;
    return false;
},

//> @attr drawPane.drawItems (Array of DrawItem : null : IR)
// Array of DrawItems to initially display in this DrawPane.
// @visibility drawing
//<


//canvasItems - array of Canvii that should be zoomed and panned with this DrawPane

//> @object ColorStop
// An object containing properties that is used in Gradient types
//
// @treeLocation Client Reference/Drawing/Gradients
// @visibility drawing
//<
//> @attr colorStop.offset (float: 0.0: IR)
// The relative offset for the color.
//
// @visibility drawing
//<
//> @attr colorStop.opacity (float: 1.0: IR)
// 0 is transparent, 1 is fully opaque
//
// @visibility drawing
//<
//> @attr colorStop.color (CSSColor: null: IR)
// eg #ff0000 or red or rgb(255,0,0)
//
// @visibility drawing
//<

//> @object Gradient
// An abstract class which holds an Array of ColorStop or start/stop colors.
//
// @treeLocation Client Reference/Drawing/Gradients
// @visibility drawing
//<
//> @attr gradient.id (String : null : IR)
//<
//> @attr gradient.colorStops (Array of ColorStop: null: IR)
//
// @visibility drawing
//<
//> @attr gradient.startColor (CSSColor: null: IR)
// if both startColor and endColor are set then colorStops is ignored
//
// @visibility drawing
//<
//> @attr gradient.endColor (CSSColor: null: IR)
// if both startColor and endColor are set then colorStops is ignored
//
// @visibility drawing
//<

//> @object SimpleGradient
// An derived class which is used for simple gradient definitions that only requires 2 colors and a direction
//
// @inheritsFrom Gradient
// @treeLocation Client Reference/Drawing/Gradients
// @visibility drawing
//<
//> @attr simpleGradient.direction (float: 0.0: IR)
//Direction vector in degrees
//
//@visibility drawing
//<
//> @attr simpleGradient.startColor (String: null: IR)
//The color at the start of the gradient.
//
//@visibility drawing
//<
//> @attr simpleGradient.endColor (String : null : IR)
//The color at the end of the gradient.
//
//@visibility drawing
//<

//> @object LinearGradient
// An ordinary JavaScript object containing properties that describe a linear gradient
//
// @inheritsFrom Gradient
// @treeLocation Client Reference/Drawing/Gradients
// @visibility drawing
//<
//> @attr linearGradient.x1 (String: null: IR)
//
// @visibility drawing
//<
//> @attr linearGradient.y1 (String: null: IR)
//
// @visibility drawing
//<
//> @attr linearGradient.x2 (String: null: IR)
//
// @visibility drawing
//<
//> @attr linearGradient.y2 (String: null: IR)
//
// @visibility drawing
//<

//> @object RadialGradient
// An ordinary JavaScript object containing properties that describe a radial gradient
//
// @inheritsFrom Gradient
// @treeLocation Client Reference/Drawing/Gradients
// @visibility drawing
//<
//> @attr radialGradient.cx (String: null: IR)
// x coordinate of outer radial
//
// @visibility drawing
//<
//> @attr radialGradient.cy (String: null: IR)
// y coordinate of outer radial
//
// @visibility drawing
//<
//> @attr radialGradient.r  (String: null: IR)
// radius
//
// @visibility drawing
//<
//> @attr radialGradient.fx (String: null: IR)
// x coordinate of inner radial
//
// @visibility drawing
//<
//> @attr radialGradient.fy (String: 0: IR)
// y coordinate of inner radial
//
// @visibility drawing
//<

//> @object Shadow
//A class used to define a shadow used in a Draw&lt;Shape&gt; Types.
//
// @visibility drawing
//<
//> @attr shadow.color (CSSColor: black: IR)
//
//@visibility drawing
//<
//> @attr shadow.blur (int: 10: IR)
//
//@visibility drawing
//<
//> @attr shadow.offset (Point: [0,0]: IR)
//
//@visibility drawing
//<

createQuadTree : function () {
    this.quadTree = isc.QuadTree.create({
        depth: 0,
        maxDepth: 50,
        maxChildren: 1
    });
    this.quadTree.bounds = {x:0,y:0,width:this.getInnerContentWidth(),height:this.getInnerContentHeight()};
    this.quadTree.root = isc.QuadTreeNode.create({
        depth: 0,
        maxDepth: 8,
        maxChildren: 4
    });
    this.quadTree.root.bounds = this.quadTree.bounds;
},

updateQuadTree : function (shape) {
    this.quadTree.update(shape.item);
},

initWidget : function () {
    this.gradients = {};
    if (this.drawingType == "svg") this._isLoaded = false;
    this.drawItems = this.drawItems || [];
    this.canvasItems = this.canvasItems || [];
    this.createQuadTree();
    for (var i = 0; i < this.drawItems.length; i++) {
        this.addDrawItem(this.drawItems[i]);
    }
    for (var i = 0; i < this.canvasItems.length; i++) {
        this.addCanvasItem(this.canvasItems[i]);
    }
    // don't redraw with SVG or VML or we'll wipe out the DOM elements DrawItems use
    this.redrawOnResize = (this.drawingType=="bitmap");

    // initialize internal viewbox properties for global pan/zoom operations
    // see getInnerHTML(), _setViewBox()
    this._viewPortWidth = this.getInnerContentWidth();
    this._viewPortHeight = this.getInnerContentHeight();
    this._viewBoxLeft = 0;
    this._viewBoxTop = 0;
    this._viewBoxWidth = this._viewPortWidth;
    this._viewBoxHeight = this._viewPortHeight;

    if (isc.Browser.isIE && this.drawingType == "vml") {
        document.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
        try {
            !document.namespaces.rvml && document.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
            this.startTagVML = function (tagName) {
                return '<rvml:' + tagName + ' class="rvml" ';
            };
            this.endTagVML = function (tagName) {
                return '</rvml:' + tagName + '>';
            };

        } catch (e) {
            this.startTagVML = function (tagName) {
                return '<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml" ';
            };
            this.endTagVML = function (tagName) {
                return '</rvml:' + tagName + '>';
            };
        }
    }
},
normalize : function (x, y, toAbsCoords) {
    // toAbsCoords flag: If we have coords normalized to account for zoom/rotation this
    // reverses that to get back abs px coords within our drawPane

    var zoomLevel = this.zoomLevel,
        rotation = this.rotation;
    if ((!toAbsCoords || zoomLevel != 0) && !(zoomLevel == 1 && rotation == 0)) {
        var centerX = 0,
            centerY = 0;
        if (toAbsCoords) {
            zoomLevel = 1/zoomLevel;
            rotation = -rotation;
        }
        var rotation = -rotation*Math.PI/180.0;
        var xprime = x - centerX;
        var yprime = y - centerY;
        var xprime2 = xprime*Math.cos(rotation)-yprime*Math.sin(rotation);
        var yprime2 = xprime*Math.sin(rotation)+yprime*Math.cos(rotation);
        xprime2 /= zoomLevel;
        yprime2 /= zoomLevel;
        xprime2 += centerX;
        yprime2 += centerY;
        return {x:xprime2,y:yprime2};
    }
    return {x:x,y:y};
},

// Event handling logic


getDrawItem : function (x, y, seekingHoverTarget) {
    var pageOffsets = this.getPageOffsets();
    x -= pageOffsets.left + this.getLeftMargin() + this.getLeftBorderSize() + this.getLeftPadding();
    y -= pageOffsets.top + this.getTopMargin() + this.getTopBorderSize() + this.getTopPadding();
    var normalized = this.normalize(x, y);
    x = normalized.x;
    y = normalized.y;
    var items = this.quadTree.retrieve({ x: x, y: y });


    // We need to traverse from last to first so that an event will be handled by top drawItem
    // when there are several items drawn above one another.
    var itemsLength = (items ? items.length : 0),
        blockingGroup = null;
    for (var i = itemsLength; i--; ) {
        var item = items[i].item || items[i],
            shape = item.shape;
        if ((seekingHoverTarget &&
             (shape.canHover === false || (shape.canHover == null && shape.prompt == null))) ||
            shape.hidden)
        {
            continue;
        }

        var checkForPath = shape.checkPointInPath,
            inItem;
        if (checkForPath) {
            inItem = shape.isPointInPath(x, y);
        } else {
            inItem = shape.isInBounds(x, y);
        }




        var blockedByGroup = false;
        for (var dg = shape.drawGroup; !blockedByGroup && dg != null; dg = dg.drawGroup) {

            if (dg.useGroupRect && dg.isInBounds(x, y)) {
                blockedByGroup = true;
                blockingGroup = dg;
            }
        }
        if (blockedByGroup) {

            continue;
        }

        if (inItem) {
            return shape;
        }
    }
    return blockingGroup;
},

getEventTarget : function (scEvent) {

//     this.logDebug("getEventTarget firing:" + scEvent.eventType + " at " +
//                  [scEvent.x,scEvent.y], "drawEvents");
    switch(scEvent.eventType) {
        case 'mouseUp':
        case 'mouseDown':
        case 'mouseMove':
        case 'mouseOut':
        case 'mouseOver':
        case 'click':
        case 'contextMenu':
            var item = this.getDrawItem(scEvent.x,scEvent.y);
            if (item != null) return item;
        default:
    }
    return this;
},

getHoverTarget : function (scEvent) {
    var item = this.getDrawItem(scEvent.x, scEvent.y, true);
    if (item != null) return item;
    return this.Super("getHoverTarget", arguments);
},

_updateCursor : function (drawItem) {
    var currentCursor = this.getCurrentCursor();
    if (drawItem != null && drawItem.cursor != null) currentCursor = drawItem.cursor;
    this._applyCursor(currentCursor);
},

prepareForDragging: function () {
    // This event will bubble. If a child has already set up EH.dragTarget no need to
    // attempt to assign to an item.
    if(!isc.EH.dragTarget && this.canDrag) {
        var item = this.getDrawItem(isc.EH.lastEvent.x,isc.EH.lastEvent.y);
        if(item && item.canDrag) {
            isc.EH.dragTarget = item;
            isc.EH.dragOperation = "drag";
            return true;
        }
    }
    // If the user isn't attempting to drag a specific item, call Super() to allow standard Canvas
    // drag behavior.
    return this.Super("prepareForDragging", arguments);
},
clear : function () {
    this.Super("clear", arguments);
    // wipe the "_drawn" flag from our draw items
    // if we are drawn again, we'll call 'draw()' on each item to re-show as part of drawChildren()

    if (this.drawItems != null) {
        for (var i = 0, len = this.drawItems.length; i < len; ++i) {
            var drawItem = this.drawItems[i];
            drawItem._clearEventParent();
            drawItem._drawn = false;
        }
    }
    if (this.drawingType == "bitmap") {
        this._bitmapContext = null; // clear the cached bitmap context handle
    }
},
// private method for quadtree debug
drawBounds : function(node) {
    isc.DrawRect.create({
      autoDraw:true,
      drawPane:this,
      left:Math.round(node.bounds.x),
      top:Math.round(node.bounds.y-node.bounds.height),
      width:Math.round(node.bounds.width),
      height:Math.round(node.bounds.height)
    },{
      lineColor:"#FF0000",
      lineOpacity:0.1,
      lineWidth:1,
      linePattern:"solid"
    });
    if(node.nodes && node.nodes.length) {
        for(var i = 0; i < node.nodes.length; ++i) {
          this.drawBounds(node.nodes[i]);
        }
    }
},

//> @method drawPane.erase()
// Call +link{DrawItem.erase()} on all DrawItems currently associated with the DrawPane.
// <P>
// The DrawItems will continue to exist, and you can call draw() on them to make them appear again, or
// +link{drawItem.destroy,destroy} to get rid of them permanetly.  Use +link{destroyItems()} to permanently
// get rid of all DrawItems.
//
// @visibility drawing
//<


erase : function (destroy, willRedraw) {
    if (willRedraw == undefined) {
        willRedraw = true;
        this._maybeScheduleRedrawTEA();
    }
    if (destroy) {
        for (var i = 0; i < this.drawItems.length; i++) {
            this.drawItems[i].destroy(true, willRedraw); // pass destroyingAll flag to prevent extra redraws
        }
    } else if (this.isDrawn()) {
        for (var i = 0; i < this.drawItems.length; i++) {
            this.drawItems[i].erase(true, willRedraw); // pass erasingAll flag to prevent extra redraws
        }
    }
    if (willRedraw) this._erasedGradients = this.gradients;
    this.gradients = {};
    // clearing this.drawItems ensures they won't be drawn again if this pane is clear()ed and
    // draw()n again.
    if (willRedraw) this._erasedDrawItems = this.drawItems;
    this.drawItems = [];
    delete this._delayedDrawItems;
    this.canvasItems = [];
    this.createQuadTree();
    if (this.drawingType == "bitmap") this.redrawBitmap();
},

//> @method drawPane.destroyItems()
// Permanently +link{drawItem.destroy,destroy} all DrawItems currently associated with this DrawPane,
// leaving the DrawPane itself intact
// @visibility drawing
//<
destroyItems : function () {
    this.erase(true);
},

destroy : function () {
    for (var i = 0; i < this.drawItems.length; i++) {
        this.drawItems[i].destroy();
    }
    this.Super("destroy", arguments);
},

//> @method drawPane.addDrawItem()
// Add a drawItem to this drawPane (if necessary removing it from any other drawPanes)
// @param item (DrawItem) drawItem to add
// @param autoDraw (boolean) If explicitly set to false, and this drawPane is drawn, don't draw
//   the newly added item
// @visibility drawing
//<
addDrawItem : function (item, autoDraw) {

    if (item.drawGroup != null) {
        item.drawGroup.removeDrawItem(item);

    // Remove the item from an existing DrawPane.
    // We want addDrawItem() to move the item to the front.  This allows the stack order of the
    // draw items to be corrected if other draw items are added, but `item' needs to remain
    // on top.
    } else if (item.drawPane != null) {

        if (item.drawPane == this) {
            // The item will be readded to the end of the drawItems array later in this method.
            this.drawItems.remove(item);

        // Hide the item's knobs if it's being moved from a different DrawPane.
        } else {
            item.drawPane.removeDrawItem(item);

            if (item.knobs != null && !item.knobs.isEmpty()) item.knobs.map(item._hideKnobs, item);
        }
    }
    item.drawPane = this;

    if (autoDraw == null) autoDraw = true;

    // Table of actions:
    // +----------+----------------+---------------------------+
    // | autoDraw | this.isDrawn() | Action                    |
    // +----------+----------------+---------------------------+
    // |    T     |       T        | item.draw()               |
    // |    T     |       F        | add to this.drawItems     |
    // |    F     |       T        | (no action as documented) |
    // |    F     |       F        | add to this.drawItems     |
    // +----------+----------------+---------------------------+
    if (!this.isDrawn()) {
        if (!this.drawItems.contains(item)) {
            this.drawItems.add(item);
            item._drawKnobs();
        }
        this.shouldDeferDrawing(item);
    } else if (autoDraw && !item._drawn) {
        // just call draw on the item to plug it into this.drawItems and render it out.
        item.draw();
    }
},

// removeDrawItem() - erase the item and remove from this.drawItems / clear up the item.drawPane
// pointer back to this.
// Currently used only by addDrawItem to clear up any previous drawPane the item pointed to.
removeDrawItem : function (item) {
    if (item.drawPane != this) return;
    if (item._drawn) {
        item.erase();
    } else {
        this.drawItems.remove(item);
    }
    item.drawPane = null;
},

// Override Canvas.getTransformCSS() so that an initial rotation value is not applied as a CSS
// transform to the DrawPane's handle. We'll handle DrawPane.rotation ourselves, depending on
// drawingType.
getTransformCSS : function () {
    return null;
},

getInnerHTML : function () {
    var type = this.drawingType;
    if (type == "vml") {
        // Would be nice to write out the VML behavior definition here, but the style block is
        // not parsed when drawn into a canvas after page load? if there is some way to do this,
        // the style definition is <style>VML\:* {behavior:url(#default#VML);}</style>
        // For now, just writing an outermost group that we can use for zoom and pan. Note
        // that this group needs a unique ID, since multiple DrawPanes may be instantiated on
        // the same page.
        // NB: need to at least wipe out the &nbsp, which pushes all shapes right by a few pixels
        // TODO/TEST - IIRC VML is supposed to define an implicit viewbox, but experts on MSDN
        //  articles have said that it is unpredictable, so we explicitly set it to the available
        //  space in the drawpane here. A 1-1 mapping of screen pixels and vector coordinates will
        //  limit precision/resolution of scalable drawings, though. We might want to set a
        //  higher resolution coordsize here and apply scaling to all drawing operations, not sure,
        //  but something to keep in mind if we see scaling artifacts or other pixel-level
        //  problems. For some more info on the coordinate space, see:
        //  http://msdn.microsoft.com/en-us/library/bb250511.aspx
        var innerContentWidth = this.getInnerContentWidth();
        var innerContentHeight = this.getInnerContentHeight();
        return this.startTagVML('GROUP') + " ID='" +
                this.getID() + "_vml_box' STYLE='position:absolute;left:" + this.padding + "px;top:" + this.padding + "px;width:" +
                innerContentWidth + "px; height:" + innerContentHeight + "px;rotation:" + (this.rotation) +
                ";' coordsize='" + innerContentWidth + ", " + innerContentHeight +
                "' coordorig='0 0'>" + this.endTagVML('GROUP');

    } else if (type == "bitmap") {
        var styleText = "display:block";
        if (this.rotation != null && (this.rotation % 360) != 0) {
            var transformValueText = "rotate(" + this.rotation + "deg)";
            if (isc.Browser.isIE) {
                styleText += ";-ms-transform:" + transformValueText;
            } else if (isc.Browser.isChrome || isc.Browser.isWebKit) {
                styleText += ";-webkit-transform:" + transformValueText;
            } else if (isc.Browser.isMoz) {
                styleText += ";-moz-transform:" + transformValueText;
            } else if (isc.Browser.isOpera) {
                styleText += ";-o-transform:" + transformValueText;
            }
            styleText += ";transform:" + transformValueText;
        }
        return isc.SB.concat(
            "<CANVAS ID='", this.getID(), "_bitmap' ",
                "WIDTH='", this.getInnerContentWidth(), "' ",
                "HEIGHT='", this.getInnerContentHeight(), "' ",
                "STYLE='", styleText, "' dir='ltr'>",
            "</CANVAS>"); // Firefox *requires* a closing CANVAS tag
    } else if (type == "svg") {
        // iframed svg document
        this._isLoaded = false;
        return "<IFRAME HEIGHT='100%' WIDTH='100%' SCROLLING='NO' FRAMEBORDER='0' SRC='" +
            isc.Page.getHelperDir() + "DrawPane.svg?isc_dp_id=" + this.getID() +"'></IFRAME>"
    } else {
        this.logWarn("DrawPane getInnerHTML: '" + type + "' is not a supported drawingType");
        return this.Super("getInnerHTML", arguments);
        // TODO implement alternate rendering/message when no drawing technology is available
    }
},

_handleResized : function () {
    var innerContentWidth = this._viewBoxWidth = this._viewPortWidth = this.getInnerContentWidth();
    var innerContentHeight = this._viewBoxHeight = this._viewPortHeight = this.getInnerContentHeight();

    if (!this.isDrawn()) return;

    var type = this.drawingType;
    if (type == "vml") {
        var vml_box = document.getElementById(this.getID() + "_vml_box");
        vml_box.style.width = innerContentWidth + "px";
        vml_box.style.height = innerContentHeight + "px";
    } else if (type == "bitmap") {
        var canvas = document.getElementById(this.getID() + "_bitmap");
        canvas.width = innerContentWidth;
        canvas.height = innerContentHeight;
    }
},

//> @method drawPane.getDataURL()
// Get a "data:" URL encoding the current contents of the DrawPane as a PNG file.
// <p>
// The returned "data:" URLs can be used anywhere a URL to an image is valid, for example,
// +link{Img.src}.
// <p>
// This method will directly return the data URL on modern browsers when using &lt;canvas&gt;-style
// rendering (the default).
// <p>
// On legacy browers (any version of IE in "quirks" mode, all versions of IE prior to 9.0), data
// URL generation requires a server trip and requires the SmartClient Server to be installed with
// the same set of +link{group:javaModuleDependencies,required .jars} as are required for PDF
// export of charts in legacy IE.  The method will return null and a callback must be passed,
// which fires when the data URL has been retrieved from the server.
// <p>
// If the callback is passed but no server trip is required, the callback is fired immediately.
// <p>
// For obtaining PNG or other image data for use in server-side processing (such as attaching to
// automated emails or saving to a database), see also the server-side APIs in
// com.isomorphic.contentexport.ImageExport.
//
// @param [callback] (DataURLCallback) callback to fire when data url is available
// @return (String) the data URL (on modern browsers)
// @example chartImageExport
// @visibility drawing
//<
getDataURL : function (callback) {
    if (this.drawingType == "bitmap") {
        var canvas = document.getElementById(this.getID() + "_bitmap");
        if (canvas != null && !!canvas.toDataURL) {
            var dataURL = canvas.toDataURL();
            if (dataURL.startsWith("data:image/png") &&
                (dataURL[14] == "," || dataURL[14] == ";"))
            {
                if (callback) this.fireCallback(callback, "dataURL", [dataURL]);
                return dataURL;
            }
        }
    }

    if (callback) {
        var requestProperties = {
            exportDisplay: "return"
        };
        var self = this;
        isc.RPCManager.exportImage(this.getSvgString(), requestProperties, function (imageData) {
            self.fireCallback(callback, "dataURL", ["data:image/png;base64," + imageData]);
        });
    }

    return null;
},

//> @method Callbacks.DataURLCallback
// Callback for +link{drawPane.getDataURL()}.
// @param dataURL (String) the data URL
// @visibility external
//<


measureLabel : function (text, labelProps) {
    if (text == null) text = "";
    else text = String(text);

    if (!labelProps) labelProps = {};
    var fontFamily = labelProps.fontFamily || isc.DrawLabel.getInstanceProperty("fontFamily"),
        fontWeight = labelProps.fontWeight || isc.DrawLabel.getInstanceProperty("fontWeight"),
        fontSize = labelProps.fontSize || isc.DrawLabel.getInstanceProperty("fontSize"),
        fontStyle = labelProps.fontStyle || isc.DrawLabel.getInstanceProperty("fontStyle");
    var cacheKey = fontSize + ":" + fontWeight + ":" + fontStyle + ":" + fontFamily + ":" + text;
    var cache;
    if (cache = this._measureLabelCache) {
        if (cache.hasOwnProperty(cacheKey)) return cache[cacheKey];
    } else cache = this._measureLabelCache = {};

    var measureCanvas = isc.DrawPane._getMeasureCanvas();

    var styleStr = "font-family:" + fontFamily + ";font-weight:" + fontWeight +
        ";font-size:" + fontSize + "px;font-style:" + fontStyle + ";white-space:nowrap";
    var contents = "<span style='" + styleStr + "'>" + text.asHTML() + "</span>";

    measureCanvas.setContents(contents);
    measureCanvas.redraw("label measurement: " + text);
    var dims = { width: measureCanvas.getVisibleWidth(), height: measureCanvas.getVisibleHeight() };
    //isc.logWarn("measureLabel:" + this.echoFull(dims) +
    //            "\ncontent:" + measureCanvas.getContents());
    return (cache[cacheKey] = dims);
},

//> @method drawPane.getSvgString()
// Converts this DrawPane to the source of an <code>&lt;svg&gt;</code> element equivalent to the
// current drawing.
// <p>
// In Pro edition and above, the returned string can be used with
// +link{RPCManager.exportImage()} to download an image, or with server-side APIs in
// com.isomorphic.contentexport.ImageExport to obtain various kinds of images for further
// server-side processing.
//
// @return (String) the source of an <code>&lt;svg&gt;</code> element.
// @example chartImageExport
// @visibility drawing
//<
getSvgString : function (conversionContext) {
    var width = this.getWidth(), height = this.getHeight(),
        rotation, center, widthP = width, heightP = height;

    var clipHandle = this.getClipHandle();
    var borderWidths = isc.Element.getBorderSizes(clipHandle);

    // When the drawing is rotated, the width and height of the <svg> element need to be set to
    // `widthP` and `heightP`, the width and height of the bounding box of a rectangle rotated
    // `this.rotation` degrees and having width `this.getWidth()` and height `this.getHeight()`.
    if (this.rotation && (center = this.getCenter()) && center.length == 2) {
        rotation = ((this.rotation % 360) + 360) % 360;

        var phi = rotation * Math.PI / 180;
        var df = Math.sqrt(width * width + height * height);

        var a1;
        if (0 <= rotation && rotation < 90) {
            a1 = Math.atan(height / width);
            widthP = df * Math.cos(phi - a1);
            heightP = df * Math.sin(phi + a1);
        } else if (90 <= rotation && rotation < 180) {
            a1 = Math.atan(width / height);
            widthP = df * Math.sin(phi - a1);
            heightP = -df * Math.cos(phi + a1);
        } else if (180 <= rotation && rotation < 270) {
            a1 = Math.atan(height / width);
            widthP = -df * Math.cos(phi - a1);
            heightP = -df * Math.sin(phi + a1);
        } else if (270 <= rotation && rotation < 360) {
            a1 = Math.atan(width / height);
            widthP = -df * Math.sin(phi - a1);
            heightP = df * Math.cos(phi + a1);
        }
    }

    conversionContext = conversionContext || isc.SVGStringConversionContext.create();
    conversionContext.xlinkPrefix = conversionContext.xlinkPrefix || isc.SVGStringConversionContext._$xlink;
    var finalWidth = widthP + borderWidths.right + borderWidths.left,
        finalHeight = heightP + borderWidths.top + borderWidths.bottom;
    var padding = (this.padding == undefined ? 0 : parseFloat(this.padding));
    if (this.drawingType != "svg") {
        finalWidth -= padding;
        finalHeight -= padding;
    }
    var svgString = "<svg xmlns='" + isc._$svgNS +
        "' xmlns:" + conversionContext.xlinkPrefix + "='" + isc._$xlinkNS +
        "' width='" + finalWidth + "px" +
        "' height='" + finalHeight + "px" +
        "' viewBox='0 0 " + finalWidth + " " + finalHeight +
        "' version='1.1" +
        "'><metadata><!-- Generated by SmartClient " + isc.version + " --></metadata>";
    if (this.backgroundColor != null) {
        svgString += "<rect x='0' y='0' width='" + finalWidth +
            "' height='" + finalHeight +
            "' stroke='none' fill='" + this.backgroundColor + "'/>";
    }
    svgString += "<g";
    if (rotation) {
        svgString += " transform='translate(" + ((widthP - width) / 2 + padding + borderWidths.left) + " " + ((heightP - height) / 2 + padding + borderWidths.top) + ") rotate(" + rotation + " " + center[0] + " " + center[1] + ")'";
    } else {
        svgString += " transform='translate(" + (padding + borderWidths.left) + " " + (padding + borderWidths.top) + ")'";
    }
    svgString += "><svg width='" + width +
          "' height='" + height + "'>";
    if (this.drawItems && this.drawItems.length) {
        svgString += "<g id='isc_svg_box";
        svgString += "'>";
        for (var i = 0; i < this.drawItems.length; ++i) {
            svgString += this.drawItems[i].getSvgString(conversionContext);
        }
        svgString += "</g>";
        if (conversionContext.svgDefStrings) {
            svgString += "<defs id='isc_svg_defs'>";
            for (var id in conversionContext.svgDefStrings) {
                if (conversionContext.svgDefStrings.hasOwnProperty(id)) svgString += conversionContext.svgDefStrings[id];
            }
            svgString += "</defs>";
        }
    }
    svgString += "</svg></g>";

    // Draw the borders
    var borderStyles = {
        Top: isc.Element.getComputedStyleAttribute(clipHandle, "borderTopStyle"),
        Right: isc.Element.getComputedStyleAttribute(clipHandle, "borderRightStyle"),
        Bottom: isc.Element.getComputedStyleAttribute(clipHandle, "borderBottomStyle"),
        Left: isc.Element.getComputedStyleAttribute(clipHandle, "borderLeftStyle")
    };
    var borderColors = {
        Top: isc.Element.getComputedStyleAttribute(clipHandle, "borderTopColor"),
        Right: isc.Element.getComputedStyleAttribute(clipHandle, "borderRightColor"),
        Bottom: isc.Element.getComputedStyleAttribute(clipHandle, "borderBottomColor"),
        Left: isc.Element.getComputedStyleAttribute(clipHandle, "borderLeftColor")
    };
    var strokeDasharrayAttr, xOffset, yOffset;
    // As a special exception, if all four borders are the same, then output a <rect> element.
    if (borderWidths.Top == borderWidths.Right &&
        borderWidths.Right == borderWidths.Bottom &&
        borderWidths.Bottom == borderWidths.Left &&

        borderStyles.Top == borderStyles.Right &&
        borderStyles.Right == borderStyles.Bottom &&
        borderStyles.Bottom == borderStyles.Left &&

        borderColors.Top == borderColors.Right &&
        borderColors.Right == borderColors.Bottom &&
        borderColors.Bottom == borderColors.Left)
    {
        if (borderWidths.Top) {
            strokeDasharrayAttr = null;
            if (borderStyles.Top == "solid") strokeDasharrayAttr = "";
            else if (borderStyles.Top == "dashed") strokeDasharrayAttr = " stroke-dasharray='5,5'";
            else if (borderStyles.Top == "dotted") strokeDasharrayAttr = " stroke-dasharray='1.5,2'";

            if (strokeDasharrayAttr != null && borderColors.Top) {
                yOffset = xOffset = borderWidths.Top / 2;
                svgString += "<rect x='" + xOffset +
                    "' y='" + yOffset +
                    "' width='" + (finalWidth - borderWidths.Top) +
                    "' height='" + (finalHeight - borderWidths.Top) +
                    "' stroke='" + borderColors.Top +
                    "' stroke-width='" + borderWidths.Top + "px'" +
                    strokeDasharrayAttr + " fill='none'/>";
            }
        }
    } else {
        var dirs = [ "Left", "Bottom", "Right", "Top" ],
            borderWidth, borderStyle, borderColor, x, y;
        for (var i = 0; i < dirs.length; ++i) {
            var dir = dirs[i];
            borderWidth = borderWidths[dir];
            if (borderWidth) {
                borderStyle = borderStyles[dir];
                strokeDasharrayAttr = null;
                if (borderStyle == "solid") strokeDasharrayAttr = "";
                else if (borderStyle == "dashed") strokeDasharrayAttr = " stroke-dasharray='5,5'";
                else if (borderStyle == "dotted") strokeDasharrayAttr = " stroke-dasharray='1.5,2'";

                if (strokeDasharrayAttr != null) {
                    borderColor = borderColors[dir];
                    if (borderColor) {
                        if (dir == "Left") {
                            x = borderWidth / 2;
                            yOffset = borderWidth / 2;
                            svgString += "<line x1='" + x +
                                "' y1='" + yOffset +
                                "' x2='" + x +
                                "' y2='" + (finalHeight - yOffset);
                        } else if (dir == "Bottom") {
                            xOffset = borderWidth / 2;
                            y = finalHeight - borderWidth / 2;
                            svgString += "<line x1='" + xOffset +
                                "' y1='" + y +
                                "' x2='" + (finalWidth - xOffset) +
                                "' y2='" + y;
                        } else if (dir == "Right") {
                            x = finalWidth - borderWidth / 2;
                            yOffset = borderWidth / 2;
                            svgString += "<line x1='" + x +
                                "' y1='" + yOffset +
                                "' x2='" + x +
                                "' y2='" + (finalHeight - yOffset);
                        } else { // dir == "Top"
                            xOffset = borderWidth / 2;
                            y = borderWidth / 2;
                            svgString += "<line x1='" + xOffset +
                                "' y1='" + y +
                                "' x2='" + (finalWidth - xOffset) +
                                "' y2='" + y;
                        }

                        svgString += "' stroke='" + borderColor +
                            "' stroke-width='" + borderWidth + "px'" +
                            strokeDasharrayAttr + "/>";
                    }
                }
            } // end if (borderWidth)
        }
    }

    svgString += "</svg>";
    return svgString;
},

//> @method drawPane.getPrintHTML() [A]
// Retrieves printable HTML for this component and all printable subcomponents.
// <P>
// By default any Canvas with children will simply collect the printable HTML of its
// children by calling getPrintHTML() on each child that is considered
// +link{canvas.shouldPrint,printable}.
// <P>
// If overriding this method for a custom component, you should <b>either</b> return a String of
// printable HTML string directly <b>or</b> return null, and fire the callback (if provided)
// using +link{Class.fireCallback}.
// <P>
// To return an empty print representation, return an empty string ("") rather than null.
// <P>
// The <code>printProperties</code> argument, if passed, must be passed to any subcomponents on
// which <code>getPrintHTML()</code> is called.
// <P>
// <b>Notes on printing</b>
// <P>
// To print a <code>DrawPane</code> for export on IE8 and earlier, it is important to pass
// +link{PrintProperties} with +link{PrintProperties.printForExport,printForExport}:true:
// <var class="smartclient">
// <pre>var exportHTML = drawPane.getPrintHTML({ printForExport:true });</pre>
// </var><var class="smartgwt">
// <pre>final PrintProperties pp = new PrintProperties();
//pp.setPrintForExport(true);
//final String exportHTML = drawPane.getPrintHTML(pp, null);</pre>
// </var>
// @include method:canvas.getPrintHTML()
// @group printing
// @visibility external
//<
getPrintHTML : function (printProperties, callback) {
    if (this.drawingType == "bitmap") {
        var canvas = document.getElementById(this.getID() + "_bitmap");
        var ret = "<img src='" + canvas.toDataURL();

        if (printProperties && printProperties.printForExport) {
            ret += "' style='width:" + this.getWidth() + "px;max-width:100%";
        } else {
            ret += "' width='" + this.getWidth() + "' height='" + this.getHeight();
        }
        ret += "'/>";
        return ret;
    } else if (this.drawingType == "vml") {
        if (printProperties && printProperties.printForExport) return this.getSvgString();
        var vml_box = document.getElementById(this.getID() + "_vml_box");
        // Enclose the vml box in a relative tag so it'll flow correctly in the document

        return "<div style='position:relative;width:" + this.getInnerContentWidth() +
                    ";height:" + this.getInnerContentHeight() +
                    ";'>" + vml_box.parentElement.innerHTML + "</div>";
    } else if (this.drawingType == "svg") {
        return this.getSvgString();
    } else {
        return "";
    }
},

_batchDraw : function (drawItems) {

    if (drawItems == null) return;
    if (this.drawingType == "svg") {
        if (!this._svgDocument) return;

        if (!isc.isAn.Array(drawItems)) drawItems = [ drawItems ];

        var conversionContext = isc.SVGStringConversionContext.create({ printForExport: false });
        var beforeSvgString = "", afterSvgString = "";
        for (var i = 0; i < drawItems.length; i++) {
            var drawItem = drawItems[i];
            if (drawItem._svgHandle) drawItem._svgHandle.parentNode.removeChild(drawItem._svgHandle);
            var svgString = drawItems[i].getSvgString(conversionContext);
            if (drawItem.drawToBack) beforeSvgString += svgString;
            else afterSvgString += svgString;
        }

        var defsSvgString = "";
        for (var defID in conversionContext.svgDefStrings) {
            if (conversionContext.svgDefStrings.hasOwnProperty(defID) && !this._svgDocument.getElementById(defID)) {
                var defSvgString = conversionContext.svgDefStrings[defID];

                defsSvgString += defSvgString;
            }
        }

        var svgContainer = this._svgDocument.getElementById("isc_svg_box");
        if (!isc.Browser.isWebKit) {
            var range = this._svgDocument.createRange();
            range.setStart(this._svgDefs, 0);
            this._svgDefs.appendChild(range.createContextualFragment(defsSvgString));


            range.setStart(svgContainer, 0);
            svgContainer.insertBefore(range.createContextualFragment(beforeSvgString), svgContainer.firstChild);


            svgContainer.appendChild(range.createContextualFragment(afterSvgString));
        } else {
            // WebKit browsers throw DOM error 9 NOT_SUPPORTED_ERR upon invocation of Range.createContextualFragment()
            // for Ranges created by the SVG document. A work-around is to use the DOMParser API.
            // See:  http://code.google.com/p/chromium/issues/detail?id=107982
            var domParser = new DOMParser();
            var parsedDoc = domParser.parseFromString("<svg xmlns='" + isc._$svgNS + "' xmlns:" + conversionContext.xlinkPrefix + "='" + isc._$xlinkNS + "'>" +
                                                        "<defs>" + defsSvgString + "</defs>" +
                                                        "<g>" + beforeSvgString + "</g>" +
                                                        "<g>" + afterSvgString + "</g>" +
                                                      "</svg>", "image/svg+xml");
            var svgElem = parsedDoc.documentElement;
            var beforeElementsContainerElem = this._svgDocument.importNode(svgElem.childNodes.item(1), true);
            var afterElementsContainerElem = this._svgDocument.importNode(svgElem.childNodes.item(2), true);
            var defsContainerElem = this._svgDocument.importNode(svgElem.childNodes.item(0), true);
            svgElem = null;
            parsedDoc = null;

            var child;
            while (child = defsContainerElem.firstChild) {
                this._svgDefs.appendChild(child);
            }

            var svgContainerFirstChild = svgContainer.firstChild;
            while (child = beforeElementsContainerElem.firstChild) {
                svgContainer.insertBefore(child, svgContainerFirstChild);
            }

            while (child = afterElementsContainerElem.firstChild) {
                svgContainer.appendChild(child);
            }
        }

        for (var i = 0; i < drawItems.length; i++) {
            var drawItem = drawItems[i];
            drawItem.drawPane = this;
            drawItem.drawingSVG = true;
            drawItem._svgDocument = this._svgDocument;
            drawItem._svgContainer = svgContainer;
            drawItem._svgHandle = this._svgDocument.getElementById("isc_DrawItem_" + drawItem.drawItemID);
            drawItem._setupEventParent();
            drawItem._drawn = true;
        }
    } else if (this.drawingType == "bitmap") {
        this.redrawBitmapNow();
    } else {
        for (var i = 0; i < drawItems.length; i++) {
            var drawItem = drawItems[i];
            drawItem.draw();
        }
    }

},

//> @method drawPane.isBatchDrawing()
// Determines whether this DrawPane is in batch drawing mode.
//
// @return (Boolean) whether this DrawPane is in batch drawing mode.
// @visibility internal
//<

isBatchDrawing : function () {
    return this._batchDrawing === true;
},

_isBatchDrawing : function () {
    return (this._batchDrawing === true ||
            // might as well be in batch drawing mode if the redraw TEA is scheduled because
            // drawn DrawItems are just going to be redrawn anyway.
            this._isRedrawTEAScheduled() ||
            this._isLoaded === false) &&
           this._endingBatchDrawing !== true;
},

//> @method drawPane.beginBatchDrawing()
// Begins batching the drawing of DrawItems that have been added to this DrawPane so that all drawing
// of DrawItems can be done at the same time. If this DrawPane is already in batch drawing mode, then
// calling this method has no effect.
//
// <p><b>NOTE:</b> For batch drawing to work properly, each call to beginBatchDrawing() must be matched
// by a corresponding call to +link{DrawPane.endBatchDrawing()}.
//
// <p>Consider using batch drawing when several DrawItems are going to be drawn in a single thread of execution.
// This can be an important optimization in that scenario, especially when using the SVG drawing back-end.
// The SVG back-end benefits from batch drawing by being able to utilize the browser's native SVG parser to parse and insert
// the SVG elements all at once rather than resorting to calling a multitude of DOM operations to
// draw each DrawItem.
//
// @visibility internal
//<


beginBatchDrawing : function () {
    this._batchDrawing = true;
},

//> @method drawPane.endBatchDrawing()
// Ends batching the drawing of DrawItems.
//
// @visibility internal
//<

endBatchDrawing : function (immediate) {
    if (!this.isBatchDrawing()) this.logWarn("Not in batch drawing mode. Exiting.");
    this._endBatchDrawing(immediate);
},

_endBatchDrawing : function (immediate) {
    if (!this._isBatchDrawing()) return;
    if (immediate == true) {
        this.refreshNow();
        this._batchDrawing = false;
    } else this._maybeScheduleRedrawTEA();
},

//> @method drawPane.refreshNow() [A]
// Immediately draws any DrawItems that have been added to a drawing batch.
//
// @visibility internal
//<
refreshNow : function () {
    this._endingBatchDrawing = true;
    this._batchDraw(this._delayedDrawItems);
    delete this._delayedDrawItems;
    this._endingBatchDrawing = false;
},

// Override drawChildren to render out our drawItems
drawChildren : function () {
    this.Super("drawChildren", arguments);
    if (this.drawingType != "svg" || !this._isBatchDrawing()) {
        for (var i = 0; i < this.drawItems.length; i++) {
            var drawItem = this.drawItems[i];
            drawItem.draw();
        }
    }
},

getBitmapContext : function () {
    if (this._bitmapContext) return this._bitmapContext;
    var bitmapHandle = isc.Element.get(this.getID() + "_bitmap");
    if (!bitmapHandle) {
        this.logWarn("DrawPane failed to get CANVAS element handle");
        return;
    }
    var bitmapContext = this._bitmapContext = bitmapHandle.getContext("2d");
    if (!bitmapContext) {
        this.logWarn("DrawPane failed to get CANVAS 2d bitmap context");
        return;
    }
    return bitmapContext;
},


redraw : function (reason) {
    // in Canvas mode, redraw the <canvas> tag to resize it
    if (this.drawingType == "bitmap") {
        // do normal redraw to resize the <canvas> element in our innerHTML
        this.Super("redraw", arguments);
        this._bitmapContext = null; // clear the cached bitmap context handle
        if (!this._isRedrawTEAScheduled()) this.redrawBitmapNow();
    }
    // otherwise ignore: don't want to lose the SVG or VML DOM
},

_isRedrawTEAScheduled : function () {
    return this._redrawTEAScheduled == true ||
           (this.drawingType == "bitmap" && this._redrawPending);
},

_maybeScheduleRedrawTEA : function () {
    if (!this._isRedrawTEAScheduled()) {
        if (this.drawingType == "bitmap") this.redrawBitmap();
        else {
            var self = this;
            isc.EH._setThreadExitAction(function () {
                self._redrawTEA();
            });
            this._redrawTEAScheduled = true;
            this._ranRedrawTEA = false;
        }
    }
},

_redrawTEA : function () {
    if (this._ranRedrawTEA !== false) return;
    this._ranRedrawTEA = true;

    if (this._erasedDrawItems) {
        for (var i = 0; i < this._erasedDrawItems.length; ++i) {
            var erasedDrawItem = this._erasedDrawItems[i];
            if (erasedDrawItem._erasedSVGHandle) {
                erasedDrawItem._erasedSVGHandle.parentNode.removeChild(erasedDrawItem._erasedSVGHandle);
                delete erasedDrawItem._erasedSVGHandle;
            }
        }
        delete this._erasedDrawItems;
    }
    if (this._erasedGradients) {
        if (this.drawingType == "svg" && this._svgDocument) {
            for (var gradientID in this._erasedGradients) {
                if (!this._erasedGradients.hasOwnProperty(gradientID)) continue;
                var svgDef = this._erasedGradients[gradientID]._svgDef;
                if (!svgDef) svgDef = this._svgDocument.getElementById(gradientID);

                if (svgDef) {
                    svgDef.parentNode.removeChild(svgDef);

                    gradientID = svgDef.getAttributeNS(isc._$xlinkNS, "href");
                    if (gradientID && gradientID.charAt(0) == '#') gradientID = gradientID.substring(1);
                    if (gradientID) {
                        svgDef = this._svgDocument.getElementById(gradientID);
                        if (svgDef) svgDef.parentNode.removeChild(svgDef);
                    }
                }
            }
        }
        delete this._erasedGradients;
    }

    this._endingBatchDrawing = true;
    this._batchDraw(this.drawItems);
    this._endingBatchDrawing = false;

    this._redrawTEAScheduled = false;
},


redrawBitmap : function () {
    // defer redraw until end of current thread
    if (this._redrawPending) return;
    this._redrawPending = true;
    var self = this;
    isc.EH._setThreadExitAction(function () {
        if (!self._redrawPending) return;
        self.redrawBitmapNow();
    });
},


redrawBitmapNow : function () {
    this._redrawPending = false;


    var delayedDrawItems = this._delayedDrawItems;
    if (delayedDrawItems != null) {

        for (var i = delayedDrawItems.length; i--; ) {
            var item = delayedDrawItems[i];
            if (!this.shouldDeferDrawing(item)) {
                delayedDrawItems.remove(item);
            }
            item.draw();
        }
    }

    if (!this.isDrawn()) return; // clear()d during redraw delay

    var context = this.getBitmapContext();
    if (!context) return; // getBitmapContext has already logged this error
    var canvas = document.getElementById(this.getID() + "_bitmap");
    canvas.width = canvas.width;
    context.clearRect(0, 0, this.getWidth(), this.getHeight());
    // this loop is duplicated in drawGroup.drawBitmap() to render nested drawItems
    for (var i=0; i<this.drawItems.length; i++) {
        var drawItem = this.drawItems[i];
        drawItem.drawingBitmap = true;
        if (!drawItem.hidden) {
            drawItem.drawBitmap(context);
            drawItem._setupEventParent();
            drawItem._drawn = true;
        }
    }
},

//> @method drawPane.drawing2screen() (A)
// Convert global drawing coordinates to screen coordinates, accounting for global zoom and pan.
// Takes and returns a rect in array format [left, top, width, height].
// Use this to synchronize non-vector elements (eg Canvii that provide interactive hotspots;
// DIVs that render text for VML DrawPanes) with the vector space.
// <P>
// <i>NB: this takes global drawing coordinates; be sure to convert from local
//     (DrawGroup translation hierarchy) coordinates first if necessary</i>
// @param drawingRect (array) 4 element array specifying drawing coordinates in format
//                  <code>[left, top, width, height]</code>
// @return (array) 4 element array specifying screen coordinates, in format
//                  <code>[left, top, width, height]</code>
//<
drawing2screen : function (drawRect) {
    return [
        Math.round((drawRect[0] - this._viewBoxLeft) * this.zoomLevel + this.getLeftPadding()),
        Math.round((drawRect[1] - this._viewBoxTop) * this.zoomLevel + this.getTopPadding()),
        Math.round(drawRect[2] * this.zoomLevel),
        Math.round(drawRect[3] * this.zoomLevel)
    ]
},

//> @method drawPane.screen2drawing() (A)
// Convert screen coordinates to global drawing coordinates, accounting for global zoom and pan.
// Takes and returns a rect in array format [left, top, width, height].
// Use this to map screen events (eg on transparent Canvas hotspots) into the vector space.
// <P>
// <i>NB: this returns global drawing coordinates; be sure to convert to local
//     (DrawGroup translation hierarchy) coordinates if necessary</i>
// @param screenRect (array) 4 element array specifying screen coordinates in format
//                  <code>[left, top, width, height]</code>
// @return (array) 4 element array specifying drawing coordinates, in format
//                  <code>[left, top, width, height]</code>
//<
screen2drawing : function (screenRect) {
    //!DONTOBFUSCATE
    return [
        (screenRect[0] - this.getLeftPadding()) / this.zoomLevel + this._viewBoxLeft,
        (screenRect[1] - this.getTopPadding()) / this.zoomLevel + this._viewBoxTop,
        screenRect[2] / this.zoomLevel,
        screenRect[3] / this.zoomLevel
    ]
},

// Define the region within the drawing space (the "viewbox") that should be scaled to fit in the
// current visible area (the "viewport"), effectively panning and/or zooming the drawPane.
// zoom() and pan() call through this method to get the job done.
_setViewBox : function (left, top, width, height) {
    var type = this.drawingType;

    // save the new viewbox coordinates
    this._viewBoxLeft = left;
    this._viewBoxTop = top;
    this._viewBoxWidth = width;
    this._viewBoxHeight = height;
    // update items and item properties that are not affected by the viewbox transformation,
    // or that need to be corrected because of the viewbox transformation
    this._updateItemsToViewBox();
    // manipulate the viewbox
    if (type == "vml") {
        if (!this._vmlBox) {
            this._vmlBox = isc.Element.get(this.getID()+"_vml_box");
        }
        if (this._vmlBox) {
            this._vmlBox.coordorigin.x = left;
            this._vmlBox.coordorigin.y = top;
            this._vmlBox.coordsize.x = width;
            this._vmlBox.coordsize.y = height;
        }
    } else if (type == "svg") {
        if (!this._svgBox) {
            var self = this;
            setTimeout(function() {self._setViewBox(left,top,width,height);},100);
        } else {
            this._svgBox.setAttributeNS(null, "transform", "translate(" + -left + "," + -top + ")")
        }
    }
},



// Embed a canvas in this drawpane, so it zooms/pans/clips in synch with shapes in the vector space.
// We assume that the original rect (left/top/width/height properties) of this canvas has been
// set in drawing coordinates, so we apply the current zoom and pan immediately.
// TODO support canvasItems in drawGroups
// TODO patch coordinate setters (setLeft, moveBy, etc) so they work with drawing coords?
//      or implement setDrawingLeft(), etc?
//      Currently we've worked around a single case: In DrawKnobs we supply a custom
//      setCenterPoint() method which can take drawing OR screen coordinates.
//
// NOTE: Any Canvas can be added to a drawPane as a canvasItem (it's not a custom Canvas class, and
// doesn't necessarily have any associated content rendered out as drawItems.
// By adding a canvas to a drawPane as a canvasItem you're essentially
// just causing the canvas to be notified when the drawPane zooms / pans.

addCanvasItem : function (item) {
    // crosslink
    this.canvasItems.add(item);
    item.drawPane = this;
    // save original position and size settings
    item._drawingLeft = item.left;
    item._drawingTop = item.top;
    item._drawingWidth = item.width;
    item._drawingHeight = item.height;
    // add as child, for local coordinates and clipping
    this.addChild(item);
    // update for current zoom & pan
    this._updateCanvasItemToViewBox(item);

    return item;
},

_getSimpleGradientSvgString : function (id, simpleGradient, conversionContext, drawItem) {
    return this._getLinearGradientSvgString(id, {
        id: simpleGradient.id,
        x1: simpleGradient.x1,
        y1: simpleGradient.y1,
        x2: simpleGradient.x2,
        y2: simpleGradient.y2,
        colorStops: [{
            color: simpleGradient.startColor,
            offset: 0.0
        }, {
            color: simpleGradient.endColor,
            offset: 0.0
        }]
    }, conversionContext, drawItem);
},


_getLinearGradientSvgString : function (id, linearGradient, conversionContext, drawItem) {
    var svgDefStrings = conversionContext.svgDefStrings || (conversionContext.svgDefStrings = {}),
        baseGradientID = id,
        svgString;
    if (!svgDefStrings[baseGradientID]) {
        svgString = "<linearGradient id='" + baseGradientID + "'>";
        for (var i = 0; i < linearGradient.colorStops.length; ++i) {
            var colorStop = linearGradient.colorStops[i],
                opacity = colorStop.opacity || "1";
            svgString += "<stop stop-color='" + colorStop.color + "' offset='" + colorStop.offset + "' stop-opacity='" + opacity + "'/>";
        }
        svgString += "</linearGradient>";
        svgDefStrings[baseGradientID] = svgString;
    }

    id = "gradient" + conversionContext.getNextSvgDefNumber();
    drawItem._useGradientID = id;
    var vector = drawItem._normalizeLinearGradient(linearGradient);
    svgString = "<linearGradient id='" + id +
            "' " + (conversionContext.xlinkPrefix||isc.SVGStringConversionContext._$xlink) + ":href='#" + baseGradientID +
            "' x1='" + vector[0] +
            "' y1='" + vector[1] +
            "' x2='" + vector[2] +
            "' y2='" + vector[3] +
            "' gradientUnits='userSpaceOnUse'/>";
    return svgString;
},


_getRadialGradientSvgString : function (id, radialGradient, conversionContext, drawItem) {
    var svgDefStrings = conversionContext.svgDefStrings || (conversionContext.svgDefStrings = {}),
        baseGradientID = id,
        svgString,
        xlinkPrefix = conversionContext.xlinkPrefix || isc.SVGStringConversionContext._$xlink;
    if (!svgDefStrings[baseGradientID]) {
        svgString = "<radialGradient id='" + baseGradientID;
        if (radialGradient._baseGradient != null) {
            var baseGradientID2, baseGradient;
            if (isc.isA.String(radialGradient._baseGradient)) {
                baseGradientID2 = radialGradient._baseGradient;
                baseGradient = this.gradients[baseGradientID2];
            } else {
                baseGradient = radialGradient._baseGradient;
                baseGradientID2 = baseGradient.id;
            }
            if (!svgDefStrings[baseGradientID2]) {
                svgDefStrings[baseGradientID2] = this._getRadialGradientSvgString(baseGradientID2, baseGradient, conversionContext);
            }
            svgString += "' " + xlinkPrefix + ":href='#" + baseGradientID2;
        }
        svgString += "'>";
        if (radialGradient.colorStops != null) {
            for (var i = 0; i < radialGradient.colorStops.length; ++i) {
                var colorStop = radialGradient.colorStops[i],
                    opacity = colorStop.opacity || "1";
                svgString += "<stop stop-color='" + colorStop.color + "' offset='" + colorStop.offset + "' stop-opacity='" + opacity + "'/>";
            }
        }
        svgString += "</radialGradient>";
        svgDefStrings[baseGradientID] = svgString;
    }

    if (drawItem != null) {
        id = "gradient" + conversionContext.getNextSvgDefNumber();
        drawItem._useGradientID = id;
        var vector = drawItem._normalizeRadialGradient(radialGradient);
        svgString = "<radialGradient id='" + id +
                "' " + xlinkPrefix + ":href='#" + baseGradientID;
        if (radialGradient.cx != null) svgString += "' cx='" + vector[0];
        if (radialGradient.cy != null) svgString += "' cy='" + vector[1];
        if (radialGradient.fx != null) svgString += "' fx='" + vector[3];
        if (radialGradient.fy != null) svgString += "' fy='" + vector[4];
        if (radialGradient.r != null) svgString += "' r='" + vector[5];
        svgString += "' gradientUnits='userSpaceOnUse'/>";
    }

    return svgString;
},

_getFilterSvgString : function (id) {
    if (id == "isc_ds1") {
        return "<filter id='isc_ds1'><feOffset result='offOut' in='SourceAlpha' dx='2.4' dy='2.4'/><feGaussianBlur result='blurOut' in='offOut' stdDeviation='1.8'/><feColorMatrix result='cmatOut' in='blurOut' type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.8 0'/><feBlend in='SourceGraphic' in2='cmatOut' mode='normal'/></filter>";
    }
    return null;
},


// move and scale an associated canvas to match the current drawPane zoom & pan
// called when a canvasItem is added to this drawPane, and when the drawPane is zoomed or panned
// will also need to call this when a canvasItem is moved or resized
_updateCanvasItemToViewBox : function (item) {
    // synchingToPane flag - This is required for DrawKnobs - it essentially notifies the
    // canvas that the drawItem (the knobShape) doesn't need to be moved in response to the
    // canvas move.
    item.synchingToPane = true;
    item.setRect(this.drawing2screen([
        item._drawingLeft,
        item._drawingTop,
        item._drawingWidth,
        item._drawingHeight
    ]));
    // HACK also scale border width, assuming uniform px borders all around
    // TODO consider how to structure this via shared CSS classes for faster updates
    // Note: we could get the initial border width from parseInt(item.getStyleHandle().borderWidth),
    // but we need some flag anyway to selectively enable border scaling (no point doing
    // this for eg canvasitems that are used as invisible hotspots), so we just use drawBorderSize
    // as a pixel width here
    if (item.drawBorderSize) {
        // floor of 1px prevents borders from disappearing entirely in IE
        item.getStyleHandle().borderWidth = Math.max(1, item.drawBorderSize * this.zoomLevel) + "px";
    }
    delete item.synchingToPane;
},

// Update items and item properties that are not automatically updated by the viewbox
// transformation, or that must be corrected because of the viewbox transformation.
// Currently:
//  - move/resize canvasItems
//  - move/scale text for VML drawpanes
//  - scale lines for VML drawpanes
// TODO/future:
//  - prevent scaling of hairlines (always 1px) in SVG
//  - prevent scaling of fixed-size labels in SVG
//  - enforce minimum arrowhead sizes
// NOTE: must also account for the viewbox when elements are drawn or updated, so currently in:
//      drawPane.addCanvasItem()
//      drawItem._getElementVML()
//      drawItem.setLineWidth()
//      drawLabel._getElementVML()
//      drawLabel.setFontSize()
// TODO recurse through DrawGroups - this only hits the top level
_updateItemsToViewBox : function () {
    // update canvasItems - see addCanvasItem()
    for (var i=0, ci; i<this.canvasItems.length; i++) {
        this._updateCanvasItemToViewBox(this.canvasItems[i]);
    }
    // scalable text and linewidths for VML
    if (this.drawingType == "vml") {
        for (var i=0, di, screenCoords; i<this.drawItems.length; i++) {
            di = this.drawItems[i];
            if (isc.isA.DrawLabel(di)) {
                // TODO hide these attributes behind DrawLabel setters
                // scale font size
                //  alternate approach - could just change the CSS class, eg:
                //  isc.Element.getStyleDeclaration("drawLabelText").fontSize = 24 * zoomLevel;
                di._vmlTextHandle.fontSize = (di._fontSize * this.zoomLevel) + "px";
                if (!di.synchTextMove) {
                    // using higher-performance external html DIVs - but need to move them ourselves
                    screenCoords = this.drawing2screen([di.left, di.top, 0, 0]); // width/height not used here - labels overflow
                    di._vmlTextHandle.left = screenCoords[0];
                    di._vmlTextHandle.top = screenCoords[1];
                }
            } else {
                // scale linewidths (TODO call this on DrawShapes only, when DrawShape has been factored out)
                di._setLineWidthVML(di.lineWidth * this.zoomLevel);
            }
        }
    }
},

// Global Pan
//  anticipated panning UIs:
//      - draggable viewbox outline in a thumbnail view -- drag&drop or realtime
//      - hand tool -- drag outlines or realtime
//      - arrow keys/buttons - press to pan by steps
//  so panRight and panDown are *deltas in screen (pixel) coordinates*
pan : function (panRight, panDown) {
    this._setViewBox(
        this._viewBoxLeft + panRight/this.zoomLevel,
        this._viewBoxTop + panDown/this.zoomLevel,
        this._viewBoxWidth,
        this._viewBoxHeight
    );
    if (this.drawingType === 'bitmap') {
        this.translate = this.translate || [0, 0];
        this.translate[0] -= panRight;
        this.translate[1] -= panDown;
        this.redrawBitmap();
    }
},

//> @method drawPane.zoom()
// Zoom this drawPane to the specified magnification, maintaining the current viewport position
// @param zoom (float) Desired zoom level as a float where <code>1.0</code> is equivalent to 100%
//  magnification.
// @visibility drawing
//<

zoom : function (zoomLevel) {
    // The viewbox already reflects some zoom level so first convert absolute zoomLevel to
    // relative zoom level.
    var relativeZoom = zoomLevel / this.zoomLevel,
        newViewBoxWidth = this._viewBoxWidth/relativeZoom,
        newViewBoxHeight = this._viewBoxHeight/relativeZoom;
    // then we can save the new zoomLevel
    // NB: MUST set this before _setViewBox(), since side-effected drawing2screen coordinate
    //  conversions (eg to update canvasitems) ref this property for the absolute zoom level
    this.zoomLevel = zoomLevel;
    // then transform the viewbox:
    this._setViewBox(this._viewBoxLeft, this._viewBoxTop, newViewBoxWidth, newViewBoxHeight);

    if (this.drawingType === 'bitmap') {
        this.redrawBitmap();
    }
},

//> @method drawPane.rotate()
// Sets the +link{DrawPane.rotation,rotation} of the DrawPane.
//
// @param degrees (float) the new rotation in degrees.
//<
rotate : function (degrees) {
    var type = this.drawingType;
    this.rotation = degrees;
    if (type === "vml") {
        if (!this._vmlBox) {
            this._vmlBox = isc.Element.get(this.getID() + "_vml_box");
        }
        if (this._vmlBox) {
            this._vmlBox.style.rotation = degrees == null ? "" : degrees;
        }
    } else if (type === "svg") {
        if (this._svgBox != null) {
            if (degrees == null) {
                this._svgBox.removeAttributeNS(null, "transform");
            } else {
                // rotate about the center
                this._svgBox.setAttributeNS(null, "transform", "rotate(" + degrees + " " + (this.getInnerContentWidth() / 2) + " " + (this.getInnerContentHeight() / 2) + ")");
            }
        }
    } else if (this.drawingType === "bitmap") {
        var canvas = document.getElementById(this.getID() + "_bitmap");
        if (canvas != null) {
            var transformValueText = degrees == null ? this._$none : "rotate(" + degrees + "deg)";
            if (isc.Browser.isIE) {
                canvas.style.msTransform = transformValueText;
            } else if (isc.Browser.isChrome || isc.Browser.isWebKit) {
                canvas.style.webkitTransform = transformValueText;
            } else if (isc.Browser.isMoz) {
                canvas.style.MozTransform = transformValueText;
            } else if (isc.Browser.isOpera) {
                canvas.style.oTransform = transformValueText;
            }
            canvas.style.transform = transformValueText;
        }
    }
},

//> @method drawPane.createSimpleGradient()
// Creates a simple linear gradient which can be used within any DrawItem
// Any DrawItems fillGradient can reference this gradient by the given name.
//
// @param id (String) the name of the linear gradient
// @param simple (SimpleGradient: null)
// @return (String) id
// @visibility drawing
//<
createSimpleGradient : function(id, simple) {
    simple.id = id;
    this.gradients[id] = simple;
    return id;
},

//> @method drawPane.createLinearGradient()
// Creates a linear gradient which can be used within any DrawItem
// Any DrawItems fillGradient can reference this gradient by the given name.
//
// @param id (String) the name of the linear gradient
// @param linearGradient (LinearGradient) the linear gradient
// @return (String) id
// @visibility drawing
//<
createLinearGradient : function(id, linearGradient) {
    linearGradient.id = id;
    this.gradients[id] = linearGradient;
    return id;
},

//> @method drawPane.createRadialGradient()
// Creates a radial gradient which can be used within any DrawItem
// Any DrawItems fillGradient can reference this gradient by the given name.
//
// @param id (String) the name of the radial gradient
// @param radialGradient (RadialGradient) the radial gradient
// @return (String) id
// @visibility drawing
//<
createRadialGradient : function(id, radialGradient) {
    radialGradient.id = id;
    this.gradients[id] = radialGradient;
    return id;
},

// shouldDeferDrawing() - check for the case where the drawPane is drawn but not yet ready to
// render out content, and set up a deferred draw operation here
shouldDeferDrawing : function (item) {
    // Assume this is only called when this.isDrawn() is true
    if (this._isBatchDrawing() ||
        (this.drawingType == "svg" && !this._svgDocument))
    {
        if (!this._delayedDrawItems) {
            this._delayedDrawItems = [item];
        } else {
            if (!this._delayedDrawItems.contains(item)) this._delayedDrawItems.add(item);
        }
        return true;
    } else if (this.drawingType == "vml" && !this.getHandle()) {
        if (!this._delayedDrawItems) {
            this._delayedDrawItems = [item];
        } else {
            if (!this._delayedDrawItems.contains(item)) this._delayedDrawItems.add(item);
        }
        if (!this.deferring) {
            var self = this;
            self.deferring = true;
            setTimeout(function() {
                if (self._delayedDrawItems) {
                    self._delayedDrawItems.map("draw");
                    delete self._delayedDrawItems;
                }
                delete self.deferring;
            }, 10);
        }
        return true;
    }
    return false;
},

cancelDeferredDraw : function (item) {
    if (this._delayedDrawItems) {
        return this._delayedDrawItems.remove(item);
    }
    return false;
},

// TODO execute deferred draw operations here
// TODO remove these props from DrawItem - can get them via drawItem.drawPane
svgLoaded : function () {
    this._svgDocument = this.getHandle().firstChild.contentDocument; // svg helper doc in iframe
    this._svgBody = this._svgDocument.getElementById("isc_svg_body"); // outermost svg element
    this._svgBox = this._svgDocument.getElementById("isc_svg_box"); // outermost svg group
    this._svgDefs = this._svgDocument.getElementById("isc_svg_defs"); // defs element (container for arrowhead markers, gradients, and filters)



    if (this._delayedDrawItems) {
        if (!this._isRedrawTEAScheduled()) this._endBatchDrawing(true);
    }
    this._isLoaded = true;
}


}) // end DrawPane.addProperties


isc.DrawPane.addClassProperties({
    defaultDrawingType: isc.Browser.defaultDrawingType,

    // DrawPane class provides default fullscreen DrawPane instances for each drawingType,
    // which are used by DrawItems that are not provided with a DrawPane
    _defaultDrawPanes: [],
    getDefaultDrawPane : function (type) {
        if (!type) type = this.defaultDrawingType;
        if (this._defaultDrawPanes[type]) return this._defaultDrawPanes[type];
        var ddp = this._defaultDrawPanes[type] = this.create({
            drawingType: type,
            // initialize container size to the display rect of the page
            // see (ISSUE: CANVAS element clipping) above
            // this size will be passed through to the CANVAS or SVG element
            width: isc.Page.getScrollWidth(),
            height: isc.Page.getScrollHeight(),
            autoDraw: true
        });
        ddp.sendToBack();
        return ddp;
    },

    _getMeasureCanvas : function () {
        var measureCanvas = this._measureCanvas;
        if (measureCanvas == null) {
            measureCanvas = this._measureCanvas = isc.Canvas.create({
                top: -1000,
                overflow: "visible",
                autoDraw: false,
                height: 1,
                width: 1,
                markForRedraw : isc.Class.NO_OP
            });
            measureCanvas.draw();
        }

        return measureCanvas;
    },

    // color helper functions
    addrgb: function(a, b) {
        var ca = Array(parseInt('0x'+a.substring(1,3),16),parseInt('0x'+a.substring(3,5),16),parseInt('0x'+a.substring(5,7),16));
        var cb = Array(parseInt('0x'+b.substring(1,3),16),parseInt('0x'+b.substring(3,5),16),parseInt('0x'+b.substring(5,7),16));
        var red = ca[0] + cb[0];
        red = Math.round(red > 0xff ? 0xff : red).toString(16);
        red = red.length === 1 ? "0" + red : red;
        var green = ca[1] + cb[1];
        green = Math.round(green > 0xff ? 0xff : green).toString(16);
        green = green.length === 1 ? "0" + green: green;
        var blue = ca[2] + cb[2];
        blue = Math.round(blue > 0xff ? 0xff : blue).toString(16);
        blue = blue.length === 1 ? "0" + blue: blue;
        return '#' + red + green + blue;
    },
    subtractrgb: function(a, b) {
        var ca = Array(parseInt('0x'+a.substring(1,3),16),parseInt('0x'+a.substring(3,5),16),parseInt('0x'+a.substring(5,7),16));
        var cb = Array(parseInt('0x'+b.substring(1,3),16),parseInt('0x'+b.substring(3,5),16),parseInt('0x'+b.substring(5,7),16));
        var red = ca[0] - cb[0];
        red = Math.round(red < 0x0 ? 0x0 : red).toString(16);
        red = red.length === 1 ? "0" + red : red;
        var green = ca[1] - cb[1];
        green = Math.round(green < 0x0 ? 0x0 : green).toString(16);
        green = green.length === 1 ? "0" + green: green;
        var blue = ca[2] - cb[2];
        blue = Math.round(blue < 0x0 ? 0x0 : blue).toString(16);
        blue = blue.length === 1 ? "0" + blue: blue;
        return '#' + red + green + blue;
    },
    mixrgb: function(a, b){
        return b.charAt(0) === '+' ? isc.DrawPane.addrgb(a,b.substring(1)) : b.charAt(0) === '-' ? isc.DrawPane.subtractrgb(a,b.substring(1)) : b;
    },
    // _mutergb() "mutes" colors by shifting them a given percentage toward white (or for
    // negative percentages, toward black).
    _mutergb : function (colorMutePercent, color) {
        // assert -100.0 <= colorMutePercent && colorMutePercent <= 100.0

        // Convert from RGB to HSL, adjust the lightness according to colorMutePercent, then convert back to RGB.
        // See:  http://en.wikipedia.org/wiki/HSL_and_HSV

        var cr = parseInt('0x' + color.substring(1, 3), 16) / 255,
            cg = parseInt('0x' + color.substring(3, 5), 16) / 255,
            cb = parseInt('0x' + color.substring(5, 7), 16) / 255,
            min = Math.min(cr, cg, cb),
            max = Math.max(cr, cg, cb),
            h, s, l = (min + max) / 2;

        if (min == max) {
            h = s = 0;
        } else {
            var c = max - min;
            s = c / (2 * (l < 0.5 ? l : 1 - l));
            if (max == cr) {
                h = (cg - cb) / c;
                if (cg < cb) {
                    h += 6;
                }
            } else if (max == cg) {
                h = (cb - cr) / c + 2;
            } else {
                h = (cr - cg) / c + 4;
            }
            h /= 6;
        }

        // assert (0 <= h && h <= 1) && (0 <= s && s <= 1) && (0 <= l && l <= 1)

        if (colorMutePercent <= 0) {
            l *= (100 + colorMutePercent) / 100;
        } else {
            l += (colorMutePercent / 100) * (1 - l);
        }

        // assert (0 <= l && l <= 1)

        var red, green, blue;
        if (s == 0) {
            red = green = blue = Math.round(255 * l).toString(16);
        } else {
            var high = l + s * (l < 0.5 ? l : 1.0 - l),
                low = 2 * l - high,
                h0 = (3 * h - Math.floor(3 * h)) / 3,
                mid = high - 6 * (high - low) * Math.abs(h0 - 1/6),
                r, g, b;
            switch (Math.floor(h * 6)) {
            case 0:
            case 6:  r = high; g = mid;  b = low;  break;
            case 1:  r = mid;  g = high; b = low;  break;
            case 2:  r = low;  g = high; b = mid;  break;
            case 3:  r = low;  g = mid;  b = high; break;
            case 4:  r = mid;  g = low;  b = high; break;
            case 5:  r = high; g = low;  b = mid;  break;
            }

            red = Math.round(255.0 * r).toString(16);
            green = Math.round(255.0 * g).toString(16);
            blue = Math.round(255.0 * b).toString(16);
        }

        red = red.length === 1 ? "0" + red : red;
        green = green.length === 1 ? "0" + green : green;
        blue = blue.length === 1 ? "0" + blue : blue;

        return '#' + red + green + blue;
    },
    hex2rgb: function(hex,opacity) {
        var hexValue = hex.split('#')[1];
        var hexValueLength = hexValue.length/3;
        var redHex = hexValue.substring(0,hexValueLength);
        var greenHex = hexValue.substring(hexValueLength,hexValueLength*2);
        var blueHex = hexValue.substring(hexValueLength*2,hexValueLength*3);
        var red = parseInt(redHex.toUpperCase(),16);
        var green = parseInt(greenHex.toUpperCase(),16);
        var blue = parseInt(blueHex.toUpperCase(),16);
        var rgb = (typeof(opacity) !== 'undefined') ? 'rgba('+red+','+green+','+blue+','+opacity+')': 'rgb('+red+','+green+','+blue+')';
        return rgb;
    },
    rgb2hex: function(value){
        var hex = "", v, i;
        var regexp = /([0-9]+)[, ]+([0-9]+)[, ]+([0-9]+)/;
        var h = regexp.exec(value);
        for (i = 1; i < 4; i++) {
          v = parseInt(h[i],10).toString(16);
          if (v.length == 1) {
            hex += "0" + v;
          } else {
            hex += v;
          }
        }
        return ("#" + hex);
    }
})



//------------------------------------------------------------------------------------------
//> @class DrawItem
//
// Base class for graphical elements drawn in a DrawPane.  All properties and methods
// documented here are available on all DrawItems unless otherwise specified.
// <P>
// Note that DrawItems as such should never be created, only concrete subclasses such as
// +link{DrawGroup} and +link{DrawLine}.
// <P>
// See +link{DrawPane} for the different approaches to create DrawItems.
//
// @treeLocation Client Reference/Drawing
// @visibility drawing
//<
//------------------------------------------------------------------------------------------

// DrawItem implements the line (aka stroke) and fill attributes that are shared
// by all drawing primitives.



isc.defineClass("DrawItem").addProperties({

    //> @attr drawItem.cursor (Cursor : null : IRWA)
    // If set, specifies the cursor to display when the mouse pointer is over this DrawItem.
    // @visibility drawing
    //<
    //cursor: null,

    //> @attr drawItem.canHover (boolean : null : IRW)
    // Will this DrawItem fire hover events when the user hovers over it?
    // @group hovers
    // @visibility drawing
    // @see showHover
    //<
    //canHover: null,

    //> @attr drawItem.showHover (boolean : true : IRW)
    // If +link{canHover,canHover} is true, should we show the global hover canvas by default
    // when the user hovers over this DrawItem?
    // @group hovers
    // @visibility drawing
    // @see getHoverHTML()
    //<
    showHover: true,

    //> @attr drawItem.prompt (HTMLString : null : IRW)
    // Default +link{getHoverHTML(),hover HTML} that is displayed in the global hover canvas if
    // the user hovers over this DrawItem and +link{showHover,showHover} is true.
    // @group hovers
    // @visibility drawing
    //<
    //prompt: null,

    // Pane / Group membership
    // ---------------------------------------------------------------------------------------

    //> @attr drawItem.drawPane   (DrawPane : null : IR)
    // +link{DrawPane} this drawItem should draw in.
    // <P>
    // If this item has a +link{drawGroup}, the drawGroup's drawPane is automatically used.
    // @visibility drawing
    //<

    //> @attr drawItem.drawGroup  (DrawGroup : null : IR)
    // +link{DrawGroup} this drawItem is a member of.
    // @visibility drawing
    //<

    // Line Styling
    // ---------------------------------------------------------------------------------------

    //> @attr drawItem.lineWidth  (int : 3 : IRW)
    // Pixel width for lines.
    // @group line
    // @visibility drawing
    //<
    // XXX setLineWidth(0) will not cause a VML line to disappear, but will cause an SVG line
    // to disappear
    lineWidth: 3,

    //> @attr drawItem.lineColor (CSSColor : "#808080" : IRW)
    // Line color
    // @group line
    // @visibility drawing
    //<
    lineColor: "#808080",

    //> @attr drawItem.lineOpacity (float : 1.0 : IRW)
    // Opacity for lines, as a number between 0 (transparent) and 1 (opaque).
    // @group line
    // @visibility drawing
    //<
    lineOpacity: 1.0,

    //> @attr drawItem.linePattern (LinePattern : "solid" : IRW)
    // Pattern for lines, eg "solid" or "dash"
    // @group line
    // @visibility drawing
    //<
    linePattern: "solid",

    //> @type LinePattern
    // Supported styles of drawing lines.
    // @value "solid"     Solid line
    // @value "dot"       Dotted line
    // @value "dash"      Dashed line
    // @value "shortdot"  Dotted line, with more tightly spaced dots
    // @value "shortdash" Dashed line, with shorter, more tightly spaced dashes
    // @value "longdash"  Dashed line, with longer, more widely spaced dashes
    // @group line
    // @visibility drawing
    //<
    // see setLinePattern() for notes on expanding this set

    //> @attr drawItem.lineCap     (LineCap : "round" : IRW)
    // Style of drawing the endpoints of a line.
    // <P>
    // Note that for dashed and dotted lines, the lineCap style affects each dash or dot.
    //
    // @group line
    // @visibility drawing
    //<
    lineCap: "round",

    //> @type LineCap
    // Supported styles of drawing the endpoints of a line
    //
    // @value "round"    Semicircular rounding
    // @value "square"   Squared-off endpoint
    // @value "butt"     Square endpoint, stops exactly at the line's end coordinates instead
    //                   of extending 1/2 lineWidth further as "round" and "square" do
    //
    // @group line
    // @visibility drawing
    //<

    // Fill Styling
    // ---------------------------------------------------------------------------------------

    //> @attr drawItem.fillColor     (CSSColor : null : IRW)
    // Fill color to use for shapes.  The default of 'null' is transparent.
    // @group fill
    // @visibility drawing
    //<
    //fillColor: null, // transparent

    //> @attr drawItem.fillGradient     (Gradient | string: null : IRW)
    // Fill gradient to use for shapes.  If a string it uses the gradient identifier parameter provided in
    // +link{drawPane.createSimpleGradient,drawPane.createSimpleGradient},
    // +link{drawPane.createRadialGradient,drawPane.createRadialGradient} or
    // +link{drawPane.createLinearGradient,drawPane.createLinearGradient}. Otherwise
    // it expects one of +link{SimpleGradient,SimpleGradient}, +link{LinearGradient,LinearGradient} or
    // +link{RadialGradient,RadialGradient}.
    // @see Gradient
    // @group fill
    // @visibility drawing
    //<
    fillGradient: null,

    //> @attr drawItem.fillOpacity   (float : 1.0 : IRW)
    // Opacity of the fillColor, as a number between 0 (transparent) and 1 (opaque).
    // @group fill
    // @visibility drawing
    //<
    fillOpacity: 1.0,

    //> @attr drawItem.shadow  (Shadow: null : IRW)
    // Shadow used for all DrawItem subtypes.
    // @visibility drawing
    //<
    shadow: null,

    //> @attr drawItem.rotation    (float : 0.0 : IR)
    // Rotation in degrees.
    // @visibility drawing
    //<
    rotation: 0,

    //>    @attr drawItem.scale (Array : null : IR)
    // Array holds 2 values representing scaling along x and y dimensions.
    // @visibility drawing
    //<
    scale: null,


    //> @attr drawItem.svgFilter (String : null : IRA)
    // ID of an SVG <code>&lt;filter&gt;</code> definition to use.
    //<
    svgFilter: null,

    // Arrowheads
    // ---------------------------------------------------------------------------------------

    //> @attr drawItem.startArrow    (ArrowStyle : null : IRW)
    // Style of arrowhead to draw at the beginning of the line or path.
    //
    // @visibility drawing
    //<

    //> @attr drawItem.endArrow (ArrowStyle : null : IRW)
    // Style of arrowhead to draw at the end of the line or path.
    //
    // @visibility drawing
    //<

    //> @type ArrowStyle
    // Supported styles for arrowheads
    // @value "block"     Solid triangle
    // @value "open" arrow rendered as an open triangle. Only applies to
    //  +link{DrawLinePath,DrawLinePaths} - for other items this will be treated as
    //  <code>"block"</code>
    // @value null  Don't render an arrowhead at all
    // @visibility drawing
    //<

    // Future styles, lifted from VML spec:
    // @value "classic"   Classic triangular "barbed arrow" shape
    // @value "open"      Open triangle
    // @value "oval"      Oval line endpoint (not an arrow)
    // @value "diamond"   Diamond line endpoint (not an arrow)
    // Note that VML also defines "chevron" and "doublechevron" but these do nothing in IE
    // Note: We currently do support "open" style arrow heads via segmented lines in drawLinePaths
    // only

    // Control Knobs
    // -----------------------------------------------------------------------------------------

    //> @attr drawItem.knobs (Array of KnobType : null : IRW)
    // Array of control knobs to display for this item. Each +link{knobType} specified in this
    // will turn on UI element(s) allowing the user to manipulate this drawItem.  To update the
    // set of knobs at runtime use +link{drawItem.showKnobs()} and +link{drawItem.hideKnobs()}.
    // <p>
    // <b>NOTE:</b> Unless otherwise documented, DrawItem types only support
    // <var class="smartclient">"resize" and "move"</var>
    // <var class="smartgwt">{@link com.smartgwt.client.types.KnobType#RESIZE} and {@link com.smartgwt.client.types.KnobType#MOVE}</var>
    // knobs.
    //
    // @visibility drawing
    //<

    //> @type KnobType
    // Entries for the +link{drawItem.knobs} array. Each specified knobType will enable some UI
    // allowing the user to manipulate the DrawItem directly.
    // <p>
    // <b>NOTE:</b> Not all knob types are supported by each DrawItem type. Refer to the DrawItem
    // type's +link{DrawItem.knobs,knobs} attribute documentation for a list of the supported knob types.
    //
    // @value "resize"
    //  Display up to 4 control knobs at the corners specified by +link{DrawItem.resizeKnobPoints},
    //  allowing the user to drag-resize the item.
    //
    // @value "move"
    //  Display a control knob for moving the item around. See also +link{drawItem.moveKnobPoint}
    //  and +link{drawItem.moveKnobOffset}
    //
    // @value "startPoint"
    //  Control knob  to manipulate +link{drawLine.startPoint}.
    //
    // @value "endPoint"
    //  Control knob to manipulate +link{drawLine.endPoint}.
    //
    // @value "controlPoint1"
    //  Display a draggable control knob along with a DrawLine indicating the angle between controlPoint1
    //  and the startPoint. Dragging the knob will adjust controlPoint1.
    //
    // @value "controlPoint2"
    //  Display a draggable control knob along with a DrawLine indicating the angle between controlPoint2
    //  and the endPoint. Dragging the knob will adjust controlPoint2.
    // @visibility drawing
    //<

    //> @attr drawItem.keepInParentRect (Boolean or Array of Float : null : IRWA)
    // Constrains drag-resizing and drag-repositioning of this draw item to either the current
    // visible area of the +link{drawPane,draw pane} or an arbitrary bounding box (if set to
    // an array of the form <code>[left, top, left + width, top + height]</code>).  When using
    // a bounding box-type argument the left/top values can be negative, or the width/height
    // values can be greater than the dimensions of the viewable area, to allow positioning
    // or resizing the draw item beyond the confines of the draw pane.
    // <P>
    // Note:  keepInParentRect affects only user drag interactions, not programmatic moves or
    // resizes.
    //
    // @visibility drawing
    //<

    //drawingType: null, // vml, bitmap, svg - only respected for implicit DrawPane


    autoOffset:true,
    canDrag: false,

//> @method drawItem.getBoundingBox()
// Finds the bounding min, max points for this shape. Implemented by subtypes.
// @return (array) the x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    return [];
},

// isInBounds / isPointInPath used for event handling.



//> @method drawItem.isInBounds(x,y)
// returns true if point is in getBoundingBox()
// @param x (int)
// @param y (int)
// @return (Boolean)
// @visibility drawing
//<
isInBounds : function (x, y) {
    var b = this.getBoundingBox();

    return (
        ((b[0] <= x && x <= b[2]) || (b[2] <= x && x <= b[0])) &&
        ((b[1] <= y && y <= b[3]) || (b[3] <= y && y <= b[1])));
},

// When receiving events should we call isPointInPath()
checkPointInPath:true,

//> @method drawItem.isPointInPath(x,y)
// returns true if point is in path
// @param x (int)
// @param y (int)
// @return (Boolean)
// @visibility drawing
//<
isPointInPath : function (x,y) {
    if(!this.isInBounds(x,y)) {
        return false;
    }
    if (this.drawPane.drawingType == 'bitmap') {
        var context = this.drawPane.getBitmapContext();
        context.save();
        var lineColor = this.lineColor, lineOpacity = this.lineOpacity;
        this.lineColor = "#000000";
        this.lineOpacity = 0.0;
        this.drawStroke(context);
        context.restore();
        this.lineColor = lineColor;
        this.lineOpacity = lineOpacity;
        var pip = context.isPointInPath(parseFloat(x),parseFloat(y));
        return pip;
    } else if (this.drawPane.drawingType == "vml") {
        var handle = this._vmlHandle;
        if (handle) {
            var drawPane = this.drawPane,
                absCoords = drawPane.normalize(x, y, true),
                leftEdgeSize = drawPane.getCanvasLeft() - drawPane.getLeft(),
                pageX = drawPane.getPageLeft() + leftEdgeSize + drawPane.getLeftBorderSize() + drawPane.getLeftPadding() + absCoords.x,
                topEdgeSize = drawPane.getCanvasTop() - drawPane.getTop(),
                pageY = drawPane.getPageTop() + topEdgeSize + drawPane.getTopBorderSize() + drawPane.getTopPadding() + absCoords.y;
            return document.elementFromPoint(pageX, pageY) == handle;
        }
    }
    return true;
},

//> @method drawItem.computeAngle(px1,py1,px2,py2)
// returns the angle in degrees between any two points
// @param px1 (int)
// @param py1 (int)
// @param px2 (int)
// @param py2 (int)
// @return (float)
// @visibility drawing
//<
computeAngle : function (px1, py1, px2, py2) {
    var pxRes = px2 - px1;
    var pyRes = py2 - py1;
    var angle = 0;
    if (pxRes == 0) {
        if (pyRes == 0) {
         angle = 0.0;
        } else if (pyRes > 0) {
            angle = Math.PI / 2.0;
        } else {
            angle = Math.PI * 3.0 / 2.0;
        }
    } else if (pyRes == 0) {
        if (pxRes > 0) {
            angle = 0.0;
        } else {
            angle = Math.PI;
        }
    } else {
        if (pxRes < 0) {
            angle = Math.atan(pyRes / pxRes) + Math.PI;
        } else if (pyRes < 0) {
            angle = Math.atan(pyRes / pxRes) + (2 * Math.PI);
        } else {
            angle = Math.atan(pyRes / pxRes);
        }
    }
    angle = angle * 180 / Math.PI;
    return angle;
},

// DrawItem events
getHoverTarget : function (event, eventInfo) {
    return (this.drawPane ? this.drawPane.getHoverTarget(event, eventInfo) : null);
},

// Called by EventHandler and required to allow DrawItem event functionality
// since DrawItem does not extend Canvas
_allowNativeTextSelection : function (event) {
    return false;
},
_updateCursor : function () {
    if (this.drawPane) this.drawPane._updateCursor(this);
},
// Called by EventHandler and required to allow DrawItem event functionality
// since DrawItem does not extend Canvas
focus : function (reason) {
},
// Called by EventHandler and required to allow DrawItem event functionality
// since DrawItem does not extend Canvas
visibleAtPoint : function (x,y) {
    return true;
},

//> @attr drawPane.canDrag (Boolean : false : IRW)
// In order to enable dragging of drawItems, this property must be set to true,
// in addition to +link{drawItem.canDrag}.
// @visibility drawing
//<

// Called by EventHandler and required to allow DrawItem event functionality
// since DrawItem does not extend Canvas

getDragAppearance : function (dragOperation) {
    return "none";
},
// Called by EventHandler and required to allow DrawItem event functionality
// since DrawItem does not extend Canvas
bringToFront: function () {
},
// Called by EventHandler and required to allow DrawItem event functionality
// since DrawItem does not extend Canvas
moveToEvent: function (x,y) {
    this.moveTo(x,y);
},

//> @attr drawItem.dragStartDistance        (number : 5 : IRWA)
// @include canvas.dragStartDistance
//<
dragStartDistance: 1,
//> @method drawItem.getRect()
// @include canvas.getRect()
//<
getRect : function () {
    var bbox = this.getBoundingBox();
    return [bbox[0],bbox[1],bbox[2]-bbox[0],bbox[3]-bbox[1]];
},
//> @method drawItem.getPageLeft()    ([A])
// @include canvas.getPageLeft()
//<
getPageLeft : function () {
    return this.getBoundingBox()[0];
},
//> @method drawItem.getPageTop()    ([A])
// @include canvas.getPageTop()
//<
getPageTop : function () {
    return this.getBoundingBox()[1];
},

//> @attr drawItem.canDrag (Boolean : false : IRWA)
// Is this drawItem draggable? Note that dragging must be enabled for the dragPane
// in which this item is rendered via +link{drawPane.canDrag} for this to have an effect.
// @visibility drawing
//<

//> @method drawItem.dragStart() (A)
// @include canvas.dragStart()
//<
dragStart : function (event, info) {
    if (this.logIsInfoEnabled("drawEvents")) {
        this.logInfo("DragStart on item:" + this.getID(), "drawEvents");
    }
    var bounds = this.getBoundingBox(),
        offsetX = bounds[0],
        offsetY = bounds[1],
        normalized = this.drawPane.normalize(event.x, event.y),
        edgeSize = (this.drawPane.showEdges && this.drawPane.edgeSize) || 0;
    this.lastDragX = normalized.x - this.drawPane.getPageLeft() - edgeSize;
    this.lastDragY = normalized.y - this.drawPane.getPageTop() - edgeSize;

    this.dragOffsetX = this.lastDragX - offsetX;
    this.dragOffsetY = this.lastDragY - offsetY;
    // For SGWT we want a separate event which can be easily customzied without the
    // need for a call to super.
    if (this.onDragStart(this.lastDragX, this.lastDragY) == false) {
        return false;
    }
    return true;
},

//> @method drawItem.onDragStart()
// If +link{drawItem.canDrag} is true and +link{drawPane.canDrag} is true, this notification
// method will be fired when the user starts to drag the drawItem
// @param x (int) x-coordinate within the drawPane
// @param y (int) y-coordinate within the drawPane
// @return (boolean) return false to cancel the default behavior of allowing the shape to be drag-moved
// @visibility sgwt
//<
onDragStart : function (x, y) {
},

//> @method drawItem.dragMove() (A)
// @include canvas.dragMove()
//<
dragMove : function (event, info, bubbledFromDrawItem) {
    var normalized = this.drawPane.normalize(event.x, event.y),
        edgeSize = (this.drawPane.showEdges && this.drawPane.edgeSize) || 0,
        x = normalized.x - this.drawPane.getPageLeft() - edgeSize,// - this.dragOffsetX,
        y = normalized.y - this.drawPane.getPageTop() - edgeSize;// - this.dragOffsetY;

    if (this.keepInParentRect) {
        var box = this._getParentRect(),
            boundingBox = this.getBoundingBox(),
            width = boundingBox[2] - boundingBox[0],
            height = boundingBox[3] - boundingBox[1];

        x = Math.max(box[0] + this.dragOffsetX, Math.min(box[2] - (width - this.dragOffsetX), x));
        y = Math.max(box[1] + this.dragOffsetY, Math.min(box[3] - (height - this.dragOffsetY), y));
    }

    if (this.onDragMove(x,y) == false) return false;


    // Do not move DrawGroups that were not the original target of the drag event.
    if (!isc.isA.DrawGroup(this) || bubbledFromDrawItem == null) {
        this.moveBy(x - this.lastDragX, y - this.lastDragY);
        // Remember the last drag mouse position so we can continue to 'moveBy' as the user
        // continues to drag.
        this.lastDragX = x;
        this.lastDragY = y;
    }

    return true;
},

//> @method drawItem.onDragMove()
// If +link{drawItem.canDrag} is true and +link{drawPane.canDrag} is true, this notification
// method will be fired when the user drags the drawItem
// @param x (int) x-coordinate within the drawPane
// @param y (int) y-coordinate within the drawPane
// @return (boolean) return false to cancel the default behavior of allowing the shape to be drag-moved
// @visibility sgwt
//<
onDragMove : function (x, y) {
},

//> @method drawItem.dragStop() (A)
// @include canvas.dragStop()
//<
dragStop : function (event, info) {
    var normalized = this.drawPane.normalize(event.x, event.y),
        edgeSize = (this.drawPane.showEdges && this.drawPane.edgeSize) || 0,
        x = normalized.x - this.drawPane.getPageLeft() - edgeSize - this.dragOffsetX,
        y = normalized.y - this.drawPane.getPageTop() - edgeSize - this.dragOffsetY;
    // notification for SGWT
    this.onDragStop(x,y);
    // no need to move to x,y - this will have happened in the dragMove event(s).

    return true;
},

//> @method drawItem.onDragStop()
// If +link{drawItem.canDrag} is true and +link{drawPane.canDrag} is true, this notification
// method will be fired when the user completes a drag on the drawItem
// @param x (int) x-coordinate within the drawPane
// @param y (int) y-coordinate within the drawPane
// @visibility sgwt
//<
onDragStop : function (x, y) {
},

//> @method drawItem.click() (A)
// @include canvas.click()
//<
click : function() {

    return true;
},
//> @method drawItem.mouseDown() (A)
//@include canvas.mouseDown()
//<
mouseDown : function () {

    return true;
},
//> @method drawItem.mouseUp() (A)
// @include canvas.mouseUp()
//<
mouseUp : function () {

    return true;
},
//> @method drawItem.mouseMove() (A)
// @include canvas.mouseMove()
//<
mouseMove : function () {

    return true;
},
//> @method drawItem.mouseOut() (A)
//@include canvas.mouseOut()
//<
mouseOut : function () {

    return true;
},
//> @method drawItem.mouseOver() (A)
//@include canvas.mouseOver()
//<
mouseOver : function () {

    return true;
},

//> @attr drawItem.contextMenu (Menu : null : IRW)
// @include canvas.contextMenu
//<

//> @method drawItem.showContextMenu() (A)
// @include canvas.showContextMenu()
//<
showContextMenu : function () {


    // Support context menus on DrawItems as we do on Canvii
    var menu = this.contextMenu;
    if (menu) {
        menu.target = this;
        if (!isc.isA.Canvas(menu)) {
            menu.autoDraw = false;
            this.contextMenu = menu = this.getMenuConstructor().create(menu);
        }
        menu.showContextMenu();
    }
    return (menu == null);
},

// Support for DrawItem.menuConstructor

getMenuConstructor : function () {
    var menuClass = isc.ClassFactory.getClass(this.menuConstructor);
    if (!menuClass) {
        isc.logWarn("Class not found for menuConstructor:" + this.menuConstructor +
            ". Defaulting to isc.Menu class");
        menuClass = isc.ClassFactory.getClass("Menu");
    }
    return menuClass;
},

startHover : isc.Canvas.getInstanceProperty("startHover"),

stopHover : isc.Canvas.getInstanceProperty("stopHover"),

_handleHover : function () {
    var EH = isc.EH,
        lastMoveTarget = EH.lastMoveTarget,
        lastEvent = EH.lastEvent;
    if (!lastMoveTarget || lastMoveTarget.getHoverTarget(lastEvent) != this ||
        this.drawPane == null ||
        this.drawPane.getDrawItem(lastEvent.x, lastEvent.y) != this)
    {
        return;
    }
    this.handleHover();
},

_getHoverProperties : function () {
    return this.drawPane._getHoverProperties();
},

handleHover : function () {
    if (this.hover && this.hover() == false) return;
    if (this.showHover) {
        var hoverHTML = this.getHoverHTML();
        if (hoverHTML != null && !isc.isAn.emptyString(hoverHTML)) {
            isc.Hover.show(hoverHTML, this._getHoverProperties(), null, this);
        }
    }
},

//> @method drawItem.hover()
// If +link{canHover,canHover} is true for this DrawItem, the hover() string method will
// be fired when the user hovers over this DrawItem. If this method returns false, it will
// suppress the default behavior of showing a hover canvas if +link{showHover,showHover}
// is true.
// @return (boolean) false to cancel the hover event.
// @group hovers
// @visibility drawing
//<

//> @method drawItem.getHoverHTML()
// If +link{showHover,showHover} is true, when the user holds the mouse over this DrawItem for
// long enough to trigger a hover event, a hover canvas is shown by default. This method returns
// the contents of that hover canvas. Default implementation returns +link{prompt,prompt} -
// override for custom hover HTML. Note that returning <code>null</code> or an empty string will
// suppress the hover canvas altogether.
// @return (HTMLString) the HTML to show in the hover
// @group hovers
// @visibility drawing
//<
getHoverHTML : function () {
    return this.prompt;
},

_hoverHidden : isc.Class.NO_OP,

// end of shape events
init : function () {
    this.Super("init");
    if (this.ID == null || window[this.ID] != this) {
        isc.ClassFactory.addGlobalID(this);
    }
    this.drawItemID = isc.DrawItem._IDCounter++;

    if (this.drawPane) this.drawPane.addDrawItem(this, this.autoDraw);
},

// Drawing
// ---------------------------------------------------------------------------------------

//> @method drawItem.draw()
// Draw this item into its current +link{drawPane}.
//
// @visibility drawing
//<
// TODO exception handling for invalid generated VML/SVG markup
draw : function () {

    // be sure to set _drawn before returning
    if (this._drawn) {
        this.logDebug("DrawItem already drawn - exiting draw(). Note that this DrawItem may have been auto-drawn " +
                      "if setDrawPane() was called on it, or if DrawPane.addDrawItem() was called to add this DrawItem to a DrawPane.",
                      "drawing");
        return;
    }
    if (isc.isA.DrawGroup(this) && this.drawItems != null) {
        for (var i = 0; i < this.drawItems.length; i++) {
            if (this.drawItems[i] == null) {
                this.logInfo("drawGroup included empty entry in drawItems:"
                    + this.echo(this.drawItems));
                continue;
            }
            this.drawItems[i].drawGroup = this;
            this.drawItems[i].drawPane = this.drawPane;
        }
        this.drawItems.removeEmpty();
    }
    if (this.drawGroup) { // drawing into a drawGroup
        this.drawPane = this.drawGroup.drawPane;
    } else { // drawing directly into a drawPane
        if (!this.drawPane) this.drawPane = isc.DrawPane.getDefaultDrawPane(this.drawingType);
    }

    // add to pane.drawItems - this is essentially the set of drawItems that should draw/clear with
    // the pane.
    if (this.drawGroup) {
        if (!this.drawGroup.drawItems.contains(this)) {
            this.drawGroup.drawItems.add(this);
            this._drawKnobs();
        }
    } else {
        if (!this.drawPane.drawItems.contains(this)) {
            this.drawPane.drawItems.add(this);
            this._drawKnobs();
        }
    }

    //this.logWarn("DP:" + this.drawPane + ", dg:" + this.drawGroup);

    var dp = this.drawPane;

    // shouldDeferDrawing: for VML/SVG graphics There's a window of time between draw
    // completeing before the iframe is loaded.  If draw() is called in this window, defer the
    // draw (shouldDeferDrawing handles this if it returns true).
    if (dp.shouldDeferDrawing(this)) {
        return;
    }

    // If the DP is undrawn, we just wait for it to draw us as it draws.  The handle_drawn
    // states indicates we're being drawn as part of DrawPane's drawChildren.
    if (!dp.isDrawn() && dp.getDrawnState() != isc.Canvas.HANDLE_DRAWN) {
        return;
    }

    if (this.drawGroup) { // drawing into a drawGroup
        if (!this.drawGroup._drawn) {
            this.logWarn("Attempted draw into an undrawn group - calling draw() on the group now");
            this.drawGroup.draw();
            if (!this.drawGroup._drawn) {
                return; // drawGroup should have logged an error
            }
        }
    }
    this.drawHandle();

    this._setupEventParent();

    this._drawn = true;
},

_setupEventParent : function () {
    if (this.eventParent != null) return;

    // setup eventParent - this ensures that EH events bubble properly

    this.eventParent = (this.drawGroup || this.drawPane);


    var addToQuadTree = (
            this.item == null &&
            !this.excludeFromQuadTree &&
            (!isc.isA.DrawGroup(this) || this.useGroupRect));
    for (var dg = this.drawGroup; addToQuadTree && dg != null; dg = dg.drawGroup) {

        if (dg.useGroupRect) {
            addToQuadTree = false;
        }
    }
    if (addToQuadTree) {
        var bb = this.getBoundingBox();
        if (bb && bb.length === 4) {
            this.item = {
                x: bb[0],
                y: bb[1],
                width: bb[2] - bb[0],
                height: bb[3] - bb[1],
                shape: this
            };
            if (!(isNaN(this.item.width) || isNaN(this.item.height))) {
                this.drawPane.quadTree.insert(this.item);
            }
        }
    }
},

_clearEventParent : function () {
    delete this.eventParent;
    if (this.item != null) {
        this.drawPane.quadTree.remove(this.item);
        delete this.item;
    }
},

_drawKnobs : function () {
    // show any specified controlKnobs
    if (this.knobs) {
        for (var i = 0; i < this.knobs.length; i++) this._showKnobs(this.knobs[i]);
    }
},

drawHandle : function () {
    var dp = this.drawPane,
        type = this.drawingType = dp.drawingType; // drawingType of drawPane wins

    // map string drawingType to faster booleans
    if (type == "vml") {
        this.drawingVML = true;
    } else if (type == "svg") {
        this.drawingSVG = true;
    } else if (type == "bitmap") {
        this.drawingBitmap = true;
    }

    // vml - call _getElementVML() and insert directly into drawPane div
    if (this.drawingVML) {
        if (isc.isA.DrawLabel(this) && !this.synchTextMove) {
            // high-performance external html text is written directly into the DrawPane as DIVs
            this._vmlContainer = dp.getHandle(); // TODO/TEST - what if we just used the VML box/group?
        } else if (this.drawGroup && this.drawGroup.renderGroupElement) {
            this._vmlContainer = this.drawGroup._vmlHandle;
        } else {
            this._vmlContainer = isc.Element.get(dp.getID()+"_vml_box"); // TODO initialize in DrawPane
//also TODO - unrelated here - move dp.redrawBitmap calls into a single dp.refresh(), also to serve as a hook
        }

        var id = "isc_DrawItem_" + this.drawItemID;
        isc.Element.insertAdjacentHTML(
            this._vmlContainer,
            this.drawToBack ? "afterBegin" : "beforeEnd", // simple layering approach; VML also supports explicit z-index
            this._getElementVML(id)
        );
        this._vmlHandle = isc.Element.get(id);
        if (!isc.isA.DrawGroup(this) && !isc.isA.DrawImage(this) && !isc.isA.DrawLabel(this)) { // groups, images, labels do not have stroke and fill - TODO DrawShape refectoring
            this._vmlStrokeHandle = this._vmlHandle.firstChild; // see drawItem._getElementVML()
            this._vmlFillHandle = this._vmlStrokeHandle.nextSibling; // see drawItem._getElementVML()
        }
        if (isc.isA.DrawLabel(this)) { // labels do have a style handle that we use to set fontsize
            if (this.synchTextMove) {
                this._vmlTextHandle = this._vmlHandle.firstChild.style; // VML TEXTBOX
            } else {
                this._vmlTextHandle = this._vmlHandle.style; // external DIV
            }
        }

    // svg - call _getElementSVG() and insert into svg element in drawPane
    } else if (this.drawingSVG) {
        dp._batchDraw(this);

    // bitmap - redraw the drawPane (NB: redraw is deferred, so item will be added to drawItems first)
    } else if (this.drawingBitmap) {
        dp.redrawBitmap(); // drawPane will call back to this.drawBitmap()

    } else {
        this.logWarn("DrawItem: '" + type + "' is not a supported drawingType");
        return;
    }
},

isDrawn : function () { return !!this._drawn },

// Knobs
// ---------------------------------------------------------------------------------------

// resized / moved notifications
// This is an opportunity to update our control knobs
//> @method drawItem.moved()
// Notification method fired when this component is explicitly moved.
// Note that a component's position on the screen may also changed due to an ancestor being
// moved. The +link{parentMoved()} method provides a notification entry point to catch
// that case as well.
//
// @param deltaX (int) horizontal difference between current and previous position
// @param deltaY (int) vertical difference between current and previous position
// @visibility drawing
//<
moved : function (deltaX, deltaY) {

},

_moved : function (deltaX, deltaY) {
    this.moved(deltaX, deltaY);
    this.updateControlKnobs();
},

//> @method   drawItem.resized()
//Observable method called whenever a DrawItem changes size.
//@visibility drawing
//<
resized : function () {
},

_resized : function () {
    this.resized();
    this.updateControlKnobs();
},

rotated: function () {
    this.updateControlKnobs();
},

scaled: function () {
    this.updateControlKnobs();
},

// _showKnobs / _hideKnobs actually create and render the DrawKnobs for each specified knobType
// Implementation assumes the existance of a show<KnobType>Knobs() method for each specified
// knobType.

_showKnobs : function (knobType) {
    var functionName = isc.DrawItem._getShowKnobsFunctionName(knobType)
    if (!this[functionName]) {
        this.logWarn("DrawItem specfied with knobType:"+ knobType +
                    " but no " +  functionName + " function exists to show the knobs. Ignoring");
        return false;
    } else {
        this[functionName]();
    }
},

_hideKnobs : function (knobType) {
    var functionName = isc.DrawItem._getShowKnobsFunctionName(knobType, true)
    if (!this[functionName]) {
        this.logWarn("DrawItem specfied with knobType:"+ knobType +
                    " but no " +  functionName + " function exists to hide the knobs.");
        return false;
    } else {
        this[functionName]();
    }
},

//> @method drawItem.showKnobs()
// Shows a set of control knobs for this drawItem. Updates +link{drawItem.knobs} to include the
// specified knobType, and if necessary draws out the appropriate control knobs.
// @param knobType (KnobType or Array of KnobType) knobs to show
// @visibility drawing
//<
showKnobs : function (knobType) {
    // allow the developer to show multiple knobs with a single function call
    if (isc.isAn.Array(knobType)) {
        for (var i = 0; i < knobType.length; i++) {
            this.showKnobs(knobType[i]);
        }
        return;
    }
    if (!this.knobs) this.knobs = [];
    if (this.knobs.contains(knobType)) return;
    // Skip adding `knobType' to the knobs array if _showKnobs() did not show the knob(s) for
    // the knob type.
    if (this._showKnobs(knobType) !== false) {
        this.knobs.add(knobType);
    }
},

//> @method drawItem.hideKnobs()
// Hides a set of control knobs for this drawItem. Updates +link{drawItem.knobs} to remove the
// specified knobType, and clears any drawn knobs for this knobType.
// @param knobType (KnobType | Array of knobType) knobs to hide
// @visibility drawing
//<
hideKnobs : function (knobType) {
    if (!this.knobs) return;
    if (isc.isAn.Array(knobType)) {
        for (var i = 0; i < knobType.length; i++) {
            this.hideKnobs(knobType[i]);
        }
        return;
    }
    if (this.knobs.contains(knobType)) this.knobs.remove(knobType);
    this._hideKnobs(knobType);
},

// -----------------------------------------
// move control knob shared by all drawItems


//> @attr drawItem.moveKnobPoint (string : "TL" : IRW)
// If this item is showing a <code>"move"</code> +link{drawItem.knobs,control knob}, this attribute
// specifies where the knob should appear with respect to the drawItem. Valid options are:
// <pre>
//  <code>"TL"</code> Top Left corner
//  <code>"TR"</code> Top Right corner
//  <code>"BL"</code> Bottom Left corner
//  <code>"BR"</code> Bottom Right corner
// </pre>
// @visibility drawing
//<

moveKnobPoint:"TL",

//> @attr drawItem.moveKnobOffset (array : null : IRW)
// If this item is showing a <code>"move"</code> +link{drawItem.knobs,control knob}, this attribute
// allows you to specify an offset in pixels from the +link{drawItem.moveKnobPoint} for the
// move knob. Offset should be specified as a 2-element array of [left offset, top offset].
// @visibility drawing
//<
//moveKnobOffset:null,

moveKnobDefaults: {
    _constructor: "DrawKnob",
    cursor: "move",
    knobShapeProperties: {
        fillColor: "#00ff00"
    }
},

// Helper: given a control knob position ("T", "BR", etc) return the x/y coordinates for the knob
_getKnobPosition : function (position) {
    var x,y;
    x = position.contains("L") ? this.left :
            (position.contains("R") ? (this.left + this.width) :
                (this.left + Math.round(this.width/2)));
    y = position.contains("T") ? this.top :
            (position.contains("B") ? (this.top + this.height) :
                (this.top + Math.round(this.height/2)));
    return [x,y];
},

showMoveKnobs : function () {
    if (this._moveKnob != null && !this._moveKnob.destroyed) return;

    // support customization of moveKnob via autoChild mechanism so the user can specify
    // moveKnobDefaults etc. Not currently exposed
    var position = this._getKnobPosition(this.moveKnobPoint);
    if (position == null) return;

    var x = position[0], y = position[1];
    if (window.isNaN(x) || window.isNaN(y)) return;

    if (this.moveKnobOffset) {
        x += this.moveKnobOffset[0];
        y += this.moveKnobOffset[1];
    }
    this._moveKnob = this.createAutoChild("moveKnob", {
        x: x, y: y,
        drawPane: this.drawPane,
        _targetShape: this,

        updatePoints : function (x, y, dx, dy, state) {
            var drawItem = this._targetShape,
                startState = (state == "start"),
                moveState = (state == "move"),
                stopState = (state == "stop");

            if (startState) {
                var box = drawItem.getBoundingBox(),
                    x0 = x - dx,
                    y0 = y - dy;
                drawItem._dragMoveLeftOffset = x0 - box[0];
                drawItem._dragMoveRightOffset = box[2] - x0;
                drawItem._dragMoveTopOffset = y0 - box[1];
                drawItem._dragMoveBottomOffset = box[3] - y0;
            }

            if (drawItem.keepInParentRect) {
                var box = drawItem._getParentRect(),
                    x0 = x - dx,
                    y0 = y - dy;

                x = Math.max(
                    box[0] + drawItem._dragMoveLeftOffset,
                    Math.min(box[2] - drawItem._dragMoveRightOffset, x));
                y = Math.max(
                    box[1] + drawItem._dragMoveTopOffset,
                    Math.min(box[3] - drawItem._dragMoveBottomOffset, y));
                dx = x - x0;
                dy = y - y0;
            }

            if (stopState) {
                delete drawItem._dragMoveLeftOffset;
                delete drawItem._dragMoveRightOffset;
                delete drawItem._dragMoveTopOffset;
                delete drawItem._dragMoveBottomOffset;
            }

            drawItem.moveBy(dx, dy);
        }
    });
},

hideMoveKnobs : function () {
    if (this._moveKnob) {
        this._moveKnob.destroy();
        delete this._moveKnob;
    }
},


// -----------------------------------------
// resize control knob
// Implemented at the drawItem level - not exposed / supported for all drawItems

//> @attr drawItem.resizeKnobPoints (array : ["TL","TR","BL","BR"] : IRW)
// If this item is showing <code>"resize"</code> +link{drawItem.knobs,control knobs}, this attribute
// specifies which sides / edges should show knobs. May include any of the following values:
// <pre>
//  <code>"TL"</code> Top Left corner
//  <code>"TR"</code> Top Right corner
//  <code>"BL"</code> Bottom Left corner
//  <code>"BR"</code> Bottom Right corner
// </pre>
// @visibility drawing
//<

resizeKnobPoints:["TL","TR","BL","BR"],


getResizeKnobProperties : function (side) {
},

showResizeKnobs : function () {
    var resizeKnobs = this._resizeKnobs;
    if (resizeKnobs != null && !resizeKnobs.isEmpty()) return;

    resizeKnobs = this._resizeKnobs = [];

    var positions = this.resizeKnobPoints;
    for (var i = 0; i < positions.length; i++) {
        var position = positions[i],
            coord = this._getKnobPosition(position);
        if (coord == null) continue;

        var x = coord[0], y = coord[1];
        if (window.isNaN(x) || window.isNaN(y)) continue;

        // support per-side customization via a method
        var props = isc.addProperties({}, this.getResizeKnobProperties(position), {
            _constructor: "DrawKnob",
            targetShape: this,
            point: position,
            x: x, y: y,
            drawPane: this.drawPane
        });

        // also use auto-child mechanism to pick up defaults / properties
        var knob = this.createAutoChild("resizeKnob",props);
        // override rather than observing updatePoints.
        // This allows us to cancel the drag if we'd shrink below 1x1 px in size
        knob.addProperties({
            updatePoints : function (left, top, dX, dY, state) {
                return this.targetShape.dragResizeMove(this.point, left, top, dX, dY, state);
            }
        });

        resizeKnobs.add(knob);
    }
},

// Returns a bounding box inside which a DrawItem is forced to remain while keepInParentRect
// is enabled.
_getParentRect : function () {
    var box = this.keepInParentRect,
        fromBox = isc.isAn.Array(box),
        boundLeft = (fromBox && box[0] != null ? box[0] : this.drawPane._viewBoxLeft),
        boundTop = (fromBox && box[1] != null ? box[1] : this.drawPane._viewBoxTop),
        boundRight = (fromBox && box[2] != null ? box[2] :
            (this.drawPane._viewBoxLeft + this.drawPane._viewBoxWidth)),
        boundBottom = (fromBox && box[3] != null ? box[3] :
            (this.drawPane._viewBoxTop + this.drawPane._viewBoxHeight));

    return [boundLeft, boundTop, boundRight, boundBottom];
},

//> @method drawItem.dragResizeMove() (A)
// If +link{drawItem.canDrag} and +link{drawPane.canDrag} are both true and the
// +link{knobs,control knobs} include "resize" knobs, then this notification method will be
// fired when the user drag-resizes the draw item.
// @param position (string) provides which knob of the +link{resizeKnobPoints} was dragged
// @param x (integer) new x-coordinate of the knob
// @param y (integer) new y-coordinate of the knob
// @param dX (integer) horizontal distance moved
// @param dY (integer) vertical distance moved
// @visibility drawing
//<
dragResizeMove : function (position, x, y, dX, dY, state) {
    var startState = (state == "start"),
        moveState = (state == "move"),
        stopState = (state == "stop");
    // assert (startState || moveState || stopState)

    var fixedPoint;
    if (startState) {
        var isLeftKnob = position.contains("L"),
            isRightKnob = position.contains("R"),
            isTopKnob = position.contains("T"),
            isBottomKnob = position.contains("B"),
            oppositePosition = (isTopKnob ? "B" : "T") + (isLeftKnob ? "R" : "L");

        // assert (isRightKnob == !isLeftKnob)
        // assert (isTopKnob == !isBottomKnob)

        fixedPoint = this._dragResizeFixedPoint = this._getKnobPosition(oppositePosition);
    } else {
        fixedPoint = this._dragResizeFixedPoint;
    }

    // Set the new dimensions to match the dimensions of the minimum rectangle
    // spanning the fixedPoint and (x, y).
    var newLeft = Math.min(fixedPoint[0], x),
        newTop = Math.min(fixedPoint[1], y),
        newRight = Math.max(fixedPoint[0], x),
        newBottom = Math.max(fixedPoint[1], y),
        newWidth = (newRight - newLeft),
        newHeight = (newBottom - newTop),
        moved = (newTop != this.top || newLeft != this.left);

    if (stopState) {
        delete this._dragResizeFixedPoint;
    }

    // If keepInParentRect is true or is some bounding box then restrict the new coordinates
    // and dimensions from the resize to within the specified bounds.
    if (this.keepInParentRect) {
        var box = this._getParentRect();
        newLeft = Math.max(newLeft, box[0]);
        newTop = Math.max(newTop, box[1]);
        newRight = Math.min(newRight, box[2]);
        newBottom = Math.min(newBottom, box[3]);
        newWidth = newRight - newLeft;
        newHeight = newBottom - newTop;
    }

    // Disallow shrinking below zero size.
    var zeroSize = (Math.abs(newWidth) < 1 || Math.abs(newHeight) < 1);
    if (!stopState && !zeroSize) {
        this._dragResizeLeft = newLeft;
        this._dragResizeTop = newTop;
        this._dragResizeWidth = newWidth;
        this._dragResizeHeight = newHeight;
    }
    if (stopState && zeroSize) {
        if (this._dragResizeLeft != null) {
            // Revert to the last dragged resize to a nonzero size.
            newLeft = this._dragResizeLeft;
            newTop = this._dragResizeTop;
            newWidth = this._dragResizeWidth;
            newHeight = this._dragResizeHeight;
        } else {
            return false;
        }
    }
    if (stopState) {
        delete this._dragResizeLeft;
        delete this._dragResizeTop;
        delete this._dragResizeWidth;
        delete this._dragResizeHeight;
    }

    if (this.onDragResizeMove(newLeft, newTop, newWidth, newHeight) === false) {
        return false;
    }

    this.resizeTo(newWidth, newHeight);
    if (moved) this.moveTo(newLeft, newTop);
    return true;
},

//>@method drawItem.onDragResizeMove()
// If +link{drawItem.canDrag} and +link{drawPane.canDrag} are both true and the
// +link{knobs,control knobs} include "resize" knobs, then this notification method will be
// fired when the user drags the resize knobs of the draw item.
// @param newX (int) x-coordinate within the draw pane
// @param newY (int) y-coordinate within the draw pane
// @param newWidth (int) draw item width
// @param newHeight (int) draw item height
// @return (boolean) return false to cancel the default behavior of allowing the shape to be
// drag-resized
// @visibility sgwt
//<
onDragResizeMove : function () {},

hideResizeKnobs : function () {
    if (this._resizeKnobs) {
        this._resizeKnobs.map("destroy");
        delete this._resizeKnobs;
    }
},


// updateControlKnobs: Fired in response to moved / resized
updateControlKnobs : function () {

    if (this._moveKnob) {
        var coords = this._getKnobPosition(this.moveKnobPoint);
        if (this.moveKnobOffset) {
            coords[0] += this.moveKnobOffset[0];
            coords[1] += this.moveKnobOffset[1];
        }
        // Gotcha: moveKnob is a Canvas, not an item, so we need to convert to
        // the screen coordinate frame
        var screenCoords = this.drawPane.drawing2screen(coords);
        this._moveKnob.setCenterPoint(screenCoords[0], screenCoords[1]);
    }
    if (this._resizeKnobs) {
        for (var i = 0; i < this._resizeKnobs.length; i++) {
            var knob = this._resizeKnobs[i],
                coords = this._getKnobPosition(knob.point);
            var screenCoords = this.drawPane.drawing2screen(coords);
            knob.setCenterPoint(screenCoords[0], screenCoords[1]);
        }
    }
},


setDrawPane : function (drawPane) {
    if (drawPane == this.drawPane) return;
    // Support setDrawPane(null) as an equivalent to deparent type call in Canvas - clear from
    // any parent drawPane (but keep the item around for future use)
    if (drawPane == null) {
        this.erase();
        this.drawPane = null;
        return;
    }

    drawPane.addDrawItem(this);
},

// In some cases (currently DrawLinePaths only) we use additional lines to render out arrowheads
// rather than relying on native SVG etc arrows
_drawLineStartArrow : function () {
    return false;
},
_drawLineEndArrow : function () {
    return false;
},

// Erasing / Destroying
// ---------------------------------------------------------------------------------------

//> @method drawItem.erase()
// Erase this drawItem's visual representation and remove it from its DrawGroup (if any) and
// DrawPane.
// <P>
// To re-draw the item within the DrawPane, call +link{drawItem.draw()} again, or use
// +link{drawPane.addDrawItem()} to move to another DrawGroup.
//
// @visibility drawing
//<
// NOTE: after an erase a drawItem should be garbage unless application code holds onto it,
// since currently no global IDs are generated for DrawItems
// TODO leak testing
erase : function (erasingAll, willRedraw) {
    if (!erasingAll) { // drawPane.erase() or drawGroup.erase() just drops the whole drawItems array
        if (willRedraw) {
            if (!this._erasedDrawItems) this._erasedDrawItems = [ this ];
            else this._erasedDrawItems.add(this);
        }
        if (this.drawGroup) {
            this.drawGroup.drawItems.remove(this);
        } else if (this.drawPane) {
            this.drawPane.drawItems.remove(this);
            this.item && this.drawPane.quadTree.remove(this.item);
        }
    }
    if (!this._drawn) {
        // if we are pending a deferred draw clear it and exit without warning
        if (this.drawPane && this.drawPane.cancelDeferredDraw(this)) return;
        this.logInfo("DrawItem not yet drawn - exiting erase()");
        return;
    }
    if (this.drawingVML) {
        // see comments in Canvas.clearHandle(); note that VML is IE only
        if (isc.Page.isLoaded()) this._vmlHandle.outerHTML = "";
        else this._vmlContainer.removeChild(this._vmlHandle);
        this._vmlContainer = null;
        this._vmlHandle = null;
        this._vmlStrokeHandle = null;
        this._vmlFillHandle = null;
        delete this.drawingVML;
    } else if (this.drawingSVG) {
        if (willRedraw) this._erasedSVGHandle = this._svgHandle
        else {
            if (this._svgContainer) this._svgContainer.removeChild(this._svgHandle);
        }
        this._svgDocument = null;
        this._svgContainer = null;
        this._svgHandle = null;
        delete this.drawingSVG;
    } else if (this.drawingBitmap && !erasingAll) { // drawPane.erase() will call redrawBitmap()
        this.drawPane.redrawBitmap(); // this item has been removed above
    }
    // clear up any drawn knobs
    if (this.knobs) {
        for (var i = 0; i < this.knobs.length; i++) {
            this._hideKnobs(this.knobs[i]);
        }
    }

    this._clearEventParent();
    this._drawn = false;
},


//> @method drawItem.destroy()
// Permanently destroys this DrawItem, similar to +link{Canvas.destroy()}.
//
// @visibility drawing
//<
destroy : function (destroyingAll) {
    // if we're already destroyed don't do it again
    if (this.destroyed) return;

    // set a flag so we don't do unnecessary work during a destroy()
    this.destroying = true;

    this.erase(destroyingAll);

    // clear our global ID (removes the window.ID pointer to us)
    isc.ClassFactory.dereferenceGlobalID(this);

    this.destroyed = true;

    this.Super("destroy", arguments);
},

//> @attr drawItem.destroyed (boolean : null : RA)
// Flag indicating a drawItem has been destroyed, similar to +link{canvas.destroyed}.
// @visibility drawing
//<

//> @attr drawItem.destroying (boolean : null : RA)
// Flag indicating a drawItem is mid-destruction, similar to +link{canvas.destroying}.
// @visibility drawing
//<

//--------------------------------------------------------------------------------
//  DrawItem renderers
//  These convenience methods handle the line (stroke) and fill attributes for all
//  primitives. Override these in subclasses for more advanced compound element
//  renderings.
//  NOTE: empty string is supported for no color (transparent) fillColor and
//      lineColor, so subclasses can specify transparency
//--------------------------------------------------------------------------------



vmlLineEventsOnly:false,

// NB: draw() relies on this structure to access stroke (firstChild) and fill (nextSibling)
// elements without IDs
_getElementVML : function (id) {
    var fill = !this.lineEventsOnly ? " ON='true" : " ON='false",
        fillOpacity = 0,
        shadow = " ON='false",
        vector, angle, color1, color2, colors = "", percent;
    if (this.shadow) {
        shadow = " ON='true' COLOR='" + this.shadow.color + "' OFFSET='" + this.shadow.offset[0] + "pt," + this.shadow.offset[1] + "pt";
    }
    if (this.fillGradient) {
        fillOpacity = this.fillOpacity;
        var def = typeof(this.fillGradient) === 'string' ? this.drawPane.gradients[this.fillGradient] : this.fillGradient;
        if (typeof(def.direction) === 'number' || def.x1 || typeof(def.x1) === 'number') {
                vector = this._normalizeLinearGradient(def);
                angle = def.direction || 180*Math.atan2((vector[3]-vector[1]),(vector[2]-vector[0]))/Math.PI;
                angle = (270 - angle) % 360;
                colors = "' COLORS='";
                if (def.startColor && def.endColor) {
                    colors += '0% ' + def.startColor + ', 100% ' + def.endColor;
                } else if (def.colorStops && def.colorStops.length) {
                    for(var i = 0; i < def.colorStops.length; ++i) {
                        var colorstop = def.colorStops[i];
                        if (typeof(colorstop.offset) === 'string' && colorstop.offset.endsWith('%')) {
                            percent = colorstop.offset;
                        } else {
                            percent = colorstop.offset;
                        }
                        colors += percent + ' ' + colorstop.color;
                        if (i < def.colorStops.length - 1) {
                            colors += ", ";
                        }
                    }
                }
                fill = " TYPE='gradient' ANGLE='" + angle + colors;
        } else {
                colors = "' COLORS='";
                for(var i = 0; i < def.colorStops.length; ++i) {
                    var colorstop = def.colorStops[i];
                    if (typeof(colorstop.offset) === 'string' && colorstop.offset.endsWith('%')) {
                        percent = colorstop.offset;
                    } else {
                        percent = parseFloat(colorstop.offset)*100 + '%';
                    }
                    colors += percent + ' ' + colorstop.color;
                    if (i < def.colorStops.length - 1) {
                        colors += ", ";
                    }
                }
                fill = " TYPE='gradienttitle' OPACITY='1.0' FOCUS='100%' FOCUSSIZE='0,0' FOCUSPOSITION='0.5,0.5' METHOD='linear" + colors;
        }
    } else if (this.fillColor && !isc.isAn.emptyString(this.fillColor)) {
        fillOpacity = this.fillOpacity;
        fill = " COLOR='" + this.fillColor;
    }
    var vmlElem = isc.SB.concat(
            this.drawPane.startTagVML(this.vmlElementName),

            " ID='", id, "' ",
            this.getAttributesVML(), ">",
            this.drawPane.startTagVML('STROKE'),
            ((this.lineColor && this.lineColor != "") ?
                " COLOR='" + this.lineColor : " ON='false"),
            // manually adjust lineWidth for global zoom
            "' WEIGHT='", this.lineWidth * this.drawPane.zoomLevel, "px",
            "' OPACITY='", this.lineOpacity,
            "' DASHSTYLE='", this.linePattern,
            "' JOINSTYLE='miter' MITERLIMIT='8.0",
            "' ENDCAP='" + ((this.lineCap=="butt") ? "flat" : this.lineCap),
            // arrowHeads
            (this.startArrow ? "' STARTARROW='" + this.startArrow + "' STARTARROWWIDTH='wide": ""),
            (this.endArrow ? "' ENDARROW='" + this.endArrow + "' ENDARROWWIDTH='wide": ""),
            "'/>",this.drawPane.startTagVML('FILL'),
            fill,
            "' OPACITY='", fillOpacity,
            "'/>",
            this.drawPane.startTagVML('SHADOW'),
            shadow,
            "'/>",
            this.drawPane.endTagVML(this.vmlElementName));
    return vmlElem;
},

getAttributesVML : function () {
    return "" // implement in subclasses
},

//> @method drawItem.getSvgString
// Generates a string containing the SVG source of this DrawItem.
//
// <p><b>NOTE:</b> The generated SVG source assumes that the default namespace is <code>http://www.w3.org/2000/svg</code>
// and that namespace prefix <code>xlink</code> refers to namespace name <code>http://www.w3.org/1999/xlink</code>.
//
// @visibility drawing
//<
getSvgString : function (conversionContext) {
    conversionContext = conversionContext || isc.SVGStringConversionContext.create();
    var svgDefStrings = conversionContext.svgDefStrings || (conversionContext.svgDefStrings = {});

    var fill = "none", fillGradient, center;
    var gradient = this.svgFillGradient || this.fillGradient;
    if (gradient) {
        if (isc.isA.String(gradient)) gradient = this.drawPane.gradients[gradient];
        if (gradient) {
            if (gradient.id == undefined) {
                gradient.id = "gradient" + conversionContext.getNextSvgDefNumber();
            }
            var gradientID = gradient.id;
            this._useGradientID = gradientID;

            var gradientSvgString;
            if (gradient.direction != null) {
                gradientSvgString = this.drawPane._getSimpleGradientSvgString(gradientID, gradient, conversionContext, this);
            } else if (gradient.x1 != null) {
                gradientSvgString = this.drawPane._getLinearGradientSvgString(gradientID, gradient, conversionContext, this);
            } else {
                gradientSvgString = this.drawPane._getRadialGradientSvgString(gradientID, gradient, conversionContext, this);
            }
            gradientID = this._useGradientID;
            svgDefStrings[gradientID] = gradientSvgString;
            if (conversionContext.printForExport === false) {
                this.drawPane.gradients[gradientID] = gradient;
            }
            fill = "url(#" + gradientID + ")";
        }
    } else if (this.fillColor) {
        fill = this.fillColor;
    }

    var svgString = "<" + this.svgElementName +
        " id='isc_DrawItem_" + this.drawItemID +
        "' stroke-width='" + this.lineWidth + "px" +
        "' stroke-opacity='" + this.lineOpacity +
        "' stroke-dasharray='" + this._getSVGDashArray() +
        "' stroke-linecap='" + this.lineCap +
        "' stroke='" + ((this.lineColor && this.lineColor != "") ? this.lineColor : "none") +
        "' fill='" + fill +
        "' fill-opacity='" + this.fillOpacity;

    if (this.svgFilter != null && this.drawPane) {
        var filterSvgString = svgDefStrings[this.svgFilter] || (svgDefStrings[this.svgFilter] = this.drawPane._getFilterSvgString(this.svgFilter));
        if (filterSvgString) {
            svgString += "' filter='url(#" + this.svgFilter + ")";
        }
    }

    if (this.rotation && (center = this.getCenter()) && center.length === 2) {
        svgString += "' transform='rotate(" + this.rotation + " " + center[0]  + " " + center[1] + ")";
    }

    // arrow heads
    if (this.startArrow && this._drawLineStartArrow()) {
        var svgStartArrowID = this._getSVGStartArrowID();
        if (!svgDefStrings[svgStartArrowID]) {
            svgDefStrings[svgStartArrowID] = this._getArrowMarkerSvgString(svgStartArrowID, this.lineColor, this.lineOpacity, true);
        }
        svgString += "' marker-start='url(#" + svgStartArrowID + ")";
    }
    if (this.endArrow && this._drawLineEndArrow()) {
        var svgEndArrowID = this._getSVGEndArrowID();
        if (!svgDefStrings[svgEndArrowID]) {
            svgDefStrings[svgEndArrowID] = this._getArrowMarkerSvgString(svgEndArrowID, this.lineColor, this.lineOpacity, false);
        }
        svgString += "' marker-end='url(#" + svgEndArrowID + ")";
    }

    svgString += "' " + this.getAttributesSVG();

    if (this.contents) {
        svgString += ">" + isc.makeXMLSafe(this.contents) + "</" + this.svgElementName + ">";
    } else {
        svgString += "/>";
    }
    return svgString;
},

getAttributesSVG : function () {
    // implement in subclasses
    return "";
},

_normalizeLinearGradient : function (def) {
    return isc.DrawItem._normalizeLinearGradient(def, this.getBoundingBox());
},

_normalizeRadialGradient : function (def) {
    return isc.DrawItem._normalizeRadialGradient(def, this.getBoundingBox(), this.getCenter());
},

_drawLinePattern : function (x1, y1, x2, y2, context) {
    var dashArray;
    switch (this.linePattern.toLowerCase()) {
    default:
        dashArray = [10, 5];
        break;
    case "dash":
        dashArray = [10, 10];
        break;
    case "dot":
        dashArray = [1, 10];
        break;
    case "longdash":
        dashArray = [20, 10];
        break;
    case "shortdash":
        dashArray = [10, 5];
        break;
    case "shortdot":
        dashArray = [1, 5];
        break;
    }

    var dashCount = dashArray.length,
        dx = (x2 - x1), dy = (y2 - y1),
        dist = isc.Math._hypot(dx, dy),
        distRemaining = dist,
        dashIndex = 0,
        draw = true;
    this.bmMoveTo(x1, y1, context);
    while (distRemaining >= 0.1) {
        var dashLength = Math.min(dashArray[dashIndex++ % dashCount], distRemaining);
        x1 += dx * dashLength / dist;
        y1 += dy * dashLength / dist;
        this[draw ? 'bmLineTo' : 'bmMoveTo'](x1, y1, context);
        distRemaining -= dashLength;
        draw = !draw;
    }
},

drawStroke : function (context) {
    context.lineWidth = this.lineWidth;
    context.lineCap = this.lineCap;
    context.strokeStyle = this.lineColor;
    context.globalAlpha = this.lineOpacity;
    context.beginPath();
    this.drawBitmapPath(context);
    context.stroke();
},

// Note: stroke and fill are each path-ending operations.
// if transparent line or fill color (false, null, empty string), avoid drawing fill or
// filling.
// subclasses are intended to implement drawBitMapPath and have a series of lineTo(), arcTo()
// et al calls
drawBitmap : function (context) {
    context.save();
    try {
        if (this.drawPane && (this.drawPane.zoomLevel || this.drawPane.translate || this.drawPane.rotation)) {
            context.setTransform(1,0,0,1,0,0);
            if (this.drawPane.translate) {
                context.translate(this.drawPane.translate[0], this.drawPane.translate[1]);
            }
            if (this.drawPane.zoomLevel) {
                context.scale(this.drawPane.zoomLevel, this.drawPane.zoomLevel);
            }
/*
            if (this.drawPane.rotation) {
                context.rotate(this.drawPane.rotation*Math.PI/180.0);
            }
*/
        }
        if (this.translate) {
            context.translate(this.translate[0], this.translate[1]);
        }
        if (this.scale && this.scale.length === 2) {
            context.scale(this.scale[0], this.scale[1]);
        }
        if (this.rotation && !isc.isA.DrawLabel(this)) {
            var center = this.getCenter && this.getCenter();
            if (center && center.length === 2) {
              context.translate(center[0], center[1]);
              context.rotate(this.rotation*Math.PI/180.0);
              context.translate(-center[0], -center[1]);
            }
        }
        var fill = this.fillColor, def, vector, offset;
        if (this.fillGradient) {
            def = typeof(this.fillGradient) === 'string' ? this.drawPane.gradients[this.fillGradient] : this.fillGradient;
            if (typeof(def.direction) === 'number' || def.x1 || typeof(def.x1) === 'number') {
                vector = this._normalizeLinearGradient(def);
                fill = context.createLinearGradient(vector[0],vector[1],vector[2],vector[3]);
            } else {
                vector = this._normalizeRadialGradient(def);
                fill = context.createRadialGradient(vector[0],vector[1],vector[2],vector[3],vector[4],vector[5]);
            }
            if (def.startColor && def.endColor) {
                fill.addColorStop(0.0,def.startColor);
                fill.addColorStop(1.0,def.endColor);
            } else if (def.colorStops && def.colorStops.length) {
              for (var i = 0; i < def.colorStops.length; ++i) {
                  offset = def.colorStops[i].offset;
                  if (typeof(offset) === 'string' && offset.endsWith('%')) {
                      offset = parseFloat(offset.substring(0,offset.length-1)) / 100.0;
                  }
                  fill.addColorStop(offset,def.colorStops[i].color);
              }
            }
        }
        if (this.shadow) {
            context.shadowColor = this.shadow.color;
            context.shadowBlur = this.shadow.blur;
            context.shadowOffsetX = this.shadow.offset[0];
            context.shadowOffsetY = this.shadow.offset[1];
        }
        if (fill) {
            context.fillStyle = fill;
            context.globalAlpha = this.fillOpacity;
            context.beginPath();
            this.drawBitmapPath(context);
            context.fill();
        }
        if (this.lineColor) {
            if(this.shadow && fill) {
                context.shadowColor = null;
                context.shadowBlur = null;
                context.shadowOffsetX = 0;
                context.shadowOffsetY = 0;
            }
            this.drawStroke(context);
        }
    } catch (e) {
        if (!isc.Log.supportsOnError) this._reportJSError(e);
        else this.logWarn("exception during drawBitmap(): " + e);
    }
    context.restore();
},


//--------------------------------------------------------------------------------
//  Arrowhead support for SVG
//--------------------------------------------------------------------------------
//  In VML, the <stroke> element's startarrow/endarrow can be set to an arrow type, which
//  provide:
//
//      -- automatic sizing, positioning, and rotation
//      -- 3 width x 3 height sizing options
//      -- automatic color and opacity matching
//      -- automatic clipping of line ends to avoid overlap (eg when the arrow is narrower than
//         the line)
//      -- hinting (at least for fine lines, ie, arrowheads do not get smaller below
//          a line width of ~2.5px, so you can still see them as arrowheads)
//
//  SVG supports arrowheads via a more generic "marker" system, where you define shapes in
//  <marker> elements and then attach those markers to points of a path. The SVG system
//  is more flexible, but very very diffcult to implement even a single arrowhead style with
//  all of the expected behaviors. Basically SVG will do:
//
//      -- automatic sizing (but no hinting)
//      -- automatic positioning (but no clipping of the path ends)
//      -- automatic rotation
//
//  Long-term, it might make sense to build our own arrowhead subsystem from the ground up;
//  then it will also work with CANVAS, and provide more customization with VML.
//  The SVG spec provides a basic description of the marker algorithm at:
//      http://www.w3.org/TR/SVG/painting.html#MarkerAlgorithm
//
//  But for now, we just want to get a single arrowhead type working in both SVG and VML. So
//  we are use the built-in "block" arrowhead in VML, and we implement the following logic
//  for markers in SVG:
//
//      1. generate marker elements (NB: no memory management/destroy yet!)
//              see methods immediately below
//
//      2. match marker color/opacity to shape lineColor/lineOpacity
//              see setLineColor() and setLineOpacity()
//
//      3. shorten path ends to avoid line/arrowhead overflow
//              specific to DrawLine and DrawPath components?
//
//      4. (future) use fixed-minimum-size markers for thin lines
//              see setLineWidth()
//
// Some FFSVG 1.5 limitations/notes:
//   -- marker-start and marker-end apparently get the same orientation on a line. not sure if
//      this is a Moz bug, or intended behavior. currently generating separate start and end
//      marker elements to work around this.
//   -- you can write marker-end by itself in the initial SVG fragment and it will be respected,
//      but you cannot set the marker-end attribute directly unless marker-start has been set.
//      workaround: set marker-start, set marker-end, clear marker-start
//      note: not seeing this any more...maybe my mistake
//
// TODO multiple arrowhead types and sizes


// Return the DOM ID for this SVG marker element
// Side effect: sets _svgStartArrowId to the returned ID
// This method is a bit messy to allow for startArrow being either an arrowStyle (normal usage)
// or an element ID (advanced usage to share a marker across multiple drawItems).
_getSVGStartArrowID : function () {
    if (!this._svgStartArrowID) {
        if (this.startArrow && this._svgDocument && this._svgDocument.getElementById(this.startArrow) &&
            (this.startArrow != "open" &&
             this.startArrow != "closed")) {
            this._svgStartArrowID = this.startArrow;
        } else {
            this._svgStartArrowID = "isc_DrawItem_" + this.drawItemID + "_startArrow";
        }
    }
    return this._svgStartArrowID;
},
// duplicate implementation for endArrow markers - see comments for _getSVGStartArrowID()
_getSVGEndArrowID : function () {
    if (!this._svgEndArrowID) {
        if (this.endArrow && this._svgDocument && this._svgDocument.getElementById(this.endArrow) &&
            (this.endArrow != "open" &&
             this.endArrow != "closed")) {
            this._svgEndArrowID = this.endArrow;
        } else {
            this._svgEndArrowID = "isc_DrawItem_" + this.drawItemID + "_endArrow";
        }
    }
    return this._svgEndArrowID;
},

_getArrowMarkerSvgString : function (id, color, opacity, start) {
    return "<marker id='" + id +
        "' viewBox='0 0 10 10' refY='5' refX='" + (start ? "10" : "0") +
        "' orient='auto' markerUnits='strokeWidth' markerWidth='4' markerHeight='3'><path d='" +
        (start ? "M 10 0 L 0 5 L 10 10 z" : "M 0 0 L 10 5 L 0 10 z") +
        "' fill='" + ((color && color != "") ? color : "none") +
        "' fill-opacity='" + opacity +
        "'/></marker>";
},

//--------------------------------------------------------------------------------
//  visibility
//--------------------------------------------------------------------------------

//> @method drawItem.show()
// Make this drawItem visible.
// @visibility drawing
//<
show : function () {
    this.hidden = false;
    if (this.drawingVML) {
        this._vmlHandle.style.visibility = "visible";
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "visibility", "visible");
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},


//> @method drawItem.hide()
// Hide this drawItem.
// @visibility drawing
//<
hide : function () {
    this.hidden = true;
    if (this.drawingVML) {
        this._vmlHandle.style.visibility = "hidden";
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "visibility", "hidden");
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

//--------------------------------------------------------------------------------
//  line & fill
//--------------------------------------------------------------------------------

//> @method drawItem.setLineWidth()
// Update lineWidth for this drawItem.
// @param width (int) new pixel lineWidth
// @visibility drawing
//<
setLineWidth : function (width) {
    if (width != null) this.lineWidth = width;
    if (this.drawingVML) {
        // NB: applying zoom correction - so this method is for external callers ONLY
        this._setLineWidthVML(this.lineWidth * this.drawPane.zoomLevel);
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "stroke-width", this.lineWidth+"px");
        this._svgHandle.setAttributeNS(null, "stroke-dasharray", this._getSVGDashArray()); // see _getSVGDashArray
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},
// split out so internal callers can apply zoom correction
_setLineWidthVML : function (width) {
    if (this._vmlStrokeHandle) {
        this._vmlStrokeHandle.weight = width+"px";
    }
},

//> @method drawItem.setLineColor()
// Update lineColor for this drawItem.
// @param color (CSSColor) new line color.  Pass null for transparent.
// @visibility drawing
//<
setLineColor : function (color) {
    this.lineColor = color;
    if (this.drawingVML) {
        if (this.lineColor && this.lineColor != "") {
            this._vmlStrokeHandle.on = true;
            this._vmlStrokeHandle.color = this.lineColor;
        } else {
            this._vmlStrokeHandle.on = false;
        }
    } else if (this.drawingSVG) {
        var color = (this.lineColor && this.lineColor != "") ? this.lineColor : "none"
        this._svgHandle.setAttributeNS(null, "stroke", color);
        // change arrowhead colors too
        if (this._svgStartArrowHandle) {
            this._svgStartArrowHandle.setAttributeNS(null, "stroke", color);
            this._svgStartArrowHandle.setAttributeNS(null, "fill", color);
        }
        if (this._svgEndArrowHandle) {
            this._svgEndArrowHandle.setAttributeNS(null, "stroke", color);
            this._svgEndArrowHandle.setAttributeNS(null, "fill", color);
        }
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},


//> @method drawItem.setLineOpacity()
// Update lineOpacity for this drawItem.
// @param opacity (float) new opacity, as a number between 0 (transparent) and 1 (opaque).
// @visibility drawing
//<
setLineOpacity : function (opacity) {
    if (opacity != null) this.lineOpacity = opacity;
    if (this.drawingVML) {
        this._vmlStrokeHandle.opacity = this.lineOpacity;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "stroke-opacity", this.lineOpacity);
        // change arrowhead opacity too
        if (this._svgStartArrowHandle) {
            this._svgStartArrowHandle.setAttributeNS(null, "stroke-opacity", this.lineOpacity);
            this._svgStartArrowHandle.setAttributeNS(null, "fill-opacity", this.lineOpacity);
        }
        if (this._svgEndArrowHandle) {
            this._svgEndArrowHandle.setAttributeNS(null, "stroke-opacity", this.lineOpacity);
            this._svgEndArrowHandle.setAttributeNS(null, "fill-opacity", this.lineOpacity);
        }
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},


//> @method drawItem.setLinePattern()
// Update linePattern for this drawItem.
// @param pattern (LinePattern) new linePattern to use
// @visibility drawing
//<
setLinePattern : function (pattern) {
    this.linePattern = pattern;
    if (this.drawingVML) {
        this._vmlStrokeHandle.dashstyle = this.linePattern;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "stroke-dasharray", this._getSVGDashArray());
    } else if (this.drawingBitmap) {
        // NOT SUPPORTED (TODO should at least experiment with pattern paints for h/v lines)
    }
},
// Maps to emulate the preset VML dashstyles using the more powerful (but raw) SVG stroke-dasharray
// attribute. Dash and gap sizes here are multiples of lineWidth, regardless of the lineCap type.
// VML also provides shortdashdot, shortdashdotdot, dashdot, longdashdot, longdashdotdot; not
// currently emulated. To emulate a dashdot pattern will require 4 values (1 dash, 1 dot, 2 gaps);
// dashdotdot patterns will require 6 values.
_linePatternDashSizeMap : {shortdot:1, dot:1, shortdash:3, dash:4, longdash:8},
_linePatternGapSizeMap : {shortdot:1, dot:3, shortdash:1, dash:3, longdash:3},
// NB: We must take lineWidth and lineCap into account to emulate the VML behavior
//      in SVG, so setLineWidth() and setLineCap() must also reset stroke-dasharray.
_getSVGDashArray : function () {
    var lp = this.linePattern;
    if (!lp || lp == "solid" || lp == "") return "none";
    // for SVG only - Take an array of dash-gap patterns for maximum flexibility. Dash-gap patterns
    // are specified in VML (eg "4 2 1 2" for dash-dot), but they appear to be broken, at least in
    // my IE6xpsp2.
    // TODO someone else try VML dash-gap patterns (not using this join code!) in case I missed something
    // TODO could process this array to adapt to lineWidth/lineCap, as we do for the preset patterns
    if (isc.isAn.Array(lp)) return lp.join("px,")+"px";
    var dashSize = this._linePatternDashSizeMap[lp];
    var gapSize = this._linePatternGapSizeMap[lp];
    // At least in FFSVG, "round" or "square" caps extend into the gap, effectively stealing
    // 1 lineWidth from the gap size and adding it to the dash size, so we compensate here.
    if (this.lineCap != "butt") { // implies "round" or "square"
        // At least in FFSVG, the SVG renderer throws a scribble fit on a zero dash size, and
        // loses parts of the line on very small dash sizes. 0.1px seems OK for now.
        dashSize = Math.max(0.1, dashSize-1);
        gapSize++;
    }
    return (dashSize*this.lineWidth)+"px,"+(gapSize*this.lineWidth)+"px";
},


//> @method drawItem.setLineCap()
// Update lineCap for this drawItem.
// @param cap (LineCap) new lineCap to use
// @visibility drawing
//<
setLineCap : function (cap) {
    if (cap != null) this.lineCap = cap;
    if (this.drawingVML) {
        this._vmlStrokeHandle.endcap = (this.lineCap=="butt") ? "flat" : this.lineCap;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "stroke-linecap", this.lineCap);
        this._svgHandle.setAttributeNS(null, "stroke-dasharray", this._getSVGDashArray()); // see _getSVGDashArray
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

//> @method drawItem.setShadow(shadow)
// Update shadow for this drawItem.
// @param shadow (Shadow) new shadow
// @visibility drawing
//<
setShadow: function (shadow) {
    if (shadow != null) {
        this.shadow = shadow;
    }
    if (this.drawingVML) {
    } else if (this.drawingSVG) {
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

// Arrowheads
// ---------------------------------------------------------------------------------------

//> @method drawItem.setStartArrow()
// Set the arrowhead at the beginning of this path.
// @param arrowStyle (ArrowStyle) style of arrow to use
// @visibility drawing
//<
// NOTE: we support passing an SVG marker element ID as startArrow so we can reuse the same
// arrowheads for multiple drawItems. Note that element IDs are supported for setting only;
// if you read startArrow after draw() it will always be an arrow style.
setStartArrow : function (startArrow) {
    var wasLineArrow = this._drawLineStartArrow();
    var undef;
    if (startArrow !== undef) this.startArrow = startArrow;
    else startArrow = this.startArrow;

    var isLineArrow = this._drawLineStartArrow();

    if (wasLineArrow != isLineArrow) {
        this.setStartPoint();
    }
    // suppress rendering native block arrows with special line-arrows
    if (isLineArrow) startArrow = null;

    if (this.drawingVML) {
        this._vmlStrokeHandle.startarrow = (startArrow ? startArrow : "none");
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "marker-start",
            (startArrow ? "url(#" + this._getSVGStartArrowID() + ")" : "none")
        );
    } else if (this.drawingBitmap) {
        // NOT SUPPORTED (TODO could implement if there is demand - see arrowhead notes)
    }
},

//> @method drawItem.setEndArrow()
// Set the arrowhead at the end of this path.
// @param arrowStyle (ArrowStyle) style of arrow to use
// @visibility drawing
//<
setEndArrow : function (endArrow) {
    var wasLineArrow = this._drawLineEndArrow();
    var undef;
    if (endArrow !== undef) this.endArrow = endArrow;
    else endArrow = this.endArrow;

    var isLineArrow = this._drawLineEndArrow();
    if (wasLineArrow != isLineArrow) {
        this.setEndPoint()
    }

    if (isLineArrow) endArrow = null;
    if (this.drawingVML) {
        this._vmlStrokeHandle.endarrow = (endArrow ? endArrow : "none");
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "marker-end",
            (endArrow ? "url(#" + this._getSVGEndArrowID() + ")" : "none")
        );
    } else if (this.drawingBitmap) {
        // NOT SUPPORTED (TODO could implement if there is demand - see arrowhead notes)
    }
},
//> @method drawItem.moveBy()
// Move the shape by the specified deltas for the left and top coordinate.
//
// @param dX (int) change to left coordinate in pixels
// @param dY (int) change to top coordinate in pixels
// @visibility drawing
//<
moveBy : function (dX, dY) {
    if(this.item) {
        var bb = this.getBoundingBox();
        this.item.x=bb[0];
        this.item.y=bb[1];
        this.item.width=Math.abs(bb[2]-bb[0]);
        this.item.height=Math.abs(bb[3]-bb[1]);
        this.drawPane.updateQuadTree(this);
    }
},
//> @method drawItem.resizeBy()
// Resize the shape by the specified deltas for the left and top coordinate.
//
// @param dX (int) change to left coordinate in pixels
// @param dY (int) change to top coordinate in pixels
// @visibility drawing
//<
resizeBy : function (dX, dY) {
    if(this.item) {
        var bb = this.getBoundingBox();
        this.item.x=bb[0];
        this.item.y=bb[1];
        this.item.width=Math.abs(bb[2]-bb[0]);
        this.item.height=Math.abs(bb[3]-bb[1]);
        this.drawPane.updateQuadTree(this);
    }
},
//> @method drawItem.resizeTo()
// Resize to the specified size
// @param width (int) new width
// @param height (int) new height
// @visibility drawing
//<
resizeTo : function (width,height) {
    var dX = 0, dY = 0;
    if(this.item) {
        if (width != null) dX = width - this.item.width;
        if (height != null) dY = height - this.item.height;
    }
    this.resizeBy(dX,dY);
},

//> @method drawItem.rotateBy()
// Rotate the shape by the relative rotation in degrees
// @param degrees (float) number of degrees to rotate from current orientation.
// @visibility drawing
//<
rotateBy : function (degrees) {
    this.rotation += degrees;
    if (this.drawingVML) {
        this._vmlHandle.style.rotation = this.rotation;
    } else if (this.drawingSVG) {
        var center = this.getCenter();
        this._svgHandle.setAttributeNS(null, "transform", "translate(" +  center[0]  + "," + center[1] + ") rotate("+this.rotation+") translate("  +  -center[0] + "," + -center[1] + ")");
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.rotated(degrees);
},

//> @method drawItem.rotateTo()
// Rotate the shape by the absolute rotation in degrees
// @param degrees (float) number of degrees to rotate
// @visibility drawing
//<
rotateTo : function (degrees) {
    this.rotateBy(degrees - this.rotation);
},

//> @method drawItem.scaleBy()
// Scale the shape by the x, y multipliers
// @param x (float) scale in the x direction
// @param y (float) scale in the y direction
// @visibility drawing
//<
scaleBy : function (x, y) {
    this.scale = this.scale || [];
    this.scale[0] = x;
    this.scale[1] = y;
    if (this.drawingVML) {
    } else if (this.drawingSVG) {
        var transform = "scale("+this.scale[0]+","+this.scale[1]+") "+(this._svgHandle.getAttributeNS(null, "transform") || "");
        this._svgHandle.setAttributeNS(null, "transform", transform);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.scaled();
},

//> @method drawItem.scaleTo()
// Scale the shape by the x, y multipliers
// @param x (float) scale in the x direction
// @param y (float) scale in the y direction
// @visibility drawing
//<
scaleTo : function (x, y) {
    this.scaleBy(x, y);
},

// Fill
// ---------------------------------------------------------------------------------------

//> @method drawItem.setFillColor()
// Update fillColor for this drawItem.
// @param color (CSSColor) new fillColor to use.  Pass null for transparent.
// @visibility drawing
//<
setFillColor : function (color) {
    this.fillColor = color;
    if (this.drawingVML) {
        if (this.fillColor && this.fillColor != "") {
            this._vmlFillHandle.on = true;
            this._vmlFillHandle.color = this.fillColor;
        } else {
            this._vmlFillHandle.on = false;
        }
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "fill",
            (this.fillColor && this.fillColor != "") ? this.fillColor : "none"
        );
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

//> @method drawItem.setFillGradient()
// Update fillGradient for this drawItem.
// @param gradient (Gradient) new gradient to use.  Pass null for transparent.
// @visibility drawing
//<
setFillGradient : function (gradient) {
    this.gradient = gradient;
    if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "fill",
            (this.fillColor && this.fillColor != "") ? this.fillColor : "none"
        );
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

//> @method drawItem.setFillOpacity()
// Update fillOpacity for this drawItem.
// @param opacity (float) new opacity, as a number between 0 (transparent) and 1 (opaque).
// @visibility drawing
//<
setFillOpacity : function (opacity) {
    if (opacity != null) this.fillOpacity = opacity;
    if (this.drawingVML) {
        this._vmlFillHandle.opacity = this.fillOpacity;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "fill-opacity", this.fillOpacity);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

// <canvas> methods wrapped with exception handlers / logging and workarounds as needed
// ---------------------------------------------------------------------------------------

bmMoveTo : function (left, top, context) {
    var context = context || this.drawPane.getBitmapContext();

    var offset = (this.autoOffset && (this.lineWidth == 0 || parseInt(this.lineWidth) % 2) == 1 ? 0.5 : 0);
    try {
        context.moveTo(left+offset, top+offset);
    } catch (e) {
        this.logWarn("error on moveTo(): left: " + left + ", top: " + top +
                     (this.logIsInfoEnabled() ? this.getStackTrace() : ""));
    }
},

bmArc: function (centerPointX, centerPointY, radius, startRadian, endRadian, context) {
    var context = context || this.drawPane.getBitmapContext();
    var offset = (this.autoOffset && (this.lineWidth == 0 || parseInt(this.lineWidth) % 2) == 1 ? 0.5 : 0);

    try {
        context.arc(centerPointX+offset, centerPointY+offset, radius, startRadian, endRadian, false);
    } catch (e) {
        this.logWarn("error on arc(): centerPointX: " + centerPointX + ", centerPointY: "
                     + ", radius: " + radius + ", startRadian: " + startRadian + ", endRadian: " + endRadian +
                     (this.logIsInfoEnabled() ? this.getStackTrace() : ""));
    }
},

bmLineTo : function (left, top, context) {
    var context = context || this.drawPane.getBitmapContext();
    var offset = (this.autoOffset && (this.lineWidth == 0 || parseInt(this.lineWidth) % 2) == 1 ? 0.5 : 0);

    try {
        context.lineTo(left+offset, top+offset);
    } catch (e) {
        this.logWarn("error on lineTo(): left: " + left + ", top: " + top +
                     (this.logIsInfoEnabled() ? this.getStackTrace() : ""));
    }
},

bmQuadraticCurveTo : function (x1, y1, x2, y2) {
    var context = context || this.drawPane.getBitmapContext();
    var offset = (this.autoOffset && (this.lineWidth == 0 || parseInt(this.lineWidth) % 2) == 1 ? 0.5 : 0);
    try {
        context.quadraticCurveTo(x1+offset, y1+offset, x2+offset, y2+offset);
    } catch (e) {
        this.logWarn("error on quadraticCurveTo(): x1: " + x1 + ", y1: " + y1 + ", x2: " + x2 + ", y2: " + y2 +
                     (this.logIsInfoEnabled() ? this.getStackTrace() : ""));
    }
},

bmTranslate : function (left, top, context) {
    var context = context || this.drawPane.getBitmapContext();
    try {
        context.translate(left, top);
    } catch (e) {
        this.logWarn("error on translate(): left: " + left + ", top: " + top +
                     (this.logIsInfoEnabled() ? this.getStackTrace() : ""));
    }
},

bmRotate : function (angle, context) {
    var context = context || this.drawPane.getBitmapContext();
    try {
        context.rotate(angle);
    } catch (e) {
        this.logWarn("error on translate(): angle: " + angle +
                     (this.logIsInfoEnabled() ? this.getStackTrace() : ""));
    }
},

bmFillText : function (text, left, top, context) {
    var context = context || this.drawPane.getBitmapContext();
    try {
        context.fillText(text, left, top);
    } catch (e) {
        this.logWarn("error on fillText(): text: " + text +
                     ", left: " + left + ", top: " + top +
                     (this.logIsInfoEnabled() ? this.getStackTrace() : ""));
    }
},

bmStrokeText : function (text, left, top, context) {
    var context = context || this.drawPane.getBitmapContext();
    try {
        context.strokeText(text, left, top);
    } catch (e) {
        this.logWarn("error on fillText(): text: " + text +
                     ", left: " + left + ", top: " + top +
                     (this.logIsInfoEnabled() ? this.getStackTrace() : ""));
    }
}

}); // end DrawItem.addProperties

isc.DrawItem.addClassProperties({
    _IDCounter:0,   // for unique DOM IDs

    // ControlKnobs: see drawItem.knobs
    // For every knobType "<XXX>" we will call a show<XXX>KnobType() method
    // This method creates and caches these function names centrally (avoids reassembling strings)
    _showKnobsFunctionNameTemplate:["show", ,"Knobs"],
    _hideKnobsFunctionNameTemplate:["hide", ,"Knobs"],
    _getShowKnobsFunctionName : function (knobType, hide) {

        if (!this._knobTypeFunctionMap) {
            this._knobTypeFunctionMap = {};
        }

        if (this._knobTypeFunctionMap[knobType] == null) {
            knobType = knobType.substring(0,1).toUpperCase() + knobType.substring(1);

            this._showKnobsFunctionNameTemplate[1] = knobType;
            this._hideKnobsFunctionNameTemplate[1] = knobType;

            this._knobTypeFunctionMap[knobType] = [
                this._showKnobsFunctionNameTemplate.join(isc.emptyString),
                this._hideKnobsFunctionNameTemplate.join(isc.emptyString)
            ];
        }
        return hide ? this._knobTypeFunctionMap[knobType][1]
                     : this._knobTypeFunctionMap[knobType][0];
    },

    registerEventStringMethods : function () {
        var EH = isc.EH;
        for (var eventName in EH.eventTypes) {
            // Register all events as string methods using the EventHandler's authoritative list
            this.registerStringMethods(EH.eventTypes[eventName], EH._eventHandlerArgString);
        }
    },

    _normalizeLinearGradient : function (def, boundingBox) {
        // Convert percentages to absolute values within the bounding box.
        var arr = new Array(4),
            width = Math.abs(boundingBox[2] - boundingBox[0]),
            height = Math.abs(boundingBox[3] - boundingBox[1]);
        if (typeof(def.direction) === 'number') {
            var distance = Math.round(isc.Math._hypot(width, height)),
                radians = def.direction * Math.PI / 180.0;
            def.x1 = boundingBox[0];
            def.x2 = boundingBox[0] + distance * Math.cos(radians);
            def.y1 = boundingBox[1];
            def.y2 = boundingBox[1] + distance * Math.sin(radians);
        }
        // The x-coordinate of the start point of the gradient
        if (typeof(def.x1) === 'string' && def.x1.endsWith('%')) {
            arr[0] = (boundingBox[0] + parseFloat(def.x1) * width / 100.0);
        } else if (isc.isA.Number(def.x1)) {
            arr[0] = def.x1;
        }
        // The y-coordinate of the start point of the gradient
        if (typeof(def.y1) === 'string' && def.y1.endsWith('%')) {
            arr[1] = (boundingBox[1] + parseFloat(def.y1) * height / 100.0);
        } else if (isc.isA.Number(def.y1)) {
            arr[1] = def.y1;
        }
        // The x-coordinate of the end point of the gradient
        if (typeof(def.x2) === 'string' && def.x2.endsWith('%')) {
            arr[2] = (boundingBox[0] + parseFloat(def.x2) * width / 100.0);
        } else if (isc.isA.Number(def.x2)) {
            arr[2] = def.x2;
        }
        // The y-coordinate of the end point of the gradient
        if (typeof(def.y2) === 'string' && def.y2.endsWith('%')) {
            arr[3] = (boundingBox[1] + parseFloat(def.y2) * height / 100.0);
        } else if (isc.isA.Number(def.y2)) {
            arr[3] = def.y2;
        }
        return arr;
    },

    _normalizeRadialGradient : function (def, boundingBox, center) {
        // Convert percentages to absolute values using the bounding box values.
        var arr = new Array(6);
        // The x-coordinate of the starting circle of the gradient
        if (typeof(def.fx) === 'string') {
            if (def.fx.endsWith('%')) {
                arr[0] = (center[0] + (parseFloat(def.fx) / 100.0));
            } else {
                arr[0] = (center[0] + parseFloat(def.fx));
            }
        } else if (def.fx != undefined) {
            arr[0] = (center[0] + def.fx);
        } else {
            arr[0] = center[0];
        }
        // The y-coordinate of the starting circle of the gradient
        if (typeof(def.fy) === 'string') {
            if (def.fy.endsWith('%')) {
                arr[1] = (center[1] + (parseFloat(def.fy) / 100.0));
            } else {
                arr[1] = (center[1] + parseFloat(def.fy));
            }
        } else if (def.fy != undefined) {
            arr[1] = (center[1] + def.fy);
        } else {
            arr[1] = center[1];
        }
        // The radius of the starting circle of the gradient
        arr[2] = 0;
        // The x-coordinate of the ending circle of the gradient
        if (typeof(def.cx) === 'string' && isc.isA.Number(boundingBox[0])) {
            if (def.cx.endsWith('%')) {
                arr[3] = (boundingBox[0] - Math.round(boundingBox[0] * parseInt(def.cx) / 100.0));
            } else {
                arr[3] = (center[0] + parseInt(def.cx));
            }
        } else {
            arr[3] = (center[0] + def.cx);
        }
        // The y-coordinate of the ending circle of the gradient
        if (typeof(def.cy) === 'string' && isc.isA.Number(boundingBox[1])) {
            if (def.cx.endsWith('%')) {
                arr[4] = (boundingBox[1] - Math.round(boundingBox[1] * parseInt(def.cy) / 100.0));
            } else {
                arr[4] = (center[1] + parseInt(def.cy));
            }
        } else {
            arr[4] = (center[1] + def.cy);
        }
        // The radius of the ending circle of the gradient
        if (typeof(def.r) === 'string' && isc.isA.Number(boundingBox[0]) && isc.isA.Number(boundingBox[1])) {
            var width = boundingBox[2] - boundingBox[0],
                height = boundingBox[3] - boundingBox[1],
                r = isc.Math._hypot(width, height);
            if (def.r.endsWith('%')) {
                arr[5] = (r * parseFloat(def.r) / 100.0);
            } else {
                arr[5] = (r * parseFloat(def.r));
            }
        } else {
            arr[5] = def.r;
        }
        return arr;
    }
});

isc.DrawItem.registerEventStringMethods();



//------------------------------------------------------------------------------------------
//> @class DrawGroup
//
// DrawItem subclass to manage a group of other DrawItem instances.
// <P>
// A DrawGroup has no local visual representation other than that of its drawItems. Adding items
// to a drawGroup allows for central event handling, and allows them to be manipulated
// (drawn, scaled, etc) together.
// <P>
// DrawItems are added to a DrawGroup by creating the DrawItems with +link{drawItem.drawGroup}
// set to a drawGroup, or by calling +link{drawGroup.addItem()}.
// <P>
// DrawGroups handle events by having an explicitly specified group rectangle
// (see +link{getGroupRect()}). This rectangle has no visual representation within the draw pane
// (is not visible) but any user-interactions within the specified coordinates will trigger
// group level events.
// <P>
// DrawGroups may contain other DrawGroups.
//
// @inheritsFrom DrawItem
// @treeLocation Client Reference/Drawing/DrawItem
// @visibility drawing
//<
//------------------------------------------------------------------------------------------


isc.defineClass("DrawGroup", "DrawItem").addProperties({

    //> @attr drawGroup.knobs
    // <b>NOTE:</b> DrawGroups do not support knobs.
    // @include DrawItem.knobs
    //<


    renderGroupElement:false,

    //> @attr drawGroup.useGroupRect (boolean : true : IRW)
    // When should this drawGroup receive event notifications?
    // If set to <code>true</code>, the developer can specify an explicit
    // +link{drawGroup.getGroupRect(),set of coordinates}. Whenever the user interacts with this
    // rectangle, the drawGroup will be notified and the appropriate event handlers will be
    // fired. Note that rectangle need not contain all DrawItems within the group, and
    // is manually managed by the developer.<br>
    // If set to <code>false</code>, the +link{drawGroup.getGroupRect(),event rectangle}
    // coordinates are unused - instead
    // as a user interacts with specific drawItems within this group, the appropriate event handler
    // would be fired on the item, then the event would "bubble" to the
    // drawGroup, firing the appropriate event handler at the group level as well.
    // @visibility internal
    //<

    useGroupRect:true,

    //> @attr drawGroup.left      (int : 0 : IRW)
    // Left coordinate of the +link{getGroupRect(),group rectangle} in pixels relative to the DrawPane.
    //
    // @visibility drawing
    //<
    left:0,

    //> @attr drawGroup.top       (int : 0 : IRW)
    // Top coordinate of the +link{getGroupRect(),group rectangle} in pixels relative to the DrawPane.
    //
    // @visibility drawing
    //<
    top:0,

    //> @attr drawGroup.width      (int : 1 : IRW)
    // Width of the +link{getGroupRect(),group rectangle} in pixels relative to the DrawPane.
    //
    // @visibility drawing
    //<
    width:1,

    //> @attr drawGroup.height      (int : 1 : IRW)
    // Height of the +link{getGroupRect(),group rectangle} in pixels relative to the DrawPane.
    //
    // @visibility drawing
    //<
    height:1,

    // ---------------------------------------------------------------------------------------

    //> @attr drawGroup.drawItems    (Array of DrawItem : null : IR)
    // Initial list of DrawItems for this DrawGroup.
    // <P>
    // DrawItems can be added to a DrawGroup after initialization by setting
    // +link{drawItem.drawGroup}.
    //
    // @visibility drawing
    //<

init : function () {
    if (!this.drawItems) this.drawItems = [];
    // ensure each drawItem knows this is its drawGroup
    for (var i = 0; i < this.drawItems.length; i++) {
        var item = this.drawItems[i];
        if (item.drawPane != null) {
            item.drawPane.removeDrawItem(item);
        }
        item.drawGroup = this;
    }
    this.Super("init");
},

showResizeKnobs : null,
hideResizeKnobs : null,

showMoveKnobs : null,
hideMoveKnobs : null,

//> @method drawGroup.erase()
// Erases all DrawItems in the DrawGroup.
//
// @visibility drawing
//<
erase : function (erasingAll, willRedraw) {
    // erase grouped items first
    for (var i=0; i<this.drawItems.length; i++) {
        this.drawItems[i].erase(true, // pass erasingAll flag
                                willRedraw);
    }

    this.drawItems = [];
    // then erase this group
    this.Super("erase", arguments);
},

// removeDrawItem - remove the item from this group
// This is currently used by drawPane.addDrawItem() only
removeDrawItem : function (item) {
    if (item._drawn) item.erase();
    else {
        this.drawItems.remove(item);
    }
    delete item.drawGroup;
    delete item.drawPane;
},



// NB: no stroke and fill subelements for groups
vmlElementName:"GROUP",
_getElementVML : function (id) {

    return isc.SB.concat(
            this.drawPane.startTagVML(this.vmlElementName),
            " onmousedown='return ", this.drawPane.getID(), ".mouseDown();' ",
            " ID='", id, "' ",
            this.getAttributesVML(), ">",
            this.drawPane.endTagVML(this.vmlElementName));
},

getSvgString : function (conversionContext) {
    conversionContext = conversionContext || isc.SVGStringConversionContext.create();
    var svgString = "<g id='isc_DrawItem_" + this.drawItemID + "' transform='translate(" + this.left + "," + this.top + ")'";
    var attributesSVG = this.getAttributesSVG();
    if (attributesSVG) svgString += " " + attributesSVG;
    if (this.drawItems && this.drawItems.length) {
        svgString += ">";
        for (var i = 0; i < this.drawItems.length; ++i) {
            svgString += this.drawItems[i].getSvgString(conversionContext);
        }
        svgString += "</g>";
    } else svgString += "/>";
    return svgString;
},

draw : function () {
    if (this.drawItems == null) this.drawItems = [];
    // draw ourselves (depending on renderGroupElement,
    // may just mark as 'drawn' / set up event parent etc)
    this.Super("draw", arguments);

    // draw all children
    for (var i = 0; i < this.drawItems.length; i++) {
        // ensure drawItems[i].drawGroup is set if necessary
        this.drawItems[i].drawGroup = this;

        this.drawItems[i].draw();
    }
},

drawHandle : function () {
    if (!this.renderGroupElement) return;
    return this.Super("drawHandle", arguments);
},


drawBitmap : function (context) {

    context.save();
    // context.scale(x, y)
    // context.rotate(angle)
    context.translate(this.left, this.top);
    // same loop as in drawPane.redrawBitmapNow()

    for (var i = 0, len = this.drawItems.length; i < len; ++i) {
        var drawItem = this.drawItems[i];
        if (!drawItem.hidden) {
            drawItem.drawBitmap(context);
            drawItem._setupEventParent();
            drawItem._drawn = true;
        }
    }
    context.restore();
},

// Wipe out the drawItem line and fill attribute setters. drawGroups could conceivably
// be used to set default line and fill properties for their children, but currently they
// do not serve this purpose. If someone blindly called the superclass setters on all drawItems,
// they would error on drawGroups because e.g. there are no VML stroke and fill subelements.
// TODO expand this list as additional setters are added to DrawItem
setLineWidth : function (width) {this.logWarn("no setLineWidth")},
_setLineWidthVML : function (width) {this.logWarn("no _setLineWidthVML")},
setLineColor : function (color) {this.logWarn("no setLineColor")},
setLineOpacity : function (opacity) {this.logWarn("no setLineOpacity")},
setLinePattern : function (pattern) {this.logWarn("no setLinePattern")},
setLineCap : function (cap) {this.logWarn("no setLineCap")},
setStartArrow : function (startArrow) {this.logWarn("no setStartArrow")},
setEndArrow : function (endArrow) {this.logWarn("no setEndArrow")},
setFillColor : function (color) {this.logWarn("no setFillColor")},
setFillOpacity : function (opacity) {this.logWarn("no setFillOpacity")},


//--------------------------------------------------------------------------------
//  position/translation
//--------------------------------------------------------------------------------

//> @method drawGroup.setLeft()
// Set the left coordinate of this drawGroup +link{drawGroup.getGroupRect(),group rectangle}.
// Note that setting this attribute will not move the drawItems in this group.
//
// @param left (int) new left coordinate in pixels
// @visibility drawing
//<
setLeft : function (left) {
    if (left != null) this.left = left;
    if (this.renderGroupElement) this.setElementLeft(left);
    // Notify the 'quadTree' so we continue to get events
    if(this.item) {
        var bb = this.getBoundingBox();
        this.item.x=bb[0];
        this.item.y=bb[1];
        this.item.width=Math.abs(bb[2]-bb[0]);
        this.item.height=Math.abs(bb[3]-bb[1]);
        this.drawPane.updateQuadTree(this);
    }

},

setElementLeft : function (left) {
    if (this.drawingVML) {
        this._vmlHandle.coordorigin.x = -this.left;
    } else if (this.drawingSVG) {
        var transform = "translate(" + this.left + "," + this.top + ") "+(this._svgHandle.getAttributeNS(null, "transform") || "");
        this._svgHandle.setAttributeNS(null, "transform", transform);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

//> @method drawGroup.setTop()
// Set the top coordinate of this drawGroup +link{drawGroup.getGroupRect(),group rectangle}.
// Note that setting this attribute will not move the drawItems in this group.
//
// @param top (int) new top coordinate in pixels
// @visibility drawing
//<
setTop : function (top) {
    if (top != null) this.top = top;
    if (this.renderGroupElement) this.setElementTop(top);
    // Notify the 'quadTree' so we continue to get events
    if(this.item) {
        var bb = this.getBoundingBox();
        this.item.x=bb[0];
        this.item.y=bb[1];
        this.item.width=Math.abs(bb[2]-bb[0]);
        this.item.height=Math.abs(bb[3]-bb[1]);
        this.drawPane.updateQuadTree(this);
    }

},

setElementTop : function (top) {
    if (this.drawingVML) {
        this._vmlHandle.coordorigin.y = -this.top;
    } else if (this.drawingSVG) {
        var transform =  "translate(" + this.left + "," + this.top + ") "+(this._svgHandle.getAttributeNS(null, "transform") || "");
        this._svgHandle.setAttributeNS(null, "transform", transform);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

//> @method drawGroup.setWidth()
// Set the width of his drawGrop +link{drawGroup.getGroupRect(),group rectangle}.
// Note that setting this attribute will not move or resize the drawItems in this group.
// @param width (int) new width for the event rect
// @visibility drawing
//<
setWidth : function (width) {
    this.width = width;
    // Notify the 'quadTree' so we continue to get events
    if(this.item) {
        var bb = this.getBoundingBox();
        this.item.x=bb[0];
        this.item.y=bb[1];
        this.item.width=Math.abs(bb[2]-bb[0]);
        this.item.height=Math.abs(bb[3]-bb[1]);
        this.drawPane.updateQuadTree(this);
    }

},

//> @method drawGroup.setHeight()
// Set the height of his drawGrop +link{drawGroup.getGroupRect(),group rectangle}.
// Note that setting this attribute will not move or resize the drawItems in this group.
// @param height (int) new height for the event rect
// @visibility drawing
//<
setHeight : function (height) {
    this.height = height;
    // Notify the 'quadTree' so we continue to get events
    if(this.item) {
        var bb = this.getBoundingBox();
        this.item.x=bb[0];
        this.item.y=bb[1];
        this.item.width=Math.abs(bb[2]-bb[0]);
        this.item.height=Math.abs(bb[3]-bb[1]);
        this.drawPane.updateQuadTree(this);
    }

},

//> @method drawGroup.getGroupRect()
// This method will return an array of integers
// mapping out the coordinates (left, top, width, height) of the "group rectangle" for the group.
// This is the area of the drawPane where user interactions will fire event notifications
// on this drawGroup.
// <P>
// This is a convienence method to get the current coordinates of the
// +link{drawGroup.useGroupRect,group rectangle}.  Developers must use
// +link{drawGroup.setLeft()}, +link{drawGroup.setTop()}, +link{drawGroup.setWidth()} or
// +link{drawGroup.setHeight()} to set each coordinate directly.
// @return (Array of int) 4 element array containing left, top, width, height of the group rectangle.
// @visibility drawing
//<

getGroupRect : function () {
    return [this.left, this.top, this.width, this.height];
},

//> @method drawGroup.moveTo()
// Set both the left and top coordinate of this drawGroup +link{drawGroup.getGroupRect(),group rectangle}.
// Unlike +link{drawGroup.moveBy()}, this will not move the drawItems in this group.
//
// @param left (int) new left coordinate in pixels
// @param top (int) new top coordinate in pixels
// @visibility drawing
//<

moveTo : function (left,top) {
    this.setLeft(left);
    this.setTop(top);
    if (this.renderGroupElement) {
        this.setElementLeft(this.left);
        this.setElementTop(this.top);
    }
    // calling super will update the quadTree so events keep functioning!
    this.Super("moveTo", arguments);

},

//> @method drawGroup.moveBy()
// Move all member drawItems by the specified number of pixels. Also updates the
// +link{drawGroup.getGroupRect(),group rectangle}, moving it by the same offset.
//
// @param left (int) change to left coordinate in pixels
// @param top (int) change to top coordinate in pixels
// @visibility drawing
//<
moveBy : function (dX, dY) {
    // update the groupRect
    this.left += dX;
    this.top += dY;
    if (this.renderGroupElement) {
        this.setElementLeft(this.left);
        this.setElementTop(this.top);
    }

    // Move items.
    for(var i = 0; i < this.drawItems.length; ++i) {
        var drawItem = this.drawItems[i];
        drawItem.moveBy(dX,dY);
    }
    // calling super will update the quadTree so events keep functioning!
    this.Super("moveBy", arguments);

    this._moved(dX, dY);
},

//> @method drawGroup.rotateTo()
// Rotate each item in the group to the specified number of degrees.
//
// @param degrees (float)
// @visibility drawing
//<
rotateTo : function (degrees) {
    for (var i = 0; i < this.drawItems.length; i++) {
        var drawItem = this.drawItems[i];
        drawItem.rotateTo(degrees);
    }
},

//> @method drawGroup.rotateBy()
// Rotate each item in the group by the specified number of degrees.
//
// @param degrees (float)
// @visibility drawing
//<
rotateBy : function (degrees) {
    for(var i = 0; i < this.drawItems.length; ++i) {
        var drawItem = this.drawItems[i];
        drawItem.rotateBy(degrees);
    }
},

//> @method drawGroup.scaleBy()
// Scale all drawItem[] shapes by the x, y multipliers
// @param x (float) scale in the x direction
// @param y (float) scale in the y direction
// @visibility drawing
//<
scaleBy : function (x, y) {
    for(var i = 0; i < this.drawItems.length; ++i) {
        var drawItem = this.drawItems[i];
        drawItem.scaleBy(x,y);
    }
},

//> @method drawGroup.getCenter()
// Get the center coordinates of the event rectangle
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    return [this.left + Math.round(this.width/2), this.top + Math.round(this.height/2)];
},

//> @method drawGroup.getBoundingBox()
// Returns the left, top, (left + width), and (top + height) values
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    return [this.left, this.top, this.left+this.width, this.top+this.height];
},

// Suppress the 'isPointInPath' check - we don't render anything out by default so we this check
// is meaningless - just check for whether the event occurred in the bounding box.
checkPointInPath:false,

//> @method drawGroup.scaleTo()
// Scale the each item in the drawGroup by the x, y multipliers
// @param x (float) scale in the x direction
// @param y (float) scale in the y direction
// @visibility drawing
//<
scaleTo : function (x, y) {
    this.scale = this.scale || [];
    this.scale[0] += (this.scale[0]||0) + x;
    this.scale[1] += (this.scale[1]||0) + y;
    this.scaleBy(x, y);
}

//> @method drawGroup.dragStart() (A)
// Notification fired when the user starts to drag this drawGroup. Will only fire if
// +link{drawGroup.canDrag} is true for this group.
// <P>
// This notification will be triggered by the user
// interacting with the specified +link{getGroupRect(),group rectangle} for the group.
// <P>
// Default drag behavior will be to reposition all items in the group (and update the group
// rectangle).
//
// @visibility drawing.
//<




//> @method drawGroup.dragMove() (A)
// Notification fired for every mouseMove event triggerred while the user is dragging this
// drawGroup. Will only fire if
// +link{drawGroup.canDrag} is true for this group.
// <P>
// This notification will be triggered by the user
// interacting with the specified +link{getGroupRect(),group rectangle} for the group.
// <P>
// Default drag behavior will be to reposition all items in the group (and update the group rectangle)
//
//<

//> @method drawGroup.dragStop() (A)
// Notification fired when the user stops dragging this drawGroup. Will only fire if
// +link{drawGroup.canDrag} is true for this group.
// <P>
// This notification will be triggered by the user
// interacting with the specified +link{getGroupRect(),group rectangle} for the group.
//
//<

//> @method drawGroup.click() (A)
// @include drawItem.click()
//<

//> @method drawGroup.mouseDown() (A)
//@include drawItem.mouseDown()
//<

//> @method drawGroup.mouseUp() (A)
//@include drawItem.mouseUp()
//<

//> @method drawGroup.mouseMove() (A)
//@include drawItem.mouseMove()
//<

//> @method drawGroup.mouseOut() (A)
//@include drawItem.mouseOut()
//<

//> @method drawGroup.mouseOver() (A)
//@include drawItem.mouseOver()
//<

// end of shape events

}) // end DrawGroup.addProperties










//------------------------------------------------------------------------------------------
//> @class DrawLine
//
//  DrawItem subclass to render line segments.
//
//  @inheritsFrom DrawItem
//  @treeLocation Client Reference/Drawing/DrawItem
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

//> @object Point
// X/Y position in pixels, specified as an Array with two members, for example: [30, 50]
//
// @visibility drawing
//<
//> @attr point.x (int: 0: IR)
// The x coordinate of this point.
//
// @visibility drawing
//<
//> @attr point.y (int: 0: IR)
// The y coordinate of this point.
//
// @visibility drawing
//<

isc.defineClass("DrawLine", "DrawItem").addProperties({
    //> @attr drawLine.knobs
    // Array of control knobs to display for this item. Each +link{knobType} specified in this
    // will turn on UI element(s) allowing the user to manipulate this DrawLine.  To update the
    // set of knobs at runtime use +link{drawItem.showKnobs()} and +link{drawItem.hideKnobs()}.
    // <p>
    // DrawLine supports the
    // <var class="smartclient">"startPoint" and "endPoint"</var>
    // <var class="smartgwt">{@link com.smartgwt.client.types.KnobType#STARTPOINT} and {@link com.smartgwt.client.types.KnobType#ENDPOINT}</var>
    // knob types.
    // @include DrawItem.knobs
    //<

    //> @attr drawLine.startPoint     (Point : [0,0] : IRW)
    // Start point of the line
    //
    // @visibility drawing
    //<
    startPoint: [0,0], // NB: these arrays are shared by all instances!

    //> @attr drawLine.endPoint       (Point : [100,100] : IRW)
    // End point of the line
    //
    // @visibility drawing
    //<
    endPoint: [100,100],

    //> @attr drawLine.startLeft      (int : 0 : IR)
    // Starting left coordinate of the line.  Overrides left coordinate of +link{startPoint} if
    // both are set.
    //
    // @visibility drawing
    //<
//    startLeft:0,

    //> @attr drawLine.startTop       (int : 0 : IR)
    // Starting top coordinate of the line.  Overrides top coordinate of +link{startPoint} if
    // both are set.
    //
    // @visibility drawing
    //<
//    startTop:0,

    //> @attr drawLine.endLeft        (int : 100 : IR)
    // Ending left coordinate of the line.  Overrides left coordinate of +link{endPoint} if
    // both are set.
    //
    // @visibility drawing
    //<
//    endLeft:100,

    //> @attr drawLine.endTop         (int : 100 : IR)
    // Ending top coordinate of the line.  Overrides top coordinate of +link{endPoint} if
    // both are set.
    //
    // @visibility drawing
    //<
//    endTop:100,

    svgElementName: "line",
    vmlElementName: "LINE",

init : function () {
    this.startLeft = (this.startLeft == 0 ? 0 : (this.startLeft || this.startPoint[0]));
    this.startTop = (this.startTop == 0 ? 0 : (this.startTop || this.startPoint[1]));
    this.endLeft = (this.endLeft == 0 ? 0 : (this.endLeft || this.endPoint[0]));
    this.endTop = (this.endTop == 0 ? 0 : (this.endTop || this.endPoint[1]));
    this.Super("init");
},


//----------------------------------------
// SVG arrowhead dependencies
//----------------------------------------

// helper methods to adjust the rendered endpoints of a line to accommodate arrowheads
_getArrowAdjustedPoints : function () {
    if (this.startArrow || this.endArrow) {
        return isc.GraphMath.trimLineEnds(
            this.startLeft, this.startTop, this.endLeft, this.endTop,
            this.startArrow ? this.lineWidth*3 : 0,
            this.endArrow ? this.lineWidth*3 : 0
        );
    } else {
        return [this.startLeft, this.startTop, this.endLeft, this.endTop];
    }
},

// changing the line width or arrows will affect the size
// of the arrows, so call setStartPoint and setEndPoint to update the size of the line segment
// (setStartPoint will take care of the endPoint as well if necessary)
setLineWidth : function (width) {
    this.Super("setLineWidth", arguments);
    if (this.drawingSVG) this.setStartPoint();
},
setStartArrow : function (startArrow) {
    this.Super("setStartArrow", arguments);
    if (this.drawingSVG) this.setStartPoint();
},
setEndArrow : function (endArrow) {
    this.Super("setEndArrow", arguments);
    // NB: cannot use setStartPoint here, since we might be clearing endArrow
    if (this.drawingSVG) this.setEndPoint();
},


//----------------------------------------
//  DrawLine renderers
//----------------------------------------

getAttributesVML : function () {
    return isc.SB.concat(
          "FROM='", this.startLeft, " ", this.startTop,
            "' TO='", this.endLeft, " ", this.endTop,
            "'");
},

getAttributesSVG : function () {
    // SVG lines must be shortened to accommodate arrowheads
    var points = this._getArrowAdjustedPoints();
    return  "x1='" + points[0] +
            "' y1='" + points[1] +
            "' x2='" + points[2] +
            "' y2='" + points[3] +
            "'";
},

drawBitmapPath : function (context) {

    var offset = (this.lineWidth == 0 || parseInt(this.lineWidth) % 2) == 1 ? 0.5 : 0,
        startLeft = parseFloat(this.startLeft)+offset,
        startTop = parseFloat(this.startTop)+offset,
        endLeft = parseFloat(this.endLeft)+offset,
        endTop = parseFloat(this.endTop)+offset,
        angle, arrowDelta = 10, originX, originY;
    if (this.startArrow == "open") {
        context.save();
        context.beginPath();
        context.strokeStyle = this.lineColor;
        context.lineWidth = this.lineWidth;
        context.lineCap = "round";
        angle = this.computeAngle(startLeft,startTop,endLeft,endTop);
        originX = startLeft;
        originY = startTop;
        context.scale(1,1);
        context.translate(originX, originY);
        context.rotate(angle*Math.PI/180);
        this.bmMoveTo(arrowDelta,-arrowDelta, context);
        this.bmLineTo(0,0, context);
        this.bmLineTo(arrowDelta,arrowDelta, context);
        context.stroke();
        context.restore();
    } else if (this.startArrow == "block") {
        context.save();
        context.beginPath();
        context.fillStyle = this.lineColor;
        context.lineWidth = this.lineWidth;
        context.lineCap = "round";
        angle = this.computeAngle(startLeft,startTop,endLeft,endTop);
        originX = startLeft;
        originY = startTop;
        context.translate(originX, originY);
        context.rotate(angle*Math.PI/180);
        this.bmMoveTo(arrowDelta,-arrowDelta, context);
        this.bmLineTo(0,0, context);
        this.bmLineTo(arrowDelta,arrowDelta, context);
        context.closePath();
        context.fill();
        context.stroke();
        context.restore();
    }
    if (this.endArrow == "open") {
        context.save();
        context.beginPath();
        context.strokeStyle = this.lineColor;
        context.lineWidth = this.lineWidth;
        context.lineCap = "round";
        angle = this.computeAngle(startLeft,startTop,endLeft,endTop);
        originX = endLeft;
        originY = endTop;
        context.translate(originX, originY);
        context.rotate(angle*Math.PI/180);
        this.bmMoveTo(-arrowDelta,arrowDelta, context);
        this.bmLineTo(0,0, context);
        this.bmLineTo(-arrowDelta,-arrowDelta, context);
        context.stroke();
        context.restore();
    } else if (this.endArrow == "block") {
        context.save();
        context.beginPath();
        context.fillStyle = this.lineColor;
        context.lineWidth = this.lineWidth;
        context.lineCap = "round";
        angle = this.computeAngle(startLeft,startTop,endLeft,endTop);
        originX = endLeft;
        originY = endTop;
        context.translate(originX, originY);
        context.rotate(angle*Math.PI/180);
        this.bmMoveTo(-arrowDelta,arrowDelta, context);
        this.bmLineTo(0,0, context);
        this.bmLineTo(-arrowDelta,-arrowDelta, context);
        context.closePath();
        context.fill();
        context.restore();
    }
    if(this.linePattern.toLowerCase() !== "solid") {
        this._drawLinePattern(startLeft, startTop, endLeft, endTop, context);
    } else {
        this.bmMoveTo(this.startLeft, this.startTop, context);
        this.bmLineTo(this.endLeft, this.endTop, context);
    }
},

//----------------------------------------
//  DrawLine attribute setters
//----------------------------------------

// NOTE: setStartPoint/EndPoint doc is @included, use generic phrasing

//> @method drawLine.setStartPoint()
// Update the startPoint
//
// @param left (int) left coordinate for start point, in pixels
// @param top (int) top coordinate for start point, in pixels
// @visibility drawing
//<
setStartPoint : function (left, top) {
    if (isc.isAn.Array(left)) {
        top = left[1];
        left = left[0];
    }
    if (left != null) this.startLeft = left;
    if (top != null) this.startTop = top;
    if (this.drawingVML) {
        this._vmlHandle.from = this.startLeft + " " + this.startTop;
    } else if (this.drawingSVG) {
        // SVG lines must be shortened to accommodate arrowheads
        var points = this._getArrowAdjustedPoints();
        this._svgHandle.setAttributeNS(null, "x1", points[0]);
        this._svgHandle.setAttributeNS(null, "y1", points[1]);
        if (this.endArrow) { // changing startPoint also changes the angle of the endArrow
            this._svgHandle.setAttributeNS(null, "x2", points[2]);
            this._svgHandle.setAttributeNS(null, "y2", points[3]);
        }
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.updateControlKnobs();
},

//> @method drawLine.setEndPoint()
// Update the endPoint
//
// @param left (int) left coordinate for end point, in pixels
// @param top (int) top coordinate for end point, in pixels
// @visibility drawing
//<
setEndPoint : function (left, top) {
    if (isc.isAn.Array(left)) {
        top = left[1];
        left = left[0];
    }
    if (left != null) this.endLeft = left;
    if (top != null) this.endTop = top;
    if (this.drawingVML) {
        this._vmlHandle.to = this.endLeft + " " + this.endTop;
    } else if (this.drawingSVG) {
        // SVG lines must be shortened to accommodate arrowheads
        var points = this._getArrowAdjustedPoints();
        this._svgHandle.setAttributeNS(null, "x2", points[2]);
        this._svgHandle.setAttributeNS(null, "y2", points[3]);
        if (this.startArrow) { // changing endPoint also changes the angle of the startArrow
            this._svgHandle.setAttributeNS(null, "x1", points[0]);
            this._svgHandle.setAttributeNS(null, "y1", points[1]);
        }
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.updateControlKnobs();
},

//> @method drawLine.getBoundingBox()
// Returns the start, end points
//
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    var x1 = this.startPoint[0],
        y1 = this.startPoint[1],
        x2 = this.endPoint[0],
        y2 = this.endPoint[1];
    var left = Math.min(x1,x2),
        right = Math.max(x1, x2),
        top = Math.min(y1,y2),
        bottom = Math.max(y1,y2);
    return [left,top,right,bottom];
},

//> @method drawLine.getCenter()
// Get the center coordinates of the line
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    return [this.startPoint[0] + Math.round((this.endPoint[0]-this.startPoint[0])/2),
      this.startPoint[1] + Math.round((this.endPoint[1]-this.startPoint[1])/2)];
},

isPointInPath : function (x, y) {
    if (!this.isInBounds(x, y)) {
        return false;
    }

    var tolerance = Math.max(this.lineWidth / 2, 2);
    return isc.Math.euclideanDistanceToLine(this.startLeft, this.startTop, this.endLeft, this.endTop, x, y) < tolerance;
},

showResizeKnobs : null,
hideResizeKnobs : null,

showMoveKnobs : null,
hideMoveKnobs : null,

// Support controlKnobs for start/endPoints
// (Documented under DrawKnobs type definition)
showStartPointKnobs : function () {
    if (this._startKnob != null && !this._startKnob.destroyed) return;

    this._startKnob = this.createAutoChild("startKnob", {
        _constructor: "DrawKnob",
        x: this.startLeft,
        y: this.startTop,
        drawPane: this.drawPane,
        _targetShape: this,

        updatePoints : function (x, y, dx, dy, state) {
            var drawItem = this._targetShape;
            var startState = (state == "start"),
                moveState = (state == "move"),
                stopState = (state == "stop");

            var fixedPoint;
            if (startState) {
                fixedPoint = drawItem._dragStartPointFixedPoint = drawItem.endPoint.duplicate();
            } else {
                fixedPoint = drawItem._dragStartPointFixedPoint;
            }

            if (drawItem.keepInParentRect) {
                var box = drawItem._getParentRect(),
                    point = drawItem._intersectLineSegmentBox(fixedPoint, [x, y], box);

                if (point == null) {
                    if (stopState) {
                        delete drawItem._dragStartPointFixedPoint;
                    }
                    return false;
                } else {
                    x = point[0];
                    y = point[1];
                }
            } else if (stopState) {
                delete drawItem._dragStartPointFixedPoint;
            }

            drawItem.setStartPoint(x, y);
        }
    });
},

// Computes the closest point to `point` on the line segment from `fixedPoint` to `point` that
// intersects a bounding box.  `point` is modified in-place, so duplicate() it before calling
// this function, if necessary.
_intersectLineSegmentBox : function (fixedPoint, point, box) {
    var slope = new Array(2);
    slope[0] = 1 / (slope[1] = (point[1] - fixedPoint[1]) / (point[0] - fixedPoint[0]));

    // Loop over the four sides of the box.  On each iteration, find the intersection between
    // the constant-x or -y line that forms a side of the box and the line segment from
    // fixedPoint to point.
    for (var m = 0; m < 4; ++m) {
        var k = m % 2, l = (k + 1) % 2, s = (m < 2 ? -1 : 1), bound = box[s + 1 + k];
        var fixedPointWithinBound = !(s * fixedPoint[k] > s * bound),
            pointWithinBound = !(s * point[k] > s * bound);

        if (!pointWithinBound && fixedPointWithinBound) {

            point[k] = bound;
            point[l] = fixedPoint[l] + (bound - fixedPoint[k]) * slope[l];

        } else if (!(pointWithinBound || fixedPointWithinBound)) {
            // The line does not intersect the box, so this drag cannot be allowed.
            return null;
        }
    }
    return point;
},

hideStartPointKnobs : function () {
    if (this._startKnob) {
        this._startKnob.destroy();
        delete this._startKnob;
    }
},

showEndPointKnobs : function () {
    if (this._endKnob != null && !this._endKnob.destroyed) return;

    this._endKnob = this.createAutoChild("endKnob", {
        _constructor: "DrawKnob",
        x: this.endLeft,
        y: this.endTop,
        drawPane: this.drawPane,
        _targetShape: this,

        updatePoints : function (x, y, dx, dy, state) {
            var drawItem = this._targetShape,
                startState = (state == "start"),
                moveState = (state == "move"),
                stopState = (state == "stop"),
                fixedPoint;

            if (startState) {
                fixedPoint = drawItem._dragEndPointFixedPoint = drawItem.startPoint.duplicate();
            } else {
                fixedPoint = drawItem._dragEndPointFixedPoint;
            }

            if (drawItem.keepInParentRect) {
                var box = drawItem._getParentRect(),
                    point = drawItem._intersectLineSegmentBox(fixedPoint, [x, y], box);

                if (point == null) {
                    if (stopState) {
                        delete drawItem._dragEndPointFixedPoint;
                    }
                    return false;
                } else {
                    x = point[0];
                    y = point[1];
                }
            } else if (stopState) {
                delete drawItem._dragEndPointFixedPoint;
            }

            drawItem.setEndPoint(x, y);
        }
    });
},

hideEndPointKnobs : function () {
    if (this._endKnob) {
        this._endKnob.destroy();
        delete this._endKnob;
    }
},

//> @method drawLine.moveBy()
// Move both the start and end points of the line by a relative amount.
//
// @param left (int) change to left coordinate in pixels
// @param top (int) change to top coordinate in pixels
// @visibility drawing
//<
moveBy : function (x, y) {
    this.startLeft += x;
    this.startTop += y;
    this.endLeft += x;
    this.endTop += y;
    this.startPoint[0] = this.startLeft;
    this.startPoint[1] = this.startTop;
    this.endPoint[0] = this.endLeft;
    this.endPoint[1] = this.endTop;
    if (this.drawingVML) {
        this._vmlHandle.from = this.startLeft + " " + this.startTop;
        this._vmlHandle.to = this.endLeft + " " + this.endTop;
    } else if (this.drawingSVG) {
        // could cache the adjusted points, since their relative positions do not change
        var points = this._getArrowAdjustedPoints();
        this._svgHandle.setAttributeNS(null, "x1", points[0]);
        this._svgHandle.setAttributeNS(null, "y1", points[1]);
        this._svgHandle.setAttributeNS(null, "x2", points[2]);
        this._svgHandle.setAttributeNS(null, "y2", points[3]);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("moveBy",arguments);
},

//> @method drawLine.moveTo()
// Move both the start and end points of the line, such that the startPoint ends up at the
// specified coordinate and the line length and angle are unchanged.
//
// @param left (int) new startLeft coordinate in pixels
// @param top (int) new startTop coordinate in pixels
// @visibility drawing
//<
moveTo : function (left, top) {
    this.moveBy(left - this.startLeft, top - this.startTop);
},

updateControlKnobs : function () {
    // update the position of our start/end point knobs when we update our other control points
    this.Super("updateControlKnobs", arguments);
    if (this._startKnob) {
        var left = this.startLeft,
            top = this.startTop,
            screenCoords = this.drawPane.drawing2screen([left,top,0,0]);
        this._startKnob.setCenterPoint(screenCoords[0], screenCoords[1]);
    }
    if (this._endKnob) {
        var left = this.endLeft,
            top = this.endTop,
            screenCoords = this.drawPane.drawing2screen([left,top,0,0]);
        this._endKnob.setCenterPoint(screenCoords[0], screenCoords[1]);
    }
}

}) // end DrawLine.addProperties










//------------------------------------------------------------------------------------------
//> @class DrawRect
//
//  DrawItem subclass to render rectangle shapes, optionally with rounded corners.
//
//  @inheritsFrom DrawItem
//  @treeLocation Client Reference/Drawing/DrawItem
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

isc.defineClass("DrawRect", "DrawItem").addProperties({
    //>    @attr drawRect.left (int : 0 : IRW)
    // Left coordinate in pixels relative to the DrawPane.
    // @visibility drawing
    //<
    left:0,

    //>    @attr drawRect.top (int : 0 : IRW)
    // Top coordinate in pixels relative to the DrawPane.
    // @visibility drawing
    //<
    top:0,

    // NOTE: width/height @included elsewhere so should be phrased generically

    //> @attr drawRect.width        (int : 100 : IRW)
    // Width in pixels.
    // @visibility drawing
    //<
    width:100,

    //> @attr drawRect.height       (int : 100 : IRW)
    // Height in pixels.
    // @visibility drawing
    //<
    height:100,

    //> @attr drawRect.rounding      (float : 0 : IR)
    // Rounding of corners, from 0 (square corners) to 1.0 (shorter edge is a semicircle).
    //
    // @visibility drawing
    //<
    rounding:0,

    //> @attr drawRect.lineCap     (LineCap : "butt" : IRW)
    // Style of drawing the endpoints of a line.
    // <P>
    // Note that for dashed and dotted lines, the lineCap style affects each dash or dot.
    //
    // @group line
    // @visibility drawing
    //<
    lineCap: "butt",

    svgElementName: "rect",
    vmlElementName: "ROUNDRECT",


//----------------------------------------
//  DrawRect renderers
//----------------------------------------

getAttributesVML : function () {
    var left = this.left,
        top = this.top,
        width = this.width,
        height = this.height;
    if (width < 0) {
        left += width;
        width = -width;
    }
    if (height < 0) {
        top += height;
        height = -height;
    }

    return isc.SB.concat(
        "STYLE='position:absolute; left:", left,
            "px; top:", top,
            "px; width:", width,
            "px; height:", height, "px;'",

            " ARCSIZE='"+this.rounding/2+"'");
},

getAttributesSVG : function () {
    var left = this.left,
        top = this.top,
        width = this.width,
        height = this.height;
    if (width < 0) {
        left += width;
        width = -width;
    }
    if (height < 0) {
        top += height;
        height = -height;
    }
    return isc.SB.concat(
        "x='", left, "' y='", top, "' width='", width, "' height='", height, "'",
        (this.rounding ? (" rx='" + (this.rounding * Math.min(width, height) / 2) + "'") : ""));
},

drawBitmapPath : function (context) {
    var left = this.left,
        top = this.top,
        width = this.width,
        height = this.height;
    if (width < 0) {
        left += width;
        width = -width;
    }
    if (height < 0) {
        top += height;
        height = -height;
    }
    var right = left + width,
        bottom = top + height;

    if (this.rounding == 0) {
        this.bmMoveTo(left, top, context);
        if (this.linePattern.toLowerCase() !== "solid") {
            this._drawLinePattern(left, top, right, top, context);
            this._drawLinePattern(right, top, right, bottom, context);
            this._drawLinePattern(right, bottom, left, bottom, context);
            this._drawLinePattern(left, bottom, left, top, context);
        } else {
            this.bmLineTo(right, top);
            this.bmLineTo(right, bottom);
            this.bmLineTo(left, bottom);
            this.bmLineTo(left, top);
        }
    } else {

        var r = (this.rounding * Math.min(width, height) / 2);
        this.bmMoveTo(left + r, top);
        this.bmLineTo(right - r, top);
        this.bmQuadraticCurveTo(right, top, right, top + r);
        this.bmLineTo(right, bottom - r);
        this.bmQuadraticCurveTo(right, bottom, right - r, bottom);
        this.bmLineTo(left + r, bottom);
        this.bmQuadraticCurveTo(left, bottom, left, bottom - r);
        this.bmLineTo(left, top + r);
        this.bmQuadraticCurveTo(left, top, left + r, top);
    }
    context.closePath();

},

//----------------------------------------
//  DrawRect attribute setters
//----------------------------------------

//> @method drawRect.setCenter()
// Move the drawRect such that it is centered over the specified coordinates.
// @param left (int) left coordinate for new center position
// @param top (int) top coordinate for new center postiion
// @visibility drawing
//<
setCenter : function (left, top) {
    if (isc.isAn.Array(left)) {
        top = left[1];
        left = left[0];
    }

    if (left != null) left = left - Math.round(this.width/2);
    if (top != null) top = top - Math.round(this.height/2);

    this.moveTo(left,top);
},

//> @method drawRect.getCenter()
// Get the center coordinates of the rectangle
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    return [this.left + Math.round(this.width/2), this.top + Math.round(this.height/2)];
},

//> @method drawRect.getBoundingBox()
// Returns the top, left, top+height, left+width
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    return [this.left, this.top, this.left+this.width, this.top+this.height];
},

//> @method drawRect.moveBy()
// Move the drawRect by the specified delta
// @param dX (int) number of pixels to move horizontally
// @param dY (int) number of pixels to move vertically
// @visibility drawing
//<
moveBy : function (dX, dY) {
    this.left += dX;
    this.top += dY;
    if (this.drawingVML) {
        this._vmlHandle.style.left = this.left;
        this._vmlHandle.style.top = this.top;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "x", this.left);
        this._svgHandle.setAttributeNS(null, "y", this.top);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("moveBy",arguments);
    this._moved(dX, dY);
},

//> @method drawRect.moveTo()
// Move the drawRect to the specified position
// @param left (int) new left coordinate
// @param top (int) new top coordinate
// @visibility drawing
//<
moveTo : function (left,top) {
    this.moveBy(left - this.left, top - this.top);
},

//> @method drawRect.setLeft()
// Set the left coordinate of the drawRect
// @param left (integer) new left coordinate
// @visibility drawing
//<
setLeft : function (left) {
    this.moveTo(left, this.top);
},

//> @method drawRect.setTop()
// Set the top coordinate of the drawRect
// @param top (integer) new top coordinate
// @visibility drawing
//<
setTop : function (top) {
    this.moveTo(this.left, top);
},

//> @method drawRect.resizeTo()
// Resize to the specified size
// @param width (int) new width
// @param height (int) new height
// @visibility drawing
//<
resizeTo : function (width,height) {
    var dX = 0, dY = 0;
    if (width != null) dX = width - this.width;
    if (height != null) dY = height - this.height;

    this.resizeBy(dX,dY);
},

//> @method drawRect.resizeBy()
// Resize by the specified delta
// @param dX (int) number of pixels to resize by horizontally
// @param dY (int) number of pixels to resize by vertically
// @visibility drawing
//<
resizeBy : function (dX, dY) {
    if (dX != null) this.width += dX;
    if (dY != null) this.height += dY;

    if (this.drawingVML) {
        this._vmlHandle.style.width = this.width;
        this._vmlHandle.style.height = this.height;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "width", this.width);
        this._svgHandle.setAttributeNS(null, "height", this.height);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("resizeBy",arguments);
    this._resized(dX, dY);
},


//> @method drawRect.setWidth()
// Set the width of the drawRect
// @param width (integer) new width
// @visibility drawing
//<
setWidth : function (width) {
    this.resizeTo(width);
},

//> @method drawRect.setHeight()
// Set the height of the drawRect
// @param height (integer) new height
// @visibility drawing
//<
setHeight : function (height) {
    this.resizeTo(null, height);
},

//> @method drawRect.setRect()
// Move and resize the drawRect to match the specified coordinates and size.
// @param left (int) new left coordinate
// @param top (int) new top coordinate
// @param width (int) new width
// @param height (int) new height
// @visibility drawing
//<
setRect : function (left,top,width,height) {
    this.moveTo(left,top);
    this.resizeTo(width,height);
},


//> @method drawRect.setRounding()
// Setter method for +link{drawRect.rounding}
// @param rounding (float) new rounding value. Should be between zero (a rectangle) and 1 (shorter
//   edge is a semicircle)
// @visibility drawing
//<
setRounding : function (rounding) {
    this.rounding = rounding;
    if (this.drawingVML) {

        this.erase();
        this.draw();

    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "rx", (this.rounding ?
            (this.rounding * Math.min(Math.abs(this.width), Math.abs(this.height)) / 2) :
            null));
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
}

}); // end DrawRect.addProperties










//------------------------------------------------------------------------------------------
//> @class DrawOval
//
//  DrawItem subclass to render oval shapes, including circles.
//
//  @inheritsFrom DrawItem
//  @treeLocation Client Reference/Drawing/DrawItem
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

isc.defineClass("DrawOval", "DrawItem").addProperties({

    //>    @attr drawOval.left (int : 0 : IRW)
    // @include drawRect.left
    //<
    left:0,

    //>    @attr drawOval.top (int : 0 : IRW)
    // @include drawRect.top
    //<
    top:0,

    //> @attr drawOval.width (int : 100 : IRW)
    // @include drawRect.width
    //<
    width:100,

    //> @attr drawOval.height (int : 100 : IRW)
    // @include drawRect.height
    //<
    height:100,

    //> @attr drawOval.centerPoint    (Point : null : IRW)
    // Center point of the oval.  If unset, derived from left/top/width/height.
    // @visibility drawing
    //<

    //> @attr drawOval.radius         (int : null : IRW)
    // Radius of the oval.  If unset, horizontal and vertical radii are derived from width and
    // height
    // @visibility drawing
    //<

//  rx
//  ry
    svgElementName: "ellipse",
    vmlElementName: "OVAL",

// TODO review init property precedence and null/zero check
init : function () {
    // convert rect to center/radii
    if (!this.radius) this._deriveCenterPointFromRect();
    else this._deriveRectFromRadius();

    this.Super("init");
},

// Helpers to synch rect coords with specified centerPoint / radius and vice versa
_deriveRectFromRadius : function () {
    // convert center/radii to rect
    if (this.rx == null) this.rx = this.radius;
    if (this.ry == null) this.ry = this.radius;
    this.width = this.rx * 2;
    this.height = this.ry * 2;
    // support either centerpoint or direct left/top
    if (this.centerPoint != null) {
        this.left = this.centerPoint[0] - this.width/2;
        this.top = this.centerPoint[1] - this.height/2;
    } else {
        this.centerPoint = [];
        this.centerPoint[0] = this.left + this.width/2;
        this.centerPoint[1] = this.top + this.height/2;
    }
},
_deriveCenterPointFromRect : function () {
    this.centerPoint = [];
    this.centerPoint[0] = this.left + this.width/2;
    this.centerPoint[1] = this.top + this.height/2;
    this.rx = this.width/2;
    this.ry = this.height/2;
},
//----------------------------------------
//  DrawOval renderers
//----------------------------------------

getAttributesVML : function () {
    // POSITION and SIZE attributes from VML spec did not work
    return isc.SB.concat(
        "STYLE='position:absolute;left:", this.left,
            "px;top:", this.top,
            "px;width:", this.width,
            "px;height:", this.height, "px;'");
},

getAttributesSVG : function () {
    return  "cx='" + this.centerPoint[0] +
            "' cy='" + this.centerPoint[1] +
            "' rx='" + this.rx +
            "' ry='" + this.ry +
            "'"
},

//> @method drawOval.getBoundingBox()
// Returns the top, left, top+height, left+width
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    return [this.left, this.top, this.left+this.width, this.top+this.height];
},

drawBitmapPath : function (context) {
    var kappa = 0.552284749831; // 4 * (sqrt(2) - 1) / 3
    var rx = this.rx;
    var ry = this.ry;
    var cx = this.centerPoint[0];
    var cy = this.centerPoint[1];
    context.moveTo(cx, cy - ry);
    context.bezierCurveTo(cx + (kappa * rx), cy - ry,  cx + rx, cy - (kappa * ry), cx + rx, cy);
    context.bezierCurveTo(cx + rx, cy + (kappa * ry), cx + (kappa * rx), cy + ry, cx, cy + ry);
    context.bezierCurveTo(cx - (kappa * rx), cy + ry, cx - rx, cy + (kappa * ry), cx - rx, cy);
    context.bezierCurveTo(cx - rx, cy - (kappa * ry), cx - (kappa * rx), cy - ry, cx, cy - ry);
    context.closePath();
},

//----------------------------------------
//  DrawOval attribute setters
//----------------------------------------

//> @method drawOval.setCenterPoint()
// Change the center point for this oval.
// @param left (int) left coordinate
// @param top (int) top coordinate
// @visibility drawing
//<
setCenterPoint : function (left, top) {
    if (isc.isAn.Array(left)) {
        top = left[1];
        left = left[0];
    }
    var dX = 0, dY = 0;
    if (left != null) dX = left - this.centerPoint[0];
    if (top != null) dY = top - this.centerPoint[1];

    this.moveBy(dX,dY);
},


//> @method drawOval.moveBy()
// Move the drawOval by the specified delta
// @param dX (int) number of pixels to move horizontally
// @param dY (int) number of pixels to move vertically
// @visibility drawing
//<
moveBy : function (dX, dY) {
    if (dX != null) this.centerPoint[0] += dX;
    if (dY != null) this.centerPoint[1] += dY;

    // synch up rect coords
    this._deriveRectFromRadius();
    if (this.drawingVML) {
        // POSITION and SIZE attributes from VML spec did not work
        this._vmlHandle.style.left = this.centerPoint[0] - this.rx;
        this._vmlHandle.style.top = this.centerPoint[1] - this.ry;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "cx", this.centerPoint[0]);
        this._svgHandle.setAttributeNS(null, "cy", this.centerPoint[1]);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("moveBy",arguments);
    this._moved(dX, dY);
},

//> @method drawOval.moveTo()
// Move the drawOval to the specified left/top position. You may also call
// +link{drawOval.setCenterPoint} to reposition the oval around a new center position.
// @param left (int) new left coordinate
// @param top (int) new top coordinate
// @visibility drawing
//<
moveTo : function (left,top) {
    this.moveBy(left - this.left, top - this.top);
},

//> @method drawOval.setLeft()
// Set the left coordinate of the drawOval
// @param left (integer) new left coordinate
// @visibility drawing
//<
setLeft : function (left) {
    this.moveTo(left);
},

//> @method drawOval.setTop()
// Set the top coordinate of the drawOval
// @param top (integer) new top coordinate
// @visibility drawing
//<
setTop : function (top) {
    this.moveTo(null,top);
},


//> @method drawOval.resizeBy()
// Resize by the specified delta. Note that the resize will occur from the current top/left
// coordinates, meaning the center positon of the oval may change. You may also use
// +link{drawOval.setRadii()} to change the radius in either direction without modifying the
// centerpoint.
// @param dX (int) number of pixels to resize by horizontally
// @param dY (int) number of pixels to resize by vertically
// @visibility drawing
//<
// @param fromCenter (boolean) internal parameter used by setRadii so we can have a single
//  codepath to handle resizing. If passed, resize from the center, not from the top left coordinate
resizeBy : function (dX, dY, fromCenter) {
    if (dX != null) this.width += dX;
    if (dY != null) this.height += dY;

    if (fromCenter) {
        if (dX != null) this.left += Math.round(dX / 2);
        if (dY != null) this.top += Math.round(dY / 2);
    }

    // Synch up the radius settings
    this._deriveCenterPointFromRect();

    if (this.drawingVML) {
        this._vmlHandle.style.width = this.width;
        this._vmlHandle.style.height = this.height;
        if (fromCenter) {
            this._vmlHandle.style.left = this.left;
            this._vmlHandle.style.top = this.top;
        }
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "rx", this.rx);
        this._svgHandle.setAttributeNS(null, "ry", this.ry);
        if (!fromCenter) {
            this._svgHandle.setAttributeNS(null, "cx", this.centerPoint[0]);
            this._svgHandle.setAttributeNS(null, "cy", this.centerPoint[1]);
        }
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("resizeBy",arguments);
    this._resized(dX, dY);
    if (fromCenter) this._moved(dX / 2, dY / 2);
},

//> @method drawOval.resizeTo()
// Resize to the specified size. Note that the resize will occur from the current top/left
// coordinates, meaning the center positon of the oval may change. You may also use
// +link{drawOval.setRadii()} to change the radius in either direction without modifying the
// centerpoint.
// @param width (int) new width
// @param height (int) new height
// @visibility drawing
//<
// @param fromCenter (boolean) keep the current center point
resizeTo : function (width,height, fromCenter) {
    var dX = 0, dY = 0;
    if (width != null) dX = width - this.width;
    if (height != null) dY = height - this.height;

    this.resizeBy(dX,dY, fromCenter);
},


//> @method drawOval.setWidth()
// Set the width of the drawOval
// @param width (integer) new width
// @visibility drawing
//<
setWidth : function (width) {
    this.resizeTo(width);
},

//> @method drawOval.setHeight()
// Set the height of the drawOval
// @param height (integer) new height
// @visibility drawing
//<
setHeight : function (height) {
    this.resizeTo(null, height);
},

//> @method drawOval.setRect()
// Move and resize the drawOval to match the specified coordinates and size.
// @param left (int) new left coordinate
// @param top (int) new top coordinate
// @param width (int) new width
// @param height (int) new height
// @visibility drawing
//<
setRect : function (left,top,width,height) {
    this.moveTo(left,top);
    this.resizeTo(width,height);
},

//> @method drawOval.setRadii()
// Resize the drawOval by setting its horizontal and vertical radius, and retaining its current
// center point.
// @param rx (int) new horizontal radius
// @param ry (int) new vertical radius
// @visibility drawing
//<
setRadii : function (rx, ry) {
    if (isc.isAn.Array(rx)) {
        ry = rx[1];
        rx = rx[0];
    }
    var width,height;
    if (rx != null) width = 2*rx;
    if (ry != null) height = 2*ry;
    // use resizeTo, with the additional coordinate to retain the current center point. This
    // will give us a consistent code-path for resizes
    this.resizeTo(width,height, true);
},

//> @method drawOval.setRadius()
// Resize the drawOval by setting its radius, and retaining its current center point.
// @param radius (integer) new radius. This will be applied on both axes, meaning calling this
//  method will always result in the drawOval being rendered as a circle
// @visibility drawing
//<
setRadius : function (radius) {
    this.setRadii(radius,radius);
},

//> @method drawOval.setOval()
// Resize and reposition the drawOval by setting its radius, and centerPoint.
// @param cx (int) new horizontal center point coordinate
// @param cy (int) new vertical center point coordinate
// @param rx (int) new horizontal radius
// @param ry (int) new vertical radius
// @visibility drawing
//<
setOval : function (cx, cy, rx, ry) {
    this.setCenterPoint(cx,cy);
    this.setRadii(rx,ry);
},

//> @method drawOval.getCenter()
// Get the center coordinates of the circle
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    return this.centerPoint.slice();
}


}) // end DrawOval.addProperties


//------------------------------------------------------------------------------------------
//> @class DrawSector
//
//  DrawItem subclass to render Pie Slices.
//
//  @inheritsFrom DrawItem
//  @treeLocation Client Reference/Drawing/DrawItem
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

// Typical SVG for this:
// <path d="M300,200 h-150 a150,150 0 1,0 150,-150 z" fill="red" stroke="blue" stroke-width="5" />
// (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+

isc.defineClass("DrawSector", "DrawItem").addProperties({
    //> @attr drawSector.knobs
    // <b>NOTE:</b> DrawSector items do not support knobs.
    // @include DrawItem.knobs
    //<

    //> @attr drawSector.centerPoint     (Point : [0,0] : IRW)
    // Center point of the sector
    // @visibility drawing
    //<
    centerPoint: [0,0],

    //> @attr drawSector.startAngle      (float: 0.0 : IR)
    // Start angle of the sector in degrees.
    // @visibility drawing
    //<
    startAngle: 0.0,

    //> @attr drawSector.endAngle      (float: 20.0 : IR)
    // End angle of the sector in degrees.
    // @visibility drawing
    //<
    endAngle: 20.0,

    //> @attr drawSector.radius         (int : 100: IR)
    // Radius of the sector.
    // @visibility drawing
    //<
    radius: 100,

    svgElementName: "path",
    vmlElementName: "SHAPE",

init : function () {
    this.Super("init");
},

//> @method drawSector.getBoundingBox()
// Returns the centerPoint endPoint
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    var convert = Math.PI / 180,
        centerPoint = this.centerPoint,
        radius = this.radius,
        startAngle = this.startAngle,
        endAngle = this.endAngle;

    if (!(0 <= startAngle && startAngle < 360)) {
        startAngle = (360 + (startAngle % 360)) % 360;
    }
    if (!(0 <= endAngle && endAngle < 360)) {
        endAngle = (360 + (endAngle % 360)) % 360;
    }

    var wrap = (startAngle > endAngle),
        minSin = 0, maxSin = 0, minCos = 0, maxCos = 0;
    if (wrap ? (startAngle < 270 || 270 < endAngle) : (startAngle < 270 && 270 < endAngle)) {
        minSin = -1;
    } else {
        minSin = Math.min(0, Math.sin(convert * startAngle), Math.sin(convert * endAngle));
    }
    if (wrap ? (startAngle < 90 || 90 < endAngle) : (startAngle < 90 && 90 < endAngle)) {
        maxSin = 1;
    } else {
        maxSin = Math.max(0, Math.sin(convert * startAngle), Math.sin(convert * endAngle));
    }
    if (wrap ? (startAngle < 180 || 180 < endAngle) : (startAngle < 180 && 180 < endAngle)) {
        minCos = -1;
    } else {
        minCos = Math.min(0, Math.cos(convert * startAngle), Math.cos(convert * endAngle));
    }
    if (wrap) {
        maxCos = 1;
    } else {
        maxCos = Math.max(0, Math.cos(convert * startAngle), Math.cos(convert * endAngle));
    }

    return [
        centerPoint[0] + radius * minCos,
        centerPoint[1] + radius * minSin,
        centerPoint[0] + radius * maxCos,
        centerPoint[1] + radius * maxSin];
},

showResizeKnobs : null,
hideResizeKnobs : null,

showMoveKnobs : null,
hideMoveKnobs : null,


_normalizeLinearGradient : function (def) {
    var center = this.centerPoint,
        radius = this.radius,
        boundingBox = [center[0], center[1], center[0] + radius, center[1] + radius];
    return isc.DrawItem._normalizeLinearGradient(def, boundingBox);
},
_normalizeRadialGradient : function (def) {
    var center = this.getCenter(),
        radius = this.radius,
        boundingBox = [center[0], center[1], center[0] + radius, center[1] + radius];
    return isc.DrawItem._normalizeRadialGradient(def, boundingBox, center);
},

//> @method drawSector.getCenter()
// return the center point
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    return this.centerPoint.slice();
},

getAttributesVML : function () {
    var startAngle = -this.startAngle;
    var totalAngle = this.endAngle - this.startAngle;
    var left, top, width, height;
    left = "0px";
    top = "0px";
    width = this.drawPane.width;
    height = this.drawPane.height;
    var style = "STYLE='position:absolute;top:"+top+";left:"+left+";width:"+width+"px;height:"+height+"px;' coordsize='"+width+","+height+"'";
    var path = "path='m" + Math.round(this.centerPoint[0]) + "," + Math.round(this.centerPoint[1]);
    path += " ae" + Math.round(this.centerPoint[0]) + "," + Math.round(this.centerPoint[1]);
    path += " " + Math.round(this.radius) + "," + Math.round(this.radius) + " ";
    path += Math.round(startAngle * 65536) + "," + Math.round(-totalAngle * 65536) + " x e'";
    return style + path;
},

getAttributesSVG : function () {
    return "d='" + this.getPathSVG() + "'";
},

getPathSVG : function () {
    var angle = this.endAngle-this.startAngle+1;
    var radians = angle*Math.PI/180.0;
    var rotation = this.startAngle*Math.PI/180.0;
    var xstart = this.radius;
    var ystart = 0.0;
    var xstartrotated = this.centerPoint[0] + xstart*Math.cos(rotation);
    var ystartrotated = this.centerPoint[1] + xstart*Math.sin(rotation);
    var xend = xstart*Math.cos(radians);
    var yend = xstart*Math.sin(radians);
    var xendrotated = this.centerPoint[0] + xend*Math.cos(rotation) - yend*Math.sin(rotation);
    var yendrotated = this.centerPoint[1] + xend*Math.sin(rotation) + yend*Math.cos(rotation);
    var path = "M" + this.centerPoint[0] + " " + this.centerPoint[1];
    path += " L" + xstartrotated + " " + ystartrotated;
    path += " A" + this.radius + " " + this.radius + " 0 " + (angle > 179.99999 ? "1" : "0") + " 1 ";
    path += xendrotated + " " + yendrotated + " Z";
    return path;
},

drawBitmapPath : function (context) {
    var angle = this.endAngle-this.startAngle+1;
    var radians = angle*Math.PI/180.0;
    var startRadian = this.startAngle*Math.PI/180.0;
    var endRadian = this.endAngle*Math.PI/180.0;
    var rotation = this.startAngle*Math.PI/180.0;
    var xstart = this.radius;
    var ystart = 0.0;
    var xstartrotated = this.centerPoint[0] + xstart*Math.cos(rotation);
    var ystartrotated = this.centerPoint[1] + xstart*Math.sin(rotation);
    var xend = xstart*Math.cos(radians);
    var yend = xstart*Math.sin(radians);
    var xendrotated = this.centerPoint[0] + xend*Math.cos(rotation) - yend*Math.sin(rotation);
    var yendrotated = this.centerPoint[1] + xend*Math.sin(rotation) + yend*Math.cos(rotation);
    this.bmMoveTo(this.centerPoint[0], this.centerPoint[1], context);
    this.bmLineTo(xstartrotated, ystartrotated, context);
    this.bmArc(this.centerPoint[0], this.centerPoint[1], this.radius, startRadian, endRadian, false);
    context.closePath();
},

//> @method drawSector.setCenterPoint()
// Change the center point for this sector.
// @param left (int) left coordinate
// @param top (int) top coordinate
// @visibility drawing
//<
setCenterPoint : function (left, top) {
    if (isc.isAn.Array(left)) {
        top = left[1];
        left = left[0];
    }
    var dX = 0, dY = 0;
    if (left != null) dX = left - this.centerPoint[0];
    if (top != null) dY = top - this.centerPoint[1];

    this.moveBy(dX,dY);
},

//> @method drawSector.moveTo()
// Move the drawSector by the specified delta
// @param x (int) coordinate to move to horizontally
// @param y (int) coordinate to move to vertically
// @visibility drawing
//<
moveTo : function (x, y) {
    this.moveBy(x-this.centerPoint[0],y-this.centerPoint[1]);
},

//> @method drawSector.moveBy()
// Move the drawSector to the specified position.
// @param x (int) number of pixels to move by horizontally
// @param y (int) number of pixels to move by vertically
// @visibility drawing
//<
moveBy : function (x, y) {
    this.centerPoint[0] += x;
    this.centerPoint[1] += y;
    if (this.drawingVML) {
        this._vmlHandle.path = "m" + Math.round(this.centerPoint[0]) + "," + Math.round(this.centerPoint[1]) +
        " ae" + Math.round(this.centerPoint[0]) + "," + Math.round(this.centerPoint[1]) +
        " " + Math.round(this.radius) + "," + Math.round(this.radius) + " " +
        Math.round(-this.startAngle*65535) + "," + Math.round(-(this.endAngle - this.startAngle)*65536) + " x e'";
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "transform", "translate(" +  x  + "," + y + ")");
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("moveBy",arguments);
    this._moved();
},

//> @method drawSector.resizeBy()
// Resize by the specified delta. Note that the resize delta will be applied to each point.
// @param dX (int) number of pixels to resize by horizontally
// @param dY (int) number of pixels to resize by vertically
// @visibility drawing
//<
resizeBy : function (dX, dY) {
    if(this.scale) {
        this.scale[0] = dX;
        this.scale[1] = dY;
        if (this.drawingSVG) {
            this._svgHandle.setAttributeNS(null, "transform", "scale(" +  this.scale[0]  + "," + this.scale[1] + ")");
        } else if (this.drawingBitmap) {
            this.drawPane.redrawBitmap();
        }
        this.Super("resizeBy",arguments);
        this._resized(dX, dY);
    }
}

}) // end DrawSector.addProperties


//------------------------------------------------------------------------------------------
//> @class DrawLabel
//
//  DrawItem subclass to render a single-line text label.
//
//  @inheritsFrom DrawItem
//  @treeLocation Client Reference/Drawing/DrawItem
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

isc.defineClass("DrawLabel", "DrawItem").addProperties({

// save original fontsize so we can apply scaling - see DrawPane._updateItemsToViewBox()
init : function () {
    this._fontSize = this.fontSize;
    this.Super("init");
},

//> @attr drawLabel.contents (String : null : IR)
// This is the content that will exist as the label.
// @visibility drawing
//<

//> @attr drawLabel.left (int : 0 : IR)
// Sets the amount from the left of its positioning that the element should be placed.
// @visibility drawing
//<
left:0,

//> @attr drawLabel.top (int : 0 : IR)
// Sets the amount from the top of its positioning that the element should be placed.
// @visibility drawing
//<
top:0,
//> @attr drawLabel.alignment (String : "start" : IR)
// Sets the text alignment from the x position. Similar to html5 context.textAlign, eg "start", "center", "end"
// @visibility drawing
//<
alignment: 'start',

//> @attr drawLabel.fontFamily (String : "Tahoma" : IR)
// Font family name, similar to the CSS font-family attribute.
// @visibility drawing
//<
fontFamily:"Tahoma",

//> @attr drawLabel.fontSize (int : 18 : IR)
// Font size in pixels, similar to the CSS font-size attribute.
// @visibility drawing
//<
fontSize:18,

//> @attr drawLabel.fontWeight (String : "bold" : IR)
// Font weight, similar to the CSS font-weight attribute, eg "normal", "bold".
// @visibility drawing
//<
fontWeight:"bold",

//> @attr drawLabel.fontStyle (String : "normal" : IR)
// Font style, similar to the CSS font-style attribute, eg "normal", "italic".
// @visibility drawing
//<
fontStyle:"normal",

//> @attr drawLabel.rotation
// Rotation in degrees.
//
// <p><b>NOTE:</b> For best results, only use rotation values 0, 90, 180, and 270 with DrawLabels.
//
// @include DrawItem.rotation
//<

// Just check for whether the event occurred in the bounding box.
checkPointInPath: false,

//> @attr drawLabel.knobs
// <b>NOTE:</b> DrawLabels do not support knobs.
// @include DrawItem.knobs
//<

//----------------------------------------
//  DrawLabel renderers
//----------------------------------------

//synchTextMove:true,
_getElementVML : function (id) {

    if (this.synchTextMove) {
    // TEXTBOX implementation
        return isc.SB.concat(
            this.drawPane.startTagVML('RECT')," ID='", id,
            "' STYLE='position:absolute;left:", this.left,
            "px; top:", this.top,
            (this.alignment ? "px; text-align:" + (this.alignment == "start" ? "left" : "right"): "px"),
            ";'>",this.drawPane.startTagVML('TEXTBOX')," INSET='0px, 0px, 0px, 0px' STYLE='overflow:visible",

            //(this.rotation != 0 ? ";rotation:" + 90 : ""),
            "; font-family:", this.fontFamily,
            // NOTE: manual zoom
            "; font-size:", this.fontSize * this.drawPane.zoomLevel,
            "px; font-weight:", this.fontWeight,
            "; font-style:", this.fontStyle,
            ";'><NOBR>", this.contents, "</NOBR>",this.drawPane.endTagVML('TEXTBOX'),this.drawPane.endTagVML('RECT'));
    } else {
    // DIV implementation
        var screenCoords = this.drawPane.drawing2screen([this.left, this.top, 0, 0]);
        return isc.SB.concat(
             "<DIV ID='", id,
            "' STYLE='position:absolute; overflow:visible; width:1px; height:1px",
            // the top-level VML container is relatively positioned hence 0,0 in drawing space
            // is inside the CSS padding of the draw pane.  This DIV is absolutely positioning
            // hence it's 0,0 would be inside the border, so add padding.
            "; left:", screenCoords[0] + this.drawPane.getLeftPadding(),
            "px; top:", screenCoords[1] + this.drawPane.getTopPadding(), "px",

            (this.rotation ? ";writing-mode: tb-rl" : ""),
            //(this.rotation ? ";filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=1)" : ""),
            "; font-family:", this.fontFamily,
            "; font-size:", (this.fontSize * this.drawPane.zoomLevel),
            "px; font-weight:", this.fontWeight,
            "; font-style:", this.fontStyle,
            ";color:", this.lineColor,
            ";'><NOBR>", this.contents, "</NOBR></DIV>");
    }
},

getSvgString : function (conversionContext) {
    conversionContext = conversionContext || isc.SVGStringConversionContext.create();
    var attributesSVG, left = this.left, top = this.top, rotation = this.rotation, center;
    if (!this.synchTextMove && this.drawPane.drawingType == "vml" && Math.abs(rotation - 270) < 0.00001) {
        left -= this.fontSize;
        top += this.getTextHeight();
    }
    var svgString = "<text id='isc_DrawItem_" + this.drawItemID +
        "' x='" + left +
        "' y='" + (conversionContext.printForExport !== false ? top + this.fontSize : top) +
        "' dominant-baseline='text-before-edge" +
        "' font-family='" + this.fontFamily + // TODO FFSVG15 - list of fonts does not work, so switch fontFamily for each OS
        "' font-size='" + this.fontSize + "px" +
        "' font-weight='" + this.fontWeight +
        "' font-style='" + this.fontStyle +
        "' fill='" + this.lineColor;
    if (rotation && (center = this.getCenter()) && center.length === 2) {
        svgString += "' transform='rotate(" + rotation + " " + left + " " + top + ")";
    }
    svgString += "'";
    attributesSVG = this.getAttributesSVG();
    if (attributesSVG) svgString += " " + attributesSVG;
    if (this.contents != null) {
        svgString += ">" + isc.makeXMLSafe(String(this.contents)) + "</text>";
    } else svgString += "/>";
    return svgString;
},

//> @method drawLabel.moveBy()
// Move both the start and end points of the line by a relative amount.
//
// @param left (int) change to left coordinate in pixels
// @param top (int) change to top coordinate in pixels
// @visibility drawing
//<
moveBy : function (x, y) {
    this.top += y;
    this.left += x;
    if (this.drawingVML) {
        this._vmlHandle.style.left = this.left;
        this._vmlHandle.style.top = this.top;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "x", this.left);
        this._svgHandle.setAttributeNS(null, "y", this.top);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("moveBy",arguments);
},

//> @method drawLabel.moveTo()
// Move the label to the absolute x, y coordinates
//
// @param left (int) new startLeft coordinate in pixels
// @param top (int) new startTop coordinate in pixels
// @visibility drawing
//<
moveTo : function (left, top) {
    this.moveBy(left - this.left, top - this.top);
},

//> @method drawLabel.rotateTo()
// Rotate the label by the absolute rotation in degrees
// @param degrees (float) number of degrees to rotate
// @visibility drawing
//<
rotateTo : function (degrees) {
    this.rotateBy(degrees - this.rotation);
},

//> @method drawLabel.getCenter()
// Get the center coordinates of the label
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    var textWidth, textHeight;
    if (this.drawingSVG && !this._svgHandle) {
        var dims = this.drawPane.measureLabel(this.contents, this);
        textWidth = dims.width;
        textHeight = dims.height;
    } else {
        textWidth = this.getTextWidth();
        textHeight = this.getTextHeight();
    }
    return [this.left + Math.round(textWidth / 2), this.top + Math.round(textHeight / 2)];
},

//> @method drawLabel.getBoundingBox()
// Returns the top, left, top + textHeight, left + textWidth
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    var textWidth, textHeight;
    if (this.drawingSVG && !this._svgHandle) {
        var dims = this.drawPane.measureLabel(this.contents, this);
        textWidth = dims.width;
        textHeight = dims.height;
    } else {
        textWidth = this.getTextWidth();
        textHeight = this.getTextHeight();
    }
    return [this.left, this.top, this.left + textWidth, this.top + textHeight];
},

showResizeKnobs : null,
hideResizeKnobs : null,

showMoveKnobs : null,
hideMoveKnobs : null,

makeHTMLText : function () {
    var label = this._htmlText = isc.HTMLFlow.create({
        // TODO account for transformations other than rotation
        left: this.left + this.drawPane.getLeftPadding(),
        top: this.top + this.drawPane.getTopPadding(),

        rotation:this.rotation,

        transformOrigin:"0 0",

        width:1, height:1,
        contents:isc.SB.concat("<span style='font-family:", this.fontFamily,
                                           ";font-weight:", this.fontWeight,
                                           ";font-size:", Math.round(this.fontSize * this.drawPane.zoomLevel),
                                           "px;font-style:", this.fontStyle,
                                           ";color:", this.lineColor,
                                           ";white-space:nowrap'>",
                                    this.contents,
                               "</span>"),
        autoDraw: false
    });
    this.drawPane.addChild(label);
},

drawBitmap : function (context) {
    if (this.useHTML || isc.Browser.isIPhone) {
        // option to render as HTML.  Needed for some older browsers or on mobile devices so
        // that the text is not blurry.
        if (!this._htmlText) this.makeHTMLText();
    } else {
        this.Super("drawBitmap", arguments);
    }
},

erase : function () {
    if (this._htmlText) this._htmlText.destroy();
    this.Super("erase", arguments);
},

destroy : function () {
    if (this._htmlText) this._htmlText.destroy();
    this.Super("destroy", arguments);
},

getFontString : function () {
    return (this.fontStyle != "normal" ? this.fontStyle + " " : "") +
                     (this.fontWeight != "normal" ? this.fontWeight + " " : "") +
                     this.fontSize + "px " + this.fontFamily;
},


_calculateAlignMiddleCorrection : function () {
    if (!(isc.Browser.isFirefox && isc.Browser.hasCANVAS && this._verticalAlignMiddle)) {
        return 0;
    } else {
        var cache = this.drawPane._alignMiddleCorrectionCache;
        if (cache == null) {
            cache = this.drawPane._alignMiddleCorrectionCache = {};
        }

        var font = this.getFontString();
        if (cache.hasOwnProperty(font)) {
            return cache[font];
        }

        var measureCanvas = isc.DrawPane._getMeasureCanvas();
        measureCanvas.setContents("<CANVAS></CANVAS>");
        measureCanvas.redraw();
        var canvas = measureCanvas.getHandle().getElementsByTagName("canvas")[0];
        var context = canvas.getContext("2d");

        context.font = font;
        var text = "The quick, brown fox",
            textMeasure = context.measureText(text),
            textWidth = textMeasure.width,
            textHeight = textMeasure.height || this.fontSize;

        var canvasWidth = context.canvas.width = Math.round(textWidth);
        var canvasHeight = context.canvas.height = Math.round(3 * textHeight);

        // Get the bottom of the text when textBaseline is "middle"
        context.textBaseline = "middle";
        context.font = font;
        context.fillText(text, textHeight, 0);
        var imageData = context.getImageData(0, 0, canvasWidth, canvasHeight),
            data = imageData.data;
        var middleBottom = 0;
        for (var i = data.length - 4; i > 0; i -= 4) {
            if (data[i + 3]) {
                middleBottom = Math.floor(i / (4 * canvasWidth)) - textHeight;
                break;
            }
        }

        // Get the top and bottom of the text when textBaseline is "hanging"
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.textBaseline = "hanging";
        context.font = font;
        context.fillText(text, textHeight, 0);
        imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
        data = imageData.data;
        var hangingBottom = 0;
        for (var i = data.length - 4; i > 0; i -=4) {
            if (data[i + 3]) {
                hangingBottom = Math.floor(i / (4 * canvasWidth)) - textHeight;
                break;
            }
        };
        var top = 0;
        for (var i = 0, dataLength = data.length; i < dataLength; i += 4) {
            if (data[i + 3]) {
                top = Math.floor(i / (4 * canvasWidth)) - textHeight;
            }
        }
        var actualTextHeight = hangingBottom - top;

        return (cache[font] = -Math.round((actualTextHeight - (hangingBottom - middleBottom)) / 2));
    }
},


drawBitmapPath : function (context) {


    context.textBaseline = "top";

    //this.logWarn("fontString: " + fontString);
    context.font = this.getFontString();


    if (isNaN(this.top)) this.top = 0;
    var translateLeft = this.left,
        translateTop = this.top + this._calculateAlignMiddleCorrection(),
        rotation = 0;
    this.bmTranslate(translateLeft, translateTop, context);
    if (this.rotation) {
        rotation = (this.rotation / 180) * Math.PI;
        this.bmRotate(rotation, context);
    }
    if (this.backgroundColor) {
        context.fillStyle = this.backgroundColor;
        context.globalAlpha = this.fillOpacity;
        context.beginPath();
        var x1 = 0, x2 = this.getTextWidth(), y1 = 0, y2 = this.getTextHeight();
        this.bmMoveTo(x1,y1);
        this.bmLineTo(x2,y1);
        this.bmLineTo(x2,y2);
        this.bmLineTo(x1,y2);
        this.bmLineTo(x1,y1);
        context.fill();
    }
    context.fillStyle = this.lineColor;
    context.textAlign = this.alignment;
    this.bmFillText(this.contents, 0, 0, context);
    if (this.rotation) {
        this.bmRotate(-rotation, context);
    }
    this.bmTranslate(-translateLeft, -translateTop, context);
},

//----------------------------------------
//  DrawLabel attribute setters
//----------------------------------------

getTextWidth : function () {
    if (!(this.drawingVML || this.drawingSVG || this.drawingBitmap)) {
        this.drawHandle();
    }

    if (this.drawingVML) {
        if (this.synchTextMove) {
            return this._vmlHandle.firstChild.scrollWidth; // VML TEXTBOX
        } else {
            return this._vmlHandle.scrollWidth; // external DIV
        }
    } else if (this.drawingSVG) {
        // could use getBBox().width - getBBox also gets the height - but guessing this is faster
        if (this._svgHandle) return this._svgHandle.getComputedTextLength();
        else this.drawPane.measureLabel(this.contents, this).width;
    } else if (this.drawingBitmap) {
        var context = this.drawPane.getBitmapContext(),
            contextFont = context.font,
            font = this.getFontString() || contextFont,
            saved = (font != contextFont);
        if (saved) {
            context.save();
            context.font = font;
        }
        var textWidth = context.measureText(this.contents).width;
        if (saved) {
            context.restore();
        }
        return textWidth;
    }
},
getTextHeight : function () {
    if (!(this.drawingVML || this.drawingSVG || this.drawingBitmap)) {
        this.drawHandle();
    }

    if (this.drawingVML) {
        if (this.synchTextMove) {
            return this._vmlHandle.firstChild.scrollHeight; // VML TEXTBOX
        } else {
            return this._vmlHandle.scrollHeight; // external DIV
        }
    } else if (this.drawingSVG) {
        if (this._svgHandle) return this._svgHandle.getBBox().height;
        else this.drawPane.measureLabel(this.contents, this).height;
    } else if (this.drawingBitmap) {
        var context = this.drawPane.getBitmapContext(),
            contextFont = context.font,
            font = this.getFontString() || contextFont,
            saved = (font != contextFont);
        if (saved) {
            context.save();
            context.font = font;
        }
        var textHeight = context.measureText(this.contents).height || this.fontSize;
        if (saved) {
            context.restore();
        }
        return textHeight;
    }
},

setFontSize: function (size) {
    if (size != null) this.fontSize = size;
    if (this.drawingVML) {
        this._vmlTextHandle.fontSize = (this.fontSize * this.drawPane.zoomLevel) + "px";
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "font-size", this.fontSize + "px");
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

// Wipe out the drawItem line and fill attribute setters. Same reason as with DrawGroup:
// If someone blindly called the superclass setters on all drawItems,
// they would error on drawLabels because e.g. there are no VML stroke and fill subelements.
// TODO expand this list as additional setters are added to DrawItem
setLineWidth : function (width) {this.logWarn("no setLineWidth")},
_setLineWidthVML : function (width) {this.logWarn("no _setLineWidthVML")},
setLineColor : function (color) {this.logWarn("no setLineColor")},
setLineOpacity : function (opacity) {this.logWarn("no setLineOpacity")},
setLinePattern : function (pattern) {this.logWarn("no setLinePattern")},
setLineCap : function (cap) {this.logWarn("no setLineCap")},
setStartArrow : function (startArrow) {this.logWarn("no setStartArrow")},
setEndArrow : function (endArrow) {this.logWarn("no setEndArrow")},
setFillColor : function (color) {this.logWarn("no setFillColor")},
setFillOpacity : function (opacity) {this.logWarn("no setFillOpacity")}

// TO DO: we should be able to support moveAPIs and drawKnobs


}) // end DrawLabel.addProperties










//------------------------------------------------------------------------------------------
//> @class DrawImage
//
//  DrawItem subclass to render embedded images.
//
//  @inheritsFrom DrawItem
//  @treeLocation Client Reference/Drawing/DrawItem
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

isc.defineClass("DrawImage", "DrawItem").addProperties({
    //>    @attr drawImage.left (int : 0 : IRW)
    // @include drawRect.left
    //<
    left:0,

    //>    @attr drawImage.top (int : 0 : IRW)
    // @include drawRect.top
    //<
    top:0,

    //> @attr drawImage.width    (int : 16 : IR)
    // @include drawRect.width
    //<
    width:16,

    //> @attr drawImage.height   (int : 16 : IR)
    // @include drawRect.height
    //<
    height:16,

    //> @attr drawImage.title  (String : null : IR)
    // Title (tooltip hover text) for this image.
    // @visibility drawing
    //<
    //title:"Untitled Image",

    //> @attr drawImage.src    (URL : "blank.png" : IRW)
    // URL to the image file.
    // @visibility drawing
    //<
    src:"blank.png",

    //> @attr drawImage.image    (Image : null : IRW)
    // image object
    // @visibility drawing
    //<
    image:null,

//> @method drawImage.getBoundingBox()
// Returns the top, left, top+width, left+height
//
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    return [this.left, this.top, this.left+this.width, this.top+this.height];
},

checkPointInPath:false,

// TODO copy w/h to internal properties so we can apply scaling without changing
//  the user properties
init : function () {
    this.Super("init");
    this.initImage(this.src);
},

initImage : function (src) {
    if (src) {
        // support relative image-paths
        this.src = this.getSrcURL(src);
        this.image = new Image();
        var _this = this;
        this.image.onload = function () {
            if (!_this._drawn) _this.draw();
            else if (_this.drawPane && _this.drawPane.drawingType == "bitmap") {
                _this.drawBitmap(_this.drawPane.getBitmapContext());
                _this._setupEventParent();
                _this._drawn = true;
            }
        }
        this.image.src = this.src;
    }
},

//----------------------------------------
//  DrawImage renderers
//----------------------------------------

getSrcURL : function (src) {
    var result = isc.Canvas.getImgURL(src);
    return result;
},

_getElementVML : function (id) {
    var result = isc.SB.concat(
        this.drawPane.startTagVML('IMAGE')," ID='", id,
            "' SRC='", this.getSrcURL(this.src),
            (this.title ? "' ALT='"+this.title : ""),
            "' STYLE='left:", this.left,
            "px; top:", this.top,
            "px; width:", this.width,
            "px; height:", this.height,
            "px;'>",this.drawPane.endTagVML("IMAGE")
    );

    return result;
},

getSvgString : function (conversionContext) {
    var center;
    var svgString = "<image id='isc_DrawItem_" + this.drawItemID;
    if (this.rotation && (center = this.getCenter()) && center.length === 2) {
        svgString += "' transform='rotate(" + this.rotation + " " + center[0]  + " " + center[1] + ")"
    }
    svgString += "' x='" + this.left +
        "' y='" + this.top +
        "' width='" + this.width +
        "px' height='" + this.height +
        "px' " + (conversionContext ? conversionContext.xlinkPrefix||isc.SVGStringConversionContext._$xlink : isc.SVGStringConversionContext._$xlink) + ":href='" + this.getSrcURL(this.src) + "'";
    var attributesSVG = this.getAttributesSVG();
    if (attributesSVG) svgString += " " + attributesSVG;
    if (this.title) {
        svgString += "><title>" + isc.makeXMLSafe(this.title) + "</title></image>";
    } else svgString += "/>";
    return svgString;
},

drawBitmapPath : function(context) {
    context.drawImage(this.image,this.left,this.top,this.width,this.height);
},

//> @method drawImage.getCenter()
// Get the center coordinates of the rectangle
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    return [this.left + Math.round(this.width/2), this.top + Math.round(this.height/2)];
},

//----------------------------------------
//  DrawImage attribute setters
//----------------------------------------

//> @method drawImage.setSrc()
// Change the URL of the image displayed.
// @param src (URL) new URL
//
// @visibility drawing
//<
setSrc: function (src) {
    this.initImage(src);
    if (this.drawingVML) {
        this._vmlHandle.src = this.src;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(isc._$xlinkNS, "href", this.src);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},

// TODO remove these overrides from DrawGroup, DrawLabel, here - factor DrawShape out of
//  DrawItem instead
setLineWidth : function (width) {this.logWarn("no setLineWidth")},
_setLineWidthVML : function (width) {this.logWarn("no _setLineWidthVML")},
setLineColor : function (color) {this.logWarn("no setLineColor")},
setLineOpacity : function (opacity) {this.logWarn("no setLineOpacity")},
setLinePattern : function (pattern) {this.logWarn("no setLinePattern")},
setLineCap : function (cap) {this.logWarn("no setLineCap")},
setStartArrow : function (startArrow) {this.logWarn("no setStartArrow")},
setEndArrow : function (endArrow) {this.logWarn("no setEndArrow")},
setFillColor : function (color) {this.logWarn("no setFillColor")},
setFillOpacity : function (opacity) {this.logWarn("no setFillOpacity")},

//> @method drawImage.moveBy()
// Move the drawImage by the specified delta
// @param dX (int) number of pixels to move horizontally
// @param dY (int) number of pixels to move vertically
// @visibility drawing
//<
moveBy : function (dX, dY) {
    this.left += dX;
    this.top += dY;

    if (this.drawingVML) {
        this._vmlHandle.style.left = this.left;
        this._vmlHandle.style.top = this.top;
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "x", this.left);
        this._svgHandle.setAttributeNS(null, "y", this.top);
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("moveBy",arguments);
    this._moved(dX, dY);
},

//> @method drawImage.moveTo()
// Move the drawImage to the specified position
// @param left (int) new left coordinate
// @param top (int) new top coordinate
// @visibility drawing
//<
moveTo : function (left,top) {
    this.moveBy(left - this.left, top - this.top);
},

resizeBy : isc.DrawRect.getInstanceProperty("resizeBy"),

resizeTo : isc.DrawRect.getInstanceProperty("resizeTo")

}) // end DrawImage.addProperties










//------------------------------------------------------------------------------------------
//> @class DrawCurve
//
//  DrawItem that renders cubic bezier curves.
//
//  @inheritsFrom DrawItem
//  @treeLocation Client Reference/Drawing/DrawItem
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

// TODO consider whether this should be a subclass of DrawPath instead
isc.defineClass("DrawCurve", "DrawItem").addProperties({
    //> @attr drawCurve.knobs
    // Array of control knobs to display for this item. Each +link{knobType} specified in this
    // will turn on UI element(s) allowing the user to manipulate this DrawCurve.  To update the
    // set of knobs at runtime use +link{drawItem.showKnobs()} and +link{drawItem.hideKnobs()}.
    // <p>
    // DrawCurve supports the
    // <var class="smartclient">"startPoint", "endPoint", "controlPoint1", and "controlPoint2"</var>
    // <var class="smartgwt">{@link com.smartgwt.client.types.KnobType#STARTPOINT}, {@link com.smartgwt.client.types.KnobType#ENDPOINT},
    // {@link com.smartgwt.client.types.KnobType#CONTROLPOINT1}, and {@link com.smartgwt.client.types.KnobType#CONTROLPOINT2}</var>
    // knob types.
    // @include DrawItem.knobs
    //<

    //> @attr drawCurve.startPoint     (Point : [0,0] : IRW)
    // Start point of the curve
    // @visibility drawing
    //<
    startPoint: [0,0],

    //> @attr drawCurve.endPoint       (Point : [100,100] : IRW)
    // End point of the curve
    // @visibility drawing
    //<
    endPoint: [100,100],

    //> @attr drawCurve.controlPoint1  (Point : [100,0] : IRW)
    // First cubic bezier control point.
    // @visibility drawing
    //<
    controlPoint1: [100,0],

    //> @attr drawCurve.controlPoint2  (Point : [0,100] : IRW)
    // Second cubic bezier control point.
    // @visibility drawing
    //<
    controlPoint2: [0,100],

    svgElementName: "path",
    vmlElementName: "curve",

    //> @attr drawCurve.lineCap     (LineCap : "butt" : IRW)
    // Style of drawing the endpoints of a line.
    // <P>
    // Note that for dashed and dotted lines, the lineCap style affects each dash or dot.
    //
    // @group line
    // @visibility drawing
    //<
    lineCap: "butt",

init : function () {
    this.Super("init");
},

_getKnobPosition : function (position) {
    var x,y;
    x = this.endPoint[0] - this.startPoint[0];
    y = this.endPoint[1] - this.startPoint[1];
    return [x,y];
},

//> @method drawCurve.getCenter()
// Get the center coordinates of the curve
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    return [this.startPoint[0] + Math.round((this.endPoint[0] - this.startPoint[0])/2), this.startPoint[1] + Math.round((this.endPoint[1] - this.startPoint[1])/2)];
},

//----------------------------------------
//  DrawCurve renderers
//----------------------------------------

getAttributesVML : function () {
    return isc.SB.concat(
            "FROM='", this.startPoint[0], " ", this.startPoint[1],
            "' TO='", this.endPoint[0], " ", this.endPoint[1],
            "' CONTROL1='", this.controlPoint1[0], " ", this.controlPoint1[1],
            "' CONTROL2='", this.controlPoint2[0], " ", this.controlPoint2[1],
            "'");
},

getAttributesSVG : function () {
    return  "d='" + this.getPathSVG() + "'"
},

getPathSVG : function () {
    return  "M" + this.startPoint[0] + " " + this.startPoint[1] +
            "C" + this.controlPoint1[0] + " " + this.controlPoint1[1] +
            " " + this.controlPoint2[0] + " " + this.controlPoint2[1] +
            " " + this.endPoint[0] + " " + this.endPoint[1]
},

_bezier : function (a, b, c, d, t) {
    // assert 0 <= t && t <= 1
    var u = (1 - t),
        ab = u * a + t * b,
        bc = u * b + t * c,
        cd = u * c + t * d,
        abbc = u * ab + t * bc,
        bccd = u * bc + t * cd;
    return (u * abbc + t * bccd);
},

computeBezierPoint : function (t) {
    var x = this._bezier(
        this.startPoint[0], this.controlPoint1[0], this.controlPoint2[0], this.endPoint[0], t);
    var y = this._bezier(
        this.startPoint[1], this.controlPoint1[1], this.controlPoint2[1], this.endPoint[1], t);
    return [x, y];
},

drawBitmapPath : function (context) {
    var point, angle, originX, originY, arrowDelta = 10;
    if (this.startArrow == "open") {
        context.save();
        context.beginPath();
        context.strokeStyle = this.lineColor;
        context.lineWidth = this.lineWidth;
        context.lineCap = "round";
        point = this.computeBezierPoint(0.01);
        angle = this.computeAngle(this.startPoint[0],this.startPoint[1],point[0],point[1]);
        originX = this.startPoint[0];
        originY = this.startPoint[1];
        context.scale(1,1);
        context.translate(originX, originY);
        context.rotate(angle*Math.PI/180);
        this.bmMoveTo(arrowDelta,-arrowDelta, context);
        this.bmLineTo(0,0, context);
        this.bmLineTo(arrowDelta,arrowDelta, context);
        context.stroke();
        context.restore();
    } else if (this.startArrow == "block") {
        context.save();
        context.beginPath();
        context.fillStyle = this.lineColor;
        context.lineWidth = this.lineWidth;
        context.lineCap = "round";
        point = this.computeBezierPoint(0.01);
        angle = this.computeAngle(this.startPoint[0],this.startPoint[1],point[0],point[1]);
        originX = this.startPoint[0];
        originY = this.startPoint[1];
        context.translate(originX, originY);
        context.rotate(angle*Math.PI/180);
        this.bmMoveTo(arrowDelta,-arrowDelta, context);
        this.bmLineTo(0,0, context);
        this.bmLineTo(arrowDelta,arrowDelta, context);
        context.closePath();
        context.fill();
        context.stroke();
        context.restore();
    }
    if (this.endArrow == "open") {
        context.save();
        context.beginPath();
        context.strokeStyle = this.lineColor;
        context.lineWidth = this.lineWidth;
        context.lineCap = "round";
        point = this.computeBezierPoint(0.99);
        angle = this.computeAngle(point[0],point[1],this.endPoint[0],this.endPoint[1]);
        originX = this.endPoint[0];
        originY = this.endPoint[1];
        context.translate(originX, originY);
        context.rotate(angle*Math.PI/180);
        this.bmMoveTo(-arrowDelta,arrowDelta, context);
        this.bmLineTo(0,0, context);
        this.bmLineTo(-arrowDelta,-arrowDelta, context);
        context.stroke();
        context.restore();
    } else if (this.endArrow == "block") {
        context.save();
        context.beginPath();
        context.fillStyle = this.lineColor;
        context.lineWidth = this.lineWidth;
        context.lineCap = "round";
        point = this.computeBezierPoint(0.99);
        angle = this.computeAngle(point[0],point[1],this.endPoint[0],this.endPoint[1]);
        originX = this.endPoint[0];
        originY = this.endPoint[1];
        context.translate(originX, originY);
        context.rotate(angle*Math.PI/180);
        this.bmMoveTo(-arrowDelta,arrowDelta, context);
        this.bmLineTo(0,0, context);
        this.bmLineTo(-arrowDelta,-arrowDelta, context);
        context.closePath();
        context.fill();
        context.restore();
    }
    context.moveTo(
        this.startPoint[0], this.startPoint[1]
    );
    context.bezierCurveTo(
        this.controlPoint1[0], this.controlPoint1[1],
        this.controlPoint2[0], this.controlPoint2[1],
        this.endPoint[0], this.endPoint[1]
    );
},

//----------------------------------------
//  DrawCurve attribute setters
//----------------------------------------

//> @method drawCurve.setStartPoint()
// @include drawLine.setStartPoint
//<
setStartPoint : function (left, top) {
    if (isc.isAn.Array(left)) {
        top = left[1];
        left = left[0];
    }

    if (left != null) this.startPoint[0] = left;
    if (top != null) this.startPoint[1] = top;
    if (this.drawingVML) {
        this._vmlHandle.from = this.startPoint[0] + " " + this.startPoint[1];
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "d", this.getPathSVG());
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.updateControlKnobs();
},

//> @method drawCurve.setEndPoint()
// @include drawLine.setEndPoint
//<
setEndPoint : function (left, top) {
    if (isc.isAn.Array(left)) {
        top = left[1];
        left = left[0];
    }
    if (left != null) this.endPoint[0] = left;
    if (top != null) this.endPoint[1] = top;
    if (this.drawingVML) {
        this._vmlHandle.to = this.endPoint[0] + " " + this.endPoint[1];
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "d", this.getPathSVG());
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.updateControlKnobs();
},


//> @method drawCurve.setControlPoint1()
// Update the first cubic bezier control point
//
// @param left (int) left coordinate for control point, in pixels
// @param left (int) top coordinate for control point, in pixels
// @visibility drawing
//<
setControlPoint1 : function (left, top) {
    if (left != null) this.controlPoint1[0] = left;
    if (top != null) this.controlPoint1[1] = top;
    if (this.drawingVML) {
        this._vmlHandle.control1 = this.controlPoint1[0] + " " + this.controlPoint1[1];
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "d", this.getPathSVG());
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }

    this.updateControlKnobs();
},

//> @method drawCurve.setControlPoint2()
// Update the second cubic bezier control point
//
// @param left (int) left coordinate for control point, in pixels
// @param left (int) top coordinate for control point, in pixels
// @visibility drawing
//<
setControlPoint2 : function (left, top) {
    if (left != null) this.controlPoint2[0] = left;
    if (top != null) this.controlPoint2[1] = top;
    if (this.drawingVML) {
        this._vmlHandle.control2 = this.controlPoint2[0] + " " + this.controlPoint2[1];
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "d", this.getPathSVG());
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.updateControlKnobs();
},

//> @method drawCurve.getBoundingBox()
// Returns the smallest box containing the entire curve.
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    var epsilon = 0.000001,
        box = new Array(4);
    for (var k = 0; k < 2; ++k) {
        var x = this.startPoint[k],
            y = this.controlPoint1[k],
            z = this.controlPoint2[k],
            w = this.endPoint[k],
            min = Math.min(x, w),
            max = Math.max(x, w),


            a = (x - 3 * y + 3 * z - w),
            b = (2 * y - 4 * z + 2 * w),
            c = (-w + z),
            discriminant = (b * b - 4 * a * c),
            aIsZero = (Math.abs(a) < epsilon);

        if (aIsZero) {
            var bIsZero = (Math.abs(b) < epsilon);
            if (!bIsZero) {
                var root = -c / b;
                if (0 < root && root < 1) {
                    var value = this._bezier(x, y, z, w, 1 - root);
                    min = Math.min(min, value);
                    max = Math.max(max, value);
                }
            }
        } else if (discriminant >= 0) {
            var sqrtDiscriminant = Math.sqrt(discriminant),
                root1 = (-b + sqrtDiscriminant) / (2 * a),
                root2 = (-b - sqrtDiscriminant) / (2 * a);

            if (0 < root1 && root1 < 1) {
                var value = this._bezier(x, y, z, w, 1 - root1);
                min = Math.min(min, value);
                max = Math.max(max, value);
            }
            if (0 < root2 && root2 < 1) {
                var value = this._bezier(x, y, z, w, 1 - root2);
                min = Math.min(min, value);
                max = Math.max(max, value);
            }
        }

        box[k] = min;
        box[k + 2] = max;
    }

    return box;
},

// Support control knobs for start point, end point and control points.
// (Documented under DrawKnobs type definition)

showResizeKnobs : null,
hideResizeKnobs : null,

showMoveKnobs : null,
hideMoveKnobs : null,

// Note: can't borrow from drawLine - we have startPoint (two element array) rather than
// startLeft / endLeft
showStartPointKnobs : function () {
    if (this._startKnob != null && !this._startKnob.destroyed) return;

    this._startKnob = this.createAutoChild("startKnob", {
        _constructor: "DrawKnob",
        x: this.startPoint[0],
        y: this.startPoint[1],
        drawPane: this.drawPane,
        _targetShape: this,

        updatePoints : function (x, y, dx, dy, state) {
            var drawItem = this._targetShape;
            if (state == "start") {
                drawItem._dragStartPointControlPoint1 = drawItem.controlPoint1.duplicate();
                drawItem._dragStartPointControlPoint2 = drawItem.controlPoint2.duplicate();
            }
            var controlPoint1 = drawItem._dragStartPointControlPoint1,
                controlPoint2 = drawItem._dragStartPointControlPoint2;

            if (drawItem.keepInParentRect) {
                var box = drawItem._getParentRect(),
                    curve = {
                        startPoint: [x, y],
                        controlPoint1: controlPoint1.duplicate(),
                        controlPoint2: controlPoint2.duplicate(),
                        endPoint: drawItem.endPoint
                    };

                drawItem._intersectCurveBox(curve.endPoint, curve, box);

                var newStartPoint = curve.startPoint,
                    newControlPoint1 = curve.controlPoint1,
                    newControlPoint2 = curve.controlPoint2;

                drawItem.setStartPoint(newStartPoint[0], newStartPoint[1]);
                if (drawItem.controlPoint1[0] != newControlPoint1[0] ||
                    drawItem.controlPoint1[1] != newControlPoint1[1])
                {
                    drawItem.setControlPoint1(newControlPoint1[0], newControlPoint1[1]);
                }
                if (drawItem.controlPoint2[0] != newControlPoint2[0] ||
                    drawItem.controlPoint2[1] != newControlPoint2[1])
                {
                    drawItem.setControlPoint2(newControlPoint2[0], newControlPoint2[1]);
                }
            } else {
                drawItem.setStartPoint(x, y);
            }

            if (state == "stop") {
                delete drawItem._dragStartPointControlPoint1;
                delete drawItem._dragStartPointControlPoint2;
            }
        }
    });
},


_intersectCurveBox : function (fixedPoint, curve, box) {

    var box0 = Math.min(box[0], box[2]),
        box1 = Math.min(box[1], box[3]),
        box2 = Math.max(box[0], box[2]),
        box3 = Math.max(box[1], box[3]);
    box[0] = box0;
    box[1] = box1;
    box[2] = box2;
    box[3] = box3;

    // Flip the curve so that the fixedPoint is the same as curve.startPoint.  The curve
    // will be flipped back at the end of this method.
    var backward = (fixedPoint == curve.endPoint);
    if (backward) {
        this._backward(curve);
    }
    // assert fixedPoint == curve.startPoint

    var epsilon = 0.000001,
        startPoint = curve.startPoint,
        endPoint = curve.endPoint,
        startPointWithinBound = (
            box[0] <= startPoint[0] && startPoint[0] <= box[2] &&
            box[1] <= startPoint[1] && startPoint[1] <= box[3]),
        endPointWithinBound = (
            box[0] <= endPoint[0] && endPoint[0] <= box[2] &&
            box[1] <= endPoint[1] && endPoint[1] <= box[3]),

        wantMaxRoot = startPointWithinBound,
        wantMaxRootIntoBox = !wantMaxRoot && endPointWithinBound,
        wantMinRoot = !wantMaxRoot && !wantMaxRootIntoBox,
        root = null;

    // Loop over the four sides of the box to find the intersections of the
    // Bezier curve to the box.
    for (var m = 0; m < 4; ++m) {
        var k = m % 2, l = (k + 1) % 2, s = (m < 2 ? -1 : 1), bound = box[s + 1 + k];

        var x = startPoint[k],
            y = curve.controlPoint1[k],
            z = curve.controlPoint2[k],
            w = endPoint[k],

            a = (x - 3 * (y - z) - w),
            b = 3 * (y - z - z + w),
            c = 3 * (z - w),
            d = w - bound;

        // The startPoint is fixed so we only need to decide where to move the endPoint.
        // Nothing can be done if the Bezier curve is a constant polynomial for this
        // coordinate.  Otherwise determine the roots of the cubic polynomial in the Bezier
        // curve to try to move the endPoint onto the boundary (so that the curve lies within
        // the boundary).
        var aIsZero = (Math.abs(a) < epsilon),
            bIsZero = (Math.abs(b) < epsilon),
            cIsZero = (Math.abs(c) < epsilon);
        if (!(aIsZero && bIsZero && cIsZero)) {
            var roots;
            if (aIsZero && bIsZero) {
                // Linear case:  c * x + d = 0
                roots = [-d / c];
            } else if (aIsZero) {
                // Quadratic case:  b * x^2 + c * x + d = 0
                var discriminant = (c * c - 4 * b * d);
                if (discriminant < 0) {
                    roots = [];
                } else if (discriminant > 0) {
                    var sqrtDiscriminant = Math.sqrt(discriminant);
                    roots = [(-c + sqrtDiscriminant) / (2 * b), (-c - sqrtDiscriminant) / (2 * b)];
                } else {
                    roots = [-c / (2 * b)];
                }
            } else {
                // Cubic polynomial case:  a * x^3 + b * x^2 + c * x + d = 0
                // See:  http://en.wikipedia.org/wiki/Cubic_function

                // Precompute powers of a and b
                var a2 = a * a, a3 = a * a2,
                    b2 = b * b, b3 = b * b2,

                    // Substitute t = x + b / (3 * a) to get t^3 + p * t + q = 0
                    avgRoot = -b / (3 * a),
                    p = (3 * a * c - b2) / (3 * a2),
                    q = (2 * b3 - 9 * a * b * c + 27 * a2 * d) / (27 * a3),
                    discriminant = (q * q / 4 + p * p * p / 27);

                if (discriminant > 0) {
                    // one real root
                    var sqrtDiscriminant = Math.sqrt(discriminant),
                        u3 = (-q / 2 + sqrtDiscriminant),
                        v3 = (-q / 2 - sqrtDiscriminant),
                        // Math.pow() may return NaN if the base is negative,
                        // so take the absolute value of the base and multiply
                        // by the sign.
                        u = (u3 > 0 ? 1 : -1) * Math.pow(Math.abs(u3), 1 / 3),
                        v = (v3 > 0 ? 1 : -1) * Math.pow(Math.abs(v3), 1 / 3);
                        roots = [u + v + avgRoot];
                } else {
                    // three real roots
                    var r = Math.sqrt(-4 * p / 3),
                        cos3Alpha = -4 * q / (r * r * r),
                        // Limit to [-1, 1] to avoid:  Math.acos(1.000000001) = NaN
                        alpha = Math.acos(Math.max(-1, Math.min(1, cos3Alpha))) / 3;
                    roots = [
                        avgRoot + r * Math.cos(alpha),
                        avgRoot + r * Math.cos(alpha + 2 * Math.PI / 3),
                        avgRoot + r * Math.cos(alpha - 2 * Math.PI / 3)];
                }
            }

            for (var i = roots.length; i--; ) {
                var r = roots[i],
                    firstDerivative = 3 * a * r * r + 2 * b * r + c;

                // The root must be in the interval [0, 1] to lie on the Bezier curve.  The
                // root must not be a (local) minimum/maximum so that the curve crosses from
                // one side of the bound to the other.
                if (epsilon < r && r < 1 - epsilon && firstDerivative != 0) {
                    var mn1 = (m + 3) % 4,
                        mp1 = (m + 1) % 4,
                        sn1 = (mn1 < 2 ? -1 : 1),
                        sp1 = (mp1 < 2 ? -1 : 1),
                        kn1 = l,
                        kp1 = l,
                        boundn1 = box[sn1 + 1 + kn1],
                        boundp1 = box[sp1 + 1 + kp1],
                        coord = this._bezier(
                            startPoint[l], curve.controlPoint1[l],
                            curve.controlPoint2[l], endPoint[l],
                            1 - r);

                    if (!(sn1 * coord > sn1 * boundn1) &&
                        !(sp1 * coord > sp1 * boundp1) &&
                        (wantMaxRootIntoBox ?
                            (s == (firstDerivative > 0 ? -1 : 1) && (root == null || root < r)) :
                            (root == null || (wantMaxRoot ? (root < r) : (root > r)))))
                    {
                        root = r;
                    }
                }
            }
        }
    }

    // If a suitable root is found then move the endPoint, and trim the curve to the subcurve
    // between the startPoint and the new endPoint.
    if (root != null) {
        this._decasteljau(curve, 1 - root, false);
    }

    // Flip the curve back.
    if (backward) {
        this._backward(curve);
    }
},

// Swaps curve.{start,end}Point and swaps curve.controlPoint{1,2}.
_backward : function (curve) {
    var swap = curve.startPoint;
    curve.startPoint = curve.endPoint;
    curve.endPoint = swap;

    swap = curve.controlPoint1;
    curve.controlPoint1 = curve.controlPoint2;
    curve.controlPoint2 = swap;
},


_decasteljau : function (curve, t, which) {
    // assert 0 <= t && t <= 1

    var w = 1 - t;
    for (var k = 0; k < 2; ++k) {
        var a = w * curve.startPoint[k] + t * curve.controlPoint1[k],
            b = w * curve.controlPoint1[k] + t * curve.controlPoint2[k],
            c = w * curve.controlPoint2[k] + t * curve.endPoint[k],
            d = w * a + t * b,
            e = w * b + t * c,
            f = w * d + t * e;

        if (!which) {
            curve.controlPoint1[k] = a;
            curve.controlPoint2[k] = d;
            curve.endPoint[k] = f;
        } else {
            curve.startPoint[k] = f;
            curve.controlPoint1[k] = e;
            curve.controlPoint2[k] = c;
        }
    }
    return curve;
},

hideStartPointKnobs : function () {
    if (this._startKnob) {
        this._startKnob.destroy();
        delete this._startKnob;
    }
},

showEndPointKnobs : function () {
    if (this._endKnob != null && !this._endKnob.destroyed) return;

    this._endKnob = this.createAutoChild("endKnob", {
        _constructor: "DrawKnob",
        x: this.endPoint[0],
        y: this.endPoint[1],
        drawPane: this.drawPane,
        _targetShape: this,

        updatePoints : function (x, y, dx, dy, state) {
            var drawItem = this._targetShape;

            if (state == "start") {
                drawItem._dragEndPointControlPoint1 = drawItem.controlPoint1.duplicate();
                drawItem._dragEndPointControlPoint2 = drawItem.controlPoint2.duplicate();
            }
            var controlPoint1 = drawItem._dragEndPointControlPoint1,
                controlPoint2 = drawItem._dragEndPointControlPoint2;

            if (drawItem.keepInParentRect) {
                var box = drawItem._getParentRect(),
                    curve = {
                        startPoint: drawItem.startPoint,
                        controlPoint1: controlPoint1.duplicate(),
                        controlPoint2: controlPoint2.duplicate(),
                        endPoint: [x, y]
                    };

                drawItem._intersectCurveBox(curve.startPoint, curve, box);

                var newEndPoint = curve.endPoint,
                    newControlPoint2 = curve.controlPoint2,
                    newControlPoint1 = curve.controlPoint1;

                drawItem.setEndPoint(newEndPoint[0], newEndPoint[1]);
                if (drawItem.controlPoint2[0] != newControlPoint2[0] ||
                    drawItem.controlPoint2[1] != newControlPoint2[1])
                {
                    drawItem.setControlPoint2(newControlPoint2[0], newControlPoint2[1]);
                }
                if (drawItem.controlPoint1[0] != newControlPoint1[0] ||
                    drawItem.controlPoint1[1] != newControlPoint1[1])
                {
                    drawItem.setControlPoint1(newControlPoint1[0], newControlPoint1[1]);
                }
            } else {
                drawItem.setEndPoint(x, y);
            }

            if (state == "stop") {
                delete drawItem._dragEndPointControlPoint1,
                delete drawItem._dragEndPointControlPoint2;
            }
        }
    });
},

hideEndPointKnobs : function () {
    if (this._endKnob) {
        this._endKnob.destroy();
        delete this._endKnob;
    }
},

c1KnobDefaults: {
    cursor: "move",
    knobShapeProperties: {
        fillColor: "#0000ff"
    }
},

// Control point knobs - these include a line going back to the start or end point
showControlPoint1Knobs : function () {
    if (this._c1Knob == null || this._c1Knob.destroyed) {
        this._c1Knob = this.createAutoChild("c1Knob", {
            _constructor: "DrawKnob",
            x: this.controlPoint1[0],
            y: this.controlPoint1[1],
            drawPane: this.drawPane,
            _targetShape: this,

            updatePoints : function (x, y, dx, dy, state) {
                var drawItem = this._targetShape;
                if (state == "start") {
                    drawItem._dragControlPoint1StartPoint = drawItem.startPoint.duplicate();
                    drawItem._dragControlPoint1ControlPoint2 = drawItem.controlPoint2.duplicate();
                    drawItem._dragControlPoint1EndPoint = drawItem.endPoint.duplicate();
                }
                var startPoint = drawItem._dragControlPoint1StartPoint,
                    controlPoint2 = drawItem._dragControlPoint1ControlPoint2,
                    endPoint = drawItem._dragControlPoint1EndPoint;

                if (drawItem.keepInParentRect) {
                    var box = drawItem._getParentRect(),
                        curve = {
                            startPoint: startPoint.duplicate(),
                            controlPoint1: [x, y],
                            controlPoint2: controlPoint2.duplicate(),
                            endPoint: endPoint.duplicate()
                        };

                    drawItem._intersectCurveBox(curve.endPoint, curve, box);

                    var newStartPoint = curve.startPoint,
                        newControlPoint1 = curve.controlPoint1,
                        newControlPoint2 = curve.controlPoint2;

                    drawItem.setControlPoint1(newControlPoint1[0], newControlPoint1[1]);
                    if (newStartPoint[0] != drawItem.startPoint[0] ||
                        newStartPoint[1] != drawItem.startPoint[1])
                    {
                        drawItem.setStartPoint(newStartPoint[0], newStartPoint[1]);
                    }
                    if (newControlPoint2[0] != drawItem.controlPoint2[0] ||
                        newControlPoint2[1] !== drawItem.controlPoint2[1])
                    {
                        drawItem.setControlPoint2(newControlPoint2[0], newControlPoint2[1]);
                    }
                } else {
                    drawItem.setControlPoint1(x, y);
                }

                if (state == "stop") {
                    delete drawItem._dragControlPoint1StartPoint;
                    delete drawItem._dragControlPoint1ControlPoint2;
                    delete drawItem._dragControlPoint1EndPoint;
                }
            }
        });
    }

    if (this._c1Line == null || this._c1Line.destroyed) {
        this._c1Line = this.createAutoChild("c1Line", {
            _constructor: "DrawLine",
            startLeft: this.startPoint[0], startTop: this.startPoint[1],
            endLeft: this.controlPoint1[0], endTop: this.controlPoint1[1],
            drawPane: this.drawPane,
            autoDraw: true
        });
    }
},

hideControlPoint1Knobs : function () {
    if (this._c1Knob) {
        this._c1Knob.destroy();
        delete this._c1Knob;
    }
    if (this._c1Line) {
        this._c1Line.erase();
        delete this._c1Line;
    }
},

c2KnobDefaults: {
    cursor: "move",
    knobShapeProperties: {
        fillColor: "#0000ff"
    }
},

showControlPoint2Knobs : function () {
    if (this._c2Knob == null || this._c2Knob.destroyed) {
        this._c2Knob = this.createAutoChild("c2Knob", {
            _constructor: "DrawKnob",
            x: this.controlPoint2[0],
            y: this.controlPoint2[1],
            drawPane: this.drawPane,
            _targetShape: this,

            updatePoints : function (x, y, dx, dy, state) {
                var drawItem = this._targetShape;
                if (state == "start") {
                    drawItem._dragControlPoint2StartPoint = drawItem.startPoint.duplicate();
                    drawItem._dragControlPoint2ControlPoint1 = drawItem.controlPoint1.duplicate();
                    drawItem._dragControlPoint2EndPoint = drawItem.endPoint.duplicate();
                }
                var startPoint = drawItem._dragControlPoint2StartPoint,
                    controlPoint1 = drawItem._dragControlPoint2ControlPoint1,
                    endPoint = drawItem._dragControlPoint2EndPoint;

                if (drawItem.keepInParentRect) {
                    var box = drawItem._getParentRect(),
                        curve = {
                            startPoint: startPoint.duplicate(),
                            controlPoint1: controlPoint1.duplicate(),
                            controlPoint2: [x, y],
                            endPoint: endPoint.duplicate()
                        };

                    drawItem._intersectCurveBox(curve.startPoint, curve, box);

                    var newControlPoint1 = curve.controlPoint1,
                        newControlPoint2 = curve.controlPoint2,
                        newEndPoint = curve.endPoint;

                    drawItem.setControlPoint2(newControlPoint2[0], newControlPoint2[1]);
                    if (newControlPoint1[0] != drawItem.controlPoint1[0] ||
                        newControlPoint1[1] != drawItem.controlPoint1[1])
                    {
                        drawItem.setControlPoint1(newControlPoint1[0], newControlPoint1[1]);
                    }
                    if (newEndPoint[0] != drawItem.endPoint[0] ||
                        newEndPoint[1] != drawItem.endPoint[1])
                    {
                        drawItem.setEndPoint(newEndPoint[0], newEndPoint[1]);
                    }
                } else {
                    drawItem.setControlPoint2(x, y);
                }

                if (state == "stop") {
                    delete drawItem._dragControlPoint2StartPoint;
                    delete drawItem._dragControlPoint2ControlPoint1;
                    delete drawItem._dragControlPoint2EndPoint;
                }
            }
        });
    }

    if (this._c2Line == null || this._c2Line.destroyed) {
        this._c2Line = this.createAutoChild("c2Line", {
            _constructor: "DrawLine",
            startLeft: this.endPoint[0], startTop: this.endPoint[1],
            endLeft: this.controlPoint2[0], endTop: this.controlPoint2[1],
            drawPane: this.drawPane,
            autoDraw: true
        });
    }
},

hideControlPoint2Knobs : function () {
    if (this._c2Knob) {
        this._c2Knob.destroy();
        delete this._c2Knob;
    }
    if (this._c2Line) {
        this._c2Line.erase();
        delete this._c2Line;
    }
},

updateControlKnobs : function () {
    // update the position of our start/end point knobs when we update our other control points
    this.Super("updateControlKnobs", arguments);
    if (this._startKnob || this._c1Line) {
        var left = this.startPoint[0],
            top = this.startPoint[1];

        // If we're showing the control line, update its start point
        if (this._c1Line) this._c1Line.setStartPoint(left,top);

        // startKnob is a canvas - hence drawing2Screen
        if (this._startKnob) {
            var screenCoords = this.drawPane.drawing2screen([left,top,0,0]);
            this._startKnob.setCenterPoint(screenCoords[0], screenCoords[1]);
        }

    }
    if (this._endKnob || this._c2Line) {
        var left = this.endPoint[0],
            top = this.endPoint[1];
        if (this._c2Line) this._c2Line.setStartPoint(left,top);
        if (this._endKnob) {
            var screenCoords = this.drawPane.drawing2screen([left,top,0,0]);
            this._endKnob.setCenterPoint(screenCoords[0], screenCoords[1]);
        }
    }

    if (this._c1Knob) {
        var left = this.controlPoint1[0], top = this.controlPoint1[1];
        // we always render c1Line with c1Point
        this._c1Line.setEndPoint(left,top);

        var screenCoords = this.drawPane.drawing2screen([left,top,0,0]);
        this._c1Knob.setCenterPoint(screenCoords[0], screenCoords[1]);
    }

    if (this._c2Knob) {
        var left = this.controlPoint2[0], top = this.controlPoint2[1];

        this._c2Line.setEndPoint(left,top);

        var screenCoords = this.drawPane.drawing2screen([left,top,0,0]);
        this._c2Knob.setCenterPoint(screenCoords[0], screenCoords[1]);
    }
},

//> @method drawCurve.moveTo()
// Sets start, end and control points of this curve
//
// @param x (int) new x coordinate in pixels
// @param y (int) new y coordinate in pixels
// @visibility drawing
//<
moveTo : function (x, y) {
  this.moveBy(x-this.startPoint[0],y-this.startPoint[1]);
},

//> @method drawCurve.moveBy()
// Increment start, end and control points of this curve
//
// @param x (int) new x coordinate in pixels
// @param y (int) new y coordinate in pixels
// @visibility drawing
//<
moveBy : function (x, y) {
    this.startPoint[0] += x;
    this.startPoint[1] += y;
    this.controlPoint1[0] += x;
    this.controlPoint1[1] += y;
    this.controlPoint2[0] += x;
    this.controlPoint2[1] += y;
    this.endPoint[0] += x;
    this.endPoint[1] += y;
    if (this.drawingVML) {
        this._vmlHandle.from = this.startPoint[0] + " " + this.startPoint[1];
        this._vmlHandle.to = this.endPoint[0] + " " + this.endPoint[1];
        this._vmlHandle.control1 = this.controlPoint1[0] + " " + this.controlPoint1[1];
        this._vmlHandle.control2 = this.controlPoint2[0] + " " + this.controlPoint2[1];
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "d", this.getPathSVG());
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
    this.Super("moveBy",arguments);
    this._moved(x,y);
}

}) // end DrawCurve.addProperties



//------------------------------------------------------------------------------------------
//> @class DrawBlockConnector
//
// DrawItem subclass to render multi-segment, orthogonal-routing paths.
//
// @inheritsFrom DrawCurve
// @treeLocation Client Reference/Drawing/DrawItem
// @visibility drawing
//<
//------------------------------------------------------------------------------------------

isc.defineClass("DrawBlockConnector", "DrawCurve").addProperties({
    startPoint: [0,0],
    endPoint: [100,100],

    //> @attr drawBlockConnector.controlPoint1  (Point : [100,0] : IRW)
    // First cubic bezier control point.
    // @visibility drawing
    //<
    controlPoint1: [100,0],

    //> @attr drawBlockConnector.controlPoint2  (Point : [0,100] : IRW)
    // Second cubic bezier control point.
    // @visibility drawing
    //<
    controlPoint2: [0,100],

    svgElementName: "path",
    vmlElementName: "curve",

init : function () {
    this.Super("init");
},

//----------------------------------------
//  DrawBlockConnector renderers
//----------------------------------------

getAttributesVML : function () {
    return  "FROM='" + this.startPoint[0] + " " + this.startPoint[1] +
            "' TO='" + this.endPoint[0] + " " + this.endPoint[1] +
            "' CONTROL1='" + this.controlPoint1[0] + " " + this.controlPoint1[1] +
            "' CONTROL2='" + this.controlPoint2[0] + " " + this.controlPoint2[1] +
            "'"
},

getAttributesSVG : function () {
    return  "d='" + this.getPathSVG() + "'"
},

//----------------------------------------
//  DrawBlockConnector attribute setters
//----------------------------------------

setStartPoint : function (left, top) {
    if (isc.isAn.Array(left)) {
        top = left[1];
        left = left[0];
    }

    if (left != null) this.startPoint[0] = left;
    if (top != null) this.startPoint[1] = top;
    if (this.drawingVML) {
        this._vmlHandle.from = this.startPoint[0] + " " + this.startPoint[1];
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "d", this.getPathSVG());
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
}

}) // end DrawBlockConnector.addProperties




//------------------------------------------------------------------------------------------
//> @class DrawPath
//
// Draws a multi-segment line.
//
// @inheritsFrom DrawItem
// @treeLocation Client Reference/Drawing/DrawItem
// @visibility drawing
//<
//------------------------------------------------------------------------------------------
isc.defineClass("DrawPath", "DrawItem").addProperties({
    //> @attr drawPath.knobs
    // <b>NOTE:</b> DrawPath items do not support knobs.
    // @include DrawItem.knobs
    //<

    //> @attr drawPath.points (Array of Point : [[0,0], [100,100]] : IRW)
    // Array of Points for the line.
    // @visibility drawing
    //<

    svgElementName: "polyline",
    vmlElementName: "POLYLINE",
    points: [[0,0], [100,100]],

init : function () {
    this.Super("init", arguments);
},

//> @method drawPath.getBoundingBox()
// Returns the min, max points
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    var point = this.points[0], min=[point[0], point[1]], max=[point[0], point[1]], i;
    for (i = 1; i < this.points.length; ++i) {
        point = this.points[i];
        min[0] = Math.min(min[0], point[0]);
        min[1] = Math.min(min[1], point[1]);
        max[0] = Math.max(max[0], point[0]);
        max[1] = Math.max(max[1], point[1]);
    }
    var box = [].concat(min, max);

    return box;
},

showResizeKnobs : null,
hideResizeKnobs : null,

showMoveKnobs : null,
hideMoveKnobs : null,

//----------------------------------------
//  DrawPath renderers
//----------------------------------------

getPathSVG : function () {
    var path = "M ", i, point = this.points[0];
    path += point[0] + " " + point[1] + " ";
    for (i = 1; i < this.points.length; ++i) {
        point = this.points[i];
        path += " L " + point[0] + " " + point[1];
    }
    return path;
},

getAttributesSVG : function () {
    var pointsText = this.getPointsText();
    return "points='" + pointsText + "'";
},

// get the list of points as a series of integers like "0 0 100 100" (representing the points
// [0,0] and [100,100], which is what VML and SVG want for a series of points
getPointsText : function () {
    var output = isc.SB.create(),
        points = this.points;
    for (var i = 0; i < points.length; i++) {
        output.append(points[i][0], " ", points[i][1]);
        if (i < points.length - 1) output.append(" ");
    }
    return output.toString();
},

getAttributesVML : function () {
    return isc.SB.concat(
        "STYLE='position:absolute; left:", this.left,
            "px; top:", this.top,
            "px; width:", this.width,
            "px; height:", this.height, "px;'",
            " POINTS='" + this.getPointsText() + "'");
//    return  "POINTS='" + this.getPointsText() + "'"
},


drawBitmapPath : function (context) {
    var points = this.points, angle, arrowDelta = 10, lastPoint = points.length-1, originX, originY;
    if (this.startArrow == "open") {
        context.save();
        context.beginPath();
        context.strokeStyle = this.lineColor;
        context.lineWidth = this.lineWidth;
        context.lineCap = "round";
        angle = this.computeAngle(points[0][0],points[0][1],points[1][0],points[1][1]);
        originX = points[0][0];
        originY = points[0][1];
        context.scale(1,1);
        context.translate(originX, originY);
        context.rotate(angle*Math.PI/180);
        this.bmMoveTo(arrowDelta,-arrowDelta, context);
        this.bmLineTo(0,0, context);
        this.bmLineTo(arrowDelta,arrowDelta, context);
        context.stroke();
        context.restore();
    } else if (this.startArrow == "block") {
        context.save();
        context.beginPath();
        context.fillStyle = this.lineColor;
        context.lineWidth = this.lineWidth;
        context.lineCap = "round";
        angle = this.computeAngle(points[0][0],points[0][1],points[1][0],points[1][1]);
        originX = points[0][0];
        originY = points[0][1];
        context.translate(originX, originY);
        context.rotate(angle*Math.PI/180);
        this.bmMoveTo(arrowDelta,-arrowDelta, context);
        this.bmLineTo(0,0, context);
        this.bmLineTo(arrowDelta,arrowDelta, context);
        context.closePath();
        context.fill();
        context.stroke();
        context.restore();
    }
    if (this.endArrow == "open") {
        context.save();
        context.beginPath();
        context.strokeStyle = this.lineColor;
        context.lineWidth = this.lineWidth;
        context.lineCap = "round";
        angle = this.computeAngle(points[lastPoint-1][0],points[lastPoint-1][1],points[lastPoint][0],points[lastPoint][1]);
        originX = points[lastPoint][0];
        originY = points[lastPoint][1];
        context.translate(originX, originY);
        context.rotate(angle*Math.PI/180);
        this.bmMoveTo(-arrowDelta,arrowDelta, context);
        this.bmLineTo(0,0, context);
        this.bmLineTo(-arrowDelta,-arrowDelta, context);
        context.stroke();
        context.restore();
    } else if (this.endArrow == "block") {
        context.save();
        context.beginPath();
        context.fillStyle = this.lineColor;
        context.lineWidth = this.lineWidth;
        context.lineCap = "round";
        angle = this.computeAngle(points[lastPoint-1][0],points[lastPoint-1][1],points[lastPoint][0],points[lastPoint][1]);
        originX = points[lastPoint][0];
        originY = points[lastPoint][1];
        context.translate(originX, originY);
        context.rotate(angle*Math.PI/180);
        this.bmMoveTo(-arrowDelta,arrowDelta, context);
        this.bmLineTo(0,0, context);
        this.bmLineTo(-arrowDelta,-arrowDelta, context);
        context.closePath();
        context.fill();
        context.restore();
    }
    this.bmMoveTo(points[0][0], points[0][1], context);
    for (var i = 1; i < points.length; i++) {
        var point = points[i];
        if(this.linePattern.toLowerCase() !== "solid") {
            this._drawLinePattern(points[i-1][0],points[i-1][1],points[i][0],points[i][1],context);
        } else {
            this.bmLineTo(point[0], point[1], context);
        }
    }
},

//> @method drawPath.getCenter()
// Get the center of the path
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    var point, i, x = 0, y = 0, length = this.points.length;
    for (i = 0; i < length; ++i) {
        point = this.points[i];
        x += point[0];
        y += point[1];
    }
    x = Math.round(x/length);
    y = Math.round(y/length);
    return [x,y];
},

//----------------------------------------
//  DrawPath attribute setters
//----------------------------------------
setPoints : function (points) {
    this.points = points;
    if (this.drawingVML) {
        this._vmlHandle.points.value = this.getPointsText();
    } else if (this.drawingSVG) {
        this._svgHandle.setAttributeNS(null, "d", this.getPathSVG());
    } else if (this.drawingBitmap) {
        this.drawPane.redrawBitmap();
    }
},
//> @method drawPath.moveTo(left,top)
// Move both the start and end points of the line, such that the startPoint ends up at the
// specified coordinate and the line length and angle are unchanged.
//
// @param left (int) new startLeft coordinate in pixels
// @param top (int) new startTop coordinate in pixels
// @visibility drawing
//<
moveTo : function (x, y) {
    var dX = x - this.points[0][0];
    var dY = y - this.points[0][1];
    this.moveBy(dX,dY);
},
//> @method drawPath.moveBy(dX,dY)
// Move the points by dX,dY
//
// @param dX (int) delta x coordinate in pixels
// @param dY (int) delta y coordinate in pixels
// @visibility drawing
//<
moveBy : function (dX, dY) {
    if(this.getClass().getClassName() !== 'DrawLinePath') {
        var point, length = this.points.length;
        for (var i = 0; i < length; ++i) {
            point = this.points[i];
            point[0] += dX;
            point[1] += dY;
        }
        if (this.drawingVML) {
            this._vmlHandle.points.value = this.getPointsText();
        } else if (this.drawingSVG) {
            this._svgHandle.setAttributeNS(null, "d", this.getPathSVG());
        } else if (this.drawingBitmap) {
            this.drawPane.redrawBitmap();
        }
    }
    this.Super("moveBy",arguments);
}

});

//> @class DrawPolygon
//
// DrawItem subclass to render polygons
//
// @inheritsFrom DrawPath
// @treeLocation Client Reference/Drawing/DrawItem
// @visibility drawing
//<
isc.defineClass("DrawPolygon", "DrawPath").addProperties({

    //> @attr drawPolygon.points (Array of Point : [[0,0], [50,50], [100,0]] : IRW)
    // Array of points of the polygon.
    // @visibility drawing
    //<

    //> @attr drawPolygon.lineCap     (LineCap : "butt" : IRW)
    // Style of drawing the corners of the polygon.
    //
    // @group line
    // @visibility drawing
    //<
    lineCap: "butt",

    svgElementName: "path",
    vmlElementName: "POLYLINE",
    points: [ [0,0], [50,50], [100,0] ]
});
isc.DrawPolygon.addMethods({

init : function () {
    this.Super("init");
},

getPointsText : function () {
    var output = isc.SB.create(),
        points = this.points;
    for (var i = 0; i < points.length; i++) {
        output.append(points[i][0], " ", points[i][1], " ");
    }
    output.append(points[0][0], " ", points[0][1]);
    return output.toString();
},

getPathSVG : function () {
    return this.Super("getPathSVG", arguments) + " Z";
},

getAttributesSVG : function () {
    return "d='" + this.getPathSVG() + "'";
},

drawBitmapPath : function (context) {
    var points = this.points;
    this.bmMoveTo(points[0][0], points[0][1], context);
    for (var i = 1; i < points.length; i++) {
        var point = points[i];
        this.bmLineTo(point[0], point[1], context);
    }
    context.closePath();
}

});

//------------------------------------------------------------------------------------------
//> @class DrawTriangle
//
//  DrawItem subclass to render triangles
//
//  @inheritsFrom DrawPolygon
//  @treeLocation Client Reference/Drawing/DrawItem
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

isc.defineClass("DrawTriangle", "DrawPolygon");

//> @attr drawTriangle.points (Array of Point : [[0,0], [50,50], [100,0]] : IRW)
// Array of points of the triangle.
// @visibility drawing
//<

isc.DrawTriangle.addMethods({

getCenter : function () {
    // Compute the Cartesian coordinates of the triangle's incenter using the formula listed at
    // http://en.wikipedia.org/wiki/Incenter#Coordinates_of_the_incenter
    // Then figure out where the incenter is as a percentage of the bounding box width and
    // height.
    var a = isc.Math.euclideanDistance(this.points[1], this.points[2]),
        b = isc.Math.euclideanDistance(this.points[0], this.points[2]),
        c = isc.Math.euclideanDistance(this.points[0], this.points[1]),
        P = a + b + c,
        u = [a, b, c],
        vx = [this.points[0][0], this.points[1][0], this.points[2][0]],
        vy = [this.points[0][1], this.points[1][1], this.points[2][1]],
        incenter = [isc.Math._dot(u, vx) / P, isc.Math._dot(u, vy) / P];

    return incenter;
}

});

//------------------------------------------------------------------------------------------
//> @class DrawLinePath
//
//  DrawItem subclass to render a connector between two points. If the points are aligned
//  on one axis, this connector will draw as a straight line. If the points are offset on
//  both axes and there is enough space, the connector will draw short horizontal segments
//  from the start and end points, and a diagonal segment connecting the ends of these
//  'margin' segments.
//
//  @inheritsFrom DrawItem
//  @treeLocation Client Reference/Drawing/DrawItem
//  @visibility drawing
//<
//------------------------------------------------------------------------------------------

isc.defineClass("DrawLinePath", "DrawPath").addProperties({
    //> @attr drawLinePath.knobs
    // Array of control knobs to display for this item. Each +link{knobType} specified in this
    // will turn on UI element(s) allowing the user to manipulate this DrawLinePath.  To update the
    // set of knobs at runtime use +link{drawItem.showKnobs()} and +link{drawItem.hideKnobs()}.
    // <p>
    // DrawLinePath supports the
    // <var class="smartclient">"startPoint" and "endPoint"</var>
    // <var class="smartgwt">{@link com.smartgwt.client.types.KnobType#STARTPOINT} and {@link com.smartgwt.client.types.KnobType#ENDPOINT}</var>
    // knob types.
    // @include DrawItem.knobs
    //<

    //> @attr drawLinePath.startPoint (Point : [0,0] : IRW)
    // @include drawLine.startPoint
    //<
    startPoint: [0,0],

    //> @attr drawLinePath.endPoint (Point : [100,100] : IRW)
    // @include drawLine.endPoint
    //<
    endPoint: [100,100],


    //> @attr drawLinePath.tailSize (int : 30 : IR)
    // Length of the horizontal "tail" between the start and end points of this LinePath and the
    // diagonal connecting segment
    // @visibility drawing
    //<
    tailSize: 30, // length of horizontal segments at each end

    //> @attr drawLinePath.startLeft (int : 0 , IRW)
    // @include drawLine.startLeft
    //<
    //> @attr drawLinePath.startTop (int : 0 , IRW)
    // @include drawLine.startTop
    //<

    //> @attr drawLinePath.endLeft (int : 0 , IRW)
    // @include drawLine.endLeft
    //<

    //> @attr drawLinePath.endTop (int : 0 , IRW)
    // @include drawLine.endTop
    //<

    startArrow:null,

    //> @attr drawLinePath.endArrow (ArrowStyle : "open", IRW)
    // @include drawItem.endArrow
    //<
    endArrow:"open",

init : function () {
    this.startLeft = (this.startLeft == 0 ? 0 : (this.startLeft || this.startPoint[0]));
    this.startTop = (this.startTop == 0 ? 0 : (this.startTop || this.startPoint[1]));
    this.endLeft = (this.endLeft == 0 ? 0 : (this.endLeft || this.endPoint[0]));
    this.endTop = (this.endTop == 0 ? 0 : (this.endTop || this.endPoint[1]));
    this.points = this._getSegmentPoints();
    this.Super("init");
},

_getSegmentPoints : function () {
    var tailWidth = this.tailSize;
    if (this.startLeft <= this.endLeft) {
        tailWidth = -tailWidth;
    }
    this._segmentPoints = [];
    this._segmentPoints.addList([
        [this.startLeft, this.startTop],
        [this.startLeft - tailWidth, this.startTop],
        [this.endLeft + tailWidth, this.endTop],
        [this.endLeft, this.endTop]
    ]);
    return this._segmentPoints;
},

_drawLineStartArrow : function () {
    return this.startArrow == "open"
},

_drawLineEndArrow : function () {
    return this.endArrow == "open"
},

//> @method drawLinePath.getCenter()
// Get the center coordinates of the line path
// @return (array) x, y coordinates
// @visibility drawing
//<
getCenter : function () {
    return [this.startPoint[0] + Math.round((this.endPoint[0] - this.startPoint[0])/2), this.startPoint[1] + Math.round((this.endPoint[1] - this.startPoint[1])/2)];
},

//----------------------------------------
//  DrawLinePath attribute setters
//----------------------------------------


//> @method drawLinePath.setStartPoint()
// @include drawLine.setStartPoint()
//<
setStartPoint : function (left, top) {
    if (isc.isAn.Array(left)) {
        top = left[1];
        left = left[0];
    }

    if (left != null) {
        this.startLeft = this.startPoint[0] = left;
    }
    if (top != null) {
        this.startTop = this.startPoint[1] = top;
    }

    // regenerate points
    this.setPoints(this._getSegmentPoints());

    this.updateControlKnobs();
},

//> @method drawLinePath.setEndPoint()
// @include drawLine.setEndPoint()
//<
setEndPoint : function (left, top) {
    if (isc.isAn.Array(left)) {
        top = left[1];
        left = left[0];
    }

    if (left != null) {
        this.endLeft = this.endPoint[0] = left;
    }
    if (top != null) {
        this.endTop = this.endPoint[1] = top;
    }

    // regenerate points
    this.setPoints(this._getSegmentPoints());

    this.updateControlKnobs();
},

drawBitmapPath : function (context) {
    // for start / end arrows of style "open" we use line segments to render out the
    // starting ending points (and suppress the VML / SVG block type heads)
    var arrowDelta = 10;
    if (this.startLeft > this.endLeft) arrowDelta = -arrowDelta;
    if (this.startArrow == "open") {
        this.bmMoveTo(this.startLeft + arrowDelta, this.startTop - arrowDelta, context);
        this.bmLineTo(this.startLeft, this.startTop, context);
        this.bmLineTo(this.startLeft + arrowDelta, this.startTop + arrowDelta, context);
    } else if (this.startArrow == "block") {
        context.stroke();
        context.beginPath();
        context.fillStyle = this.lineColor;
        context.lineWidth = "1px";
        context.lineCap = "round";
        this.bmMoveTo(this.startLeft + arrowDelta, this.startTop - arrowDelta, context);
        this.bmLineTo(this.startLeft, this.startTop, context);
        this.bmLineTo(this.startLeft + arrowDelta, this.startTop + arrowDelta, context);
        context.closePath();
        context.fill();
    }
    var points = this.points;
    this.bmMoveTo(points[0][0], points[0][1], context);
    for (var i = 1; i < points.length; i++) {
        var point = points[i];
        if(this.linePattern.toLowerCase() !== "solid") {
            this._drawLinePattern(points[i-1][0],points[i-1][1],points[i][0],points[i][1],context);
        } else {
            this.bmLineTo(point[0], point[1], context);
        }
    }
    if (this.endArrow == "open") {
        this.bmMoveTo(this.endLeft - arrowDelta, this.endTop + arrowDelta, context);
        this.bmLineTo(this.endLeft, this.endTop, context);
        this.bmLineTo(this.endLeft - arrowDelta, this.endTop - arrowDelta, context);
    } else if (this.endArrow == "block") {
        context.stroke();
        context.beginPath();
        context.fillStyle = this.lineColor;
        context.lineWidth = "1px";
        context.lineCap = "round";
        this.bmMoveTo(this.endLeft - arrowDelta, this.endTop + arrowDelta, context);
        this.bmLineTo(this.endLeft, this.endTop, context);
        this.bmLineTo(this.endLeft - arrowDelta, this.endTop - arrowDelta, context);
        context.closePath();
        context.fill();
    }
},

//> @method drawLinePath.getBoundingBox()
// Returns the startPoint, endPoint
// @return (array) x1, y1, x2, y2 coordinates
// @visibility drawing
//<
getBoundingBox : function () {
    var x1 = this.startPoint[0],
        y1 = this.startPoint[1],
        x2 = this.endPoint[0],
        y2 = this.endPoint[1];
    var left = Math.min(x1,x2),
        right = Math.max(x1, x2),
        top = Math.min(y1,y2),
        bottom = Math.max(y1,y2);
    return [left,top,right,bottom];

},

showResizeKnobs : null,
hideResizeKnobs : null,

showMoveKnobs : null,
hideMoveKnobs : null,

// steal start/endpoint knobs functions from drawLine
showStartPointKnobs : isc.DrawLine.getPrototype().showStartPointKnobs,
hideStartPointKnobs : isc.DrawLine.getPrototype().hideStartPointKnobs,
showEndPointKnobs : isc.DrawLine.getPrototype().showEndPointKnobs,
hideEndPointKnobs : isc.DrawLine.getPrototype().hideEndPointKnobs,
updateControlKnobs : isc.DrawLine.getPrototype().updateControlKnobs,

//> @method drawLinePath.moveBy()
// @include drawLine.moveBy()
//<
moveBy : function (x, y) {
    this.startLeft += x;
    this.startPoint[0] += x;
    this.startTop += y;
    this.startPoint[1] += y;
    this.endLeft += x;
    this.endPoint[0] += x;
    this.endTop += y;
    this.endPoint[1] += y;

    // regenerate points
    this.setPoints(this._getSegmentPoints());
    this.Super("moveBy",arguments);
    this._moved(x,y);
},
//> @method drawLinePath.moveTo()
// Moves the line path to the specified point
//<
moveTo : function (x, y) {
    this.moveBy(x-this.startLeft,y-this.startTop);
    this._moved(x,y);
}

}) // end DrawLinePath.addProperties


//------------------------------------------------------------------------------------------
//  Helpers
//------------------------------------------------------------------------------------------

isc.GraphMath = {
// convert polar coordinates (angle, distance) to screen coordinates (x, y)
// takes angles in degrees, at least -360 to 360 are supported, 0 degrees is 12 o'clock
zeroPoint : [0,0],
polar2screen : function (angle, radius, basePoint, round) {
    basePoint = basePoint || this.zeroPoint;
    var radians = Math.PI - ((angle+450)%360)/180*Math.PI;
    var point = [
        basePoint[0] + (radius * Math.cos(radians)), // x
        basePoint[1] + (-radius * Math.sin(radians)) // y
    ]
    if (round) {
        point[0] = Math.round(point[0]);
        point[1] = Math.round(point[1]);
    }
    return point;
},

// convert screen coordinates (x, y) to polar coordinates (angle, distance)
// returns an angle in degrees, 0-360, 0 degrees is 12 o'clock
screen2polar : function (x, y) {
    return [
        ((Math.PI - Math.atan2(-y,x))/Math.PI*180 + 270)%360, // angle
        Math.sqrt(Math.pow(x,2) + Math.pow(y,2)) // radius
    ]
},

// find the delta to go from angle1 to angle2, by the shortest path around the circle.  eg
// angle1=359, angle2=1, diff = 2.
// Does not currently support angles outside of 0-360
angleDifference : function (angle1, angle2) {
/*
[
isc.GraphMath.angleDifference(180, 90), // -90
isc.GraphMath.angleDifference(90, 180), // 90
isc.GraphMath.angleDifference(359, 1), // 2
isc.GraphMath.angleDifference(1, 359), // -2
isc.GraphMath.angleDifference(360, 1), // 1
isc.GraphMath.angleDifference(0, 1) // 1
];
*/
    var larger = Math.max(angle1, angle2),
        smaller = Math.min(angle1, angle2),
        clockwiseDiff = larger - smaller,
        counterDiff = smaller+360 - larger;
    if (counterDiff < clockwiseDiff) {
        var direction = larger == angle1 ? 1 : -1;
        return direction * counterDiff;
    } else {
        var direction = larger == angle1 ? -1 : 1;
        return direction * clockwiseDiff;
    }
},

// straight line difference between two points
straightDistance : function (pt1, pt2) {
    var xOffset = pt1[0] - pt2[0],
        yOffset = pt1[1] - pt2[1];
    return Math.sqrt(xOffset*xOffset+yOffset*yOffset);
},



// given coordinates for a line, and a length to trim off of each end of the line,
// return the coordinates for the trimmed line
trimLineEnds : function (x1, y1, x2, y2, trimStart, trimEnd) {
    // don't allow trimming to reverse the direction of the line - stop at the (proportional)
    // centerpoint, except for a fractional pixel difference between endpoints to preserve the
    // orientation of the line (and therefore any arrowheads)
    // TODO extend the reach of this logic so arrowheads *disappear* when the line is too short for them
    var fullLength = Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
    if (trimStart+trimEnd > fullLength) {
        var midX = trimStart/(trimStart+trimEnd) * (x2-x1) + x1;
        var midY = trimStart/(trimStart+trimEnd) * (y2-y1) + y1;
        return [
            midX + (x1==x2 ? 0 : x1>x2 ? 0.01 : -0.01),
            midY + (y1==y2 ? 0 : y1>y2 ? 0.01 : -0.01),
            midX + (x1==x2 ? 0 : x1>x2 ? -0.01 : 0.01),
            midY + (y1==y2 ? 0 : y1>y2 ? -0.01 : 0.01)
        ]
    }
    var angle = Math.atan2(y1-y2,x2-x1);
    return [
        x1 + (trimStart * Math.cos(angle)),
        y1 - (trimStart * Math.sin(angle)),
        x2 - (trimEnd * Math.cos(angle)),
        y2 + (trimEnd * Math.sin(angle))
    ]
}
} // end isc.GraphMath



// center a canvas on a new position
isc.Canvas.addProperties({
    setCenter : function (x, y) {
        this.moveTo(x - this.getVisibleWidth()/2, y - this.getVisibleHeight()/2);
    },
    getCenter : function () {
        return [
            this.getLeft() + this.getVisibleWidth()/2,
            this.getTop() + this.getVisibleHeight()/2
        ]
    }
})






/*
 LinkedList.
*/
isc.defineClass("LinkedList", "Class").addProperties({
length: 0,
init : function () {
    this.head = null;
},
add: function(data) {
    var node = {next:null,data:data};
    if(!this.head) {
        this.head = node;
    } else {
        var current = this.head;
        while(current.next) {
            current = current.next;
        }
        current.next = node;
    }
    this.length++;
},
get: function(index) {
    var data = null;
    if(index >= 0 && index < this.length) {
        var current = this.head, i = 0;
        while(i++ < index) {
            current = current && current.next;
        }
        data = current.data;
    }
    return data;
},
remove: function(index) {
    var data = null;
    if(index >= 0 && index < this.length) {
        var current = this.head, i = 0;
        if(index === 0) {
            this.head = current.next;
        } else {
            var previous;
            while(i++ < index) {
                previous = current;
                current = current && current.next;
            }
            previous.next = current.next;
        }
        data = current.data;
        this.length--;
    }
    return data;
},
toArray: function() {
    var array = [], current = this.head;
    while(current) {
        array.push(current.data);
        current = current.next;
    }
    return array;
}
});

/*
 A quadtree provides indexing and quick lookup of shapes located in 2D space. A quadtree
 will split a space into
 4 subspaces when a threshold of max_objects has been reached. Subdivision will stop when
 max_depth has been reached.
 Given a point, a quadtree will return the number of objects found in the quadrant containing
 this point.
*/
isc.defineClass("QuadTree", "Class").addProperties({
depth: 0,
maxDepth: 0,
maxChildren: 0,
init : function () {
    this.root = null;
    this.bounds = null;
},
insert : function(item) {
    if(isc.isAn.Array(item)) {
        var len = item.length;
        for(var i = 0; i < len; i++) {
            this.root.insert(item[i]);
        }
    } else {
        this.root.insert(item);
    }
},
remove : function(item) {
    this.root.remove(item);
},
clear : function() {
    this.root.clear();
},
retrieve : function(item) {
    return this.root.retrieve(item).slice();
},
update : function(item) {
    return this.root.update(item);
}
});

isc.defineClass("QuadTreeNode", "Class").addClassProperties({
TOP_LEFT:0,
TOP_RIGHT:1,
BOTTOM_LEFT:2,
BOTTOM_RIGHT:3
});

isc.QuadTreeNode.addProperties({
depth: 0,
maxDepth: 4,
maxChildren: 4,
init : function() {
    this.bounds = null;
    this.nodes = [];
    this.children = isc.LinkedList.create();
},
insert : function(item) {
    if(this.nodes.length) {
        var quadrants = this.findQuadrants(item);
        for(var i = 0; i < quadrants.length; ++i) {
            var quadrant = quadrants[i];
            this.nodes[quadrant].insert(item);
        }
        return;
    }
    this.children.add(item);
    var len = this.children.length;
    if(!(this.depth >= this.maxDepth) && len > this.maxChildren) {
        this.subdivide();
        for(var i = 0; i < len; i++) {
            this.insert(this.children.get(i));
        }
        this.children = isc.LinkedList.create();
    }
},
remove : function(item) {
    if(this.nodes.length) {
        var quadrants = this.findQuadrants(item);
        for(var i = 0; i < quadrants.length; ++i) {
            var quadrant = quadrants[i];
            this.nodes[quadrant].remove(item);
        }
    }
    for(var j = 0; j < this.children.length; ++j) {
        var data = this.children.get(j);
        if(data === item) {
            this.children.remove(j);
        }
    }
},
retrieve : function(point) {
    if(this.nodes.length) {
        var quadrant = this.findQuadrant(point);
        return this.nodes[quadrant].retrieve(point);
    }
    return this.children.toArray();
},
findQuadrant: function(point) {
    var b = this.bounds;
    var left = (point.x > b.x + b.width / 2)? false : true;
    var top = (point.y > b.y + b.height / 2)? false : true;
    //top left
    var quadrant = isc.QuadTreeNode.TOP_LEFT;
    if(left) {
        //left side
        if(!top) {
            //bottom left
            quadrant = isc.QuadTreeNode.BOTTOM_LEFT;
        }
    } else {
        //right side
        if(top) {
            //top right
            quadrant = isc.QuadTreeNode.TOP_RIGHT;
        } else {
            //bottom right
            quadrant = isc.QuadTreeNode.BOTTOM_RIGHT;
        }
    }
    return quadrant;
},
findQuadrants: function(item) {
    var quadrants = [];
    var qmap = {};
    var quadrant = this.findQuadrant({x:item.x,y:item.y});
    quadrants.push(quadrant);
    qmap[quadrant] = true;
    quadrant = this.findQuadrant({x:item.x+item.width,y:item.y+item.height});
    if(!qmap[quadrant]) {
        quadrants.push(quadrant);
        qmap[quadrant] = true;
    }
    quadrant = this.findQuadrant({x:item.x,y:item.y+item.height});
    if(!qmap[quadrant]) {
        quadrants.push(quadrant);
        qmap[quadrant] = true;
    }
    quadrant = this.findQuadrant({x:item.x+item.width,y:item.y});
    if(!qmap[quadrant]) {
        quadrants.push(quadrant);
    }
    return quadrants;
},
subdivide : function() {
    var depth = this.depth + 1;
    var bx = this.bounds.x;
    var by = this.bounds.y;
    //floor the values
    var b_w_h = (this.bounds.width / 2)|0;
    var b_h_h = (this.bounds.height / 2)|0;
    var bx_b_w_h = bx + b_w_h;
    var by_b_h_h = by + b_h_h;
    //top left
    this.nodes[isc.QuadTreeNode.TOP_LEFT] = isc.QuadTreeNode.create({depth:depth});
    this.nodes[isc.QuadTreeNode.TOP_LEFT].bounds = {x:bx, y:by, width:b_w_h, height:b_h_h};
    //top right
    this.nodes[isc.QuadTreeNode.TOP_RIGHT] = isc.QuadTreeNode.create({depth:depth});
    this.nodes[isc.QuadTreeNode.TOP_RIGHT].bounds = {x:bx_b_w_h,y:by,width:b_w_h,height:b_h_h};
    //bottom left
    this.nodes[isc.QuadTreeNode.BOTTOM_LEFT] = isc.QuadTreeNode.create({depth:depth});
    this.nodes[isc.QuadTreeNode.BOTTOM_LEFT].bounds = {x:bx,y:by_b_h_h,width:b_w_h,height:b_h_h};
    //bottom right
    this.nodes[isc.QuadTreeNode.BOTTOM_RIGHT] = isc.QuadTreeNode.create({depth:depth});
    this.nodes[isc.QuadTreeNode.BOTTOM_RIGHT].bounds = {x:bx_b_w_h,y:by_b_h_h,width:b_w_h,height:b_h_h};
},
clear : function() {
    this.children = isc.LinkedList.create();
    var len = this.nodes.length;
    for(var i = 0; i < len; i++) {
        this.nodes[i].clear();
    }
    this.nodes = [];
    this.depth = 0;
    this.maxDepth = 4;
    this.maxChildren = 4;
},
update : function(item) {
    this.remove(item);
    this.insert(item);
}
});






//------------------------------------------------------------
//> @class DrawKnob
// Canvas that renders a +link{drawItem} into a +link{DrawPane} and provides interactivity for
// that drawItem, including drag and drop.
// <P>
// A DrawKnob can either be initialized with a +link{drawItem.knobShape} or can create one via
// the +link{type:AutoChild} pattern.
// <P>
// DrawKnobs are used by the +link{drawItem.knobTypes,drawItem control knobs} subsystem.
//
// @inheritsFrom Canvas
// @treeLocation Client Reference/Drawing
// @visibility drawing
//<

isc.defineClass("DrawKnob", "Canvas").addProperties({
    width:10, height:10,
    overflow:"hidden",
    //border:"1px solid black",

    cursor:"crosshair",
    canDrag:true, dragAppearance:"target",

    dragStart: "return this._updatePoints('start');",
    dragMove: "return this._updatePoints('move');",
    dragStop: "return this._updatePoints('stop');",
    dragAppearance:"none",

    keepInParentRect:true,
    autoDraw:false, // typically addChild to drawPane

    //> @attr drawKnob.knobShape (AutoChild DrawItem : null : R)
    // The +link{DrawItem} instance rendered into this DrawKnob's drawPane
    // @visibility drawing
    //<

    //> @attr drawKnob.knobDefaults (DrawOval Properties : {...} : IRA)
    // Default properties for this component's +link{drawKnob.knobShape}. Has the
    // following properties by default:
    // <pre>
    //  radius : 5,
    //  lineWidth:2,
    //  fillColor:"#FF0000",
    //  fillOpacity:0.5,
    // </pre>
    // As with any auto-child defaults block, use +link{isc.changeDefaults()} to modify this
    // object.
    // @visibility drawing
    //<
    knobShapeDefaults : {
        _constructor:isc.DrawOval,
        // note that this is just the size of the visible shape - the size of the
        // draggable handle is governed by drawKnob.width / height
        radius : 5,
        lineWidth:2,
        fillColor:"#FF0000",
        fillOpacity:0.5,
        autoDraw:true,

        // suppress updateControlKnobs behaivor since we don't expect controlKnobs ON controlKnobs!
        updateControlKnobs : function () {
            return;
        },
        // Override erase to wipe the DrawKnob canvas out as well
        erase : function () {
            // erase() on the draw shape calls clear on the DrawKnob (canvas)
            // Avoid recursion via an "erasing" flag
            if (this.erasing) return;

            this.erasing = true;
            if (this.creator.isDrawn()) this.creator.clear();
            this.Super("erase", arguments);
            delete this.erasing;
        }
    },

    // Public Attributes:

    //> @attr DrawKnob.drawPane (DrawPane : null : IR)
    // +link{DrawPane} into which this DrawKnob's +link{drawKnob.knobShape} will be rendered.
    // @visibility drawing
    //<

    //> @attr DrawKnob.x (integer : null : IR)
    // X-Coordinate for this DrawKnob. DrawKnob will initially be drawn centered over this
    // coordinate
    // @visibility drawing
    //<

    //> @attr DrawKnob.y (integer : null : IR)
    // Y-Coordinate for this DrawKnob. DrawKnob will initially be drawn centered over this
    // coordinate
    // @visibility drawing
    //<

    initWidget : function () {

        if (isc.Browser.isIE && isc.Browser.version < 11 && this.drawPane.drawingType == "bitmap") {
            this.setBackgroundColor("White");
            this.setOpacity(0);
        }

        this.left = this.x - this.width/2;
        this.top = this.y - this.height/2;

        // create the shape that serves as a visible representation of the knob
        this.knobShape = this.createAutoChild("knobShape", {
            drawPane: this.drawPane,
            centerPoint: [this.x, this.y]
        });

        // add to drawPane as a CanvasItem
        this._drawCallingAddCanvasItem = true;
        this.drawPane.addCanvasItem(this);
        delete this._drawCallingAddCanvasItem;
    },

    //> @method DrawKnob.setCenterPoint()
    // Sets the center point of the drawKnob. If the additional <code>drawingCoords</code> attribute
    // is passed, coordinates are expected to be already adjusted for drawPane pan and zoom.
    // Otherwise coordinates are expected to be absolute pixel coordinates within the drawPane.
    // @param x (integer) new x coordinate for this drawKnob
    // @param y (integer) new y coordinate for this drawKnob
    // @param [drawingCoords] (boolean) If specified, <code>x</code> and <code>y</code> values are
    //  expected to be drawing coordinates - already adjusted for any zoom or pan applied to the
    //  drawPane.
    // @visibility drawing
    //<
    setCenterPoint : function (x, y, drawingCoords) {
        var screenLeft, screenTop;
        if (drawingCoords) {
            var screenCoords = this.drawPane.drawing2screen([x - this._drawingWidth/2,
                                                             y - this._drawingHeight/2, 0,0]);
            screenLeft = screenCoords[0],
            screenTop = screenCoords[1];
        } else {
            screenLeft = x - this.width/2;
            screenTop = y - this.height/2;
        }
        this.moveTo(screenLeft << 0, screenTop << 0);
    },

    setRect : function (left, top, width, height, animating) {
        if (isc.isAn.Array(left)) {
            top = left[1];
            width = left[2];
            height = left[3];
            left = left[0];
        } else if (isc.isAn.Object(left)) {
            top = left.top;
            width = left.width;
            height = left.height;
            left = left.left;
        }

        var keepInParentRect = this.keepInParentRect;
        if (keepInParentRect) {
            var drawPaneWidth = this.drawPane.getWidth(),
                drawPaneHeight = this.drawPane.getHeight(),
                right = Math.min(left + width, drawPaneWidth),
                bottom = Math.min(top + height, drawPaneHeight);
            left = Math.max(left, 0);
            top = Math.max(top, 0);
            width = right - left;
            height = bottom - top;

            if (width < 1 || height < 1) {
                this.hide();
                return false;
            } else {
                this.show();
            }
        }

        return this.Super("setRect", [left, top, width, height, animating]);
    },

    draw : function () {
        var drawnByAddCanvasItem = (this._drawCallingAddCanvasItem);

        if (!drawnByAddCanvasItem) return this.Super("draw", arguments);
    },

    // when we're programmatically moved, update our knob shape position to match.
    // Exception: When a canvasItem is added to a drawPane, zoom / pan of the drawPane will
    // call moveTo() on the canvasItem. In this case our shape has already been repositioned.
    moved : function () {
        if (!this.synchingToPane) this.updateKnobShape();
    },

    // _updatePoints - move the knobShape directly, then fire the 'updatePoints' notification
    // that a shape such as a DrawRect can observe to change it's dimensions.
    // The state argument is either "start", "move", or "stop".
    _updatePoints : function (state) {
        var x = isc.EH.getX(),
            y = isc.EH.getY(),
            screenX = x -
                (this.drawPane.getPageLeft() + this.drawPane.getLeftMargin() +
                 this.drawPane.getLeftBorderSize()),
            screenY = y -
                (this.drawPane.getPageTop() + this.drawPane.getTopMargin() +
                 this.drawPane.getTopBorderSize());
        var drawingCoords = this.drawPane.screen2drawing(
        [
            screenX, screenY,
            0, 0 // not using width & height
        ]);

        var left = drawingCoords[0],
            top = drawingCoords[1],
            dX = left - (this._drawingLeft + this._drawingWidth/2),
            dY = top - (this._drawingTop + this._drawingHeight/2);

        // call the observable / overrideable updatePoints() method
        this.updatePoints(left, top, dX, dY, state);

        // Note: we rely on the updatePoints implementation to actually move the DrawKnob to the
        // appropriate position.
        // We *could* center ourselves over the mouse pointer here but this would not allow
        // things like restricting dragging per axis, so let the item actually shift us to the
        // right new position.
    },

    // updateKnobShape() - reposition the knobShape under the canvas - fired in response to
    // canvas.moved()
    updateKnobShape : function () {

        var drawingCoords = this.drawPane.screen2drawing([
            this.getLeft() + this.getWidth()/2,
            this.getTop() + this.getHeight()/2,
            0, 0 // not using width & height
        ]);

        var x = drawingCoords[0],
            y = drawingCoords[1],
            newDrawingLeft =  x - this._drawingWidth/2,
            newDrawingTop =  y - this._drawingHeight/2;

        // remember to update cached drawing coords! (correcting center to topleft)
        this._drawingLeft = newDrawingLeft,
        this._drawingTop = newDrawingTop;

        // update our knobShape position
        this.knobShape.setCenterPoint(x,y);
    },

    //> @method drawKnob.updatePoints()
    // Method called in response to the user dragging this DrawKnob. May be observed or overridden
    // to allow drawItems to react to user drag interactions on this knob.
    // <P>
    // Note that the default implementation does nothing. When working with draw knobs directly this
    // is typically where you would both update the shape being controlled by the draw knob, and
    // ensure the drawKnob gets repositioned. You may also need to update the drawKnob
    // position in response to the drawItem being repositioned, resized, etc.
    //
    // @param x (integer) new x-coordinate of the drawKnob
    // @param y (integer) new y-coordinate of the drawKnob
    // @param dX (integer) horizontal distance moved
    // @param dY (integer) vertical distance moved
    // @param state (String) either "start", "move", or "stop", to indicate the current phase
    // of dragging of the DrawKnob for which the points need to be updated
    // @visibility drawing
    //<
    updatePoints: function (x, y, dX, dY, state) {
//!DONTOBFUSCATE  We need to observe complete with the intact var names
    },

    // On clear, wipe out the knobShape
    clear : function () {
        this.Super("clear", arguments);
        this.knobShape.erase();
    }
    // We should destroy this.knobShape on destroy() but don't yet have a destroy method on
    // drawItems
})

// register updatePoints as a stringMethod
isc.DrawKnob.registerStringMethods({
    updatePoints:"x,y,dX,dY"
});





//> @object GaugeSector
//
// Represents a sector on the gauge.
//
// @treeLocation Client Reference/Drawing/Gauge
// @visibility drawing
//<

//> @attr gaugeSector.fillColor (CSSColor : null : IR)
// @visibility drawing
//<

//> @attr gaugeSector.startAngle (float : 0 : IR)
// @visibility drawing
//<

//> @attr gaugeSector.endAngle (float : 0 : IR)
// @visibility drawing
//<

//> @attr gaugeSector.value (float : 0 : IR)
// @visibility drawing
//<


//> @class Gauge
//
// The Gauge widget class implements a graphical speedometer-style gauge for displaying
// a measurement by means of a needle on a dial. The dial is divided into sectors, each having
// its own color and value.
// <P>
// <b>NOTE:</b> you must load the Drawing +link{group:loadingOptionalModules,Optional Module}
// before you can use Gauge.
//
// @inheritsFrom DrawPane
// @treeLocation Client Reference/Drawing
// @visibility drawing
// @example Gauge
//<

isc.ClassFactory.defineClass("Gauge", "DrawPane");

isc.Gauge.addProperties({
width: 400,
height: 400,

redrawOnResize: true,

//> @attr gauge.dialRadius (float : 150 : IR)
// Radius in pixels of the dial.
//
// @visibility drawing
//<
dialRadius: 150,

//> @attr gauge.knobRadius (float : 6 : IR)
// Radius in pixels of the knob.
//
// @visibility internal
//<

knobRadius: 6,

//> @attr gauge.fontSize (int : 11 : IR)
// Font size of sector labels. Must be at least 3.
//
// @see DrawLabel.fontSize
// @visibility drawing
//<
fontSize: 11,

//> @attr gauge.borderWidth (int : 1 : IR)
// Pixel width for gauge sector borders.
//
// @see DrawItem.lineWidth
// @visibility drawing
//<
borderWidth: 1,

//> @attr gauge.borderColor (CSSColor : "#333333" : IR)
// Color for gauge sector borders.
//
// @see DrawItem.lineColor
// @visibility drawing
//<
borderColor: "#333333",

//> @attr gauge.scaleColor (CSSColor : null : IR)
// Color for gauge scale markings.
//
// Default value of null means to use the color specified by
// +link{gauge.borderColor}.
//<
scaleColor: null,

//> @attr gauge.needleColor (CSSColor : "#000000" : IR)
// Color for gauge needle.
//
// Value of null means to use the color specified by
// +link{gauge.borderColor}.  No matter the value, the needle
// border color will be taken from +link{gauge.borderColor}.
//<
needleColor: "#000000",

//> @attr gauge.sectorColors (Array of CSSColor : [ "#AFFFFF", "#008080", "#AAAFFF", "#FF0000", "#FFCC99", "#800080" ] : IR)
// Array of preset fill colors used by the default implementation of +link{Gauge.getDefaultFillColor()}
// to initialize the fill color of new sectors.
//
// <p>The default array of colors is:
// <table border="0" cellpadding="0" cellspacing="2">
//   <tr>
//     <td style="background-color:#AFFFFF;width:90px;height:90px;text-align:center"><a style="vertical-align:middle">#AFFFFF</a></td>
//     <td style="background-color:#008080;width:90px;height:90px;text-align:center"><a style="vertical-align:middle">#008080</a></td>
//     <td style="background-color:#AAAFFF;width:90px;height:90px;text-align:center"><a style="vertical-align:middle">#AAAFFF</a></td>
//     <td style="background-color:#FF0000;width:90px;height:90px;text-align:center"><a style="vertical-align:middle">#FF0000</a></td>
//     <td style="background-color:#FFCC99;width:90px;height:90px;text-align:center"><a style="vertical-align:middle">#FFCC99</a></td>
//     <td style="background-color:#800080;width:90px;height:90px;text-align:center"><a style="vertical-align:middle">#800080</a></td>
//   </tr>
// </table>
// @see DrawItem.fillColor
// @visibility drawing
//<
sectorColors: [ "#AFFFFF", "#008080", "#AAAFFF", "#FF0000", "#FFCC99", "#800080" ],

//> @attr gauge.minValue (float : 0 : IRW)
// The minimum dial value.
//
// @visibility drawing
//<
minValue: 0,

//> @attr gauge.maxValue (float : 100 : IRW)
// The maximum dial value.
//
// @visibility drawing
//<
maxValue: 100,

//> @attr gauge.value (float : 0 : IRW)
// The current value on the dial.
//
// @visibility drawing
//<
value: 0,

//> @attr gauge.numMajorTicks (int : 0 : IRW)
// The number of major tick lines.
//
// @visibility drawing
//<
numMajorTicks: 0,

//> @attr gauge.numMinorTicks (int : 0 : IRW)
// The number of minor tick lines.
//
// @visibility drawing
//<
numMinorTicks: 0,

//> @attr gauge.labelPrefix (string : "" : IRW)
// The label prefix.
//
// @see Gauge.formatLabelContents
// @visibility drawing
//<
labelPrefix: "",

//> @attr gauge.labelSuffix (string : "%" : IRW)
// The label suffix.
//
// @see Gauge.formatLabelContents
// @visibility drawing
//<
labelSuffix: "%",

//> @attr gauge.drawnClockwise (boolean : true : IRW)
// Whether the sectors are drawn clockwise, and increasing the value causes the
// needle to move clockwise.
//
// @visibility drawing
//<
drawnClockwise: true,

//> @attr gauge.sectors (Array of GaugeSector : null : IRW)
// The GaugeSectors contained in this Gauge.
//
// If this this property is not specified, the gauge will
// be created with a default sector filling the gauge.
// @visibility drawing
//<
sectors: null,

//> @attr gauge.pivotPoint (Point : null : R)
// The pivot point of the needle.
//
// @visibility drawing
//<
pivotPoint: null,

//> @attr gauge.sectorDefaults (GaugeSector Properties : : IRA)
// Default GaugeSector properties for a newly created sector.
//<
sectorDefaults: {
    fillColor: null,
    startAngle: 0,
    endAngle: 0,
    value: 0
}

});

isc.Gauge.addMethods({
initWidget : function () {
    this.Super("initWidget", arguments);

    if (this.fontSize < 3) {
        this.logWarn("Gauge specified with fontSize:" + this.fontSize + ". Setting to 3.");
        this.fontSize = 3;
    }

    if (!(this.sectorColors instanceof Array)) {
        this.logWarn("Gauge specified with non-array sectorColors. Setting to [ \"#AFFFFF\" ].");
        this.sectorColors = [ "#AFFFFF" ];
    }
    if (this.sectorColors.length == 0) {
        this.logWarn("Gauge specified with empty sectorColors array. Setting to [ \"#AFFFFF\" ].");
        this.sectorColors = [ "#AFFFFF" ];
    }

    // If passed a min value that is greater than the max value, swap them.
    if (this.minValue > this.maxValue) {
        this.logWarn("Gauge specified with minValue:" + this.minValue + ", greater than " +
                     "maxValue:" + this.maxValue + ". Swapping.");
        var tmp = this.minValue;
        this.minValue = this.maxValue;
        this.maxValue = tmp;
    }

    // If passed a max value that is not at least 1 greater than the min value, set the max
    // value to 1 + minValue.
    if (!(this.maxValue >= 0.99999 + this.minValue)) {
        this.logWarn("Gauge specified with maxValue:" + this.maxValue + ", not at least 1 " +
                     "greater than minValue:" + this.minValue);
        this.maxValue = 1 + this.minValue;
    }

    // Ensure that the value is between the min value and the max value.
    this.value = Math.min(Math.max(this.value, this.minValue), this.maxValue);

    this.numMajorTicks = Math.floor(this.numMajorTicks);
    this.numMajorTicks = Math.max(0, this.numMajorTicks);
    if (this.numMajorTicks != 0) {
        this.numMajorTicks = Math.max(2, this.numMajorTicks);
    }

    this.numMinorTicks = Math.floor(this.numMinorTicks);
    this.numMinorTicks = Math.max(0, this.numMinorTicks);
    if (this.numMinorTicks != 0) {
        this.numMinorTicks = Math.max(2, this.numMinorTicks);
    }

    this._makePivotPoint(this.getInnerContentWidth(), this.getInnerContentHeight());

    this.setSectors(this.sectors ? this.sectors : [{
        fillColor: this.getDefaultFillColor(0),
        startAngle: 0,
        endAngle: 180,
        value: this.maxValue
    }]);

},

resized : function (deltaX, deltaY) {
    this._makePivotPoint(this.getInnerContentWidth(), this.getInnerContentHeight());
    this._makeItems();
},

_makeItems : function () {
    this.erase();

    if (this._tickLines != null) {
        var existingTickLines = this._tickLines;
        for (var i = 0; i < existingTickLines.length; ++i) {
            existingTickLines[i].destroy();
        }
        delete this._tickLines;
    }
    if (this._labels != null) {
        var existingLabels = this._labels;
        for (var i = 0; i < existingLabels.length; ++i) {
            existingLabels[i].destroy();
        }
        delete this._labels;
    }

    this._makeDrawSectors();
    this._makeNeedle();
    this._positionNeedleTriangle(this.value);
    this._makeLabels();
},

_makePivotPoint : function (width, height) {
    this.pivotPoint = [ width / 2, height * 0.70 ];
},

_makeDrawSectors : function () {


    var drawSectors = new Array(this.sectors.length);

    if (this._drawSectors) {
        for (var i = 0; i < this._drawSectors.length; ++i) {
            this._drawSectors[i].destroy();
        }
    }

    var sectors = this.sectors;
    for (var sectorIndex = 0; sectorIndex < sectors.length; ++sectorIndex) {
        var sector = sectors[sectorIndex];

        var startAngle, endAngle;
        if (this.drawnClockwise) {
            startAngle = sector.startAngle - 180;
            endAngle = sector.endAngle - 180;
        } else {
            startAngle = -sector.endAngle;
            endAngle = -sector.startAngle;
        }

        var drawSector;
        drawSectors[sectorIndex] = drawSector = isc.DrawSector.create({
            radius: this.dialRadius,
            centerPoint: this.pivotPoint,
            startAngle: startAngle,
            endAngle: endAngle,
            lineWidth: this.borderWidth,
            lineColor: this.borderColor,
            fillColor: sector.fillColor
        });
        this.addDrawItem(drawSector, true);
    }
    this._drawSectors = drawSectors;

    this._makeTickLines();
},

_makeTickLines : function () {


    var numMajorTicks = this.numMajorTicks;
    var numMinorTicks = this.numMinorTicks;
    var drawnClockwise = this.drawnClockwise;
    var pivotPoint = this.pivotPoint;

    var tickLines;
    var i;

    if (!this._tickLines) {
        tickLines = new Array(numMajorTicks + numMinorTicks);
    } else if (this._tickLines.length != numMajorTicks + numMinorTicks) {
        for (i = numMajorTicks + numMinorTicks; i < this._tickLines.length; ++i) {
            this._tickLines[i].destroy();
        }
        tickLines = new Array(numMajorTicks + numMinorTicks);
        for (i = 0; i < tickLines.length; ++i) {
            tickLines[i] = this._tickLines[i];
        }
    } else {
        tickLines = this._tickLines;
    }

    var scaleColor = this.scaleColor ? this.scaleColor : this.borderColor;

    for (i = 0; i < numMajorTicks; ++i) {
        var angleRad = Math.PI - Math.PI * i / (numMajorTicks - 1);
        if (!drawnClockwise) {
            angleRad = Math.PI - angleRad;
        }

        // See _positionNeedleTriangle() for a short explanation of the math. Essentially
        // polar coordinates are being converted to Cartesian.
        var x = (this.dialRadius + 3) * Math.cos(angleRad);
        var y = (this.dialRadius + 3) * Math.sin(angleRad);
        var p = [ pivotPoint[0] + x, pivotPoint[1] - y ];

        var x2 = (this.dialRadius - 10) * Math.cos(angleRad);
        var y2 = (this.dialRadius - 10) * Math.sin(angleRad);
        var p2 = [ pivotPoint[0] + x2, pivotPoint[1] - y2 ];

        if (!tickLines[i]) {
            tickLines[i] = isc.DrawLine.create({
                lineColor: scaleColor,
                startPoint: p2,
                endPoint: p,
                lineWidth: 2
            });
        } else {
            tickLines[i].setLineColor(scaleColor);
            tickLines[i].setStartPoint(p[0], p[1]);
            tickLines[i].setEndPoint(p2[0], p2[1]);
        }
    }

    for (var j = 0; j < numMinorTicks; ++j, ++i) {
        var angleRad = Math.PI - Math.PI * j / (numMinorTicks - 1);
        if (!drawnClockwise) {
            angleRad = Math.PI - angleRad;
        }

        var x = this.dialRadius * Math.cos(angleRad);
        var y = this.dialRadius * Math.sin(angleRad);
        var p = [ pivotPoint[0] + x, pivotPoint[1] - y ];

        var x2 = (this.dialRadius - 5) * Math.cos(angleRad);
        var y2 = (this.dialRadius - 5) * Math.sin(angleRad);
        var p2 = [ pivotPoint[0] + x2, pivotPoint[1] - y2 ];

        if (!tickLines[i]) {
            tickLines[i] = isc.DrawLine.create({
                lineColor: scaleColor,
                startPoint: p2,
                endPoint: p,
                lineWidth: 1
            });
        } else {
            tickLines[i].setLineColor(scaleColor);
            tickLines[i].setStartPoint(p[0], p[1]);
            tickLines[i].setEndPoint(p2[0], p2[1]);
        }
    }

    for (i = 0; i < tickLines.length; ++i) {
        this.addDrawItem(tickLines[i], true);
    }
    this._tickLines = tickLines;
},

_makeNeedle : function () {


    var triangleColor = this.needleColor ? this.needleColor : this.borderColor;

    if (!this._needleTriangle) {
        this._needleTriangle = isc.DrawTriangle.create({
            drawPane: this,
            autoDraw: true,
            lineColor: this.borderColor,
            lineWidth: this.borderWidth,
            fillColor: triangleColor
        });
    } else {
        var triangle = this._needleTriangle;
        triangle.setLineColor(this.borderColor);
        triangle.setLineWidth(this.borderWidth);
        triangle.setFillColor(triangleColor);
        this.addDrawItem(triangle, true);
    }

    this._makeKnob();
},

_makeKnob : function () {


    var knobColor = this.needleColor ? this.needleColor : this.borderColor;

    if (!this._knob) {
        this._knob = isc.DrawOval.create({
            drawPane: this,
            autoDraw: true,
            centerPoint: this.pivotPoint,
            radius: this.knobRadius,
            lineColor: this.borderColor,
            lineWidth: this.borderWidth,
            fillColor: knobColor
        });
    } else {
        var knob = this._knob;
        knob.setCenterPoint(this.pivotPoint[0], this.pivotPoint[1]);
        knob.setRadius(this.knobRadius);
        knob.setLineColor(this.borderColor);
        knob.setLineWidth(this.borderWidth);
        knob.setFillColor(knobColor);
        this.addDrawItem(knob, true);
    }
},

_makeLabels : function () {


    var sectors = this.sectors;
    var labels = new Array(1 + sectors.length);

    if (this._labels) {
        for (var i = 0; i < this._labels.length; ++i) {
            this._labels[i].destroy();
        }
    }

    var minimumLabel;
    labels[0] = minimumLabel = this._makePositionedLabel(this.formatLabelContents(this.minValue),
                                                         this.minValue);
    this.addDrawItem(minimumLabel, true);

    for (var sectorIndex = 0; sectorIndex < sectors.length; ++sectorIndex) {
        var sector = sectors[sectorIndex];
        var label = this._makePositionedLabel(this.formatLabelContents(sector.value),
                                              sector.value);
        labels[1 + sectorIndex] = label;
        this.addDrawItem(label, true);
    }

    this._labels = labels;
},

//> @method gauge.setMinValue()
// Sets the minimum dial value, rescaling all sectors and the dial value.
//
// @param minValue (float) the new minimum dial value. Must be at least 1 less than the
// maximum dial value. If <code>minValue</code> is not at least 1 less than the maximum value,
// then it is set to <code>maxValue - 1</code>.
// @visibility drawing
//<
setMinValue : function (minValue) {
    minValue = Math.min(0 + minValue, this.maxValue - 1);
    this._rescaleSectors(minValue, this.maxValue);
},

//> @method gauge.setMaxValue()
// Sets the maximum dial value, rescaling all sectors and the dial value.
//
// @param maxValue (float) the new maximum dial value. Must be at least 1 greater than the
// minimum dial value. If <code>maxValue</code> is not at least 1 greater than the minimum
// value, then it is set to <code>1 + minValue</code>.
// @visibility drawing
//<
setMaxValue : function (maxValue) {
    maxValue = Math.max(0 + maxValue, 1 + this.minValue);
    this._rescaleSectors(this.minValue, maxValue);
},

_rescaleSectors : function (newMinValue, newMaxValue) {
    var maxValue = this.maxValue;
    var minValue = this.minValue;
    var sectors = this.sectors;

    var scale = maxValue - minValue;
    var newScale = newMaxValue - newMinValue;

    var prevEndAngle = 0;
    for (var sectorIndex = 0; sectorIndex < sectors.length; ++sectorIndex) {
        var sector = sectors[sectorIndex];
        var newValue = newScale * (sector.value - minValue) / scale + newMinValue;
        sector.value = newValue;
        sector.startAngle = prevEndAngle;
        sector.endAngle = prevEndAngle = this._getSectorEndAngle(newValue, newMinValue, newScale);
    }

    this.value = newScale * (this.value - minValue) / scale + newMinValue;

    this.minValue = minValue = newMinValue;
    this.maxValue = maxValue = newMaxValue;

    this._makeItems();
},

//> @method gauge.setValue()
// Sets the value on the dial that the needle is displaying.
//
// @param value (float) the new dial value. Must be between +link{gauge.minValue, minValue} and
// +link{gauge.maxValue, maxValue}.
// @visibility drawing
//<
setValue : function (value) {
    // Ensure that `value` is between the min value and the max value.
    value = Math.min(Math.max(0 + value, this.minValue), this.maxValue);
    this._positionNeedleTriangle(value);
    this.value = value;
},

//> @method gauge.setNumMajorTicks()
// Sets the number of major tick lines.
//
// <p><b>NOTE:</b> To divide the dial into <i>n</i> regions, you will need <i>n</i> + 1 ticks.
// For example, if the minimum value is 0 and the maximum value is 100, then to place major
// tick lines at 0, 10, 20, 30, ..., 90, 100, you need 11 (10 + 1) major ticks.
//
// @param numMajorTicks (int) the number of major tick lines to draw. Must be either 0 or an
// integer greater than or equal to 2.
// @visibility drawing
//<
setNumMajorTicks : function (numMajorTicks) {
    numMajorTicks = Math.floor(numMajorTicks);
    if (this.numMajorTicks != numMajorTicks) {
        numMajorTicks = Math.max(0, numMajorTicks);
        if (numMajorTicks != 0) {
            numMajorTicks = Math.max(2, numMajorTicks);
        }
        this.numMajorTicks = numMajorTicks;
        this._makeItems();
    }
},

//> @method gauge.setNumMinorTicks()
// Sets the number of minor tick lines.
//
// <p><b>NOTE:</b> To divide the dial into <i>n</i> regions, you will need <i>n</i> + 1 ticks.
// For example, if the minimum value is 0 and the maximum value is 100, then to place minor
// tick lines at 0, 1, 2, 3, 4, 5, ..., 99, 100, you need 101 (100 + 1) minor ticks.
//
// @param numMinorTicks (int) the number of minor tick lines to draw. Must be either 0 or an
// integer greater than or equal to 2.
// @visibility drawing
//<
setNumMinorTicks : function (numMinorTicks) {
    numMinorTicks = Math.floor(numMinorTicks);
    if (this.numMinorTicks != numMinorTicks) {
        numMinorTicks = Math.max(0, numMinorTicks);
        if (numMinorTicks != 0) {
            numMinorTicks = Math.max(2, numMinorTicks);
        }
        this.numMinorTicks = numMinorTicks;
        this._makeItems();
    }
},

//> @method gauge.setLabelPrefix()
// Sets the +link{Gauge.labelPrefix,labelPrefix} property and re-creates all sector labels.
//
// @param labelPrefix (String) the new label prefix.
// @visibility drawing
//<
setLabelPrefix : function (labelPrefix) {
    if (labelPrefix == null) labelPrefix = "";
    if (this.labelPrefix != labelPrefix) {
        this.labelPrefix = labelPrefix;
        this.reformatLabelContents();
    }
},

//> @method gauge.setLabelSuffix()
// Sets the +link{Gauge.labelSuffix,labelSuffix} property and re-creates all sector labels.
//
// @param labelSuffix (String) the new label suffix.
// @visibility drawing
//<
setLabelSuffix : function (labelSuffix) {
    if (labelSuffix == null) labelSuffix = "";
    if (this.labelSuffix != labelSuffix) {
        this.labelSuffix = labelSuffix;
        this.reformatLabelContents();
    }
},

//> @method gauge.setDrawnClockwise()
// Sets the +link{gauge.drawnClockwise, drawnClockwise} property and redraws the gauge.
//
// @param drawnClockwise (boolean) whether the sectors are drawn clockwise.
// @visibility drawing
//<
setDrawnClockwise : function (drawnClockwise) {
    drawnClockwise = !!drawnClockwise;
    if (this.drawnClockwise != drawnClockwise) {
        this.drawnClockwise = drawnClockwise;
        this._makeItems();
    }
},

//> @method gauge.formatLabelContents() (A)
// Formats a value as a string to be used as the contents of a +link{DrawLabel}. The default
// implementation prepends +link{gauge.labelPrefix, labelPrefix} and appends
// +link{gauge.labelSuffix, labelSuffix} to <code>value</code>.
// <p>
// <b>NOTE:</b> If a subclass overrides this, then whenever it changes the way that values are
// formatted, it must call +link{Gauge.reformatLabelContents()}.
//
// @param value (float) the value to format.
// @return (string) label contents.
// @visibility drawing
//<
formatLabelContents : function (value) {
    return this.labelPrefix + (0 + value) + this.labelSuffix;
},

//> @method gauge.reformatLabelContents() (A)
// Resets the contents of all labels. This involves calling +link{Gauge.formatLabelContents()}
// to get the label contents for each corresponding value and repositioning the label.
//
// @visibility drawing
//<
reformatLabelContents : function () {
    this._makeItems();
},

//> @method gauge.getNumSectors()
// Gets the number of sectors.
//
// @return (int) the number of sectors on this gauge.
// @visibility drawing
//<
getNumSectors : function () {
    return this.sectors.length;
},

//> @method gauge.getSectorValue()
// Gets the value of the sector at <code>sectorIndex</code>.
//
// @param sectorIndex (int) index of the target sector.
// @return (float) the value of the sector at <code>sectorIndex</code>.
// @visibility drawing
//<
getSectorValue : function (sectorIndex) {
    return this.sectors[sectorIndex].value;
},

//> @method gauge.getDefaultFillColor() (A)
// Gets the default fill color for the sector at index <code>sectorIndex</code>. The default
// implementation cycles through +link{gauge.sectorColors, sectorColors}
// using modular arithmetic.
//
// @param sectorIndex (int) index of the target sector.
// @return (CSSColor) a fill color.
// @visibility drawing
//<
getDefaultFillColor : function (sectorIndex) {
    var numDefaultColors = this.sectorColors.length;
    return this.sectorColors[sectorIndex % numDefaultColors];
},

//> @method gauge.getSectorFillColor()
// Gets the fill color of the sector at index <code>sectorIndex</code>.
//
// @param sectorIndex (int) index of the target sector.
// @return (CSSColor) the fill color of the sector at <code>sectorIndex</code>.
// @see DrawItem.fillColor
// @visibility drawing
//<
getSectorFillColor : function (sectorIndex) {
    return this.sectors[sectorIndex].fillColor;
},

//> @method gauge.setSectorFillColor()
// Sets the fill color of the sector at <code>sectorIndex</code>.
//
// @param sectorIndex (int) index of the target sector.
// @param fillColor (CSSColor) the new fill color.
// @see DrawItem.setFillColor
// @visibility drawing
//<
setSectorFillColor : function (sectorIndex, fillColor) {
    var sectors = this.sectors;
    var drawSectors = this._drawSectors;

    sectors[sectorIndex].fillColor = fillColor;

    if (drawSectors && drawSectors.length == sectors.length) {
        drawSectors[sectorIndex].setFillColor(fillColor);
    } else {
        this._makeItems();
    }
},

// Shift fill colors left by one - when new sector has no specified color
_shiftSectorFillColor : function (sector, index) {
    if (index < this.sectors.length) {
        sector.fillColor = this.sectors[index].fillColor;
    } else {
        sector.fillColor = this.getDefaultFillColor(index);
    }
},

//> @method gauge.getSectorLabelContents()
// Gets the label contents of the label for the sector at sectorIndex.
//
// @param sectorIndex (int) index of the target sector.
// @return (String) the label contents of the sector's label.
// @visibility drawing
//<
getSectorLabelContents : function (sectorIndex) {
    return this.formatLabelContents(this.sectors[sectorIndex].value);
},

//> @method gauge.setBorderColor()
// Sets the border color for this gauge.
//
// @param color (CSSColor) color of the gauge border
//<
setBorderColor : function (color) {
    this.borderColor = color;
    this.redraw();
},

//> @method gauge.setBorderWidth()
// Sets the border width for this gauge.
//
// @param color (int) width of the gauge border
//<
setBorderWidth : function (width) {
    this.borderWidth = width;
    this.redraw();
},

//> @method gauge.setSectors()
// Sets the sectors for this gauge.
// @param (Array of GaugeSector) the sectors to show on the gauge.
// @visibility drawing
//<
setSectors : function (sectors) {
    this.sectors = [];
    for (var i = 0; i < sectors.length; i++) {
        this.addSector(sectors[i], true);
    }

    this._makeItems();
},

//> @method gauge.addSector()
// Adds a new sector.
//
// @param value (float) the new sector's value. This is formatted with +link{Gauge.formatLabelContents()}
// to get its label.
// @return (int) the index of the newly-added sector.
// @visibility drawing
//<
addSector : function (newSector, dontMakeItems) {

    var value = isc.isAn.Object(newSector) ? newSector.value : newSector;

    // add sector defaults, and deal with a value being passed in for the sector
    newSector = isc.addProperties({}, this.sectorDefaults, isc.isAn.Object(newSector) ?
                                  newSector : {value: newSector});

    // Ensure that `value` is between the min value and the max value.
    value = Math.min(Math.max(0 + value, this.minValue), this.maxValue);

    var sectors = this.sectors;
    var maxValue = this.maxValue;
    var minValue = this.minValue;

    var newSectorIndex = 0;

    // Determine where the new GaugeSector object should go in `this.sectors`.
    for (; newSectorIndex < sectors.length &&
           sectors[newSectorIndex].value < value; ++newSectorIndex)
    {
        /*empty*/
    }

    var tmp = new Array(sectors.length + 1);
    for (var sectorIndex = 0; sectorIndex < newSectorIndex; ++sectorIndex) {
        tmp[sectorIndex] = sectors[sectorIndex];
    }

    var prevEndAngle,
        scale = maxValue - minValue,
        shiftSectorColors = !newSector.fillColor;

    newSector.startAngle = this._getSectorStartAngle(newSectorIndex, minValue, scale);
    newSector.endAngle = prevEndAngle = this._getSectorEndAngle(value, minValue, scale);
    tmp[newSectorIndex] = newSector;

    if (shiftSectorColors) this._shiftSectorFillColor(newSector, newSectorIndex);

    if (newSectorIndex < sectors.length) {
        sectors[newSectorIndex].startAngle = prevEndAngle;
    }

    for (var sectorIndex = newSectorIndex; sectorIndex < sectors.length; ++sectorIndex) {
        var sector = sectors[sectorIndex];

        // Continue shifting sector fill colors left by one.
        if (shiftSectorColors) this._shiftSectorFillColor(sector, sectorIndex+1);

        tmp[sectorIndex + 1] = sector;
    }

    this.sectors = sectors = tmp;

    if (!dontMakeItems) {
        this._makeItems();
    }

    return newSectorIndex;
},

//> @method gauge.removeSector()
// Removes the sector at sectorIndex.
// <p>
// <b>NOTE:</b> There must always be one sector and it is not possible to remove the sole remaining
// sector. Calling this method to attempt to remove the sole remaining sector is a no-op.
//
// @param sectorIndex (int) the index of the sector to remove.
// @visibility drawing
//<
removeSector : function (sectorIndex) {
    var sectors = this.sectors;

    if (sectorIndex == 0 && sectors.length == 1) {
        return;
    }

    var tmp = new Array(sectors.length - 1);

    for (var i = 0; i < sectorIndex; ++i) {
        tmp[i] = sectors[i];
    }

    var prevEndAngle = 0;
    if (sectorIndex > 0) {
        prevEndAngle = sectors[sectorIndex - 1].endAngle;
    }

    if (sectorIndex < sectors.length - 1) {
        sectors[sectorIndex + 1].startAngle = prevEndAngle;
    }

    for (var i = sectorIndex + 1; i < sectors.length; ++i) {
        tmp[i - 1] = sectors[i];
    }

    if (sectorIndex == sectors.length - 1) {
        tmp[sectorIndex - 1].endAngle = 180;
        tmp[sectorIndex - 1].value = this.maxValue;
    }

    this.sectors = sectors = tmp;

    this._makeItems();
},

_getSectorStartAngle : function (sectorIndex, minValue, scale) {
    if (sectorIndex == 0) {
        return 0;
    } else {
        var prevSectorValue = this.sectors[sectorIndex - 1].value;
        return 180 * (prevSectorValue - minValue) / scale;
    }
},

_getSectorEndAngle : function (value, minValue, scale) {
    return 180 * (value - minValue) / scale;
},

_positionNeedleTriangle : function (value) {


    var pivotPoint = this.pivotPoint;

    var scale = this.maxValue - this.minValue;
    var angleRad = Math.PI - Math.PI * (value - this.minValue) / scale;
    if (!this.drawnClockwise) {
        angleRad = Math.PI - angleRad;
    }

    // The outermost point of the needle triangle (in polar coordinates with the origin at
    // `pivotPoint`) has r = this.dialRadius - 15.

    // Compute the Cartesian coordinates of the outermost point, with the origin being
    // `pivotPoint`.
    var x = (this.dialRadius - 15) * Math.cos(angleRad);
    var y = (this.dialRadius - 15) * Math.sin(angleRad);
    // Translate to Drawing coordinates.
    var p = [ pivotPoint[0] + x, pivotPoint[1] - y ];

    // `p1` and `p2` are points on the center knob. The line segment from `p1` to `p2` is
    // perpendicular to the line segment (0, 0) to `p`.
    // The math is the same. It's just that the angles are different (+/- Pi/2, or 90 deg) and
    // r is this.knobRadius.
    var angleRad1 = angleRad - Math.PI / 2.0;
    var x1 = this.knobRadius * Math.cos(angleRad1);
    var y1 = this.knobRadius * Math.sin(angleRad1);
    var p1 = [ pivotPoint[0] + x1, pivotPoint[1] - y1 ];

    var angleRad2 = angleRad + Math.PI / 2.0;
    var x2 = this.knobRadius * Math.cos(angleRad2);
    var y2 = this.knobRadius * Math.sin(angleRad2);
    var p2 = [ pivotPoint[0] + x2, pivotPoint[1] - y2 ];

    this._needleTriangle.setPoints([ p, p1, p2 ]);
},

_makePositionedLabel : function (contents, value) {


    var pivotPoint = this.pivotPoint;

    var scale = this.maxValue - this.minValue;
    var angleRad = Math.PI - Math.PI * (value - this.minValue) / scale;
    if (!this.drawnClockwise) {
        angleRad = Math.PI - angleRad;
    }

    var labelProps = {
        fontSize: this.fontSize,
        contents: contents,
        left: 0,
        top: 0
    };
    var labelDims = this.measureLabel(contents, labelProps),
        labelWidth = labelDims.width,
        labelHeight = labelDims.height;

    var x = (this.dialRadius + 5) * Math.cos(angleRad);
    var y = (this.dialRadius + 5) * Math.sin(angleRad);

    var left;
    if (angleRad < 9.0 * Math.PI / 20.0 - 0.001) {
        // (x, y) are the Cartesian coordinates of the bottom left point of the label, where
        // the origin is `pivotPoint`.
        left = Math.round(pivotPoint[0] + x + 2);
    } else if (angleRad <= 11.0 * Math.PI / 20.0 + 0.001) {
        // (x, y) are the Cartesian coordinates of the bottom middle point of the label, where
        // the origin is `pivotPoint`.
        left = Math.round(pivotPoint[0] + x - labelWidth / 2);
    } else {
        // (x, y) are the Cartesian coordinates of the bottom right point of the label, where
        // the origin is `pivotPoint`.
        left = Math.round(pivotPoint[0] + x - labelWidth - 2);
    }

    var top;
    if (Math.PI / 4.0 <= angleRad &&
        angleRad <= 3.0 * Math.PI / 4.0) {
        top = Math.round(pivotPoint[1] - y - labelHeight * (1.0 - Math.abs(Math.PI / 2.0 - angleRad) * 0.5));
    } else {
        top = Math.round(pivotPoint[1] - y - labelHeight / 2);
    }

    labelProps.left = left;
    labelProps.top = top;
    return isc.DrawLabel.create(labelProps);
}
});
isc._debugModules = (isc._debugModules != null ? isc._debugModules : []);isc._debugModules.push('Drawing');isc.checkForDebugAndNonDebugModules();isc._moduleEnd=isc._Drawing_end=(isc.timestamp?isc.timestamp():new Date().getTime());if(isc.Log&&isc.Log.logIsInfoEnabled('loadTime'))isc.Log.logInfo('Drawing module init time: ' + (isc._moduleEnd-isc._moduleStart) + 'ms','loadTime');delete isc.definingFramework;}else{if(window.isc && isc.Log && isc.Log.logWarn)isc.Log.logWarn("Duplicate load of module 'Drawing'.");}

/*

  SmartClient Ajax RIA system
  Version v9.0p_2014-02-05/LGPL Deployment (2014-02-05)

  Copyright 2000 and beyond Isomorphic Software, Inc. All rights reserved.
  "SmartClient" is a trademark of Isomorphic Software, Inc.

  LICENSE NOTICE
     INSTALLATION OR USE OF THIS SOFTWARE INDICATES YOUR ACCEPTANCE OF
     ISOMORPHIC SOFTWARE LICENSE TERMS. If you have received this file
     without an accompanying Isomorphic Software license file, please
     contact licensing@isomorphic.com for details. Unauthorized copying and
     use of this software is a violation of international copyright law.

  DEVELOPMENT ONLY - DO NOT DEPLOY
     This software is provided for evaluation, training, and development
     purposes only. It may include supplementary components that are not
     licensed for deployment. The separate DEPLOY package for this release
     contains SmartClient components that are licensed for deployment.

  PROPRIETARY & PROTECTED MATERIAL
     This software contains proprietary materials that are protected by
     contract and intellectual property law. You are expressly prohibited
     from attempting to reverse engineer this software or modify this
     software for human readability.

  CONTACT ISOMORPHIC
     For more information regarding license rights and restrictions, or to
     report possible license violations, please contact Isomorphic Software
     by email (licensing@isomorphic.com) or web (www.isomorphic.com).

*/

