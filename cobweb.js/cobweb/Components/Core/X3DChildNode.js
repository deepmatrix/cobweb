
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

	function X3DChildNode (executionContext)
	{
		if (this .getExecutionContext ())
			return;

		X3DNode .call (this, executionContext);

		this .addType (X3DConstants .X3DChildNode);

		this .addChildren ("isCameraObject", new Fields .SFBool ());
	}

	X3DChildNode .prototype = $.extend (Object .create (X3DNode .prototype),
	{
		constructor: X3DChildNode,
		setCameraObject: function (value)
		{
			if (value !== this .isCameraObject_ .getValue ())
				this .isCameraObject_ = value;
		},
		getCameraObject: function ()
		{
			return this .isCameraObject_ .getValue ();
		},
	});

	return X3DChildNode;
});


