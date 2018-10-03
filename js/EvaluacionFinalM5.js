var listHoteles = [];// ***** Arreglo de Hoteles
var marker = null;

function cambiarPagina(page){
    
	$.mobile.changePage("#"+page, {
		transition: "flip"
	});
}

function reconstruirTabla(){
	var listaHoteless = $("#listaHoteles");
	$(".lihotel").remove();

	if (listHoteles.length == 0) {
		var li = $("<li>").addClass("lihotel");
		li.text("No hay hoteles registrados.");
		listaHoteless.append(li);
	}
	
	$(listHoteles).each(function(i,e){
		var li = $("<li>").addClass("lihotel");
		var a = $("<a>").text(e.nombre).data("hotel", e).click(function(){
			verHotel($(this).data("hotel"));
		});
		li.append(a);
		listaHoteless.append(li);
	});
	
	if (listaHoteless.hasClass('ui-listview')) {
    	listaHoteless.listview('refresh');
    } else {
    	listaHoteless.trigger('create');
    }	
}

function limpiarCamposRegistro() {
		$("#Nombre").val("");
		$("#Ciudad").val("");
		$("#Telefono").val("");
		$("#Estrellas").val("");
}

function agregarMarcador(e) {
	if (marker) {
		marker.setMap(null);
		marker = null;
	}	
	
	marker = new google.maps.Marker({
		position: e.latLng,
		map: this,
		draggable: true,
		title: $("#Nombre").val() == "" ? "Ubicación Hotel" : $("#Nombre").val()
	});

	//Intento obtener la ciudad
	var Ciudad = $('#Ciudad');
	//if (Ciudad.val() == "") {
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({'location': e.latLng}, function(results, status){
			if (status == google.maps.GeocoderStatus.OK && results[2]){
				Ciudad.val(results[2].formatted_address);
			} else {
				Ciudad.val("");
			}
		});
	//}
}

$(document).ready(function () {
	//Cargar hoteles desde el localStorage
	if (typeof(Storage) !== "undefined") {
		var lstHoteles = localStorage.lstHoteles;
		if (lstHoteles && lstHoteles.length > 0) {
			listHoteles = $.parseJSON(lstHoteles);
		}
	}

	reconstruirTabla();

	$("#paginaRegistro").on("pageshow", function (event, ui) {		
		var LatLng = new google.maps.LatLng(10.405030, -75.507757); 
		var opciones = {            
				zoom: 12,
				center: LatLng,
				mapTypeId: google.maps.MapTypeId.ROADMAP        
		};
		var mapa = new google.maps.Map(document.getElementById("divMapaRegistro"), opciones);
		mapa.addListener('click', agregarMarcador);
		$("#Nombre").focus();
	});
	
	$("#paginagHotel").on("pageshow", function (event, ui) {		
		var hotel = $("#divMapaHotel").data("hotel");
		var LatLng = new google.maps.LatLng(hotel.ubicacion.lat,hotel.ubicacion.long); 
		var opciones = {            
				zoom: 16,
				center: LatLng,
				mapTypeId: google.maps.MapTypeId.ROADMAP        
		};
		var mapa = new google.maps.Map(document.getElementById("divMapaHotel"), opciones);
			
		var myMarker = new google.maps.Marker({
			position: LatLng,
			map: mapa,
            icon:"img/iconHotel.png",
			title: hotel.nombre
		});
		
		
	});

	$("#btnPagiRegistrar, #btnAgregarHotelPLH").click(function () {
		limpiarCamposRegistro();	
		
		cambiarPagina("paginaRegistro");
	});
    
    
    
    
	
	$("#btnlistaHotelesPI, #btnlistaHotelesPH").click(function () { 
        cambiarPagina("paginaListaHoteles"); 
    });
	
    
    $("#btnPaginaInicioPR, #btnPaginaInicioPLH, #btnPaginaInicioPH").click(function () { 
        cambiarPagina("paginaInicio"); 
    
    
    
    });
	
    
    $("#btnDelete").click(eliminarHotel);

	$("#btnRegistrar").click(crearHotel);
});

function verHotel(hotel) {
	$("#NombreH").text(hotel.nombre);
	$("#CiudadH").text(hotel.ciudad);
	$("#TelefonoH").text(hotel.telefono);
	$("#EstrellasH").text(hotel.estrellas);
	$("#divMapaHotel").data("hotel", hotel);
	$("#btnDelete").data("hotel", hotel);


	cambiarPagina("paginagHotel");
}

function eliminarHotel() {
	if (confirm("Esta acción eliminará el hotel de la lista. ¿Desea continuar?")) {
		var btnDelete = $(this);
		var hotel = btnDelete.data("hotel");
		var hotelIndex = null;

		for (var i = 0; i < listHoteles.length; i++) {
			if (listHoteles[i].id == hotel.id) {
				hotelIndex = i;
			}
		}

		if (hotelIndex >= 0) listHoteles.splice(hotelIndex, 1);
		for (var i = hotelIndex; i < listHoteles.length; i++) {
			listHoteles[i].id--;
		}

		saveToLocalStorage();
		reconstruirTabla();
		cambiarPagina("paginaListaHoteles");
	}
}

function crearHotel() {
	var nombre = $("#Nombre").val();
	var ubicacion = {lat: null, "long": null};
	if (marker) {
		var ubicacion = {lat: marker.getPosition().lat(), "long": marker.getPosition().lng()};			
	}
	var ciudad = $("#Ciudad").val();
	var telefono = $("#Telefono").val();
	var estrellas = $("#Estrellas").val();

	if (nombre == "") {
		alert("Por favor suministre un nombre para este hotel.");
		return false;
	}

	if (ciudad == "") {
		alert("Por favor suministre la ciudad donde está localizado el hotel.");
		return false;
	}

	var hotel = {
		nombre: nombre,
		ubicacion: ubicacion,
		ciudad: ciudad,
		telefono: telefono,
		estrellas: estrellas,
		id: null
	};

	if (listHoteles === undefined) listHoteles = [];
	hotel.id = listHoteles.length + 1;
	listHoteles.push(hotel);
	saveToLocalStorage();
	
	limpiarCamposRegistro();
    reconstruirTabla();
    verHotel(hotel);
}

function saveToLocalStorage(){
	if (typeof(Storage) !== "undefined") {
		//Guardo lista de hoteles
		localStorage.lstHoteles = JSON.stringify(listHoteles);
    }
}