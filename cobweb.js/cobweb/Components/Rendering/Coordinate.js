
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Rendering/X3DCoordinateNode",
	"cobweb/Bits/X3DConstants",
	"standard/Math/Geometry/Triangle3",
	"standard/Math/Numbers/Vector3",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DCoordinateNode, 
          X3DConstants,
          Triangle3,
          Vector3)
{
"use strict";

	function Coordinate (executionContext)
	{
		X3DCoordinateNode .call (this, executionContext .getBrowser (), executionContext);

		this .addType (X3DConstants .Coordinate);
	}

	Coordinate .prototype = $.extend (Object .create (X3DCoordinateNode .prototype),
	{
		constructor: Coordinate,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput, "metadata", new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "point",    new Fields .MFVec3f ()),
		]),
		getTypeName: function ()
		{
			return "Coordinate";
		},
		getComponentName: function ()
		{
			return "Rendering";
		},
		getContainerField: function ()
		{
			return "coord";
		},
		isEmpty: function ()
		{
			return this .point_ .length == 0;
		},
		getSize: function ()
		{
			return this .point_ .length;
		},
		getPoint: function (index)
		{
			// The index cannot be less than 0.

			if (index < this .point_ .length)
				return this .point_ [index] .getValue ();

			return new Vector3 (0, 0, 0);
		},
		getNormal: function (index1, index2, index3)
		{
			// The index[1,2,3] cannot be less than 0.

			var length = this .point_ .length;

			if (index1 < length && index2 < length && index3 < length)
				return Triangle3 .normal (this .point_ [index1] .getValue (),
				                          this .point_ [index2] .getValue (),
				                          this .point_ [index3] .getValue (),
				                          new Vector3 (0, 0, 0));

			return new Vector3 (0, 0, 0);
		},
		getQuadNormal: function (index1, index2, index3, index4)
		{
			// The index[1,2,3,4] cannot be less than 0.

			var length = this .point_ .length;

			if (index1 < length && index2 < length && index3 < length && index4 < length)
				return Triangle3 .quadNormal (this .point_ [index1] .getValue (),
				                              this .point_ [index2] .getValue (),
				                              this .point_ [index3] .getValue (),
				                              this .point_ [index4] .getValue (),
				                              new Vector3 (0, 0, 0));

			return new Vector3 (0, 0, 0);
		},
	});

	return Coordinate;
});


