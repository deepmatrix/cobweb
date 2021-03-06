
define ([
	"jquery",
	"cobweb/Basic/X3DBaseNode",
],
function (jquery,
          X3DBaseNode)
{
"use strict";
	
	function PointingDevice (executionContext)
	{
		X3DBaseNode .call (this, executionContext);

		this .cursor     = "DEFAULT";
		this .isOver     = false;
		this .motionTime = 0;
	}

	PointingDevice .prototype = $.extend (Object .create (X3DBaseNode .prototype),
	{
		constructor: PointingDevice,
		initialize: function ()
		{
			var browser = this .getBrowser ();

			browser .getCanvas () .bind ("mousedown.PointingDevice", this .mousedown  .bind (this));
			browser .getCanvas () .bind ("mouseup.PointingDevice",   this .mouseup    .bind (this));
			browser .getCanvas () .bind ("dblclick.PointingDevice",  this .dblclick   .bind (this));
			browser .getCanvas () .bind ("mousemove.PointingDevice", this .mousemove  .bind (this));
			browser .getCanvas () .bind ("mouseout.PointingDevice",  this .onmouseout .bind (this));
		},
		mousedown: function (event)
		{
			event .preventDefault ();

			var browser = this .getBrowser ();

			browser .getCanvas () .focus ();

			if (browser .hasShiftKey () && browser .hasCtrlKey ())
				return;

			if (event .button === 0)
			{
				var
					offset = browser .getCanvas () .offset (), 
					x      = event .pageX - offset .left,
					y      = browser .getCanvas () .height () - (event .pageY - offset .top);

				browser .getCanvas () .unbind ("mousemove.PointingDevice");
				$(document) .bind ("mouseup.PointingDevice"   + this .getId (), this .mouseup .bind (this));
				$(document) .bind ("mousemove.PointingDevice" + this .getId (), this .mousemove .bind (this));

				if (browser .buttonPressEvent (x, y))
				{
					event .stopImmediatePropagation (); // Keeps the rest of the handlers from being executed

					browser .setCursor ("HAND");
					browser .finished () .addInterest (this, "onverifymotion", x, y);
				}
			}
		},
		mouseup: function (event)
		{
			event .preventDefault ();
	
			var browser = this .getBrowser ();

			if (event .button === 0)
			{
				browser .buttonReleaseEvent ();

				var
					offset = browser .getCanvas () .offset (), 
					x      = event .pageX - offset .left,
					y      = browser .getCanvas () .height () - (event .pageY - offset .top);
			
				$(document) .unbind (".PointingDevice" + this .getId ());
				browser .getCanvas () .bind ("mousemove.PointingDevice", this .mousemove .bind (this));

				browser .setCursor (this .isOver ? "HAND" : "DEFAULT");
				browser .finished () .addInterest (this, "onverifymotion", x, y);
				browser .addBrowserEvent ();

				this .cursor = "DEFAULT";
			}
		},
		dblclick: function (event)
		{
			event .preventDefault ();

			if (this .isOver)
				event .stopImmediatePropagation ();
		},
		mousemove: function (event)
		{
			event .preventDefault ();

			var browser = this .getBrowser ();

			if (this .motionTime === browser .getCurrentTime ())
				return;

			this .motionTime = browser .getCurrentTime ();

			var
				offset = browser .getCanvas () .offset (), 
				x      = event .pageX - offset .left,
				y      = browser .getCanvas () .height () - (event .pageY - offset .top);

			this .onmotion (x, y);
		},
		onmotion: function (x, y)
		{
			var browser = this .getBrowser ();

			if (browser .motionNotifyEvent (x, y))
			{
				if (! this .isOver)
				{
					this .isOver = true;
					this .cursor = browser .getCursor ();
					browser .setCursor ("HAND");
				}
			}
			else
			{
				if (this .isOver)
				{
					this .isOver = false;
					browser .setCursor (this .cursor);
				}
			}
		},
		onmouseout: function (event)
		{
			event .preventDefault ();

			this .getBrowser () .leaveNotifyEvent ();
		},
		onverifymotion: function (value, x, y)
		{
			// Veryfy isOver state. This is neccessay if an Switch changes on buttonReleaseEvent
			// and the new child has a sensor node inside. This sensor node must be update to
			// reflect the correct isOver state.

			this .getBrowser () .finished () .removeInterest (this, "onverifymotion");

			this .onmotion (x, y);
		},
	});

	return PointingDevice;
});
