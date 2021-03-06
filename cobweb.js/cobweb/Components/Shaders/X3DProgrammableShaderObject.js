
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Bits/X3DCast",
	"cobweb/Bits/X3DConstants",
],
function ($,
          Fields,
          X3DCast,
          X3DConstants)
{
"use strict";

	var NULL = Fields .SFNode ();

	function X3DProgrammableShaderObject (executionContext)
	{
		this .addType (X3DConstants .X3DProgrammableShaderObject);
	}

	X3DProgrammableShaderObject .prototype =
	{
		constructor: X3DProgrammableShaderObject,
		initialize: function ()
		{
			this .getExecutionContext () .isLive () .addInterest (this, "set_live__");
			this .isLive () .addInterest (this, "set_live__");

			//Must not call set_live__.
		},
		set_live__: function ()
		{
			if (this .getExecutionContext () .isLive () .getValue () && this .isLive () .getValue ())
				this .addShaderFields ();
			else
				this .removeShaderFields ();
		},
		hasUserDefinedFields: function ()
		{
			return true;
		},
		addShaderFields: function ()
		{
			if (this .isValid_ .getValue ())
			{
				var
					gl                = this .getBrowser () .getContext (),
					program           = this .getProgram (),
					userDefinedFields = this .getUserDefinedFields ();
	
				this .use ();
	
				for (var name in userDefinedFields)
				{
					var
						field    = userDefinedFields [name],
						location = gl .getUniformLocation (program, name);
	
					if (location)
					{
						field ._uniformLocation = location;

						field .addInterest (this, "set_field__");

						switch (field .getType ())
						{
							case X3DConstants .SFImage:
							{
								location .array = new Int32Array (3 + field .array .length);
								break;
							}
							case X3DConstants .SFMatrix3d:
							case X3DConstants .SFMatrix3f:
							{
								location .array = new Float32Array (9);
								break;
							}
							case X3DConstants .SFMatrix4d:
							case X3DConstants .SFMatrix4f:
							{
								location .array = new Float32Array (16);
								break;
							}
							case X3DConstants .MFBool:
							case X3DConstants .MFInt32:
							{
								location .array = new Int32Array (this .getLocationLength (gl, program, field));
								break;
							}
							case X3DConstants .MFFloat:
							case X3DConstants .MFDouble:
							case X3DConstants .MFTime:
							{
								location .array = new Float32Array (this .getLocationLength (gl, program, field));
								break;
							}
							case X3DConstants .MFImage:
							{
								location .array = new Int32Array (this .getImagesLength (field));
								break;
							}
							case X3DConstants .MFMatrix3d:
							case X3DConstants .MFMatrix3f:
							{
								location .array = new Float32Array (9 * this .getLocationLength (gl, program, field));
								break;
							}
							case X3DConstants .MFMatrix4d:
							case X3DConstants .MFMatrix4f:
							{
								location .array = new Float32Array (16 * this .getLocationLength (gl, program, field));
								break;
							}
							case X3DConstants .MFNode:
							{
								var array = field ._uniformLocation = [ ];

								for (var i = 0; ; ++ i)
								{
									var location = gl .getUniformLocation (program, name + "[" + i + "]");

									if (location)
										array [i] = location;
									else
										break;
								}

								break;
							}
							case X3DConstants .MFVec2d:
							case X3DConstants .MFVec2f:
							{
								location .array = new Float32Array (2 * this .getLocationLength (gl, program, field));
								break;
							}
							case X3DConstants .MFVec3d:
							case X3DConstants .MFVec3f:
							case X3DConstants .MFColor:
							{
								location .array = new Float32Array (3 * this .getLocationLength (gl, program, field));
								break;
							}
							case X3DConstants .MFVec4d:
							case X3DConstants .MFVec4f:
							case X3DConstants .MFColorRGBA:
							case X3DConstants .MFRotation:
							{
								location .array = new Float32Array (4 * this .getLocationLength (gl, program, field));
								break;
							}
						}
	
						this .set_field__ (field);
					}
				}
			}
		},
		removeShaderFields: function ()
		{
			if (this .isValid_ .getValue ())
			{
				var
					gl                = this .getBrowser () .getContext (),
					program           = this .getProgram (),
					userDefinedFields = this .getUserDefinedFields ();

				this .use ();

				for (var name in userDefinedFields)
				{
					var field = userDefinedFields [name];

					field .removeInterest (this, "set_field__");
	
					switch (field .getType ())
					{
						case X3DConstants .SFNode:
						{
							this .removeNode (gl, program, field ._uniformLocation);
							break;
						}
						case X3DConstants .MFNode:
						{
							var name = field .getName ();

							for (var i = 0; ; ++ i)
							{
								var location = gl .getUniformLocation (program, name + "[" + i + "]");

								if (location)
									this .removeNode (gl, program, location);
								else
									break;
							}

							break;
						}
						default:
							continue;
					}
	
					break;
				}
			}
		},
		set_field__: function (field)
		{
			var
				gl       = this .getBrowser () .getContext (),
				program  = this .getProgram (),
				location = field ._uniformLocation;

			if (location)
			{
				this .use ();
	
				switch (field .getType ())
				{
					case X3DConstants .SFBool:
					case X3DConstants .SFInt32:
					{
						gl .uniform1i (location, field .getValue ());
						return;
					}
					case X3DConstants .SFColor:
					{
						var value = field .getValue ();
						gl .uniform3f (location, value .r, value .g, value .b);
						return;
					}
					case X3DConstants .SFColorRGBA:
					{
						var value = field .getValue ();
						gl .uniform4f (location, value .r, value .g, value .b, value .a);
						return;
					}
					case X3DConstants .SFDouble:
					case X3DConstants .SFFloat:
					case X3DConstants .SFTime:
					{
						gl .uniform1f (location, field .getValue ());
						return;
					}
					case X3DConstants .SFImage:
					{
						var
							array  = location .array,
							pixels = field .array .getValue (),
							length = 3 + pixels .length;
	
						if (length !== array .length)
							array = location .array = new Int32Array (length);
	
						array [0] = field .width;
						array [1] = field .height;
						array [2] = field .comp;
	
						for (var a = 3, p = 0, length = pixels .length; p < length; ++ p)
							array [a ++] = pixels [p] .getValue ();
	
						gl .uniform1iv (location, array);
						return;
					}
					case X3DConstants .SFMatrix3d:
					case X3DConstants .SFMatrix3f:
					{
						location .array .set (field .getValue ());
	
						gl .uniformMatrix3fv (location, false, location .array);
						return;
					}
					case X3DConstants .SFMatrix4d:
					case X3DConstants .SFMatrix4f:
					{
						location .array .set (field .getValue ());
	
						gl .uniformMatrix4fv (location, false, location .array);
						return;
					}
					case X3DConstants .SFNode:
					{
						this .setNode (gl, program, location, field);
						return;
					}
					case X3DConstants .SFRotation:
					{
						var quat = field .getValue () .value;
						gl .uniform4f (location, quat .x, quat .y, quat .z, quat .w);
						return;
					}
					case X3DConstants .SFString:
					{
						return;
					}
					case X3DConstants .SFVec2d:
					case X3DConstants .SFVec2f:
					{
						var value = field .getValue ();
						gl .uniform2f (location, value .x, value .y);
						return;
					}
					case X3DConstants .SFVec3d:
					case X3DConstants .SFVec3f:
					{
						var value = field .getValue ();
						gl .uniform3f (location, value .x, value .y, value .z);
						return;
					}
					case X3DConstants .SFVec4d:
					case X3DConstants .SFVec4f:
					{
						var value = field .getValue ();
						gl .uniform4f (location, value .x, value .y, value .z, value .w);
						return;
					}
					case X3DConstants .MFBool:
					case X3DConstants .MFInt32:
					{
						var
							value = field .getValue (),
							array = location .array;
	
						for (var i = 0, length = value .length; i < length; ++ i)
							array [i] = value [i] .getValue ();
	
						for (var length = array .length; i < length; ++ i)
							array [i] = 0;
	
						gl .uniform1iv (location, array);
						return;
					}
					case X3DConstants .MFColor:
					{
						var
							value = field .getValue (),
							array = location .array;
	
						for (var i = 0, k = 0, length = value .length; i < length; ++ i)
						{
							var color = value [i] .getValue ();
	
							array [k++] = color .r;
							array [k++] = color .g;
							array [k++] = color .b;
						}
	
						for (var length = array .length; k < length; ++ k)
							array [k] = 0;
	
						gl .uniform3fv (location, array);
						return;
					}
					case X3DConstants .MFColorRGBA:
					{
						var
							value = field .getValue (),
							array = location .array;
	
						for (var i = 0, k = 0, length = value .length; i < length; ++ i)
						{
							var color = value [i] .getValue ();
	
							array [k++] = color .r;
							array [k++] = color .g;
							array [k++] = color .b;
							array [k++] = color .a;
						}
	
						for (var length = array .length; k < length; ++ k)
							array [k] = 0;
	
						gl .uniform4fv (location, array);
						return;
					}
					case X3DConstants .MFDouble:
					case X3DConstants .MFFloat:
					case X3DConstants .MFTime:
					{
						var
							value = field .getValue (),
							array = location .array;
	
						for (var i = 0, length = value .length; i < length; ++ i)
							array [i] = value [i] .getValue ();
	
						for (var length = array .length; i < length; ++ i)
							array [i] = 0;
	
						gl .uniform1fv (location, array);
						return;
					}
					case X3DConstants .MFImage:
					{
						var
							images = field .getValue (),
							array  = location .array,
							length = this .getImagesLength (field);
	
						if (length !== array .length)
							array = location .array = new Int32Array (length);
	
						for (var i = 0, a = 0, length = images .length; i < length; ++ i)
						{
							var
								value  = images [i],
								pixels = value .array .getValue ();
	
							array [a ++] = value .width;
							array [a ++] = value .height;
							array [a ++] = value .comp;
	
							for (var p = 0, plength = pixels .length; p < plength; ++ p)
								array [a ++] = pixels [p] .getValue ();
						}
	
						gl .uniform1iv (location, array);
						return;
					}
					case X3DConstants .MFMatrix3d:
					case X3DConstants .MFMatrix3f:
					{
						var
							value = field .getValue (),
							array = location .array;
	
						for (var i = 0, k = 0, length = value .length; i < length; ++ i)
						{
							var matrix = value [i] .getValue ();
	
							array [k++] = matrix [0];
							array [k++] = matrix [1];
							array [k++] = matrix [2];
							array [k++] = matrix [3];
							array [k++] = matrix [4];
							array [k++] = matrix [5];
							array [k++] = matrix [6];
							array [k++] = matrix [7];
							array [k++] = matrix [8];
						}
	
						for (var length = array .length; k < length; ++ k)
							array [k] = 0;
	
						gl .uniformMatrix3fv (location, false, array);
						return;
					}
					case X3DConstants .MFMatrix4d:
					case X3DConstants .MFMatrix4f:
					{
						var
							value = field .getValue (),
							array = location .array;
	
						for (var i = 0, k = 0, length = value .length; i < length; ++ i)
						{
							var matrix = value [i] .getValue ();
	
							array [k++] = matrix [ 0];
							array [k++] = matrix [ 1];
							array [k++] = matrix [ 2];
							array [k++] = matrix [ 3];
							array [k++] = matrix [ 4];
							array [k++] = matrix [ 5];
							array [k++] = matrix [ 6];
							array [k++] = matrix [ 7];
							array [k++] = matrix [ 8];
							array [k++] = matrix [ 9];
							array [k++] = matrix [10];
							array [k++] = matrix [11];
							array [k++] = matrix [12];
							array [k++] = matrix [13];
							array [k++] = matrix [14];
							array [k++] = matrix [15];
						}
	
						for (var length = array .length; k < length; ++ k)
							array [k] = 0;
	
						gl .uniformMatrix4fv (location, false, array);
						return;
					}
					case X3DConstants .MFNode:
					{
						var value = field .getValue ();
	
						for (var i = 0, length = value .length; i < length; ++ i)
							this .setNode (gl, program, location [i], value [i]);
	
						for (var length = location .length; i < length; ++ i)
							this .setNode (gl, program, location [i], NULL);
	
						return;
					}
					case X3DConstants .MFRotation:
					{
						var
							value = field .getValue (),
							array = location .array;
	
						for (var i = 0, k = 0, length = value .length; i < length; ++ i)
						{
							var quat = value [i] .getValue () .value;
	
							array [k++] = quat .x;
							array [k++] = quat .y;
							array [k++] = quat .z;
							array [k++] = quat .w;
						}
	
						for (var length = array .length; k < length; ++ k)
							array [k] = 0;
	
						gl .uniform4fv (location, array);
						return;
					}
					case X3DConstants .MFString:
					{
						return;
					}
					case X3DConstants .MFVec2d:
					case X3DConstants .MFVec2f:
					{
						var
							value = field .getValue (),
							array = location .array;
	
						for (var i = 0, k = 0, length = value .length; i < length; ++ i)
						{
							var vector = value [i] .getValue ();
	
							array [k++] = vector .x;
							array [k++] = vector .y;
						}
	
						for (var length = array .length; k < length; ++ k)
							array [k] = 0;
	
						gl .uniform2fv (location, array);
						return;
					}
					case X3DConstants .MFVec3d:
					case X3DConstants .MFVec3f:
					{
						var
							value = field .getValue (),
							array = location .array;
	
						for (var i = 0, k = 0, length = value .length; i < length; ++ i)
						{
							var vector = value [i] .getValue ();
	
							array [k++] = vector .x;
							array [k++] = vector .y;
							array [k++] = vector .z;
						}
	
						for (var length = array .length; k < length; ++ k)
							array [k] = 0;
	
						gl .uniform3fv (location, array);
						return;
					}
					case X3DConstants .MFVec4d:
					case X3DConstants .MFVec4f:
					{
						var
							value = field .getValue (),
							array = location .array;
	
						for (var i = 0, k = 0, length = value .length; i < length; ++ i)
						{
							var vector = value [i] .getValue ();
	
							array [k++] = vector .x;
							array [k++] = vector .y;
							array [k++] = vector .z;
							array [k++] = vector .w;
						}
	
						for (var length = array .length; k < length; ++ k)
							array [k] = 0;
	
						gl .uniform4fv (location, array);
						return;
					}
				}
			}
		},
		setNode: function (gl, program, location, field)
		{
			if (location)
			{
				var textureUnit = gl .getUniform (program, location);

				if (! textureUnit)
				{
					if (this .getBrowser () .getCombinedTextureUnits () .length)
					{
						textureUnit = this .getBrowser () .getCombinedTextureUnits () .pop ();
						gl .uniform1i (location, textureUnit);
					}
					else
					{
						console .warn ("Not enough combined texture units for uniform variable '", field .getName (), "' available.");
						return;
					}
				}

				gl .activeTexture (gl .TEXTURE0 + textureUnit);

				var texture = X3DCast (X3DConstants .X3DTextureNode, field);

				if (texture)
					gl .bindTexture (texture .getTarget (), texture .getTexture ());
				else
					gl .bindTexture (gl .TEXTURE_2D, null);

				gl .activeTexture (gl .TEXTURE0);
			}
		},
		removeNode: function (gl, program, location)
		{
			if (location)
			{
				var textureUnit = gl .getUniform (program, location);
	
				if (textureUnit)
					this .getBrowser () .getCombinedTextureUnits () .push (textureUnit);

				gl .uniform1i (location, 0);
				gl .activeTexture (gl .TEXTURE0 + textureUnit);
				gl .bindTexture (gl .TEXTURE_2D, null);
				gl .activeTexture (gl .TEXTURE0);
			}
		},
		getImagesLength: function (field)
		{
			var
				images = field .getValue (),
				length = 3 * images .length;

			for (var i = 0, l = images .length; i < l; ++ i)
				length += images [i] .array .length;

			return length;
		},
		getLocationLength: function (gl, program, field)
		{
			var name = field .getName ();

			for (var i = 0; ; ++ i)
			{
				var location = gl .getUniformLocation (program, name + "[" + i + "]");

				if (! location)
					break;
			}

			return i;
		},
	};

	return X3DProgrammableShaderObject;
});


