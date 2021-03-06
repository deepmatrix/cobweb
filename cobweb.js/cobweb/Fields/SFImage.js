
define ([
	"jquery",
	"cobweb/Basic/X3DField",
	"cobweb/Fields/ArrayFields",
	"cobweb/Bits/X3DConstants",
],
function ($, X3DField, ArrayFields, X3DConstants)
{
"use strict";

	var MFInt32 = ArrayFields .MFInt32;

	/*
	 *  Image
	 */

	function Image (width, height, comp, array)
	{
		this .width  = width;
		this .height = height;
		this .comp   = comp;
		this .array  = new MFInt32 ();
		this .array .setValue (array);
		this .array .length = width * height;
	}
	
	Image .prototype =
	{
		constructor: Image,
		copy: function ()
		{
			return new Image (this .width, this .height, this .comp, this .array);
		},
		equals: function (image)
		{
			return this .width  === image .width &&
			       this .height === image .height &&
			       this .comp   === image .comp &&
			       this .array .equals (image .array);
		},
		assign: function (image)
		{
			this .width  = image .width;
			this .height = image .height;
			this .comp   = image .comp;
			this .array .set (image .array .getValue ());
		},
		set: function (width, height, comp, array)
		{
			this .width  = width;
			this .height = height;
			this .comp   = comp;
			this .array .set (array);
		},
		setWidth: function (value)
		{
			this .width = value;
			this .array .length = this .width  * this .height;	
		},
		getWidth: function ()
		{
			return this .width;
		},
		setHeight: function (value)
		{
			this .height = value;
			this .array .length = this .width  * this .height;	
		},
		getHeight: function ()
		{
			return this .height;
		},
		setComp: function (value)
		{
			this .comp = value;
		},
		getComp: function ()
		{
			return this .comp;
		},
		setArray: function (value)
		{
			this .array .setValue (value);
			this .array .length = this .width  * this .height;	
		},
		getArray: function ()
		{
			return this .array;
		},
	};

	/*
	 *  SFImage
	 */

	function SFImage (width, height, comp, array)
	{
	   if (this instanceof SFImage)
	   {
			if (arguments .length === 4)
				X3DField .call (this, new Image (+width, +height, +comp, array));
			else
				X3DField .call (this, new Image (0, 0, 0, new MFInt32 ()));

			this .getValue () .getArray () .addParent (this);
			this .addInterest (this, "set_size__");
			return this;
		}

		return SFImage .apply (Object .create (SFImage .prototype), arguments);
	}

	SFImage .prototype = $.extend (Object .create (X3DField .prototype),
	{
		constructor: SFImage,
		set_size__: function ()
		{
			this .getValue () .getArray () .length = this .width * this .height;
		},
		copy: function ()
		{
			return new SFImage (this .getValue ());
		},
		equals: function (image)
		{
			return this .getValue () .equals (image .getValue ());
		},
		set: function (image)
		{
			this .getValue () .assign (image);
		},
		getTypeName: function ()
		{
			return "SFImage";
		},
		getType: function ()
		{
			return X3DConstants .SFImage;
		},
		toString: function ()
		{
		   var
				string = this .width + " " + this .height + " " + this .comp,
				array  = this .array;

			for (var i = 0, length = this .width * this .height; i < length; ++ i)
				string += " " + array [i];

			return string;
		},
	});

	var width = {
		get: function ()
		{
			return this .getValue () .getWidth ();
		},
		set: function (value)
		{
			this .getValue () .setWidth (value);
			this .addEvent ();
		},
		enumerable: true,
		configurable: false
	};

	var height = {
		get: function ()
		{
			return this .getValue () .getHeight ();
		},
		set: function (value)
		{
			this .getValue () .setHeight (value);
			this .addEvent ();
		},
		enumerable: true,
		configurable: false
	};

	var comp = {
		get: function ()
		{
			return this .getValue () .getComp ();
		},
		set: function (value)
		{
			this .getValue () .setComp (value);
			this .addEvent ();
		},
		enumerable: true,
		configurable: false
	};

	var array = {
		get: function ()
		{
			return this .getValue () .getArray ();
		},
		set: function (value)
		{
			this .getValue () .setArray (value);
			this .addEvent ();
		},
		enumerable: true,
		configurable: false
	};

	Object .defineProperty (SFImage .prototype, "width",  width);
	Object .defineProperty (SFImage .prototype, "height", height);
	Object .defineProperty (SFImage .prototype, "comp",   comp);
	Object .defineProperty (SFImage .prototype, "array",  array);

	width  .enumerable = false;
	height .enumerable = false;

	Object .defineProperty (SFImage .prototype, "x", width);
	Object .defineProperty (SFImage .prototype, "y", height);

	return SFImage;
});
