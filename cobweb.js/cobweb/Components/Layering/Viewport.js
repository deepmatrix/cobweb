
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Layering/X3DViewportNode",
	"cobweb/Bits/X3DConstants",
	"cobweb/Bits/TraverseType",
	"standard/Utility/ObjectCache",
	"standard/Math/Geometry/ViewVolume",
	"standard/Math/Numbers/Vector4",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DViewportNode, 
          X3DConstants,
          TraverseType,
          ObjectCache,
          ViewVolume,
          Vector4)
{
"use strict";

	var ViewVolumes = ObjectCache (ViewVolume);

	function Viewport (executionContext)
	{
		X3DViewportNode .call (this, executionContext);

		this .addType (X3DConstants .Viewport);

		this .rectangle = new Vector4 (0, 0, 0, 0);
	}

	Viewport .prototype = $.extend (Object .create (X3DViewportNode .prototype),
	{
		constructor: Viewport,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",       new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "clipBoundary",   new Fields .MFFloat (0, 1, 0, 1)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "bboxSize",       new Fields .SFVec3f (-1, -1, -1)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "bboxCenter",     new Fields .SFVec3f ()),
			new X3DFieldDefinition (X3DConstants .inputOnly,      "addChildren",    new Fields .MFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOnly,      "removeChildren", new Fields .MFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "children",       new Fields .MFNode ()),
		]),
		getTypeName: function ()
		{
			return "Viewport";
		},
		getComponentName: function ()
		{
			return "Layering";
		},
		getContainerField: function ()
		{
			return "viewport";
		},
		initialize: function ()
		{
			X3DViewportNode .prototype .initialize .call (this);

			this .getExecutionContext () .isLive () .addInterest (this, "set_live__");
			this .isLive ()                         .addInterest (this, "set_live__");
			
			this .getBrowser () .getViewport () .addInterest (this, "set_rectangle__");
			this .clipBoundary_                 .addInterest (this, "set_rectangle__");

			this .set_live__ ();
		},
		set_live__: function ()
		{
		  if (this .getExecutionContext () .isLive () .getValue () && this .isLive () .getValue ())
		  {
		      this .getBrowser () .getViewport () .addInterest (this, "set_rectangle__");

				this .set_rectangle__ ();
		  }
		  else
				this .getBrowser () .getViewport () .removeInterest (this, "set_rectangle__");
		},
		set_rectangle__: function ()
		{
			var viewport = this .getBrowser () .getViewport ();

			var
				left   = Math .floor (viewport [2] * this .getLeft ()),
				right  = Math .floor (viewport [2] * this .getRight ()),
				bottom = Math .floor (viewport [3] * this .getBottom ()),
				top    = Math .floor (viewport [3] * this .getTop ());

			this .rectangle .set (left,
			                      bottom,
			                      Math .max (0, right - left),
			                      Math .max (0, top - bottom));
		},
		getRectangle: function ()
		{
			return this .rectangle;
		},
		getLeft: function ()
		{
			return this .clipBoundary_ .length > 0 ? this .clipBoundary_ [0] : 0;
		},
		getRight: function ()
		{
			return this .clipBoundary_ .length > 1 ? this .clipBoundary_ [1] : 1;
		},
		getBottom: function ()
		{
			return this .clipBoundary_ .length > 2 ? this .clipBoundary_ [2] : 0;
		},
		getTop: function ()
		{
			return this .clipBoundary_ .length > 3 ? this .clipBoundary_ [3] : 1;
		},
		traverse: function (type)
		{
			this .push ();

			switch (type)
			{
				case TraverseType .POINTER:
				{
					if (this .getBrowser () .isPointerInRectangle (this .rectangle))
						X3DViewportNode .prototype .traverse .call (this, type);

					break;
				}
				default:
					X3DViewportNode .prototype .traverse .call (this, type);
					break;
			}

			this .pop ();
		},
		push: function ()
		{
			var
			   currentLayer = this .getCurrentLayer (),
				viewVolumes  = currentLayer .getViewVolumes (),
				viewport     = viewVolumes .length ? viewVolumes [0] .getViewport () : this .rectangle;

			currentLayer .getViewVolumes () .push (ViewVolumes .pop (this .getBrowser () .getProjectionMatrix (),
			                                                         viewport,
			                                                         this .rectangle));
		},
		pop: function ()
		{
			ViewVolumes .push (this .getCurrentLayer () .getViewVolumes () .pop ());
		},
	});

	return Viewport;
});


