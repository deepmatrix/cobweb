
// https://github.com/r3mi/poly2tri.js

define ("cobweb/Components/Geometry3D/IndexedFaceSet",
[
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Rendering/X3DComposedGeometryNode",
	"cobweb/Bits/X3DConstants",
	"standard/Math/Numbers/Vector3",
	"standard/Math/Numbers/Matrix4",
	"standard/Math/Geometry/Triangle3",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DComposedGeometryNode, 
          X3DConstants,
          Vector3,
          Matrix4,
          Triangle3)
{
"use strict";

	var
		Triangle    = [0, 1, 2],
		Polygon     = [ ],
		normals     = [ ],
		normalIndex = [ ];

	function IndexedFaceSet (executionContext)
	{
		X3DComposedGeometryNode .call (this, executionContext);

		this .addType (X3DConstants .IndexedFaceSet);
	}

	IndexedFaceSet .prototype = $.extend (Object .create (X3DComposedGeometryNode .prototype),
	{
		constructor: IndexedFaceSet,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",        new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "solid",           new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "ccw",             new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "convex",          new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "creaseAngle",     new Fields .SFFloat ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "colorPerVertex",  new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "normalPerVertex", new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "colorIndex",      new Fields .MFInt32 ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "texCoordIndex",   new Fields .MFInt32 ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "normalIndex",     new Fields .MFInt32 ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "coordIndex",      new Fields .MFInt32 ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "attrib",          new Fields .MFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "fogCoord",        new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "color",           new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "texCoord",        new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "normal",          new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "coord",           new Fields .SFNode ()),
		]),
		getTypeName: function ()
		{
			return "IndexedFaceSet";
		},
		getComponentName: function ()
		{
			return "Geometry3D";
		},
		getContainerField: function ()
		{
			return "geometry";
		},
		getTexCoordPerVertexIndex: function (index)
		{
			if (index < this .texCoordIndex_ .length)
				return this .texCoordIndex_ [index];

			return this .coordIndex_ [index];
		},
		getColorPerVertexIndex: function (index)
		{
			if (index < this .colorIndex_ .length)
				return this .colorIndex_ [index];

			return this .coordIndex_ [index];
		},
		getColorIndex: function (index)
		{
			if (index < this .colorIndex_ .length)
				return this .colorIndex_ [index];

			return index;
		},
		getNormalPerVertexIndex: function (index)
		{
			if (index < this .normalIndex_ .length)
				return this .normalIndex_ [index];

			return this .coordIndex_ [index];
		},
		getNormalIndex: function (index)
		{
			if (index < this .normalIndex_ .length)
				return this .normalIndex_ [index];

			return index;
		},
		build: function ()
		{
			// Triangulate
			var polygons = this .triangulate ();

			// Build arrays

			if (polygons .length === 0)
				return;

			// Fill GeometryNode

			var
				colorPerVertex  = this .colorPerVertex_ .getValue (),
				normalPerVertex = this .normalPerVertex_ .getValue (),
				coordIndex      = this .coordIndex_ .getValue (),
				colorNode       = this .getColor (),
				texCoordNode    = this .getTexCoord (),
				normalNode      = this .getNormal (),
				coordNode       = this .getCoord (),
				textCoords      = this .getTexCoords (),
				face            = 0;

			if (texCoordNode)
				texCoordNode .init (textCoords);

			for (var p = 0, pl = polygons .length; p < pl; ++ p)
			{
				var
					polygon   = polygons [p],
					vertices  = polygon .vertices,
					triangles = polygon .triangles;

				for (var v = 0, tl = triangles .length; v < tl; ++ v)
				{
					var
						i     = vertices [triangles [v]],
						index = coordIndex [i] .getValue ();

					if (colorNode)
					{
						if (colorPerVertex)
							this .addColor (colorNode .get1Color (this .getColorPerVertexIndex (i)));
						else
							this .addColor (colorNode .get1Color (this .getColorIndex (face)));
					}

					if (texCoordNode)
						texCoordNode .addTexCoord (textCoords, this .getTexCoordPerVertexIndex (i));

					if (normalNode)
					{
						if (normalPerVertex)
							this .addNormal (normalNode .get1Vector (this .getNormalPerVertexIndex (i)));

						else
							this .addNormal (normalNode .get1Vector (this .getNormalIndex (face)));
					}

					this .addVertex (coordNode .get1Point (index));
				}

				++ face;
			}

			// Autogenerate normal if not specified.

			if (! this .getNormal ())
				this .buildNormals (polygons);

			this .setSolid (this .solid_ .getValue ());
			this .setCCW (this .ccw_ .getValue ());
		},
		triangulate: function ()
		{
			var
				convex      = this .convex_ .getValue (),
				coordIndex  = this .coordIndex_ .getValue (),
				coordLength = coordIndex .length,
				polygons    = [ ];

			if (! this .getCoord ())
				return polygons;

			if (coordLength)
			{
				// Add -1 (polygon end marker) to coordIndex if not present.
				if (this .coordIndex_ [coordLength - 1] > -1)
				{
					this .coordIndex_ .push (-1);

					++ coordLength;
				}

				// Construct triangle array and determine the number of used points.
				var vertices = [ ];

				for (var i = 0; i < coordLength; ++ i)
				{
					var index = coordIndex [i] .getValue ();
	
					if (index > -1)
					{
						// Add vertex index.
						vertices .push (i);
					}
					else
					{
						// Negativ index.

						if (vertices .length)
						{
							// Closed polygon.
							if (vertices [0] === vertices [vertices .length - 1])
								vertices .pop ();

							switch (vertices .length)
							{
								case 0:
								case 1:
								case 2:
								{
									vertices .length = 0;
									break;
								}
								case 3:
								{
									// Add polygon with one triangle.
									polygons .push ({ vertices: vertices, triangles: Triangle });
									vertices = [ ];
									break;
								}
								default:
								{
									// Triangulate polygons.
									var
										triangles = [ ],
										polygon   = { vertices: vertices, triangles: triangles };

									if (convex)
										this .triangulateConvexPolygon (polygon);
									else
										this .triangulatePolygon (polygon);

									if (triangles .length < 3)
										vertices .length = 0;
									else
									{
										polygons .push (polygon);
										vertices = [ ];
									}

									break;
								}
							}
						}
					}
				}
			}

			return polygons;
		},
		triangulatePolygon: function (polygon)
		{
			// Transform vertices to 2D space.

			var
				vertices   = polygon .vertices,
				triangles  = polygon .triangles,
				coordIndex = this .coordIndex_ .getValue (),
				coord      = this .getCoord ();

			for (var i = 0, length = vertices .length; i < length; ++ i)
			{
				var vertex = coord .get1Point (coordIndex [vertices [i]] .getValue ()) .copy ();

				vertex .index = i;

				Polygon [i] = vertex;
			}

			Polygon .length = length;

			Triangle3 .triangulatePolygon (Polygon, triangles);

			for (var i = 0, length = triangles .length; i < length; ++ i)
				triangles [i] = triangles [i] .index;
		},
		triangulateConvexPolygon: function (polygon)
		{
			var
				vertices  = polygon .vertices,
				triangles = polygon .triangles;

			// Fallback: Very simple triangulation for convex polygons.
			for (var i = 1, length = vertices .length - 1; i < length; ++ i)
				triangles .push (0, i, i + 1);
		},
		buildNormals: function (polygons)
		{
			var
				first   = 0,
				normals = this .createNormals (polygons);

			for (var p = 0, pl = polygons .length; p < pl; ++ p)
			{
				var
					polygon   = polygons [p],
					vertices  = polygon .vertices,
					triangles = polygon .triangles;

				for (var v = 0, tl = triangles .length; v < tl; ++ v)
				{
					this .addNormal (normals [first + triangles [v]]);
				}

				first += vertices .length;
			}
		},
		createNormals: function (polygons)
		{
			var
				cw          = ! this .ccw_ .getValue (),
				coordIndex  = this .coordIndex_ .getValue (),
				coord       = this .getCoord (),
				normal      = null;

			normals     .length = 0;
			normalIndex .length = 0;

			for (var p = 0, pl = polygons .length; p < pl; ++ p)
			{
				var
					polygon  = polygons [p],
					vertices = polygon .vertices,
					length   = vertices .length;

				switch (length)
				{
					case 3:
					{
						normal = coord .getNormal (coordIndex [vertices [0]] .getValue (),
						                           coordIndex [vertices [1]] .getValue (),
						                           coordIndex [vertices [2]] .getValue ());
						break;
					}
					case 4:
					{
						normal = coord .getQuadNormal (coordIndex [vertices [0]] .getValue (),
						                               coordIndex [vertices [1]] .getValue (),
						                               coordIndex [vertices [2]] .getValue (),
						                               coordIndex [vertices [3]] .getValue ());
						break;
					}
					default:
					{
						normal = this .getPolygonNormal (vertices, coordIndex, coord);
						break;
					}
				}

				// Add a normal index for each point.
				for (var i = 0; i < length; ++ i)
				{
					var index = coordIndex [vertices [i]] .getValue ();

					if (! normalIndex [index])
						normalIndex [index] = [ ];

					normalIndex [index] .push (normals .length + i);
				}

				if (cw)
					normal .negate ();

				// Add this normal for each vertex.

				for (var i = 0, nl = length; i < nl; ++ i)
					normals .push (normal);
			}

			return this .refineNormals (normalIndex, normals, this .creaseAngle_ .getValue ());
		},
		getPolygonNormal: function (vertices, coordIndex, coord)
		{
			// Determine polygon normal.
			// We use Newell's method https://www.opengl.org/wiki/Calculating_a_Surface_Normal here:

			var
				normal = new Vector3 (0, 0, 0),
				next   = coord .get1Point (coordIndex [vertices [0]] .getValue ());

			for (var i = 0, length = vertices .length; i < length; ++ i)
			{
				var
					current = next,
					next    = coord .get1Point (coordIndex [vertices [(i + 1) % length]] .getValue ());

				normal .x += (current .y - next .y) * (current .z + next .z);
				normal .y += (current .z - next .z) * (current .x + next .x);
				normal .z += (current .x - next .x) * (current .y + next .y);
			}

			return normal .normalize ();
		},
	});

	return IndexedFaceSet;
});


