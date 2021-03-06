
define ("cobweb/Execution/X3DExecutionContext", [
	"jquery",
	"cobweb/Fields",
	"cobweb/Basic/X3DFieldDefinition",
	"cobweb/Basic/FieldDefinitionArray",
	"cobweb/Basic/X3DBaseNode",
	"cobweb/Configuration/ComponentInfoArray",
	"cobweb/Execution/ImportedNode",
	"cobweb/Prototype/ExternProtoDeclarationArray",
	"cobweb/Prototype/ProtoDeclarationArray",
	"cobweb/Routing/RouteArray",
	"cobweb/Routing/X3DRoute",
	"cobweb/Bits/X3DCast",
	"cobweb/Bits/X3DConstants",
	"standard/Networking/URI",
],
function ($,
          Fields,
          X3DFieldDefinition,
          FieldDefinitionArray,
          X3DBaseNode,
          ComponentInfoArray,
          ImportedNode,
          ExternProtoDeclarationArray,
          ProtoDeclarationArray,
          RouteArray,
          X3DRoute,
          X3DCast,
          X3DConstants,
          URI)
{
"use strict";

	function X3DExecutionContext (executionContext)
	{
		X3DBaseNode .call (this, executionContext);

		this .addChildren ("rootNodes", new Fields .MFNode (),
                         "loadCount", new Fields .SFInt32 ());

		this .specificationVersion = "3.3";
		this .encoding             = "SCRIPTED";
		this .profile              = null;
		this .components           = new ComponentInfoArray (this .getBrowser ());
		this .url                  = new URI (window .location);
		this .uninitializedNodes   = [ ];
		this .namedNodes           = { };
		this .importedNodes        = { };
		this .protos               = new ProtoDeclarationArray ();
		this .externprotos         = new ExternProtoDeclarationArray ();
		this .routes               = new RouteArray ();
		this .routeIndex           = { };

		this .endUpdate ();
	}

	X3DExecutionContext .prototype = $.extend (Object .create (X3DBaseNode .prototype),
	{
		constructor: X3DExecutionContext,
		setup: function ()
		{
			X3DBaseNode .prototype .setup .call (this);

			// Setup nodes

			var uninitializedNodes = this .uninitializedNodes;

			for (var i = 0, length = uninitializedNodes .length; i < length; ++ i)
				uninitializedNodes [i] .setup ();

			uninitializedNodes .length = 0;
		},
		isRootContext: function ()
		{
			return false;
		},
		getWorldURL: function ()
		{
			return this .getURL () .location;
		},
		setURL: function (url)
		{
			this .url = url;
		},
		getURL: function ()
		{
			return this .url;
		},
		setProfile: function (profile)
		{
			this .profile = profile;
		},
		addComponent: function (component)
		{
			this .components .add (component .name, component);
		},
		createNode: function (typeName, setup)
		{
			var interfaceDeclaration = this .getBrowser () .supportedNodes [typeName];

			if (! interfaceDeclaration)
				throw new Error ("Unknown node type '" + typeName + "'.");

			var node = interfaceDeclaration .createInstance (this);

			if (setup === false)
				return node;

			node .setup ();
			return new Fields .SFNode (node);
		},
		createProto: function (name, setup)
		{
			var executionContext = this;

			for (;;)
			{
				var proto = executionContext .protos [name];

				if (proto)
					return proto .createInstance (this, setup);

				var externproto = executionContext .externprotos [name];

				if (externproto)
					return externproto .createInstance (this, setup);

				if (executionContext .isRootContext ())
					break;

				executionContext = executionContext .getExecutionContext ();
			}

			throw new Error ("Unknown proto or externproto type '" + name + "'.");
		},
		addUninitializedNode: function (node)
		{
			this .uninitializedNodes .push (node);
		},
		addNamedNode: function (name, node)
		{
			if (this .namedNodes [name] !== undefined)
				throw new Error ("Couldn't add named node: node named '" + name + "' is already in use.");

			this .updateNamedNode (name, node);
		},
		updateNamedNode: function (name, node)
		{
			if (! (node instanceof Fields .SFNode || node instanceof X3DBaseNode))
				throw new Error ("Couldn't update named node: node must be of type SFNode.");

			name = String (name);
			node = new Fields .SFNode (node .valueOf ());

			if (! node .getValue ())
				throw new Error ("Couldn't update named node: node IS NULL.");

			if (node .getValue () .getExecutionContext () !== this)
				throw new Error ("Couldn't update named node: node does not belong to this execution context.");

			if (name .length === 0)
				throw new Error ("Couldn't update named node: node name is empty.");

			// Remove named node.

			this .removeNamedNode (node .getValue () .getName ());
			this .removeNamedNode (name);

			// Update named node.

			node .getValue () .setName (name);

			this .namedNodes [name] = node;
		},
		removeNamedNode: function (name)
		{
			delete this .namedNodes [name];
		},
		getNamedNode: function (name)
		{
			var node = this .namedNodes [name];

			if (! node)
				throw new Error ("Named node '" + name + "' not found.");

			return node;
		},
		addImportedNode: function (inlineNode, exportedName, importedName)
		{
			if (importedName === undefined)
				importedName = importedName;

			if (this .importedNodes [importedName])
				throw new Error ("Couldn't add imported node: imported name '" + importedName + "' already in use.");

			this .updateImportedNode (inlineNode, exportedName, importedName);
		},
		updateImportedNode: function (inlineNode, exportedName, importedName)
		{
			inlineNode   = X3DCast (X3DConstants .Inline, inlineNode);
			exportedName = String (exportedName);
			importedName = importedName === undefined ? exportedName : String (importedName);

			if (! inlineNode)
				throw new Error ("Node named is not an Inline node.");

			if (inlineNode .getExecutionContext () !== this)
				throw new Error ("Couldn't update imported node: Inline node does not belong to this execution context.");

			if (exportedName .length === 0)
				throw new Error ("Couldn't update imported node: exported name is empty.");

			if (importedName .length === 0)
				throw new Error ("Couldn't update imported node: imported name is empty.");

			this .removeImportedNode (importedName);

			this .importedNodes [importedName] = new ImportedNode (this, inlineNode, exportedName, importedName);
			this .importedNodes [importedName] .setup ();
		},
		removeImportedNode: function (importedName)
		{
			var importedNode = this .importedNodes [importedName];

			if (importedNode)
				importedNode .dispose ();

			delete this .importedNodes [importedName];
		},
		getImportedNode: function (importedName)
		{
			var importedNode = this .importedNodes [importedName];

			if (importedNode)
				return importedNode .getExportedNode ();

			throw new Error ("Imported node '" + importedName + "' not found.");
		},
		getLocalNode: function (name)
		{
			try
			{
				return this .getNamedNode (name);
			}
			catch (error)
			{
				try
				{
					var importedNode = this .importedNodes [name];

					if (importedNode)
						return new Fields .SFNode (importedNode);

					throw true;
				}
				catch (error)
				{
					throw new Error ("Unknown named or imported node '" + name + "'.");
				}
			}
		},
		setRootNodes: function () { },
		getRootNodes: function ()
		{
			return this .rootNodes_;
		},
		addRoute: function (sourceNode, sourceField, destinationNode, destinationField)
		{
			try
			{
				sourceField      = String (sourceField);
				destinationField = String (destinationField);

				if (! (sourceNode instanceof Fields .SFNode))
					throw new Error ("Bad ROUTE specification: source node must be of type SFNode.");

				if (! (destinationNode instanceof Fields .SFNode))
					throw new Error ("Bad ROUTE specification: destination node must be of type SFNode.");

				sourceNode      = sourceNode      .getValue ();
				destinationNode = destinationNode .getValue ();

				if (! sourceNode)
					throw new Error ("Bad ROUTE specification: source node is NULL.");

				if (! destinationNode)
					throw new Error ("Bad ROUTE specification: destination node is NULL.");

				if (sourceNode instanceof ImportedNode || destinationNode instanceof ImportedNode)
				{
					if (sourceNode instanceof ImportedNode)
						sourceNode .addRoute (sourceNode, sourceField, destinationNode, destinationField);
	
					if (destinationNode instanceof ImportedNode)
						destinationNode .addRoute (sourceNode, sourceField, destinationNode, destinationField);

					return;
				}

				sourceField      = sourceNode      .getField (sourceField),
				destinationField = destinationNode .getField (destinationField);

				if (! sourceField .isOutput ())
					throw new Error ("Bad ROUTE specification: Field named '" + sourceField .getName () + "' in node named '" + sourceNode .getName () + "' of type " + sourceNode .getTypeName () + " is not an output field.");

				if (! destinationField .isInput ())
					throw new Error ("Bad ROUTE specification: Field named '" + destinationField .getName () + "' in node named '" + destinationNode .getName () + "' of type " + destinationNode .getTypeName () + " is not an input field.");

				if (sourceField .getType () !== destinationField .getType ())
					throw new Error ("Bad ROUTE specification: ROUTE types " + sourceField .getTypeName () + " and " + destinationField .getTypeName () + " do not match.");

				var
					id    = sourceField .getId () + "." + destinationField .getId (),
					route = new X3DRoute (sourceNode, sourceField, destinationNode, destinationField);

				this .routes .getValue () .push (route);
				this .routeIndex [id] = route;

				return route;
			}
			catch (error)
			{
				throw new Error ("Bad ROUTE specification: " + error .message); 
			}
		},
		deleteRoute: function (route)
		{
			try
			{
				var
					sourceField      = route ._sourceField,
					destinationField = route ._destinationField,
					id               = sourceField .getId () + "." + destinationField .getId (),
					index            = this .routes .getValue () .indexOf (route);

				route .disconnect ();

				if (index !== -1)
					this .routes .getValue () .splice (index, 1);

				delete this .routeIndex [id];
			}
			catch (error)
			{
				console .log (error);
			}
		},
		getRoute: function (sourceNode, sourceField, destinationNode, destinationField)
		{
			if (! sourceNode .getValue ())
				throw new Error ("Bad ROUTE specification: sourceNode is NULL.");

			if (! destinationNode .getValue ())
				throw new Error ("Bad ROUTE specification: destinationNode is NULL.");

			var
				sourceField      = sourceNode .getValue () .getField (sourceField),
				destinationField = destinationNode .getValue () .getField (destinationField),
				id               = sourceField .getId () + "." + destinationField .getId ();

			return this .routeIndex [id];
		},
		changeViewpoint: function (name)
		{
			try
			{
				var
					namedNode = this .getNamedNode (name),
					viewpoint = X3DCast (X3DConstants .X3DViewpointNode, namedNode);

				if (! viewpoint)
					throw 1;

				if (viewpoint .isBound_ .getValue ())
					viewpoint .transitionStart (null, viewpoint);

				else
					viewpoint .set_bind_ = true;
			}
			catch (error)
			{
				if (! this .isRootContext ())
					this .getExecutionContext () .changeViewpoint (name);
				else
					throw new Error ("Viewpoint named '" + name + "' not found.");
			}
		},
		addLoadCount: function (node)
		{
			this .loadCount_ = this .loadCount_ .getValue () + 1;
		},
		removeLoadCount: function (node)
		{
			this .loadCount_ = this .loadCount_ .getValue () - 1;
		},
	});

	Object .defineProperty (X3DExecutionContext .prototype, "worldURL",
	{
		get: function () { return this .getWorldURL (); },
		enumerable: true,
		configurable: false
	});

	Object .defineProperty (X3DExecutionContext .prototype, "rootNodes",
	{
		get: function () { return this .getRootNodes (); },
		set: function (value) { this .setRootNodes (value); },
		enumerable: true,
		configurable: false
	});

	return X3DExecutionContext;
});
