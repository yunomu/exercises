
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

if(window.isc&&window.isc.module_Core&&!window.isc.module_Calendar){isc.module_Calendar=1;isc._moduleStart=isc._Calendar_start=(isc.timestamp?isc.timestamp():new Date().getTime());if(isc._moduleEnd&&(!isc.Log||(isc.Log && isc.Log.logIsDebugEnabled('loadTime')))){isc._pTM={ message:'Calendar load/parse time: ' + (isc._moduleStart-isc._moduleEnd) + 'ms', category:'loadTime'};
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




//> @class Calendar
// The Calendar component provides several different ways for a user to view and
// edit a set of events. Note that the <b>ISC_Calendar.js</b> module must be
// loaded to make use of the Calendar class.
// <P>
// <b>CalendarEvents</b>
// <P>
// Events are represented as ordinary JavaScript Objects (see +link{CalendarEvent}).
// The Calendar expects to be able to read and write a basic set of properties
// on events: name, startDate, endDate, description, etc, which can be stored
// under configurable property names (see eg +link{calendar.startDateField}.
// <P>
// Much like a +link{ListGrid} manages it's ListGridRecords, the Calendar can
// either be passed an ordinary Array of CalendarEvents or can fetch data from a
// DataSource.
// <P>
// If the calendar is bound to a DataSource, event changes by user action or by
// calling methods will be saved to the DataSource.
// <P>
// <b>Navigation</b>
// <P>
// The calendar supports a +link{calendar.weekView,WeekView},
// +link{calendar.dayView,DayView} and +link{calendar.monthView,MonthView} by
// default.  The user can navigate using back and forward buttons or via an
// attached +link{calendar.dateChooser,DateChooser}.
// <P>
// <b>Event Manipulation</b>
// <P>
// Events can be created via clicking on the day, week or month views, or via the
// "Add Event" button.  In the day and week views, the user may click and drag
// to create an event of a specific duration.
// <P>
// Creating an event via click or click and drag pops up the
// +link{calendar.eventDialog,EventDialog}, which provides a simple form for
// quick event entry (only one field, the description, is required by default).
// <P>
// A separate editor called the +link{calendar.eventEditor,EventEditor} provides
// an interface for editing all possible properties of an event, including custom
// properties.  The EventEditor is used whenever a pre-existing event is being
// edited, and can also be invoked
// by the user wherever the simpler EventDialog appears.
// <P>
// Events can also be programmatically +link{calendar.addEvent,added},
// +link{calendar.removeEvent,removed}, or +link{calendar.updateEvent,updated}.
//
// @implements DataBoundComponent
// @treeLocation  Client Reference/Calendar
// @example simpleCalendar
// @visibility calendar
//<
isc.ClassFactory.defineClass("Calendar", "Canvas", "DataBoundComponent");

isc.Calendar.addProperties({

defaultWidth: "100%",
defaultHeight: "100%",

year:new Date().getFullYear(),  // full year number
month:new Date().getMonth(),    // 0-11

//> @attr calendar.chosenDate (Date : 'Today' : IRW)
// The date for which events are displayed in the day, week, and month tabs of
// the calendar.  Default is today.
//
// @group date
// @visibility calendar
//<

//> @attr calendar.firstDayOfWeek  (Number : null : IRW)
// The numeric day (0-6) which the calendar should consider as the first day of the week - if
// unset, the default is taken from the current locale.
//
// @group date
// @visibility calendar
//<
//firstDayOfWeek:0,

// Styling
// ---------------------------------------------------------------------------------------

//> @attr calendar.baseStyle  (CSSStyleName : "calendar" : IRW)
// The base name for the CSS class applied to the grid cells of the day and week views
// of the calendar. This style will have "Dark", "Over", "Selected", or "Disabled"
// appended to it according to the state of the cell.
//
// @group appearance
// @visibility calendar
//<
baseStyle: "calendar",

//> @attr calendar.dayHeaderBaseStyle  (CSSStyleName : "calMonthDayHeader" : IRW)
// The base name for the CSS class applied to the day headers of the month view.
// This style will have "Dark", "Over", "Selected", or "Disabled"
// appended to it according to the state of the cell.
//
// @group appearance
// @visibility calendar
//<
dayHeaderBaseStyle: "calMonthDayHeader",

//> @attr calendar.dayBodyBaseStyle  (CSSStyleName : "calMonthDayBody" : IRW)
// The base name for the CSS class applied to the day body of the month view
// of the calendar. This style will have "Dark", "Over", "Selected", or "Disabled"
// appended to it according to the state of the cell.
//
// @group appearance
// @visibility calendar
//<
dayBodyBaseStyle: "calMonthDayBody",

//> @attr calendar.otherDayHeaderBaseStyle  (CSSStyleName : "calMonthDayHeader" : IRW)
// The base name for the CSS class applied to the day headers of the month view.
// This style will have "Dark", "Over", "Selected", or "Disabled"
// appended to it according to the state of the cell.
//
// @group appearance
// @visibility calendar
//<
otherDayHeaderBaseStyle: "calMonthOtherDayHeader",

//> @attr calendar.otherDayBodyBaseStyle  (CSSStyleName : "calMonthDayBody" : IRW)
// The base name for the CSS class applied to the day body of the month view
// of the calendar. This style will have "Dark", "Over", "Selected", or "Disabled"
// appended to it according to the state of the cell.
//
// @group appearance
// @visibility calendar
//<
otherDayBodyBaseStyle: "calMonthOtherDayBody",

//> @attr calendar.otherDayBlankStyle (CSSStyleName : "calMonthOtherDayBlank" : IR)
// The CSS style applied to both the header and body of days from other months in the
// +link{monthView, month view}, when +link{showOtherDays} is false.
//
// @group appearance
// @visibility calendar
//<
otherDayBlankStyle: "calMonthOtherDayBlank",

//> @attr calendar.minimumDayHeight (integer : 80 : IRW)
// In the +link{monthView, month view} when +link{showDayHeaders} is true, this is the minimum
// height applied to a day cell and its header combined.
// <P>
// If <code>showDayHeaders</code> is false, this attribute has no effect - the minimum height
// of day cells is either an equal share of the available height, or the rendered height of the
// cell's HTML content, whichever is greater.  If the latter, a vertical scrollbar is shown.
//
// @group appearance
// @visibility calendar
//<
minimumDayHeight: 80,

//> @attr calendar.selectedCellStyle  (CSSStyleName : "calendarCellSelected" : IRW)
// The base name for the CSS class applied to a cell that is selected via a mouse drag.
//
// @group appearance
// @visibility calendar
//<
selectedCellStyle: "calendarCellSelected",

//> @attr calendar.eventWindowStyle  (CSSStyleName : "eventWindow" : IRW)
// The base name for the CSS class applied to event windows within calendars.
// This style will have "Header", "HeaderLabel", and "Body" appended to it, according to
// which part of the event window is being styled. For example, to style the header, define
// a css class called 'eventWindowHeader'.
//
// @group appearance
// @visibility calendar
//<
eventWindowStyle: "eventWindow",

calMonthEventLinkStyle: "calMonthEventLink",

// Workday properties
//---------------------------------------------------------------------------------------------

//> @attr calendar.workdayBaseStyle (CSSStyleName : "calendarWorkday" : IR)
// If +link{showWorkday} is set, this is the style used for cells that are within the workday,
// as defined by +link{workdayStart} and +link{workdayEnd}, or by a date-specific range
// provided in +link{getWorkdayStart} and +link{getWorkdayEnd} implementations.
//
// @group workday, appearance
// @visibility calendar
//<
workdayBaseStyle: "calendarWorkday",

//> @attr calendar.workdayStart (Time : "9:00am" : IR)
// When using +link{showWorkday}:true, <code>workdayStart</code> and <code>workdayEnd</code>
// specify the time of day when the workday starts and ends, specified as a
// String acceptable to +link{Time.parseInput()}.
// <P>
// Both start and end time must fall on a 30 minute increment (eg 9:30, but not 9:45).
// <P>
// The hours of the workday can be customized for particular dates by providing implementations
// of +link{getWorkdayStart} and +link{getWorkdayEnd}.
//
// @group workday, date
// @visibility calendar
//<
workdayStart: "9:00am",

//> @attr calendar.workdayEnd (Time : "5:00pm" : IR)
// @include calendar.workdayStart
//
// @group workday, date
// @visibility calendar
//<
workdayEnd: "5:00pm",

//> @attr calendar.showWorkday (Boolean : false : IR)
// If set, causes the calendar to use +link{workdayBaseStyle}
// for cells falling within the workday as defined by +link{workdayStart} and +link{workdayEnd},
// in both the +link{weekView} and +link{dayView}.
// <P>
// The hours of the workday can be customized for particular dates by providing implementations
// of +link{getWorkdayStart} and +link{getWorkdayEnd}.
//
// @group workday
// @visibility calendar
//<
showWorkday: false,

//> @attr calendar.workdays (Array : [1,2,3,4,5] : IR)
// Array of days that are considered workdays when +link{showWorkday} is true.  Has no effect
// if +link{dateIsWorkday} is implemented.
//
// @group workday
// @visibility calendar
//<
workdays: [1, 2, 3, 4, 5],

//> @attr calendar.scrollToWorkday (Boolean : false : IR)
// If set, causes the +link{workdayStart,workday hours} to be sized to fill the available space
// in the day view and week view, and automatically scrolls these views to the start of the
// workday when the calendar is first displayed and whenever the user switches to a new day or
// week.
//
// @group workday
// @visibility calendar
//<
scrollToWorkday: false,

//> @method calendar.scrollToTime()
// Scroll the calendar Day or Week views to the specified time.
// @param time (string) any parsable time-string
// @visibility calendar
//<
scrollToTime : function (time) {
    var grid = this.getSelectedView(),
        rowSize = grid.getRowHeight(1),
        row = 0
    ;
    time = isc.Time.parseInput(time);
    if (isc.isA.Date(time)) {
        var sRow = time.getHours() * 2;
        if (time.getMinutes() >= 30) sRow++;
        var sRowTop = grid.getRowHeight(null, 0) * sRow;
        grid.body.scrollTo(0, sRowTop);
        grid.redraw();
   }
},

// Fields on Event Records
// ---------------------------------------------------------------------------------------

//> @attr calendar.nameField  (String : "name" : IR)
// The name of the name field in a +link{CalendarEvent}.
//
// @group calendarEvent
// @visibility calendar
// @see CalendarEvent
//<
nameField: "name",

//> @attr calendar.descriptionField  (String : "description" : IR)
// The name of the description field in a +link{CalendarEvent}.
//
// @group calendarEvent
// @visibility calendar
//<
descriptionField: "description",

//> @attr calendar.startDateField  (String : "startDate" : IR)
// The name of the start date field in a +link{CalendarEvent}.
//
// @group calendarEvent
// @visibility calendar
// @see CalendarEvent
//<
startDateField: "startDate",

//> @attr calendar.endDateField  (String : "endDate" : IR)
// The name of the end date field in a +link{CalendarEvent}.
//
// @group calendarEvent
// @visibility calendar
// @see CalendarEvent
//<
endDateField: "endDate",

//> @attr calendar.leadingDateField  (String : "leadingDate" : IR)
// The name of the leading date field for each event.  When this attribute and
// +link{trailingDateField} are present in the data, a line extends out from the event showing the
// extent of the leading and trailing dates - useful for visualizing a pipeline of events
// where some can be moved a certain amount without affecting others.
//
// @group calendarEvent
// @visibility calendar
// @see CalendarEvent
//<
leadingDateField: "leadingDate",

//> @attr calendar.trailingDateField  (String : "trailingDate" : IR)
// The name of the trailing date field for each event.  When this attribute and
// +link{leadingDateField} are present in the data, a line extends out from the event showing
// the extent of the leading and trailing dates - useful for visualizing a pipeline of events
// where some can be moved a certain amount without affecting others.
//
// @group calendarEvent
// @visibility calendar
// @see CalendarEvent
//<
trailingDateField: "trailingDate",


labelColumnWidth: 60,

// adds space around events so that they sit within their lane, not at the edges of it
timelineEventPadding: 0,

//> @attr calendar.eventDragGap  (Number : 10 : IRW)
// The number of pixels to leave to the right of events so overlapping events can still be
// added using the mouse.
//
// @visibility external
//<
eventDragGap: 10,

//> @attr calendar.laneNameField  (String : "lane" : IR)
// The name of the field which will determine the +link{Calendar.lanes, lane} in which this
// event will be displayed for the +link{Calendar.timelineView}
//
// @group calendarEvent
// @visibility external
// @see CalendarEvent
//<
laneNameField: "lane",

//> @attr calendar.eventWindowStyleField (String : "eventWindowStyle" : IR)
// The name of the field used to override +link{calendar.eventWindowStyle} for an individual
// +link{CalendarEvent}.  See +link{calendarEvent.eventWindowStyle}.
//
// @group calendarEvent, appearance
// @visibility calendar
//<
eventWindowStyleField: "eventWindowStyle",

//> @attr calendar.canEditField  (String : "canEdit" : IR)
// Name of the field on each +link{CalendarEvent} that determines editability.
//
// @group calendarEvent
// @visibility calendar
// @see CalendarEvent
//<
canEditField: "canEdit",

//> @attr calendar.canRemoveField  (String : "canRemove" : IR)
// Name of the field on each +link{CalendarEvent} that determines whether an event shows a
// remove button.
//
// @group calendarEvent
// @visibility calendar
// @see CalendarEvent
//<
canRemoveField: "canRemove",

//> @attr calendar.canDragEventField  (String : "canEdit" : IR)
// Name of the field on each +link{CalendarEvent} that determines dragability.
//
// @group calendarEvent
// @visibility calendar
// @see CalendarEvent
//<
canDragEventField: "canDrag",

//> @attr calendar.weekEventBorderOverlap (Boolean : false : IR)
// Augments the width of week event windows slightly to avoid duplicate adjacent borders
// between events.
//
// @group appearance
// @visibility calendar
//<
weekEventBorderOverlap: false,

//> @attr calendar.headerLevels (Array of HeaderLevel : null : IR)
// Configures the levels of +link{HeaderLevel, headers} shown above the event area, and
// their time units.
// <P>
// Header levels are provided from the top down, so the first header level should be the largest
// time unit and the last one the smallest.  The smallest is then used for the actual
// field-headers.
// @setter Calendar.setHeaderLevels()
// @visibility external
//<

//> @method calendar.setHeaderLevels()
// Configures the levels of +link{HeaderLevel, headers} shown above the event area, and
// their time units, after initialization.
// @param headerLevels (Array of HeaderLevel) the array of HeaderLevels to set
// @visibility external
//<
setHeaderLevels : function (headerLevels) {
    this.headerLevels = headerLevels;
    if (this.timelineView) this.timelineView.rebuild();
},

// Event Editing
// ---------------------------------------------------------------------------------------

//> @attr calendar.eventSnapGap (Integer : 30 : IR)
// Determines the number of vertical pixels an event can be moved or resized by in the
// +link{dayView, day} and +link{weekView, week} views, by dragging.  Since the default height
// of each hour in those views is 60px, this attribute is synonymous with minutes by default.
// <P>
// For timelines, this attribute affects the number of horizontal pixels used for drag-snapping.
// Since the default width for +link{headerLevels} is 60px, this value is also synonymous with
// minutes, assuming that the +link{timelineGranularity} is "hour".
//
// @group editing
// @visibility external
//<
eventSnapGap: 30,

//> @attr calendar.showQuickEventDialog (Boolean : true : IR)
// Determines whether the quick event dialog is displayed when a time is clicked. If this is
// false, the full event editor is displayed.
//
// @group editing
// @visibility calendar
//<
showQuickEventDialog: true,

//> @attr calendar.eventEditorFields (Array of FormItem : see below : IR)
// The set of fields for the +link{calendar.eventEditor, event editor}.
// <p>
// The default set of fields are:
// <pre>
//    {name: "startHours", title: "From",      editorType: "SelectItem", type: "integer", width: 60},
//    {name: "startMinutes", showTitle: false, editorType: "SelectItem", type: "integer", width: 60},
//    {name: "startAMPM", showTitle: false, type: "select", width: 60},
//    {name: "invalidDate", type: "blurb", colSpan: 4, visible: false}
//    {name: "endHours", title: "To",        editorType: "SelectItem", type: "integer", width: 60},
//    {name: "endMinutes", showTitle: false, editorType: "SelectItem", type: "integer", width: 60},
//    {name: "endAMPM", showTitle: false, type: "select", width: 60},
//    {name: "name", title: "Name", type: "text", colSpan: 4},
//    {name: "description", title: "Description", type: "textArea", colSpan: 4, height: 50}
// </pre>
// See the Customized Binding example below for more information on altering default datasource
// fields within forms.
//
// @group editing
// @example customCalendar
// @example validationFieldBinding
// @visibility calendar
//<

//> @attr calendar.eventDialogFields (Array of FormItem : see below : IR)
// The set of fields for the +link{calendar.eventDialog, event dialog}.
// <p>
// The default set of fields are:
// <pre>
//    {name: "name", title: "Event Name", type: nameType, width: 250 },
//    {name: "save", title: "Save Event", type: "SubmitItem", endRow: false},
//    {name: "details", title: "Edit Details", type: "button", startRow: false}
// </pre>
// See the Customized Binding example below for more information on altering default datasource
// fields within forms.
//
// @group editing
// @example customCalendar
// @example validationFieldBinding
// @visibility calendar
//<

// Allowed operations
// ---------------------------------------------------------------------------------------

//> @groupDef allowedOperations
//
// @title Allowed Operations
// @visibility external
//<

//> @attr calendar.canCreateEvents (Boolean : true : IR)
// If true, users can create new events
//
// @group allowedOperations
// @visibility calendar
//<
canCreateEvents: true,

//> @attr calendar.canEditEvents (Boolean : true : IR)
// If true, users can edit existing events
//
// @group allowedOperations
// @visibility calendar
//<
canEditEvents: true,

//> @attr calendar.canDeleteEvents (Boolean : null : IR)
// If true, users can delete existing events. Defaults to +link{calendar.canEditEvents}
//
// @group allowedOperations
// @visibility calendar
// @deprecated in favor of +link{calendar.canRemoveEvents}
//<
//canDeleteEvents: true,

//> @attr calendar.canRemoveEvents (Boolean : true : IR)
// If true, users can remove existing events. Defaults to +link{calendar.canEditEvents}
//
// @group allowedOperations
// @visibility calendar
//<
canRemoveEvents: true,

//> @attr calendar.canDragEvents (Boolean : true : IR)
// If true, users can drag-reposition existing events.
//
// @group allowedOperations
// @visibility calendar
//<
canDragEvents: true,

// Show / Hide parts of the interface
// ---------------------------------------------------------------------------------------

//> @attr calendar.showDateChooser (Boolean : true : IR)
// Determines whether the +link{calendar.dateChooser,dateChooser} is displayed.
//
// @group visibility
// @visibility calendar
//<
showDateChooser: false,

//> @attr calendar.disableWeekends (Boolean : true : IR)
// If set, weekend days appear in disabled style and events cannot be created on weekends.
// Which days are considered weekends is controlled by +link{Date.weekendDays}.
//
// @group visibility
// @visibility calendar
//<
disableWeekends: true,

//> @attr calendar.showWeekends (Boolean : true : IR)
// Suppresses the display of weekend days in the week and month views, and disallows the
// creation of events on weekends.  Which days are considered weekends is controlled by
// +link{Date.weekendDays}.
//
// @group visibility
// @visibility calendar
//<
showWeekends: true,

//> @attr calendar.showDayHeaders (Boolean : true : IR)
// If true, the default, show a header cell for each day cell in the
// +link{monthView, month view}, with both cells having a minimum combined height of
// +link{minimumDayHeight}.  If false, the header cells will not be shown, and the value
// of +link{minimumDayHeight} is ignored.  This causes the available vertical space in month
// views to be shared equally between day cells, such that no vertical scrollbar is required
// unless the HTML in the cells renders them taller than will fit.
//
// @group visibility
// @visibility calendar
//<
showDayHeaders: true,

//> @attr calendar.showOtherDays (Boolean : true : IR)
// If set to true, in the month view, days that fall in an adjacent month are still shown with
// a header and body area, and are interactive.  Otherwise days from other months are rendered
// in the +link{otherDayBlankStyle} and are non-interactive.
//
// @group visibility
// @visibility calendar
//<
showOtherDays: true,

// Overlapping event placement
// ---------------------------------------------------------------------------------------

//> @attr calendar.eventAutoArrange (Boolean : true : IR)
// If set to true, enables the auto-arrangement of events that share time in the calendar.  The
// default is true.
//
// @group calendarEvent
// @visibility calendar
//<
eventAutoArrange: true,

//> @attr calendar.eventOverlap (Boolean : true : IR)
// When +link{eventAutoArrange} is true, setting eventOverlap to true causes events that
// share timeslots to overlap each other by a percentage of their width, specified by
// +link{eventOverlapPercent}.  The default is true.
//
// @group calendarEvent
// @visibility calendar
//<
eventOverlap: true,

//> @attr calendar.eventOverlapPercent (number : 10 : IR)
// The size of the overlap, presented as a percentage of the width of events sharing timeslots.
//
// @group calendarEvent
// @visibility calendar
//<
eventOverlapPercent: 10,

//> @attr calendar.eventOverlapIdenticalStartTimes (Boolean : false : IR)
// When set to true, events that start at the same time will not overlap each other to prevent
// events having their close button hidden.
//
// @group calendarEvent
// @visibility calendar
//<

// AutoChildren
// ---------------------------------------------------------------------------------------

//> @attr calendar.mainView (AutoChild TabSet : null : R)
// +link{TabSet} for managing calendar views when multiple views are available (eg,
// +link{dayView, day} and +link{monthView, month})
//
// @visibility calendar
//<

//> @attr calendar.dayView (AutoChild ListGrid : null : R)
// +link{ListGrid} used to display events that pertain to a given day.
//
// @visibility calendar
//<

//> @attr calendar.weekView (AutoChild ListGrid : null : R)
// +link{ListGrid} used to display events that pertain to a given week.
//
// @visibility calendar
//<

//> @attr calendar.monthView (AutoChild ListGrid : null : R)
// +link{ListGrid} used to display events that pertain to a given month.
//
// @visibility calendar
//<


//> @attr calendar.dateChooser (AutoChild DateChooser : null : R)
// +link{DateChooser} used to select the date for which events will be displayed.
//
// @visibility calendar
//<

// CalendarEvent
// ---------------------------------------------------------------------------------------

//> @object CalendarEvent
// A type of +link{Record} which represents an event to occur at a specific time, displayed
// within the calendar.
//
// @group data
// @treeLocation Client Reference/Calendar
// @visibility calendar
//<

//> @attr calendarEvent.startDate (Date : null : IRW)
// Date object which represents the start date of a +link{CalendarEvent}.
// The name of this field within the CalendarEvent can be changed via
// +link{Calendar.startDateField}
//
// @visibility calendar
//<

//> @attr calendarEvent.endDate (Date : null : IRW)
// Date object which represents the end date of a +link{CalendarEvent}
// The name of this field within the CalendarEvent can be changed via
// +link{Calendar.endDateField}
//
// @visibility calendar
//<

//> @attr calendarEvent.name (String : null : IRW)
// String which represents the name of a +link{CalendarEvent}
// The name of this field within the CalendarEvent can be changed via
// +link{Calendar.nameField}
//
// @visibility calendar
//<

//> @attr calendarEvent.description (String : null : IRW)
// String which represents the description of a +link{CalendarEvent}
// The name of this field within the CalendarEvent can be changed via
// +link{Calendar.descriptionField}
//
// @visibility calendar
//<

//> @attr calendarEvent.canEdit (String : null : IRW)
// Optional boolean value controlling the editability of this particular calendarEvent.
//  The name of this field within the CalendarEvent can be changed via
//  +link{calendar.canEditField}.
//
// @visibility calendar
//<

//> @attr calendarEvent.backgroundColor (String : null : IRW)
// An optional background color for this event's window.
//
// @visibility calendar
//<

//> @attr calendarEvent.textColor (String : null : IRW)
// An optional text color for this event's window.
//
// @visibility calendar
//<

//> @attr calendarEvent.headerBackgroundColor (String : null : IRW)
// An optional background color for this event's window-header.
//
// @visibility internal
//<

//> @attr calendarEvent.headerTextColor (String : null : IRW)
// An optional text color for this event's window-header.
//
// @visibility internal
//<

//> @attr calendarEvent.eventWindowStyle (CSSStyleName : null : IR)
// CSS style series to use for the draggable event window that represents this event.  If
// specified, overrides +link{calendar.eventWindowStyle} for this specific event.
// <P>
// The name of this field within the CalendarEvent can be changed via
// +link{Calendar.eventWindowStyleField}
//
// @visibility calendar
//<

//> @attr calendarEvent.lane (String : null : IRW)
// When in Timeline mode, a string that represents the name of the +link{calendar.lanes, lane}
// this +link{CalendarEvent} should sit in.
// The name of this field within the CalendarEvent can be changed via
// +link{Calendar.laneNameField}.
//
// @visibility calendar
//<

//> @attr calendar.alternateLaneStyles (Boolean : null : IRW)
// When in Timeline mode, whether to make lane boundaries more obvious by showing alternate
// lanes in a different color.
//
// @visibility calendar
//<
//alternateLanesStyles: false,

//> @method calendar.getWorkdayStart()
// Returns the start of the working day on the passed date.  By default, this method returns
// the value of +link{calendar.workdayStart, workdayStart}.
// @param date (Date) a Date instance
// @return (String) any parsable time-string
// @visibility calendar
//<
getWorkdayStart : function (date) {
    return this.workdayStart;
},

//> @method calendar.getWorkdayEnd()
// Returns the end of the working day on the passed date.  By default, this method returns
// the value of +link{calendar.workdayEnd, workdayEnd}.
// @param date (Date) a Date instance
// @return (String) any parsable time-string
// @visibility calendar
//<
getWorkdayEnd : function (date) {
    return this.workdayEnd;
},

//> @method calendar.getVisibleStartDate()
// Returns the first visible date in the currently selected calendar view.
// @return (Date) first visible date
// @visibility calendar
//<
getVisibleStartDate : function () {
    var selectedView = this.getSelectedView();
    if (!selectedView || isc.isAn.emptyString(selectedView)) return null;

    if (selectedView == this.dayView) return this.chosenDate;

    if (selectedView == this.monthView) return this.getCellDate(0,0);
    return this.getCellDate(0,1);
},

//> @method calendar.getVisibleEndDate()
// Returns the last visible date in the currently selected calendar view.
// @return (Date) last visible date
// @visibility calendar
//<
getVisibleEndDate : function () {
    var selectedView = this.getSelectedView();

    if (selectedView == this.dayView) return this.chosenDate;

    return this.getCellDate(selectedView.getData().length-1, selectedView.getFields().length-1);
},

//> @method calendar.getPeriodStartDate()
// Returns the start of the selected week or month depending on the current calendar view.
// For the month view, and for the week view when not showing weekends, this will often be a
// different date than that returned by +link{calendar.getVisibleStartDate}.
// @return (Date) period start date
// @visibility calendar
//<
getPeriodStartDate : function () {
    var selectedView = this.getSelectedView(),
        date = this.chosenDate
    ;

    if (selectedView == this.dayView) {
        return date;
    } else if (selectedView == this.weekView) {
        return isc.DateUtil.getStartOf(date, isc.DateUtil.getTimeUnitKey("week"));
    } else if (selectedView == this.monthView) {
        return isc.DateUtil.getStartOf(date, isc.DateUtil.getTimeUnitKey("month"));
    }
},

//> @method calendar.getPeriodEndDate()
// Returns the end of the selected week or month depending on the current calendar view.
// For the month view, and for the week view when not showing weekends, this will often be a
// different date than that returned by +link{calendar.getVisibleEndDate}.
// @return (Date) period end date
// @visibility calendar
//<
getPeriodEndDate : function () {
    var selectedView = this.getSelectedView(),
        date = this.chosenDate
    ;

    if (selectedView == this.dayView) {
        return date;
    } else if (selectedView == this.weekView) {
        return isc.DateUtil.getEndOf(date, isc.DateUtil.getTimeUnitKey("week"));
    } else if (selectedView == this.monthView) {
        return isc.DateUtil.getEndOf(date, isc.DateUtil.getTimeUnitKey("month"));
    }
},

// Data & Fetching
// ---------------------------------------------------------------------------------------

//> @attr calendar.data (List of CalendarEvent : null : IRW)
// A List of CalendarEvent objects, specifying the data to be used to populate the
// calendar.
// <p>
// This property will typically not be explicitly specified for databound Calendars, where
// the data is returned from the server via databound component methods such as
// +link{fetchData()}. In this case the data objects will be set to a
// +link{class:ResultSet,resultSet} rather than a simple array.
//
// @group data
// @see CalendarEvent
// @setter Calendar.setData()
// @visibility calendar
//<

//> @method calendar.fetchData()
// @include dataBoundComponent.fetchData()
// @group dataBoundComponentMethods
// @visibility calendar
// @example databoundFetch
//<

//> @attr calendar.autoFetchData (boolean : false : IR)
// @include dataBoundComponent.autoFetchData
// @group databinding
// @visibility calendar
// @example fetchOperation
//<

//> @attr calendar.autoFetchTextMatchStyle (TextMatchStyle : null : IR)
// @include dataBoundComponent.autoFetchTextMatchStyle
// @group databinding
// @visibility external
//<

//> @method calendar.filterData()
// @include dataBoundComponent.filterData()
// @group dataBoundComponentMethods
// @visibility external
//<

//> @attr Calendar.initialCriteria (Criteria : null :IR)
// @include dataBoundComponent.initialCriteria
// @visibility calendar
//<

//> @attr calendar.showDetailFields (Boolean : true : IR)
// @include dataBoundComponent.showDetailFields
// @group databinding
//<

//> @attr calendar.dataFetchMode (FetchMode : "paged" : IRW)
// @include dataBoundComponent.dataFetchMode
//<

//> @type CalendarFetchMode
// Granularity at which CalendarEvents are fetched from the server.
//
// @value "all" no criteria is sent to the server, so all events will be fetched
// @value "month" events are fetched one month at a time
// @value "week" events are fetch one week at a time.  Month view may not be used
// @value "day" events are fetched one day at a time.  Only day view may be used
// @visibility internal
//<

//> @attr calendar.fetchMode (CalendarFetchMode : "month" : IR)
// The granularity at which events are fetched.
// <P>
// With any setting other than "all", whenever +link{fetchData} is called the calendar will add
// criteria requesting a range of either one month, one week or one day of events depending on
// this setting.  Subsequently additional fetch requests will be sent automatically as the user
// navigates the calendar.
// <P>
// If +link{calendar.criteriaFormat} is "simple", the criteria will be added as two fields
// "firstVisibleDay" and "lastVisibleDay" with values of type Date.  Note that the these
// fieldNames intentionally differ from +link{calendarEvent.startDate} and
// +link{calendarEvent.endDate} because adding values for <code>startDate</code> and
// <code>endDate</code> to simple criteria would match only events on those exact dates.
// <P>
// If the <code>criteriaFormat</code> is "advanced", the criteria passed to
// <code>fetchData</code> will be converted to +link{AdvancedCriteria} if needed, then criteria
// will be added that would select the appropriate records from any DataSource that supports
// searching with AdvancedCriteria.  That is, the criteria will express:
// <pre>
//   calendarEvent.endDate => firstVisibleDay AND
//   calendarEvent.startDate <= lastVisibleDay
// </pre>
//
// @visibility internal
//<

//> @type CriteriaFormat
// @value "simple" criteria represents as simple key-value pairs - see +link{Criteria}
// @value "advanced" criteria represents as type-operator-value triplets, potentially nested to
//                   form complex queries.  See +link{AdvancedCriteria}.
// @visibility internal
//<

//> @method calendar.criteriaFormat (CriteriaFormat : "advanced" : IR)
// When adding criteria to select events for the currently visible date range, should we use
// simple +link{Criteria} or +link{AdvancedCriteria}?  See +link{fetchMode}.
// @visibility internal
//<

// TimelineView
// ---------------------------------------------------------------------------------------

//> @attr calendar.showTimelineView (Boolean : false : IRW)
// If set to true, show the +link{timelineView, Timeline view}.
// @visibility external
//<
showTimelineView: false,

//> @attr calendar.timelineView (AutoChild ListGrid : null : R)
// +link{ListGrid} used to display events in lanes in a horizontal +link{Timeline} view.
//
// @visibility calendar
//<

// only works for timeline view for now
renderEventsOnDemand: true,

//> @attr calendar.timelineGranularity (TimeUnit : "day" : IR)
// The granularity with which the timelineView will display events.  Possible values are
// those available in the built-in +link{type:TimeUnit, TimeUnit} type.
// @visibility external
//<
timelineGranularity: "day",

//> @attr calendar.timelineUnitsPerColumn (int : 1 : IR)
// How many units of +link{timelineGranularity} each cell represents.
// @visibility external
//<
timelineUnitsPerColumn: 1,

//> @attr calendar.canResizeTimelineEvents (Boolean : false : IR)
// Can timeline events be stretched by their left and right edges?
// @visibility external
//<
canResizeTimelineEvents: false,

//> @attr calendar.canEditLane (boolean : null : IR)
// Can we edit the lane of the event, specified by the +link{laneNameField}?
// If so, the event can be dragged to a different +link{lanes, lane} and, when it's editor is
// shown, an additional drop-down widget is provided allowing the user to select a different
// lane.
// <P>
// In either case, the event's +link{laneNameField} is updated automatically.
// @visibility external
//<

//> @attr calendar.canReorderLanes (Boolean : null : IR)
// If true, lanes can be reordered by dragging them with the mouse.
// @visibility external
//<

//> @attr calendar.startDate (Date : null : IR)
// The start date of the calendar +link{class:Timeline, timeline view}.  Has no effect in
// other views.  If not specified, defaults to a timeline starting from the beginning
// of the current +link{Calendar.timelineGranularity, timelineGranularity} and spanning
// +link{Calendar.defaultTimelineColumnSpan, a default of 20} columns of that granularity.
// <P>
// To set different start and +link{calendar.endDate, end} dates after initial draw,
// see +link{calendar.setTimelineRange, setTimelineRange}.
// <P>
// Note that this attribute may be automatically altered if showing
// +link{calendar.headerLevels, header-levels}, to fit to header boundaries.
// @visibility external
//<

//> @attr calendar.defaultTimelineColumnSpan (number : 20 : IR)
// The number of columns of the +link{Calendar.timelineGranularity, timelineGranularity} to
// give the timeline by default if no +link{calendar.endDate, endDate} is provided.  The
// default is 20.
// @visibility external
//<
defaultTimelineColumnSpan: 20,

//> @attr calendar.columnsPerPage (number : null : IR)
// When using the Next and Previous arrows to scroll a Timeline, this is the number of columns
// of the +link{Calendar.timelineGranularity, timelineGranularity} to scroll by.  With the
// default value of null, the Timeline will scroll by its current length.
// @visibility external
//<

//> @attr calendar.endDate (Date : null : IR)
// The end date of the calendar timeline view.  Has no effect in other views.
// <P>
// To set different +link{calendar.startDate, start} and end dates after initial draw,
// see +link{calendar.setTimelineRange, setTimelineRange}.
// <P>
// Note that this attribute may be automatically altered if showing
// +link{calendar.headerLevels, header-levels}, to fit to header boundaries.
// @visibility external
//<

//> @object HeaderLevel
// Defines one level of headers shown above the event area in a +link{Timeline}.
// @visibility external
//<

//> @attr headerLevel.unit (TimeUnit : null : IR)
// Unit of time shown at this level of header.
// @visibility external
//<

//> @attr headerLevel.headerWidth (integer : null : IR)
// If set, the width for each of the spans in this headerLevel.  Note that this setting only
// has an effect on the innermost headerLevel.
// @visibility external
//<

//> @attr headerLevel.titles (Array of String : null : IR)
// Optional sparse array of titles for the spans on this headerLevel.  If a given span in this
// headerLevel has a corresponding entry in this array, it will be used as the span's title.
// <P>
// If not specified, default titles are generated (eg "Q1" for unit "quarter") and then passed
// into the +link{headerLevel.titleFormatter, formatter function}, if one has been installed,
// for further customization.
//
// @visibility external
//<

//> @method headerLevel.titleFormatter()
// An optional function for providing formatted HTML for the title of a given span in this
// HeaderLevel.  If unset, Timelines use the +link{HeaderLevel.titles, titles array}, if one is
// set, or generate default titles based on the unit-type and date-range.
// <P>
// Note that this method will not run for spans in this headerLevel that have a non-null entry
// in the +link{HeaderLevel.titles, titles} array.
//
// @param headerLevel (HeaderLevel) a reference to this headerLevel
// @param startDate (Date) the start of the date-range covered by this span in this level
// @param endDate (Date) the end of the date-range covered by this span in this level - may be
//                       null
// @param defaultValue (String) the default title as generated by the Timeline
// @param viewer (Calendar) a reference to the Calendar or Timeline
// @return (String) The formatted title for the values passed in
// @visibility external
//<

//> @attr calendar.weekPrefix (String : "Week" : IR)
// The text to appear before the week number in the title of +link{TimeUnit, week-based}
// +link{HeaderLevel}s when this calendar is showing a timeline.
// @group i18nMessages
// @visibility external
//<
weekPrefix: "Week",

//> @type DateEditingStyle
// The type of date/time editing style to use when editing an event.
//
// @value "date" allows editing of the logical start and end dates of the event
// @value "datetime" allows editing of both date and time
// @value "time" allows editing of the time portion of the event only
// @visibility external
//<


//> @attr calendar.dateEditingStyle (DateEditingStyle : null : IR)
// Indicates the type of controls to use in event-windows.  Valid values are those in the
// +link{type:DateEditingStyle, DateEditingStyle} type.
// <P>
// If unset, the editing style will be set to the field-type on the DataSource, if there is one.
// If there's no DataSource, it will be set to "date" if the
// +link{calendar.timelineGranularity, granularity} is "day" or larger and "time" if granularity
// is "minute" or smaller, otherwise "datetime".
// @visibility external
//<


//> @object Lane
// Lane shown in a +link{Timeline} view.  Each lane is a row that can contain a set of
// +link{CalendarEvent}s.  CalendarEvents are placed in lanes by matching the
// +link{Lane.name} property to the value of the +link{calendar.laneNameField} property on the
// CalendarEvent.
// <P>
// Lanes are typically used to show tasks assigned to different people, broadcasts planned for
// different channels, and similar displays.
//
// @visibility external
//<

//> @attr lane.name (String : null : IR)
// To determine whether a CalendarEvent should be placed in this lane, the value of this
// attribute is compared with the +link{calendar.laneNameField} property on the CalendarEvent.
//
// @visibility external
//<

//> @attr lane.height (Number : null : IR)
// The height of this Lane's row.
//
// @visibility external
//<

//> @attr lane.title (HTMLString : null : IR)
// Title to show for this lane.
//
// @visibility external
//<

//> @attr calendar.lanes (Array of Lane : null : IRW)
// An array of +link{Lane} definitions that determine the rows of the timeline view.
// @visibility external
// @setter calendar.setLanes()
//<

//> @method calendar.setLanes()
// Sets the lanes for this calendar in +link{timelineView} mode.
//
// @param lanes (Array of Lane) array of lanes to add to the timeline view
//
// @visibility external
//<
setLanes : function (lanes) {
    // bail if nothing passed
    if (!lanes) return;
    // store lanes but don't call through if not yet draw()n
    this.lanes = lanes;
    if (this.timelineView) this.timelineView.setLanes(this.lanes);
},

//> @method calendar.addLane()
// Adds a new +link{object:Lane} to the calendar in +link{timelineView} mode.
//
// @param lane (Lane) a new Lane object to add to the timeline view
//
// @visibility external
//<
addLane : function (lane, index) {
    var tl = this.timelineView;
    if (!tl) return;

    if (!this.lanes) this.lanes = [];
    if (index == null) index = this.lanes.length;
    this.lanes.add(lane, index);
    tl.setLanes(this.lanes);
},

//> @method calendar.removeLane()
// Removes a lane from the calendar in +link{timelineView} mode.  Accepts
// either a +link{object:Lane, Lane object} or a string that represents the
// +link{Lane.name, name} of a lane.
//
// @param lane (Lane | String) either the actual Lane object or the name of the lane to remove
//
// @visibility external
//<
removeLane : function (lane) {
    var tl = this.timelineView;
    if (!tl || !this.lanes) return;

    if (isc.isA.String(lane)) lane = this.lanes.find("name", lane);
    if (lane) {
        this.lanes.remove(lane);
        tl.setLanes(this.lanes);
    }
},

//> @attr calendar.laneFields (Array of ListGridField : null : IR)
// Field definitions for the frozen area of the +link{timelineView}, which shows data about the
// timeline +link{lanes}.  Each field shows one attribute of the objects provided as
// +link{calendar.lanes}.
// @visibility external
//<

//> @attr calendar.overlapSortSpecifiers (Array of SortSpecifier : null : IRW)
// For +link{Timeline, timelines} that allow overlapping events, an array of
// +link{SortSpecifier, sort-specifiers} that dictate the vertical rendering order of
// overlapped events in each +link{Lane, lane}.
// <P>
// By default, events that share space in a Lane are rendered from top to bottom according to
// their +link{startDateField, start-dates} - the earliest in a given lane appears top-most in
// that lane.
// <P>
// Providing <code>overlapSortSpecifiers</code> allows for the events to be ordered by one or
// more of the fields stored on the events, or in the underlying +link{DataSource, data-source},
// if the timeline is databound.
//
// @visibility external
//<

//> @attr calendar.todayBackgroundColor (String : null : IR)
// The background color for today in the Month view, or in the Timeline view when
// +{timelineGranularity} is "day".
// @visibility external
//<

//> @attr calendar.showEventDescriptions (Boolean : true : IR)
// If false, the event header will take up the entire space of the event. This is useful
// when you want to be able to drag reposition by the entire event and not just the header.
// @visibility external
//<
showEventDescriptions: true,

//> @method calendar.eventsRendered()
// A notification method fired when the events in the current view have been refreshed.
// @visibility calendar
//<


// Event Overlap
// ---------------------------------------------------------------------------------------

//> @attr calendar.allowEventOverlap (boolean : true : IR)
// If false, events are not allowed to overlap when they are drag repositioned or resized.
// Events that *would* overlap an existing event will automatically be placed either before or
// after those events.
//
// @visibility internal
//<
allowEventOverlap: true,

//> @attr calendar.equalDatesOverlap (boolean : null : IR)
// If true, when events or date ranges share a border on exactly the same date (and time),
// they will be treated as overlapping. By default, the value of this attribute is null,
// meaning that such events will *not* be treated as overlapping.
//
// @visibility internal
//<

// ---------------------------------------------------------------------------------------

//> @attr calendar.sizeEventsToGrid (Boolean : true : IR)
// If true, events will be sized to the grid, even if they start and/or end at times
// between grid cells.
// @visibility external
//<
sizeEventsToGrid: true,

// i18n
// ---------------------------------------------------------------------------------------

//> @attr calendar.dayViewTitle (string : "Day" : IR)
// The title for the +link{dayView, day view}.
//
// @group i18nMessages
// @visibility calendar
//<
dayViewTitle: "Day",

//> @attr calendar.weekViewTitle (string : "Week" : IR)
// The title for the +link{weekView, week view}.
//
// @group i18nMessages
// @visibility calendar
//<
weekViewTitle: "Week",

//> @attr calendar.monthViewTitle (string : "Month" : IR)
// The title for the +link{monthView, month view}.
//
// @group i18nMessages
// @visibility calendar
//<
monthViewTitle: "Month",

//> @attr calendar.timelineViewTitle (string : "Timeline" : IR)
// The title for the +link{timelineView, timeline view}.
//
// @group i18nMessages
// @visibility external
//<
timelineViewTitle: "Timeline",

//> @attr calendar.eventNameFieldTitle (string : "Event Name" : IR)
// The title for the event name field in the quick and advanced event dialogs
//
// @group i18nMessages
// @visibility calendar
//<
eventNameFieldTitle: "Event Name",

//> @attr calendar.eventStartDateFieldTitle (string : "From" : IR)
// The title for the start date field in the quick and advanced event dialogs
//
// @group i18nMessages
// @visibility calendar
//<
eventStartDateFieldTitle: "From",

//> @attr calendar.eventEndDateFieldTitle (string : "To" : IR)
// The title for the end date field in the quick and advanced event dialogs
//
// @group i18nMessages
// @visibility calendar
//<
eventEndDateFieldTitle: "To",

//> @attr calendar.eventDescriptionFieldTitle (string : "Description" : IR)
// The title for the +link{descriptionField} field in the quick and advanced event dialogs
//
// @group i18nMessages
// @visibility calendar
//<
eventDescriptionFieldTitle: "Description",

//> @attr calendar.eventLaneFieldTitle (string : "Lane" : IR)
// The title for the +link{laneField} field in the quick and advanced event dialogs
//
// @group i18nMessages
// @visibility calendar
//<
eventLaneFieldTitle: "Lane",

//> @attr calendar.saveButtonTitle (string : "Save Event" : IR)
// The title for the save button in the quick event dialog and the event editor
//
// @group i18nMessages
// @visibility calendar
//<
saveButtonTitle: "Save Event",

//> @attr calendar.detailsButtonTitle (string : "Edit Details" : IR)
// The title for the edit button in the quick event dialog
//
// @group i18nMessages
// @visibility calendar
//<
detailsButtonTitle: "Edit Details",

//> @attr calendar.cancelButtonTitle (string : "Cancel" : IR)
// The title for the cancel button in the event editor
//
// @group i18nMessages
// @visibility calendar
//<
cancelButtonTitle: "Cancel",

//> @attr calendar.previousButtonHoverText (string : "Previous" : IR)
// The text to be displayed when a user hovers over the +link{calendar.previousButton, previous}
// toolbar button
//
// @group i18nMessages
// @visibility calendar
//<
previousButtonHoverText: "Previous",

//> @attr calendar.nextButtonHoverText (string : "Next" : IR)
// The text to be displayed when a user hovers over the +link{calendar.nextButton, next}
// toolbar button
//
// @group i18nMessages
// @visibility calendar
//<
nextButtonHoverText: "Next",

//> @attr calendar.addEventButtonHoverText (string : "Add an event" : IR)
// The text to be displayed when a user hovers over the +link{calendar.addEventButton, add event}
// toolbar button
//
// @group i18nMessages
// @visibility calendar
//<
addEventButtonHoverText: "Add an event",

//> @attr calendar.datePickerHoverText (string : "Choose a date" : IR)
// The text to be displayed when a user hovers over the +link{calendar.datePickerButton, date picker}
// toolbar button
//
// @group i18nMessages
// @visibility calendar
//<
datePickerHoverText: "Choose a date",

//> @attr calendar.invalidDateMessage (Boolean : "From must be before To" : IR)
// The message to display in the +link{eventEditor} when the 'To' date is greater than
// the 'From' date and a save is attempted.
//
// @group i18nMessages
// @visibility calendar
//<
invalidDateMessage: "From must be before To",


// autochild constructors and defaults
// ----------------------------------------------------------------------------------------
dayViewConstructor: "DaySchedule",

weekViewConstructor: "WeekSchedule",

monthViewConstructor: "MonthSchedule",

timelineViewConstructor: "TimelineView",

mainViewDefaults : {
    _constructor:isc.TabSet,
    defaultWidth: "80%",
    defaultHeight: "100%",
    tabBarAlign: "right",
    selectedTab: 1
},

dateChooserConstructor: "DateChooser",

//> @attr calendar.eventDialog (AutoChild Window : null : R)
// An autochild of type +link{Window} that displays a quick event entry form within a
// popup window.
//
// @visibility calendar
//<
eventDialogConstructor: "Window",
eventDialogDefaults : {
    showHeaderIcon: false,
    showMinimizeButton: false,
    showMaximumButton: false,
    canDragReposition: true,
    // so that extra fields are visible without the end user having to tweek bodyProperties
    overflow: "visible",
    bodyProperties: {overflow: "visible"},
    width: 400,
    height: 100

},

//> @attr calendar.eventEditor (AutoChild DynamicForm : null : R)
// An autochild of type +link{DynamicForm} which displays +link{CalendarEvent, event data}.
// This form is created within the +link{calendar.eventEditorLayout,event editor layout}
//
// @visibility calendar
//<
eventEditorConstructor: "DynamicForm",
eventEditorDefaults : {
    padding: 4,
    numCols: 4,
    showInlineErrors: false,
    width: 460,
    titleWidth: 60
},

//> @attr calendar.eventEditorLayout (AutoChild Window : null : R)
// An autochild of type +link{Window} that displays the full
// +link{calendar.eventEditor, event editor}
//
// @visibility calendar
//<
eventEditorLayoutConstructor: "Window",
eventEditorLayoutDefaults : {
    showHeaderIcon: false,
    showShadow: false,
    showMinimizeButton: false,
    showMaximumButton: false,
    canDragReposition: false
},

//> @attr calendar.showAddEventButton (Boolean : null : IRW)
// Set to false to hide the +link{addEventButton, Add Event} button.
// @visibility calendar
//<

//> @attr calendar.addEventButton (AutoChild ImgButton : null : IR)
// An +link{ImgButton} that appears above the week/day/month views of the
// calendar and offers an alternative way to create a new event.
//
// @visibility calendar
//<
addEventButtonConstructor: "ImgButton",
addEventButtonDefaults : {
    title: "",
    src:"[SKINIMG]actions/add.png",
    showRollOver: false,
    showDown: false,
    showFocused:false,
    width: 16,
    height: 16
},

//> @attr calendar.showDatePickerButton (Boolean : null : IRW)
// Set to false to hide the +link{datePickerButton} that allows selecting a new date in for
// Calendar.
// @visibility calendar
//<

//> @attr calendar.datePickerButton (AutoChild ImgButton : null : IR)
// An +link{ImgButton} that appears above the week/day/month views of the
// calendar and offers alternative access to a +link{DateChooser} to pick the current day.
//
// @visibility calendar
//<
datePickerButtonConstructor: "ImgButton",
datePickerButtonDefaults : {
    title: "",
    src:"[SKIN]/controls/date_control.gif",
    width: 16,
    height: 16,
    showRollOver: false,
    showFocused: false
},

//> @attr calendar.showControlsBar (Boolean : true : IR)
// If false the controls bar at the top of the calendar will not be displayed. This consists
// of the autoChildren: +link{previousButton}, +link{nextButton}, +link{addEventButton},
// +link{datePickerButton}
// @visibility calendar
//<
showControlsBar: true,
controlsBarConstructor: "HLayout",
controlsBarDefaults : {
    defaultLayoutAlign:"center",
    height: 25,
    membersMargin: 5
},

//> @attr calendar.showPreviousButton (Boolean : null : IRW)
// Set to false to hide the +link{previousButton, Previous} button.
// @visibility calendar
//<

//> @attr calendar.previousButton (AutoChild ImgButton : null : IR)
// An +link{ImgButton} that appears above the week/day/month views of the
// calendar and allows the user to move the calendar backwards in time.
//
// @visibility calendar
//<
previousButtonConstructor: "ImgButton",
previousButtonDefaults : {
    title: "",
    src:"[SKINIMG]actions/back.png",
    showFocused:false,
    width: 16,
    height: 16,
    click : function () {
        this.creator.previous();
    },
    showRollOver: false,
    showDown: false
},

//> @attr calendar.showNextButton (Boolean : null : IRW)
// Set to false to hide the +link{nextButton, Next} button.
// @visibility calendar
//<

//> @attr calendar.nextButton (AutoChild ImgButton : null : IR)
// An +link{ImgButton} that appears above the week/day/month views of the
// calendar and allows the user to move the calendar forwards in time.
//
// @visibility calendar
//<
nextButtonConstructor: "ImgButton",
nextButtonDefaults : {
    title: "",
    src:"[SKINIMG]actions/forward.png",
    showFocused:false,
    width: 16,
    height: 16,
    click : function () {
        this.creator.next();
    },
    showRollOver: false,
    showDown: false
},

//> @attr calendar.dateLabel (AutoChild Label : null : IR)
// The +link{AutoChild} +link{Label} used to display the current date or range above the
// selected calendar view.
//
// @visibility calendar
//<
dateLabelConstructor: "Label",
dateLabelDefaults : {
    wrap: false,
    width: 5,
    height: 20,
    contents: "-"
},

// initial setup of the calendar
initWidget : function () {
    if (!this.chosenDate) this.chosenDate = new Date();
    this.year = this.chosenDate.getFullYear();
    this.month = this.chosenDate.getMonth();

    if (this.firstDayOfWeek == null)
        this.firstDayOfWeek = Number(isc.DateChooser.getInstanceProperty("firstDayOfWeek"));

    //>!BackCompat 2012.03.14 - previously undoc'd attributes, now being replaced
    if (this.timelineSnapGap != null) {
        this.snapGap = this.timelineSnapGap;
        delete this.timelineSnapGap;
    }
    if (this.timelineStartDate != null) {
        this.startDate = this.timelineStartDate.duplicate();
        delete this.timelineStartDate;
    }
    if (this.timelineEndDate != null) {
        this.endDate = this.timelineEndDate.duplicate();
        delete this.timelineEndDate;
    }
    if (this.timelineLabelFields != null) {
        this.laneFields = this.timelineLabelFields;
        this.timelineLabelFields = null;
    }
    if (this.eventTypeData != null) {
        this.lanes = isc.clone(this.eventTypeData);
        this.eventTypeData = null;
    }
    if (this.eventTypeField != null) {
        this.laneNameField = this.eventTypeField;
        delete this.eventTypeField;
    }
    if (this.showDescription != null) {
        this.showEventDescriptions = this.showDescription;
        delete this.showDescription;
    }
    if (this.canEditEventType != null) {
        this.canEditLane = this.canEditEventType;
        delete this.canEditEventType;
    }
    if (this.canDeleteEvents != null) {
        this.canRemoveEvents = this.canDeleteEvents;
        delete this.canDeleteEvents;
    }
    //<!BackCompat

    if (this.overlapSortSpecifiers && !isc.isAn.Array(this.overlapSortSpecifiers)) {
        this.overlapSortSpecifiers = [this.overlapSortSpecifiers];
    }

    if (!this.data) this.data = this.getDefaultData();
    // set hover text strings for toolbar buttons
    // can't set dynamically in defaults block, so have to do it here.
    this.previousButtonDefaults.prompt = this.previousButtonHoverText;
    this.nextButtonDefaults.prompt = this.nextButtonHoverText;
    this.datePickerButtonDefaults.prompt = this.datePickerHoverText;
    this.addEventButtonDefaults.prompt  = this.addEventButtonHoverText;

    this._setChosenWeek();
    this.createChildren();
    this._setWeekTitles();

    //if (this.dataSource) this.autoDetectFieldNames();

    if (!this.initialCriteria && this.autoFetchData) this.initialCriteria = this.getNewCriteria();
   // initialize the data object, setting it to an empty array if it hasn't been defined
    this.setData(null);

    this.invokeSuper(isc.Calendar, "initWidget");
},

autoDetectFieldNames : function () {
    this.dataSource = isc.DS.getDataSource(this.dataSource);

    // pick some likely looking fields if no sensible ones are provided - wants
    // for some future cleverness, perhaps, pretty basic selection here

    var ds = this.dataSource,
        fields = isc.getValues(ds.getFields()),
        maxSize = 1024000,
        bestField;

    if (this.fieldIsMissing(this.nameField, ds)) {
        // assume the titleField from the DS if the
        this.nameField = ds.getTitleField();
    }
    if (this.fieldIsMissing(this.descriptionField, ds)) {
        // loop and find a string field > 255 chars and < 100k (otherwise
        // choose the largest under 100k)
        fields.sortByProperties(["length"], [false]);

        bestField = {length:0};
        for (var i=0; i<fields.length; i++) {
            var field = fields.get(i);
            if (!field.type || field.type == "text" || field.type == "string") {
                if (field.length > 255 && field.length < maxSize) {
                    this.descriptionField = field.name;
                    break;
                } else if (field.length && field.length < maxSize &&
                    field.length > bestField.length) {
                    bestField = field;
                } else if (!field.length) {
                    if (!bestField) bestField = field;
                }
            }
        }
        if (this.fieldIsMissing(this.descriptionField, ds) && bestField)
            this.descriptionField = bestField.name;
    }
    if (this.fieldIsMissing(this.startDateField, ds)) {
        // any date field, preferring one with "start" or "begin" in it's name
        bestField=null;
        for (var i=0; i<fields.length; i++) {
            var field = fields.get(i);
            if ((field.type == "date" || field.type == "datetime")) {
                if (field.name.toLowerCase().indexOf("start") >= 0 ||
                    field.name.toLowerCase().indexOf("begin") >= 0)
                {
                    this.startDateField = field.name;
                    break;
                } else bestField = field;
            }
        }
        if (this.fieldIsMissing(this.startDateField, ds) && bestField)
            this.startDateField = bestField.name;
    }
    if (this.fieldIsMissing(this.endDateField, ds)) {
        // any date field, preferring one with "end" or "stop" in it's name
        bestField=null;
        for (var i=0; i<fields.length; i++) {
            var field = fields.get(i);
            if ((field.type == "date" || field.type == "datetime")) {
                if (field.name.toLowerCase().indexOf("end") >= 0 ||
                    field.name.toLowerCase().indexOf("stop") >= 0)
                {
                    this.endDateField = field.name;
                    break;
                } else if (field.name != this.startDateField)
                    bestField = field;
            }
        }
        if (this.fieldIsMissing(this.endDateField, ds) && bestField)
            this.endDateField = bestField.name;
    }
},

fieldIsMissing : function (fieldName, ds) {
    // is a field unset or absent from the ds
    return (!fieldName || fieldName == "" || (ds && !ds.getField(fieldName)));
},

getDefaultData : function () { return []; },

//> @method calendar.setData() ([])
// Initialize the data object with the given array. Observes methods of the data object
// so that when the data changes, the calendar will redraw automatically.
//
// @param newData (List of CalendarEvent) data to show in the list
//
// @group data
// @visibility calendar
//<
setData : function (newData) {
    // if the current data and the newData are the same, bail
    // (this also handles the case that both are null)
    if (this.data == newData) return;

    // if we are currently pointing to data, stop observing it
    if (this.data) {
        this.ignore(this.data, "dataChanged");
        // if the data was autoCreated, destroy it to clean up RS<->DS links
        if (this.data._autoCreated && isc.isA.Function(this.data.destroy))
            this.data.destroy();
    }

    // if newData was passed in, remember it
    if (newData) this.data = newData;

    // if data is not set, bail
    if (!this.data) return;

    // observe the data so we will update automatically when it changes
    this.observe(this.data, "dataChanged", "observer.dataChanged()");
    if (this.hasData()) {
        // invoke dataChanged so calendar refreshes when passed new data
        this.dataChanged();
    }
},

//> @method calendar.getData()
// Get the data that is being displayed and observed
//
// @return (object) The data that is being displayed and observed
//<
getData : function () {
    return this.data;
},

hasData : function () {
    if (!this.data ||
        (isc.ResultSet && isc.isA.ResultSet(this.data) && !this.data.lengthIsKnown()))
    {
        return false;
    } else {
        return true;
    }
},


dataChanged : function () {
    if (this.destroying || this.destroyed) return;

    // see addEvent, updateEvent, deleteEvent, and comment above about _ignoreDataChanged
    if (this._ignoreDataChanged) {
        this.logDebug('dataChanged, ignoring','calendar');
        this._ignoreDataChanged = false;
    } else {
        this.logDebug('dataChanged, refreshing', 'calendar');
        this.refreshSelectedView();
    }

},

destroy : function () {
    if (this.data) this.ignore(this.data, "dataChanged");
    this.Super("destroy", arguments);
},

refreshSelectedView : function () {
   if (this.dayViewSelected()) {
        this.dayView.refreshEvents();
        if (this.monthView) this.monthView.refreshEvents();
    } else if (this.weekViewSelected()) {
        this.weekView.refreshEvents();
        if (this.monthView) this.monthView.refreshEvents();
    } else if (this.monthViewSelected()) {
        this.monthView.refreshEvents();
    } else if (this.timelineViewSelected()) {
        this.timelineView.refreshEvents();
    }
},

//> @method calendar.getSelectedView()
// Returns the currently selected +link{ListGrid, grid-view} instance.
// @return (ListGrid) the currently selected grid-view
//<
getSelectedView : function () {
    if (this.dayViewSelected()) {
       return this.dayView;
    } else if (this.weekViewSelected()) {
       return this.weekView;
    } else if (this.monthViewSelected()) {
       return this.monthView;
    } else if (this.timelineViewSelected()) {
       return this.timelineView;
    }
},

//> @type ViewName
// The names of the Calendar views.
// @value "day" day view
DAY: "day",
// @value "week" week view
WEEK: "week",
// @value "month" month view
MONTH: "month",
// @value "timeline" timeline view
TIMELINE: "timeline",
// @visibility external
//<

//> @attr calendar.rowHeight (number : 20 : IRW)
// The height of time-slots in the calendar.
// @visibility external
//<
rowHeight: isc.ListGrid.getInstanceProperty("cellHeight"),

setRowHeight : function (newHeight) {
    this.rowHeight = newHeight;
    if (this.dayView) {
        this.dayView.setCellHeight(this.rowHeight);
        this.dayView.refreshEvents();
    }
    if (this.weekView) {
        this.weekView.setCellHeight(this.rowHeight);
        this.weekView.refreshEvents();
    }
},

//> @attr calendar.currentViewName (ViewName : null: IRW)
// The name of the view that should be visible initially by default.
// @visibility external
//<

//> @method calendar.getCurrentViewName()
// Get the name of the visible view.   Returns one of 'day', 'week', 'month' or 'timeline'.
//
// @return (ViewName) The name of the currently visible view.
// @visibility external
//<
getCurrentViewName : function () {
    var view = this.getSelectedView();
    return view != null ? view.viewName : null;
},

//> @method calendar.setCurrentViewName()
// Sets the currently visible view.
//
// @param viewName (ViewName) The name of the view that should be made visible.
// @return (ViewName) The name of the visible view.
// @visibility external
//<
setCurrentViewName : function (viewName) {
    var tabToSelect = this.mainView.tabs.find("viewName", viewName);
    if (tabToSelect) this.mainView.selectTab(tabToSelect);
    return viewName;
},

// get/setEventWindowID ensure that eventWindow-to-record mapping remains stable when databound.
// The expando approach doens't work when databound because the expando gets wiped out
// on update.
getEventWindowID : function (record) {
    if (!record) return null;
    var ds = this.getDataSource();
    if (ds && ds.getPrimaryKeyFieldNames().length > 0) {
        var pks = ds.getPrimaryKeyFields();
        var pk = "";
        for (var pkName in pks) {
            pk += record[pkName];
        }
        return this._eventWinMap[pk];
    } else {
        return record._eventWindowID;
    }
},

setEventWindowID : function (record, eventWindowID) {
    if (!this._eventWinMap) this._eventWinMap = [];
    var ds = this.getDataSource();
    if (ds && ds.getPrimaryKeyFieldNames().length > 0) {
        var pks = ds.getPrimaryKeyFields();
        var pk = "";
        for (var pkName in pks) {
            pk += record[pkName];
        }
        this._eventWinMap[pk] = eventWindowID;
    } else {
        record._eventWindowID = eventWindowID;
    }
},

//< @method calendar.clearTimeSelection()
// When overriding +link{calendar.backgroundClick} and returning false to suppress default
// behavior, use this method to clear the selection from the day or week views.
// @visibility internal
//<
clearTimeSelection : function () {
    if (this.dayView) this.dayView.clearSelection();
    if (this.weekView) this.weekView.clearSelection();
},

// includes start date but not end date
getDayDiff : function (date1, date2, weekdaysOnly) {
    return Math.abs(isc.Date._getDayDiff(date1, date2, weekdaysOnly, false));
},

getEventStartCol : function (event, eventWin) {
    var win = eventWin || this._findEventWindow(event);
    var startCol = this.getSelectedView().getEventColumn(win.getLeft() + 1);
    return startCol;
},

getEventEndCol : function (event, eventWin) {
    var win = eventWin || this._findEventWindow(event);
    var endCol = this.getSelectedView().getEventColumn(win.getLeft() + win.getVisibleWidth() + 1);
    return endCol;
},

// helper method for getting the left coord of an event
getEventLeft : function (event, isWeek) {
    var grid = this.getSelectedView();

    var accountForLabelCol = (grid.showLabelColumn &&
            grid.labelColumnPosition == "left");
    var eLeft = accountForLabelCol ? grid.labelColumnWidth : 0;
    var colSize = grid.getColumnWidth(grid.isLabelCol && grid.isLabelCol(0) ? 1 : 0);
    if (grid._isWeek) {

        var dayDiff = this.getDayDiff(event[this.startDateField], this.chosenWeekStart,
            (this.showWeekends == false));
        //isc.logWarn('getEventLeft:' + [event.name, event.startDate.toShortDate(),
        //                   this.chosenWeekStart.toShortDate(),dayDiff ]);
        eLeft = (dayDiff * colSize) + (accountForLabelCol ? grid.labelColumnWidth : 0);
    }
    if (this.logIsDebugEnabled("calendar")) {
        this.logDebug('calendar.getEventLeft() = ' + eLeft + ' for:' + isc.Log.echoFull(event), 'calendar');
    }
    return eLeft;
},

//> @method calendar.setShowWeekends()
//  Setter for +link{calendar.showWeekends} to change this property at runtime.
//
// @visibility calendar
//<
setShowWeekends : function (showWeekends) {
    this.showWeekends = showWeekends;
    if (isc.isA.TabSet(this.mainView)) {
        var tabNum = this.mainView.getSelectedTabNumber();
        this.mainView.removeTabs(this.mainView.tabs);

        if (this.dayView) this.dayView.destroy();

        if (this.weekView) this.weekView.destroy();

        if (this.monthView) this.monthView.destroy();

        var newTabs = this._getTabs();

        this.mainView.addTabs(newTabs);
        this.mainView.selectTab(tabNum);

    } else {
        var memLayout = this.children[0].members[1];

        var oldMem = memLayout.members[1];
        var newMem = this._getTabs()[0].pane;

        memLayout.removeMember(oldMem);
        oldMem.destroy();
        memLayout.addMember(newMem);
        //memLayout.redraw();
        //newMem.show();
    }
    this._setWeekTitles();
    this.setDateLabel();
},

//> @method calendar.canEditEvent()
// Method called whenever the calendar needs to determine whether a particular event should be
// editable.
// <P>
// By default, checks the +link{canEditField} on the provided +link{CalendarEvent}, and if null,
// returns +link{canEditEvents}.
//
// @param event (CalendarEvent)
// @return (boolean) whether the user should be allowed to edit the provided CalendarEvent
//<
canEditEvent : function (event) {
    if (!event) return false;
    else if (event[this.canEditField] != null) return event[this.canEditField];
    else return this.canEditEvents;
},

//> @method calendar.canRemoveEvent()
// Method called whenever the calendar needs to determine whether a particular event should show
// a remove button to remove it from the dataset.
// <P>
// By default, checks the +link{canRemoveField} on the provided +link{CalendarEvent}, and if null,
// returns true if both +link{canRemoveEvents} and
// +link{calendar.canEditEvent, canEditEvent(event)} are true.
//
// @param event (CalendarEvent)
// @return (boolean) whether the user should be allowed to remove the provided CalendarEvent
//<
canRemoveEvent : function (event) {
    if (!event) return false;
    // return the canRemoveField value if its set
    else if (event[this.canRemoveField] != null) return event[this.canRemoveField];
    // return true if canRemoveEvents is true AND the event is editable
    else return this.canRemoveEvents && this.canEditEvent(event);
},

getDateEditingStyle : function () {
    // ensure backward compatibility
    if (!this.timelineViewSelected()) {
        return "time";
    }
    var result = this.dateEditingStyle;
    if (!result) {
        // auto-detect based on field-type
        if (this.dataSource) result = this.getDataSource().getField(this.startDateField).type;

        // default to datetime
        if (!result) {
            switch (this.timelineGranularity) {
                case "hour": result = "datetime"; break; // > "minute" && < "day"
                case "millisecond", "second", "minute": result = "time"; break; // <= "minute"
                default: result = "date"; break; // >= "day"
            }
        }
    }
    return result;
},

//> @method calendar.addEvent()
// Create a new event in this calendar instance.
//
// @param startDate     (Date or Object) start date of event, or CalendarEvent Object
// @param endDate       (Date) end date of event
// @param name          (String) name of event
// @param description   (String) description of event
// @param otherFields   (Object) new values of additional fields to be updated
//
// @visibility calendar
//<
addEvent : function (startDate, endDate, name, description, otherFields, ignoreDataChanged, laneName) {
    // We explicitly update the UI in this method, so no need to react to 'dataChanged' on the
    // data object
    if (ignoreDataChanged == null) ignoreDataChanged = true;
    if (!isc.isAn.Object(otherFields)) otherFields = {};
    var evt;
    if (isc.isA.Date(startDate)) {
        evt = {};
        evt[this.startDateField] = startDate;
        evt[this.endDateField] = endDate;
        evt[this.nameField] = name;
        evt[this.descriptionField] = description;
        if (laneName) evt[this.laneNameField] = laneName;
        isc.addProperties(evt, otherFields);
    } else if (isc.isAn.Object(startDate)) {
        evt = startDate;
    } else {
        isc.logWarn('addEvent error: startDate parameter must be either a Date or an event record (Object)');
        return;
    }

    var _this = this;

    // add event to data
    // see comment above dataChanged about _ignoreDataChanged
    if (ignoreDataChanged) this._ignoreDataChanged = true;
    if (this.dataSource) {
        isc.DataSource.get(this.dataSource).addData(evt, function (dsResponse, data, dsRequest) {
            _this.processSaveResponse(dsResponse, data, dsRequest);
        }, {componentId: this.ID, willHandleError: true});
        return;
    } else {
        // set the one-time flag to ignore data changed since we manually refresh in _finish()
        this._ignoreDataChanged = true;
        this.data.add(evt);
        this.processSaveResponse({status:0}, [evt], {operationType:"add"});
    }

},

//> @method calendar.removeEvent()
// Remove an event from this calendar.
//
// @param event (Object) The event object to remove from the calendar
//
// @visibility calendar
//<
removeEvent : function (event, ignoreDataChanged) {
    // We explicitly update the UI in this method, so no need to react to 'dataChanged' on the
    // data object
    if (ignoreDataChanged == null) ignoreDataChanged = true;

    var startDate = event[this.startDateField],
        endDate = event[this.endDateField];

     // set up a callback closure for when theres a DS
    var self = this;
    var _finish = function () {
        if (self._shouldRefreshDay(startDate, endDate)) {
            self.dayView.removeEvent(event);
        }
        if (self._shouldRefreshWeek(startDate, endDate)) {
            self.weekView.removeEvent(event);
        }
        if (self._shouldRefreshMonth(startDate, endDate)) {
            self.monthView.refreshEvents();
        }
        if (self._shouldRefreshTimelineView(startDate, endDate)) {
            self.timelineView.refreshEvents();
        }
        // when eventAutoArrange is true, refresh the day and week views to reflow the events
        // so that they fill any space made available by the removed event
        if (self.eventAutoArrange) {
            if (self.dayView) self.dayView.refreshEvents();
            if (self.weekView) self.weekView.refreshEvents();
        }
        // fire eventRemoved if present
        if (self.eventRemoved) self.eventRemoved(event);
    }
    // remove the data
    // see commment above dataChanged about _ignoreDataChanged
    if (ignoreDataChanged) this._ignoreDataChanged = true;
    if (this.dataSource) {
        isc.DataSource.get(this.dataSource).removeData(event, _finish, {
            componentId: this.ID,
            oldValues : event
        });
        return;
    } else {
        this.data.remove(event);
        _finish();
    }

},

//> @method calendar.updateEvent()
// Update an event in this calendar.
//
// @param event       (CalendarEvent) The event object to remove from the calendar
// @param startDate   (Date) start date of event
// @param endDate     (Date) end date of event
// @param name        (String) name of event
// @param description (String) description of event
// @param otherFields (Object) new values of additional fields to be updated
//
// @visibility calendar
//<
updateEvent : function (event, startDate, endDate, name, description, otherFields, ignoreDataChanged, laneName) {
    // We explicitly update the UI in this method, so no need to react to 'dataChanged' on the
    // data object
    if (ignoreDataChanged == null) ignoreDataChanged = true;

    if (!isc.isAn.Object(otherFields)) otherFields = {};

    // must call _shouldRefreshDay twice, both with old and new dates. see _shouldRefreshDay.
    var oldStart = event[this.startDateField];
    var oldEnd = event[this.endDateField];

    var _this = this;

    // see commment above dataChanged about _ignoreDataChanged
    if (ignoreDataChanged) this._ignoreDataChanged = true;
    if (this.dataSource) {
        var updateRecord, ds = isc.DataSource.get(this.dataSource);

        var changes = {};
        changes[this.startDateField] = startDate.duplicate();
        changes[this.endDateField] = endDate.duplicate();
        changes[this.descriptionField] = description;
        changes[this.nameField] = name;
        if (laneName) changes[this.laneNameField] = laneName;
        var updatedRecord = isc.addProperties({}, event, changes, otherFields);
        ds.updateData(updatedRecord, function (dsResponse, data, dsRequest) {
            _this.processSaveResponse(dsResponse, data, dsRequest, event);
        }, {oldValues: event, componentId: this.ID, willHandleError: true});
        return;
    } else {
        var oldEvent = isc.addProperties({}, event);
        event[this.startDateField] = startDate.duplicate();
        event[this.endDateField] = endDate.duplicate();
        event[this.descriptionField] = description;
        event[this.nameField] = name;
        if (laneName) event[this.laneNameField] = laneName;
        if (event._overlapProps) event._overlapProps.visited = false;;
        isc.addProperties(event, otherFields);
        this.processSaveResponse({status:0}, [event], {operationType:"update"}, oldEvent);
    }
},

processSaveResponse : function (dsResponse, data, dsRequest, oldEvent) {
    var newEvent = isc.isAn.Array(data) ? data[0] : data;

    if (!newEvent || isc.isA.String(newEvent)) newEvent = oldEvent;

    var opType = dsRequest ? dsRequest.operationType : null,
        isUpdate = opType == "update",
        isAdd = opType == "add",
        fromDialog = this._fromEventDialog,
        fromEditor = this._fromEventEditor,
        oldStart = isUpdate && oldEvent ? oldEvent[this.startDateField] : null,
        oldEnd = isUpdate && oldEvent ? oldEvent[this.endDateField] : null
    ;

    delete this._fromEventDialog;
    delete this._fromEventEditor;

    if (dsResponse && dsResponse.status < 0) {
        var errors = dsResponse ? dsResponse.errors : null;
        // show any validation errors inline in the appropriate UI
        if (fromDialog) {
            if (errors) this.eventDialog.items[0].setErrors(errors, true);
            this.eventDialog.show();
        } else if (fromEditor) {
            this.eventEditorLayout.show();
            if (errors) this.eventEditor.setErrors(errors, true);
        }
        // have RPCManager handle other errors
        if (!errors) isc.RPCManager._handleError(dsResponse, dsRequest)
        return;
    }

    var startDate = newEvent[this.startDateField],
        endDate = newEvent[this.endDateField]
    ;
    if (this._shouldRefreshDay(startDate, endDate) ||
            (isUpdate && this._shouldRefreshDay(oldStart, oldEnd)))
    {
        if (isUpdate) {
            // call self.refreshEvents instead of self.updateEventWindow(newEvent),  to handle
            // all 3 cases described above _shouldRefreshDay
            this.dayView.refreshEvents();
        } else if (isAdd) this.dayView.addEvent(newEvent);
    }
    if (this._shouldRefreshWeek(startDate, endDate)) {
        if (isUpdate) this.weekView.updateEventWindow(newEvent);
        else if (isAdd) this.weekView.addEvent(newEvent);
    }
    if (this._shouldRefreshMonth(startDate, endDate)) {
        this.monthView.refreshEvents();
    }
    if (this._shouldRefreshTimelineView(startDate, endDate)) {
        if (isUpdate) this.timelineView.updateEventWindow(newEvent);
        else if (isAdd) this.timelineView.refreshEvents();
    }

    // fire eventChanged or eventAdded as appropriate
    if (isUpdate && this.eventChanged) this.eventChanged(newEvent);
    if (isAdd && this.eventAdded) this.eventAdded(newEvent);

},

eventsAreSame : function (first, second) {
    if (this.dataSource) {
        var ds = isc.DataSource.get(this.dataSource),
            pks = ds.getPrimaryKeyFieldNames(),
            areEqual = true;
        for (var i=0; i < pks.length; i++) {
            var pkName = pks[i];
            if (first[pkName]!= second[pkName]) {
                areEqual = false;
                break;
            }
        }
        return areEqual;
    } else {
        return (first === second);
    }
},

getEventTitle : function (event) {
    return event[this.nameField];
},

// Date / time formatting customization / localization


//> @attr calendar.dateFormatter (DateDisplayFormat : null : [IRW])
// Date formatter for displaying events.
// Default is to use the system-wide default short date format, configured via
// +link{Date.setShortDisplayFormat()}.  Specify any valid +link{type:DateDisplayFormat}.
// @visibility external
//<
dateFormatter:null,

//> @attr calendar.timeFormatter (TimeDisplayFormat : "toShortPaddedTime" : [IRW])
// Display format to use for the time portion of events' date information.
// @visibility external
//<
timeFormatter:"toShortPaddedTime",

//> @method calendar.getEventHoverHTML()
// Gets the hover html for an event being hovered over. Override here to return custom
// html based upon the parameter event object.
//
// @param event (CalendarEvent) The event being hovered
// @param eventWindow (EventWindow) the event window being hovered
// @return (HTMLString) the HTML to show in the hover
//
// @visibility calendar
//<
getEventHoverHTML : function (event, eventWindow) {
    var cal = this;

     // format date & times
    var startDate = event[cal.startDateField],
        sDate = startDate.toShortDate(this.dateFormatter, false),
        sTime = isc.Time.toTime(startDate, this.timeFormatter, true),
        endDate = event[cal.endDateField],
        eDate = endDate.toShortDate(this.dateFormatter, false),
        eTime = isc.Time.toTime(endDate, this.timeFormatter, true),
        name = event[cal.nameField],
        description = event[cal.descriptionField],
        result = sDate + "&nbsp;" + sTime + "&nbsp;-&nbsp;" + eTime
    ;

    if (this.isTimeline()) {
        if (startDate.getDate() != endDate.getDate()) {
            // Timeline dates can span days
            result = sDate + "&nbsp;" + sTime + "&nbsp;-&nbsp;" + eDate + "&nbsp;" + eTime;
        }
    }

    result += (name || description ? "</br></br>" : "")
            + (name ? name + "</br></br>" : "")
            + (description ? description : "")
    ;

    return result;
},

// trickiest case. 3 separate cases to handle:
// 1. event changed within chosen day
// 2. event moved into chosen day
// 3. event moved out of chosen day
// to handle all of these:
// - for adding, just pass start and end date
// - for deleting, just pass start and end date
// - for updating, must call this twice, both with old dates and new dates. see updateEvent.
_shouldRefreshDay : function (startDate, endDate) {
    if (!this.dayView) return false;
    var dayStart = new Date(this.year, this.month, this.chosenDate.getDate(),0, 0);
    var dayEnd = new Date(this.year, this.month, this.chosenDate.getDate(),23, 59);
    // subtle change: use only startDate instead of startDate and endDate to determine if
    // parameter range is in range so that events with end date on the next day are included.
    if (this.dayView.body && dayStart.getTime() <= startDate.getTime()
        && dayEnd.getTime() >= startDate.getTime()) {
        return true;
    } else return false;

},

_shouldRefreshWeek : function (startDate, endDate) {
    if (!this.weekView) return false;
    // advance end of week date by 1 minute so it falls on the first minute of the next day...
    // this allows events to end on 12:00am of the day following the the last day of the week
    // and fixes a bug where events created at that time weren't showing up
    var weekEnd = this.chosenWeekEnd.duplicate();
    weekEnd.setMinutes(weekEnd.getMinutes() + 1);
    //isc.logWarn('_shouldRefreshWeek:' + [weekEnd, endDate]);
    if (this.weekView.body && this.chosenWeekStart.getTime() <= startDate.getTime()
        && weekEnd.getTime() >= endDate.getTime()) {
        return true;
    } else return false;
},

_shouldRefreshMonth : function (startDate, endDate) {
    if (!this.monthView) return false;
    // provide a nice broad range to detect a month refresh should be done
    var mStart = new Date(this.year, this.month, -7);
    var mEnd = new Date(this.year, this.month, 37);
    if (mStart.getTime() <= startDate.getTime() && mEnd.getTime() >= endDate.getTime()) {
        return true;
    } else return false;
},

_shouldRefreshTimelineView : function (startDate, endDate) {
    // for now just return true if we're showing timeline view
    if (this.showTimelineView) return true;
    else return false;
},

//> @attr calendar.eventWindow (AutoChild EventWindow : null : A)
// To display events in day and week views, the Calendar creates instance of +link{EventWindow}
// for each event.  Use the +link{AutoChild} system to customize these windows.
// @visibility external
//<

_getNewEventWindow : function (event, view) {
    var canEdit = this.canEditEvent(event),
        canRemove = this.canRemoveEvent(event),
        styleName = event[this.eventWindowStyleField] || this.eventWindowStyle
    ;

    // get an eventWindow from the pool, if there are any in it
    var eventWin = view.poolEventWindows ? view.getPooledEventWindow() : null;
    if (eventWin) {
        eventWin.setProperties({
            className: styleName,
            baseStyle: styleName,
            headerStyle: styleName + "Header",
            bodyStyle: styleName + "Body",
            headerLabelProperties: { styleName: styleName + "Header" },
            canDragReposition: canEdit,
            canDragResize: canEdit,
            _redrawWithParent:false,
            showCloseButton: canRemove,
            event: event,
            descriptionText: event[this.descriptionField]
        });
        if (eventWin.header) eventWin.header.setStyleName(styleName + "Header");
        if (eventWin.headerLabel) eventWin.headerLabel.setStyleName(styleName + "Header");
        if (eventWin.body) eventWin.body.setStyleName(styleName + "Body");
    } else {
        // create eventWindow as an autoChild so it can be customized.
        var eventWin = this.createAutoChild("eventWindow", {
            calendar: this,
            className: styleName,
            baseStyle: styleName,
            canDragReposition: canEdit,
            canDragResize: canEdit,
            _redrawWithParent:false,
            showCloseButton: canRemove,
            event: event,
            descriptionText: event[this.descriptionField]
        }, isc.EventWindow);
    }

    return eventWin;
},

_getEventsInRange : function (start, end) {

        var results = [],
            wends = Date.getWeekendDays(),
            dataLength = this.data.getLength()
        ;

        for (var i = 0; i < dataLength; i++) {
            var curr = this.data.get(i);

            if (!curr || !curr[this.startDateField]) return [];
            // add the event if we're showing weekends or the date is not a weekend
            // The event won't get added only when !this.showWeekends and it is a weekend
            // subtle change: use only startDate instead of startDate and endDate to determine if
            // parameter range is in range so that events with end date on the next day are included.
            if (curr[this.startDateField].getTime() >= start.getTime()
                && curr[this.startDateField].getTime() <= end.getTime()
                && (this.showWeekends || !wends.contains(curr[this.startDateField].getDay()))) {
                results.add(curr);
            }
        }

        return results;
},

_getEventsTouchingRange : function (start, end, recalcRange, skipEvents) {
// Return all events with any overlap on the supplied range - _getEventsInRange
// only returns fully encapsulated events
// If recalcRange = true, make multiple passes of the events to include ones that do not
// overlap the specified range but that overlap other events that do!  Those events will also
// need redrawing when their overlapped events redraw.

    var results = [],
        wends = Date.getWeekendDays(),
        startTime = start.getTime(),
        maxEndDate = this.getDayEnd(start),
        endTime = end.getTime(),
        tempStart = startTime,
        tempEnd = endTime,
        finished = false,
        dataLength = this.data.getLength(),
        startDay = start.getDay()
    ;

    skipEvents = skipEvents || [];

    var endDate = (Date.compareDates(start, end) < 0) ? maxEndDate : end;
    while (!finished) {
        for (var i = 0; i < dataLength; i++) {

            var curr = this.data.get(i),
                currStartDate = curr[this.startDateField],
                currEndDate = curr[this.endDateField]
            ;

            if (skipEvents.contains(curr)) {
                continue;
            }

            if (!currStartDate) return [];

            if ((currEndDate.getHours() == 0 && currEndDate.getMinutes() == 0) || currEndDate < currStartDate) {
                // needs to be set to the end of currEndDate, not maxEndDate, in a second pass
                currEndDate.setHours(23);
                currEndDate.setMinutes(59);
                currEndDate.setSeconds(59);
            }

            var eStartTime = currStartDate.getTime(),
                eStartDay = currStartDate.getDay(),
                eEndTime = currEndDate.getTime(),
                eEndDay = currEndDate.getDay()
            ;

            var startInRange = (eStartTime >= startTime
                && eStartTime < endTime
                && eStartDay == startDay);

            var endInRange = (eEndTime > startTime
                && eEndTime <= endTime
                && eEndDay == startDay);

            var rangeInEventRange = (eStartTime <= startTime) &&
                                    (eEndTime >= endTime) &&
                                    (eStartDay == startDay);

            // add the event if it falls within the range and either we're showing weekends or
            // the date is not a weekend
            if ((startInRange || endInRange || rangeInEventRange)
                && (this.showWeekends || !wends.contains(currStartDate.getDay())))
            {
                results.add(curr);
                if (recalcRange) {
                    // store min and max times for a second pass
                    if (currStartDate.getTime() < tempStart) {
                        tempStart = currStartDate.getTime();
                    }
                    if (currEndDate.getTime() > tempEnd) {
                        tempEnd = currEndDate.getTime();
                    }
                }
            }
        }
        if (!recalcRange || (tempStart == startTime && tempEnd == endTime)) {
            finished = true;
        } else {
            startTime = tempStart;
            endTime = tempEnd;
            results.clear();
        }
    }

    return results;
},

_findEventWindow : function (event, isWeek) {
    // return the eventWindow object containing the passed event
    var grid = (this.isTimeline() ? this.timelineView : isWeek ? this.weekView : this.dayView);

    if (!grid.body || !grid.body.children) return;
    var arr = grid.body.children;
    if (this.dataSource) this._pks = isc.DataSource.get(this.dataSource).getLocalPrimaryKeyFields();
    for (var i = 0; i < arr.length ; i++) {
        if (isc.isAn.EventWindow(arr[i])
            && grid.areSame(arr[i].event, event)
            && arr[i]._isWeek == isWeek) {
            // return the event-window
            return arr[i];
        }
    }
    return false;
},

// Event windows rendered into a single column (day) of the grid (week) may overlap
//
// In this case we render each event window at 1/2 of the column width
// (or 1/3 for three overlaps etc)
// This method takes an array of events, determines whether they overlap and sizes / positions
// them accordingly.

_prepareAutoArrangeOffsets : function (events, grid) {
// work out the size and position of events

    var details = [],
        yOffset = 60 / this.eventSnapGap,
        timeslotCount = 24 * yOffset,
        columnCount=[
            new Array(timeslotCount), new Array(timeslotCount), new Array(timeslotCount),
            new Array(timeslotCount), new Array(timeslotCount), new Array(timeslotCount),
            new Array(timeslotCount)
        ];


    for (var i = 0; i < timeslotCount; i++) {
        // assignedCol    next start offset for an event in this timeslot
        // usedCol        timeslot is used in another event, but the event does not START here
        //                this is the end offset of the next event starting in this slot
        // exactTime      allow configurable overlap for exact start-times
        details.add({ usedCol: [0,0,0,0,0,0,0], assignedCol: [0,0,0,0,0,0,0], exactTime: [0,0,0,0,0,0,0] });
    }

    var dataLength = events.getLength();
    for (var i = 0; i < dataLength; i++) {
        var curr = events.get(i);

        var loopStartDate = curr[this.startDateField],
            loopEndDate = curr[this.endDateField],
            eventLength = this.getEventLength(loopStartDate, loopEndDate),
            eventDay = loopStartDate.getDay()
        ;

        // normalize the time-slice to fixed intervals according to this.eventSnapGap
        var startHours = loopStartDate.getHours(),
            startMinutes = loopStartDate.getMinutes(),
            startOffset = startMinutes % this.eventSnapGap;

        if (startOffset) {
            startMinutes = startMinutes - startOffset;
        }
        if (startHours == 24) startHours = 0;

        var eventEndDay = loopEndDate.getDay(),
            endHours = loopEndDate.getHours(),
            endMinutes = loopEndDate.getMinutes(),
            endOffset = endMinutes % this.eventSnapGap
        ;

        // If we go over the day boundary, clamp the end of the event to midnight on the
        // event start day for purposes of rendering it out.
        if (eventEndDay > eventDay) {
            endHours = 24;
            endMinutes = 0;
            endOffset = 0;
        }

        if (endOffset) {
            endMinutes = endMinutes + (this.eventSnapGap - endOffset);
            if (endMinutes == 60) {
                endMinutes = 0;
                endHours++;
            }
        }

        // startIndex / endIndex - which slots in our timeSlots array does this event span?
        var startIndex = (startHours * yOffset) + Math.round(startMinutes / this.eventSnapGap),
            endIndex = (endHours * yOffset) + Math.round(endMinutes / this.eventSnapGap);

        // curr is the current event.
        // Offsets are calculated in terms of how many events there are in the time-slot in
        // question
        curr._eventOffset = 0;
        curr._eventEndOffset = 0;
        curr._eventStartIndex = startIndex;
        curr._eventEndIndex = endIndex;

        for (var currIndex = startIndex; currIndex < endIndex; currIndex++) {
            var detail = details[currIndex];
            var used = details[currIndex].usedCol[eventDay];
            var assigned = details[currIndex].assignedCol[eventDay];
            var exactTime = details[currIndex].exactTime[eventDay];

            if (columnCount[eventDay][currIndex] == null) columnCount[eventDay][currIndex] = 0;

            if (currIndex == startIndex) {
                // if the start-time is not already used, assign all time-slots (left align
                // the event)
                var startTimeInUse = assigned != 0;
                // set the event's left-offset
                curr._eventOffset = assigned;

                if (this.eventOverlap) {
                    if (!this.eventOverlapIdenticalStartTimes) {
                        curr._drawOverlap = exactTime == 0;
                    } else {
                        curr._drawOverlap = true;
                    }
                    exactTime = 1;
                }

                assigned++;

                if (assigned > columnCount[eventDay][currIndex]) {
                    // summarise the max columns required
                    columnCount[eventDay][currIndex] = assigned;
                }

                // set the event's right-offset - if this is zero, it will be updated to
                // column-count later
                if (!startTimeInUse && used != 0 ) {
                    curr._eventEndOffset = used;
                    assigned = used + 1;
                } else {
                    if (assigned <= used) {
                        curr._eventEndOffset = used;
                        assigned = used + 1;
                    } else {
                        curr._eventEndOffset = columnCount[eventDay][currIndex];
                    }
                }
            } else {

                if (startTimeInUse) {
                    if (assigned == 0) {
                        // current time-slot not in use - mark its "used" offset
                        if (used == 0) {
                            used = curr._eventOffset;
                        }
                    } else {
                        // shift the time-slot's left-offset to
                        if (used == 0){
                            if (curr._eventOffset > assigned) {
                                used = curr._eventOffset;
                            } else {
                                // the column after this one
                                assigned = curr._eventOffset + 1;
                            }
                        } else if (assigned < used) {
                            // the column after the overlapping event's column
                            assigned = used + 1;
                        }
                    }
                } else {
                    if (assigned + 1 < used) {
                        assigned++;
                    } else {
                        assigned = used + 1;
                    }
                }
            }
            details[currIndex].usedCol[eventDay] = used;
            details[currIndex].assignedCol[eventDay] = assigned;
            details[currIndex].exactTime[eventDay] = exactTime;
        }

    }

    return columnCount;
},


getDayEnd : function (startDate) {
    return new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(),23,59,59);
},

isTimeline : function () {
    var isTimeline = this.getCurrentViewName() == "timeline";
    return isTimeline;
},

eventsOverlapGridLines: true,
_renderEventRange : function (isWeek, start, end, skipEvents) {

    var grid = (this.isTimeline() ? this.timelineView : isWeek ? this.weekView : this.dayView);
    if (!grid || !grid.isDrawn()) return;

    var rowSize = grid.getRowHeight(1),
        colSize = grid.getColumnWidth(grid.isLabelCol(0) ? 1 : 0);

    var startDate = start, endDate = end;

    if (Date.compareDates(startDate, endDate) < 0) {
        endDate = this.getDayEnd(startDate);
    }

    // get the events that overlap
    var localEvents = this._getEventsTouchingRange(startDate, endDate, true, skipEvents);

    // bail if there are no events
    if (!localEvents || localEvents.length == 0) return;

    // sort the array by start-time and end-time
    localEvents.sortByProperties([this.startDateField, this.endDateField],
        [true, false]);

    // work out the drawing offsets for the events
    var columnCount = this._prepareAutoArrangeOffsets(localEvents, grid);
    // potentially invalid column count when adding a new event of short duration
    for (var i=0; i<columnCount.length; i++) {
        for (var j=0; j<columnCount[i].length; j++) {
            if (columnCount[i][j] == 0) columnCount[i][j] = 1;
        }
    }
    // re-sort the events by left-offset to keep the zorder in check
    localEvents.unsort();
    localEvents.sortByProperties(["_eventOffset"], [true]);


    //var range = this.getTimeSlotsTouchedByEventRange(curr);
    var range = { min: localEvents.getProperty("_eventStartIndex").min(),
            max: localEvents.getProperty("_eventEndIndex").max()
    }

    var dataLength = localEvents.getLength();
    // loop over the overlapped windows and shift them all accordingly
    for (var i = 0; i < dataLength; i++) {
        var curr = localEvents.get(i),
            eStartDate = curr[this.startDateField],
            eEndDate = curr[this.endDateField]
        ;

        // get the width of each display-column
        var periodStartDay = eStartDate.getDay();
        var colCountArray = columnCount[periodStartDay];

        // max is non-inclusive
        var divisor = colCountArray.max(range.min,range.max);
        if (divisor == null) {
            var max = Math.max(range.min,range.max);
            if (max != null && colCountArray[max] != null) {
                divisor = colCountArray[max];
            }
        }

        var periodWidth = colSize / Math.max(1,divisor);

        // potentially invalid eventEndOffset when adding a new event of short duration
        if (curr._eventEndOffset == 0) curr._eventEndOffset = 1;

        var eLeft = this.getEventLeft(curr, isWeek);

        // and shift the x-offset
        eLeft += (curr._eventOffset * periodWidth);
        var eWidth = (curr._eventEndOffset - curr._eventOffset) * periodWidth;

        if (this.eventOverlap && curr._drawOverlap) {
            if (curr._eventOffset > 0) {
                eLeft -= periodWidth * (this.eventOverlapPercent / 100);
                eWidth += periodWidth * (this.eventOverlapPercent / 100);
            }
        }

        // catch the case where the end of the event is on 12am, which happens when an
        // event is dragged or resized to the bottom of the screen
        var eEndHrs = eEndDate.getHours(),
            eEndMins = eEndDate.getMinutes();

        // if eEndHrs is 0, the event ends at midnight - if the event starts BEFORE midnite,
        // need to make the end-minutes 0 (so we don't draw events off the bottom of the calendar)
        if (eEndHrs == 0 && (eEndMins == 0 || eEndDate.getDate() != eStartDate.getDate())) {
            eEndHrs = 24;
            eEndMins = 0;
        }

        var eHeight = (eEndHrs - eStartDate.getHours()) * (rowSize * 2)

        // for border overlap
        if (this.weekEventBorderOverlap && grid._isWeek) eWidth += 1;

        if (eStartDate.getMinutes() > 0) {
            eHeight -= this._getMinutePixels(eStartDate.getMinutes(), rowSize);
        }
        if (eEndMins > 0) {
            eHeight += this._getMinutePixels(eEndMins, rowSize);
        }

        var eTop = eStartDate.getHours() * (rowSize * 2);
        if (eStartDate.getMinutes() > 0) {
            eTop += this._getMinutePixels(eStartDate.getMinutes(), rowSize);
        }

        var win = this._findEventWindow(curr, isWeek);

        if (this.eventsOverlapGridLines) {
            eLeft -= 1;
            eWidth += 1;
            eTop -= 1;
            eHeight += 1;
        }

        if (curr._eventEndOffset == divisor || divisor == 0) {
            // leave an eventDragGap to the right of right-aligned events to allow
            // drag-creation of overlapping events
            eWidth -= this.eventDragGap;
        }

        if (win) {
//             isc.logWarn('event:' + [eTop, eLeft, eWidth, eHeight]);
            win.renderEvent(eTop, eLeft, eWidth, eHeight);
        }
    }
},

getTimeSlotsTouchedByEventRange : function (event) {
    var events = this._getEventsTouchingRange(event[this.startDateField], event[this.endDateField], true);

    var minSlot = events.getProperty("_eventStartIndex").min();
    var maxSlot = events.getProperty("_eventEndIndex").max();

    return { min: minSlot, max: maxSlot };
},

_setChosenWeek : function () {

    var startDate =
        this.chosenWeekStart = new Date(this.year, this.month, this.chosenDate.getDate()
        - this.chosenDate.getDay() + this.firstDayOfWeek);

    // make sure the current week surrounds the current date.
    // if chosen date is less than startDate, shift week window back one week.
    if (Date.compareDates(this.chosenDate,startDate) == 1) {
        this.chosenWeekStart.setDate(this.chosenWeekStart.getDate() - 7);
    }
    this.chosenWeekEnd = new Date(startDate.getFullYear(), startDate.getMonth(),
       startDate.getDate() + 6, 23, 59);

    // similary, if chosen date is greater than chosenWeekEnd, shift week window up one week.
    if (Date.compareDates(this.chosenDate, this.chosenWeekEnd) == -1) {
        this.chosenWeekStart.setDate(this.chosenWeekStart.getDate() + 7);
        this.chosenWeekEnd.setDate(this.chosenWeekEnd.getDate() + 7);
    }
},

//> @method calendar.setChosenDate()
// Set the current date for which the calendar will display events.
//
// @param newDate (Date) the new date to set as the current date
//
// @visibility external
//<
setChosenDate : function (newDate, fromTimelineView) {
    this.year = newDate.getFullYear();
    this.month = newDate.getMonth();
    this._oldDate = this.chosenDate.duplicate();
    this.chosenDate = newDate;
    this._setChosenWeek();

    // redraw monthview if need be
    if (this._oldDate.getFullYear() != this.year || this._oldDate.getMonth() != this.month) {
        if (this.monthView) this.monthView.refreshEvents();
    }

    // check if the week needs redrawn
    var startDate = new Date(this._oldDate.getFullYear(), this._oldDate.getMonth(),
        this._oldDate.getDate() - this._oldDate.getDay());
    var endDate = new Date(startDate.getFullYear(), startDate.getMonth(),
            startDate.getDate() + 6);
    var chosenTime = this.chosenDate.getTime();
    if (chosenTime < startDate.getTime() || chosenTime > endDate.getTime()) {
        if (this.weekView) {
            this.weekView.refreshEvents();
            this._setWeekTitles();
        }
    }
    // check for day redraw
    if (chosenTime != this._oldDate.getTime()) {
        if (this.dayView) {
            this.dayView.refreshStyle();
            this.dayView.refreshEvents();
        }
    }

    if (this.timelineView && !fromTimelineView) {
        this.timelineView.setTimelineRange(this.chosenDate, null, null, null, true);
    } else {
        var view = this.getSelectedView();
        if (this.scrollToWorkday && view.scrollToWorkdayStart) {
            view.scrollToWorkdayStart();
        } else view.redraw();
    }

    // reset date label
    this.setDateLabel();
    // call dateChanged
    this.dateChanged();

},

//> @method calendar.dateIsWorkday()
// Should the parameter date be considered a workday? By default this method tries to find the
// parameter date day in +link{workdays}, and returns true if found. Override this method to
// provide custom logic for determining workday, for example returning false on holidays.
//
// @param date (Date) date to check for being a workday
// @return (boolean) true if date is a workday, false otherwise
// @visibility Calendar
//<
dateIsWorkday : function (date) {
    if (!date || !this.workdays) return false;
    return this.workdays.contains(date.getDay());
},

//> @method calendar.adjustCriteria()
// Gets the criteria to use when the calendar date ranges shift and the +link{calendar.fetchMode}
// is not "all". This would be called, for example, when the next button is clicked and new
// events possibly need to be fetched. Override this function to add any custom criteria to the
// default criteria constructed by the calendar.
//
// @param defaultCriteria (Criterion) default criteria generated by the calendar
// @return (Criterion) modified criteria
//
// @visibility internal
//<
adjustCriteria : function (defaultCriteria) {
        return defaultCriteria;
},

getNewCriteria : function () {
    var criteria = {}, view;
    if (this.fetchMode == "timeline") {
        view = this.timelineView;
        var criter = {
            _constructor:"AdvancedCriteria",
            operator:"and",
            criteria: [
                { fieldName: this.startDateField, operator: "greaterThan", value: view.startDate},
                { fieldName: this.endDateField, operator: "lessThan", value: view.endDate}
            ]
        };
        // allow users to manipulate the criteria by overriding getNewCriteria()
        criteria = this.adjustCriteria(criter);
    }
    return criteria;
},

_usDateRegex:/^\d{4}.\d\d?.\d\d?$/,
_jpDateRegex:/^\d\d?.\d\d.\d{4}?$/,
_setWeekTitles : function () {
    if (!this.weekView) return;
    var nDate = this.chosenWeekStart.duplicate();
    // set day titles
    var sdNames = Date.getShortDayNames();
    var weekends = Date.getWeekendDays();

    for (var i = 1; i < 8; i++) {
        // for hidden columns, getFieldNum will return -1. without this check, a logWarn is
        // produced when weekends are hidden
        if (this.weekView.getFieldNum("day" + i) >= 0) {
            // We want a format like "Mon 28/11" or "Mon 11/28" depending on whether the
            // dateFormatter specified is Euro / US / Japanese.
            // We don't currently have anything built into Date for this so get the shortDate
            // and lop off the year + separator.
            var dateStr = nDate.toShortDate(this.dateFormatter, false);

            if (dateStr.match(this._usDateRegex) != null) dateStr = dateStr.substring(5);
            else if (dateStr.match(this._jpDateRegex)) dateStr = dateStr.substring(0,dateStr.length-5)

            var ntitle = sdNames[nDate.getDay()] + " " + dateStr;
            //(nDate.getMonth() + 1) + "/" + nDate.getDate();
            // _dayNum is used in colDisabled()
            // _dateNum, monthNum, yearNum are used in headerClick
            var fieldProps = {
                title: ntitle, align: "right",
                _dayNum: nDate.getDay(),
                _dateNum: nDate.getDate(),
                _monthNum: nDate.getMonth(),
                _yearNum: nDate.getFullYear()
            }
            this.weekView.setFieldProperties("day" + i, fieldProps);
            if (this.weekView.header) this.weekView.header.markForRedraw();
            //isc.logWarn('here:' + [nDate.toShortDate(), "day" + i]);
        }

        nDate.setDate(nDate.getDate() + 1);
    }
},

//> @method calendar.next()
// Move to the next day, week, or month, depending on which tab is selected.
//
// @visibility calendar
//<
next : function () {
   // var tab = this.mainView.selectedTab;
    var newDate;
    if (this.dayViewSelected()) {
        newDate = new Date(this.year, this.month, this.chosenDate.getDate() + 1);
        // if hiding weekends, find next non-weekend day
        if (!this.showWeekends) {
            var wends = Date.getWeekendDays();
            for (var i = 0; i < wends.length; i++) {
                if (wends.contains(newDate.getDay())) newDate.setDate(newDate.getDate() + 1);
            }
        }
    } else if (this.weekViewSelected()) {
        newDate = new Date(this.year, this.month, this.chosenDate.getDate() + 7);
    } else if (this.monthViewSelected()) {
        newDate = new Date(this.year, this.month + 1, 1);
    } else if (this.timelineViewSelected()) {
        newDate = this.chosenDate.duplicate();
        this.timelineView.nextOrPrev(true);
        return;
    }
    this.dateChooser.setData(newDate);
    this.setChosenDate(newDate);
},

//> @method calendar.previous()
// Move to the previous day, week, month, or timeline range, depending on which tab is selected.
//
// @visibility calendar
//<
previous : function () {
    //var tab = this.mainView.selectedTab;
    if (this.dayViewSelected()) {
        var newDate = new Date(this.year, this.month, this.chosenDate.getDate() - 1);
        // if hiding weekends, find next non-weekend day
        if (!this.showWeekends) {
            var wends = Date.getWeekendDays();
            for (var i = 0; i < wends.length; i++) {
                if (wends.contains(newDate.getDay())) newDate.setDate(newDate.getDate() - 1);
            }
        }
    } else if (this.weekViewSelected()) {
        var newDate = new Date(this.year, this.month, this.chosenDate.getDate() - 7);
    } else if (this.monthViewSelected()) {
        var newDate = new Date(this.year, this.month - 1, 1);
    } else if (this.timelineViewSelected()) {
        newDate = this.chosenDate.duplicate();
        this.timelineView.nextOrPrev(false);
        return;
    }
    this.dateChooser.setData(newDate);
    this.setChosenDate(newDate);

},

dataArrived : function () {
    return true;
},

// override draw to add the calendar navigation bar floating above the mainView tabbar
draw : function (a, b, c, d) {

    this.invokeSuper(isc.Calendar, "draw", a, b, c, d);

    if (isc.ResultSet && isc.isA.ResultSet(this.data) && this.dataSource) {
        this.observe(this.data, "dataArrived", "observer.dataArrived(arguments[0], arguments[1])");
    }
    if (this.mainView.isA("TabSet")) {
        if (this.showControlsBar != false) {
            this.mainView.addChild(this.controlsBar);
            this.controlsBar.moveAbove(this.mainView.tabBar);
        }
    }
},

/*
getSnapGapPixels : function (snapGap, grid) {
    if (!snapGap) return snapGap;
    // get percentage of snapGap in relation to 30 minutes, the length in minutes of a row, and
    // multiply by row height to get pixels
    return Math.floor((snapGap / 30) * grid.getRowHeight(null, 0));
},
*/
_getTabs : function () {
    var nTabs = [];
    // viewName used by calendar internals, so don't put into defaults
    if (this.showDayView != false) {
        this.dayView = this.createAutoChild("dayView",
            { baseStyle: this.baseStyle, viewName: "day", cellHeight: this.rowHeight } );
        nTabs.add({title: this.dayViewTitle, pane: this.dayView, viewName: "day" });
    }
    if (this.showWeekView != false) {
        this.weekView = this.createAutoChild("weekView",
            {_isWeek: true, baseStyle: this.baseStyle, viewName: "week", cellHeight: this.rowHeight } );
        nTabs.add({title: this.weekViewTitle, pane: this.weekView, viewName: "week" });
    }
    if (this.showMonthView != false) {
        this.monthView = this.createAutoChild("monthView",
            {baseStyle: this.baseStyle, viewName: "month",
             bodyConstructor:"MonthScheduleBody"} );
        nTabs.add({title: this.monthViewTitle, pane: this.monthView, viewName: "month" });
    }
    if (this.showTimelineView != false) {
        this.timelineView = this.createAutoChild("timelineView",
            {baseStyle: this.baseStyle, viewName: "timeline" } );
        nTabs.add({title: this.timelineViewTitle, pane: this.timelineView, viewName: "timeline" });
    }
    return nTabs;
},

_createTabSet : function (tabsArray) {
    // if there is only one view displayed, don't use tabs
    if (tabsArray.length > 1) {
        this.mainView = this.createAutoChild("mainView", {
            tabs: tabsArray,
            tabSelected : function (tabNum, tabPane, ID, tab) {
                // store selected view name for later use, in day/week/monthViewSelected functions
                this.creator._selectedViewName = tabPane.viewName;
                this.creator.setDateLabel();
                this.creator.currentViewChanged(tabPane.viewName);
            }

        } );
        // set the default tab according to currentViewName if defined
        if (this.currentViewName) {
            var tabToSelect = tabsArray.find("viewName", this.currentViewName);
            if (tabToSelect) this.mainView.selectTab(tabToSelect);
        }
    } else {
        this.mainView = tabsArray[0].pane;
    }
},

getLaneMap : function () {
    if (!this.isTimeline()) return {};

    var data = this.timelineView.data,
        laneMap = {}
    ;
    for (var i=0; i<data.length; i++) {
        var name = data[i].name || data[i][this.laneNameField],
            title = data[i].title || name
        ;
        laneMap[name] = title;
    }
    return laneMap;
},

// create the content of the calendar
createChildren : function () {


    // main tabbed view
    var mvTabs = this._getTabs();

    this._createTabSet(mvTabs);
    var tbButtonDim = 20;
    if (this.showControlsBar != false) {
        // dateLabel
        this.dateLabel = this.createAutoChild("dateLabel" );
        // addEventButton
        this.addEventButton = this.createAutoChild("addEventButton", {
            click: function () {
                var cal = this.creator;
                var currView = cal.getCurrentViewName();

                cal.eventDialog.event = null;
                cal.eventDialog.isNewEvent = true;
                cal.eventDialog.items[0].createFields(); //false);

                var sDate = new Date(),
                    eDate = null,
                    pickedDate = cal.chosenDate.duplicate();
                // if dayView is chosen, set dialog date to chosen date
                if (currView == "day") {
                    sDate = pickedDate;
                // if weekview, set dialog to first day of chosen week unless
                // today is greater
                } else if (currView == "week") {
                    if (cal.chosenWeekStart.getTime() > sDate.getTime()) {
                        sDate = cal.chosenWeekStart.duplicate();
                    }
                    // if hiding weekends, find next non-weekend day
                    if (!this.showWeekends) {
                        var wends = Date.getWeekendDays();
                        for (var i = 0; i < wends.length; i++) {
                            if (wends.contains(sDate.getDay())) sDate.setDate(sDate.getDate() + 1);
                        }
                    }
                    sDate.setMinutes(0);
                    // move event to next day if now is end of day
                    if (sDate.getHours() > 22) {
                        sDate.setDate(sDate.getDate() + 1);
                        sDate.setHours(0);
                    } // otherwise move to next hour
                    else sDate.setHours(sDate.getHours() + 1);
                // if monthView, set dialog to first day of chosen month unless
                // today is greater
                } else if (currView == "month") {
                    pickedDate.setDate(1);
                    if (pickedDate.getTime() > sDate.getTime()) sDate = pickedDate;
                } else if (cal.isTimeline()) {
                    var tl = cal.timelineView,
                        dates = tl.getVisibleDateRange();
                    sDate = dates[0];

                    eDate = sDate.duplicate();
                    eDate = tl.addUnits(eDate, 1, cal.timelineGranularity);
                 }

                cal.eventDialog.setDate(sDate, eDate);
                // place the dialog at the left edge of the calendar, right below the button itself
                cal.eventDialog.setPageLeft(cal.getPageLeft());
                cal.eventDialog.setPageTop(this.getPageTop() + this.getVisibleHeight());

                cal.eventDialog.show();
            }
        } );

        // datePickerButton
        this.datePickerButton = this.createAutoChild("datePickerButton", {
            click: function () {
                var cal = this.creator;
                if (this._datePicker) {
                    // redraw the datePicker, positioning is already taken care of
                    this._datePicker.setData(cal.chosenDate);
                    this._datePicker.draw();
                } else {
                     this._datePicker = isc.DateChooser.create({
                        calendar: this.creator, autoDraw: false,
                        showCancelButton: true, autoClose: true,
                        disableWeekends: this.creator.disableWeekends,
                        firstDayOfWeek: this.creator.firstDayOfWeek,
                        showWeekends: this.creator.showWeekends,
                        // override dateClick to change the selected day
                        dateClick : function (year, month, day) {
                            var nDate = new Date(year, month, day);
                            this.setData(nDate);
                            // change the chosen date via the dateChooser
                            this.calendar.dateChooser.dateClick(year, month, day);
                            this.close();
                        }
                     });
                     this._datePicker.setData(cal.chosenDate);
                     cal.addChild(this._datePicker);

                     this._datePicker.placeNextTo(this, "bottom", true);
                }


            }
        } );

        this.previousButton = this.createAutoChild("previousButton", {});

        this.nextButton = this.createAutoChild("nextButton", {});
    }
    var cbMems = [];
    if (this.showPreviousButton != false) cbMems.add(this.previousButton);
    if (this.showDateLabel != false) cbMems.add(this.dateLabel);
    if (this.showDatePickerButton != false) cbMems.add(this.datePickerButton);
    if (this.canCreateEvents && this.showAddEventButton != false) cbMems.add(this.addEventButton);
    if (this.showNextButton != false) cbMems.add(this.nextButton);
    // set up calendar navigation controls
    if (this.showControlsBar != false) {
        this.controlsBar = this.createAutoChild("controlsBar", {
            members: cbMems
        });
    }
    //if (mvTabs.length == 1) this.controlsBar.layoutAlign = "center";

    var cal = this;

    // date chooser
    this.dateChooser = this.createAutoChild("dateChooser", {
            disableWeekends: this.disableWeekends,
            showWeekends: this.showWeekends,
            chosenDate: this.chosenDate,
            month: this.month,
            year: this.year,
            // override dateClick to change the selected day
            dateClick : function (year, month, day) {
                var nDate = new Date(year, month, day);
                this.setData(nDate);

                // recalculate displayed events
                this.creator.setChosenDate(nDate);
            },

            showPrevYear : function () {
                this.year--;
                this.dateClick(this.year, this.month, this.chosenDate.getDate());
            },

            showNextYear : function () {
                this.year++;
                this.dateClick(this.year, this.month, this.chosenDate.getDate());
            },

            showPrevMonth : function () {
                if (--this.month == -1) {
                    this.month = 11;
                    this.year--;
                }
                this.dateClick(this.year, this.month, 1);
            },

            showNextMonth : function () {
                if (++this.month == 12) {
                    this.month = 0;
                    this.year++;
                }
                this.dateClick(this.year, this.month, 1);
            }
    } );

    // quick event dialog
    this.eventDialog = this.createAutoChild("eventDialog", {

        items: [
            isc.DynamicForm.create({
                autoDraw: false,
                padding:4,
                calendar: this,
                saveOnEnter: true,
                useAllDataSourceFields: true,
                numCols: 2,
                colWidths: [80, "*"],
                _internalFields : [cal.nameField, cal.laneNameField],
                getCustomValues : function () {
                    if (!this.calendar.eventDialogFields) return;
                    var internalValues = this._internalFields;
                    var fields = this.calendar.eventDialogFields;
                    var cFields = {}
                    for (var i = 0; i < fields.length; i++) {
                        var fld = fields[i];
                        if (fld.name && !internalValues.contains(fld.name)) {
                            cFields[fld.name] = this.getValue(fld.name);
                        }
                    }
                    return cFields;
                },
                setCustomValues : function (values) {
                    if (!this.calendar.eventDialogFields) return;
                    var internalValues = this._internalFields;
                    var fields = this.calendar.eventDialogFields;
                    for (var i = 0; i < fields.length; i++) {
                        var fld = fields[i];
                        if (fld.name && !internalValues.contains(fld.name)) {
                            this.setValue(fld.name, values[fld.name]);
                        }
                    }

                },
                createFields : function (isEvent) {
                    var cal = this.calendar,
                        isNewEvent = cal.eventDialog.isNewEvent,
                        nameType = !isNewEvent ? "staticText" : "text",
                        laneType = !isNewEvent ? "staticText" : "select"
                    ;

                    // set up default fields
                    var fieldList = [
                        {name: cal.nameField, title: cal.eventNameFieldTitle, type: nameType,
                            width: 250
                        },
                        {name: cal.laneNameField, title: cal.eventLaneFieldTitle, type: laneType, width: 150,
                                valueMap: cal.getLaneMap(),
                                showIf: cal.isTimeline() ? "true" : "false"
                        },
                        {name: "save", title: cal.saveButtonTitle, type: "SubmitItem", endRow: false},
                        {name: "details", title: cal.detailsButtonTitle, type: "button", startRow: false,
                            click : function (form, item) {
                                var cal = form.calendar,
                                    isNew = cal.eventDialog.isNewEvent,
                                    event = cal.eventDialog.event,
                                    name = form.getValue(cal.nameField),
                                    laneName = form.getValue(cal.laneNameField)
                                ;
                                if (isNew) {
                                    event[cal.nameField] = name;
                                    if (laneName) event[cal.laneNameField] = laneName;
                                }
                                form.calendar._showEventEditor(event, isNew);
                            }
                        }
                    ];
                    if (!isNewEvent) fieldList.removeAt(2);
                    // create internal datasource
                    var dialogDS = isc.DataSource.create({
                        addGlobalId: false,
                        fields: fieldList
                    });
                    // set datasource then fields...other way around doesn't work
                    this.setDataSource(dialogDS);
                    this.setFields(isc.shallowClone(this.calendar.eventDialogFields));
                },

                submit : function () {
                    var cal = this.calendar,
                        isNewEvent = cal.eventDialog.isNewEvent,
                        evt = isNewEvent ? cal.eventDialog.event : null,
                        sdate = cal.eventDialog.currentStart,
                        edate = cal.eventDialog.currentEnd,
                        lane
                    ;

                    if (!this.validate()) return;

                    if (cal.isTimeline()) {
                        lane = this.getItem(cal.laneNameField).getValue();
                    }

                    cal._fromEventDialog = true;
                    if (!isNewEvent) { // event window clicked, so update
                        cal.updateEvent(evt, sdate, edate,
                            this.getItem(cal.nameField).getValue(), evt[cal.descriptionField],
                            this.getCustomValues(), true, lane);
                    } else { // create new event
                        cal.addEvent(sdate, edate, this.getItem(cal.nameField).getValue(),
                            "", this.getCustomValues(), true, lane);
                    }
                    cal.eventDialog.hide();
                }
            })
        ],

        setDate : function (startDate, endDate) {
            if (!endDate) {
                // handle the case where where the startDate is 11:30 pm...in this case only
                // do a 1/2 hour long event
                if (startDate.getHours() == 23 && startDate.getMinutes() == 30) {
                    endDate = new Date(startDate.getFullYear(), startDate.getMonth(),
                    startDate.getDate() + 1);
                } else {
                    endDate = new Date(startDate.getFullYear(), startDate.getMonth(),
                        startDate.getDate(), startDate.getHours() + 1, startDate.getMinutes());
                }
            }
            this.setTitle(this.creator._getEventDialogTitle(startDate, endDate));
            this.currentStart = startDate;
            this.currentEnd = endDate;
            this.items[0].getItem(this.creator.nameField).setValue("");
        },

        setLane : function (lane) {
            var cal = this.creator;
            if (isc.isA.Number(lane)) lane = cal.lanes[lane].name;
            this.items[0].getItem(cal.laneNameField).setValue(lane);
        },

        // eventDialog_setEvent
        setEvent : function (event) {
            this.event = event;

            var theForm = this.items[0],
                cal = this.creator
            ;

            // if we have custom fields, clear errors and set those custom fields
            if (cal.eventDialogFields) {
                theForm.clearErrors(true);
                theForm.setCustomValues(event);
            }
            this.setDate(event[cal.startDateField], event[cal.endDateField]);

            theForm.setValues(event);
        },

        closeClick : function () {
            this.Super('closeClick');
            // clear selections on close of dialog
            if (this.creator.dayView) this.creator.dayView.clearSelection();
            if (this.creator.weekView) this.creator.weekView.clearSelection();
        },

        show : function () {
            if (this.creator.showQuickEventDialog) {

                if (!this.isDrawn()) this.draw();
                this.Super('show');
                this.items[0].getItem(this.creator.nameField).focusInItem();
            } else {
                this.creator.showEventEditor(this.event);
            }
        },

        hide : function () {
            this.Super('hide');
            this.moveTo(0, 0);
        }

    } );

    // event editor form
    this.eventEditor = this.createAutoChild("eventEditor", {
        useAllDataSourceFields: true,
        titleWidth: 80,
        initWidget : function () {
            // invoke initWidget here rather than at the end of the function, or else we multiple
            // log warnings of form fields being clobbered
            this.invokeSuper(isc.DynamicForm, "initWidget", arguments);

            this.timeFormat = this.creator.timeFormat;
            var fieldList = [],
                cal = this.creator,
                editStyle = cal.getDateEditingStyle()
            ;

            this._internalFields.addList([cal.nameField, cal.descriptionField,
                cal.startDateField, cal.endDateField]
            );

            if (cal.isTimeline() && cal.canEditLane) {
                var laneMap = cal.getLaneMap(),
                    field = { name: cal.laneNameField, title: cal.eventLaneFieldTitle, type: "select",
                        valueMap: laneMap, endRow: true
                    }
                ;
                fieldList.add(field);
            }

            if (editStyle == "date" || editStyle == "datetime") {
                fieldList.addList([
                    { name: cal.startDateField, title: cal.eventStartDateFieldTitle, type: editStyle, endRow: true },
                    { name: cal.endDateField, title: cal.eventEndDateFieldTitle, type: editStyle, endRow: true },
                    { name: "invalidDate", type: "blurb", colSpan: 4, visible: false,
                        defaultValue: cal.invalidDateMessage,
                        cellStyle: this.errorStyle || "formCellError", endRow: true
                    }
                ]);
            } else if (editStyle == "time") {
                fieldList.addList([
                    {name: "startHours", title: cal.eventStartDateFieldTitle, type: "integer", width: 60,
                     editorType: "select", valueMap: this.getTimeValues("hours")},
                    {name: "startMinutes", showTitle: false, type: "integer", width: 60,
                     editorType: "select", valueMap: this.getTimeValues("minutes")},
                    {name: "startAMPM", showTitle: false, type: "select", width: 60,
                     valueMap: this.getTimeValues(), endRow: true},
                    {name: "invalidDate", type: "blurb", colSpan: 4, visible: false,
                     defaultValue: cal.invalidDateMessage,
                     cellStyle: this.errorStyle || "formCellError", endRow: true},
                    {name: "endHours", title: cal.eventEndDateFieldTitle, type: "integer", width: 60,
                     editorType: "select", valueMap: this.getTimeValues("hours")},
                    {name: "endMinutes", showTitle: false, type: "integer", width: 60,
                     editorType: "select", valueMap: this.getTimeValues("minutes")},
                    {name: "endAMPM", showTitle: false, type: "select", width: 60,
                     valueMap: this.getTimeValues(), endRow: true}
                ]);
                this.setColWidths([this.titleWidth, 60, 60, "*"]);
            }

            fieldList.addList([
                {name: cal.nameField, title: cal.eventNameFieldTitle, type: "text", colSpan: "*", width: "*"},
                {name: cal.descriptionField, title: cal.eventDescriptionFieldTitle, type: "textArea", colSpan: "*",
                    width: "*", height: 50}
            ]);

            // create an internal ds and bind to it so that the default fields can be
            // overridden. See forms->validation->customized binding in the feature explorer
            var editorDS = isc.DataSource.create({
                addGlobalId: false,
                fields: fieldList
            });
            // only datasource then fields seems to work
            this.setDataSource(editorDS);
            this.setFields(isc.shallowClone(this.creator.eventEditorFields));
        },
        getTimeValues : function (type, startTime) {
            if (!startTime) startTime = 0;
            var obj = {};
            if (type == "hours") {
                for (var i = startTime; i < 12; i++) {
                    obj[(i + 1) + ""] = (i + 1);
                }
            } else if (type == "minutes") {
                for (var i = 0; i < 60; i++) {
                    // stringify the minutes
                    var stringMin = i < 10 ? "0" + i : "" + i;
                    obj[i + ""] = stringMin;
                }
            } else {
                obj["am"] = "am";
                obj["pm"] = "pm";
            }

            return obj;
        },
        _internalFields : ["startHours", "startMinutes", "startAMPM", "endHours",
                "endMinutes", "endAMPM" ],
        getCustomValues : function () {
            if (!this.creator.eventEditorFields) return;
            var cal = this.creator,
                internalValues = this._internalFields;
            var fields = this.creator.eventEditorFields;
            var cFields = {}
            for (var i = 0; i < fields.length; i++) {
                var fld = fields[i];
                if (fld.name && !internalValues.contains(fld.name)) {
                    cFields[fld.name] = this.getValue(fld.name);
                }
            }
            return cFields;
        },
        setCustomValues : function (values) {
            if (!this.creator.eventEditorFields) return;
            var internalValues = this._internalFields;
            var fields = this.creator.eventEditorFields;
            for (var i = 0; i < fields.length; i++) {
                var fld = fields[i];
                if (fld.name && !internalValues.contains(fld.name)) {
                    this.setValue(fld.name, values[fld.name]);
                }
            }

        }
    } );

    // event editor layout
    this.eventEditorLayout = this.createAutoChild("eventEditorLayout", {
        items: [
            this.eventEditor,
            isc.HLayout.create({
                membersMargin: 10,
                layoutMargin: 10,
                autoDraw:false,
                members: [
                    isc.IButton.create({autoDraw: false, title: this.saveButtonTitle, calendar: this,
                        click : function () {
                            this.calendar.addEventOrUpdateEventFields();
                        }
                    }),
                    isc.IButton.create({autoDraw: false, title: this.cancelButtonTitle, calendar:this,
                        click: function () {
                            this.calendar.eventEditorLayout.hide();
                        }
                    })
                ]
            })
        ],

        // eventEditorLayout_setDate
        setDate : function (startDate, endDate, eventName, lane) {
            if (!eventName) eventName = "";
            if (!endDate) {
                endDate = new Date(startDate.getFullYear(), startDate.getMonth(),
                    startDate.getDate(), startDate.getHours() + 1, startDate.getMinutes());
            }
            var cal = this.creator;
            this.setTitle(cal._getEventDialogTitle(startDate, endDate));
            this.currentStart = startDate;
            this.currentEnd = endDate;

            // cater for dateEditingStyle
            var editStyle = cal.getDateEditingStyle(),
                form = this.items[0]
            ;
            if (editStyle == "date" || editStyle == "datetime") {
                form.setValue(cal.startDateField, startDate.duplicate());
                form.setValue(cal.endDateField, endDate.duplicate());
            } else if (editStyle == "time") {
                form.setValue("startHours", this.getHours(startDate.getHours()));
                form.setValue("endHours", this.getHours(endDate.getHours()));
                form.setValue("startMinutes", startDate.getMinutes());
                form.setValue("endMinutes", endDate.getMinutes());
                if (!cal.twentyFourHourTime) {
                    form.setValue("startAMPM", this.getAMPM(startDate.getHours()));
                    form.setValue("endAMPM", this.getAMPM(endDate.getHours()));
                }
            }
            form.setValue(cal.nameField, eventName);
            form.setValue(cal.descriptionField, "");
            form.setValue(cal.laneNameField, lane)
        },

        getHours : function (hour) {
            if (this.creator.twentyFourHourTime) return hour;
            else return this.creator._to12HrNotation(hour);
        },

        getAMPM : function (hour) {
            if (hour < 12) return "am";
            else return "pm";
        },

        // eventEditorLayout_setEvent
        setEvent : function (event) {
            var form = this.items[0],
                cal = this.creator,
                laneSwitcher = form.getItem(cal.laneNameField)
            ;

            this.event = event;
            // if we have custom fields, clear errors and set those custom fields
            if (cal.eventEditorFields) {
                form.clearErrors(true);
                form.setCustomValues(event);
            }
            if (laneSwitcher) {
                laneSwitcher.setValue(event[cal.laneNameField]);
            }
            this.setDate(event[cal.startDateField], event[cal.endDateField]);
            form.setValue(cal.nameField, event[cal.nameField]);
            form.setValue(cal.descriptionField, event[cal.descriptionField]);
            if (form.getItem(cal.laneNameField)) form.setValue(cal.laneNamefield, event[cal.laneNameField]);
            this.originalStart = isc.clone(this.currentStart);
            this.originalEnd = isc.clone(this.currentEnd);
        },

        hide : function () {
            this.Super('hide');
            // clear any selection that's been made
            if (this.creator.dayView) this.creator.dayView.clearSelection();
            if (this.creator.weekView) this.creator.weekView.clearSelection();
            // clear any errors
            this.creator.eventEditor.hideItem("invalidDate");
        },

        sizeMe : function () {
            this.setWidth(this.creator.mainView.getVisibleWidth());
            this.setHeight(this.creator.mainView.getVisibleHeight());
            this.setLeft(this.creator.mainView.getLeft());
        }
    });



    // layout for date chooser and main calendar view
    if (!this.children) this.children = [];
    var mainMembers = [];
    var subMembers = [];
    //if (this.canCreateEvents) subMembers.add(this.addEventButton);
    subMembers.add(this.dateChooser);
    if (this.showDateChooser) {
        mainMembers.add(isc.VLayout.create({
                    autoDraw:false,
                    width: "20%",
                    membersMargin: 10,
                    layoutTopMargin: 10,
                    members: subMembers
                }));
    }

    if (this.mainView.isA("TabSet")) {
        mainMembers.add(this.mainView);
    // center align controlsBar
    } else {
        if (this.showControlsBar != false) {

            var controlsBarContainer = isc.HLayout.create({
                    autoDraw: false,
                    height: this.controlsBar.getVisibleHeight(),
                    width: "100%"
            });

            controlsBarContainer.addMember(isc.LayoutSpacer.create({autoDraw:false, width:"*"}));
            controlsBarContainer.addMember(this.controlsBar);
            controlsBarContainer.addMember(isc.LayoutSpacer.create({autoDraw:false, width:"*"}));
            mainMembers.add(isc.VLayout.create({
                    autoDraw:false,
                    members: [controlsBarContainer, this.mainView]
                }));
        } else {
             mainMembers.add(this.mainView);
        }
    }

    this.children.add(
        isc.HLayout.create({
            autoDraw:false,
            width: "100%",
            height: "100%",
            members:mainMembers

        })
    );

    this.eventEditorLayout.hide();

    this.setDateLabel();
}, // end createChildren

addEventOrUpdateEventFields : function () {
    var cal = this,
        isNewEvent = cal.eventEditorLayout.isNewEvent,
        evt = cal.eventEditorLayout.event,
        form = cal.eventEditor,
        editStyle = cal.getDateEditingStyle()
    ;

    if (editStyle == "date" || editStyle == "datetime") {
        var start = form.getValue(cal.startDateField),
            end = form.getValue(cal.endDateField),
            laneName
        ;

        if (end < start) {
            form.showItem("invalidDate");
            return false;
        }

        // run validation so rules for custom fields added by the developer are enforced
        if (!form.validate()) return false;

        cal.eventEditorLayout.currentStart = start;
        cal.eventEditorLayout.currentEnd = end;

        cal.eventEditorLayout.hide();

        if (cal.isTimeline() && cal.canEditLane) {
            laneName = form.getValue(cal.laneNameField);
        }

        cal._fromEventEditor = true;
        if (!isNewEvent) {
            cal.updateEvent(evt, start, end,
                            form.getValue(cal.nameField), form.getValue(cal.descriptionField),
                            form.getCustomValues(), true, laneName
                           );
        } else {
            cal.addEvent(start, end,
                         form.getValue(cal.nameField), form.getValue(cal.descriptionField),
                         form.getCustomValues(), true, laneName);
        }

    } else if (editStyle == "time") {
        var sHrs = form.getValue("startHours"),
            eHrs = form.getValue("endHours"),
            sMins = form.getValue("startMinutes"),
            eMins = form.getValue("endMinutes"),
            sAMPM, eAMPM
        ;

        if (!cal.twentyFourHourTime) {
            sAMPM = form.getValue("startAMPM");
            eAMPM = form.getValue("endAMPM");
            sHrs = cal._to24HourNotation(sHrs, sAMPM);
            eHrs = cal._to24HourNotation(eHrs, eAMPM);
            // handle the case where end date is 12am, which is valid, as this
            // is considered the end of the current day
            if (eHrs == 0) eHrs = 24;
        }
        // check for invalid times
        if (!(sHrs < eHrs || (sHrs == eHrs && sMins < eMins))) {
            form.showItem("invalidDate");
            return false;
        }

        // run validation so rules for custom fields added by the
        // developer are enforced
        if (!form.validate()) return false;

        cal.eventEditorLayout.hide();

        var sdate = cal.eventEditorLayout.currentStart,
            edate = cal.eventEditorLayout.currentEnd;

        // Differing calendar dates:
        // For an end date of midnight we end up with the start date
        // and the end date being on different days.
        // Cases we need to handle:
        // - stored start/end date are the same day, and user has
        //   moved end time forward to midnight.
        //   * call 'setHour(24)' - will auto increment date value
        // - stored start/end date are different days (so end is midnight)
        //   and user has moved end date back to a time before midnight.
        //   * call 'setDate()' to decrease the end date to the same day,
        //     then apply the new time via setHour()
        // - stored start end date are different (end date is midnight)
        //   and user has left it selected
        //   * no need to actually setHours on end date but if we do,
        //     convert the '24' set up above to zero so we don't
        //     increment the date an additional day.
        if (edate.getDate() > sdate.getDate()) {
            if (eHrs == 24) eHrs = 0;
            else {
                edate.setDate(sdate.getDate());
            }
        }
        sdate.setHours(sHrs);
        sdate.setMinutes(sMins);
        edate.setHours(eHrs);
        edate.setMinutes(eMins);

        cal._fromEventEditor = true;

        if (!isNewEvent) { // event window clicked, so update
            var sStartDate=cal.eventEditorLayout.originalStart,
                sEndDate=cal.eventEditorLayout.originalEnd;

            cal.updateEvent(evt, sdate, edate,
                         form.getValue(cal.nameField), form.getValue(cal.descriptionField),
                         form.getCustomValues(), true);

            if (cal.eventAutoArrange) {
                cal._renderEventRange(cal.weekViewSelected(), sStartDate, sEndDate);
            }
        } else {
            cal.addEvent(sdate, edate,
                         form.getValue(cal.nameField), form.getValue(cal.descriptionField),
                         form.getCustomValues(), true);
        }
    }
    return true;
},

// sets the date label of the calendar. Called whenever the chosenDate or selected tab
// changes
setDateLabel : function () {
    if (!this.dateLabel) return;

    var content="",
        startDate = this.chosenDate,
        endDate = null,
        viewName = this.getCurrentViewName()
    ;

    if (viewName == "day") { // day tab
    } else if (viewName == "week") { // week tab
        var dateRange = this._getWeekRange();
        startDate = dateRange[0];
        endDate = dateRange[1];
    } else if (viewName == "month") { // month tab
        startDate = isc.DateUtil.getStartOf(startDate, "M");
        endDate = isc.DateUtil.getEndOf(startDate, "M");
    } else if (viewName == "timeline") {
        var ebtView = this.timelineView;
        startDate = ebtView.startDate;
        endDate = ebtView.endDate;
    }
    content = this.getDateLabelText(viewName, startDate, endDate);
    this.dateLabel.setContents(content);
},

//> @method calendar.getDateLabelText()
// Returns the text to display between the navigation buttons above the Calendar - indicates
// the visible date range.
// @param viewName (String) one of "day", "week", "month" or "timeline"
// @param startDate (Date) the start of the visible date range
// @param [endDate] (Date) the optional end of the visible date range
// @return (String) a formmatted date or date-range string appropriate to the passed view
// @visibility calendar
//<
getDateLabelText : function (viewName, startDate, endDate) {
    var result = "";
    if (viewName == "day") { // day tab
        result = "<b>" + Date.getFormattedDateRangeString(startDate) + "</b>";
    } else if (viewName == "week") { // week tab
        result = "<b>" + Date.getFormattedDateRangeString(startDate, endDate) + "</b>";
    } else if (viewName == "month") { // month tab
        result = "<b>" + startDate.getShortMonthName() + " " + startDate.getFullYear() + "</b>";
    } else if (viewName == "timeline") {
        var ebtView = this.timelineView;
        result = "<b>" + ebtView.formatDateForDisplay(startDate) + "</b> through <b>" +
                ebtView.formatDateForDisplay(endDate) + "</b>";
    }
    return result;
},

_getWeekRange : function () {
    var start = this.chosenWeekStart.duplicate();
    var end = this.chosenWeekEnd.duplicate();
    if (!this.showWeekends) {
        var wEnds = Date.getWeekendDays();
        var numDays = 7 - wEnds.length;
        // first augment start so its not sitting on a weekend
        while (wEnds.contains(start.getDay())) {
            start.setDate(start.getDate() + 1);
        }
        // number of days to add to numDays when calculating end day
        // The idea is to add weekdays length to start date to arrive at end date. If there are
        // weekends in between, however, we need to add those days to the end date as well
        var addDays = 0, cursorDate = start.duplicate();
        for (var i = 0; i < numDays; i++) {
            if (wEnds.contains(cursorDate.getDay())) addDays++;
            cursorDate.setDate(cursorDate.getDate() + 1);
        }
        end = start.duplicate();
        //isc.logWarn('here:' + [numDays, addDays]);
        end.setDate(end.getDate() + (numDays - 1) + addDays);
    }
    return [start, end];
},

dayViewSelected : function () {
    if (this.mainView && !this.mainView.isA("TabSet")) return this.mainView.viewName == "day";
    else return this._selectedViewName == "day";
},

weekViewSelected : function () {
    if (this.mainView && !this.mainView.isA("TabSet")) return this.mainView.viewName == "week";
    else return this._selectedViewName == "week";
},

monthViewSelected : function () {
    if (this.mainView && !this.mainView.isA("TabSet")) return this.mainView.viewName == "month";
    else return this._selectedViewName == "month";
},

timelineViewSelected : function () {
    if (this.mainView && !this.mainView.isA("TabSet")) return this.mainView.viewName == "timeline";
    else return this._selectedViewName == "timeline";
},

//> @method calendar.showEventDialog()
// Open the Quick Event dialog showing minimal information about an existing
// +link{CalendarEvent, event}.
// <P>
// The +link{calendar.startDateField, startDate} field on the event is used to calculate the
// display location for the dialog.
// <P>
// If this method is called when the Event Dialog is already showing another event, and if
// changes have been made, a confirmation dialog is displayed and editing of the new event
// is cancelled unless confirmed.
//
// @param event (CalendarEvent) the event to show in the Editor
// @visibility calendar
//<
showEventDialog : function (event) {
    if (!event) {
        this.logWarn("showEventDialog called with no event - returning.");
        return;
    }
    this._showEventDialog(event, false);
},

//> @method calendar.showNewEventDialog()
// Open the Quick Event dialog to begin editing a new +link{CalendarEvent, event}.
// <P>
// If passed, the event parameter is used as defaults for the new event - in addition, the
// event's +link{calendar.startDateField, startDate}, and its
// +link{calendar.laneNameField, lane}, for timeline events, are used to calculate the
// display location for the dialog.
// <P>
// If this method is called when the Event Dialog is already showing another event, and if
// changes have been made, a confirmation dialog is displayed and editing of the new event
// is cancelled unless confirmed.
//
// @param [event] (CalendarEvent) defaults for the new event
// @visibility calendar
//<
showNewEventDialog : function (event) {
    event = event || {};
    this._showEventDialog(event, true);
},

// Displays the event entry/edit dialog at row/col position calculated from the start/endDates
// set on the passed event object
_showEventDialog : function (event, isNewEvent) {

    //TODO: if there's an existing dialog with changes, intercept it with a confirmation dialog

    //if (

    var startDate = event[this.startDateField] || new Date();
    var endDate = event[this.endDateField];

    var currentView = this.getSelectedView(),
        eventWindow = currentView == this.monthView ? null :
            this._findEventWindow(event, currentView == this.weekView),
        rowNum, colNum
    ;

    // no event window means that an empty slot was clicked, so show dialog for creating a
    // new event
    if (!eventWindow) {
        if (this.eventEditorLayout) {
            this.eventEditorLayout.event = event;
            this.eventEditorLayout.isNewEvent = isNewEvent;
        }

        // clear out the stored eventWindow and store the passed event - determine whether
        // it's new via eventDialog.isNewEvent
        this.eventDialog.eventWindow = null;
        this.eventDialog.event = event;
        this.eventDialog.isNewEvent = isNewEvent;
        this.eventDialog.items[0].createFields();

        var sDate = startDate,
            eDate = endDate;

        event[this.startDateField] = sDate;

        if (this.monthViewSelected()) { // get date for clicked month day cell
            var sHrs = new Date();
            sHrs = sHrs.getHours();
            // take an hour off so the event stays within the day
            if (sHrs > 22) sHrs -= 1;
            sDate.setHours(sHrs);
            event[this.startDateField] = sDate;
        }
        if (this.isTimeline()) {
            var tl = this.timelineView;

            rowNum = tl.getEventLaneIndex(event);
            colNum = tl.getEventColumn(tl.getDateLeftOffset(sDate));
            // assume a default length of one unit of the timelineGranularity for new events
            eDate = endDate || this.getDateFromPoint(tl.getDateLeftOffset(sDate) + tl.getColumnWidth(colNum));
            // set the lane
            this.eventDialog.setLane(rowNum);
        } else {
            var view = this.getSelectedView();
            if (view == this.monthView) {
                rowNum = view.getEventRow();
                colNum = view.getEventColumn();
                // assume a default length of one hour (two rows) for new Calendar events
                eDate = endDate || this.getCellDate(rowNum, colNum);
            } else {
                rowNum = startDate.getHours() * 2;
                colNum = view.getEventColumn(this.getEventLeft(event));
                // assume a default length of one hour (two rows) for new Calendar events
                eDate = endDate || this.getCellDate(rowNum + 2, colNum);
            }
        }

        event[this.endDateField] = eDate;

        this.eventDialog.setEvent(event);

    } else { // otherwise show dialog for clicked event
        if (this.isTimeline()) {
            var tl = this.timelineView;
            rowNum = tl.getEventLaneIndex(event);
            colNum = tl.getEventColumn(tl.getDateLeftOffset(startDate));
        } else if (this.dayViewSelected() || this.weekViewSelected()) {
            var view = this.getSelectedView();
            rowNum = startDate.getHours() * 2;
            colNum = view.getEventColumn(this.getEventLeft(event) + 1);
        }
        this.eventDialog.eventWindow = eventWindow;
        this.eventDialog.isNewEvent = false;
        this.eventDialog.items[0].createFields();
        this.eventDialog.setEvent(eventWindow.event);
    }

    // ensure the dialog is drawn before placing it

    this.eventDialog.moveTo(0, -10000);
    this.eventDialog.show();

    var coords = this.getSelectedView().getCellPageRect(rowNum, colNum);
    this.eventDialog.placeNear(coords[0], coords[1]);
    // bringToFront() needs to be put on a timer, else it fails to actually bring the
    // eventDialog to the front
    isc.Timer.setTimeout(this.ID + ".eventDialog.bringToFront()");
},

//> @method calendar.showEventEditor()
// Show an Event Editor for the passed event.  Event Editor's fill the Calendar and allow
// for editing of the built-in Event fields, like +link{nameField, name} and
// +link{descriptionField, description}, as well as any
// custom fields supplied via +link{calendar.eventDialogFields}.
// <P>
// If no event is passed, a new Event with no default values is created via
// +link{showNewEventEditor}.
//
// @param [event] (CalendarEvent) an existing event to show in the Editor
// @visibility calendar
//<
showEventEditor : function (event) {
    if (event) this._showEventEditor(event);
    else this.showNewEventEditor(null);
},

//> @method calendar.showNewEventEditor()
// Show an Event Editor for a new event.  If an +link{CalendarEvent, event} is passed as the
// parameter, it is used as defaults for the new event.
//
// @param [event] (CalendarEvent) defaults for the new event to show in the Editor
// @visibility calendar
//<
showNewEventEditor : function (event) {
    this._showEventEditor(event, true);
},

newEventEditorWindowTitle: "New Event",
_showEventEditor : function (event, isNewEvent) {

    if (!this.eventEditorLayout.isDrawn()) this.eventEditorLayout.draw();
    this.eventEditorLayout.setWidth(this.mainView.getVisibleWidth());
    this.eventEditorLayout.setHeight(this.mainView.getVisibleHeight());
    // move the eventEditor to cover the mainView only

    this.eventEditorLayout.setPageLeft(this.mainView.getPageLeft());
    this.eventEditorLayout.setPageTop(this.getPageTop());

    this.eventEditorLayout.isNewEvent = isNewEvent;

    //if (this.eventEditorFields) this.eventEditor.reset();
    if (event) {
        this.eventEditorLayout.setEvent(event);
    } else {
        this.eventEditor.clearValues();
        this.eventEditorLayout.setTitle(this.newEventEditorWindowTitle);
        if (this.eventDialog && this.eventDialog.isVisible()) {
            // pass any custom field values through to the event editor
            if (this.eventEditorFields) {
                this.eventEditorLayout.items[0].setCustomValues(this.eventDialog.items[0].getCustomValues());
            }
            var eventName = this.eventDialog.items[0].getValue(this.nameField);
            var laneItem = this.eventDialog.items[0].getItem(this.laneNameField);
            var lane = laneItem ? laneItem.getValue() : null;

            var startDate = new Date();

            this.eventEditorLayout.setDate(
                startDate,
                this.eventDialog.currentEnd,
                eventName, lane
            );
        }
    }

    this.eventDialog.hide();

    this.eventEditorLayout.show();
},

_getEventDialogTitle : function (startDate, endDate) {
    var days = Date.getShortDayNames(),
        months = Date.getShortMonthNames(),
        sTime = isc.Time.toTime(startDate, this.timeFormatter, true),
        eTime = isc.Time.toTime(endDate, this.timeFormatter, true),
        result
    ;
    if (this.isTimeline()) {
        var differentDays = startDate.getDay() != endDate.getDay();

        if (differentDays) { // Saturday, Feb 28, 10:00 - Sunday, March 1, 10:00
            result = days[startDate.getDay()] + ", " + months[startDate.getMonth()] + " " +
                        startDate.getDate() + ", " + sTime + " - " +
                     days[endDate.getDay()] + ", " + months[endDate.getMonth()] + " " +
                        endDate.getDate() + ", " + eTime
            ;
            return result;
        }
    }

    var timeStr = sTime + " - " + eTime;

    return days[startDate.getDay()] + ", " + months[startDate.getMonth()]
        + " " + startDate.getDate() + ", " + timeStr ;
},

_to12HrNotation : function (hour) {
    if (hour == 0) return 12;
    else if (hour < 13) return hour;
    else return hour - 12;
},

_to24HourNotation : function (hour, ampmString) {
    // make sure we're dealing with an int
    hour = parseInt(hour);
    if (ampmString.toLowerCase() == "am" && hour == 12) {
        return 0;
    } else if (ampmString.toLowerCase() == "pm" && hour < 12) {
        return hour + 12;
    } else {
        return hour;
    }
},

_getCellCSSText : function (grid, record, rowNum, colNum) {
    var cal = this,
        currDate = cal.getCellDate(rowNum, colNum),
        result = cal.getDateCSSText(currDate, rowNum, colNum, grid)
    ;

    // an override of getDateCSSText() returned something - return that
    if (result) return result;

    // if the date is the same as the calendar's chosenDate and todayBackgroundColor is set,
    // return CSS for that
    var dateComp = isc.Date.compareLogicalDates(currDate, new Date());
    if ((dateComp !== false && dateComp == 0) && cal.todayBackgroundColor) {
        return "background-color:" + cal.todayBackgroundColor + ";";
    }

    return null;
},

//> @method calendar.getDateCSSText()
// Return CSS text for styling the cell associated with the passed date and/or rowNum & colNum,
// which will be applied in addition to the CSS class for the cell, as overrides.
// <p>
// "CSS text" means semicolon-separated style settings, suitable for inclusion in a CSS
// stylesheet or in a STYLE attribute of an HTML element.
//
// @see getDateStyle()
//
// @param date (Date) the date to return CSS text for
// @param rowNum (Integer) the row number to get the CSS for
// @param colNum (Integer) the column number to get the date for
// @param viewer (ListGrid) the ListGrid used by the current Calendar view
// @return (String) CSS text for the associated cell
//
// @visibility calendar
//<
getDateCSSText : function (date, rowNum, colNum, viewer) {
    return null;
},

//> @method calendar.getDateStyle()
// Return the CSS stylename for the cell associated with the passed date and/or rowNum & colNum.
//
// @see getDateCSSText()
//
// @param date (Date) the date to return CSS text for
// @param rowNum (Integer) the row number to get the CSS for
// @param colNum (Integer) the column number to get the date for
// @param viewer (ListGrid) the ListGrid used by the current Calendar view
// @return (CSSStyleName) CSS style for the cell associated with the passed date
//
// @visibility calendar
//<
getDateStyle : function (date, rowNum, colNum, viewer) {
    return null;
},

//> @method calendar.getCellDate()
// Return the Date instance associated with the passed co-ordinates in the current view.  If
// the cell at the passed co-ordinates is not a date-cell, returns null.
// <P>
// To determine the date at a more specific point within a cell, see +link{getDateFromPoint}.
//
// @param rowNum (Integer) the row number to get the date for
// @param colNum (Integer) the column number to get the date for
// @return (Date) the date, if any, associated with the passed co-ords in the current view
//
// @visibility calendar
//<
getCellDate : function (rowNum, colNum) {
    var retDate;
    if (this.dayViewSelected()) {
        retDate = this.chosenDate.duplicate();
    } else if (this.weekViewSelected()) {
        var fld = this.weekView.getField(colNum);
        if (!fld._yearNum) return;
        // for weekview, date props are stored on the field objects
        retDate = new Date(fld._yearNum, fld._monthNum, fld._dateNum);
    } else if (this.monthViewSelected()) {
        if (colNum >= this.monthView.getFields().length)
            colNum = this.monthView.getFields().length-1;
        var rec = this.monthView.data.get(rowNum);
        // get the index into the record from the field at colNum.
        var dIndex = this.monthView.getField(colNum)._dayIndex;
        if (rec && rec["date" + dIndex] != null) {
            retDate = rec["date" + dIndex].duplicate();
            // return midnight of the given day
            retDate.setHours(0); retDate.setMinutes(0); retDate.setSeconds(0);
        }
        return retDate;
    } else if (this.timelineViewSelected()) {
        var grid = this.timelineView,
            body = grid.getFieldBody(colNum),
            fieldIndex = grid.getLocalFieldNum(colNum),
            field = body.getField(fieldIndex)
        ;
        if (!field || !field.date) return null;
        return field.date;
    } else {
        return;
    }
    // consolidate logic for dealing with minutes here
    if (this.dayViewSelected() || this.weekViewSelected()) {
        var hour, baseRowNum = rowNum, mins = 0;
        // each row represents 1/2 hour
        if (rowNum % 2 == 1) {
            baseRowNum = rowNum - 1;
            mins = 30;
        }

        retDate.setHours(baseRowNum / 2, mins);
    }
    return retDate;
},

//> @method calendar.getDateFromPoint()
// Returns a Date instance representing the point at the passed offsets into the body of the
// current view.
// <P>
// If snapDates is passed as false, returns the date representing the
// exact position of the passed offsets.  If unset or passed as true, returns the date at the
// nearest eventSnapGap to the left, for +link{Timeline}s, or above for +link{dayView, day}
// and +link{weekView, week} views.
// <P>
// If neither x nor y offsets are passed, assumes them from the last mouse event.
// <P>
// If the cell at the eventual offsets is not a date-cell, returns null.
// <P>
// Note that, for the +link{monthView, month view}, this method is functionally equivalent to
// +link{getCellDate}, which determines the date associated with a cell, without the additional
// offset precision offered here.
//
// @param [x] (Integer) the x offset into the body of the selected view - non-functional for
//                      the +link{dayView, day view}.  If this param and "y" are both unset,
//                      assumes both offsets from the last mouse event.
// @param [y] (Integer) the y offset into the body of the selected view - non-functional for the
//                            +link{timelineView, timeline view}.  If this param and "x" are
//                            both unset, assumes both offsets from the last mouse event.
// @param [snapOffsets] (Boolean) whether to snap the offsets to the nearest eventSnapGap - if
//                                 unset, the default is true
// @return (Date) the date, if any, associated with the passed co-ords in the current view
//
// @visibility calendar
//<
getDateFromPoint : function (x, y, snapOffsets) {

    var view = this.getSelectedView();

    if (x == null && y == null) {
        // no offsets passed, return the date at the last mouse event position
        x = view.body.getOffsetX();
        y = view.body.getOffsetY();
    }

    // snapOffsets unset, assume true
    if (snapOffsets == null) snapOffsets = true;

    var colNum = view.getEventColumn(x),
        rowNum = view.getEventRow(y),
        retDate
    ;

    if (this.dayViewSelected() || this.weekViewSelected()) {
        retDate = this.getCellDate(rowNum, colNum);

        // for cases where the event is dropped between row bounds, get the minutes we need
        // to add to the drop start time. The formula for these minutes:
        // drop position pixels from drop row top * minutes per pixel
        var rowHeight = view.getRowSize(1);
        var leftOverMins = Math.floor((y - (rowHeight * rowNum)) * (30 / rowHeight));

        var newMinutes = retDate.getMinutes() + leftOverMins;
        if (snapOffsets) {
            newMinutes = newMinutes - (newMinutes % this.eventSnapGap);

            retDate.setMinutes(newMinutes);
        } else {
            var hour, baseRowNum = rowNum, mins = 0;
            // each row represents 1/2 hour
            if (rowNum % 2 == 1) {
                baseRowNum = rowNum - 1;
                mins = 30;
            }

            retDate.setHours(baseRowNum / 2, mins != 0 ? mins : null);
        }
    } else if (this.monthViewSelected()) {
        retDate = this.getCellDate(rowNum, colNum);
    } else if (this.timelineViewSelected()) {
        retDate = view.getDateFromPoint(x, null, snapOffsets);
    } else {
        return;
    }

    return retDate;
},

// rowHeight == 30 minutes. return the number of pixels that the parameter minutes will occupy
_getMinutePixels : function (minutes, rowHeight, viewName) {
    if (viewName == "timeline") {
        // for now, this will only be called when timeline granularity is set to 'hour'
        // rowHeight is actually rowWidth in this case.
        var rowWidth = rowHeight;
        // divide rowWidth by 60 to get the width of each minute
        return Math.round(rowWidth / 60) * minutes;
    } else {
        return Math.round((rowHeight / 30) * minutes);
    }
},

monthViewEventClick : function (rowNum, colNum, eventIndex) {
    var events = this.monthView.getEvents(rowNum, colNum);
    var evt = events[eventIndex];
    if (this.eventClick(evt, "month")) this.showEventEditor(evt);
},

//> @method calendar.currentViewChanged()
// Notification that fires whenever the current view changes via the
// +link{mainView, mainView tabset}.
//
// @param viewName (String) the name of the current view after the change
// @return (HTML) HTML to display
//
// @visibility calendar
//<
currentViewChanged : function (viewName) {
},

//> @method calendar.getDayBodyHTML()
// Return the HTML to be shown in the body of a day in the month view.
// <P>
// Default is to render a series of links that call +link{eventClick} to provide details
// and/or an editing interface for the events.
// <P>
// <code>getDayBodyHTML()</code> is not called for days outside of the current month if
// +link{showOtherDays} is false.
//
// @param date (Date) JavaScript Date object representing this day
// @param events (Array of CalendarEvent) events that fall on this day
// @param calendar (Calendar) the calendar itself
// @param rowNum (Integer) the row number to which the parameter date belongs
// @param colNum (Integer) the column number to which the parameter date belongs
// @return (HTML) HTML to display
//
// @group monthViewFormatting
// @visibility calendar
//<
getDayBodyHTML : function (date, events, calendar, rowNum, colNum) {

    var day = date.getDay();

    var evtArr = events, lineHeight = 15,
        record = this.monthView.data ? this.monthView.data[1] : null,
        rHeight = this.monthView.getRowHeight(record, 1);
    var retVal = "";
    for (var i = 0; i < evtArr.length; i++) {
        var eTime = isc.Time.toTime(evtArr[i][this.startDateField], this.timeFormatter, true) + " ";
        if (this.canEditEvent(evtArr[i])) {
            // when clicked, call the the editEvent method of this calendar, passing the
            // row, column, and position of the event in this cell's event array
            var template  = "<a href='javascript:" + this.ID + ".monthViewEventClick(" +
                rowNum + "," + colNum + "," + i + ");' class='"
                + this.calMonthEventLinkStyle + "'>";

            retVal += template + eTime + evtArr[i][this.nameField] + "</a><br/>";
        } else {
            retVal += eTime + evtArr[i][this.nameField] + "<br/>";
        }
        if ((i + 3) * lineHeight > rHeight) break;
    }
    if (i < evtArr.length - 1) {
        retVal += "+ " + (evtArr.length - 1 - i) + " more...";
    }
    return retVal;
},

//> @method calendar.getMonthViewHoverHTML()
// This method returns the hover HTML to be displayed when the user hovers over a cell
// displayed in the calendar month view tab.
// <P>
// Default implementation will display a list of the events occurring on the date the user is
// hovering over. Override for custom behavior. Note that returning null will suppress the
// hover altogether.
//
// @param date (Date) Date the user is hovering over
// @param events (Array of CalendarEvent) array of events occurring on the current date. May be empty.
// @return (HTML) HTML string to display
//
// @visibility calendar
//<
getMonthViewHoverHTML : function(currDate, evtArr) {
    if(evtArr!=null) {
        var retVal = "";
        for (var i = 0; i < evtArr.length; i++) {
            var target = this.creator || this;
            var eTime = isc.Time.toTime(evtArr[i][target.startDateField], target.timeFormatter, true);
            retVal += eTime + " " + evtArr[i][target.nameField] + "<br/>";
        }
        return retVal;
    }
},

// @method calendar.getDayHeaderHTML()
// Return the HTML to be shown in the header of a day in the month view.
// <P>
// Default is to render just the day of the month, as a number.
//
// @param date (Date) JavaScript Date object representing this day
// @param events (Array of CalendarEvent) events that fall on this day
// @param calendar (Calendar) the calendar itself
// @return (HTML) HTML to show in the header of a day in the month view
//
// @group monthViewFormatting
// @visibility calendar
//<
getDayHeaderHTML : function (date, events, calendar, rowNum, colNum) {
    //isc.logWarn('here:' + [date.getDate(), rowNum, colNum]);
    return date.getDate();
},

//> @method calendar.dayBodyClick()
// Called when the body area of a day in the month view is clicked on, outside of any links
// to a particular event.
// <P>
// By default, if the user can add events, shows a dialog for adding a new event for that
// day.  Return false to cancel this action.
// <P>
// Not called if the day falls outside the current month and +link{showOtherDays} is false.
//
// @param date (Date) JavaScript Date object representing this day
// @param events (Array of CalendarEvent) events that fall on this day
// @param calendar (Calendar) the calendar itself
// @param rowNum (Integer) the row number to which the parameter date belongs
// @param colNum (Integer) the column number to which the parameter date belongs
// @return (boolean) false to cancel the default action
//
// @group monthViewEvents
// @visibility calendar
//<
dayBodyClick : function (date, events, calendar, rowNum, colNum) {
   return true;
},

//> @method calendar.dayHeaderClick()
// Called when the header area of a day in the month view is clicked on.
// <P>
// By default, moves to the day tab and shows the clicked days events.
// Return false to cancel this action.
// <P>
// Not called if the day falls outside the current month and +link{showOtherDays} is false.
//
// @param date (Date) JavaScript Date object representing this day
// @param events (Array of CalendarEvent) events that fall on this day
// @param calendar (Calendar) the calendar itself
// @param rowNum (int) the row number to which the parameter date belongs
// @param colNum (int) the column number to which the parameter date belongs
// @return (boolean) return false to cancel the action
//
// @group monthViewEvents
// @visibility calendar
//<
dayHeaderClick : function (date, events, calendar, rowNum, colNum) {
    return true;
},

//> @method calendar.eventChanged()
// Notification fired whenever a user changes an event, whether by dragging the event or by
// editing it in a dialog.
// <P>
// In a calendar with a DataSource, eventChanged() fires <b>after</b> the updated event has
// been successfully saved to the server
//
// @param event (CalendarEvent) the event that changed
// @group monthViewEvents
// @visibility calendar
//<

//> @method calendar.eventRemoved()
// Notification fired whenever a user removes an event
// <P>
// In a calendar with a DataSource, eventRemoved() fires <b>after</b> the event has
// been successfully removed from the server
//
// @param event (CalendarEvent) the event that was removed
// @group monthViewEvents
// @visibility calendar
//<

//> @method calendar.eventAdded()
// Notification fired whenever a user adds an event.
// <P>
// In a calendar with a DataSource, eventAdded() fires <b>after</b> the event has
// been successfully added to the server
//
// @param event (CalendarEvent) the event that was added
// @group monthViewEvents
// @visibility calendar
//<

//> @method calendar.eventClick()
// Called whenever an event is clicked on in the day, week or month views.
// <P>
// By default a dialog appears showing details for the event, and offering the ability to
// edit events which are editable.  Return false to cancel the default action. This is a good
// place to, for example, show a completely customized event dialog instead of the default one.
//
// @param event (CalendarEvent) event that was clicked on
// @param viewName (String) view where the event was clicked on: "day", "week", "month", "timeline"
// @return (boolean) false to cancel the default action
//
// @group monthViewEvents
// @visibility calendar
//<
eventClick : function (event, viewName) {
    return true;
},

//> @method calendar.eventRemoveClick()
// Called whenever the close icon of an event is clicked within the day or week view. Return
// false to cancel the removal, or true to allow it.
// <P>
// Implement this method to do something like, for example, showing a confirmation dialog
// before an event is removed.
//
// @param event (CalendarEvent) event that was clicked on
// @param viewName (String) view where the event was clicked on: "day", "week" or "month"
// @return (boolean) false to cancel the removal
//
// @group monthViewEvents
// @visibility calendar
//<
eventRemoveClick : function (event, viewName) {
    return true;
},

//> @method calendar.eventMoved()
// Called when an event is moved via dragging by a user.  Return false to disallow the move.
// @param newDate (Date) new date and time that event is being moved to
// @param event (CalendarEvent)
// @return (boolean) return false to disallow the move.
//
// @group monthViewEvents
// @visibility calendar
//<
eventMoved : function (event, newDate) {
    return true;
},

//> @method calendar.eventResized()
// Called when an event is resized via dragging by a user.  Return false to disallow the
// resize.
// @param newDate (Date) new end date and time that event is being resized to
// @param event (CalendarEvent)
// @return (boolean) return false to disallow the resize
//
// @group monthViewEvents
// @visibility calendar
//<
eventResized : function () {
    return true;
},

//> @method calendar.timelineEventMoved()
// Called when a Timeline event is moved via dragging by a user.  Return false to disallow the
// move.
// @param event (CalendarEvent) the event that was moved
// @param startDate (Date) new start date of the passed event
// @param endDate (Date) new end date of the passed event
// @param lane (Lane) the Lane in which this event has been dropped
// @return (boolean) return false to disallow the move.
//
// @visibility calendar
//<
timelineEventMoved : function (event, startDate, endDate, lane) {
    return true;
},

//> @method calendar.timelineEventResized()
// Called when a Timeline event is resized via dragging by a user.  Return false to disallow
// the resize.
// @param event (CalendarEvent) the event that was resized
// @param startDate (Date) new start date of the passed event
// @param endDate (Date) new end date of the passed event
// @return (boolean) return false to disallow the resize
//
// @visibility calendar
//<
timelineEventResized : function (event, startDate, endDate) {
    return true;
},

// helper method, gets a valid date with respect to the eventSnapGap and starting point of
// referenceDate. Used in eventWindow dragRepositionStop and dragResizeStop to ensure a valid
// date every time.
getValidSnapDate : function (referenceDate, snapDate) {
    if (this.isTimeline()) {

    } else {
        // the formula for getting the snapDate is:
        // round((snapDate as minutes - offset) / snapGap) * snapGap + offset
        // where offset = reference date as minutes mod snapGap
        var snapGap = this.eventSnapGap;

        var offset = ((referenceDate.getHours() * 60) + referenceDate.getMinutes()) % snapGap;

        var dateMinutes = (snapDate.getHours() * 60) + snapDate.getMinutes();
        var gapsInDate = Math.round((dateMinutes - offset) / snapGap);

        var totMins = (gapsInDate * snapGap) + offset;

        var hrs = Math.floor(totMins / 60), mins = totMins % 60;
        snapDate.setHours(hrs);
        snapDate.setMinutes(mins);
    }

    return snapDate;
},

//> @method calendar.selectTab()
// Fires whenever the user changes the current date, including picking a specific date or
// navigating to a new week or month.
//
// @param tabnum (number) the index of the tab to select
// @visibility calendar
//<
selectTab : function (tabnum) {
    if (this.mainView && this.mainView.isA("TabSet") && this.mainView.tabs.getLength() > tabnum) {
        this.mainView.selectTab(tabnum);
        this.refreshSelectedView();
        return true;
    } else {
        return false;
    }
},

// override parentResized to resize the eventEditorLayout as well
parentResized : function () {
    //isc.logWarn('calendar parentResized');
     this.Super('parentResized', arguments);
     // only resize the eventEditorLayout if its shown
     if (this.eventEditorLayout.isVisible()) this.eventEditorLayout.sizeMe();
},

//> @method calendar.dateChanged()
// Fires whenever the user changes the current date, including picking a specific date or
// navigating to a new week or month.
// @visibility external
//<
dateChanged : function () {
    return true;
},

//> @method calendar.getActiveDay()
// Gets the day of the week (0-6) that the mouse is currently over.
//
// @return (integer) the day that the mouse is currently over
// @see calendar.getActiveTime()
// @visibility external
//<
getActiveDay : function () {
    var activeTime = this.getActiveTime();
    if (activeTime) return activeTime.getDay();
},

//> @method calendar.getActiveTime()
// Gets a date object representing the date over which the mouse is hovering for the current
// selected view. For month view, the time will be set to midnight of the active day. For dayview
// and week view, the time will be the rounded to the closest half hour relative to the mouse
// position.
// @return (Date) the date that the mouse is over
// @visibility external
//<
getActiveTime : function () {
    var EH = this.ns.EH,
    currView = this.getSelectedView();
    var colNum = currView.getEventColumn();
    var rowNum = currView.getEventRow();
    return this.getCellDate(rowNum, colNum);
},

//> @method calendar.setTimelineRange()
// Sets the range over which the timeline will display events.
// <P>
// If the <code>end</code> parameter is not passed, the end date of the range will default to
// +link{Calendar.defaultTimelineColumnSpan, 20} columns of the current
// +link{Calendar.timelineGranularity, granularity} following the start date.
//
// @param start (Date) start of range
// @param [end] (date) end of range
// @visibility external
//<
setTimelineRange : function (start, end, gran, units, callback) {
    if (this.timelineView) this.timelineView.setTimelineRange(start, end, gran, units);
    if (callback) this.fireCallback(callback);
},

// get event length in minutes
getEventLength : function (startDate, endDate) {
    var minDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    return minDiff;
},

gridProps : {
getPrintHTML : function (printProperties, callback) {
    printProperties = isc.addProperties({}, printProperties);

    this.body.printChildrenAbsolutelyPositioned = true;

    var cal = this.creator,
        view = cal.getCurrentViewName(),
        isTimeline = cal.isTimeline(),
        isWeek = this._isWeek,
        isDay = view == "day",
        isMonth = view == "month"
    ;

    if (isMonth) return;

    var fields = this.getFields(),
        data = this.getData(),
        output = isc.StringBuffer.create(),
        totalWidth = 0,
        fieldWidths = null,
        _this = this
    ;

    if (isTimeline) {
        fieldWidths = fields.map(function (item) {
            return _this.getFieldWidth(item);
        });
        //isc.logWarn("field.width returns: " + fields.getProperty("width") + "\n" +
        //    getFieldWidth() returns: " + fieldWidths);

        //totalWidth = fieldWidths.sum();
        if (this.frozenFields) totalWidth += this.frozenBody._fieldWidths.sum();
    } else {
        totalWidth = this.body._fieldWidths.sum();
        if (this.frozenBody) totalWidth += this.frozenBody._fieldWidths.sum();
    }

    //totalWidth -= ((this.getFields().length-1) * 4);

    var rowStart = "<TR",
        rowEnd = "</TR>",
        gt = ">",
        heightAttr = " HEIGHT=",
        valignAttr = " VALIGN="
    ;


    var bodyVOffset = 40;

    output.append("<TABLE WIDTH=", totalWidth, " style='position: absolute; top:", bodyVOffset, ";'>");

    if (this.showHeader) {
        // don't generate column-headers for dayView
        output.append(this.getPrintHeaders(0, this.fields.length));
    }

    // absolutely position the body and events after the header
    bodyVOffset += this.getHeaderHeight();

    output.append("<TABLE role='presentation' border='' class:'", this.baseStyle, "' ",
        "style='borderSpacing:0; position: absolute; top:", bodyVOffset,
        "; z-index: -1' cellpadding='0' cellspacing='0'>"
    );

    for (var i=0; i<data.length; i++) {
        output.append(rowStart, heightAttr, this.getRowHeight(i), gt);
        for (var j=0; j<fields.length; j++) {
            var value = this.getCellValue(data[i], i, j);
            output.append("<TD padding=0 class='", this.getCellStyle(data[i], i, j), "' ",
                "width='", this.getFieldWidth(j) + (j == 0 ? 2 : 4), "px' ",
                "style='margin: 0px; padding: 0px; ",
                "border-width: 0px 1px 1px 0px; ",
                "border-bottom: 1px solid #ABABAB; border-right: 1px solid #ABABAB; ",
                "border-top: none; border-left: none;'>"
            );
            output.append(this.getCellValue(data[i], i, j) || "&nbsp;");
            output.append("</TD>");
        }
        output.append(rowEnd);
    }

    var events = [];
    if (cal.isTimeline()) {
        events = this.getVisibleEvents();
        for (var i=0; i<events.length; i++) {
            var event = events.get(i),
                winId = cal.getEventWindowID(event),
                eWin = window[winId],
                props = isc.addProperties({}, printProperties, {i: i})
            ;
            if (eWin) {
                output.append(eWin.getPrintHTML(printProperties, callback));
            }
        }
    } else {
        events = this.body.children;
        for (var i=0; i<events.length; i++) {
            if (!isc.isAn.EventWindow(events[i])) continue;
            output.append(events[i].getPrintHTML(printProperties, callback));
        }
    }

    output.append("</TR>");
    output.append("</TABLE>");
    output.append("</TABLE>");

    var result = output.toString();

    return result;
},

getPrintHeaders : function (startCol, endCol) {

    var defaultAlign = (this.isRTL() ? isc.Canvas.LEFT : isc.Canvas.RIGHT),
        printHeaderStyle = this.printHeaderStyle || this.headerBaseStyle,
        HTML;


    // We support arbitrarily nested, asymmetrical header-spans - these require
    // some slightly tricky logic so use a conditional to avoid this if not required.
    if (this.headerSpans) {

        // Step 1: We'll build an array of "logical columns" in this format:
        // [field1], [innerHeader1], [topHeader]
        // [field2], [innerHeader2], [topHeader]
        // [field3], [topHeader2]
        // Each array contains an entry for each row we'll write out (each header
        // span the field is embedded in, plus the field).
        // Note that the top row of HTML will be the last entry in each sub-array and
        // the bottom row will be the first entry (the field should appear below
        // all its headers).
        // Also note we have repeats in here - we'll handle this by applying colSpans
        // to the generated HTML - and that the column arrays will be different lengths
        // due to different depth of nesting of header spans - we'll handle this by
        // applying rowSpans.
        var logicalColumns = [],
            numRows = 1;

        for (var i = startCol; i < endCol; i++) {
            var field = this.getField(i);
            logicalColumns[i] = [field];

            var span = this.spanMap[field.name];

            // build a logical column from the fieldName up to the top span
            // (Note that we will have the same span in multiple cols, which is ok)
            while (span != null) {
                logicalColumns[i].add(span);
                span = span.parentSpan;
            }
            // Remember how deep the deepest nested column is - this is required to
            // allow us to apply numRows.
            numRows = Math.max(logicalColumns[i].length, numRows);
        }

        // Step 2: Iterate through the column arrays starting at the last entry
        // (outermost header)
        HTML = [];

        for (var i = numRows-1; i >= 0; i--) {
            HTML[HTML.length] = "<TR>";

            var lastEntry = null,
                colSpanSlot = null;
            for (var ii = startCol; ii < endCol; ii++) {
                var rowSpan = 1, colSpan = 1;
                // When we reach the first entry in the array we'll be looking at a field
                var isField = (i == 0);

                var entry = logicalColumns[ii][i];


                if (entry == "spanned") {
                    continue;
                }
                var minDepth,
                    spanningColNum = ii,
                    spannedColOffsets = [];

                // set colSpan to zero. We'll increment in the loop below
                colSpan = 0;

                while (spanningColNum < endCol) {
                    var entryToTest = null,
                        foundMismatch = false;
                    for (var offset = 0; (i-offset) >= 0; offset++) {
                        entryToTest = logicalColumns[spanningColNum][i-offset];

                        if (entryToTest != null) {
                            // If we originally hit a null entry, pick up the first
                            // non null entry so we have something to actually write out.
                            if (entry == null) {
                                entry = entryToTest;
                                minDepth = offset;
                                if (i-offset == 0) {
                                    isField = true;
                                }
                            }
                            if (entry == entryToTest) {
                                spannedColOffsets[colSpan] = offset;
                                minDepth = Math.min(offset, minDepth);
                            } else {
                                foundMismatch = true;
                            }
                            break;
                        }
                    }
                    if (foundMismatch) {
                        break;
                    }
                    spanningColNum ++;

                    colSpan++;
                }

                // set rowSpan for the cell based on how deep we had to
                // go to find a real entry (shift from zero to 1-based)
                if (minDepth != null) {
                    rowSpan = minDepth+1;
                }



                // For each column this entry spans, add markers indicating that
                // we're handling this via TD with rowSpan and colSpan set (and
                // clear out duplicate entries).
                for (var spannedCols = 0; spannedCols < spannedColOffsets.length;
                    spannedCols++)
                {

                    var logicalColArray = logicalColumns[spannedCols + ii],
                        offset = spannedColOffsets[spannedCols];

                    for (var spannedRows = 0; spannedRows <= offset; spannedRows++) {

                        if (spannedCols == 0 && spannedRows == 0) {
                            logicalColArray[i-spannedRows] = entry;
                        } else if (spannedRows <= minDepth) {
                            logicalColArray[i - spannedRows] = "spanned";
                        } else {
                            logicalColArray[i - spannedRows] = null;
                        }
                    }
                }

                // We don't expect to ever end up with a null entry - not sure
                // how this could happen but log a warning
                if (entry == null) {
                    this.logWarn("Error in getPrintHeaders() - unable to generate " +
                        "print header HTML from this component's specified headerSpans");
                }

                var align = "center",
                    cellValue;

                if (isField) {
                    align = entry.align || defaultAlign;
                    cellValue = this.getHeaderButtonTitle(entry.masterIndex);
                } else {
                    cellValue = entry.title;
                }

                var cellStart = HTML.length;

                HTML[HTML.length] = "<TD class='";
                HTML[HTML.length] = printHeaderStyle;
                HTML[HTML.length] = "' align='";
                HTML[HTML.length] = "center";
                HTML[HTML.length] = "' rowSpan='";
                HTML[HTML.length] = rowSpan;
                HTML[HTML.length] = "' colSpan='";
                HTML[HTML.length] = colSpan;
                HTML[HTML.length] = "' width=";
                HTML[HTML.length] = this.getFieldWidth(entry);
                HTML[HTML.length] = ">";
                HTML[HTML.length] = cellValue;
                HTML[HTML.length] = "</TD>";

            }
            HTML[HTML.length] = "</TR>"
        }
//         this.logWarn("\n\nGenerated print header HTML (including spans):" + HTML.join(""));

    } else {

        var HTML = ["<TR>"];

        var cellStartHTML = ["<TD CLASS=", printHeaderStyle,
                             " ALIGN="].join("");

        // Just iterate through the fields once, then assemble the HTML and return it.
        if (this.frozenBody) {
            for (var colNum = 0; colNum < this.frozenFields.length; colNum++) {
                var field = this.frozenBody.fields[colNum];
                if (!field) continue;
                var align = field.align || defaultAlign;
                //var width = field.width || this.getFieldWidth(colNum);
                var width = this.getFieldWidth(colNum);
                HTML.addList([cellStartHTML, align, " width=" + width + ">",
                                    this.getHeaderButtonTitle(field.masterIndex), "</TD>"]);
            }
        }

        // Just iterate through the fields once, then assemble the HTML and return it.
        for (var colNum = startCol; colNum < endCol; colNum++) {
            var field = this.body.fields[colNum];
            if (!field) continue;
            var align = field.align || defaultAlign;
            //var width = field.width || this.getFieldWidth(colNum);
            var width = this.getFieldWidth(colNum);
            HTML.addList([cellStartHTML, align, " width=" + width + ">",
                                this.getHeaderButtonTitle(field.masterIndex), "</TD>"]);
        }

        // Output the standard header row
        HTML[HTML.length] = "</TR>";
    }
    return HTML.join(isc.emptyString);
}
}

});


// DaySchedule
// --------------------------------------------------------------------------------------------
isc.ClassFactory.defineClass("DaySchedule", "ListGrid");


isc.DaySchedule.changeDefaults("bodyProperties", {
    childrenSnapToGrid: true,
    snapToCells: true,
    redrawOnResize:true
});

isc.DaySchedule.addProperties({
    //defaultWidth: 300,
    //defaultHeight: 300,
    autoDraw: false,
    canSort: false,
    canResizeFields: false,
    canReorderFields: false,
    showHeader: false,
    showHeaderContextMenu: false,
    showAllRecords: true,
    fixedRecordHeights: true,
    labelColumnWidth: 60,
    labelColumnAlign: "right",
    showLabelColumn: true,
    labelColumnPosition: "left",
    labelColumnBaseStyle: "labelColumn",

    // show cell-level rollover
    showRollOver:true,
    useCellRollOvers:true,

    // disable autofitting  content on header double clicking
    canAutoFitFields : false,

    canSelectCells:true,

    initWidget : function () {
        this.fields = [];

        var cal = this.creator;

        this.addProperties(cal.gridProps)

        if (cal.labelColumnWidth && cal.labelColumnWidth != this.labelColumnWidth) {
            this.labelColumnWidth = cal.labelColumnWidth;
        }

        this.eventDragGap = cal.eventDragGap;

        var labelCol = {
            width: this.labelColumnWidth,
            name: "label",
            title: " ",
            cellAlign: "right",
            formatCellValue : function (value, record, rowNum, colNum, grid) {
                if (rowNum % 2 == 0) {
                    var hour = (rowNum /2);
                    var date = isc.Time.parseInput(hour);
                    return isc.Time.toTime(date, grid.creator.timeFormatter, true);
                }
                else {
                    return "";
                }
            }
        }
        if (this.showLabelColumn && this.labelColumnPosition == "left") {
            this.fields.add(labelCol);
        }

        this.fields.add({name: "day1", align: "center"});
        if (this._isWeek) {
            var numDays = 8;
            for (var i = 2; i < numDays; i++) {
                this.fields.add({name: "day" + i, align: "center" } );
            }
            this.showHeader = true;
        }
        // hide weekends
        if (this._isWeek && !this.creator.showWeekends) {

            var start = this.showLabelColumn && this.labelColumnPosition == "left" ? 1 : 0;

            var weekendDays = Date.getWeekendDays();
            for (var i = start; i < this.fields.length; i++) {

                var adjDay = ((i - start) + this.creator.firstDayOfWeek) % 7;
                //isc.logWarn('here:' + [i, adjDay]);
                if (weekendDays.contains(adjDay)) {
                    this.fields[i].showIf = "return false;";
                }
            }

            /*
            for (var i = 0; i < weekendDays.length; i++) {
                this.fields[((weekendDays[i] + this.creator.firstDayOfWeek) % 7) + start].showIf
                    = "return false;";
            }
            */
        }
        if (this.showLabelColumn && this.labelColumnPosition == "right") {
            this.fields.add(labelCol);
        }
        this.data = isc.DaySchedule._eventScaffolding;
        this.Super("initWidget");

    },

    draw : function (a, b, c, d) {
        this.invokeSuper(isc.DaySchedule, "draw", a, b, c, d);

        this.logDebug('draw', 'calendar');
        // call refreshEvents() whenever we're drawn
        // see commment above dataChanged for the logic behind this

        this.refreshEvents();

        // set the snapGap after were drawn, so that we can pick up a dynamic row height.
        // this is mostly so that scrollToWorkday code works properly.
        this.setSnapGap();
        // if scrollToWorkday is set, do that here
        if (this.creator.scrollToWorkday) this.scrollToWorkdayStart();
    },

    setSnapGap : function () {
        // get percentage of snapGap in relation to 30 minutes, the length in minutes of a row, and
        // multiply by row height to get pixels
        var snapGap = this.creator.eventSnapGap;
        this.body.snapVGap = Math.round((snapGap / 30) * this.body.getRowSize(0));
        this.body.snapHGap = null;
    },

    // To be used with calendar.scrollToWorkday
    scrollToWorkdayStart : function () {
        var sDate;

        if (this._isWeek) {
            var range = this.getWorkdayRange();
            sDate = range.start;
        } else {
            sDate = isc.Time.parseInput(this.creator.getWorkdayStart(this.creator.chosenDate));
        }

        var sRow = sDate.getHours() * 2;
        if (sDate.getMinutes() >= 30) sRow++;
        var sRowTop = this.getRowHeight(null, 0) * sRow;
        //this.scrollRecordIntoView(sRow, false);
        this.body.scrollTo(0, sRowTop);
        this.redraw();
    },

    getWorkdayRange : function () {
        var fields = this.getFields(),
            result = { start: isc.Time.parseInput("23:59"), end: isc.Time.parseInput("00:01") },
            cal = this.creator
        ;

        if (this._isWeek) {
            // get the largest range across the week
            for (var i=0; i < fields.length; i++) {
                var date = this.getDateFromCol(i);
                if (isc.isA.Date(date)) {
                    var time = isc.Time.parseInput(cal.getWorkdayStart(date));
                    if (isc.Date.compareDates(result.start, time) < 0) {
                        result.start = time;
                    }
                    var time = isc.Time.parseInput(cal.getWorkdayEnd(date));
                    if (isc.Date.compareDates(result.end, time) > 0) {
                        result.end = time;
                    }
                }
            }
        } else {
            result.start = isc.Time.parseInput(cal.getWorkdayStart(cal.chosenDate));
            result.end = isc.Time.parseInput(cal.getWorkdayEnd(cal.chosenDate));
        }
        return result;
    },

    getRowHeight : function (record, rowNum) {
        // when scrollToWorkday is true, rows should be sized so that the entire workday fits
        // inside of the viewport
        if (this.creator.scrollToWorkday) {
            var range = this.getWorkdayRange(),
                workdayLen = range.end.getHours() - range.start.getHours()
            ;
            // if workdayStart > workdayEnd, just return default cellHeight
            if (workdayLen <= 0) return this.cellHeight;
            var rHeight = Math.floor(this.body.getViewportHeight() / (workdayLen * 2));
            return rHeight < this.cellHeight ? this.cellHeight : rHeight;
        } else {
            return this.cellHeight;
        }
    },

    getDayFromCol : function (colNum) {
        var dayNum = this.fields.get(colNum)._dayNum;
        return dayNum;
    },

    getDateFromCol : function (colNum) {
        var fld = this.fields.get(colNum);
        if (fld._yearNum == null || fld._monthNum == null || fld._dateNum == null) return null;
        var newDate = new Date(fld._yearNum, fld._monthNum, fld._dateNum);
        return newDate;
    },

    isLabelCol : function (colNum) {
        if (colNum == 0 && this.showLabelColumn && this.labelColumnPosition == "left") {
            return true;
        } else if (colNum == this.fields.length - 1 && this.showLabelColumn &&
            this.labelColumnPosition == "right") {
             return true;
        } else {
            return false;
        }
    },

    // helper function for detecting when a weekend is clicked, and weekends are disabled
    colDisabled : function (colNum) {
        var dayNum = this._isWeek ? this.getDayFromCol(colNum) : this.creator.chosenDate.getDay();
        //isc.logWarn('colDisabled:' + [colNum, dayNum]);
        if (this.creator.disableWeekends
            && Date.getWeekendDays().contains(dayNum)) {
            return true;
        } else {
            return false;
        }
    },

    // helper function to refresh dayView cell styles for weekend disabling
    refreshStyle : function () {
        if (!this.body) return;
        if (this._isWeek) {
            // need to refresh all cells to cater for weekView (for workday handling)
            this.markForRedraw();
            return;
        }
        for (var i = 0; i < this.data.length; i++) {
            this.body.refreshCellStyle(i, 1);
        }
    },

    // use the chosen week start to figure out the base date, then add the headerFieldNum
    // to that to get the appropriate date. Use dateChooser.dateClick() to simplify code.
    headerClick : function (headerFieldNum, header) {
        if (this.isLabelCol(headerFieldNum)) return true;

        var fld = this.getField(headerFieldNum);
        var cal = this.creator;
        cal.dateChooser.dateClick(fld._yearNum, fld._monthNum, fld._dateNum);
        cal.selectTab(0);
        return true;
    },


    getCellAlign : function (record, rowNum, colNum) {
       return this.labelColumnAlign;
    },

    cellMouseDown : function (record, rowNum, colNum) {
        if (this.isLabelCol(colNum) || this.colDisabled(colNum)) return true;

        // if backgroundMouseDown is implemented, run it and return if it returns false
        var startDate = this.creator.getCellDate(this.getEventRow(), this.getEventColumn());
        if (this.creator.backgroundMouseDown && this.creator.backgroundMouseDown(startDate) == false) return;

        // don't set up selection tracking if canCreateEvents is disabled
        if (!this.creator.canCreateEvents) return true;
        // first clear any previous selection
        this.clearSelection();
        this._selectionTracker = {};
        this._selectionTracker.colNum = colNum;
        this._selectionTracker.startRowNum = rowNum;
        this._selectionTracker.endRowNum = rowNum;
        this._mouseDown = true;
        this.refreshCellStyle(rowNum, colNum);
    },

    cellOver : function (record, rowNum, colNum) {
        if (this._mouseDown && this._selectionTracker) {
            var refreshRowNum;
            // selecting southbound
            if (this._selectionTracker.startRowNum < this._selectionTracker.endRowNum) {
                // should select this cell
                if (rowNum > this._selectionTracker.endRowNum) {
                    refreshRowNum = rowNum;
                } else { // should deselect the previous end row number
                    refreshRowNum = this._selectionTracker.endRowNum;
                }
                // trigger cell style update from getCellStyle
                this._selectionTracker.endRowNum = rowNum;
            // selecting northbound
            } else {
                // should select this cell
                if (rowNum < this._selectionTracker.endRowNum) {
                    refreshRowNum = rowNum;
                } else { // should deselect the previous end row number
                    refreshRowNum = this._selectionTracker.endRowNum;
                }
                this._selectionTracker.endRowNum = rowNum;
            }
            var refreshGap = 6;
            var colNum = this._selectionTracker.colNum;
            for (var i = refreshRowNum - refreshGap; i < refreshRowNum + refreshGap; i++) {
                // 48 1/2 hours in a day, don't refresh non-existent cells
                if (i >= 0 && i <= 47) this.refreshCellStyle(i, colNum);
            }
        }
    },

    cellMouseUp : function (record, rowNum, colNum) {
        if (!this._selectionTracker) return true;

        this._mouseDown = false;
        var sRow, eRow, diff;
        // cells selected upwards
        if (this._selectionTracker.startRowNum > this._selectionTracker.endRowNum) {
            sRow = this._selectionTracker.endRowNum;
            eRow = this._selectionTracker.startRowNum;
        // cells selected downwards
        } else {
            eRow = this._selectionTracker.endRowNum;
            sRow = this._selectionTracker.startRowNum;
        }
        diff = eRow - sRow + 1;

        var startDate = this.creator.getCellDate(sRow, colNum);
        var endDate = this.creator.getCellDate(sRow+diff, colNum);

        // if backgroundClick is implemented, and there's no selection (a click, not just mouseUp),
        // run it and bail if it returns false
        if (diff == 1 && this.creator.backgroundClick) {
            if (this.creator.backgroundClick(startDate, endDate) == false) {
                this.clearSelection();
                return;
            }
        }
        // if backgroundMouseUp is implemented, run it and bail if it returns false
        if (this.creator.backgroundMouseUp) {
            if (this.creator.backgroundMouseUp(startDate, endDate) == false) {
                this.clearSelection();
                return;
            }
        }

        //this.creator._showEventDialog(null, sRow, this._selectionTracker.colNum, diff);
        var newEvent = {};
        newEvent[this.creator.startDateField] = startDate;
        newEvent[this.creator.endDateField] = endDate;
        this.creator.showNewEventDialog(newEvent);
    },

    getCellStyle : function (record, rowNum, colNum) {
        var bStyle = this.getBaseStyle(record, rowNum, colNum);

        if (this.isLabelCol(colNum)) return bStyle;
        if (this.colDisabled(colNum)) return bStyle + "Disabled";

        if (!this._isWeek && this.alternateRecordStyles && rowNum % 2 != 0) return bStyle + "Dark";

        if (this._selectionTracker && this._selectionTracker.colNum == colNum) {
            var sRow = this._selectionTracker.startRowNum,
                eRow = this._selectionTracker.endRowNum;
            // if rowNum is within start and end of selection, return selected style
            if (rowNum >= sRow && rowNum <= eRow || rowNum >= eRow && rowNum <= sRow) {
                return this.creator.selectedCellStyle;
            } else {
                return bStyle;
            }
        } else {

            return bStyle;
        }
    },

    getBaseStyle : function (record, rowNum, colNum) {
        var cal = this.creator,
            date = cal.getCellDate(rowNum, colNum),
            style = date ? cal.getDateStyle(date, rowNum, colNum, this) : null
        ;

        if (style) {
            // getDateStyle() returned a style - just return that
            return style;
        }

        if (this.isLabelCol(colNum)) return this.labelColumnBaseStyle;

        if (!this.creator.showWorkday) return this.baseStyle;

        var dayNum = this._isWeek ? this.getDayFromCol(colNum) : this.creator.chosenDate.getDay();

        // workdayStart/end need to be based on current date and not just parsed workdayStart.
        // this fixes an issue where parsed date could have the wrong day.
        var wStart = this._isWeek ? this.getDateFromCol(colNum) : this.creator.chosenDate.duplicate(),//isc.Time.parseInput(this.creator.workdayStart),
            wEnd = wStart.duplicate(),//isc.Time.parseInput(this.creator.workdayEnd),
            currRowTime = wStart.duplicate(),
            // TODO consider moving this into initWidget() to not parse the date for every cell
            parsedStart = isc.Time.parseInput(this.creator.getWorkdayStart(currRowTime)),
            parsedEnd = isc.Time.parseInput(this.creator.getWorkdayEnd(currRowTime))
        ;
        // need to set hours and minutes of start and end to the same as workdayStart and
        // workdayEnd
        wStart.setHours(parsedStart.getHours());
        wStart.setMinutes(parsedStart.getMinutes());
        wEnd.setHours(parsedEnd.getHours());
        wEnd.setMinutes(parsedEnd.getMinutes());
        // setUTCHours() and setUTCMinutes were causing problems, so use setHours/Minutes instead
        currRowTime.setHours(Math.floor(rowNum / 2));
        if (rowNum % 2 == 1) currRowTime.setMinutes(30);
        else currRowTime.setMinutes(0);

        if (this._isWeek) {
            currRowTime.setFullYear(wStart.getFullYear());
            currRowTime.setMonth(wStart.getMonth());
            currRowTime.setDate(wStart.getDate());
        }

        var dayIsWorkday = this.creator.dateIsWorkday(currRowTime);

        currRowTime = currRowTime.getTime();
        if (dayIsWorkday && wStart.getTime() <= currRowTime && currRowTime < wEnd.getTime()) {
            return this.creator.workdayBaseStyle;
        } else {
            return this.baseStyle;
        }
    },

    clearSelection : function () {
        if (this._selectionTracker) {
            var sRow, eRow, colNum = this._selectionTracker.colNum;
            // establish order of cell refresh
            if (this._selectionTracker.startRowNum < this._selectionTracker.endRowNum) {
                sRow = this._selectionTracker.startRowNum;
                eRow = this._selectionTracker.endRowNum;
            } else {
                sRow = this._selectionTracker.endRowNum;
                eRow = this._selectionTracker.startRowNum;
            }
            // remove selection tracker so cells get reset to baseStyle
            this._selectionTracker = null;
            for (var i = sRow; i < eRow + 1; i++) {
                this.refreshCellStyle(i, colNum);
            }
        }
    },

    refreshEvents : function () {
        // bail if the grid hasn't been drawn yet, or hasn't gotten data yet
        if (!this.body || !this.creator.hasData()) return;

        this.logDebug('refreshEvents:' + this.viewName, "calendar");
        this.clearEvents();
        var startDate, endDate, cal = this.creator;
        if (this._isWeek) {
            startDate = cal.chosenWeekStart;
            endDate = cal.chosenWeekEnd;
        } else {
            startDate = new Date(cal.year, cal.month, cal.chosenDate.getDate(),0, 0);
            endDate = new Date(cal.year, cal.month, cal.chosenDate.getDate(),23, 59);
        }

        var events = cal._getEventsInRange(startDate, endDate);

        for (var i = 0; i < events.length; i++) {
            this.addEvent(events[i]);
        }

        if (cal.eventsRendered && isc.isA.Function(cal.eventsRendered))
            cal.eventsRendered();

    },

    sizeEventWindow : function (eventWin) {
        var cal = this.creator, event = eventWin.event;
         // don't resize when we're dragRepositioned

        if (Array.isLoading(event)) return;

        if (!eventWin._skipResize) {
            if (cal.eventAutoArrange) {
                // resize, move and render all events touching the range of this event
                cal._renderEventRange(eventWin._isWeek, event[cal.startDateField], event[cal.endDateField]);
            } else {
                var grid = (eventWin._isWeek ? cal.weekView : cal.dayView);

                var rowSize = grid.getRowHeight(1),
                    colSize = grid.getColumnWidth(grid.isLabelCol(0) ? 1 : 0);
                // catch the case where the end of the event is on 12am, which happens when an
                // event is dragged or resized to the bottom of the screen
                var eHrs = event[cal.endDateField].getHours() == 0 ? 24
                         : event[cal.endDateField].getHours();
                // if the event ends on the next day, render it as ending on the last hour of the
                // current day
                var spansDays = false;
                if (event[cal.endDateField].getDate() > event[cal.startDateField].getDate()) {
                    spansDays = true;
                    eHrs = 24;
                }

                // each (rowSize * 2) represents one hour, so we're doing (hour diff) * (1 hour height)
                var eHeight = (eHrs - event[cal.startDateField].getHours()) * (rowSize * 2),
                    eWidth = colSize;

                //isc.logWarn('sizeEventWindow:' + [eventWin.ID, eHrs, eHrs - event[cal.startDateField].getHours()]);
                // for border overlap
                if (cal.weekEventBorderOverlap && eventWin._isWeek) eWidth += 1;
                if (event[cal.startDateField].getMinutes() > 0) {
                    eHeight -= cal._getMinutePixels(event[cal.startDateField].getMinutes(), rowSize);
                }
                if (event[cal.endDateField].getMinutes() > 0 && !spansDays) {
                    eHeight += cal._getMinutePixels(event[cal.endDateField].getMinutes(), rowSize);
                }

                var eTop = event[cal.startDateField].getHours() * (rowSize * 2);

                if (event[cal.startDateField].getMinutes() > 0) {
                    eTop += cal._getMinutePixels(event[cal.startDateField].getMinutes(), rowSize);
                }
                var eLeft = cal.getEventLeft(event, eventWin._isWeek);
                eventWin.renderEvent(eTop, eLeft, eWidth, eHeight)
            }
        } else {
            eventWin._skipResize = false;
        }
    },

    poolEventWindows: true,
    poolEventWindow : function (eventWin) {
        if (this.body) {
            if (!this.body._eventWindowPool) this.body._eventWindowPool = [];
            this.body._eventWindowPool.add(eventWin);
            return true;
        } else return false;
    },
    getPooledEventWindow : function () {
        if (!this.body) return;
        if (!this.body._eventWindowPool) this.body._eventWindowPool = [];
        var pool = this.body._eventWindowPool,
            eventWin
        ;
        if (pool.length > 0) {
            eventWin = pool[pool.length-1];
            pool.removeAt(pool.length-1);
        }
        return eventWin;
    },
    destroy : function () {
        this.clearEvents(true);
        if (this.body) this.body._eventWindowPool = null;
        this.Super("destroy", arguments);
    },
    clearEvents : function (shouldDestroy) {
        if (!this.body || !this.body.children) return;
        var arr = this.body.children,
            processThese = [],
            counter = arr.length - 1
        ;

        for (var i = counter; i >= 0 ; i--) {
            if (isc.isAn.EventWindow(arr[i])) {
                processThese.add(arr[i]);
                this.body.removeChild(arr[i]);
            }
         }

        if (processThese.length > 0) {
            for (var i=0; i<processThese.length; i++) {
                var eventWin = processThese[i];
                if (eventWin) {
                    if (!this.poolEventWindows || shouldDestroy) {
                        // destroy the eventWindow
                        eventWin.destroy();
                        eventWin = null;
                    } else {
                        // add the eventWindow to the pool
                        this.poolEventWindow(eventWin);
                    }
                }
            }
        }
    },

    addEvent : function (event) {
        // clear any cell selection that has been made
        this.clearSelection();

        var win = this.creator._getNewEventWindow(event, this);
        win._parentView = this;

        if (this._isWeek) win._isWeek = true;
        if (this.body) this.body.addChild(win);
        this.sizeEventWindow(win);
    },

    removeEvent : function (event) {
        var arr = this.body.children || [];
        for (var i = 0; i < arr.length ; i++) {
            if (isc.isAn.EventWindow(arr[i]) && arr[i].event === event) {
                var win = arr[i];
                win.parentElement.removeChild(win);
                if (this.poolEventWindows) this.poolEventWindow(win);
                else win.destroy();
                return true;
            }
        }
        return false;
    },

    // DaySchedule updateEventWindow
    updateEventWindow : function (event) {
        if (!this.body || !this.body.children) return;
        var arr = this.body.children, cal = this.creator;
        if (cal.dataSource) cal._pks = cal.getDataSource().getLocalPrimaryKeyFields();
        for (var i = 0; i < arr.length ; i++) {
            if (isc.isAn.EventWindow(arr[i]) && this.areSame(arr[i].event, event)) {
                // reassign event for databound update, because databound update creates
                // a new object
                arr[i].event = event;
                this.sizeEventWindow(arr[i]);
                //arr[i].sizeToEvent();
                arr[i].setDescriptionText(event[cal.descriptionField]);
                return true;
            }
        }
        return false;
    },

    areSame : function (first, second) {
        var cal = this.creator;
        if (cal.dataSource) {
            var pks = cal._pks, areEqual = true;
            for (var pkName in pks) {
                if (first[pkName]!= second[pkName]) {
                    areEqual = false;
                    break;
                }
            }
            return areEqual;
        } else {
            return (first === second);
        }
    }

});

// WeekSchedule
// --------------------------------------------------------------------------------------------
isc.ClassFactory.defineClass("WeekSchedule", "DaySchedule");


// MonthSchedule
// --------------------------------------------------------------------------------------------
isc.ClassFactory.defineClass("MonthSchedule", "ListGrid");

// Create a separate subclass for month schedule body

isc.ClassFactory.defineClass("MonthScheduleBody", "GridBody");

isc.MonthSchedule.changeDefaults("headerButtonProperties", {
    showRollOver: false,
    showDown: false,
    cursor: "default"
});

isc.MonthSchedule.changeDefaults("bodyProperties", {
    redrawOnResize:true
});

isc.MonthSchedule.addProperties({
    autoDraw: false,
    leaveScrollbarGap: false,

    showAllRecords: true,
    fixedRecordHeights: true,

    // show header but disable all header interactivity
    showHeader: true,
    showHeaderContextMenu: false,
    canSort: false,
    canResizeFields: false,
    canReorderFields: false,

    // disable header resizing by doubleclick
    canAutoFitFields:false,

    canHover: true,
    showHover: true,
    hoverWrap: false,
    // show cell-level rollover
    showRollOver:true,
    useCellRollOvers:true,

    // set up cell-level drag selection
    //canDrag:true,
    // dragAppearance:"none",
    //canDragSelect:true,
    canSelectCells:true,

    //firstDayOfWeek: 0,
    dayHeaderHeight: 20,
    // set alternateRecordStyle to false: for many skins, not having this set to
    // false leads to undefined styles being generated like 'calMonthOtherDayBodyDisabledDark'.
    // See GridRenderer.getCellStyleIndex() where it checks for this.alternateRowStyles.
    // We manually set row styles for the month view, so it should be safe to disable
    // alternate row styles.
    alternateRecordStyles: false,

    initWidget : function () {
        var cal = this.creator;
        // create month UI scaffolding
        if (cal.data) this.data = this.getDayArray();
        this.fields = [
            {name: "day1", align: "center"},
            {name: "day2", align: "center"},
            {name: "day3", align: "center"},
            {name: "day4", align: "center"},
            {name: "day5", align: "center"},
            {name: "day6", align: "center"},
            {name: "day7", align: "center"}
        ];

        // set day titles
        this.firstDayOfWeek = cal.firstDayOfWeek;
        var sdNames = Date.getShortDayNames();
        var weekendDays = Date.getWeekendDays();
        for (var i = 0; i < 7; i++) {
            var dayNum = (i + this.firstDayOfWeek) % 7;
            this.fields[i].title = sdNames[dayNum];
            this.fields[i]._dayNum = dayNum;
            // store day index to easily get to the right day properties stored on the month
            // records from methods like formatCellValue
            this.fields[i]._dayIndex = i + 1;
            // hide weekends
            if (!cal.showWeekends && weekendDays.contains(dayNum)) {
                this.fields[i].showIf = "return false;";
            }

        }

        this.minimumDayHeight = cal.minimumDayHeight;

        this.Super("initWidget");
    },

    getCellCSSText : function (record, rowNum, colNum) {
        var result = this.creator._getCellCSSText(this, record, rowNum, colNum);

        if (result) return result;
        return this.Super("getCellCSSText", arguments);
    },

    getDayArray : function () {
        var dayArr = [], eventArr, endDate,
            displayDate = new Date(this.creator.year, this.creator.month, 1);

        // go back to the first day of the week
        while (displayDate.getDay() != this.creator.firstDayOfWeek) {
            this.incrementDate(displayDate, -1);
        }

        // special case when hiding weekends, can have the first row be entirely from the previous
        // month. In this case, hide the first row by adding 7 days back to the displayDate
         if (!this.creator.showWeekends) {
            var wEnds = Date.getWeekendDays();
            var checkDate = displayDate.duplicate();
            var hideFirstRow = true;
            for (var i = 0; i <= 7 - wEnds.length; i++) {
                if (checkDate.getMonth() == this.creator.month) {
                    hideFirstRow = false;
                    break;
                }
                this.incrementDate(checkDate,1)
            }
            if (hideFirstRow) this.incrementDate(displayDate, 7);

        }

        // 40 days from start date seems like a nice round number for getting
        // all the relevant events in a month, with extra days for adjacent months
        endDate = new Date(this.creator.year, this.creator.month,
            displayDate.getDate() + 40);
        eventArr = this.creator._getEventsInRange(displayDate, endDate);
        // sort events by date
        eventArr.sortByProperty("name", true,
            function (item, propertyName, context) {
                return item[context.startDateField].getTime();
            }, this.creator);
        this._eventIndex = 0;
        for (var i=0; i<6; i++) { // the most we need to iterate is 6, sometimes less
            // add rows of data to designate days and day headers. Each row is either a header
            // or a day body.
            if (this.creator.showDayHeaders) dayArr.add(this.getHeaderRowObject(displayDate));
            dayArr.add(this.getEventRowObject(displayDate, eventArr));
            this.incrementDate(displayDate, 7);
            // if we hit the next month, don't keep adding rows, we're done.
            if (displayDate.getMonth() != this.creator.month) break;
        }
        return dayArr;
    },

    getHeaderRowObject : function (theDate) {
        var obj = {};
        var nDate = theDate.duplicate();
        for (var i=0; i<7; i++) {
            obj["day" + (i + 1)] = nDate.getDate();
            // store the complete date
            obj["date" + (i + 1)] = nDate.duplicate();
            this.incrementDate(nDate, 1);
        }
        return obj;
    },

    incrementDate : function (date, offset) {
        var curDate = date.getDate();
        date.setDate(curDate + offset);
        // In some timezones, DST can cause certain date/times to be invalid so if you attempt
        // to set a java date to (say) 00:00 on Oct 16, 2011, with native timezone set to
        // Brasilia, Brazil, the actual date gets set to 23:00 on Oct 15th, leading to
        // bad display.
        // Workaround this by tweaking the time to avoid such an issue

        if (date.getDate() == (curDate+offset) -1) {
            date.setHours(date.getHours() + 1);
            date.setDate(curDate + offset);
        }
        return date;
    },

    getEventRowObject : function (theDate, events) {
        var obj = {};
        var nDate = theDate.duplicate();
        for (var i=0; i<7; i++) {
            var evArr = [];
            while (this._eventIndex < events.length) {
                var evnt = events[this._eventIndex];
                if (evnt[this.creator.startDateField].getMonth() != nDate.getMonth()
                    || evnt[this.creator.startDateField].getDate() != nDate.getDate()) {
                    break;
                } else {
                    evArr.add(evnt);
                    this._eventIndex += 1;
                }

            }
            // store the day number here too
            obj["day" + (i + 1)] = nDate.getDate();
            // store the complete date
            obj["date" + (i + 1)] = nDate.duplicate();
            // store the events
            obj["event" + (i + 1)] = evArr;
            this.incrementDate(nDate, 1);
        }
        return obj;
    },

    // utility method used for retrieving events from a given row and column number.
    // used by calendar.monthViewEventCick
    getEvents : function (rowNum, colNum) {
        var day = this.getDayFromCol(colNum);
        var dayIndex = this.fields.get(colNum)._dayIndex
        var events = this.data[rowNum]["event" + dayIndex];
        return events;
    },

    getEventCell : function (event) {
        var data = this.data;
        for (var colNum = 0; colNum < this.fields.length; colNum++) {
            var dayIndex = this.fields[colNum]._dayIndex,
                eventTitle = "event" + dayIndex;
            for (var rowNum = 0; rowNum < data.length; rowNum++) {
                var events = data.get(rowNum)[eventTitle];
                if (events != null && events.contains(event)) {
                    return [rowNum,colNum];
                }
            }
        }
    },

    getDayFromCol : function (colNum) {
        var dayNum = this.fields.get(colNum)._dayNum;
        return dayNum;

    },

    // helper function for detecting when a weekend is clicked, and weekends are disabled
    colDisabled : function (colNum) {
        if (this.creator.disableWeekends
            && Date.getWeekendDays().contains(this.getDayFromCol(colNum))) {
            return true;
        } else {
            return false;
        }
    },

    refreshEvents : function () {
        // bail if no data yet
        if (!this.creator.hasData()) return;
        this.logDebug('refreshEvents: month', 'calendar');
        this.setData(this.getDayArray());
        var cal = this.creator;
        if (cal.eventsRendered && isc.isA.Function(cal.eventsRendered))
            cal.eventsRendered();
   },

    rowIsHeader : function (rowNum) {
        var cal = this.creator;
        if (!cal.showDayHeaders || (cal.showDayHeaders && rowNum % 2 == 1)) return false;
        else return true;
    },

    formatCellValue : function (value, record, rowNum, colNum) {
        var cal = this.creator,
            fieldIndex = this.fields.get(colNum)._dayIndex,
            evtArr = record["event" + fieldIndex],
            currDate = record["date" + fieldIndex],
            isOtherDay = currDate.getMonth() != cal.chosenDate.getMonth();

        if (this.rowIsHeader(rowNum)) {
            if (!cal.showOtherDays && isOtherDay) {
                return "";
            } else {
                //isc.logWarn('here:' + [value, currDate.getDate(), rowNum, colNum]);

                return cal.getDayHeaderHTML(currDate, evtArr, cal, rowNum, colNum);
            }
        } else {
            if (!cal.showOtherDays && isOtherDay) {
                return "";
            } else {
                return cal.getDayBodyHTML(currDate, evtArr, cal, rowNum, colNum);
            }
        }
    },

    cellHeight: 1,
    enforceVClipping: true,
    getRowHeight : function (record, rowNum) {
        var dayHeaders = this.creator.showDayHeaders;
        if (this.rowIsHeader(rowNum)) { // header part
            return this.dayHeaderHeight;
        } else { // event part, should use fixedRecordHeights:false
            var rows = dayHeaders ? this.data.length / 2 : this.data.length,
                viewHeight = dayHeaders ? this.body.getViewportHeight()
                    - (this.dayHeaderHeight * rows) : this.body.getViewportHeight(),
                minHeight = dayHeaders ? this.minimumDayHeight - this.dayHeaderHeight : null
            ;

            if (viewHeight / rows <= minHeight) {
                return minHeight;
            } else {
                // calculate the remainder and add 1 to the current row height if need be.
                // this eliminates a gap at the bottom of the month view
                var remainder = viewHeight % rows,
                    offset = 0,
                    currRow = dayHeaders ? (rowNum - 1) / 2 : rowNum
                ;
                if (currRow < remainder) offset = 1;
                return (Math.floor(viewHeight / rows) + offset);
            }
        }
    },

    getCellAlign : function (record, rowNum, colNum) {
        if (this.rowIsHeader(rowNum)) return "right"
        else return "left";
    },

    getCellVAlign : function (record, rowNum, colNum) {
        if (!this.rowIsHeader(rowNum)) return "top";
        else return "center"

    },

    cellHoverHTML : function (record, rowNum, colNum) {
        var fieldIndex = this.fields.get(colNum)._dayIndex;
        var currDate   = record["date" + fieldIndex];
        var evtArr     = record["event" + fieldIndex];

        if (!this.rowIsHeader(rowNum) && evtArr != null) {
            var cal = this.creator;
            return cal.getMonthViewHoverHTML(currDate,evtArr);
        }
    },

    getBaseStyle : function (record, rowNum, colNum) {
        var cal = this.creator, fieldIndex = this.fields.get(colNum)._dayIndex;
        var bStyle;
        if (this.rowIsHeader(rowNum)) { // header
            if ((rowNum == 0 && record["day" + fieldIndex] > 7)
                || (rowNum == this.data.length - 2 && record["day" + fieldIndex] < 7)) {
                if (!cal.showOtherDays) return cal.otherDayBlankStyle;
                else bStyle = cal.otherDayHeaderBaseStyle;
            } else bStyle = cal.dayHeaderBaseStyle;
        } else { // body
            var dis = this.colDisabled(colNum),
                startRow = cal.showDayHeaders ? 1 : 0, endRow = this.data.length - 1;

            if ((rowNum == startRow && this.data[startRow]["day" + fieldIndex] > 7)
                || (rowNum == endRow && this.data[endRow]["day" + fieldIndex] < 7)) {
                if (!cal.showOtherDays) return cal.otherDayBlankStyle;
                else bStyle = dis ? cal.otherDayBodyBaseStyle + "Disabled" : cal.otherDayBodyBaseStyle;
            } else bStyle = dis ? cal.dayBodyBaseStyle + "Disabled" : cal.dayBodyBaseStyle;
        }
        return bStyle;
    },

    // monthView cellClick
    // if a header is clicked, go to that day. Otherwise, open the event dialog for that day.
    cellClick : function (record, rowNum, colNum) {
        var cal = this.creator, year, month, fieldIndex = this.fields.get(colNum)._dayIndex,
            currDate = record["date" + fieldIndex],
            evtArr = record["event" + fieldIndex],
            isOtherDay = cal.chosenDate.getMonth() != currDate.getMonth(),
            doDefault = false;
        if (this.rowIsHeader(rowNum)) { // header clicked
            if (!(!this.creator.showOtherDays && isOtherDay)) {
                doDefault = cal.dayHeaderClick(currDate, evtArr, cal, rowNum, colNum);
            }
            if (doDefault) {
                // previous month day clicked
                if (rowNum == 0 && record["day" + fieldIndex] > 7) {
                    // check for previous year boundaries
                    if (cal.month == 0) {
                        year = cal.year - 1;
                        month = 11;
                    } else {
                        year = cal.year;
                        month = cal.month - 1;
                    }
                } else if (rowNum == this.data.length - 2 && record["day" + fieldIndex] < 7) {
                    // check for next year boundaries
                    if (cal.month == 11) {
                        year = cal.year + 1;
                        month = 0;
                    } else {
                        year = cal.year;
                        month = cal.month + 1;
                    }
                } else {
                    year = cal.year;
                    month = cal.month;
                }

                cal.dateChooser.dateClick(year, month, record["day" + fieldIndex]);
                cal.selectTab(0);
            }
        } else { // day body clicked
            if (!this.colDisabled(colNum) && !(!cal.showOtherDays && isOtherDay)) {
                doDefault = cal.dayBodyClick(currDate, evtArr, cal, rowNum, colNum);
                if (doDefault && cal.canCreateEvents) {
                    var startDate = cal.getCellDate(rowNum, colNum),
                        endDate = cal.getCellDate(rowNum, colNum+1)
                    ;
                    //this.creator._showEventDialog(null, sRow, this._selectionTracker.colNum, diff);
                    var newEvent = {};
                    newEvent[cal.startDateField] = startDate;
                    newEvent[cal.endDateField] = endDate;
                    cal.showNewEventDialog(newEvent);
                }
            }

        }
    }




});

// EventWindow
//---------------------------------------------------------------------------------------------
//> @class EventWindow
// Subclass of Window used to display events within a +link{Calendar}.  Customize via
// +link{calendar.eventWindow}.
//
// @visibility external
//<
isc.ClassFactory.defineClass("EventWindow", "Window");

isc.EventWindow.changeDefaults("resizerDefaults", {
    overflow:"hidden", height: 6,
    snapTo: "B",
    canDragResize:true//, getEventEdge:function () {return "B"}
})

isc.EventWindow.changeDefaults("headerDefaults", {
    layoutMargin:0, layoutLeftMargin:3, layoutRightMargin:3
})

isc.EventWindow.addProperties({
    autoDraw: false,
    minHeight: 5,
    // for timelineEvents, so they can be resized to be very small
    minWidth: 5,
    showHover: true,
    canHover: true,
    hoverWidth: 200,

    showHeaderIcon: false,
    showMinimizeButton: false,
    showMaximimumButton: false,
    canDragResize: true,
    canDragReposition: true,
    resizeFrom: ["B"],
    showShadow: false,
    showEdges: false,
    showHeaderBackground: false,
    useBackMask: false,
    keepInParentRect: true,
    headerProperties: {height:14},

    closeButtonProperties: {height: 10, width: 10},
    bodyColor: null,

    showFooter: true,

    baseStyle: "eventWindow",

    //showBody:false,
    //showTitle:false,

    footerProperties: {overflow:"hidden", defaultLayoutAlign:"center", height: 7},
    bodyConstructor: isc.HTMLFlow,

    initWidget : function () {
        this.bodyStyle = this.baseStyle + "Body";
        this.headerStyle = this.baseStyle + "Header";
        this.headerLabelProperties = {styleName: this.className + "Header"};

        if (this.calendar.showEventDescriptions != false) {
            this.bodyProperties = isc.addProperties({}, this.bodyProperties,
                {contents: this.descriptionText, valign:"top", overflow: "hidden"}
            );
        }
        if (this.calendar.showEventBody == false) {
            this.showBody = false;
            // need to set showTitle to false so that drag reposition works
            this.showTitle = false;
        }

        this.Super("initWidget", arguments);
    },

    makeFooter : function () {
        // if not showing a footer, bail
        if (!this.showFooter || this.canDragResize == false) return;

        this.resizer = this.createAutoChild("resizer", {
            dragTarget:this,
            styleName: this.baseStyle + "Resizer"
        });
        this.addChild(this.resizer);

        // needs to be above the statusBar
        if (this.resizer) this.resizer.bringToFront();
    },

    setDescriptionText : function (descriptionText) {
        if (this.calendar.getDescriptionText) {
            descriptionText = this.calendar.getDescriptionText(this.event);
        }
        if (descriptionText) {
            if (this.body) {
                this.descriptionText = descriptionText;
                this.body.setContents(descriptionText);
            } else {
                this.descriptionText = descriptionText;
                if (this._eventLabel) {

                    this._eventLabel.setWidth("100%");
                    this._eventLabel.setContents(descriptionText);
                }

            }
        }
    },

    click : function () {
        if (this._closed) return;
        if (this._hitCloseButton) {
            // one-time flag set when the close button is clicked but eventRemoveClick() has
            // been implemented and cancels the removal.
            this._hitCloseButton = null;
            return;
        }
        var cal = this.calendar;
        var doDefault = cal.eventClick(this.event, this._isWeek ? "week" : "day");
        if (doDefault) {
            if (!cal.canEditEvent(this.event)) return;
            // handle the case when a selection is made, then an event is clicked
            if (this._isWeek) cal.weekView.clearSelection();
            else if (cal.dayView) cal.dayView.clearSelection();
            var offset = (this._isWeek && cal.weekView.isLabelCol(0) ? 1 : 0);
            var col = this._isWeek ? this.event[cal.startDateField].getDay() -
                cal.firstDayOfWeek + offset : offset;
            // account for no weekends shown
            if (this._isWeek && cal.showWeekends == false) col--;
            var row =  this.event[cal.startDateField].getHours() * 2;
            cal.showEventDialog(this.event);
        }
    },

    mouseDown : function () {
        this.calendar.eventDialog.hide();
        return isc.EH.STOP_BUBBLING;
    },

    renderEvent : function (eTop, eLeft, eWidth, eHeight) {
        var cal = this.calendar, event = this.event;

        this.updateColors();

        if (isc.isA.Number(eWidth) && isc.isA.Number(eHeight)) {
            this.resizeTo(Math.round(eWidth), Math.round(eHeight));
        }
        if (isc.isA.Number(eTop) && isc.isA.Number(eLeft)) {
            this.moveTo(Math.round(eLeft), Math.round(eTop));
        }

        var sTime = isc.Time.toTime(event[cal.startDateField], this.calendar.timeFormatter, true);
        var eTitle = sTime + " " + event[cal.nameField];

        var style = ""
        if (event.headerTextColor) style += "color:" + event.headerTextColor + ";";
        if (event.headerBackgroundColor) {
            style += "background-color:" + event.headerBackgroundColor + ";";
            var headerLevelParent = this.header.getMember(0);
            if (headerLevelParent) {
                headerLevelParent.setBackgroundColor(event.headerBackgroundColor);
            }
        }
        if (style != "") eTitle = "<span style='" + style + "'>" + eTitle + "</span>";

        this.setTitle(eTitle);
        this.bringToFront();
    },

    updateColors : function () {
        var cal = this.calendar,
            event = this.event,
            header = this.header,
            labelParent = header ? header.getMember ? header.getMember(0) : header : null,
            label = labelParent
        ;

        if (!event) return;

        if (labelParent && labelParent.children && labelParent.children[0]) {
            var members = labelParent.children[0].members;
            if (members && members.length > 0) label = members[0];
        }

        if (event.backgroundColor) {
            this.setBackgroundColor(event.backgroundColor);
            if (this.body) this.body.setBackgroundColor(event.backgroundColor);
        } else {
            this.backgroundColor = null;
            if (this.isDrawn() && this.getStyleHandle()) {
                this.getStyleHandle().backgroundColor = null;
            }
            if (this.body) {
                this.body.backgroundColor = null;
                if (this.body.isDrawn() && this.body.getStyleHandle()) {
                    this.body.getStyleHandle().backgroundColor = null;
                }
            }
            if (label) {
                label.backgroundColor = null;
                if (label.isDrawn() && label.getStyleHandle()) {
                    label.getStyleHandle().backgroundColor = null;
                }
            }
        }

        if (event.textColor) {
            this.setTextColor(event.textColor);
            if (this.body) {
                var style = "color:" + event.textColor + ";"
                this.body.setTextColor(event.textColor);
                this.body.setContents("<span style='" + style + "'>" +
                        event[cal.descriptionField] || "" + "</span>");
            }
        } else {
            this.setTextColor(null);
            if (this.isDrawn() && this.getStyleHandle()) {
                this.getStyleHandle().color = null;
            }
            if (this.body) {
                this.body.setTextColor(null);
                this.body.setContents(event[cal.descriptionField]);
            }
            if (label) {
                label.setTextColor(null);
                label.setContents(event[cal.nameField]);
            }
        }

        if (this.header) {
            var backColor, textColor;
            if (cal.showEventDescriptions == false) {
                backColor = event.backgroundColor;
                textColor = event.textColor;
            } else {
                backColor = event.headerBackgroundColor;
                textColor = event.headerTextColor;
            }
            if (backColor) {
                this.header.setBackgroundColor(backColor);
                if (label) label.setBackgroundColor(backColor);
            } else {
                this.header.backgroundColor = null;
                if (this.isDrawn() && this.header.getStyleHandle()) {
                    this.header.getStyleHandle().backgroundColor = null;
                }
                if (label) {
                    label.backgroundColor = null;
                    if (label.getStyleHandle()) {
                        label.getStyleHandle().backgroundColor = null;
                    }
                }
            }
            if (textColor) {
                this.header.setTextColor(textColor);
                var style = "color:" + textColor + ";",
                    val = cal.showEventDescriptions == false ?
                                    this.header._origContents : event[cal.nameField],
                    html = "<span style='" + style + "'>" + val + "</span>"
                ;
                if (!label) {
                    if (this.header.setContents) this.header.setContents(html);
                } else {
                    label.setTextColor(textColor);
                    label.setContents(html);
                }
            } else {
                this.header.setTextColor(null);
                if (this.isDrawn() && this.header.getStyleHandle()) {
                    this.header.getStyleHandle().color = null;
                }
                if (label) {
                    label.setTextColor(null);
                    if (label.isDrawn() && label.getStyleHandle()) {
                        label.getStyleHandle().color = null;
                    }
                }
            }
            this.markForRedraw();
        }
    },

    getPrintHTML : function (printProperties, callback) {
        var output = isc.StringBuffer.create(),
            cal = this.calendar,
            isTimeline = cal.isTimeline(),
            gridBody = this.parentElement,
            grid = gridBody.grid,
            bodyVOffset = 40 + grid.getHeaderHeight(),
            winTop = this.getTop(),
            bodyTop =  gridBody.getPageTop(),
            top = (winTop) + bodyVOffset + 1,
            widths = gridBody._fieldWidths,
            left = grid.getLeft() + gridBody.getLeft() +
                        (grid.getEventLeft ? grid.getEventLeft(this.event) :
                            cal.getEventLeft(this.event, grid._isWeek)),
            width = this.getVisibleWidth(),
            height = this.getVisibleHeight() - 2,
            i = (printProperties && printProperties.i ? printProperties.i : 1)
        ;

        var startCol = cal.getEventStartCol(this.event, this),
            endCol = cal.getEventEndCol(this.event, this)
        ;

        if (isTimeline) {
            left += (14 + ((startCol-1)*2));
            width += endCol-startCol;
        } else {
            left += grid._isWeek ? 6 : 8;
        }

        var baseStyle = isTimeline ? this.baseStyle : this.body.className;

        output.append("<div class='", baseStyle, "' ",
            "style='border: 1px solid grey; vertical-align: ",
            (cal.showEventDescriptions ? "top" : "middle"), "; ",
            (isTimeline ? "overflow:hidden; " : ""),
            "position: absolute; ",
            "left:", left, "; top:", top, "; width: ", width, "; height: ", height, "; ",
            "z-index:", i+2, ";'>"
        );
        if (cal.showEventDescriptions) {
            output.append(this.title, "<br>", this.event[cal.descriptionField]);
        } else {
            output.append(this.title);
        }
        output.append("</div>");

        //var result = this.Super("getPrintHTML", arguments);
        var result = output.toString();

        return result;
    },

    getHoverHTML : function () {
        return this.calendar.getEventHoverHTML(this.event, this);
    },

    closeClick : function () {
        var cal = this.calendar;
        if (cal.eventRemoveClick(this.event) == false) {
            // one-time flag to avoid general click() handler firing and triggering event
            // editing
            this._hitCloseButton = true;
            return;
        }
        this.Super("closeClick", arguments);
        this.calendar.removeEvent(this.event, true);
        this._closed = true;
    },

    parentResized : function () {
        this.Super('parentResized', arguments);

        this._parentView.sizeEventWindow(this);
        //this.sizeToEvent();
    },

    // get event length in minutes
    getEventLength : function (startDate, endDate) {
        return this.calendar.getEventLength(
            startDate || this.event[this.calendar.startDateField],
            endDate || this.event[this.calendar.endDateField]
        );
    },

    dragRepositionStart : function () {
        // for drag repositioning, calculate the offset (vsnaporigin) by calculating how much is left
        // over when you divide the events top y coordinate by the snapVGap. This is added
        // to the y coordinate calculated in GR.getVSnapPosition
        var snapOrigin = this.getTop() % this.parentElement.snapVGap;
        this.parentElement.VSnapOrigin = snapOrigin;
    },


    dragRepositionStop : function () {
        var cal = this.calendar;

        // store these so we can auto-arrange both source and target locations after the move
        var sStartDate = this.event[cal.startDateField],
            sEndDate = this.event[cal.endDateField];

        this.Super('dragRepositionStop', arguments);
        var EH = this.ns.EH,
            colNum = this.parentElement.getEventColumn(),
            dragTop = Math.max(0, (EH.dragMoveTarget.getTop() - this.parentElement.getPageTop())
                + this.parentElement.getScrollTop()),
            rowHeight = this.parentElement.getRowSize(1),

            rowNum = Math.max(Math.floor(dragTop / rowHeight), 0), //this.parentElement.getEventRow(),
            grid = (this._isWeek ? cal.weekView : cal.dayView);

        if (grid.isLabelCol(colNum) || grid.colDisabled(colNum)) return false;

        var sDate = cal.getCellDate(rowNum, colNum);
        // for cases where the event is dropped between row bounds, get the minutes we need
        // to add to the drop start time. The formula for these minutes:
        // drop position pixels from drop row top * minutes per pixel
        var leftOverMins = Math.floor((dragTop - (rowHeight * rowNum)) * (30 / rowHeight));
        sDate.setMinutes(sDate.getMinutes() + leftOverMins);
        // bulletproof the startDate by calling getValidSnapDate(), which ensures that the start
        // date will be an exact multiple of the eventSnapGap
        sDate = cal.getValidSnapDate(this.event[cal.startDateField], sDate);

        if (!cal.eventMoved(sDate, this.event)) return false;

        var eDate = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate(), sDate.getHours(), sDate.getMinutes());
        eDate.setMinutes(eDate.getMinutes() + this.getEventLength());


        //this._skipResize = true;
        cal.updateEvent(this.event, sDate, eDate, this.event[cal.nameField],
            this.event[cal.descriptionField], null, true);

        if (cal.eventAutoArrange) {
            // resize, move and render all events touching the START range of this drag-operation
            cal._renderEventRange(this._isWeek, sStartDate, sEndDate, []);
            // shift the dragMoveTarget prior to it being redrawn (for eventAutoArrange)
            EH.dragMoveTarget.setPageRect(this.getPageLeft(), this.getPageTop());
        }

        return false;

    },

    dragResizeStart : function () {
        // for drag resizing, calculate the offset (vsnaporigin) by calculating how much is left
        // over when you divide the events bottom y coordinate by the snapVGap. This is added
        // to the y coordinate calculated in GR.getVSnapPosition
        var snapOrigin = (this.getTop() + this.getVisibleHeight()) % this.parentElement.snapVGap;
        this.parentElement.VSnapOrigin = snapOrigin;


    },

    dragResizeStop : function () {
        var cal = this.calendar;

        // store these so we can auto-arrange both source and target locations after the move
        var sStartDate = this.event[cal.startDateField],
            sEndDate = this.event[cal.endDateField];

        this.Super('dragResizeStop', arguments);

        var EH = this.ns.EH,
            colNum = this.parentElement.getEventColumn(),
            dragBottom = (EH.dragMoveTarget.getTop() - this.parentElement.getPageTop())
                + this.parentElement.getScrollTop() + EH.dragMoveTarget.getVisibleHeight(),
            rowHeight = this.parentElement.getRowSize(1),
            rowNum = Math.floor(dragBottom / rowHeight);

        var eDate = cal.getCellDate(rowNum, colNum);

        // for cases where the event is dropped between row bounds, get the minutes we need
        // to add to the drop start time. The formula for these minutes:
        // drop position pixels from drop row top * minutes per pixel
        var leftOverMins = Math.floor((dragBottom - (rowHeight * rowNum)) * (30 / rowHeight));
        eDate.setMinutes(eDate.getMinutes() + leftOverMins);
        // bulletproof the endDate by calling getValidSnapDate(), which ensures that the end
        // date will be an exact multiple of the eventSnapGap
        eDate = cal.getValidSnapDate(this.event[cal.endDateField], eDate);
        // don't allow smaller than rowHeight events
        if (EH.dragMoveTarget.getVisibleHeight() < rowHeight) return false;

        if (!cal.eventResized(eDate, this.event)) return false;
        //this._skipResize = true;
        cal.updateEvent(this.event, this.event[cal.startDateField], eDate,
                this.event[cal.nameField], this.event[cal.descriptionField], null, true);

        if (cal.eventAutoArrange) {
            // resize, move and render all events touching the START range of this drag-operation
            cal._renderEventRange(this._isWeek, sStartDate, sEndDate, []);
            // shift the dragMoveTarget prior to it being redrawn (for eventAutoArrange)
            EH.dragMoveTarget.setPageRect(this.getPageLeft(), this.getPageTop());
        }

        // let getVSnapOrigin know that dragResize is over
        this._dragResizing = false;

        // return false to prevent bubbling, which results in the action eventWin being resized
        // to it's original (potentially now incorrect) width
        return false;
    }


}); // end eventWindow

// TimelineWindow
isc.ClassFactory.defineClass("TimelineWindow", "EventWindow");

isc.TimelineWindow.addProperties({

    showFooter: false,
    // not sure why minimized:true was set, but it was preventing L,R resize handles from
    // working (as expected), so get rid of it.
    //minimized: true,
    resizeFrom: ["L", "R"],

    dragAppearance: "none",

    initWidget : function () {
        if (this.calendar.showEventWindowHeader == false) {
            this.showBody = false;
            // need to set showTitle to false so that drag reposition works
            this.showTitle = false;
        }

        this.Super("initWidget", arguments);
    },

    draw : function (a, b, c, d) {
        this.invokeSuper(isc.TimelineWindow, "draw", a, b, c, d);
        if (this.calendar.showEventWindowHeader == false) {
             var lbl = isc.Canvas.create({
                    // border: "1px solid red",
                    autoDraw:false,
                    width: "100%",
                    height: 0,
                    top:0,
                    contents: (this.descriptionText ? this.descriptionText : " "),
                    backgroundColor: this.event.backgroundColor,
                    textColor: this.event.textColor
            });
            if (this.body) this.body.addMember(lbl);
            else this.addMember(lbl);
            lbl.setHeight(0);
            lbl.setTop(0);
            this._eventLabel = lbl;
        }
    },

    mouseUp : function () {
        return isc.EH.STOP_BUBBLING;
    },

    click : function () {
        var cal = this.calendar,
            tl = cal.timelineView,
            doDefault = cal.eventClick(this.event, "timeline")
        ;
        if (doDefault) {
            if (!cal.canEditEvent(this.event)) return;
            cal.showEventDialog(this.event);
        } else return isc.EH.STOP_BUBBLING;
    },

    // timelineWindow_checkForOverlap
    checkForOverlap : function (event, startDate, endDate, lane) {
        var  overlapTest = {}, cal = this.calendar;

        overlapTest[cal.startDateField] = startDate.duplicate();
        overlapTest[cal.endDateField] = endDate.duplicate();
        overlapTest[cal.laneNameField] = lane;

        var overlappingEvents = cal.timelineView.findOverlappingEvents(event, overlapTest);
        if (overlappingEvents.length == 0) {
            // return false, meaning no overlap detected
            return false;
        // for now just return if overlapping more than one event
        } else if (overlappingEvents.length > 1) {
            //isc.logWarn("overlap detected:" + overlappingEvents.length);
            return true;
        } else {
            var overlapped = overlappingEvents[0];

            var startField = cal.startDateField, endField = cal.endDateField;
            // case 1: drop event partially overlaps existing event to the left, so try to
            // drop event to the left
            if ((cal.equalDatesOverlap == false ?
                    endDate > overlapped[startField] : endDate >= overlapped[startField])
                    && startDate < overlapped[startField]
                    )
            {
                // set end date to be overlapped event start date, less one minute
                endDate = overlapped[startField].duplicate();

                //endDate.setMinutes(endDate.getMinutes() - 1);
                // put the start date back by however many minutes the event is long
                startDate = endDate.duplicate();
                startDate.setMinutes(startDate.getMinutes() - this.getEventLength());
                //isc.logWarn('left overlap:' + [startDate]);
                return [startDate, endDate];
            // case 2: drop event partially overlaps existing event to the right, so try to
            // drop event to the right
            } else if ((cal.equalDatesOverlap == false ?
                    startDate < overlapped[endField] : startDate <= overlapped[endField])
                    && endDate > overlapped[endField]
                    )
            {
                // set start date to be overlapped event end date, plus one minute
                startDate = overlapped[endField].duplicate();
                //startDate.setMinutes(startDate.getMinutes() + 1);
                // put the start date back by however many minutes the event is long
                endDate = startDate.duplicate();
                endDate.setMinutes(endDate.getMinutes() + this.getEventLength());
                //isc.logWarn('right overlap:' + [overlapped.id, overlapped.end, startDate, endDate]);
                return [startDate, endDate];
            // other cases: for now don't allow drops where drop event completely encopasses
            // or is encompassed by another event
            } else {
                return true;
            }

        }
    },

    destroyLines : function () {
        if (this._lines) {
            if (this._lines[0]) this._lines[0].destroy();
            if (this._lines[1]) this._lines[1].destroy();
            if (this._lines[2]) this._lines[2].destroy();
            if (this._lines[3]) this._lines[3].destroy();
        }
    },

    hideLines : function () {
        if (this._lines) {
            if (this._lines[0]) this._lines[0].hide();
            if (this._lines[1]) this._lines[1].hide();
            if (this._lines[2]) this._lines[2].hide();
            if (this._lines[3]) this._lines[3].hide();
        }
    },

    showLines : function () {
        if (this._lines) {
            if (this._lines[0]) this._lines[0].show();
            if (this._lines[1]) this._lines[1].show();
            if (this._lines[2]) this._lines[2].show();
            if (this._lines[3]) this._lines[3].show();
        }
    },

    hide : function () {
        this.invokeSuper(isc.TimelineWindow, "hide");
        this.hideLines();
    },

    show : function () {
        this.invokeSuper(isc.TimelineWindow, "show");
        this.updateColors();
        this.showLines();
    },

    parentResized : function () {
        // skip EventWindow implementation of parentResized. We shouldn't need to resize
        // all eventWindows for this view.
        this.invokeSuper(isc.EventWindow, "parentResized");
        //this.Super('parentResized', arguments);
        //this._parentView.sizeEventWindow(this);

    },

    mouseDown : function () {
        if (this.dragTarget) this.dragTarget.eventWin = this;
    }


}); // end TimelineWindow

// TimelineView
//---------------------------------------------------------------------------------------------
isc.ClassFactory.defineClass("TimelineView", "ListGrid");

isc.TimelineView.changeDefaults("bodyProperties", {
    childrenSnapToGrid: true,

    snapToCells: false,
    suppressVSnapOffset: true
});

isc.TimelineView.addProperties({
    canSort: false,
    canResizeFields: false,
    canAutoFitFields: false,
    canReorderFields: false,
    showHeaderContextMenu: false,
    showAllRecords: true,
    alternateRecordStyles: false,
    showRollOver:true,
    useCellRollOvers:true,
    canSelectCells:true,

    laneNameField: "lane",
    columnWidth: 60,
    laneHeight: 60,

    labelColumnWidth: 75,
    labelColumnBaseStyle: "labelColumn",

    eventPageSize: 30,
    trailIconSize: 16,
    leadIconSize: 16,
    scrollToToday: false,//5,

    lineImage: "[SKINIMG]Stretchbar/hsplit_over_stretch.gif",
    trailingEndPointImage: "[SKINIMG]actions/prev.png",
    leadingEndPointImage: "[SKINIMG]actions/next.png",

    headerSpanHeight: 24,


    headerProperties: {
        inherentWidth:false
    },

    timelineDragTargetDefaults: {
        _constructor: "Canvas",
        border: "1px dashed red",
        width:1, height: 1,
        dragAppearance: "target",
        dragTarget: this,
        visibility: "hidden",
        keepInParentRect: true,
        positionToEventWin : function (show) {
            var eventWin = this.eventWin,
                cal = eventWin.calendar,
                left = cal.timelineView.getEventLeft(eventWin.event) + cal.timelineEventPadding,
                top = eventWin.getTop(),
                width = eventWin.getVisibleWidth(),
                height = eventWin.getVisibleHeight()
            ;
            this.moveTo(left, top);
            this.resizeTo(width, height);

            if (show) {
                if (!this.isDrawn()) this.draw();
                this.show();
                this.bringToFront();
            }
        },
        dragRepositionStart : function () {
            var eventWin = this.eventWin,
                cal = eventWin.calendar,
                gr = eventWin.parentElement,
                eventRow = gr.getEventRow(),
                rowTop = gr.getRowTop(eventRow),
                eventLeft = cal.timelineView.getEventLeft(eventWin.event),
                eventCol = gr.getEventColumn(eventLeft),
                offsetX = gr.getOffsetX() - eventWin.getLeft()
            ;

            eventWin._startRow = eventRow;
            eventWin._eventRowDelta = eventWin.getTop() - rowTop ;
            eventWin._startCol = eventCol;
            eventWin._currentRow = eventRow;
            eventWin._startOffsetX = offsetX;
            eventWin._startWidth = eventWin.getVisibleWidth();
            this.positionToEventWin(true);
            return isc.EH.STOP_BUBBLING;
        },
        dragRepositionMove : function () {
            var eventWin = this.eventWin,
                cal = eventWin.calendar,
                tl = cal.timelineView,
                grid = eventWin.parentElement,
                eventRow = grid.getEventRow(),
                eventCol = grid.getEventColumn() ,
                columnLeft = grid.getColumnLeft(eventCol)
            ;

            var offsetX = (tl.body.getOffsetX() - eventWin._startOffsetX),
                tempLeft = offsetX - ((offsetX - columnLeft) % cal.eventSnapGap),
                rowTop = grid.getRowTop(eventRow),
                snapTop = (grid.getTop() + rowTop + eventWin._eventRowDelta),
                date = tl.getDateFromPoint(tempLeft),
                eventLeft = tl.getDateLeftOffset(date) + cal.timelineEventPadding,
                eventRight = eventLeft + eventWin.getVisibleWidth()
            ;

            var rightColNum = grid.getEventColumn(eventRight);

            if (rightColNum < 0) {
                this.moveTo(eventWin._previousLeft, snapTop);
                return isc.EH.STOP_BUBBLING;
            }

            if (eventRow != eventWin._currentRow) {
                if (cal.canEditLane == false) {
                    eventRow = eventWin._currentRow;
                } else {
                    eventWin._currentRow = eventRow;
                }
            }
            if (eventCol != eventWin._currentCol) {
                eventWin._currentCol = eventCol;
            }

            eventWin._previousLeft = eventLeft;
            this.moveTo(eventLeft, snapTop);
            return isc.EH.STOP_BUBBLING;
        },
        dragRepositionStop : function () {
            // need to do this here, else previous setting of HSnapOrigin destroys dragResize
            // correct functionality. (see dragRepositionStart())
            var eventWin = this.eventWin,
                cal = eventWin.calendar,
                grid = cal.timelineView,
                event = eventWin.event
            ;

            eventWin.parentElement.HSnapOrigin = 0;
            //var currRow = eventWin.parentElement.getEventRow(), newLane;
            var currRow = (cal.canEditLane ? grid.getEventRow() : eventWin._currentRow),
                newLane;

            if (currRow != eventWin._startRow && currRow >= 0) {
                if (cal.canEditLane) {
                    var currLaneRec = cal.lanes.get(currRow);
                    newLane = currLaneRec.name || currLaneRec[cal.laneNameField];
                } else {
                    eventWin.showLines();
                    return false;
                }
            }

            if (newLane) event[cal.laneNameField] = newLane;

            var dates = [ event[cal.startDateField].duplicate(), event[cal.endDateField].duplicate()];
            if (event[cal.leadingDateField] && event[cal.trailingDateField]) {
                dates.add(event[cal.leadingDateField].duplicate());
                dates.add(event[cal.trailingDateField].duplicate());
            }

            // step 1 find initial drop dates
            // augment (or decrement if diff is negative) each date by the difference between
            // the drag start date and the drag end date
            var EH = eventWin.ns.EH;
            // convert dragLeft into local coords by calculating an offset based on eventWindow
            // pageLeft - left.
            //var leftOffset = eventWin.getPageLeft() - eventWin.getLeft();
            //var leftOffset = eventWin.dragTarget.getPageLeft() - eventWin.dragTarget.getLeft();
            //var dragLeft = EH.dragMoveTarget.getLeft() - leftOffset;

            var dragLeft = EH.dragMoveTarget.getLeft() - cal.timelineEventPadding;
            // convert dragTracker left to a date
            var sDate = cal.timelineView.getDateFromPoint(dragLeft);
            var eDate = sDate.duplicate();
            // get enddate
            eDate.setMinutes(eDate.getMinutes() + eventWin.getEventLength());
            dates[0] = sDate;
            dates[1] = eDate;
            // minsDiff = difference in minutes between new start date and old start date
            var minsDiff = Math.floor((sDate.getTime() - event[cal.startDateField].getTime()) / (1000 * 60));
            // adjust leading and trailing dates by minsDiff amount of minutes.
            // if event dragged behind itself, minsDiff will be negative.
            if (event[cal.leadingDateField]) dates[2].setMinutes(dates[2].getMinutes() + minsDiff);
            if (event[cal.trailingDateField]) dates[3].setMinutes(dates[3].getMinutes() + minsDiff);

            var otherFields = {}
            if (newLane) otherFields[cal.laneNameField] = newLane;
            if (event[cal.leadingDateField] && event[cal.trailingDateField]) {
                otherFields[cal.leadingDateField] = dates[2];
                otherFields[cal.trailingDateField] = dates[3];
            }
            if (newLane == null) newLane = event[cal.laneNameField];
            // step 2 adjust initial drop dates, via overridden method
            if (cal.adjustEventTimes) {
                var adjustedTimes = cal.adjustEventTimes(event, eventWin, dates[0], dates[1], newLane);
                if (adjustedTimes) {
                    dates[0] = adjustedTimes[0].duplicate();
                    dates[1] = adjustedTimes[1].duplicate();
                }
            }


            var repositionedDates = eventWin.checkForOverlap(event, dates[0], dates[1], newLane);

            // if this event was previously overlapped, and it isn't now, reset it's slotNum
            if (event._overlapProps && event._overlapProps.slotNum > 0 && repositionedDates != true)  {
                event._overlapProps.slotNum = null;
            }

            // step 3 adjust modified drop dates so no overlapping occurs
            if (cal.allowEventOverlap == false) {
                if (repositionedDates == true) {
                    // event overlaps in such a way that dropping anywhere near this location would
                    // be impossible
                    if (cal.timelineEventOverlap) {
                        cal.timelineEventOverlap(false, event, eventWin, dates[0], dates[1], newLane);
                    }
                    return false;
                } else if (isc.isAn.Array(repositionedDates)){
                   dates[0] = repositionedDates[0].duplicate();
                   dates[1] = repositionedDates[1].duplicate();
                   if (cal.timelineEventOverlap) {
                       cal.timelineEventOverlap(true, event, eventWin, dates[0], dates[1], newLane);
                   }

                }
                // otherwise don't do anything, as no overlap occurred
            }

            // hide the manual dragTarget before calling the cancellable timelineEventMoved()
            this.hide();

            // step 4 fire timelineEventMoved notification to allow drop cancellation
            if (!cal.timelineEventMoved(event, dates[0], dates[1], newLane)) return false;

            // finally update event
            //isc.logWarn('updating event:' + [dates[0], dates[1]]);
            cal.updateEvent(event, dates[0], dates[1], event[cal.nameField],
                event[cal.descriptionField], otherFields, true);

            // no need to showLines() here...the callback in updateEvent will call
            // this.updateEventWindow() which will take care of that
            //this.calendar.timelineView.addLeadingAndTrailingLines(this);


            //return false;
            return isc.EH.STOP_BUBBLING;
        },

        // timelineDragTarget_dragResizeStart
        dragResizeStart : function () {
            // for drag resizing, calculate the offset (vsnaporigin) by calculating how much is left
            // over when you divide the events bottom y coordinate by the snapVGap. This is added
            // to the y coordinate calculated in GR.getVSnapPosition
            //var snapOrigin = (this.getTop() + this.getVisibleHeight()) % this.parentElement.snapVGap;
            //this.parentElement.VSnapOrigin = snapOrigin;

            var eventWin = this.eventWin,
                cal = eventWin.calendar,
                gr = eventWin.parentElement,
                eventRow = gr.getEventRow(),
                rowTop = gr.getRowTop(eventRow),
                eventLeft = cal.timelineView.getEventLeft(eventWin.event),
                eventCol = gr.getEventColumn(), //eventLeft),
                offsetX = gr.getOffsetX() - eventWin.getLeft() - cal.timelineEventPadding,
                eventWidth = eventWin.getVisibleWidth()
            ;

            eventWin._startRow = eventRow;
            eventWin._startCol = eventCol;
            eventWin._currentRow = eventRow;
            eventWin._startOffsetX = offsetX;
            eventWin._endOffsetX = offsetX + eventWidth;
            eventWin._previousLeft = offsetX;
            eventWin._previousRight = offsetX + eventWidth;
            eventWin._leftDrag = (offsetX < 5);
            eventWin._startWidth = eventWidth;
            this.positionToEventWin(true);
            return isc.EH.STOP_BUBBLING;

        },


        dragResizeMove : function () {
            var eventWin = this.eventWin,
                cal = eventWin.calendar,
                tl = cal.timelineView,
                grid = eventWin.parentElement,
                offsetX = tl.body.getOffsetX(),
                eventRow = grid.getEventRow(),
                eventCol = grid.getEventColumn() ,
                columnLeft = grid.getColumnLeft(eventCol)
            ;

            if ((offsetX - columnLeft) % cal.eventSnapGap != 0) return isc.EH.STOP_BUBBLING;
        },

        // timelineWindow_dragResizeStop
        dragResizeStop : function () {
            var eventWin = this.eventWin,
                cal = eventWin.calendar,
                event = eventWin.event,
                // store these so we can auto-arrange both source and target locations after the move
                startDate,
                endDate,
                EH = this.ns.EH,
                colNum,
                // convert dragLeft into local coords by calculating an offset based on eventWindow
                // pageLeft - left.
                //leftOffset = this.getPageLeft() - this.getLeft(),
                //dragLeft = EH.dragMoveTarget.getLeft() - leftOffset
                dragLeft = EH.dragMoveTarget.getLeft()
            ;

            var ewLeft = this.eventWin.getLeft();
            if ([ewLeft, ewLeft+1].contains(dragLeft)) { // right side dragged
                startDate = event[cal.startDateField].duplicate();
                var dragRight = (dragLeft + EH.dragMoveTarget.getVisibleWidth());
                endDate = cal.timelineView.getDateFromPoint(dragRight);
                // special case: when sizing to grid on a right drag, take a columns length off the
                // end date, as getDateFromPoint() handles the border case as being on the next
                // day, which is fine for the start date but not for the end date
                //if (cal.sizeEventsToGrid) {
                //    var minsInACol = cal.timelineView._getMinsInACell();
                //    endDate.setMinutes(endDate.getMinutes() - minsInACol);
                //}
            } else { // left side dragged
                startDate = cal.timelineView.getDateFromPoint(dragLeft);
                endDate = event[cal.endDateField].duplicate();
            }

            // hide the manual dragTarget before calling the cancellable timelineEventResized()
            this.hide();

            // Added undoc'd endDate param - is necessary for Timeline items because they can be
            // stretched or shrunk from either end
            if (!cal.timelineEventResized(event, startDate, endDate)) return false;

            //this._skipResize = true;
            //isc.logWarn('dragResizeStop:' + [startDate, endDate]);
            cal.updateEvent(event, startDate, endDate,
                    event[cal.nameField], event[cal.descriptionField], null, true);
        }
        //,
        //snapToGrid: true,
        //visiblility: "hidden"
    },

    initWidget : function () {
        this.fields = [];

        var c = this.creator;

        this.addProperties(c.gridProps)

        if (c.alternateLaneStyles) {
            this.alternateRecordStyles = c.alternateLaneStyles;
        }

        if (c.canReorderLanes) {
            this.canReorderRecords = c.canReorderLanes;
        }

        this.firstDayOfWeek = this.creator.firstDayOfWeek;

        if (c.laneNameField) this.laneNameField = c.laneNameField;
        if (c.renderEventsOnDemand) this.renderEventsOnDemand = c.renderEventsOnDemand;
        if (c.startDate) this.startDate = c.startDate.duplicate();
        if (c.endDate) this.endDate = c.endDate.duplicate();

        // the default widths of laneFields in this timeline
        if (c.labelColumnWidth && c.labelColumnWidth != this.labelColumnWidth) {
            this.labelColumnWidth = c.labelColumnWidth;
        }
        // adds some space around and between events
        if (c.timelineEventPadding != null) this.timelineEventPadding = c.timelineEventPadding;
        if (c.eventDragGap != null) this.eventDragGap = c.eventDragGap;

        if (c.headerLevels) this.headerLevels = isc.shallowClone(c.headerLevels);

        this._headerHeight = this.headerHeight;
        this.cellHeight = this.laneHeight;

        var gran = c.timelineGranularity,
            granString = isc.DateUtil.getTimeUnitKey(gran)
        ;

        if (!this.startDate) {
            this.startDate = c.startDate = isc.DateUtil.getAbsoluteDate("-0" + granString, c.chosenDate);
        }

        if (!this.endDate) {
            // no endDate - default to defaultTimelineColumnSpan columns of timelineGranularity
            this.endDate = c.endDate = isc.DateUtil.getAbsoluteDate("+" +
                    c.defaultTimelineColumnSpan + granString, this.startDate);
        } else if (isc.Date.compareDates(this.startDate, this.endDate) == -1) {
            // startDate is larger than endDate - log a warning and switch the dates
            var s = this.startDate;
            this.startDate = c.startDate = this.endDate;
            this.endDate = c.endDate = s;
            this.logWarn("Timeline startDate is later than endDate - switching the values.");
        }

        this.Super("initWidget");

        this.rebuild();

        this.addAutoChild("timelineDragTarget");
    },

    cellMouseDown : function (record, rowNum, colNum) {
        if (this.isLabelCol(colNum)) return true;

        var offsetX = this.body.getOffsetX();
        var startDate = this.getDateFromPoint(offsetX, null, true);

        // if backgroundMouseDown is implemented, run it and return if it returns false
        if (this.creator.backgroundMouseDown && this.creator.backgroundMouseDown(startDate) == false) return;

        // don't set up selection tracking if canCreateEvents is disabled
        if (!this.creator.canCreateEvents) return true;
        // first clear any previous selection
        this.clearSelection();

        // don't allow selection if the day is a weekend and weekends are disabled
        if (this.creator.disableWeekends && !this.creator.dateIsWorkday(startDate)) {
            return true;
        }

        this._selectionTracker = {};
        this._selectionTracker.rowNum = rowNum;
        this._selectionTracker.startColNum = colNum-1;
        this._selectionTracker.endColNum = colNum-1;
        this._selectionTracker.startDate = startDate;
        this._selectionTracker.startOffsetX = offsetX;
        this._mouseDown = true;
        this.refreshCellStyle(rowNum, colNum-1);
    },

    cellOver : function (record, rowNum, colNum) {
        colNum -=1;
        if (this._mouseDown && this._selectionTracker) {
            var refreshColNum;
            // selecting southbound
            if (this._selectionTracker.startColNum < this._selectionTracker.endColNum) {
                // should select this cell
                if (colNum > this._selectionTracker.endColNum) {
                    refreshColNum = colNum;
                } else { // should deselect the previous end Col number
                    refreshColNum = this._selectionTracker.endColNum;
                }
                // trigger cell style update from getCellStyle
                this._selectionTracker.endColNum = colNum;
            // selecting northbound
            } else {
                // should select this cell
                if (colNum < this._selectionTracker.endColNum) {
                    refreshColNum = colNum;
                } else { // should deselect the previous end Col number
                    refreshColNum = this._selectionTracker.endColNum;
                }
                this._selectionTracker.endColNum = colNum;
            }
            var refreshGap = 1;
            var rowNum = this._selectionTracker.rowNum;
            //var colNum = this._selectionTracker.colNum;
            for (var i = refreshColNum - refreshGap; i < refreshColNum + refreshGap; i++) {
                this.refreshCellStyle(rowNum, i);
            }
        }
    },

    cellMouseUp : function (record, rowNum, colNum) {
        if (!this._selectionTracker) return true;

        var cal = this.creator;

        var offsetX = this.body.getOffsetX();
        if (offsetX - this._selectionTracker.startOffsetX < cal.eventSnapGap) {
            offsetX = this._selectionTracker.startOffsetX + this.columnWidth;
        }
        this._selectionTracker.endDate = this.getDateFromPoint(offsetX, null, true);

        this._mouseDown = false;
        var sCol, eCol, diff;
        // cells selected upwards
        if (this._selectionTracker.startColNum > this._selectionTracker.endColNum) {
            sCol = this._selectionTracker.endColNum;
            eCol = this._selectionTracker.startColNum;
        // cells selected downwards
        } else {
            eCol = this._selectionTracker.endColNum;
            sCol = this._selectionTracker.startColNum;
        }
        diff = eCol - sCol + 1;

        var startDate = this._selectionTracker.startDate || this.creator.getCellDate(rowNum, sCol);
        var endDate = this._selectionTracker.endDate || this.creator.getCellDate(rowNum, sCol+diff);

        // if backgroundClick is implemented, run it and return if it returns false
        if (diff == 1 && this.creator.backgroundClick) {
            if (this.creator.backgroundClick(startDate, endDate) == false) {
                this.clearSelection();
                return;
            }
        }

        // if backgroundMouseUp is implemented, run it and bail if it returns false
        if (this.creator.backgroundMouseUp) {
            if (this.creator.backgroundMouseUp(startDate, endDate) == false) {
                this.clearSelection();
                return;
            }
        }

        var newEvent = {};
        newEvent[cal.startDateField] = startDate;
        newEvent[cal.endDateField] = endDate;
        newEvent[cal.laneNameField] = this.data.get(rowNum)["name"];
        this.creator.showNewEventDialog(newEvent);
    },

    clearSelection : function () {
        if (this._selectionTracker) {
            var sCol, eCol, rowNum = this._selectionTracker.rowNum;
            // establish order of cell refresh
            if (this._selectionTracker.startColNum < this._selectionTracker.endColNum) {
                sCol = this._selectionTracker.startColNum;
                eCol = this._selectionTracker.endColNum;
            } else {
                sCol = this._selectionTracker.endColNum;
                eCol = this._selectionTracker.startColNum;
            }
            // remove selection tracker so cells get reset to baseStyle
            this._selectionTracker = null;
            for (var i = sCol; i < eCol + 1; i++) {
                this.refreshCellStyle(rowNum, i);
            }
        }
    },

    recordDrop : function (dropRecords, targetRecord, index, sourceWidget) {
        this.Super("recordDrop", arguments);
        this._refreshData();
        this.markForRedraw();
    },

    rebuild : function (refreshData) {
        var fields = this.calcFields();

        if (this.isDrawn()) this.setFields(fields);
        else this.fields = fields;

        var lanes = this.lanes || this.creator.lanes || [];
        this.setLanes(lanes.duplicate());
        this._scrubDateRange();

        if (refreshData) {
            this._refreshData();
        }
    },

    _refreshData : function () {
        //isc.logWarn("nextOrPrev:" + this.creator.data.willFetchData(this.creator.getNewCriteria()));
        if (this.creator.dataSource && isc.ResultSet && isc.isA.ResultSet(this.creator.data)) {
            this.creator.data.invalidateCache();
            this.creator.filterData(this.creator.getNewCriteria());
        } else {
            // force dataChanged hooks to fire so event positions are correctly updated
            this.creator.dataChanged();
        }
    },

    setLanes : function (lanes) {
        this.lanes = lanes;
        this.setData(lanes);
        // refetch or just redraw applicable events (setLanes() may have been called after setData)
        this._refreshData();
    },

    _scrubDateRange : function () {
        var gran = this.creator.timelineGranularity;
        if (gran == "month") {
            this.startDate.setDate(1);
        } else if (gran == "week") {
            this.startDate = isc.DateUtil.getStartOf(this.startDate, "w", true);
        } else if (gran == "day") {
            this.startDate.setHours(0);
            this.startDate.setMinutes(0);
            this.startDate.setSeconds(0);
            this.startDate.setMilliseconds(0);
        } else if (gran == "hour") {
            this.startDate.setMinutes(0);
            this.startDate.setSeconds(0);
            this.startDate.setMilliseconds(0);
        } else if (gran == "minute") {
            this.startDate.setSeconds(0);
            this.startDate.setMilliseconds(0);
        }
    },

    // make sure link between lanes and this.data is maintained
    //setData : function (newData) {
    //     this.creator.lanes = newData;
    //     this.invokeSuper(isc.TimelineView, "setData", newData);
    //},
    scrollTimelineTo : function (pos) {
        this.bodies[1].scrollTo(pos);
    },

    setLaneHeight : function (newHeight) {
        this.laneHeight = newHeight;
        this.setCellHeight(newHeight);
        this.refreshEvents();
    },

    getRowHeight : function (record, rowNum) {
        return record.height || this.Super("getRowHeight", arguments);
    },

    setInnerColumnWidth : function (newWidth) {
        this.columnWidth = newWidth;
        this.setFields(this.calcFields());
        this.refreshEvents();
    },

    setTimelineRange : function (start, end, timelineGranularity, timelineUnitsPerColumn, fromSetChosenDate) {
        var colSpan = this._dateFieldCount || c.defaultTimelineColumnSpan;

        this.startDate = start.duplicate();
        this.creator.startDate = start.duplicate();

        if (end) {
            this.endDate = end.duplicate();
        } else {
            var c = this.creator,
                gran = (timelineGranularity || c.timelineGranularity).toLowerCase(),
                granString = isc.DateUtil.getTimeUnitKey(gran)
            ;
            this.endDate = isc.DateUtil.getAbsoluteDate("+" +
                    colSpan + granString, this.startDate);
        }
        this.creator.endDate = this.endDate.duplicate();

        if (timelineGranularity) this.creator.timelineGranularity = timelineGranularity;
        if (timelineUnitsPerColumn) this.creator.timelineUnitsPerColumn = timelineUnitsPerColumn;

        //isc.logWarn('setTimelineRange:' + [timelineGranularity, timelineUnitsPerColumn,
        //        this.creator.timelineGranularity, this.creator.timelineUnitsPerColumn]);
        this.creator.dateChooser.setData(this.startDate);
        if (!fromSetChosenDate) this.creator.setChosenDate(this.startDate, true);
        this.creator.setDateLabel();
        this.rebuild();
    },

    addUnits : function (date, units, granularity) {
        granularity = granularity || this.creator.timelineGranularity;
        if (granularity == "century") {
            date.setFullYear(date.getFullYear() + (units * 100));
        } else if (granularity == "decade") {
            date.setFullYear(date.getFullYear() + (units * 10));
        } else if (granularity == "year") {
            date.setFullYear(date.getFullYear() + units);
        } else if (granularity == "quarter") {
            date.setMonth(date.getMonth() + (units * 3));
        } else if (granularity == "month") {
            date.setMonth(date.getMonth() + units);
        } else if (granularity == "week") {
            date.setDate(date.getDate() + (units * 7));
        } else if (granularity == "day") {
            date.setDate(date.getDate() + units);
        } else if (granularity == "hour") {
            date.setHours(date.getHours() + units);
        } else if (granularity == "minute") {
            date.setMinutes(date.getMinutes() + units);
        } else if (granularity == "second") {
            date.setSeconds(date.getSeconds() + units);
        } else if (granularity == "millisecond") {
            date.setMilliseconds(date.getMilliseconds() + units);
        }
        return date;
    },
    getTimelineEventLeft : function (event) {
        var colNum = this.getTimelineEventColNum(event);
        return this.getColumnLeft(colNum);
    },
    getTimelineEventColNum : function (event) {
        var fields = this.getFields(),
            startDate = event[this.creator.startDateField]
        ;

        for (var i=0; i<fields.length; i++) {
            var field = fields[i];
            if (field.date && field.date > startDate) {
                return i-1;
            }
        }
        return null;
    },
    getTimelineEventTop : function (event) {
        var rowNum = this.getTimelineEventRowNum(event);
        return this.getRowTop(rowNum);
    },
    getTimelineEventRowNum : function (event) {
        var row = this.data.find("name", event[this.creator.laneNameField]);
        if (!row) row = this.data.find(this.creator.laneNameField, event[this.creator.laneNameField]);
        return this.getRecordIndex(row);
    },

    calcFields : function () {
        var newFields = [],
            c = this.creator
        ;

        if (this.creator.laneFields) {
            var laneFields = this.creator.laneFields;
            laneFields.setProperty("frozen", true);
            laneFields.setProperty("isLaneField", true);
            for (var i = 0; i < laneFields.length; i++) {
                if (laneFields[i].width == null) laneFields[i].width = this.labelColumnWidth;
                newFields.add(laneFields[i]);
            }
        } else {
            var labelCol = {
                 width: this.labelColumnWidth,
                 name: "title",
                 title: " ",
                 showTitle: false,
                 frozen: true,
                 isLaneField: true
             }
             newFields.add(labelCol);
        }

        if (!c.headerLevels && !this.headerLevels) {
            c.headerLevels = [ { unit: c.timelineGranularity } ];
        }

        if (c.headerLevels) {
            this.headerLevels = isc.shallowClone(c.headerLevels);
        }

        if (this.headerLevels) {
            // we have some header-levels - the innermost level is going to be stripped and its
            // "unit" and "titles" array used for field-headers (unit becomes
            // calendar.timelineGranularity - they should already be the same)
            this.fieldHeaderLevel = this.headerLevels[this.headerLevels.length-1];
            this.headerLevels.remove(this.fieldHeaderLevel);
            c.timelineGranularity = this.fieldHeaderLevel.unit;
        }


        this.adjustTimelineForHeaders();

        // add date columns to fields
        var sDate = this.startDate.duplicate(),
            eDate = this.endDate.duplicate(),
            units = c.timelineUnitsPerColumn,
            spanIndex = 0,
            headerLevel = this.fieldHeaderLevel,
            titles = headerLevel && headerLevel.titles ? headerLevel.titles : []
        ;

        if (headerLevel.headerWidth) this.columnWidth = headerLevel.headerWidth;

        while (sDate.getTime() <= eDate.getTime()) {
            var newField = {},
                title = this.getInnerFieldTitle(headerLevel, spanIndex, sDate)
            ;

            newField = isc.addProperties(newField, {
                name: "f" + spanIndex,
                title: title,
                width: headerLevel.headerWidth || this.columnWidth,
                date: sDate.duplicate()
            }, this.getFieldProperties(sDate));
            newFields.add(newField);

            sDate = this.addUnits(sDate, units);
            spanIndex++;
        }

        this.buildHeaderSpans(newFields, this.headerLevels, this.startDate, this.endDate);

        this._dateFieldCount = spanIndex-1;

        return newFields;
    },

    adjustTimelineForHeaders : function () {
        // if we weren't
        var cal = this.creator,
            unit = this.fieldHeaderLevel ? this.fieldHeaderLevel.unit : cal.timelineGranularity,
            start = cal.startDate,
            end = cal.endDate
        ;

        // we have at least one header - make sure we start and end the timeline
        // at the beginning and end of the innerLevel's unit-type (the actual field-headers,
        // that is)
        var key = isc.DateUtil.getTimeUnitKey(unit);

        cal.startDate = this.startDate = isc.DateUtil.getStartOf(start, key);
        cal.endDate = this.endDate = isc.DateUtil.getEndOf(end, key);
    },

    buildHeaderSpans : function (fields, levels, startDate, endDate) {
        var date = startDate.duplicate(),
            c = this.creator,
            result = []
        ;

        if (levels && levels.length > 0) {
            var spans = this.getHeaderSpans(startDate, endDate, levels, 0, fields);
            this.headerHeight = this._headerHeight + this.headerSpanHeight;
       }

        if (spans && spans.length > 0) this.headerSpans = spans;
    },

    getHeaderSpans : function (startDate, endDate, headerLevels, levelIndex, fields) {
        var date = startDate.duplicate(),
            c = this.creator,
            headerLevel = headerLevels[levelIndex],
            unit = headerLevel.unit,
            lastUnit = levelIndex > 0 ? headerLevels[levelIndex-1].unit : unit,
            unitsPerColumn = c.timelineUnitsPerColumn,
            titles = headerLevel.titles || [],
            result = [],
            spanIndex = 0
        ;

        if (levelIndex > 0) {
            if (isc.DateUtil.compareTimeUnits(unit, lastUnit) > 0) {
                // the unit on this level is larger than on it's parent-level - warn
                isc.logWarn("The order of the specified HeaderLevels is incorrect - '" + unit +
                    "' is of a larger granularity than '" + lastUnit + "'");
            }
        }

        var DU = isc.DateUtil;

        while (date <= endDate) {
            DU.dateAdd(date, "mn", 1, 1);
            var newDate = this.addUnits(date.duplicate(), unitsPerColumn, unit);

            var span = { unit: unit, startDate: date, endDate: newDate, fields: [] };

            this.setSpanDates(span, date);

            newDate = span.endDate;

            var title = this.getHeaderLevelTitle(headerLevel, spanIndex, date, newDate);

            span.title = title;

            // this condition should be re-introduced once LG supports multiple-headers where
            // only the inner-most spans require a fields array
            //if (levelIndex == headerLevels.length-1) {
                for (var i=0; i<fields.length; i++) {
                    var field = fields[i];
                    if (field.isLaneField || field.date < span.startDate) continue;
                    if (field.date >= span.endDate) break;
                    span.fields.add(field.name);
                }
            //}

            if (levelIndex < headerLevels.length-1) {
                span.spans = this.getHeaderSpans(span.startDate, span.endDate, headerLevels, levelIndex + 1, fields);
                if (headerLevel.titles && headerLevel.titles.length != span.spans.length) {
                    // fewer titles were supplied than we have spans - log a warning about it
                    // but don't bail because we'll auto-generate titles for any spans that
                    // don't have one in the supplied title-array
                    isc.logWarn("The titles array provided for the " + headerLevel.unit +
                        " levelHeader has a length mismatch: expected " + span.spans.length +
                        " but " + headerLevel.titles.length + " are present.  Some titles " +
                        " may be auto-generated according to TimeUnit."
                    );
                }
            }

            result.add(isc.clone(span));
            date = newDate.duplicate();
            spanIndex++;
        }

        return result;
    },

    getHeaderLevelTitle : function (headerLevel, spanIndex, startDate, endDate) {
        var unit = headerLevel.unit,
            title = headerLevel.titles ? headerLevel.titles[spanIndex] : null
        ;
        if (!title) {
            // only generate a default value and call the titleFormatter if there was no
            // entry for this particular span in headerLevels.titles
            if (unit == "century" || unit == "decade") {
                title = startDate.getFullYear() + " - " + endDate.getFullYear();
            } else if (unit == "year") {
                title = startDate.getFullYear();
            } else if (unit == "quarter") {
                title = startDate.getShortMonthName() + " - " + endDate.getShortMonthName();
            } else if (unit == "month") {
                title = startDate.getShortMonthName();
            } else if (unit == "week") {
                title = this.creator.weekPrefix + " " + endDate.getWeek(this.firstDayOfWeek);
            } else if (unit == "day") {
                title = startDate.getShortDayName();
            } else {
                if (unit == "hour") title = startDate.getHours();
                if (unit == "minute") title = startDate.getMinutes();
                if (unit == "second") title = startDate.getSeconds();
                if (unit == "millisecond") title = startDate.getMilliseconds();
                if (unit == "hour") title = startDate.getHours();
            }
            if (isc.isA.Function(headerLevel.titleFormatter)) {
                title = headerLevel.titleFormatter(headerLevel, startDate, endDate, title, this.creator);
            }
        }
        return title;

    },

    setSpanDates : function (span, date) {
        var key = isc.DateUtil.getTimeUnitKey(span.unit);

        span.startDate = isc.DateUtil.getStartOf(date, key, null, this.firstDayOfWeek);
        span.endDate = isc.DateUtil.getEndOf(span.startDate, key, null, this.firstDayOfWeek);
    },

    getFieldProperties : function (date) {
        return null;
    },
    getInnerFieldTitle : function (headerLevel, spanIndex, startDate, endDate) {
        var granularity = headerLevel.unit,
            result = headerLevel.titles ? headerLevel.titles[spanIndex] : null
        ;
        if (!result) {
            // only generate a default value and call the titleFormatter if there was no
            // entry for this particular span in headerLevels.titles
            if (granularity == "year") {
                result = startDate.getFullYear();
            } else if (granularity == "month") {
                result = startDate.getShortMonthName();
            } else if (granularity == "week") {
                result = this.creator.weekPrefix + startDate.getWeek(this.firstDayOfWeek);
            } else if (granularity == "day") {
                result = (startDate.getMonth() + 1) + "/" + startDate.getDate();
            } else {
                var mins = startDate.getMinutes().toString();
                if (mins.length == 1) mins = "0" + mins;
                result = startDate.getHours() + ":" + mins;
            }
            if (isc.isA.Function(headerLevel.titleFormatter)) {
                result = headerLevel.titleFormatter(headerLevel, startDate, endDate, result, this.creator);
            }
        }

        return result;
    },

    draw : function (a, b, c, d) {
        this.invokeSuper(isc.TimelineView, "draw", a, b, c, d);
        var snapGap = this.creator.eventSnapGap;
        if (snapGap) {
            this.body.snapHGap = Math.round((snapGap / 60) * this.columnWidth);
            //this.body.snapHGap = 5;
        } else {
            this.body.snapHGap = this.columnWidth;
        }

        this.body.snapVGap = this.laneHeight;
        // scroll to today if defined
        if (this.scrollToToday != false) {
            var today = new Date();
            today.setDate(today.getDate() - this.scrollToToday);
            var diff = this.creator.getDayDiff(this.startDate, today);
            var sLeft = diff * this.columnWidth;
            this.bodies[1].scrollTo(sLeft, 0);
        }
        this.logDebug('draw', 'calendar');
        // call refreshEvents() whenever we're drawn
        // see commment above dataChanged for the logic behind this

        this.body.addChild(this.timelineDragTarget);
        this.timelineDragTarget.timelineView = this;

        this.refreshEvents();

    },

    getBaseStyle : function () {
        var result;
        if (this.creator.getDateStyle) result = this.creator.getDateStyle();
        if (!result) result = this.Super("getBaseStyle", arguments);
        return result;
    },

    getCellCSSText : function (record, rowNum, colNum) {
        var result = this.creator._getCellCSSText(this, record, rowNum, colNum);

        if (result) return result;
        return this.Super("getCellCSSText", arguments);
    },

    formatDateForDisplay : function (date) {
        return  date.getShortMonthName() + " " + date.getDate() + ", " + date.getFullYear();
    },

    getLabelColCount : function () {
        if (this.creator.laneFields) {
            return this.creator.laneFields.length;
        } else {
            return 1;
        }
    },

    isLabelCol : function (colNum) {
        if (colNum < this.getLabelColCount()) return true;
        else return false;
    },

    getCellStyle : function (record, rowNum, colNum) {
        var bStyle = this.getBaseStyle(record, rowNum, colNum);

        if (this.isLabelCol(colNum)) return bStyle;

        if (this.alternateRecordStyles && rowNum % 2 != 0) return bStyle + "Dark";

        return bStyle;
    },

    getBaseStyle : function (record, rowNum, colNum) {
        if (this.isLabelCol(colNum)) return this.labelColumnBaseStyle;
        else {
            return this.baseStyle;
        }
    },

    slideRange : function (slideRight) {
        var c = this.creator,
            gran = c.timelineGranularity.toLowerCase(),
            granString = isc.DateUtil.getTimeUnitKey(gran),
            units = c.timelineUnitsPerColumn,
            startDate = this.startDate.duplicate(),
            endDate = this.endDate.duplicate(),
            multiplier = slideRight ? 1 : -1,
            scrollCount = c.columnsPerPage || (this.getFields().length - this.getLabelColCount())
        ;


        startDate = isc.DateUtil.dateAdd(startDate, granString, scrollCount, multiplier, false);
        startDate = isc.DateUtil.getStartOf(startDate, granString, false);
        endDate = isc.DateUtil.dateAdd(endDate, granString, scrollCount, multiplier, false);
        endDate = isc.DateUtil.getEndOf(endDate, granString, false);

        this.setTimelineRange(startDate, endDate, gran, units, false);
    },

    nextOrPrev : function (next) {
        this.slideRange(next);
    },

    refreshEvents : function () {
        // bail if the grid hasn't been drawn yet, or hasn't gotten data yet
        if (!this.body || !this.creator.hasData()) return;
        //this.clearEvents();
        var startDate = this.startDate, endDate = this.endDate, cal = this.creator;

        this.forceDataSort();

        //var events = cal._getEventsInRange(startDate, endDate);
        var events = cal.data.getRange(0, cal.data.getLength());
        this.logDebug('refreshing events','calendar');
     //isc.logWarn('ebtView refreshEvents:' + events.getLength());
        // first figure out who's overlapping who. Could play with moving this logic to
        // refreshVisibleEvents and tagging only visible events on scroll.
        this.tagDataForOverlap(events);

        this.refreshVisibleEvents();
    },

    getVisibleEvents : function () {
        var dateRange = this.getVisibleDateRange();
        var rowRange = this.getVisibleRowRange();
        var cal = this.creator;

        //if (!this.renderEventsOnDemand) return cal.data;
        var events = cal.data;
        var results = [];
        for (var i = 0; i < events.getLength(); i++) {
            var event = events.get(i);
            if (!event) {
                isc.logWarn('getVisibleEvents: potentially invalid index: ' + i);
                break;
            }

            if (isc.Date.compareDates(event[cal.endDateField], this.startDate) >= 0) continue;
            if (isc.Date.compareDates(event[cal.startDateField], this.endDate) <= 0) continue;

            var laneName = event[cal.laneNameField];

            var rangeObj = { laneName: laneName };
            // if we're not showing lead-trail lines use start-endDate fields instead to
            // determine overlap
            if (event[cal.leadingDateField] && event[cal.trailingDateField]) {
                rangeObj[cal.leadingDateField] = dateRange[0];
                rangeObj[cal.trailingDateField] = dateRange[1];
            } else {
                rangeObj[cal.startDateField] = dateRange[0];
                rangeObj[cal.endDateField] = dateRange[1];
            }

            var eventRowIndex = this.data.findIndex("name", laneName);

            if (eventRowIndex < 0) eventRowIndex = this.data.findIndex(cal.laneNameField, laneName);
           // isc.logWarn('eventRowIndex:' + eventRowIndex);
            //if (eventRowIndex == -1) isc.logWarn("null eventRowIndex:" + this.echoFull(event));
            if (this.eventsOverlap(rangeObj, event, (cal.canEditLane == true)) && rowRange[0] <= eventRowIndex
                && eventRowIndex <= rowRange[1]) {
                results.add(event);
            } /*else {
                isc.logWarn('event not added to vis events:' + event.id);
                isc.logWarn('dates:' + [rangeObj.start, rangeObj.end, event.start, event.end]);

            }*/
        }

        return results;
    },

    // realEvent is the actual event object, passed in so that we can exclude
    // it from the overlap tests. paramEvent is an object with date fields  - the final param
    // allows the function to return the realEvent as well
    findOverlappingEvents : function (realEvent, paramEvent, includeRealEvent) {
        var cal = this.creator;
        //if (!this.renderEventsOnDemand) return cal.data;
        var events = cal.data;

        var results = [];
        for (var i = 0; i < events.getLength(); i++) {
            var event = events.get(i);
            if (!event) {
                isc.logWarn('getVisibleEvents: potentially invalid index: ' + i);
                break;
            }
            if (!includeRealEvent && cal.eventsAreSame(event, realEvent)) {
                continue;
            }
            var rangeObj = {};
            // if we're not showing lead-trail lines use start-endDate fields instead to
            // determine overlap
            if (event[cal.leadingDateField] && event[cal.trailingDateField]) {
                rangeObj[cal.leadingDateField] = paramEvent[cal.leadingDateField];
                rangeObj[cal.trailingDateField] = paramEvent[cal.trailingDateField];
            } else {
                rangeObj[cal.startDateField] = paramEvent[cal.startDateField];
                rangeObj[cal.endDateField] = paramEvent[cal.endDateField];
            }

            rangeObj.laneName = event[cal.laneNameField];

            if (paramEvent[cal.laneNameField] ==  event[cal.laneNameField]
                && this.eventsOverlap(rangeObj, event, (cal.canEditLane == true))) {
                //isc.logWarn('findOverlappingEvents:' + event.id);
                results.add(event);
            }
        }

        return results;
    },

    updateOverlapRanges : function (passedData) {
        var cal = this.creator,
            data = passedData || cal.data,
            ranges = this.overlapRanges = [],
            dataLen = data.getLength()
        ;

        data.setProperty("_tagged", false);
        data.setProperty("_overlapProps", null);

        for (var i=0; i<dataLen; i++) {
            var event = data.get(i);
            if (event._tagged) continue;
            event._tagged = true;

            var range = {};
            range[cal.startDateField] = event[cal.startDateField];
            range[cal.endDateField] = event[cal.endDateField];
            range.laneName = range.lane = event[this.laneNameField];
            range.events = [];

            var overlappers = this.findOverlappingEvents(event, event, true);
            if (overlappers && overlappers.length > 0) {
                range.totalSlots = overlappers.length;
                var totalSlots = range.totalSlots;
                var localSlots = 1;
                for (var j=0; j<overlappers.length; j++) {
                    var ol = overlappers[j];

                    if (ol[cal.startDateField] < range[cal.startDateField])
                        range[cal.startDateField] = ol[cal.startDateField];
                    if (ol[cal.endDateField] > range[cal.endDateField])
                        range[cal.endDateField] = ol[cal.endDateField];

                    var subOL = ol != event ? this.findOverlappingEvents(ol, ol, true) : [];

                    if (subOL && subOL.length > 0) {
                        var totals = [];
                        subOL.map(function(item) {
                            if (item._overlapProps) totals.add(item._overlapProps.totalSlots);
                        });

                        if (totals.max() != totalSlots) {
                            totalSlots = Math.min(totals.max(), totalSlots);
                            localSlots++;
                        }
                    }

                    var slotNum = localSlots;

                    if (!ol._overlapProps) {
                        ol._tagged = true;
                        ol._overlapProps = { slotNum: slotNum, totalSlots: localSlots };
                    } else {
                        ol._overlapProps.totalSlots = Math.max(localSlots, ol._overlapProps.totalSlots);
                        ol._ignore = true;
                    }
                }
                range.totalSlots = localSlots;
                overlappers.map(function (item) {
                    if (item._ignore) delete item._ignore;
                    else item._overlapProps.totalSlots = localSlots;
                });

                event._overlapProps.totalSlots = range.totalSlots;

                range.events = overlappers;

                var addRange = true;
                for (var k=0; k<ranges.length; k++) {
                    if (range.laneName != ranges[k].laneName) continue;
                    var overlaps = this.eventsOverlap(range, ranges[k], true);
                    if (overlaps) {
                        if (range[cal.startDateField] < ranges[k][cal.startDateField])
                            ranges[k][cal.startDateField] = range[cal.startDateField];
                        if (range[cal.endDateField] > ranges[k][cal.endDateField])
                            ranges[k][cal.endDateField] = range[cal.endDateField];
                        // this range overlaps another range
                        if (range.totalSlots > ranges[k].totalSlots) {
                            ranges[k].totalSlots = range.totalSlots;
                            event._overlapProps.totalSlots = range.totalSlots;
                            event._overlapProps.slotCount = range.totalSlots - event._overlapProps.slotNum;
                        }
                        addRange = false;
                        ranges[k].events.addList(overlappers);
                        ranges[k].events = ranges[k].events.getUniqueItems();
                    }
                }

            }
            if (addRange) ranges.add(range);

        }

        this.overlapRanges = ranges;

        return ranges;
    },

    forceDataSort : function (data) {
        var cal = this.creator,
            specifiers = [
                { property: cal.laneNameField, direction: "ascending" }
            ]
        ;

        if (cal.overlapSortSpecifiers) {
            specifiers.addList(cal.overlapSortSpecifiers);
        } else {
            specifiers.add({ property: cal.startDateField, direction: "ascending" });
        }

        if (!data) {
            data = cal.data;
            cal._ignoreDataChanged = true;
        }

        data.setSort(specifiers);
    },

    // refreshEvents is only called when data changes, etc.
    // refreshVisibleEvents is called whenever the view is scrolled and only draws visible events.
    // see scrolled()
    refreshVisibleEvents : function () {
        this.forceDataSort();

        // get visible events and add them. addEvent takes care of reclaiming and positioning
        var events = this.getVisibleEvents();

        var eventsLen = events.getLength();
        this.logDebug('refreshing visible events','calendar');
        for (var i = 0; i < eventsLen; i++) {
            //if (i > 20) break;
            var event = events.get(i);
            //isc.logWarn('refreshing event:' + event.id);
            // reset the visited flag on each event so that tagDataForOverlap code knows it can
            // tag this event if it needs to be retagged (any time an event in the same row is
            // changed).
            if (event._overlapProps) event._overlapProps.visited = false;
            this.addEvent(event, i);
        }
        // hide events after repositioning visible events, starting right after the number of the
        // last positioned events. This prevents stale (not in view) events from hanging around.
        this.clearEvents(eventsLen);
        var cal = this.creator;
        if (cal.eventsRendered && isc.isA.Function(cal.eventsRendered))
            cal.eventsRendered();
    },

    tagDataForOverlap : function (data, lane) {
        if (data.getLength() == 0) return;
        var tl = this,
            cal = this.creator,
            priorOverlaps = [], // moving window of overlapping events
            overlapMembers = 0, // number of events in the current overlap group
            currentOverlapTot = 0, // max number of events that overlap each other in the current overlap group
            maxTotalOverlaps = 0 // max number of events that overlap each other in current lane
        ;

        var specifiers = [
            { property: cal.laneNameField, direction: "ascending" }
        ];

        if (cal.overlapSortSpecifiers) {
            specifiers.addList(cal.overlapSortSpecifiers);
        } else {
            specifiers.add({ property: cal.startDateField, direction: "ascending" });
        }

        this.forceDataSort();

        if (cal.eventAutoArrange == false) return;

        var firstEvent = data.get(0), // the first event in the passed data
            currLane =  firstEvent[cal.laneNameField] // current lane we're dealing with
        ;

        var start = 0, processedEvents = [];
        // iterate through the sorted event list to get to the lane-row indicated in the
        // lane parameter. Used when updating events to re-tag only that row.
        if (lane) {
            while (start < data.getLength() && data.get(start)[cal.laneNameField] != lane) {
                start++;
            }
        }


        data.setProperty("_overlapProps", null);


        var olRanges = this.updateOverlapRanges();
        for (var j = 0; j<olRanges.length; j++) {

            var range = olRanges[j];

            var innerData = range.events;

            innerData.setSort(specifiers);

            var usedEvents = [];

            var maxSlotNum = 1;

            for (var i = start; i < innerData.getLength(); i++) {
                var event = innerData.get(i);

                event._overlapProps = {};

                var tempSlotNum = 1;

                if (usedEvents.length > 0) {
                    var tempOverlaps = [];
                    for (var k=0; k<usedEvents.length; k++) {
                        var uEvent = usedEvents[k],
                            r = isc.addProperties({}, event, {laneName: lane})
                        ;
                        if (this.eventsOverlap(r, uEvent)) {
                            // the current event overlaps this previous event
                            if (uEvent._overlapProps.slotNum >= tempSlotNum) {
                                // the previous event is already using this slot or a later one
                                tempSlotNum = uEvent._overlapProps.slotNum + 1;
                            }
                            if (uEvent._overlapProps.slotCount == null) {
                                tempOverlaps.add(uEvent);
                            }
                        }
                    }
                    if (tempOverlaps.length) {
                        for (var k=0; k<tempOverlaps.length; k++) {
                            var tOL = tempOverlaps[k];
                            tOL._overlapProps.slotCount = tempSlotNum - tOL._overlapProps.slotNum;
                        }
                    }
                }
                event._overlapProps.slotNum = tempSlotNum;

                if (tempSlotNum > maxSlotNum) maxSlotNum = tempSlotNum;

                usedEvents.add(event);
            }

            // update the total slots for all events (they're all in the same range)
            innerData.map(function (item) {
                if (!item._overlapProps.slotCount) {
                    item._overlapProps.slotCount = (maxSlotNum - item._overlapProps.slotNum) + 1;
                }
                item._overlapProps.totalSlots = maxSlotNum;
            });

        }

        return processedEvents;
    },


    nextAvailSlot : function (priorOverlaps, totSlots) {
        var slotMap = [];
        // create an array that will contain 'true' if that slot index is occupied
        // and 'false' otherwise
        for (var i=0; i < totSlots; i++) {
            slotMap.add(false);
        }
        // go through overlapping events and record the slot they occupy.
        // slotNum is 1-based, array is 0-based
        for (var i = 0; i < priorOverlaps.length; i++) {
            var event = priorOverlaps[i];
            if (!event._overlapProps) continue;
            if (event._overlapProps.slotNum) slotMap[event._overlapProps.slotNum - 1] = true;
        }
        // find the first unoccupied slot
        var slotNum = slotMap.indexOf(false) + 1;
        return slotNum;
        /* // keep this around for now for future reference
        for (var i = 0; i < priorOverlaps.length; i++) {
            var event = priorOverlaps[i];
            if (!event._overlapProps) continue;
            isc.logWarn("in loop: " + [event.eventId, event._overlapProps.slotNum, start, priorOverlaps.length]);
            if (event._overlapProps.slotNum == start) {

                start++;
            }
            else return start;
        }
        return start;
        */
    },

    eventsOverlap : function (rangeObject, event, sameLaneOnly) {
        var a = rangeObject, b = event;

        if (sameLaneOnly && a.laneName != b[this.creator.laneNameField]) return false;

        var startField, endField, cal = this.creator;
        if (a[cal.leadingDateField] && b[cal.leadingDateField]) startField = cal.leadingDateField;
        else startField = cal.startDateField;

        if (a[cal.trailingDateField] && b[cal.trailingDateField]) endField = cal.trailingDateField;
        else endField = cal.endDateField;


        // simple overlap detection logic: there can only be an overlap if
        // neither region A end <= region B start nor region A start >= region b end.
        // No need to check other boundary conditions, this should satisfy all
        // cases: 1. A doesn't overlap B, A partially overlaps B, A is completely
        // contained by B, A completely contains B.
        // NOTE: using the equals operator makes the case where
        // two dates are exactly equal be treated as not overlapping.
        var aStart = a[startField], aEnd = a[endField],
            bStart = b[startField], bEnd = b[endField]
        ;
        if (cal.equalDatesOverlap && cal.allowEventOverlap) {
            if ((aStart < bStart && aEnd >= bStart && aEnd <= bEnd) // overlaps to the left
                || (aStart <= bEnd && aEnd > bEnd) // overlaps to the right
                || (aStart <= bStart && aEnd >= bEnd) // overlaps entirely
                || (aStart >= bStart && aEnd <= bEnd) // is overlapped entirely
            ) {
                return true;
            } else {
                return false;
            }
        } else {
            if ((aStart < bStart && aEnd > bStart && aEnd < bEnd) // overlaps to the left
                || (aStart < bEnd && aEnd > bEnd) // overlaps to the right
                || (aStart <= bStart && aEnd >= bEnd) // overlaps entirely
                || (aStart >= bStart && aEnd <= bEnd) // is overlapped entirely
            ) {
                return true;
            } else {
                return false;
            }
        }

    },

    compareDates : function (date1, date2, d) {
        // year
        if (date1.getFullYear() < date2.getFullYear()) {
            return 1;
        } else if (date1.getFullYear() > date2.getFullYear()) {
            return -1;
        }
        // month
        if (date1.getMonth() < date2.getMonth()) {
            return 1;
        } else if (date1.getMonth() > date2.getMonth()) {
            return -1;
        }
        // day
        if (date1.getDate() < date2.getDate()) {
            return 1;
        } else if (date1.getDate() > date2.getDate()) {
            return -1;
        }
        // equal
        return 0;

    },

    getDateFromPoint : function (point, round, useSnapGap) {
        var retDate = this.startDate.duplicate();
        var colWidth = this.columnWidth;
        var minsInACol = this._getMinsInACell();
        var minsToAdd = 0;

        if (useSnapGap) {
            // when click/drag creating, we want to snap to the eventSnapGap
            point -= point % this.creator.eventSnapGap;
        }

        // convert point to minutes via how many column lengths are in the point
        minsToAdd += Math.floor(point / colWidth) * minsInACol;
        // account for the remainder, only if not rounding (see getVisibleDateRange)
        if (!round) minsToAdd += ((point % colWidth) / colWidth) * minsInACol;

        retDate.setMinutes(retDate.getMinutes() + minsToAdd);

        return retDate;
    },

    _getMinsInACell : function () {
        var colUnits = this.creator.timelineUnitsPerColumn;
        var granularity = this.creator.timelineGranularity;
        var minsInADay = 24*60;
        var minsInACol;
        var breadth = 0;
        if (granularity == "month") {
            minsInACol = colUnits * (minsInADay * 30);
        } else if (granularity == "week") {
            minsInACol = colUnits * (minsInADay * 7);
        } else if (granularity == "day") {
            minsInACol = colUnits * minsInADay;
        } else if (granularity == "hour") {
            minsInACol = colUnits * 60;
        } else if (granularity == "minute") {
            minsInACol = colUnits;
        }
        return minsInACol;
    },

    // gets the width that the event should be sized to in pixels
    _getEventBreadth : function (eventWin) {
        var minsInACol = this._getMinsInACell(),
            event = eventWin.event,
            cal = this.creator,
            start, end
        ;
        if (Array.isLoading(event)) return null;

        // account for events that overlap the end range of the timeline. Event breadth will
        // be truncated to end where the timeline ends.
        if (event[cal.startDateField].getTime() < this.startDate.getTime()) {
            start = this.startDate.duplicate();
        } else {
            start = event[cal.startDateField];
        }
        if (event[cal.endDateField].getTime() > this.endDate.getTime()) {
            end = this.endDate.duplicate();
            // timeline actually renders one column past the specified end date, so take that
            // into account
            end.setMinutes(end.getMinutes() + minsInACol);
        } else {
            end = event[cal.endDateField].duplicate();
        }
        var minsLen = eventWin.getEventLength(start, end);
        var colWidth = this.columnWidth;
        var breadth = 0;
        var grossCols = Math.floor(minsLen / minsInACol);
        //isc.logWarn('getEventBreadth:' + [minsLen, minsLen / 60, minsInACol, minsInACol/60, grossCols, eventWin.event.start, eventWin.event.end]);
        // when sizing events to grid, always augment the column count by 1.
        if (cal.sizeEventsToGrid) {
            var col = this.getTimelineEventColNum(event);

            if (col) {
                var field = this.getField(col),
                    isStartOfCol = field.date ?
                        field.date.getTime() == event[cal.startDateField].getTime() : false,
                    r = minsLen % minsInACol
                ;
                if (r != 0 || !isStartOfCol) grossCols += 1;
            }
        }

        // first get how many full columns the event spans
        var eStartCol = Math.max(0, this.getEventStartCol(event) + 1);
        if (eStartCol + grossCols + 1 > this.fields.length) grossCols--;
        breadth += Math.max(0, grossCols) * colWidth;
        if (cal.sizeEventsToGrid == false) {
            // then add the remainder
            var add = Math.floor(((minsLen % minsInACol) / minsInACol) * colWidth)
            breadth += add;
        }

        return breadth;
    },

    // getEventStartCol timelineView
    getEventStartCol : function (event) {
        // minDiff = difference between range start and event start in minutes
        var minDiff = (event[this.creator.startDateField].getTime() - this.startDate.getTime())
                    / (1000 * 60);
        // Don't work with fractional min-diff as this could potentially introduce
        // precision errors
        minDiff = Math.round(minDiff);
        var minsInACol = this._getMinsInACell();

        return Math.floor(minDiff / minsInACol);
    },

     // getEventLeft timelineView
    getDateLeftOffset : function (date) {
        // minDiff = difference between range start and event start in minutes
        var minDiff = (date.getTime() - this.startDate.getTime())
                    / (1000 * 60);
        // Don't work with fractional min-diff as this could potentially introduce
        // precision errors
        minDiff = Math.round(minDiff);
        var colWidth = this.columnWidth;
        var minsInACol = this._getMinsInACell();
        var eLeft = 0;

        // first get how many columns from range start the event is
        eLeft += Math.floor(minDiff / minsInACol) * colWidth;
        if (this.creator.sizeEventsToGrid == false) {
            // then add the remainder: percentage of leftover mins to minsInACol * colWidth
            eLeft += Math.round(((minDiff % minsInACol) / minsInACol) * colWidth);
        }
        // don't let event left be < 0. Breadth will compensate for the overflow as well in
        // getEventBreadth
        if (eLeft < 0) eLeft = 0;

        return eLeft;

    },

    // getEventLeft timelineView
    getEventLeft : function (event) {
        return this.getDateLeftOffset(event[this.creator.startDateField]);
    },

    getLaneHeight : function (lane) {
        if (isc.isA.Number(lane)) lane = this.getRecord(lane);
        return lane && lane.height || this.cellHeight;
    },

    getEventLaneIndex : function (event) {
        var laneIndex = this.data.findIndex("name", event[this.laneNameField]);
        if (laneIndex <0) laneIndex = this.data.findIndex(this.laneNameField, event[this.laneNameField]);
        return laneIndex;
    },

    // timelineView_sizeEventWindow()
    sizeEventWindow : function (eventWin, forceRedraw) {
        //var doDebug = (eventWin.event.assayEventId == 29);
        var cal = this.creator, event = eventWin.event;

        var laneIndex = this.data.findIndex("name", event[this.laneNameField]);
        if (laneIndex <0) laneIndex = this.data.findIndex(this.laneNameField, event[this.laneNameField]);
        var eHeight = this.getLaneHeight(laneIndex);
        var eWidth = this.columnWidth;

        if (Array.isLoading(event)) return;


        // calculate event width
        eWidth = this._getEventBreadth(eventWin);
        // calculate event left
        var eLeft = this.getEventLeft(event);
        //isc.logWarn("sizeEventWindow:" + [eWidth, eLeft]);

        var eTitle = cal.getEventTitle(event),
            style = ""
        ;
        if (event.headerBackgroundColor) style += "backgroundColor: " + event.headerBackgroundColor + ";";
        if (event.headerTextColor) style += "backgroundColor: " + event.headerTextColor + ";";
        if (style != "") eTitle = "<span style='" + style + "'>" + eTitle + "<span>"
        eventWin.setTitle(eTitle);

        // hide and show to avoid having the title be stale when the event win is moved...
        // otherwise you have the old title flashing briefly when the ebtView is scrolled
        // see ebtview.addEvent
        // Note: this used to be a call to refresh(), but that still caused flickering and in
        // some cases caused scrolling to break by seemingly moving focus
        // only run updateColors() now if we aren't going to do so from eventWin.show() later
        if (forceRedraw) eventWin.hide();
        else eventWin.updateColors();

        //if (eventWin.headerLabel) eventWin.headerLabel.setContents(cal.getEventTitle(event));
        //else eventWin.setTitle(cal.getEventTitle(event));

        var eTop = this.getRowTop(laneIndex);

        if (this.timelineEventPadding > 0) {
            eTop += this.timelineEventPadding;
            eLeft += this.timelineEventPadding;
            eWidth -= (this.timelineEventPadding * 2);
            eHeight -= (this.timelineEventPadding * 2);
        }

        if (cal.eventsOverlapGridLines) {
            if (eLeft > 0) eLeft -= 1;
            eWidth += 1;
            eTop -= 1;
            eHeight += 1;
        }

        if (this.eventDragGap > 0) {
            eWidth -= this.eventDragGap;
        }

        // set description after resize so percentage widths can be respected in html that may
        // be in the description
        if (cal.showEventDescriptions != false) {
            eventWin.setDescriptionText(event[cal.descriptionField]);
        }

        //if (doDebug) isc.logWarn('sizeEventWindow:' + [daysFromStart, cal.startDate]);
        this.adjustDimensionsForOverlap(eventWin, eLeft, eTop, eWidth, eHeight);

        if (forceRedraw) eventWin.show();

        // draw leading and trailing lines
        if (event[cal.leadingDateField] && event[cal.trailingDateField]) {
            if (eventWin._lines) this.addLeadingAndTrailingLines(eventWin);
            // split this onto another thread so that ie doesn't pop the
            // slow script warning. Applies to first draw only.
            else this.delayCall("addLeadingAndTrailingLines", [eventWin]);

        }

    },

    adjustDimensionsForOverlap : function (eventWin, left, top, width, height) {

        var overlapProps = eventWin.event._overlapProps;
        //isc.logWarn('adjustDimForOverlap:' + eventWin.event.EVENT_ID + this.echoFull(overlapProps));
        //overlapProps = false;
        if (overlapProps && overlapProps.totalSlots > 0) {
            var slotHeight = Math.floor(height / overlapProps.totalSlots);
            height = slotHeight;
            if (overlapProps.slotCount) height *= overlapProps.slotCount;
            if (overlapProps.totalSlots > 1) {
                height -= Math.floor(this.timelineEventPadding / (overlapProps.totalSlots));
            }
            top = top + Math.floor((slotHeight * (overlapProps.slotNum - 1)));
            if (overlapProps.slotNum > 1) top += (this.timelineEventPadding * (overlapProps.slotNum-1));
            // add a pixel of height to all overlapped events so that their borders are flush
            if (overlapProps.totalSlots > 1 && this.creator.eventsOverlapGridLines) height += 1;
        }
        eventWin.resizeTo(width, height);
         // continuation of ugly hack from getNewEventWindow:
        // for some reason the header lable doesn't respect the sizing of its
        // parent, so make sure we resize it here.
        if (eventWin._customHeader) eventWin.header.resizeTo(width, height);

        var moved = eventWin.moveTo(left, top);
    },

    addLeadingAndTrailingLines : function (eventWin) {
        // destroy previous lines and icons before creating new ones
        //eventWin.destroyLines();
        var leadLine, leadIcon, trailLine, trailIcon;
        if (eventWin._lines) {
            leadLine = eventWin._lines[0];
            leadIcon = eventWin._lines[1];
            trailLine = eventWin._lines[2];
            trailIcon = eventWin._lines[3];
        } else {
            leadLine = this._makeLine();
            leadIcon = this._makeIcon(eventWin, "lead");
            trailLine = this._makeLine();
            trailIcon = this._makeIcon(eventWin, "trail");
        }


        var showLead = this._positionIcon(leadIcon, leadLine);
        var showTrail = this._positionIcon(trailIcon, trailLine);


        if (!eventWin._lines) {
            this.body.addChild(leadLine);
            this.body.addChild(leadIcon);

            this.body.addChild(trailLine);
            this.body.addChild(trailIcon);
            eventWin._lines = [
               leadLine, leadIcon, trailLine, trailIcon
            ];
        }


    },

    _positionIcon : function (icon, line) {
        var cal = this.creator, eventWin = icon._eventWin, event = eventWin.event,
            type = icon.type, eWidth = this.columnWidth,
            eHeight = eventWin.getVisibleHeight(), eTop = eventWin.getTop(),
            eLeft = eventWin.getLeft();

        // size/reposition line first
        var dayDiff, lineWidth, drawIcon = true;
        if (type == "trail") {
            // if trailing date is past our date range, draw the line up to the end of the grid
            // and don't draw the trailing icon
            if (this.compareDates(event[cal.trailingDateField],this.endDate) < 0) {
                dayDiff = cal.getDayDiff(this.endDate, event[cal.startDateField]);
                // don't allow invalid lead day. Set to 1 if invalid.
                if (dayDiff < 1) dayDiff = 1;
                lineWidth = dayDiff * eWidth;
                drawIcon = false;
                //icon.hide();
            } else {
                dayDiff = cal.getDayDiff(event[cal.trailingDateField], event[cal.startDateField]);
                lineWidth = (dayDiff * eWidth) - (Math.round(eWidth / 2));
                //if (icon.isDrawn()) icon.show();
            }
        } else {
            // if leading date is past our date range, draw the line up to the end of the grid
            // and don't draw the leading icon
            if (this.compareDates(this.startDate, event[cal.leadingDateField]) < 0) {
                dayDiff = cal.getDayDiff(this.startDate, event[cal.startDateField]);
                // don't allow invalid lead day. Set to 1 if invalid.
                if (dayDiff < 1) dayDiff = 1;
                lineWidth = dayDiff * eWidth;
                drawIcon = false;
                //icon.hide();
            } else {
                dayDiff = cal.getDayDiff(event[cal.leadingDateField], event[cal.startDateField]);
                lineWidth = ( dayDiff * eWidth) - (Math.round(eWidth / 2));
                //if (icon.isDrawn()) icon.show();
            }
        }

        //isc.logWarn(event[cal.trailingDateField].toShortDate());
        var lLeft = (type == "trail" ? eLeft + eWidth : eLeft - lineWidth);
        line.moveTo(lLeft, eTop + (Math.round(eHeight / 2)));
        line.setWidth(lineWidth);

        // position icon
        // calculate a vertical offset to add to the event arrows so that if they are overlapping,
        // drag moving will keep them in the same vertical axis. Just try commenting out the code
        // below and setting vOffset to 0, and drag moving arrows to see the issue.
        var  vOffset = 0;
        if (event._overlapProps && event._overlapProps.slotNum > 0)  {
            vOffset = (event._overlapProps.slotNum - 1) * eHeight;
        }
        var iconSize = (type == "trail" ? this.trailIconSize : this.leadIconSize);
        var iLeft;
        if (drawIcon == false) iLeft = -50;
        else if (type == "trail") iLeft = eLeft + eWidth + lineWidth - Math.round(iconSize / 2);
        else iLeft = eLeft - lineWidth - Math.round(iconSize / 2);
        icon.moveTo(iLeft, eTop + Math.round(eHeight / 2) - Math.round(iconSize / 2));
        icon._vSnapOrigin = Math.round(eHeight / 2) - Math.round(iconSize / 2) + vOffset;
        icon._hSnapOrigin = Math.round(eWidth / 2) - Math.round(iconSize / 2),
        icon._eventStartCol = cal.getDayDiff(event[cal.startDateField], this.startDate);

        return drawIcon;
    },

    _makeIcon : function (eventWin, type) {
        var iconSize = (type == "trail" ? this.trailIconSize : this.leadIconSize);
        var icon = isc.Img.create({
            _eventWin: eventWin,
            type: type,

            //prompt:eventWin.event.EVENT_ID,
            autoDraw:false,
            _redrawWithParent: false,
            src: (type == "trail" ? this.trailingEndPointImage : this.leadingEndPointImage),
            width: iconSize,
            height: iconSize,
            canDragReposition: (this.creator.canEditEvents == true),
            dragRepositionStart : function () {
                this._startRow = this.parentElement.getEventRow();
                this._startCol = this.parentElement.getEventColumn();
                //isc.logWarn('icon drag start:');
                this.parentElement.VSnapOrigin = this._vSnapOrigin;
                this.parentElement.HSnapOrigin = this._hSnapOrigin;
            },
            dragRepositionStop : function () {
               var eventStartCol = this._eventStartCol, startCol = this._startCol,
                    endCol = this.parentElement.getEventColumn(), delta = endCol - startCol,
                    event = this._eventWin.event, cal = this._eventWin.calendar,
                    eventDelta = this.type == "trail" ? endCol - eventStartCol : eventStartCol - endCol;
               //isc.logWarn('icon drag stop:' + eventDelta);
               if (eventDelta < 1) return false;
               var otherFields = {};
               var dateField = this.type == "trail" ? cal.trailingDateField : cal.leadingDateField;
               var newDate = event[dateField].duplicate();
               newDate.setDate(newDate.getDate() + delta);
               otherFields[dateField] = newDate;
               cal.updateEvent(event, event[cal.startDateField], event[cal.endDateField],
                   event[cal.nameField], event[cal.descriptionField], otherFields, true);
               return true;

            }
        });
        return icon;
    },

    _makeLine : function () {
        //var line = isc.Img.create({
        var line = isc.Canvas.create({
            autoDraw:false,
            _redrawWithParent: false,
            //src: this.lineImage,
            height: 2,

            overflow: "hidden",
            styleName: "eventLine"
        });

        return line;
    },

    clearEvents : function (start) {
        if (!this.body || !this.body.children || !this._eventBin) return;
        if (!start) start = 0;
        //isc.logWarn('clearing events');
        /*
        var arr = this.body.children;
        for (var i = arr.length - 1; i >= 0 ; i--) {
            if (isc.isAn.EventWindow(arr[i])) {
                var eWin = arr[i];
                this.body.removeChild(eWin);
                eWin.destroyLines();
                eWin.destroy();
            }
        }
        */
        for (var i = start; i < this._eventBin.length; i++) {
            //isc.logWarn('hiding event:' + i);
            this._eventBin[i].hide();
        }
    },

    // addEvent timelineView
    addEvent : function (event, eventIndex) {
        if (!this._eventBin) this._eventBin = [];

        var reclaimed = false,
            cal = this.creator,
            canEditEvent = cal.canEditEvent(event),
            canDrag = (cal.canDragEvents == true && event[cal.canDragEventField] != false),
            win
        ;

        // if we are recycling event windows and we have one available...
        if (this.renderEventsOnDemand && this._eventBin[eventIndex]) {
            // ...reclaim the event from the event bin
            win = this._eventBin[eventIndex];
            cal.setEventWindowID(event, win.ID);
            win.event = event;
            win.VSnapOrigin = 0;
            reclaimed = true;
            win.setStyleName(event[cal.eventWindowStyleField] || cal.eventWindowStyle);
            win.baseStyle = event[cal.eventWindowStyleField] || cal.eventWindowStyle;
            if (win.body) {
                win.bodyStyle = win.baseStyle + "Body";
                win.body.setStyleName(win.bodyStyle);
            }
            if (win.header) {
                var style = "Header";
                if (isc.isA.Label(win.header)) style = "Body";
                win.headerStyle = win.baseStyle + style;

                win.header.setStyleName(win.headerStyle);
                var label = win.header.getMember ? win.header.getMember(0) : null;
                if (label) label.setStyleName(win.headerStyle);

                if (win.headerLabel) win.headerLabel.setStyleName(win.headerStyle);
            }


            // make sure we update drag properties for the window we're reusing according to
            // the new event's editability
            win.canDragReposition = canDrag && canEditEvent;
            win.canDragResize = cal.canResizeTimelineEvents && canEditEvent;
        } else {
            // otherwise make a new window and put it in the bin for future reclamation
            var win = this.getNewEventWindow(event);
            win._parentView = this;
            this._eventBin.add(win);
        }

        this.sizeEventWindow(win, reclaimed);
        // Adding a check on parentElement here to ensure that we can't end up with a window
        // in the event bin that is not a child of this.body.  This is related to the change
        // made a few lines further down, to ensure that an undrawn window is drawn.  I suspect
        // the root of this is event windows being created before the Timeline itself has
        // been drawn
        if (this.body && (!reclaimed || win.parentElement != this.body)) {
            this.body.addChild(win);
        }
        if (!win.isDrawn()) win.draw();
        if (win.body) win.body.show();
        win.show();
        win.setCanDragReposition(cal.canDragEvents, this.timelineDragTarget);
    },

    removeEvent : function (event) {
        var arr = this.body.children;
        for (var i = 0; i < arr.length ; i++) {
            if (isc.isAn.EventWindow(arr[i]) && arr[i].event === event) {
                var win = arr[i];
                win.parentElement.removeChild(win);
                win.destroy();
                return true;
            }
        }
        return false;
    },

    getNewEventWindow : function (event) {
        var cal = this.creator,
            styleName = event[cal.eventWindowStyleField] || cal.eventWindowStyle,
            bodyProps=isc.addProperties({}, this.bodyProperties,
                {backgroundColor: event.backgroundColor, textColor: event.textColor,
                styleName: styleName + "Body"}
            ),
            headerProps=isc.addProperties({dragTarget: this.timelineDragTarget}, this.headerProperties,
                {backgroundColor: event.headerBackgroundColor, textColor: event.headerTextColor,
                styleName: styleName + "Header"}
            ),
            showMembers = true
        ;
        if (cal.showEventDescriptions == false) {
            //bodyProps = {height: 0, overflow:"hidden" };
            //headerProps = {height: "*"};
            showMembers = false;
        }
        var canDrag = (cal.canDragEvents == true && event[cal.canDragEventField] != false),
            canEditEvent = cal.canEditEvent(event)
        ;

        if (showMembers) headerProps.headerHeight = 14;

        var eventWinProps = {
            calendar: cal,
            _redrawWithParent: false,
            styleName: styleName,
            baseStyle: styleName,
            canDragReposition: canDrag && canEditEvent,
            canDragResize: cal.canResizeTimelineEvents && canEditEvent,
            edgeMarginSize:10,
            //showEdges:false,
            //edgeOpacity:0,
            showCloseButton: false,
            event: event,
            descriptionText: event[cal.descriptionField] || "",
            showHeader: showMembers,
            showBody: showMembers,

            dragTarget: this.timelineDragTarget,

            backgroundColor: event.backgroundColor,
            textColor: event.textColor,

            headerProperties: headerProps,
            bodyProperties: bodyProps,
            headerStyle: styleName + "Header",
            bodyStyle: styleName + "Body"
        }
        if (event.backgroundColor) {
            eventWinProps.backgroundColor = event.backgroundColor;
        }
        var eventWin =  isc.TimelineWindow.create(eventWinProps);
        // somewhat ugly hack, probably due to performance optimization by
        // _redrawWithParent = false above:
        // if showEventDescriptions is false, we completely eliminate the header and
        // body of the window, and simply make our own header. We add this to
        // the event window as a child (if added as a member it won't be drawn).
        // The regular header won't be drawn if showBody:false, probably having
        // to do with _redrawWithParent on the window.

        if (!showMembers) {
            var lbl = isc.Label.create({
                    autoDraw: false,
                    styleName: styleName,
                    border: "0px",
                    padding: 3,
                    height: "100%",
                    width: "100%",
                    backgroundColor: event.backgroundColor,
                    textColor: event.textColor,
                    setContents : function (contents) {
                        this._origContents = contents;
                        this.Super("setContents", arguments);
                    },
                    canHover: true,
                    showHover: true,
                    eventWin: eventWin,
                    getHoverHTML : function () {
                        return eventWin.getHoverHTML();
                    }
            });
            eventWin.addChild(lbl);
            eventWin.header = lbl;
            eventWin._customHeader = true;
            eventWin.updateColors();
        }

        cal.setEventWindowID(event, eventWin.ID);
        //isc.logWarn('getNewEventWindow:' + [eventWin.ID, eventWin.canDragResize]);
        return eventWin;
    },

    // timeliveView
    updateEventWindow : function (event) {
        if (!this.body || !this.body.children) return;

        var cal = this.creator,
            laneName = event[cal.laneNameField]
        ;

        // if one event is updated, all events in the same row may need to be updated as
        // well due to overlapping. By passing a type into tagDataForOverlap, only
        // events in the same row as event will be processed
        var events = this.tagDataForOverlap(cal.data.getRange(0, cal.data.getLength()),
                laneName);

        if (this.renderEventsOnDemand) {
            // just refresh events
            this.refreshVisibleEvents();
        } else {
            for (var i = 0; i < events.length; i++) {
                var event = events.get(i), winId = cal.getEventWindowID(event), eWin = window[winId];
                // reset visited so tagDataForOverlap knows it can process this event if an
                // update occurs later
                //isc.logWarn("***** event is: \n\n" + isc.echoFull(event));
                if (event._overlapProps) event._overlapProps.visited = false;
                // make sure to re-initialize the object that the eventWindow is pointing to, which
                // gets out of sync on update
                eWin.event = event;
                this.sizeEventWindow(eWin);
            }
        }


    },

    areSame : function (first, second) {
        var cal = this.creator;
        if (cal.dataSource) {
            var pks = cal._pks, areEqual = true;
            for (var pkName in pks) {
                if (first[pkName]!= second[pkName]) {
                    areEqual = false;
                    break;
                }
            }
            return areEqual;
        } else {
            return (first === second);
        }
    },

    resized : function () {
        this.Super('resized', arguments);
        //isc.logWarn('ebtView resized:' + [this.isDrawn(), this.creator.hasData()]);
        if (this.isDrawn() && this.creator.hasData() && this.renderEventsOnDemand) {
            this.refreshVisibleEvents();
        }
    },

    //-------------------------rendering events on demand-----------------------------
    scrolled : function () {
        if (this.renderEventsOnDemand) {
            if (this._layoutEventId) isc.Timer.clear(this._layoutEventId);
            this._layoutEventId = isc.Timer.setTimeout(this.ID + ".refreshVisibleEvents()");

        }
    },

    getVisibleDateRange : function () {
        if (!this.renderEventsOnDemand) {
            return [this.startDate.duplicate(), this.endDate.duplicate()];
        }

        var startPos = this.body.getScrollLeft();
        var endPos = startPos + this.body.getVisibleWidth();
        // round rangeStart to the nearest column start, otherwise events that are on the left
        // edge may not get rendered when sizeEventsToGrid is true
        var rangeStart = this.getDateFromPoint(startPos, true);
        var rangeEnd = this.getDateFromPoint(endPos);

        return [rangeStart, rangeEnd];
    },

    getVisibleRowRange : function () {
        if (!this.renderEventsOnDemand) {
            return [0, this.data.getLength()];
        }
        return this.getVisibleRows();
    }


}); // end timelineView addProperties()

isc.Calendar.registerStringMethods({
    getDayBodyHTML : "date,events,calendar,rowNum,colNum",
    getDayHeaderHTML : "date,events,calendar,rowNum,colNum",
    dayBodyClick : "date,events,calendar,rowNum,colNum",
    dayHeaderClick : "date,events,calendar,rowNum,colNum",
    eventClick : "event,viewName",
    eventChanged : "event",
    eventMoved : "newDate,event",
    eventResized : "newDate,event",
    //> @method calendar.backgroundClick
    // Callback fired when the mouse is clicked in a background-cell, ie, one without an
    // event.
    //
    // @param startDate (Date) start datetime of the selected slot
    // @param endDate (Date) end datetime of the selected slot
    // @return (boolean) return false to cancel the default behavior of creating a new
    //                      event at the selected location and showing its editor.
    // @visibility external
    //<
    backgroundClick : "startDate,endDate",
    //> @method calendar.backgroundMouseDown
    // Callback fired when the mouse button is depressed over a background-cell, ie, one
    // without an event.  Return false to cancel the default behavior of allowing sweep
    // selection via dragging.
    //
    // @param startDate (Date) start datetime of the selected slot
    // @return (boolean) return false to suppress default behavior of allowing sweep
    //                      selection via dragging.
    // @visibility external
    //<
    backgroundMouseDown : "startDate",
    //> @method calendar.backgroundMouseUp
    // Notification method fired when the mouse button is released over a background-cell, ie,
    // one without an event.  Return false to cancel the default behavior of showing a dialog
    // to add a new event with the passed dates.
    //
    // @param startDate (Date) the datetime of the slot where the mouse button was depressed
    // @param endDate (Date) the datetime of the slot where the mouse button was released
    // @return (boolean) return false to suppress default behavior of showing a dialog
    //                      to add a new event with the passed dates.
    // @visibility external
    //<
    backgroundMouseUp : "startDate,endDate"
});

isc.DaySchedule.addClassProperties({

_eventScaffolding: [
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""}, // 5
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""}, // 10
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""}, // 15
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""}, // 20
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""}, // 24
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""}, // 5
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""}, // 10
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""}, // 15
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""}, // 20
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""},
    {label:"", day1:"", day2:"", day3:"", day4:"", day5:"", day6:"", day7:""} // 24
]

});


// Call the AutoTest method to apply Calendar-specific methods now we've loaded
isc.AutoTest.customizeCalendar();







//>    @class Timeline
// Timeline is a trivial subclass of +link{Calendar} that configures the Calendar with settings
// typical for a standalone timeline view: no other tabs (week, month, day) are shown and the
// control bar is hidden by default.
//
// @treeLocation  Client Reference/Calendar
// @visibility external
//<
isc.ClassFactory.defineClass("Timeline", "Calendar");

isc.Timeline.addProperties({

showTimelineView: true,
showDayView: false,
showWeekView: false,
showMonthView: false,
showControlBar: false,

labelColumnWidth: 75,

sizeEventsToGrid: false,
eventDragGap: 0

});
isc._debugModules = (isc._debugModules != null ? isc._debugModules : []);isc._debugModules.push('Calendar');isc.checkForDebugAndNonDebugModules();isc._moduleEnd=isc._Calendar_end=(isc.timestamp?isc.timestamp():new Date().getTime());if(isc.Log&&isc.Log.logIsInfoEnabled('loadTime'))isc.Log.logInfo('Calendar module init time: ' + (isc._moduleEnd-isc._moduleStart) + 'ms','loadTime');delete isc.definingFramework;}else{if(window.isc && isc.Log && isc.Log.logWarn)isc.Log.logWarn("Duplicate load of module 'Calendar'.");}

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

