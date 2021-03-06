
define ([
	"jquery",
	"cobweb/Components/Core/X3DNode",
	"cobweb/Bits/X3DConstants",
],
function ($,
          X3DNode, 
          X3DConstants)
{
"use strict";

	function X3DParticlePhysicsModelNode (executionContext)
	{
		X3DNode .call (this, executionContext);

		this .addType (X3DConstants .X3DParticlePhysicsModelNode);
	}

	X3DParticlePhysicsModelNode .prototype = $.extend (Object .create (X3DNode .prototype),
	{
		constructor: X3DParticlePhysicsModelNode,
		addForce: function ()
		{ },
	});

	return X3DParticlePhysicsModelNode;
});


