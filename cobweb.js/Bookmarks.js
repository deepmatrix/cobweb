
var Bookmarks = (function ()
{
"use strict";

	var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i .test (navigator .userAgent);

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
	
	function Bookmarks (browser, element, bookmarks, filesPerPage)
	{
		var index = X3D .require ("lib/dataStorage") ["Bookmarks.pageIndex"];

		this .browser         = browser;
		this .element         = element;
		this .bookmarks       = bookmarks;
		this .filesPerPage    = filesPerPage;
		this .index           = index || 0;
		this .randomBookmarks = [ ];

	}
	
	Bookmarks .prototype =
	{
		setup: function ()
		{
			var
				bookmarks    = this .bookmarks,
				filesPerPage = this .filesPerPage,
				index        = this .index,
				pages        = [ ];

			if (mobile)
				bookmarks = bookmarks .filter (function (bookmark) { return bookmark .mobile; });
	
			while (bookmarks .length)
				pages .push (bookmarks .splice (0, filesPerPage || 20));
	
			index = Math .min (index, pages .length - 1);
	
			this .pages = pages;

			this .next (0);
		},
		setSplit (value)
		{
			this .split = value;
		},
		loadURL: function (url)
		{
			X3D .require ("lib/dataStorage") ["Bookmarks.url"] = url;

			this .browser .loadURL (new X3D .MFString (url), new X3D .MFString ());

			return false;
		},
		next: function (n)
		{
			this .element .empty ();
	
			this .index = (this .index + this .pages .length + n) % this .pages .length;

			X3D .require ("lib/dataStorage") ["Bookmarks.pageIndex"] = this .index;

			this .pages [this .index] .forEach (function (item)
			{
				if (this .split)
				{
					for (var i = 0; i < item .url .length; ++ i)
					{
						$("<a/>")
							.attr ("href", item .url [i])
							.attr ("title", item .url [i])
							.click (this .loadURL .bind (this, item .url [i]))
							.text (i ? "*" : item .name)
							.addClass (i ? "bookmark-link" : "bookmark-first-link")
							.appendTo (this .element);
					}
				}
				else
				{
					$("<a/>")
						.attr ("href", item .url [0])
						.attr ("title", item .url [0])
						.click (this .loadURL .bind (this, item .url))
						.text (item .name)
						.addClass ("bookmark-link")
						.appendTo (this .element);
				}

				this .element .append ("<br/>");
			},
			this);
				
			this .element .append ("<br/>");

			$("<a/>")
				.attr ("href", "random")
				.attr ("title", "Random World")
				.click (this .random .bind (this))
				.text ("Random World")
				.appendTo (this .element);
	
			this .element .append ("<br/>");
			this .element .append ("<br/>");
	
			$("<a/>")
				.attr ("href", "previous")
				.attr ("title", "Previous Page")
				.click (this .next .bind (this, -1))
				.text ("◂ ◂")
				.appendTo (this .element);

			this .element .append (document .createTextNode (" Page " + (this .index + 1) + " "));
	
			$("<a/>")
				.attr ("href", "next")
				.attr ("title", "Next Page")
				.click (this .next .bind (this, 1))
				.text ("▸ ▸")
				.appendTo (this .element);
			
			return false;
		},
		random: function ()
		{
			if (this .randomBookmarks .length === 0)
			{
				for (var p = 0; p < this .pages .length; ++ p)
				{
					var page = this .pages [p];
	
					for (var w = 0; w < page .length; ++ w)
						this .randomBookmarks .push (page [w]);
				}
	
				shuffle (this .randomBookmarks);
			}

			this .loadURL (this .randomBookmarks .pop () .url);
			return false;
		},
		restore: function ()
		{
			this .loadURL (X3D .require ("lib/dataStorage") ["Bookmarks.url"]);
		},
	};

	return Bookmarks;
}) ();
