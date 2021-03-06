
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Shaders/X3DShaderNode",
	"cobweb/Components/Networking/X3DUrlObject",
	"cobweb/Components/Shaders/X3DProgrammableShaderObject",
	"cobweb/Bits/X3DConstants",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DShaderNode, 
          X3DUrlObject, 
          X3DProgrammableShaderObject, 
          X3DConstants)
{
"use strict";

	function PackagedShader (executionContext)
	{
		X3DShaderNode .call (this, executionContext);
		X3DUrlObject .call (this, executionContext);
		X3DProgrammableShaderObject .call (this, executionContext);

		this .addType (X3DConstants .PackagedShader);
	}

	PackagedShader .prototype = $.extend (Object .create (X3DShaderNode .prototype),new X3DUrlObject (),new X3DProgrammableShaderObject (),
	{
		constructor: PackagedShader,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",   new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "url",        new Fields .MFString ()),
			new X3DFieldDefinition (X3DConstants .inputOnly,      "activate",   new Fields .SFBool ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,     "isSelected", new Fields .SFBool ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,     "isValid",    new Fields .SFBool ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "language",   new Fields .SFString ()),
		]),
		getTypeName: function ()
		{
			return "PackagedShader";
		},
		getComponentName: function ()
		{
			return "Shaders";
		},
		getContainerField: function ()
		{
			return "shaders";
		},
	});

	return PackagedShader;
});


