
define ([
	"jquery",
	"cobweb/Components/Rendering/X3DGeometricPropertyNode",
	"cobweb/Bits/X3DConstants",
],
function ($,
          X3DGeometricPropertyNode, 
          X3DConstants)
{
"use strict";

	function X3DTextureCoordinateNode (executionContext)
	{
		X3DGeometricPropertyNode .call (this, executionContext);

		this .addType (X3DConstants .X3DTextureCoordinateNode);
	}

	X3DTextureCoordinateNode .prototype = $.extend (Object .create (X3DGeometricPropertyNode .prototype),
	{
		constructor: X3DTextureCoordinateNode,
		init: function (texCoords)
		{
			texCoords .push ([ ]);
		},
		addTexCoord: function (texCoord, index)
		{
			this .addTexCoordToChannel (texCoord [0], index);
		},
	});

	return X3DTextureCoordinateNode;
});


