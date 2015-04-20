
define ([
	"jquery",
	"cobweb/Base/X3DChildObject",
],
function ($, X3DChildObject)
{
	function Event (field, sources)
	{
		return {
			field: field,
			sources: sources,
			copy: function ()
			{
				return Event (this .field, $.extend ({  }, this .sources));
			},
		};
	}

	function X3DEventObject (browser)
	{
		X3DChildObject .call (this);

		this .browser = browser;
	}

	X3DEventObject .prototype = $.extend (Object .create (X3DChildObject .prototype),
	{
		constructor: X3DEventObject,
		extendedEventHandling: true,
		getBrowser: function ()
		{
			return this .browser;
		},
		setExtendedEventHandling: function (value)
		{
			this .extendedEventHandling = value;
		},
		addEvent: function (field)
		{
			if (field .getTainted ())
				return;

			//try
			//{
			//	console .log (this .getId (), this .getTypeName (), field .getName ());
			//}
			//catch (error)
			//{ }

			field .setTainted (true);

			this .addEventObject (field, Event (field, { }));
		},
		addEventObject: function (field, event)
		{
			this .getBrowser () .addBrowserEvent ();

			// Register for processEvent

			this .getBrowser () .addTaintedField (field, event);

			// Register for eventsProcessed

			if (! this .getTainted ())
			{
				if (field .isInput () || (this .extendedEventHandling && ! field .isOutput ()))
				{
					this .setTainted (true);
					this .getBrowser () .addTaintedNode (this);
				}
			}
		},
		addNodeEvent: function ()
		{
			if (! this .getTainted ())
			{
				this .setTainted (true);
				this .getBrowser () .addTaintedNode (this);
			}
		},
		eventsProcessed: function ()
		{
			this .setTainted (false);
			this .processInterests ();
		},
	});

	return X3DEventObject;
});
