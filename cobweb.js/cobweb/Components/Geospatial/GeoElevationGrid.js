
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Rendering/X3DGeometryNode",
	"cobweb/Components/Geospatial/X3DGeospatialObject",
	"cobweb/Bits/X3DConstants",
	"cobweb/Bits/X3DCast",
	"standard/Math/Geometry/Triangle3",
	"standard/Math/Numbers/Vector2",
	"standard/Math/Numbers/Vector3",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DGeometryNode, 
          X3DGeospatialObject, 
          X3DConstants,
          X3DCast,
          Triangle3,
          Vector2,
          Vector3)
{
"use strict";

	function GeoElevationGrid (executionContext)
	{
		X3DGeometryNode     .call (this, executionContext);
		X3DGeospatialObject .call (this, executionContext);

		this .addType (X3DConstants .GeoElevationGrid);

		this .colorNode    = null;
		this .texCoordNode = null;
		this .normalNode   = null;
	}

	GeoElevationGrid .prototype = $.extend (Object .create (X3DGeometryNode .prototype),
		X3DGeospatialObject .prototype,
	{
		constructor: GeoElevationGrid,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",        new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "geoOrigin",       new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "geoSystem",       new Fields .MFString ("GD", "WE")),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "geoGridOrigin",   new Fields .SFVec3d ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "xDimension",      new Fields .SFInt32 ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "zDimension",      new Fields .SFInt32 ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "xSpacing",        new Fields .SFDouble (1)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "zSpacing",        new Fields .SFDouble (1)),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "yScale",          new Fields .SFFloat (1)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "solid",           new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "ccw",             new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "creaseAngle",     new Fields .SFDouble ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "colorPerVertex",  new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "normalPerVertex", new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "color",           new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "texCoord",        new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "normal",          new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "height",          new Fields .MFDouble ()),
		]),
		getTypeName: function ()
		{
			return "GeoElevationGrid";
		},
		getComponentName: function ()
		{
			return "Geospatial";
		},
		getContainerField: function ()
		{
			return "geometry";
		},
		initialize: function ()
		{
			X3DGeometryNode     .prototype .initialize .call (this);
			X3DGeospatialObject .prototype .initialize .call (this);

			this .color_    .addInterest (this, "set_color__");
			this .texCoord_ .addInterest (this, "set_texCoord__");
			this .normal_   .addInterest (this, "set_normal__");
		
			this .set_color__ ();
			this .set_texCoord__ ();
			this .set_normal__ ();
		},
		set_color__: function ()
		{
			if (this .colorNode)
			{
				this .colorNode .removeInterest (this, "addNodeEvent");
				this .colorNode .removeInterest (this, "set_transparent__");
			}

			this .colorNode = X3DCast (X3DConstants .X3DColorNode, this .color_);

			if (this .colorNode)
			{
				this .colorNode .addInterest (this, "addNodeEvent");
				this .colorNode .addInterest (this, "set_transparent__");

				this .set_transparent__ ();
			}
			else
				this .transparent_ = false;
		},
		set_transparent__: function ()
		{
			this .transparent_ = this .colorNode .isTransparent ();
		},
		set_texCoord__: function ()
		{
			if (this .texCoordNode)
				this .texCoordNode .removeInterest (this, "addNodeEvent");

			this .texCoordNode = X3DCast (X3DConstants .X3DTextureCoordinateNode, this .texCoord_);

			if (this .texCoordNode)
				this .texCoordNode .addInterest (this, "addNodeEvent");

			this .setCurrentTexCoord (this .texCoordNode);
		},
		set_normal__: function ()
		{
			if (this .normalNode)
				this .normalNode .removeInterest (this, "addNodeEvent");

			this .normalNode = X3DCast (X3DConstants .X3DNormalNode, this .normal_);

			if (this .normalNode)
				this .normalNode .addInterest (this, "addNodeEvent");
		},
		getAttrib: function ()
		{
			return this .attribNodes;
		},
		getColor: function ()
		{
			return this .colorNode;
		},
		getTexCoord: function ()
		{
			return this .texCoordNode;
		},
		getNormal: function ()
		{
			return this .normalNode;
		},
		getHeight: function (index)
		{
			if (index < this .height_ .length)
				return this .height_ [index] * this .yScale_ .getValue ();

			return 0;
		},
		createTexCoords: function ()
		{
			var
				texCoords  = [ ],
				xDimension = this .xDimension_ .getValue (),
				zDimension = this .zDimension_ .getValue (),
				xSize      = xDimension - 1,
				zSize      = zDimension - 1;

			for (var z = 0; z < zDimension; ++ z)
			{
				for (var x = 0; x < xDimension; ++ x)
					texCoords .push (new Vector2 (x / xSize, z / zSize));
			}

			return texCoords;
		},
		createNormals: function (points, coordIndex, creaseAngle)
		{
			var
				cw          = ! this .ccw_ .getValue (),
				normalIndex = [ ],
				normals     = [ ];

			for (var p = 0; p < points .length; ++ p)
				normalIndex [p] = [ ];

			for (var c = 0; c < coordIndex .length; c += 3)
			{
				var
					c0 = coordIndex [c],
					c1 = coordIndex [c + 1],
					c2 = coordIndex [c + 2];
				
				normalIndex [c0] .push (normals .length);
				normalIndex [c1] .push (normals .length + 1);
				normalIndex [c2] .push (normals .length + 2);

				var normal = Triangle3 .normal (points [c0], points [c1], points [c2], new Vector3 (0, 0, 0));

				if (cw)
					normal .negate ();

				normals .push (normal);
				normals .push (normal);
				normals .push (normal);
			}

			return this .refineNormals (normalIndex, normals, this .creaseAngle_ .getValue ());
		},
		createCoordIndex: function ()
		{
			// p1 - p4 
			//  | \ |
			// p2 - p3

			var
				coordIndex = [ ],
				xDimension = this .xDimension_ .getValue (),
				zDimension = this .zDimension_ .getValue (),
				xSize      = xDimension - 1,
				zSize      = zDimension - 1;

			for (var z = 0; z < zSize; ++ z)
			{
				for (var x = 0; x < xSize; ++ x)
				{
					var
						i1 =       z * xDimension + x,
						i2 = (z + 1) * xDimension + x,
						i3 = (z + 1) * xDimension + (x + 1),
						i4 =       z * xDimension + (x + 1);

					coordIndex .push (i1); // p1
					coordIndex .push (i3); // p3
					coordIndex .push (i2); // p2

					coordIndex .push (i1); // p1
					coordIndex .push (i4); // p4
					coordIndex .push (i3); // p3
				}
			}

			return coordIndex;
		},
		createPoints: function ()
		{
			var
				points     = [ ],
				xDimension = this .xDimension_ .getValue (),
				zDimension = this .zDimension_ .getValue (),
				xSpacing   = this .xSpacing_ .getValue (),
				zSpacing   = this .zSpacing_ .getValue ();

			// When the geoSystem is "GD", xSpacing refers to the number of units of longitude in angle base units between
			// adjacent height values and zSpacing refers to the number of units of latitude in angle base units between
			// vertical height values.
		
			// When the geoSystem is "UTM", xSpacing refers to the number of eastings (length base units) between adjacent
			// height values and zSpacing refers to the number of northings (length base units) between vertical height values.

			if (this .getStandardOrder ())
			{
				for (var z = 0; z < zDimension; ++ z)
				{
					for (var x = 0; x < xDimension; ++ x)
					{
						var point = new Vector3 (zSpacing * z, // latitude, northing
						                         xSpacing * x, // longitude, easting
						                         this .getHeight (x + z * xDimension));
	
						point .add (this .geoGridOrigin_ .getValue ());

						points .push (this .getCoord (point, point));
					}
				}
			}
			else
			{
				for (var z = 0; z < zDimension; ++ z)
				{
					for (var x = 0; x < xDimension; ++ x)
					{
						var point = new Vector3 (xSpacing * x, // longitude, easting
						                         zSpacing * z, // latitude, northing
						                         this .getHeight (x + z * xDimension));
	
						point .add (this .geoGridOrigin_ .getValue ());

						points .push (this .getCoord (point, point));
					}
				}
			}

			return points;
		},
		build: function ()
		{
			if (this .xDimension_ .getValue () < 2 || this .zDimension_ .getValue () < 2)
				return;

			var
				colorPerVertex  = this .colorPerVertex_ .getValue (),
				normalPerVertex = this .normalPerVertex_ .getValue (),
				coordIndex      = this .createCoordIndex (),
				colorNode       = this .getColor (),
				texCoordNode    = this .getTexCoord (),
				normalNode      = this .getNormal (),
				points          = this .createPoints (),
				face            = 0;

			// Vertex attribute

			//std::vector <std::vector <float>> attribArrays (attribNodes .size ());

			//for (size_t a = 0, size = attribNodes .size (); a < size; ++ a)
			//	attribArrays [a] .reserve (coordIndex .size ());

			if (texCoordNode)
				texCoordNode .init (this .getTexCoords ());
			else
			{
				var texCoords = this .createTexCoords ();
				this .getTexCoords () .push ([ ]);
			}

			// Build geometry

			for (var c = 0; c < coordIndex .length; ++ face)
			{
				for (var p = 0; p < 6; ++ p, ++ c)
				{
					var index = coordIndex [c];

					//for (size_t a = 0, size = attribNodes .size (); a < size; ++ a)
					//	attribNodes [a] -> addValue (attribArrays [a], i);

					if (colorNode)
					{
						if (colorPerVertex)
							this .addColor (colorNode .get1Color (index));
						else
							this .addColor (colorNode .get1Color (face));
					}
						
					if (texCoordNode)
						texCoordNode .addTexCoord (this .getTexCoords (), index);

					else
					{
						var t = texCoords [index];
						this .getTexCoords () [0] .push (t .x, t .y, 0, 1);
					}

					if (normalNode)
					{
						if (normalPerVertex)
							this .addNormal (normalNode .get1Vector (index));

						else
							this .addNormal (normalNode .get1Vector (face));
					}

					this .addVertex (points [index]);
				}
			}

			// Add auto-generated normals if needed.

			if (! normalNode)
			{
				var normals = this .createNormals (points, coordIndex);

				for (var i = 0; i < normals .length; ++ i)
					this .addNormal (normals [i]);
			}

			this .setSolid (this .solid_ .getValue ());
			this .setCCW (this .ccw_ .getValue ());
		},
	});

	return GeoElevationGrid;
});


