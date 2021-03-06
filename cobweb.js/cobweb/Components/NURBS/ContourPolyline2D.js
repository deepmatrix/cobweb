
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/NURBS/X3DNurbsControlCurveNode",
	"cobweb/Bits/X3DConstants",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DNurbsControlCurveNode, 
          X3DConstants)
{
"use strict";

	function ContourPolyline2D (executionContext)
	{
		X3DNurbsControlCurveNode .call (this, executionContext);

		this .addType (X3DConstants .ContourPolyline2D);
	}

	ContourPolyline2D .prototype = $.extend (Object .create (X3DNurbsControlCurveNode .prototype),
	{
		constructor: ContourPolyline2D,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput, "metadata",     new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "controlPoint", new Fields .MFVec2d ()),
		]),
		getTypeName: function ()
		{
			return "ContourPolyline2D";
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

	return ContourPolyline2D;
});


