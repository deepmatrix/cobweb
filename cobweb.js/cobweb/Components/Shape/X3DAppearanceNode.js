
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Components/Core/X3DNode",
	"cobweb/Bits/X3DConstants",
],
function ($,
          Fields,
          X3DNode, 
          X3DConstants)
{
"use strict";

	function X3DAppearanceNode (executionContext)
	{
		X3DNode .call (this, executionContext);

		this .addType (X3DConstants .X3DAppearanceNode);
	}

	X3DAppearanceNode .prototype = $.extend (Object .create (X3DNode .prototype),
	{
		constructor: X3DAppearanceNode,
		initialize: function ()
		{
			X3DNode .prototype .initialize .call (this);
			
			this .addChildren ("transparent", new Fields .SFBool ());
		},
	});

	return X3DAppearanceNode;
});


