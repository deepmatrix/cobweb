
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Picking/X3DPickSensorNode",
	"cobweb/Bits/X3DConstants",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DPickSensorNode, 
          X3DConstants)
{
"use strict";

	function VolumePickSensor (executionContext)
	{
		X3DPickSensorNode .call (this, executionContext);

		this .addType (X3DConstants .VolumePickSensor);
	}

	VolumePickSensor .prototype = $.extend (Object .create (X3DPickSensorNode .prototype),
	{
		constructor: VolumePickSensor,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",         new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "enabled",          new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .outputOnly,     "isActive",         new Fields .SFBool ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "objectType",       new Fields .MFString ("ALL")),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "pickingGeometry",  new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "pickTarget",       new Fields .MFNode ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,     "pickedGeometry",   new Fields .MFNode ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "intersectionType", new Fields .SFString ("BOUNDS")),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "sortOrder",        new Fields .SFString ("CLOSEST")),
		]),
		getTypeName: function ()
		{
			return "VolumePickSensor";
		},
		getComponentName: function ()
		{
			return "Picking";
		},
		getContainerField: function ()
		{
			return "children";
		},
	});

	return VolumePickSensor;
});


