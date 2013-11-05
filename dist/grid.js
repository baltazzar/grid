/*
*	Módulo Grid
*	Versão: 0.0.3
*	Dependências: JQuery, Backbone, Underscore, Tablesorter
*	Autores: [
		Victor Bastos - vbastos@sorocaba.sp.gov.br,
		Thiago Ribeiro - tribeiro@sorocaba.sp.gov.br,
		Renato Mestre - rmestre@sorocaba.sp.gov.br
	]
*/
define('grid-table',[
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
						if(field !== undefined && field !== null) {
							field = field;
						} else {
							field = '-';
						}
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
define('grid-paginator',[
	'backbone'
], function(Backbone){
	var GridPaginator = Backbone.View.extend({
		className: 'paginator form-inline pull-right',

		initialize: function() {
			this.listenTo(this.collection, 'all', this.updatePaginatorEls);
		},

		render: function() {
			this.$el.html(this.template());

			return this;
		},

		events: {
			'click .btn-first'    : 'goToFirstPage',
			'click .btn-last'     : 'goToLastPage',
			'click .btn-previous' : 'goToPreviousPage',
			'click .btn-next'     : 'goToNextPage',
			'change .per-page'    : 'perPage',
			'keyup .current-page' : 'goToPage'
		},

		goToFirstPage: function(ev) {
			ev.preventDefault();
			this.paginate(1);
		},

		goToLastPage: function(ev) {
			ev.preventDefault();
			this.paginate(this.collection.pageCount);
		},

		goToPreviousPage: function(ev) {
			ev.preventDefault();
			this.paginate(this.collection.currentPage - 1);
		},

		goToNextPage: function(ev) {
			ev.preventDefault();
			this.paginate(this.collection.currentPage + 1);
		},

		perPage: function(ev) {
			ev.preventDefault();
			this.paginate(1)
		},

		goToPage: function(ev) {
			ev.preventDefault();
			if(ev.keyCode == 13) {
				this.paginate(ev.target.value);
			}
		},

		paginate: function(requestPage) {
			var itensPerpage = $('.per-page').val(),
				hasParams = this.collection.url.match(/\?|\&/gi),
				oldURL = this.collection.url,
				paginateParams = 'page=' + requestPage + '&itens_per_page=' + itensPerpage;

			if(hasParams) {
				url = this.collection.url + '&' + paginateParams;
			} else {
				url = this.collection.url + '?' + paginateParams;
			}

			this.collection.url = url;
			this.collection.fetch({async: false});
			this.collection.url = oldURL;
		},

		updatePaginatorEls: function() {
			/*
			*	Calcula o offset de registros
			*/
			var offsetDe = this.collection.itemOffset,
				offsetA = (this.collection.length + this.collection.itemOffset) - 1;

			/*
			*	Atualiza os elementos do paginador com os valores recebidos da collection
			*/
			$('.current-page').val(this.collection.currentPage);
			$('.total-pages').val(this.collection.pageCount);
			$('.shown-items-de').html(offsetDe);
			$('.shown-items-a').html(offsetA);
			$('.total-items').html(this.collection.itemCount);

			/*
			*	Se currentPage for igual a 1 desabilita os botões de voltar e primeira página
			*/
			if(this.collection.currentPage == 1) {
				$('.btn-first').prop('disabled', true);
				$('.btn-previous').prop('disabled', true);
			} else {
				$('.btn-first').prop('disabled', false);
				$('.btn-previous').prop('disabled', false);
			}

			/*
			*	Se currentPage for igual a pageCount desabilita os botões de avançar e última página
			*/
			if(this.collection.currentPage == this.collection.pageCount) {
				$('.btn-last').prop('disabled', true);
				$('.btn-next').prop('disabled', true);
			} else {
				$('.btn-last').prop('disabled', false);
				$('.btn-next').prop('disabled', false);
			}

			/*
			*	Se pageCount for igual a 1 desabilita todos os elementos
			*/
			if(this.collection.pageCount == 1) {
				$('.current-page').prop('disabled', true);
				$('.per-page').prop('disabled', true);
			} else {
				$('.current-page').prop('disabled', false);
				$('.per-page').prop('disabled', false);
			}
		},

		template: function() {
			return [
				'	<label>',
				'		Por Página:',
				'		<select class="form-control input-sm per-page">',
				'			<option value="10" selected="selected">10</option>',
				'			<option value="20">20</option>',
				'			<option value="30">30</option>',
				'			<option value="40">40</option>',
				'			<option value="50">50</option>',
				'		</select>',
				'	</label>',
				'	<button class="btn btn-info btn-sm btn-first"><i class="glyphicon glyphicon-fast-backward"></i>&nbsp;</button>',
				'	<button class="btn btn-info btn-sm btn-previous"><i class="glyphicon glyphicon-backward"></i>&nbsp;</button>',
				'	<label>',
				'		Página',
				'		<input type="text" class="form-control input-sm current-page">',
				'	</label>',
				'	<label>',
				'		de',
				'		<input type="text" class="form-control input-sm total-pages" disabled="disabled">',
				'	</label>',
				'	<button class="btn btn-info btn-sm btn-next"><i class="glyphicon glyphicon-forward"></i>&nbsp;</button>',
				'	<button class="btn btn-info btn-sm btn-last"><i class="glyphicon glyphicon-fast-forward"></i>&nbsp;</button>',
				'	<span>Exibindo <span class="badge badge-warning shown-items-de"></span> à <span class="badge badge-warning shown-items-a"></span> de <span class="badge badge-warning total-items"></span></span>'
			].join('');
		}
	});

	return GridPaginator;
});
define('grid',[
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

				if(model != undefined) {
					_.each($(row).children('td'), function(td, idx){
						callback($(td),_.keys(that.params.tableHeaders)[idx], model.toJSON());
					});
				}
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