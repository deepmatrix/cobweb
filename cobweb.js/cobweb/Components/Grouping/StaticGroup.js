
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/Core/X3DChildNode",
	"cobweb/Components/Grouping/X3DBoundedObject",
	"cobweb/Components/Grouping/Group",
	"cobweb/Bits/X3DConstants",
	"standard/Math/Geometry/Box3",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DChildNode, 
          X3DBoundedObject, 
          Group,
          X3DConstants,
          Box3)
{
"use strict";

	function StaticGroup (executionContext)
	{
		X3DChildNode     .call (this, executionContext);
		X3DBoundedObject .call (this, executionContext);

		this .addType (X3DConstants .StaticGroup);

		this .group = new Group (this .getExecutionContext ());
		this .bbox  = new Box3 ();
	}

	StaticGroup .prototype = $.extend (Object .create (X3DChildNode .prototype),
		X3DBoundedObject .prototype,
	{
		constructor: StaticGroup,
		fieldDefinitions: new FieldDefinitionArray ([
			new X3DFieldDefinition (X3DConstants .inputOutput,    "metadata",   new Fields .SFNode ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "bboxSize",   new Fields .SFVec3f (-1, -1, -1)),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "bboxCenter", new Fields .SFVec3f ()),
			new X3DFieldDefinition (X3DConstants .initializeOnly, "children",   new Fields .MFNode ()),
		]),
		getTypeName: function ()
		{
			return "StaticGroup";
		},
		getComponentName: function ()
		{
			return "Grouping";
		},
		getContainerField: function ()
		{
			return "children";
		},
		initialize: function ()
		{
			X3DChildNode     .prototype .initialize .call (this);
			X3DBoundedObject .prototype .initialize .call (this);

			this .bboxSize_   .addFieldInterest (this .group .bboxSize_);
			this .bboxCenter_ .addFieldInterest (this .group .bboxCenter_);
			this .children_   .addFieldInterest (this .group .children_);

			this .group .bboxSize_   = this .bboxSize_;
			this .group .bboxCenter_ = this .bboxCenter_;
			this .group .children_   = this .children_;
			this .group .setup ();

			this .traverse = this .group .traverse .bind (this .group);

			// Connect after Group setup.
			this .group .children_ .addInterest (this, "set_children__");

			this .set_children__ ();
		},
		getBBox: function (bbox)
		{
			return bbox .assign (this .bbox);
		},
		set_children__: function ()
		{
			this .group .getBBox (this .bbox);
		},
	});

	return StaticGroup;
});


