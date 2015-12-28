

define ([
	"jquery",
	"standard/Math/Numbers/Quaternion",
	"standard/Math/Numbers/Vector3",
	"standard/Math/Numbers/Vector4",
	"standard/Math/Algorithm",
],
function ($,
          Quaternion,
          Vector3,
          Vector4,
          Algorithm)
{
"use strict";

	var
		xAxis    = new Vector3 (1, 0, 0),
		yAxis    = new Vector3 (0, 1, 0),
		zAxis    = new Vector3 (0, 0, 1),
		from     = new Vector3 (0, 0, 0),
		to       = new Vector3 (0, 0, 0),
		cv       = new Vector3 (0, 0, 0),
		t        = new Vector3 (0, 0, 0),
		identity = new Vector4 (0, 0, 1, 0),
		result   = new Vector3 (0, 0, 0, 0);

	function Rotation4 (x, y, z, angle)
	{
		switch (arguments .length)
		{
			case 0:
			{
				this .value = new Quaternion (0, 0, 0, 1);
				return;
			}
			case 1:
			{
				this .value = arguments [0];
				return;
			}
			case 2:
			{
				var
					arg0 = arguments [0],
					arg1 = arguments [1];

				this .value = new Quaternion (0, 0, 0, 1);

				if (arg1 instanceof Vector3)
				   return this .setFromToVec (arg0, arg1);

				this .set (arg0 .x,
				           arg0 .y,
				           arg0 .z,
				           arg1);
			
			   return;
			}
			case 4:
			{
				this .value = new Quaternion (0, 0, 0, 1);
				this .set (x, y, z, angle);
				return;
			}
		}
	}

	Rotation4 .prototype =
	{
		constructor: Rotation4,
		length: 4,
		copy: function ()
		{
			var copy = Object .create (Rotation4 .prototype);
			copy .value = this .value .copy ();
			return copy;
		},
		assign: function (rotation)
		{
			this .value .assign (rotation .value);
			return this;
		},
		set: function (x, y, z, angle)
		{
			var scale = Math .sqrt (x * x + y * y + z * z);

			if (scale === 0)
			{
				this .value .set (0, 0, 0, 1);
				return this;
			}

			// Calculate quaternion

			var
				halfTheta = Algorithm .interval (angle / 2, 0, Math .PI),
				scale     = Math .sin (halfTheta) / scale;

			this .value .set (x * scale,
			                  y * scale,
			                  z * scale,
			                  Math .cos (halfTheta));
			return this;
		},
		get: function ()
		{
			var value = this .value;

			if (Math .abs (value .w) >= 1)
				return identity;

			var vector = value .imag .normalize ();

			return result .set (vector .x,
			                    vector .y,
			                    vector .z,
			                    2 * Math .acos (value .w));
		},
		setAxisAngle: function (axis, angle)
		{
			this .set (axis .x, axis .y, axis .z, angle);
		},
		setFromToVec: function (fromVec, toVec)
		{
			// https://bitbucket.org/Coin3D/coin/src/abc9f50968c9/src/base/SbRotation.cpp

			from .assign (fromVec) .normalize ();
			to   .assign (toVec)   .normalize ();

			var
				cos_angle = Algorithm .clamp (from .dot (to), -1, 1),
				crossvec  = cv .assign (from) .cross (to) .normalize (),
				crosslen  = crossvec .abs ();

			if (crosslen === 0)
			{
				// Parallel vectors
				// Check if they are pointing in the same direction.
				if (cos_angle > 0)
					this .value .set (0, 0, 0, 1); // standard rotation

				// Ok, so they are parallel and pointing in the opposite direction
				// of each other.
				else
				{
					// Try crossing with x axis.
					t  .assign (from) .cross (xAxis);

					// If not ok, cross with y axis.
					if (t .norm () === 0)
						t  .assign (from) .cross (yAxis);

					t .normalize ();

					this .value .set (t .x, t .y, t .z, 0);
				}
			}
			else
			{
				// Vectors are not parallel
				// The abs () wrapping is to avoid problems when `dot' "overflows" a tiny wee bit,
				// which can lead to sqrt () returning NaN.
				crossvec .multiply (Math .sqrt (Math .abs (1 - cos_angle) / 2));

				this .value .set (crossvec .x,
				                  crossvec .y,
				                  crossvec .z,
				                  Math .sqrt ((1 + cos_angle) / 2));
			}

			return this;
		},
		setAxis: function (vector)
		{
			this .set (vector .x, vector .y, vector .z, this .angle);
		},
		getAxis: function ()
		{
			if (Math .abs (this .value .w) >= 1)
				return zAxis;

			return this .value .imag .normalize ();
		},
		equals: function (rot)
		{
			return this .value .equals (rot .value);
		},
		inverse: function ()
		{
			this .value .inverse ();
			return this;
		},
		multLeft: function (rot)
		{
			this .value .multLeft (rot .value) .normalize ();
			return this;
		},
		multRight: function (rot)
		{
			this .value .multRight (rot .value) .normalize ();
			return this;
		},
		multVecRot: function (vector)
		{
			return this .value .multVecQuat (vector);
		},
		multRotVec: function (vector)
		{
			return this .value .multQuatVec (vector);
		},
		slerp: function (dest, t)
		{
			this .value .slerp (dest .value, t);
			return this;
		},
		toString: function ()
		{
			var r = this .get ();
			return r .x + " " +
			       r .y + " " +
			       r .z + " " +
			       r .w;
		}
	};

	var x = {
		get: function ()
		{
			return this .getAxis () .x;
		},
		set: function (value)
		{
			var r = this .get ();
			this .set (value, r [1], r [2], r [3]);
		},
		enumerable: true,
		configurable: false
	};

	var y = {
		get: function ()
		{
			return this .getAxis () .y;
		},
		set: function (value)
		{
			var r = this .get ();
			this .set (r [0], value, r [2], r [3]);
		},
		enumerable: true,
		configurable: false
	};

	var z = {
		get: function ()
		{
			return this .getAxis () .z;
		},
		set: function (value)
		{
			var r = this .get ();
			this .set (r [0], r [1], value, r [3]);
		},
		enumerable: true,
		configurable: false
	};

	var angle = {
		get: function ()
		{
			if (Math .abs (this .value .w) >= 1)
				return 0;

			return 2 * Math .acos (this .value .w);
		},
		set: function (value)
		{
			var v = this .getAxis ();
			this .set (v .x, v .y, v .z, value);
		},
		enumerable: true,
		configurable: false
	};

	Object .defineProperty (Rotation4 .prototype, "x", x);
	Object .defineProperty (Rotation4 .prototype, "y", y);
	Object .defineProperty (Rotation4 .prototype, "z", z);
	Object .defineProperty (Rotation4 .prototype, "angle", angle);

	x .enumerable = false;
	y .enumerable = false;
	z .enumerable = false;
	angle .enumerable = false;

	Object .defineProperty (Rotation4 .prototype, "0", x);
	Object .defineProperty (Rotation4 .prototype, "1", y);
	Object .defineProperty (Rotation4 .prototype, "2", z);
	Object .defineProperty (Rotation4 .prototype, "3", angle);

	$.extend (Rotation4,
	{
		Identity: new Rotation4 (),
		Matrix3: function (matrix)
		{
			var copy = Object .create (this .prototype);
			copy .value = Quaternion .Matrix3 (matrix);
			return copy;
		},
		inverse: function (rotation)
		{
			var copy = Object .create (this .prototype);
			copy .value = Quaternion .inverse (rotation .value);
			return copy;
		},
		multRight: function (lhs, rhs)
		{
			var copy = Object .create (this .prototype);
			copy .value = Quaternion .multRight (lhs .value, rhs .value);
			return copy;
		},
		slerp: function (source, destination, t)
		{
			var copy = Object .create (this .prototype);
			copy .value = Quaternion .slerp (source .value, destination .value, t);
			return copy;
		},
		squad: function (source, a, b, destination, t)
		{
			var copy = Object .create (this .prototype);
			copy .value = Quaternion .squad (source .value, a, b, destination .value, t);
			return copy;
		},
		bezier: function (source, a, b, destination, t)
		{
			var copy = Object .create (this .prototype);
			copy .value = Quaternion .bezier (source .value, a, b, destination .value, t);
			return copy;
		},
		spline: function (q0, a1, q2)
		{
			var copy = Object .create (this .prototype);
			copy .value = Quaternion .spline (q0 .value, q1 .value, q2 .value);
			return copy;
		},
	});

	return Rotation4;
});
