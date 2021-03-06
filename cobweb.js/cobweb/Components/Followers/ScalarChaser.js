
define ("cobweb/Components/Followers/ScalarChaser",
[
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Followers/X3DChaserNode",
	"cobweb/Bits/X3DConstants",
	"standard/Math/Algorithm",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DChaserNode, 
          X3DConstants,
          Algorithm)
{
"use strict";

	function ScalarChaser (executionContext)
	{
		X3DChaserNode .call (this, executionContext);

		this .addType (X3DConstants .ScalarChaser);
	}

	ScalarChaser .prototype = $.extend (Object .create (X3DChaserNode .prototype),
	{
		constructor: ScalarChaser,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",           new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOnly,      "set_value",          new Fields .SFFloat ()),
			new X3DFieldDefinition (X3DConstants .inputOnly,      "set_destination",    new Fields .SFFloat ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "initialValue",       new Fields .SFFloat ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "initialDestination", new Fields .SFFloat ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "duration",           new Fields .SFTime (1)),
			new X3DFieldDefinition (X3DConstants .outputOnly,     "isActive",           new Fields .SFBool ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,     "value_changed",      new Fields .SFFloat ()),
		]),
		getTypeName: function ()
		{
			return "ScalarChaser";
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
			return 0;
		},
		setPreviousValue: function (value)
		{
			this .previousValue = value;
		},
		duplicate: function (value)
		{
			return value;
		},
		assign: function (buffer, i, value)
		{
			buffer [i] = value;
		},
		equals: function (lhs, rhs, tolerance)
		{
			return Math .abs (lhs - rhs) < tolerance;
		},
		interpolate: function (source, destination, weight)
		{
			return Algorithm .lerp (source, destination, weight);
		},
		step: function (value1, value2, t)
		{
			this .output += (value1 - value2) * t;
		},
	});

	return ScalarChaser;
});


