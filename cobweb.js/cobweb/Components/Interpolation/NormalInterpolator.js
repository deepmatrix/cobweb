
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Interpolation/X3DInterpolatorNode",
	"cobweb/Bits/X3DConstants",
	"standard/Math/Numbers/Vector3",
	"standard/Math/Algorithm",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DInterpolatorNode, 
          X3DConstants,
          Vector3,
          Algorithm)
{
"use strict";

	function NormalInterpolator (executionContext)
	{
		X3DInterpolatorNode .call (this, executionContext);

		this .addType (X3DConstants .NormalInterpolator);
	}

	NormalInterpolator .prototype = $.extend (Object .create (X3DInterpolatorNode .prototype),
	{
		constructor: NormalInterpolator,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput, "metadata",      new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOnly,   "set_fraction",  new Fields .SFFloat ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "key",           new Fields .MFFloat ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "keyValue",      new Fields .MFVec3f ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,  "value_changed", new Fields .MFVec3f ()),
		]),
		keyValue0: new Vector3 (0, 0, 0),
		keyValue1: new Vector3 (0, 0, 0),
		getTypeName: function ()
		{
			return "NormalInterpolator";
		},
		getComponentName: function ()
		{
			return "Interpolation";
		},
		getContainerField: function ()
		{
			return "children";
		},
		initialize: function ()
		{
			X3DInterpolatorNode .prototype .initialize .call (this);

			this .keyValue_ .addInterest (this, "set_keyValue__");
		},
		set_keyValue__: function () { },
		interpolate: function (index0, index1, weight)
		{
			var
				keyValue      = this .keyValue_ .getValue (),
				value_changed = this .value_changed_ .getValue (),
				size          = this .key_ .length > 1 ? Math .floor (keyValue .length / this .key_ .length) : 0;

			index0 *= size;
			index1  = index0 + size;

			this .value_changed_ .length = size;

			for (var i = 0; i < size; ++ i)
			{
				try
				{
					value_changed [i] .set (Algorithm .simpleSlerp (this .keyValue0 .assign (keyValue [index0 + i] .getValue ()),
					                                                this .keyValue1 .assign (keyValue [index1 + i] .getValue ()),
					                                                weight));
				}
				catch (error)
				{ }
			}

			this .value_changed_ .addEvent ();
		},
	});

	return NormalInterpolator;
});


