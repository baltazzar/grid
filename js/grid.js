define([
	'backbone',
	'grid-table',
	'grid-paginator',
], function(Backbone, GridTable, GridPaginator){

	var Grid = Backbone.View.extend({
		className: 'grid-table',
		eventHandlers: [],
		lastColOptions: {},

		initialize: function(params) {
			this.params = params;

			this.listenTo(this.collection, 'all', function() {
				this.render();
				if(!_.isEmpty(this.lastColOptions)) {
					this.setLastCol(this.lastColOptions);
				}
				this.setEventHandlers();
			});
		},

		render: function() {
			this.$el.html(new GridTable(this.params).render().el);
			return this;
		},

		addEventHandler: function(events, el, fn, context) {
			var events = events.join(' ');
			this.eventHandlers.push([events, el, fn, context]);
			this.setEventHandlers();
		},

		setEventHandlers: function() {
			var events, el, fn, context,
				that = this;

			_.each(this.eventHandlers, function(eh) {
				events = eh[0], el = eh[1], fn = eh[2], context = eh[3];

				$(el).on(events, function(ev) {
					return fn.call(context, ev);
				});
			});
		},

		setLastCol: function(options) {
			var tableHeader = this.$el.children('table').children('.grid-table-header').children('tr');
				tableRows = this.$el.children('table').children('tbody').children('tr'),
				colWidth = options.width ? options.width : '',
				colTitle = options.title ? options.title : '',
				elements = options.elements.join(' '),
				that = this;

			tableHeader.append('<th style="width:' + colWidth + '">' + colTitle + '</th>');

			if(this.collection.length > 0) {
				_.each(tableRows, function(row) {
					var lastCol = $(row).append('<td></td>').children('td').last(),
						model = that.collection.get(row.id),
						els;

					els = elements.replace(/#\{(\w*)\}/gi, function(test, match) {
						return model.get(match);
					});
					lastCol.append(els);
				});
			}

			this.lastColOptions = options;
		},

		getRows: function(callback) {
			var tableRows = this.$el.children('table').children('tbody').children('tr'),
				that = this;

			_.each(tableRows, function(row) {
				var model = that.collection.get(row.id);

				callback($(row), model.toJSON());
			});
		},


		getCols: function(callback) {
			var tableRows = this.$el.children('table').children('tbody').children('tr'),
				that = this;

			_.each(tableRows, function(row) {
				var model = that.collection.get(row.id);
				_.each($(row).children('td'), function(td, idx){
					callback($(td),_.keys(that.params.tableHeaders)[idx], model.toJSON());
				})
			});
		},

		initPaginator: function(element) {
			var paginator = new GridPaginator({collection: this.collection});
			element.html(paginator.render().el);
			paginator.updatePaginatorEls();
		}
	});

	return Grid;
});