
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Core/X3DNode",
	"cobweb/Components/Core/X3DMetadataObject",
	"cobweb/Bits/X3DConstants",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DNode, 
          X3DMetadataObject, 
          X3DConstants)
{
"use strict";

	function MetadataBoolean (executionContext)
	{
		X3DNode           .call (this, executionContext);
		X3DMetadataObject .call (this, executionContext);

		this .addType (X3DConstants .MetadataBoolean);
	}

	MetadataBoolean .prototype = $.extend (Object .create (X3DNode .prototype),
		X3DMetadataObject .prototype,
	{
		constructor: MetadataBoolean,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput, "metadata",  new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "name",      new Fields .SFString ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "reference", new Fields .SFString ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "value",     new Fields .MFBool ()),
		]),
		getTypeName: function ()
		{
			return "MetadataBoolean";
		},
		getComponentName: function ()
		{
			return "Core";
		},
		getContainerField: function ()
		{
			return "metadata";
		},
	});

	return MetadataBoolean;
});


