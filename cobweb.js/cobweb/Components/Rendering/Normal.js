
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Rendering/X3DNormalNode",
	"cobweb/Bits/X3DConstants",
	"standard/Math/Numbers/Vector3",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DNormalNode, 
          X3DConstants,
          Vector3)
{
"use strict";

	function Normal (executionContext)
	{
		X3DNormalNode .call (this, executionContext);

		this .addType (X3DConstants .Normal);

		this .vector = this .vector_ .getValue ();
	}

	Normal .prototype = $.extend (Object .create (X3DNormalNode .prototype),
	{
		constructor: Normal,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput, "metadata", new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "vector",   new Fields .MFVec3f ()),
		]),
		getTypeName: function ()
		{
			return "Normal";
		},
		getComponentName: function ()
		{
			return "Rendering";
		},
		getContainerField: function ()
		{
			return "normal";
		},
		get1Vector: function (index)
		{
			if (index >= 0 && index < this .vector .length)
				return this .vector [index] .getValue ();

			return new Vector3 (0, 0, 0);
		},
	});

	return Normal;
});


