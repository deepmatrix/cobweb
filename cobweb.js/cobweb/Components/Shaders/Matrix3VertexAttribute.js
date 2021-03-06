
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Shaders/X3DVertexAttributeNode",
	"cobweb/Bits/X3DConstants",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DVertexAttributeNode, 
          X3DConstants)
{
"use strict";

	function Matrix3VertexAttribute (executionContext)
	{
		X3DVertexAttributeNode .call (this, executionContext);

		this .addType (X3DConstants .Matrix3VertexAttribute);
	}

	Matrix3VertexAttribute .prototype = $.extend (Object .create (X3DVertexAttributeNode .prototype),
	{
		constructor: Matrix3VertexAttribute,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata", new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "name",     new Fields .SFString ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "value",    new Fields .MFMatrix3f ()),
		]),
		getTypeName: function ()
		{
			return "Matrix3VertexAttribute";
		},
		getComponentName: function ()
		{
			return "Shaders";
		},
		getContainerField: function ()
		{
			return "attrib";
		},
	});

	return Matrix3VertexAttribute;
});


