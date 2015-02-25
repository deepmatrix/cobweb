
define ([
	"standard/Math/Numbers/Vector3",
	"standard/Math/Numbers/Vector4",
	"standard/Math/Numbers/Rotation4",
	"standard/Math/Numbers/Matrix3",
	"standard/Math/Algorithms/eigendecomposition",
],
function (Vector3, Vector4, Rotation4, Matrix3, eigendecomosition)
{
	function Matrix4 (m00, m01, m02, m03,
	                  m10, m11, m12, m13,
	                  m20, m21, m22, m23,
	                  m30, m31, m32, m33)
	{
		if (arguments .length)
		{
			for (var i = 0; i < this .length; ++ i)
				this [i] = arguments [i];
		}
		else
			this .set ();
	}

	Matrix4 .Quaternion = function (quaternion)
	{
		var
			x = quaternion .x,
			y = quaternion .y,
			z = quaternion .z,
			w = quaternion .w,
			A = y * y,
			B = z * z,
			C = x * y,
			D = z * w,
			E = z * x,
			F = y * w,
			G = x * x,
			H = y * z,
			I = x * w;

		return new Matrix4 (1 - 2 * (A + B),     2 * (C + D),     2 * (E - F), 0,
				                  2 * (C - D), 1 - 2 * (B + G),     2 * (H + I), 0,
				                  2 * (E + F),     2 * (H - I), 1 - 2 * (A + G), 0,
			                               0,               0,               0, 1);
	};

	Matrix4 .Matrix3 = function (matrix)
	{
		return new Matrix4 (matrix [0], matrix [1], matrix [2], 0,
		                    matrix [3], matrix [4], matrix [5], 0,
		                    matrix [6], matrix [7], matrix [8], 0,
		                    0, 0, 0, 1);
	};

	Matrix4 .prototype =
	{
		constructor: Matrix4,
		order: 4,
		length: 16,
		copy: function ()
		{
			return new Matrix4 (this [ 0], this [ 1], this [ 2], this [ 3],
			                    this [ 4], this [ 5], this [ 6], this [ 7],
			                    this [ 8], this [ 9], this [10], this [11],
			                    this [12], this [13], this [14], this [15]);
		},
		assign: function (matrix)
		{
			for (var i = 0; i < this .length; ++ i)
				this [i] = matrix [i];
		},
		equals: function (matrix)
		{
			for (var i = 0; i < this .length; ++ i)
			{
				if (this [i] !== matrix [i])
					return false;
			}

			return true;
		},
		origin: function ()
		{
			return new Vector3 (this [12], this [13], this [14]);
		},
		submatrix: function ()
		{
			return new Matrix3 (this [ 0], this [ 1], this [ 2],
			                    this [ 4], this [ 5], this [ 6],
			                    this [ 8], this [ 9], this [10]);
		},
		rotation: function ()
		{
			var quat = [ ];

			var i;

			// First, find largest diagonal in matrix:
			if (this [0] > this [4])
			{
				i = this [0] > this [8] ? 0 : 2;
			}
			else
			{
				i = this [4] > this [8] ? 1 : 2;
			}

			var scalerow = this [0] + this [4] + this [8];

			if (scalerow > this [i * 3 + i])
			{
				// Compute w first:
				quat [3] = Math .sqrt (scalerow + 1) / 2;

				// And compute other values:
				var d = 4 * quat [3];
				quat [0] = (this [5] - this [7]) / d;
				quat [1] = (this [6] - this [2]) / d;
				quat [2] = (this [1] - this [3]) / d;
			}
			else
			{
				// Compute x, y, or z first:
				var j = (i + 1) % 3;
				var k = (i + 2) % 3;

				// Compute first value:
				quat [i] = Math .sqrt (this [i * 3 + i] - this [j * 3 + j] - this [k * 3 + k] + 1) / 2;

				// And the others:
				var d = 4 * quat [i];
				quat [j] = (this [i * 3 + j] + this [j * 3 + i]) / d;
				quat [k] = (this [i * 3 + k] + this [k * 3 + i]) / d;
				quat [3] = (this [j * 3 + k] - this [k * 3 + j]) / d;
			}

			return new Rotation4 (new Quaternion (quat [0], quat [1], quat [2], quat [3]));
		},
		set1: function (r, c, value)
		{
			this [r * this .order + c] = value;
		},
		get1: function (r, c)
		{
			return this [r * this .order + c];
		},
		set: function (translation, rotation, scale, scaleOrientation, center)
		{
			if (arguments .length)
			{
				if (translation === null)      translation      = new Vector3 ();
				if (rotation === null)         rotation         = new Rotation4 ();
				if (scale === null)            scale            = new Vector3 (1, 1, 1);
				if (scaleOrientation === null) scaleOrientation = new Rotation4 ();
				if (center === null)           center           = new Vector3 ();

				switch (arguments .length)
				{
					case 1:
					{
						this .set ();
						this .translate (translation);
						break;
					}
					case 2:
					{
						this .set ();
						this .translate (translation);

						if (! rotation .equals (new Rotation4 ()))
							this .rotate (rotation);

						break;
					}
					case 3:
					{
						this .set ();
						this .translate (translation);

						if (! rotation .equals (new Rotation4 ()))
							this .rotate (rotation);

						if (! scale .equals (new Vector3 (1, 1, 1)))
							this .scale  (scale);

						break;
					}
					case 4:
					{
						this .set ();
						this .translate (translation);

						if (! rotation .equals (new Rotation4 ()))
							this .rotate (rotation);

						if (! scale .equals (new Vector3 (1, 1, 1)))
						{
							var hasScaleOrientation = ! scaleOrientation .equals (new Rotation4 ());

							if (hasScaleOrientation)
							{
								this .rotate (scaleOrientation);
								this .scale (scale);
								this .rotate (scaleOrientation .inverse());
							}
							else
								this .scale (scale);
						}

						break;
					}
					case 5:
					{
						// P' = T * C * R * SR * S * -SR * -C * P
						this .set ();
						this .translate (translation);

						var hasCenter = ! center .equals (new Vector3 ());

						if (hasCenter)
							this .translate (center);

						if (! rotation .equals (new Rotation4 ()))
							this .rotate (rotation);

						if (! scale .equals (new Vector3 (1, 1, 1)))
						{
							if (! scaleOrientation .equals (new Rotation4 ()))
							{
								this .rotate (scaleOrientation);
								this .scale (scale);
								this .rotate (scaleOrientation .inverse());
							}
							else
								this .scale (scale);
						}

						if (hasCenter)
							this .translate (center .negate ());

						break;
					}
					case 16:
					{
						for (var i = 0; i < this .length; ++ i)
							this [i] = arguments [i];

						break;
					}
				}
			}
			else
			{
				this [ 0] = 1; this [ 1] = 0; this [ 2] = 0; this [ 3] = 0;
				this [ 4] = 0; this [ 5] = 1; this [ 6] = 0; this [ 7] = 0;
				this [ 8] = 0; this [ 9] = 0; this [10] = 1; this [11] = 0;
				this [12] = 0; this [13] = 0; this [14] = 0; this [15] = 1;
			}
		},
		get: function (translation, rotation, scale, scaleOrientation, center)
		{
			if (translation === null)      translation      = new Vector3 ();
			if (rotation === null)         rotation         = new Rotation4 ();
			if (scale === null)            scale            = new Vector3 (1, 1, 1);
			if (scaleOrientation === null) scaleOrientation = new Rotation4 ();
			if (center === null)           center           = new Vector3 ();

			switch (arguments .length)
			{
				case 1:
				{
					translation .assign (this .origin ());
					break;
				}
				case 2:
				{
					var rot   = Matrix3 ();
					var so    = Matrix3 ();
					var scale = new Vector3 ();
					factor (translation, rot, scaleFactor, so);
					rotation .assign (Matrix4 .Matrix3 (rot) .rotation ());
					break;
				}
				case 3:
				{
					var rot   = Matrix3 ();
					var so    = Matrix3 ();
					factor (translation, rot, scaleFactor, so);
					rotation .assign (Matrix4 .Matrix3 (rot) .rotation ());
					break;
				}
				case 4:
				{
					var rot   = Matrix3 ();
					var so    = Matrix3 ();
					factor (translation, rot, scaleFactor, so);
					rotation .assign (Matrix4 .Matrix3 (rot) .rotation ());
					scaleOrientation .assign (Matrix4 .Matrix3 (so) .rotation ());
					break;
				}
				case 5:
				{
					var m = new Matrix4 ();

					m .set (center .negate ());
					m = m .multLeft (this);
					m .translate (center);

					m .get (translation, rotation, scale, scaleOrientation);
					break;
				}
			}
		},
		factor: function (translation, rotation, scale, scaleOrientation)
		{
			// (1) Get translation.
			translation .assign (this .origin ());

			// (2) Create 3x3 matrix.
			var a = this .submatrix ();

			// (3) Compute det A. If negative, set sign = -1, else sign = 1
			var det      = a .determinant ();
			var det_sign = det < 0 ? -1 : 1;

			if (det_sign * det === 0)
				return false;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             // singular

			// (4) B = A * !A  (here !A means A transpose)
			var b = a .multRight (a .transpose ());

			var e = eigendecomposition (b, evalues, evectors);

			// Find min / max eigenvalues and do ratio test to determine singularity.

			scaleOrientation .set (e .vectors [0] [0], e .vectors [0] [1], e .vectors [0] [2],
			                       e .vectors [1] [0], e .vectors [1] [1], e .vectors [1] [2],
			                       e .vectors [2] [0], e .vectors [2] [1], e .vectors [2] [2]);

			// Compute s = sqrt(evalues), with sign. Set si = s-inverse
			var si = new Matrix3 ();

			for (var i = 0; i < 3; ++ i)
			{
				scale [i]  = det_sign * Math .sqrt (e .values [i]);
				si [i * 3 + i] = 1 / scale [i];
			}

			// (5) Compute U = !R ~S R A.
			rotation .assign (scaleOrientation .multRight (si) .multRight (scaleOrientation .transpose ()) .multRight (a));

			scaleOrientation .assign (scaleOrientation .transpose ());
			return true;
		},
		determinant3: function ()
		{
			return this .determinant3_ (0, 1, 2, 0, 1, 2);
		},
		determinant3_: function (r1, r2, r3, c1, c2, c3)
		{
			var a11 = this [r1 * 4 + c1];
			var a12 = this [r1 * 4 + c2];
			var a13 = this [r1 * 4 + c3];
			var a21 = this [r2 * 4 + c1];
			var a22 = this [r2 * 4 + c2];
			var a23 = this [r2 * 4 + c3];
			var a31 = this [r3 * 4 + c1];
			var a32 = this [r3 * 4 + c2];
			var a33 = this [r3 * 4 + c3];

			var M11 =   a22 * a33 - a32 * a23;
			var M21 = -(a12 * a33 - a32 * a13);
			var M31 =   a12 * a23 - a22 * a13;

			return a11 * M11 + a21 * M21 + a31 * M31;
		},
		determinant: function ()
		{
			return this [ 3] * this .determinant3_ (1, 2, 3, 0, 1, 2) +
			       this [ 7] * this .determinant3_ (0, 2, 3, 0, 1, 2) +
			       this [11] * this .determinant3_ (0, 1, 3, 0, 1, 2) +
			       this [15] * this .determinant3_ (0, 1, 2, 0, 1, 2);
		},
		transpose: function ()
		{
			return new Matrix4 (this [0], this [4], this [8],  this [12],
			                    this [1], this [5], this [9],  this [13],
			                    this [2], this [6], this [10], this [14],
			                    this [3], this [7], this [11], this [15]);
		},
		inverse: function ()
		{
			var det = this .determinant ();

			if (det === 0)
				throw Error ("Matrix4 .inverse: determinant is 0.");

			return new Matrix4 ( this .determinant3_ (1, 2, 3, 1, 2, 3) / det,
			                    -this .determinant3_ (0, 2, 3, 1, 2, 3) / det,
			                     this .determinant3_ (0, 1, 3, 1, 2, 3) / det,
			                    -this .determinant3_ (0, 1, 2, 1, 2, 3) / det,
			                    -this .determinant3_ (1, 2, 3, 0, 2, 3) / det,
			                     this .determinant3_ (0, 2, 3, 0, 2, 3) / det,
			                    -this .determinant3_ (0, 1, 3, 0, 2, 3) / det,
			                     this .determinant3_ (0, 1, 2, 0, 2, 3) / det,
			                     this .determinant3_ (1, 2, 3, 0, 1, 3) / det,
			                    -this .determinant3_ (0, 2, 3, 0, 1, 3) / det,
			                     this .determinant3_ (0, 1, 3, 0, 1, 3) / det,
			                    -this .determinant3_ (0, 1, 2, 0, 1, 3) / det,
			                    -this .determinant3_ (1, 2, 3, 0, 1, 2) / det,
			                     this .determinant3_ (0, 2, 3, 0, 1, 2) / det,
			                    -this .determinant3_ (0, 1, 3, 0, 1, 2) / det,
			                     this .determinant3_ (0, 1, 2, 0, 1, 2) / det);
		},
		multLeft: function (matrix)
		{
			var a = this, b = matrix;

			return new Matrix4 (a [0] * b [ 0] + a [4] * b [ 1] + a [ 8] * b [ 2] + a [12] * b [ 3],
				                 a [1] * b [ 0] + a [5] * b [ 1] + a [ 9] * b [ 2] + a [13] * b [ 3],
				                 a [2] * b [ 0] + a [6] * b [ 1] + a [10] * b [ 2] + a [14] * b [ 3],
				                 a [3] * b [ 0] + a [7] * b [ 1] + a [11] * b [ 2] + a [15] * b [ 3],
				                 a [0] * b [ 4] + a [4] * b [ 5] + a [ 8] * b [ 6] + a [12] * b [ 7],
				                 a [1] * b [ 4] + a [5] * b [ 5] + a [ 9] * b [ 6] + a [13] * b [ 7],
				                 a [2] * b [ 4] + a [6] * b [ 5] + a [10] * b [ 6] + a [14] * b [ 7],
				                 a [3] * b [ 4] + a [7] * b [ 5] + a [11] * b [ 6] + a [15] * b [ 7],
				                 a [0] * b [ 8] + a [4] * b [ 9] + a [ 8] * b [10] + a [12] * b [11],
				                 a [1] * b [ 8] + a [5] * b [ 9] + a [ 9] * b [10] + a [13] * b [11],
				                 a [2] * b [ 8] + a [6] * b [ 9] + a [10] * b [10] + a [14] * b [11],
				                 a [3] * b [ 8] + a [7] * b [ 9] + a [11] * b [10] + a [15] * b [11],
				                 a [0] * b [12] + a [4] * b [13] + a [ 8] * b [14] + a [12] * b [15],
				                 a [1] * b [12] + a [5] * b [13] + a [ 9] * b [14] + a [13] * b [15],
				                 a [2] * b [12] + a [6] * b [13] + a [10] * b [14] + a [14] * b [15],
				                 a [3] * b [12] + a [7] * b [13] + a [11] * b [14] + a [15] * b [15]);
		},
		multRight: function (matrix)
		{
			var a = this, b = matrix;

			return new Matrix4 (a[ 0] * b [0] + a [ 1] * b [4] + a [ 2] * b [ 8] + a [ 3] * b [12],
				                 a[ 0] * b [1] + a [ 1] * b [5] + a [ 2] * b [ 9] + a [ 3] * b [13],
				                 a[ 0] * b [2] + a [ 1] * b [6] + a [ 2] * b [10] + a [ 3] * b [14],
				                 a[ 0] * b [3] + a [ 1] * b [7] + a [ 2] * b [11] + a [ 3] * b [15],
				                 a[ 4] * b [0] + a [ 5] * b [4] + a [ 6] * b [ 8] + a [ 7] * b [12],
				                 a[ 4] * b [1] + a [ 5] * b [5] + a [ 6] * b [ 9] + a [ 7] * b [13],
				                 a[ 4] * b [2] + a [ 5] * b [6] + a [ 6] * b [10] + a [ 7] * b [14],
				                 a[ 4] * b [3] + a [ 5] * b [7] + a [ 6] * b [11] + a [ 7] * b [15],
				                 a[ 8] * b [0] + a [ 9] * b [4] + a [10] * b [ 8] + a [11] * b [12],
				                 a[ 8] * b [1] + a [ 9] * b [5] + a [10] * b [ 9] + a [11] * b [13],
				                 a[ 8] * b [2] + a [ 9] * b [6] + a [10] * b [10] + a [11] * b [14],
				                 a[ 8] * b [3] + a [ 9] * b [7] + a [10] * b [11] + a [11] * b [15],
				                 a[12] * b [0] + a [13] * b [4] + a [14] * b [ 8] + a [15] * b [12],
				                 a[12] * b [1] + a [13] * b [5] + a [14] * b [ 9] + a [15] * b [13],
				                 a[12] * b [2] + a [13] * b [6] + a [14] * b [10] + a [15] * b [14],
				                 a[12] * b [3] + a [13] * b [7] + a [14] * b [11] + a [15] * b [15]);
		},
		multVecMatrix: function (vector)
		{
			if (vector instanceof Vector3)
			{
				var w = vector .x * this [3] + vector .y * this [7] + vector .z * this [11] + this [15];

				return new Vector3 ((vector .x * this [0] + vector .y * this [4] + vector .z * this [ 8] + this [12]) / w,
				                    (vector .x * this [1] + vector .y * this [5] + vector .z * this [ 9] + this [13]) / w,
				                    (vector .x * this [2] + vector .y * this [6] + vector .z * this [10] + this [14]) / w);
			}

			return new Vector4 (vector .x * this [0] + vector .y * this [4] + vector .z * this [ 8] + vector .w * this [12],
			                    vector .x * this [1] + vector .y * this [5] + vector .z * this [ 9] + vector .w * this [13],
			                    vector .x * this [2] + vector .y * this [6] + vector .z * this [10] + vector .w * this [14],
			                    vector .x * this [3] + vector .y * this [7] + vector .z * this [11] + vector .w * this [15]);
		},
		multMatrixVec: function (vector)
		{
			if (vector instanceof Vector3)
			{
				var w = vector .x * this [12] + vector .y * this [13] + vector .z * this [14] + this [15];

				return new Vector3 ((vector .x * this [0] + vector .y * this [1] + vector .z * this [ 2] + this [ 3]) / w,
				                    (vector .x * this [4] + vector .y * this [5] + vector .z * this [ 6] + this [ 7]) / w,
				                    (vector .x * this [8] + vector .y * this [9] + vector .z * this [10] + this [11]) / w);
			}

			return new Vector4 (vector .x * this [ 0] + vector .y * this [ 1] + vector .z * this [ 2] + vector .w * this [ 3],
			                    vector .x * this [ 4] + vector .y * this [ 5] + vector .z * this [ 6] + vector .w * this [ 7],
			                    vector .x * this [ 8] + vector .y * this [ 9] + vector .z * this [10] + vector .w * this [11],
			                    vector .x * this [12] + vector .y * this [13] + vector .z * this [14] + vector .w * this [15]);
		},
		multDirMatrix: function (vector)
		{
			return new Vector3 (vector .x * this [0] + vector .y * this [4] + vector .z * this [ 8],
			                    vector .x * this [1] + vector .y * this [5] + vector .z * this [ 9],
			                    vector .x * this [2] + vector .y * this [6] + vector .z * this [10]);
		},
		multMatrixDir: function (vector)
		{
			return new Vector3 (vector .x * this [0] + vector .y * this [1] + vector .z * this [ 2],
			                    vector .x * this [4] + vector .y * this [5] + vector .z * this [ 6],
			                    vector .x * this [8] + vector .y * this [9] + vector .z * this [10]);
		},
		translate: function (t)
		{
			this [12] += this [ 0] * t.x + this [ 4] * t.y + this [ 8] * t.z;
			this [13] += this [ 1] * t.x + this [ 5] * t.y + this [ 9] * t.z;
			this [14] += this [ 2] * t.x + this [ 6] * t.y + this [10] * t.z;
			this [15] += this [ 3] * t.x + this [ 7] * t.y + this [11] * t.z;
		},
		rotate: function (rotation)
		{
			this .assign (this .multLeft (Matrix4 .Quaternion (rotation .value)));
		},
		scale: function (scale)
		{
			this [ 0] *= scale .x;
			this [ 4] *= scale .y;
			this [ 8] *= scale .z;

			this [ 1] *= scale .x;
			this [ 5] *= scale .y;
			this [ 9] *= scale .z;

			this [ 2] *= scale .x;
			this [ 6] *= scale .y;
			this [10] *= scale .z;
		},
	};

	return Matrix4;
});
