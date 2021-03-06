
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/EnvironmentalEffects/X3DBackgroundNode",
	"cobweb/Components/Texturing/ImageTexture",
	"cobweb/Bits/X3DConstants",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DBackgroundNode,
          ImageTexture,
          X3DConstants)
{
"use strict";

	function Background (executionContext)
	{
		X3DBackgroundNode .call (this, executionContext);

		this .addType (X3DConstants .Background);
	}

	Background .prototype = $.extend (Object .create (X3DBackgroundNode .prototype),
	{
		constructor: Background,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput, "metadata",     new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .inputOnly,   "set_bind",     new Fields .SFBool ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "frontUrl",     new Fields .MFString ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "backUrl",      new Fields .MFString ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "leftUrl",      new Fields .MFString ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "rightUrl",     new Fields .MFString ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "topUrl",       new Fields .MFString ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "bottomUrl",    new Fields .MFString ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "skyAngle",     new Fields .MFFloat ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "skyColor",     new Fields .MFColor (new Fields .SFColor ())),
			new X3DFieldDefinition (X3DConstants .inputOutput, "groundAngle",  new Fields .MFFloat ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "groundColor",  new Fields .MFColor ()),
			new X3DFieldDefinition (X3DConstants .inputOutput, "transparency", new Fields .SFFloat ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,  "isBound",      new Fields .SFBool ()),
			new X3DFieldDefinition (X3DConstants .outputOnly,  "bindTime",     new Fields .SFTime ()),
		]),
		getTypeName: function ()
		{
			return "Background";
		},
		getComponentName: function ()
		{
			return "EnvironmentalEffects";
		},
		getContainerField: function ()
		{
			return "children";
		},
		initialize: function ()
		{
			X3DBackgroundNode .prototype .initialize .call (this);

			var
				frontTexture      = new ImageTexture (this .getExecutionContext ()),
				backTexture       = new ImageTexture (this .getExecutionContext ()),
				leftTexture       = new ImageTexture (this .getExecutionContext ()),
				rightTexture      = new ImageTexture (this .getExecutionContext ()),
				topTexture        = new ImageTexture (this .getExecutionContext ()),
				bottomTexture     = new ImageTexture (this .getExecutionContext ()),
				textureProperties = this .getBrowser () .getBackgroundTextureProperties ();

			this .frontUrl_  .addFieldInterest (frontTexture  .url_);
			this .backUrl_   .addFieldInterest (backTexture   .url_);
			this .leftUrl_   .addFieldInterest (leftTexture   .url_);
			this .rightUrl_  .addFieldInterest (rightTexture  .url_);
			this .topUrl_    .addFieldInterest (topTexture    .url_);
			this .bottomUrl_ .addFieldInterest (bottomTexture .url_);

			frontTexture  .url_ = this .frontUrl_;
			backTexture   .url_ = this .backUrl_;
			leftTexture   .url_ = this .leftUrl_;
			rightTexture  .url_ = this .rightUrl_;
			topTexture    .url_ = this .topUrl_;
			bottomTexture .url_ = this .bottomUrl_;

			frontTexture  .textureProperties_ = textureProperties;
			backTexture   .textureProperties_ = textureProperties;
			leftTexture   .textureProperties_ = textureProperties;
			rightTexture  .textureProperties_ = textureProperties;
			topTexture    .textureProperties_ = textureProperties;
			bottomTexture .textureProperties_ = textureProperties;

			frontTexture  .setup ();
			backTexture   .setup ();
			leftTexture   .setup ();
			rightTexture  .setup ();
			topTexture    .setup ();
			bottomTexture .setup ();

			this .set_frontTexture__  (frontTexture);
			this .set_backTexture__   (backTexture);
			this .set_leftTexture__   (leftTexture);
			this .set_rightTexture__  (rightTexture);
			this .set_topTexture__    (topTexture);
			this .set_bottomTexture__ (bottomTexture);
		}
	});

	return Background;
});


