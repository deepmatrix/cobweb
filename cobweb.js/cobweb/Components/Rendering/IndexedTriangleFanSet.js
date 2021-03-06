
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Rendering/X3DComposedGeometryNode",
	"cobweb/Bits/X3DConstants",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DComposedGeometryNode, 
          X3DConstants)
{
"use strict";

	function IndexedTriangleFanSet (executionContext)
	{
		X3DComposedGeometryNode .call (this, executionContext);

		this .addType (X3DConstants .IndexedTriangleFanSet);

		this .triangleIndex = [ ];
	}

	IndexedTriangleFanSet .prototype = $.extend (Object .create (X3DComposedGeometryNode .prototype),
	{
		constructor: IndexedTriangleFanSet,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",        new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "solid",           new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "ccw",             new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "colorPerVertex",  new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "normalPerVertex", new Fields .SFBool (true)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "index",           new Fields .MFInt32 ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "attrib",          new Fields .MFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "fogCoord",        new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "color",           new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "texCoord",        new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "normal",          new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOutput,    "coord",           new Fields .SFNode ()),
		]),
		getTypeName: function ()
		{
			return "IndexedTriangleFanSet";
		},
		getComponentName: function ()
		{
			return "Rendering";
		},
		getContainerField: function ()
		{
			return "geometry";
		},
		initialize: function ()
		{
			X3DComposedGeometryNode .prototype .initialize .call (this);
		
			this .index_ .addInterest (this, "set_index__");
		
			this .set_index__ ();
		},
		set_index__: function ()
		{
			// Build coordIndex

			var
				index         = this .index_ .getValue (),
				triangleIndex = this .triangleIndex;
		
			triangleIndex .length = 0;
		
			for (var i = 0, length = index .length; i < length; ++ i)
			{
				var first = index [i] .getValue ();
		
				if (++ i < length)
				{
					var second = index [i] .getValue ();

					if (second < 0)
						continue;
	
					for (++ i; i < length; ++ i)
					{
						var third = index [i] .getValue ();

						if (third < 0)
							break;

						triangleIndex .push (first, second, third);

						second = third;
					}
				}
			}
		},
		getPolygonIndex: function (index)
		{
			return this .triangleIndex [index];
		},
		build: function ()
		{
			X3DComposedGeometryNode .prototype .build .call (this, 3, this .triangleIndex .length, 3, this .triangleIndex .length);
		},
	});

	return IndexedTriangleFanSet;
});


