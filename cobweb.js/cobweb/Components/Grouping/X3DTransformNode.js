
define ([
	"jquery",
	"cobweb/Components/Grouping/X3DTransformMatrix3DNode",
	"cobweb/Bits/X3DConstants",
],
function ($,
          X3DTransformMatrix3DNode, 
          X3DConstants)
{
"use strict";

	function X3DTransformNode (executionContext)
	{
		X3DTransformMatrix3DNode .call (this, executionContext);

		this .addType (X3DConstants .X3DTransformNode);
	}

	X3DTransformNode .prototype = $.extend (Object .create (X3DTransformMatrix3DNode .prototype),
	{
		constructor: X3DTransformNode,
		initialize: function ()
		{
			X3DTransformMatrix3DNode .prototype .initialize .call (this);
			
			this .addInterest (this, "eventsProcessed");

			this .eventsProcessed ();
		},
		eventsProcessed: function ()
		{
			X3DTransformMatrix3DNode .prototype .eventsProcessed .call (this); // XXX, empty function call???
			
			this .setHidden (this .scale_ .x === 0 ||
			                 this .scale_ .y === 0 ||
			                 this .scale_ .z === 0);

			this .setTransform (this .translation_      .getValue (),
			                    this .rotation_         .getValue (),
			                    this .scale_            .getValue (),
			                    this .scaleOrientation_ .getValue (),
			                    this .center_           .getValue ());
		},
	});

	return X3DTransformNode;
});


