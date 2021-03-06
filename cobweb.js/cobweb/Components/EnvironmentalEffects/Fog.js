
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Core/X3DBindableNode",
	"cobweb/Components/EnvironmentalEffects/X3DFogObject",
	"cobweb/Bits/TraverseType",
	"cobweb/Bits/X3DConstants",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DBindableNode, 
          X3DFogObject,
          TraverseType,
          X3DConstants)
{
"use strict";

	function Fog (executionContext)
	{
		X3DBindableNode .call (this, executionContext);
		X3DFogObject    .call (this, executionContext);

		this .addType (X3DConstants .Fog);
	}

	Fog .prototype = $.extend (Object .create (X3DBindableNode .prototype),
		X3DFogObject .prototype,
	{
		constructor: Fog,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput, "metadata",        new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOnly,   "set_bind",        new Fields .SFBool ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "fogType",         new Fields .SFString ("LINEAR")),
			new X3DFieldDefinition (X3DConstants .inputOutput, "color",           new Fields .SFColor (1, 1, 1)),
			new X3DFieldDefinition (X3DConstants .inputOutput, "visibilityRange", new Fields .SFFloat ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,  "isBound",         new Fields .SFBool ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,  "bindTime",        new Fields .SFTime ()),
		]),
		getTypeName: function ()
		{
			return "Fog";
		},
		getComponentName: function ()
		{
			return "EnvironmentalEffects";
		},
		getContainerField: function ()
		{
			return "children";
		},
		initialize: function ()
		{
			X3DBindableNode .prototype .initialize .call (this);
			X3DFogObject    .prototype .initialize .call (this);
		},
		bindToLayer: function (layer)
		{
			X3DBindableNode .prototype .bindToLayer .call (this, layer);

			layer .getFogStack () .push (this);
		},
		unbindFromLayer: function (layer)
		{
			X3DBindableNode .prototype .unbindFromLayer .call (this, layer);

			layer .getFogStack () .pop (this);
		},
		removeFromLayer: function (layer)
		{
			layer .getFogStack () .remove (this);
		},
		traverse: function ()
		{
			this .getCurrentLayer () .getFogs () .push (this);
		},
	});

	return Fog;
});


