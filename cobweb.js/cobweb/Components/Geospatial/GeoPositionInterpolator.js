
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Interpolation/X3DInterpolatorNode",
	"cobweb/Components/Geospatial/X3DGeospatialObject",
	"cobweb/Browser/Geospatial/Geocentric",
	"cobweb/Bits/X3DConstants",
	"standard/Math/Numbers/Vector3",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DInterpolatorNode, 
          X3DGeospatialObject,
          Geocentric,
          X3DConstants,
          Vector3)
{
"use strict";

	function GeoPositionInterpolator (executionContext)
	{
		X3DInterpolatorNode .call (this, executionContext);
		X3DGeospatialObject .call (this, executionContext);

		this .addType (X3DConstants .GeoPositionInterpolator);

		this .geocentric = new Geocentric ();
	}

	GeoPositionInterpolator .prototype = $.extend (Object .create (X3DInterpolatorNode .prototype),
		X3DGeospatialObject .prototype,
	{
		constructor: GeoPositionInterpolator,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",         new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "geoOrigin",        new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "geoSystem",        new Fields .MFString ("GD", "WE")),
			new X3DFieldDefinition (X3DConstants .inputOnly,      "set_fraction",     new Fields .SFFloat ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "key",              new Fields .MFFloat ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "keyValue",         new Fields .MFVec3d ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,     "value_changed",    new Fields .SFVec3d ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,     "geovalue_changed", new Fields .SFVec3d ()),
		]),
		keyValue0: new Vector3 (0, 0, 0),
		keyValue1: new Vector3 (0, 0, 0),
		geovalue: new Vector3 (0, 0, 0),
		value: new Vector3 (0, 0, 0),
		getTypeName: function ()
		{
			return "GeoPositionInterpolator";
		},
		getComponentName: function ()
		{
			return "Geospatial";
		},
		getContainerField: function ()
		{
			return "children";
		},
		setup: function ()
		{
			X3DGeospatialObject .prototype .initialize .call (this);

			X3DInterpolatorNode .prototype .setup .call (this);
		},
		initialize: function ()
		{
			X3DInterpolatorNode .prototype .initialize .call (this);

			this .keyValue_ .addInterest (this, "set_keyValue__");
		},
		set_keyValue__: function ()
		{
			var
				key      = this .key_,
				keyValue = this .keyValue_;

			if (keyValue .length < key .length)
				keyValue .resize (key .length, keyValue .length ? keyValue [keyValue .length - 1] : new Fields .SFVec3f ());
		},
		interpolate: function (index0, index1, weight)
		{
			try
			{
				this .getCoord (this .keyValue_ [index0] .getValue (), this .keyValue0);
				this .getCoord (this .keyValue_ [index1] .getValue (), this .keyValue1);
	
				var coord = this .geocentric .slerp (this .keyValue0, this .keyValue1, weight);
	
				this .geovalue_changed_ = this .getGeoCoord (coord, this .geovalue);
				this .value_changed_    = coord;
			}
			catch (error)
			{ }
		},
	});

	return GeoPositionInterpolator;
});


