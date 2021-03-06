
define ([
	"jquery",
	"cobweb/Components/Rendering/X3DGeometryNode",
	"cobweb/Bits/X3DCast",
	"cobweb/Bits/X3DConstants",
	"standard/Math/Numbers/Vector3",
],
function ($,
          X3DGeometryNode,
          X3DCast,
          X3DConstants,
          Vector3)
{
"use strict";

	function X3DComposedGeometryNode (executionContext)
	{
		X3DGeometryNode .call (this, executionContext);

		this .addType (X3DConstants .X3DComposedGeometryNode);

		this .attribNodes  = [ ];
		this .colorNode    = null;
		this .texCoordNode = null;
		this .normalNode   = null;
		this .coordNode    = null;
	}

	X3DComposedGeometryNode .prototype = $.extend (Object .create (X3DGeometryNode .prototype),
	{
		constructor: X3DComposedGeometryNode,
		initialize: function ()
		{
			X3DGeometryNode .prototype .initialize .call (this);

			this .attrib_   .addInterest (this, "set_attrib__");
			this .color_    .addInterest (this, "set_color__");
			this .texCoord_ .addInterest (this, "set_texCoord__");
			this .normal_   .addInterest (this, "set_normal__");
			this .coord_    .addInterest (this, "set_coord__");

			this .set_attrib__ ();
			this .set_color__ ();
			this .set_texCoord__ ();
			this .set_normal__ ();
			this .set_coord__ ();
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
		getCoord: function ()
		{
			return this .coordNode;
		},
		set_attrib__: function ()
		{
			for (var i = 0; i < this .attribNodes .length; ++ i)
				this .attribNodes [i] .removeInterest (this, "addNodeEvent");

			this .attribNodes .length = 0;

			for (var i = 0, length = this .attrib_ .length; i < length; ++ i)
			{
				var attribNode = X3DCast (X3DConstants .X3DVertexAttributeNode, this .attrib_ [i]);

				if (attribNode)
					this .attribNodes .push (attribNode);
			}

			for (var i = 0; i < this .attribNodes .length; ++ i)
				this .attribNodes [i] .addInterest (this, "addNodeEvent");
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
		set_coord__: function ()
		{
			if (this .coordNode)
				this .coordNode .removeInterest (this, "addNodeEvent");

			this .coordNode = X3DCast (X3DConstants .X3DCoordinateNode, this .coord_);

			if (this .coordNode)
				this .coordNode .addInterest (this, "addNodeEvent");
		},
		getPolygonIndex: function (index)
		{
			return index;
		},
		getTriangleIndex: function (index)
		{
			return index;
		},
		build: function (verticesPerPolygon, polygonsSize, verticesPerFace, trianglesSize)
		{
			if (! this .coordNode || this .coordNode .isEmpty ())
				return;

			// Set size to a multiple of verticesPerPolygon.

			polygonsSize  -= polygonsSize % verticesPerPolygon;
			trianglesSize -= trianglesSize % verticesPerFace;

			var
				colorPerVertex  = this .colorPerVertex_ .getValue (),
				normalPerVertex = this .normalPerVertex_ .getValue (),
				colorNode       = this .getColor (),
				texCoordNode    = this .getTexCoord (),
				normalNode      = this .getNormal (),
				coordNode       = this .getCoord (),
				textCoords      = this .getTexCoords (),
				face            = 0;

			if (texCoordNode)
				texCoordNode .init (textCoords);
		
			// Fill GeometryNode
		
			for (var i = 0; i < trianglesSize; ++ i)
			{
				face = Math .floor (i / verticesPerFace);

				var index = this .getPolygonIndex (this .getTriangleIndex (i));

				if (colorNode)
				{
					if (colorPerVertex)
						this .addColor (colorNode .get1Color (index));
					else
						this .addColor (colorNode .get1Color (face));
				}

				if (texCoordNode)
					texCoordNode .addTexCoord (textCoords, index);
	
				if (normalNode)
				{
					if (normalPerVertex)
						this .addNormal (normalNode .get1Vector (index));

					else
						this .addNormal (normalNode .get1Vector (face));
				}

				this .addVertex (coordNode .get1Point (index));
			}
		
			// Autogenerate normal if not specified.

			if (! this .getNormal ())
				this .buildNormals (verticesPerPolygon, polygonsSize, trianglesSize);

			this .setSolid (this .solid_ .getValue ());
			this .setCCW (this .ccw_ .getValue ());
		},
		buildNormals: function (verticesPerPolygon, polygonsSize, trianglesSize)
		{
			var normals = this .createNormals (verticesPerPolygon, polygonsSize);

			for (var i = 0; i < trianglesSize; ++ i)
				this .addNormal (normals [this .getTriangleIndex (i)]);
		},
		createNormals: function (verticesPerPolygon, polygonsSize)
		{
			var normals = this .createFaceNormals (verticesPerPolygon, polygonsSize);
		
			if (this .normalPerVertex_ .getValue ())
			{
				var normalIndex = [ ];
		
				for (var i = 0; i < polygonsSize; ++ i)
				{
					var index = this .getPolygonIndex (i);

					if (! normalIndex [index])
						normalIndex [index] = [ ];

					normalIndex [index] .push (i);
				}

				return this .refineNormals (normalIndex, normals, Math .PI);
			}
		
			return normals;
		},
		createFaceNormals: function (verticesPerPolygon, polygonsSize)
		{
			var
				cw      = ! this .ccw_ .getValue (),
				coord   = this .coordNode,
				normals = [ ];

			for (var i = 0; i < polygonsSize; i += verticesPerPolygon)
			{
				var normal = this .getPolygonNormal (verticesPerPolygon, coord);

				if (cw)
					normal .negate ();

				for (var n = 0; n < verticesPerPolygon; ++ n)
					normals .push (normal);
			}

			return normals;
		},
		getPolygonNormal: function (verticesPerPolygon, coord)
		{
			// Determine polygon normal.
			// We use Newell's method https://www.opengl.org/wiki/Calculating_a_Surface_Normal here:

			var
				normal = new Vector3 (0, 0, 0),
				next   = coord .get1Point (this .getPolygonIndex (0));

			for (var i = 0; i < verticesPerPolygon; ++ i)
			{
				var
					current = next,
					next    = coord .get1Point (this .getPolygonIndex ((i + 1) % verticesPerPolygon));

				normal .x += (current .y - next .y) * (current .z + next .z);
				normal .y += (current .z - next .z) * (current .x + next .x);
				normal .z += (current .x - next .x) * (current .y + next .y);
			}

			return normal .normalize ();
		},
	});

	return X3DComposedGeometryNode;
});


