
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Grouping/X3DGroupingNode",
	"cobweb/Components/Networking/X3DUrlObject",
	"cobweb/Components/PointingDeviceSensor/TouchSensor",
	"cobweb/Bits/TraverseType",
	"cobweb/Bits/X3DConstants",
	"cobweb/InputOutput/Loader",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DGroupingNode,
          X3DUrlObject,
          TouchSensor,
          TraverseType,
          X3DConstants,
          Loader)
{
"use strict";

	function Anchor (executionContext)
	{
		X3DGroupingNode .call (this, executionContext);
		X3DUrlObject    .call (this, executionContext);

		this .addType (X3DConstants .Anchor);

		this .touchSensorNode = new TouchSensor (executionContext);
	}

	Anchor .prototype = $.extend (Object .create (X3DGroupingNode .prototype),
		X3DUrlObject .prototype,
	{
		constructor: Anchor,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",       new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "description",    new Fields .SFString ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "url",            new Fields .MFString ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "parameter",      new Fields .MFString ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "bboxSize",       new Fields .SFVec3f (-1, -1, -1)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "bboxCenter",     new Fields .SFVec3f ()),
			new X3DFieldDefinition (X3DConstants .inputOnly,      "addChildren",    new Fields .MFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOnly,      "removeChildren", new Fields .MFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "children",       new Fields .MFNode ()),
		]),
		getTypeName: function ()
		{
			return "Anchor";
		},
		getComponentName: function ()
		{
			return "Networking";
		},
		getContainerField: function ()
		{
			return "children";
		},
		initialize: function ()
		{
			X3DGroupingNode .prototype .initialize .call (this);
			X3DUrlObject    .prototype .initialize .call (this);

			this .touchSensorNode .touchTime_ .addInterest (this, "requestAsyncLoad");
			this .description_ .addFieldInterest (this .touchSensorNode .description_);

			this .touchSensorNode .description_ = this .description_;
			this .touchSensorNode .setup ();
		},
		requestAsyncLoad: function ()
		{
			this .setLoadState (X3DConstants .IN_PROGRESS_STATE, false);

			var target;

			for (var i = 0, length = this .parameter_ .length; i < length; ++ i)
			{
				var pair = this .parameter_ [i] .split ("=");

				if (pair .length !== 2)
					continue;

				if (pair [0] === "target")
					target = pair [1];
			}

			new Loader (this) .createX3DFromURL (this .url_, /*this .parameter_,*/
			function (scene)
			{
				if (scene)
				{
					this .getBrowser () .replaceWorld (scene);
					this .setLoadState (X3DConstants .COMPLETE_STATE, false);
				}
				else
					this .setLoadState (X3DConstants .FAILED_STATE, false);		
			}
			.bind (this),
			function (fragment)
			{
			   try
			   {
					this .getExecutionContext () .changeViewpoint (fragment);
				}
				catch (error)
				{ }

				this .setLoadState (X3DConstants .COMPLETE_STATE, false);
			}
			.bind (this),
			function (url)
			{
				if (target)
					window .open (url, target);
				else
					location = url;

				this .setLoadState (X3DConstants .COMPLETE_STATE, false);
			}
			.bind (this));
		},
		traverse: function (type)
		{
			if (type === TraverseType .POINTER)
			{
			   var sensors = { };

				this .getBrowser () .getSensors () .push (sensors);
				this .touchSensorNode .traverse (sensors);

				X3DGroupingNode .prototype .traverse .call (this, type);

				this .getBrowser () .getSensors () .pop ();
			}
			else
				X3DGroupingNode .prototype .traverse .call (this, type);
		},
	});

	return Anchor;
});


