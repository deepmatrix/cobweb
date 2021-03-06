
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Core/X3DSensorNode",
	"cobweb/Components/Time/X3DTimeDependentNode",
	"cobweb/Bits/X3DConstants",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DSensorNode, 
          X3DTimeDependentNode, 
          X3DConstants)
{
"use strict";

	function TimeSensor (executionContext)
	{
		X3DSensorNode        .call (this, executionContext);
		X3DTimeDependentNode .call (this, executionContext);

		this .addType (X3DConstants .TimeSensor);

		this .addChildren ("range", new Fields .MFFloat (0, 0, 1));
		
		this .cycle    = 0;
		this .interval = 0;
		this .first    = 0;
		this .last     = 1;
		this .scale    = 1;
	}

	TimeSensor .prototype = $.extend (Object .create (X3DSensorNode .prototype),
		X3DTimeDependentNode .prototype,
	{
		constructor: TimeSensor,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput, "metadata",         new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "enabled",          new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .inputOutput, "cycleInterval",    new Fields .SFTime (1)),
			new X3DFieldDefinition (X3DConstants .inputOutput, "loop",             new Fields .SFBool ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "startTime",        new Fields .SFTime ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "resumeTime",       new Fields .SFTime ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "pauseTime",        new Fields .SFTime ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "stopTime",         new Fields .SFTime ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,  "isPaused",         new Fields .SFBool ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,  "isActive",         new Fields .SFBool ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,  "cycleTime",        new Fields .SFTime ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,  "elapsedTime",      new Fields .SFTime ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,  "fraction_changed", new Fields .SFFloat ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,  "time",             new Fields .SFTime ()),
		]),
		getTypeName: function ()
		{
			return "TimeSensor";
		},
		getComponentName: function ()
		{
			return "Time";
		},
		getContainerField: function ()
		{
			return "children";
		},
		initialize: function ()
		{
			X3DSensorNode        .prototype .initialize .call (this);
			X3DTimeDependentNode .prototype .initialize .call (this);
		},
		prepareEvents: function ()
		{
			// The event order below is very important.

			var time = this .getBrowser () .getCurrentTime ();

			if (time - this .cycle >= this .interval)
			{
				if (this .loop_ .getValue ())
				{
					this .cycle            += this .interval * Math .floor ((time - this .cycle) / this .interval);
					this .fraction_changed_ = this .last;
					this .elapsedTime_      = this .getElapsedTime ();
					this .cycleTime_        = time;
				}
				else
				{
					this .fraction_changed_ = this .last;
					this .stop ();
				}
			}
			else
			{
				var t = (time - this .cycle) / this .interval;

				this .fraction_changed_ = this .first + (t - Math .floor (t)) * this .scale;
				this .elapsedTime_      = this .getElapsedTime ();
			}

			this .time_ = time;
		},
		set_start: function ()
		{
			this .first  = this .range_ [0];
			this .last   = this .range_ [2];
			this .scale  = this .last - this .first;

			var offset = (this .range_ [1] -  this .first) *  this .cycleInterval_ .getValue ();

			this .interval = this .cycleInterval_ .getValue () * this .scale;
			this .cycle    = this .getBrowser () .getCurrentTime () - offset;

			this .fraction_changed_ = this .range_ [1];
			this .time_             = this .getBrowser () .getCurrentTime ();
		},			
		set_resume: function (pauseInterval)
		{
			this .cycle += pauseInterval;
		},
	});

	return TimeSensor;
});


