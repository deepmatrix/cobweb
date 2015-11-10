
var Bookmarks = (function ()
{
"use strict";

	function shuffle (array)
	{
		var i = array .length;
	
		while (i > 1)
		{
			var
				a = -- i,
				b = Math .floor (Math .random () * a),
				t = array [a];
	
			array [a] = array [b];
			array [b] = t;
		}
	
		return array;
	}
	
	function Bookmarks (browser, element, bookmarks, index)
	{
		this .browser         = browser;
		this .element         = element;
		this .bookmarks       = bookmarks;
		this .index           = index;
		this .randomBookmarks = [ ];
	}
	
	Bookmarks .prototype =
	{
		setup: function ()
		{
			this .toggle ();
		},
		loadURL: function (URL)
		{
			this .browser .loadURL (new X3D .MFString (URL), new X3D .MFString ());
		},
		toggle: function ()
		{
			this .element .empty ();
	
			this .bookmarks [this .index] .forEach (function (item)
			{
				$("<a/>")
					.attr ("href", "#")
					.click (this .loadURL .bind (this, item .url))
					.text (item .name)
					.appendTo (this .element);
	
				this .element .append ("<br/>");
			},
			this);
				
			this .element .append ("<br/>");
	
	
			$("<a/>")
				.attr ("href", "#")
				.click (this .random .bind (this))
				.text ("Random World")
				.appendTo (this .element);
	
			this .element .append ("<br/>");
			this .element .append ("<br/>");
	
			this .index = (this .index + 1) % this .bookmarks .length;
	
			$("<a/>")
				.attr ("href", "#")
				.click (this .toggle .bind (this))
				.text ("Page " + (this .index + 1))
				.appendTo (this .element);
			
		},
		random: function ()
		{
			if (this .randomBookmarks .length === 0)
			{
				for (var p = 0; p < this .bookmarks .length; ++ p)
				{
					var page = this .bookmarks [p];
	
					for (var w = 0; w < page .length; ++ w)
						this .randomBookmarks .push (page [w]);
				}
	
				shuffle (this .randomBookmarks);
			}
	
			this .browser .loadURL (new X3D .MFString (this .randomBookmarks .pop () .url), new X3D .MFString ());
		},
	};

	return Bookmarks;
}) ();