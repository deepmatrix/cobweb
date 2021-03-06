
define ([
	"jquery",
	"cobweb/Basic/X3DBaseNode",
	"cobweb/Fields",
	"standard/Math/Numbers/Complex",
	"standard/Math/Numbers/Vector3",
],
function ($,
          X3DBaseNode,
          Fields,
          Complex,
          Vector3)
{
"use strict";
	
	var half = new Complex (0.5, 0.5);

	function Disk2DOptions (executionContext)
	{
		X3DBaseNode .call (this, executionContext);

		this .addChildren ("segments", new Fields .SFInt32 (40))

		this .circleVertices = [ ];
		this .diskTexCoords  = [ ];
		this .diskNormals    = [ ];
		this .diskVertices   = [ ];
	}

	Disk2DOptions .prototype = $.extend (Object .create (X3DBaseNode .prototype),
	{
		constructor: Disk2DOptions,
		getTypeName: function ()
		{
			return "Disk2DOptions";
		},
		getComponentName: function ()
		{
			return "Cobweb";
		},
		getContainerField: function ()
		{
			return "circle2DOptions";
		},
		initialize: function ()
		{
			this .addInterest (this, "build");

			this .build ();
		},
		getCircleVertices: function ()
		{
			return this .circleVertices;
		},
		getDiskTexCoords: function ()
		{
			return this .diskTexCoords;
		},
		getDiskNormals: function ()
		{
			return this .diskNormals;
		},
		getDiskVertices: function ()
		{
			return this .diskVertices;
		},
		build: function ()
		{
			var
				segments = this .segments_ .getValue (),
				angle    = Math .PI * 2 / segments;
		
			this .circleVertices .length = 0;
			this .diskTexCoords  .length = 0;
			this .diskNormals    .length = 0;
			this .diskVertices   .length = 0;

			for (var n = 0; n < segments; ++ n)
			{
				var
					theta1    = angle * n,
					theta2    = angle * (n + 1),
					texCoord1 = Complex .Polar (0.5, theta1) .add (half),
					texCoord2 = Complex .Polar (0.5, theta2) .add (half),
					point1    = Complex .Polar (1, theta1),
					point2    = Complex .Polar (1, theta2);
		
				// Circle

				this .circleVertices .push (point1 .real, point1 .imag, 0, 1);

				// Disk

				this .diskTexCoords .push (0.5, 0.5, 0, 1,
				                           texCoord1 .real, texCoord1 .imag, 0, 1,
				                           texCoord2 .real, texCoord2 .imag, 0, 1);

				this .diskNormals .push (0, 0, 1,  0, 0, 1,  0, 0, 1);

				this .diskVertices .push (0, 0, 0, 1,
				                          point1 .real, point1 .imag, 0, 1,
				                          point2 .real, point2 .imag, 0, 1);
			}
		},
	});

	return Disk2DOptions;
});
