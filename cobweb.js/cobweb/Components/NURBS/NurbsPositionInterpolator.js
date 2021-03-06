
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Core/X3DChildNode",
	"cobweb/Bits/X3DConstants",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DChildNode, 
          X3DConstants)
{
"use strict";

	function NurbsPositionInterpolator (executionContext)
	{
		X3DChildNode .call (this, executionContext);

		this .addType (X3DConstants .NurbsPositionInterpolator);
	}

	NurbsPositionInterpolator .prototype = $.extend (Object .create (X3DChildNode .prototype),
	{
		constructor: NurbsPositionInterpolator,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput, "metadata",      new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOnly,   "set_fraction",  new Fields .SFFloat ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "controlPoint",  new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "knot",          new Fields .MFDouble ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "order",         new Fields .SFInt32 (3)),
			new X3DFieldDefinition (X3DConstants .inputOutput, "weight",        new Fields .MFDouble ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,  "value_changed", new Fields .SFVec3f ()),
		]),
		getTypeName: function ()
		{
			return "NurbsPositionInterpolator";
		},
		getComponentName: function ()
		{
			return "NURBS";
		},
		getContainerField: function ()
		{
			return "children";
		},
	});

	return NurbsPositionInterpolator;
});


