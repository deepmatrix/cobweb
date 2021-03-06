
define ([
	"jquery",
	"cobweb/Base/X3DEventObject",
	"cobweb/Base/Events",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Fields",
	"cobweb/Bits/X3DConstants",
],
function ($,
          X3DEventObject,
          Events,
          X3DFieldDefinition,
          FieldDefinitionArray,
          Fields,
          X3DConstants)
{
"use strict";

	function X3DBaseNode (executionContext)
	{
		if (this .hasOwnProperty ("_executionContext"))
			return;

		X3DEventObject .call (this, executionContext .getBrowser ());

		this ._executionContext  = executionContext;
		this ._type              = [ X3DConstants .X3DBaseNode ];
		this ._fields            = { };
		this ._predefinedFields  = { };
		this ._userDefinedFields = { };

		// Setup fields.

		if (this .hasUserDefinedFields ())
			this .fieldDefinitions = new FieldDefinitionArray (this .fieldDefinitions .getValue () .slice ());

		var fieldDefinitions = this .fieldDefinitions .getValue ();

		for (var i = 0, length = fieldDefinitions .length; i < length; ++ i)
			this .addField (fieldDefinitions [i]);

		// Add children.

		this .addChildren ("isLive", new Fields .SFBool (true));
	}

	X3DBaseNode .prototype = $.extend (Object .create (X3DEventObject .prototype),
	{
		constructor: X3DBaseNode,
		fieldDefinitions: new FieldDefinitionArray ([ ]),
		_initialized: false,
		getScene: function ()
		{
			var executionContext = this ._executionContext;

			while (! executionContext .isRootContext ())
				executionContext = executionContext .getExecutionContext ();

			return executionContext;
		},
		getExecutionContext: function ()
		{
			return this ._executionContext;
		},
		addType: function (value)
		{
			this ._type .push (value);
		},
		getType: function ()
		{
			return this ._type;
		},
		getInnerNode: function ()
		{
			return this;
		},
		isInitialized: function ()
		{
			return this ._initialized;
		},
		isLive: function ()
		{
		   return this .isLive_;
		},
		setup: function ()
		{
			if (this ._initialized)
				return;

			this ._initialized = true;

			var fieldDefinitions = this .fieldDefinitions .getValue ();

			for (var i = 0, length = fieldDefinitions .length; i < length; ++ i)
			{
				var field = this ._fields [fieldDefinitions [i] .name];
				field .updateReferences ();
				field .setTainted (false);
			}

			this .initialize ();
		},
		initialize: function () { },
		eventsProcessed: function () { },
		create: function (executionContext)
		{
			return new (this .constructor) (executionContext);
		},
		copy: function (executionContext)
		{
			// First try to get a named node with the node's name.

			var name = this .getName ();
		
			if (name .length)
			{
				try
				{
					return executionContext .getNamedNode (name) .getValue ();
				}
				catch (error)
				{ }
			}

			// Create copy.

			var copy = this .create (executionContext);

			if (name .length)
				executionContext .updateNamedNode (name, copy);

			// Default fields

			var predefinedFields = this .getPredefinedFields ();

			for (var name in predefinedFields)
			{
				try
				{
					var
						sourceField = predefinedFields [name],
						destfield   = copy .getField (name);

					destfield .setSet (sourceField .getSet ());

					//if (sourceField .getAccessType () === destfield .getAccessType () and sourceField .getType () === destfield .getType ())
					//{

					if (sourceField .hasReferences ())
					{
						var references = sourceField .getReferences ();

						// IS relationship
						for (var id in references)
						{
							try
							{
								var originalReference = references [id];
	
								destfield .addReference (executionContext .getField (originalReference .getName ()));
							}
							catch (error)
							{
								console .error (error .message);
							}
						}
					}
					else
					{
						if (sourceField .getAccessType () & X3DConstants .initializeOnly)
						{
							switch (sourceField .getType ())
							{
								case X3DConstants .SFNode:
								case X3DConstants .MFNode:
									destfield .set (sourceField .copy (executionContext) .getValue ());
									break;
								default:
									destfield .set (sourceField .getValue ());
									break;
							}
						}
					}
				}
				catch (error)
				{
					console .log (error .message);
				}
			}

			// User-defined fields

			var userDefinedFields = this .getUserDefinedFields ();

			for (var name in userDefinedFields)
			{
				var
					sourceField = userDefinedFields [name],
					destfield   = sourceField .copy (executionContext);

				copy .addUserDefinedField (sourceField .getAccessType (),
				                           sourceField .getName (),
				                           destfield);

				destfield .setSet (sourceField .getSet ());

				if (sourceField .hasReferences ())
				{
					// IS relationship

					var references = sourceField .getReferences ();

					for (var id in references)
					{
						try
						{
							var originalReference = references [id];
	
							destfield .addReference (executionContext .getField (originalReference .getName ()));
						}
						catch (error)
						{
							console .error ("No reference '" + originalReference .getName () + "' inside execution context " + executionContext .getTypeName () + " '" + executionContext .getName () + "'.");
						}
					}
				}
			}

			executionContext .addUninitializedNode (copy);
			return copy;
		},
		addChildren: function (name, field)
		{
			for (var i = 0, length = arguments .length; i < length; i += 2)
				this .addChild (arguments [i + 0], arguments [i + 1]);
		},
		addChild: function (name, field)
		{
			field .addParent (this);
			field .setName (name);

			Object .defineProperty (this, name + "_",
			{
				get: function () { return this; } .bind (field),
				set: field .setValue .bind (field),
				enumerable: true,
				configurable: false,
			});
		},
		addField: function (fieldDefinition)
		{
			var
				accessType = fieldDefinition .accessType,
				name       = fieldDefinition .name,
				field      = fieldDefinition .value .clone ();

			field .setTainted (true);
			field .addParent (this);
			field .setName (name);
			field .setAccessType (accessType);

			this .setField (name, field);
		},
		setField: function (name, field, userDefined)
		{
			if (field .getAccessType () === X3DConstants .inputOutput)
			{
				this ._fields ["set_" + name]     = field;
				this ._fields [name + "_changed"] = field;
			}

			this ._fields [name] = field;

			if (userDefined)
			{
				this ._userDefinedFields [name] = field;
				return;
			}

			this ._predefinedFields [name] = field;

			Object .defineProperty (this, name + "_",
			{
				get: function () { return this; } .bind (field),
				set: field .setValue .bind (field),
				enumerable: true,
				configurable: true, // false : non deleteable
			});
		},
		removeField: function (name /*, completely */)
		{
			var field = this ._fields [name];

			//if (completely && field .getAccessType () === X3DConstants .inputOutput)
			//{
			//	delete this ._fields ["set_" + field .getName ()];
			//	delete this ._fields [field .getName () + "_changed"];
			//}

			delete this ._fields [name];
			delete this ._userDefinedFields [name];

			var fieldDefinitions = this .fieldDefinitions .getValue ();

			for (var i = 0, length = fieldDefinitions .length; i < length; ++ i)
			{
				if (fieldDefinitions [i] .name === name)
				{
					fieldDefinitions .splice (i, 1);
					break;
				}
			}
		},
		getField: function (name)
		{
			var field = this ._fields [name];
			
			if (field)
				return field;

			throw new Error ("Unkown field '" + name + "' in node class " + this .getTypeName () + ".");
		},
		getFieldDefinitions: function ()
		{
			return this .fieldDefinitions;
		},
		hasUserDefinedFields: function ()
		{
			return false;
		},
		addUserDefinedField: function (accessType, name, field)
		{
			if (this ._fields [name])
				this .removeField (name);

			field .setTainted (true);
			field .addParent (this);
			field .setName (name);
			field .setAccessType (accessType);

			this .fieldDefinitions .getValue () .push (new X3DFieldDefinition (accessType, name, field));

			this .setField (name, field, true);
		},
		getUserDefinedFields: function ()
		{
			return this ._userDefinedFields;
		},
		getPredefinedFields: function ()
		{
			return this ._predefinedFields;
		},
		getFields: function ()
		{
			return this ._fields;
		},
		getCDATA: function ()
		{
			return null;
		},
		traverse: function () { },
		beginUpdate: function ()
		{
		   if (this .isLive () .getValue ())
		      return;

		   this .isLive () .setValue (true);
			this .isLive () .processEvent (Events .create (this .isLive ()));
		},
		endUpdate: function ()
		{
		   if (this .isLive () .getValue ())
		   {
		      this .isLive () .setValue (false);
				this .isLive () .processEvent (Events .create (this .isLive ()));
			}
		},
		toString: function ()
		{
			return this .getTypeName () + " { }";
		},
	});

	X3DBaseNode .prototype .addAlias = X3DBaseNode .prototype .setField;

	return X3DBaseNode;
});
