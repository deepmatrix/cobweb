
define ("cobweb/Components/Followers/ColorDamper",
[
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Followers/X3DDamperNode",
	"cobweb/Bits/X3DConstants",
	"standard/Math/Numbers/Color3",
	"standard/Math/Numbers/Vector3",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DDamperNode, 
          X3DConstants,
          Color3,
          Vector3)
{
"use strict";

	var
		a                  = new Vector3 (0, 0, 0),
		initialValue       = new Vector3 (0, 0, 0),
		initialDestination = new Vector3 (0, 0, 0),
		vector             = new Vector3 (0, 0, 0);

	function ColorDamper (executionContext)
	{
		X3DDamperNode .call (this, executionContext);

		this .addType (X3DConstants .ColorDamper);
	}

	ColorDamper .prototype = $.extend (Object .create (X3DDamperNode .prototype),
	{
		constructor: ColorDamper,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",           new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOnly,      "set_value",          new Fields .SFColor ()),
			new X3DFieldDefinition (X3DConstants .inputOnly,      "set_destination",    new Fields .SFColor ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "initialValue",       new Fields .SFColor (0.8, 0.8, 0.8)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "initialDestination", new Fields .SFColor (0.8, 0.8, 0.8)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "order",              new Fields .SFInt32 (3)),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "tau",                new Fields .SFTime (0.3)),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "tolerance",          new Fields .SFFloat (-1)),
			new X3DFieldDefinition (X3DConstants .outputOnly,     "isActive",           new Fields .SFBool ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,     "value_changed",      new Fields .SFColor ()),
		]),
		getTypeName: function ()
		{
			return "ColorDamper";
		},
		getComponentName: function ()
		{
			return "Followers";
		},
		getContainerField: function ()
		{
			return "children";
		},
		getVector: function ()
		{
			return new Vector3 (0, 0, 0);
		},
		getValue: function ()
		{
			return this .set_value_ .getValue () .getHSV (vector);
		},
		getDestination: function ()
		{
			return this .set_destination_ .getValue () .getHSV (vector);
		},
		getInitialValue: function ()
		{
			return this .initialValue_ .getValue () .getHSV (initialValue);
		},
		getInitialDestination: function ()
		{
			return this .initialDestination_ .getValue () .getHSV (initialDestination);
		},
		setValue: function (value)
		{
			this .value_changed_ .setHSV (value .x, value .y, value .z);
		},
		equals: function (lhs, rhs, tolerance)
		{
			return a .assign (lhs) .subtract (rhs) .abs () < tolerance;
		},
		interpolate: function (source, destination, weight)
		{
			return Color3 .lerp (source, destination, weight, vector);
		},
	});

	return ColorDamper;
});


