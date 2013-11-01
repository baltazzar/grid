require.config({
	paths: {
		'backbone'    : 'libs/backbone/backbone-min',
		'jquery'      : 'libs/jquery/jquery.min',
		'underscore'  : 'libs/underscore/underscore-min',
		'tablesorter' : 'libs/jquery.tablesorter/js/jquery.tablesorter'
	},
	shim: {
		'underscore': {
			exports: '_'
		},
		'backbone': {
			deps: ['jquery', 'underscore'],
			exports: 'Backbone'
		},
		'tablesorter': {
			deps: ['jquery']
		}
	}
});

require([
	'backbone',
	'grid'
], function(Backbone, Grid) {

	var Pessoas = Backbone.Collection.extend({
		// url: 'http://pms-teweb02:8080/acompras-fornecedor/api/public/compraDireta/listarPublicas?page=1',
		url: 'http://pms-teweb02:8080/gip-web/api/solicitacao',
		currentPage: '',
		itemCount: '',
		pageCount: '',

		initialize: function() {
			this.fetch({async: false});
		},
		parse: function(res) {
			this.currentPage = res.data.currentPage;
			this.itemCount = res.data.itemCount;
			this.pageCount = res.data.pageCount;
			this.itemOffset = res.data.itemOffset;
			return res.data.itemList;
		}
	});

	var pessoas = new Pessoas();

/*
* Grid Default
*/

	var gridDefault = new Grid({
		collection: pessoas,
		tableClasses: ['table', 'table-condensed', 'table-bordered']
	});

	$('#grid-default').html(gridDefault.render().el);

	gridDefault.initPaginator($('#grid-default-paginator1'));
	gridDefault.initPaginator($('#grid-default-paginator2'));


/*
* Grid Parametrizado
*/

/*
	var grid = new Grid({
		collection: pessoas,
		tableId: 'grid-table',
		tableClasses: ['table', 'table-bordered', 'table-condensed'],
		tableHeaders: {
			processo: 'Processo',
			objeto: 'Objeto',
			inicio: 'Data de Início',
			termino: 'Data de Término',
			situação: 'Situação'
		},
		tableSorter: ['', '', 'dateBR', 'dateBR'],
		colsMinWidth: ['50px', '', '120px', '130px', '130px']
	});

	$('#grid').html(grid.render().el);

	grid.setLastCol({
		width: '50px',
		elements: [
			'<button class="btn btn-primary btn-mini detalhe" id="#{:id}">Detalhe</button>'
		]
	});

	detalhe = function(ev) {
		console.log('Detalhe da compra #' + ev.target.id);
	}

	grid.addEventHandler(['click'], '.detalhe', detalhe);
*/

/*
	setTimeout(function() {
		pessoas.reset();
		pessoas.add({
			"id": 12,
			"processo" : "000202/2012",
			"objeto"   : "SERVIÇO DE LOCAÇÃO DE MÓDULOS PARA USO COMO VESTIÁRIO - SEMES",
			"inicio"   : "21/06/2013 15:24",
			"termino"  : "21/06/2013 15:25",
			"situação" : "Análise dos Lances"
		});

		pessoas.add({
			"id": 13,
			"processo" : "000019/2013",
			"objeto"   : "FORNECIMENTO DE HIPOCLORITO DE SODIO 1%",
			"inicio"   : "20/06/2013 10:41",
			"termino"  : "20/06/2013 10:47",
			"situação" : "Análise dos Lances"
		});
	}, 3000);
*/
});