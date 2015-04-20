
define ([
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Components/ParticleSystems/X3DParticlePhysicsModelNode",
	"cobweb/Bits/X3DConstants",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DParticlePhysicsModelNode, 
          X3DConstants)
{
	with (Fields)
	{
		function ForcePhysicsModel (executionContext)
		{
			X3DParticlePhysicsModelNode .call (this, executionContext .getBrowser (), executionContext);

			this .addType (X3DConstants .ForcePhysicsModel);
		}

		ForcePhysicsModel .prototype = $.extend (Object .create (X3DParticlePhysicsModelNode .prototype),
		{
			constructor: ForcePhysicsModel,
			fieldDefinitions: new FieldDefinitionArray ([
				new X3DFieldDefinition (X3DConstants .inputOutput, "metadata", new SFNode ()),
				new X3DFieldDefinition (X3DConstants .inputOutput, "enabled",  new SFBool (true)),
				new X3DFieldDefinition (X3DConstants .inputOutput, "force",    new SFVec3f (0, -9.8, 0)),
			]),
			getTypeName: function ()
			{
				return "ForcePhysicsModel";
			},
			getComponentName: function ()
			{
				return "ParticleSystems";
			},
			getContainerField: function ()
			{
				return "physics";
			},
		});

		return ForcePhysicsModel;
	}
});

