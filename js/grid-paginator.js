define([
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