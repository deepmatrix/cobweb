
define ([
	"cobweb/Components/Shape/Appearance",
],
function (Appearance)
{
"use strict";

	function X3DShapeContext ()
	{
		this .defaultAppearance = new Appearance (this);
		this .appearance        = null;
	}

	X3DShapeContext .prototype =
	{
		initialize: function ()
		{
			this .defaultAppearance .setup ();
		},
		getDefaultAppearance: function ()
		{
			return this .defaultAppearance;
		},
		setAppearance: function (value)
		{
			this .appearance = value;
		},
		getAppearance: function ()
		{
			return this .appearance;
		},
	};

	return X3DShapeContext;
});
