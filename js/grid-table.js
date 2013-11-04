define([
	'backbone',
	'tablesorter'
], function(Backbone){

	var GridTable = Backbone.View.extend({
		template: '<thead class="grid-table-header"><tr></tr></thead><tbody class="grid-table-body"></tbody>',
		tagName: 'table',
		params: {},
		tableId: '',

		initialize: function(params) {
			this.params = params;
			this.tableId = this.params.tableId ? this.params.tableId : new Date().getTime().toString();
		},

		render: function() {
			this.$el.html(this.template);

			this.setTableId();
			this.setTableClasses();
			this.setTableHeaders();

			if(this.params.colsWidth) {
				this.setTableColsWidth();
			}

			if(this.params.collection) {
				this.setTableBody();
			}

			if(this.params.tableSorter) {
				this.startTableSorter();
			}

			return this;
		},

		setTableId: function() {
			this.$el.attr('id', this.tableId);
		},

		setTableClasses: function() {
			var tableClasses = this.params.tableClasses ? this.params.tableClasses : ['table']
			this.$el.addClass(tableClasses.join(' '));
		},

		setTableHeaders: function() {
			var headers,
				tableHeader = this.$el.children('.grid-table-header').children('tr');

			if(this.params.tableHeaders) {
				headers = _.values(this.params.tableHeaders);
			} else {
				if(this.params.collection.length > 0) {
					headers = _.keys(this.params.collection.first().toJSON());
				}
			}

			_.each(headers, function(header) {
				tableHeader.append('<th>' + header + '</th>');
			});
		},

		setTableBody: function() {
			var tableBody = this.$el.children('.grid-table-body'),
				fields = [];

			if(this.params.tableHeaders) {
				fields = _.keys(this.params.tableHeaders);
			} else {
				if(this.params.collection.length > 0) {
					fields = _.keys(this.params.collection.first().toJSON());
				}
			}

			if(this.collection.length > 0) {
				this.collection.each(function(model) {
					var white_list = [],
						partial = [];

					_.each(fields, function(field) {
						field = field.split('.');

						var attrs = '';
						_.each(field, function(v, k) {
							if(field.length == (k + 1)) {
								attrs += 'field[' + k + ']';
							} else {
								attrs += 'field[' + k + ']][';
							}
						});
						white_list.push( eval('model.attributes[' + attrs + ']') );
					});

					_.each(white_list, function(field) {
						field = field || '-';
						partial.push('<td>' + field + '</td>');
					});

					tableBody.append('<tr id="' + model.id + '">' + partial.join('') + '</tr>');
				});
			} else {
				tableBody.append('<tr class="text-info"><td colspan="' + fields.length + '"><strong>Não há registros para exibição</strong></td></tr>');
			}
		},

		setTableColsWidth: function() {
			var cols = this.$el.children('.grid-table-header').children('tr').children('th'),
				that = this;

			_.each(cols, function(col, k) {
				$(col).css('width', that.params.colsWidth[k]);
			});
		},

		startTableSorter: function() {
			var conf = this.params.tableSorter ? {headers:{}} : '';

			$.tablesorter.addParser({
				id: 'dateBR',
				is: function(s) {
					return false;
				},
				format: function(s) {
					if(/\d\d\/\d\d\/\d\d\d\d/.test(s)) {
						s = s.split(" ");
						var sdate = s[0].split("/");
						if(s[1]) {
							sdate = sdate[1] + "-" + sdate[0] + "-" + sdate[2] + " " + s[1];
						} else {
							sdate = sdate[1] + "-" + sdate[0] + "-" + sdate[2];
						}
						sdate = new Date(sdate);
						if(isNaN(sdate)) {
							return -1;
						}
						return sdate;
					}
				},
				type: 'numeric'
			});

			_.each(this.params.tableSorter, function(header, k) {
				if(header) {
					conf.headers[k] = {sorter: header};
				}
			});

			this.$el.tablesorter(conf);
			this.$el.trigger('update');
		}
	});

	return GridTable;
});