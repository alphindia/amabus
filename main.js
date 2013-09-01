document.body.onload = function(){

	/**
	 *	role -> permet la suppression aisée d'un élément dans un array
	 *
	 *	GET @mixed: val -> référence de l'élément à supprimer
	 *  Returns: none
	 */

	Array.prototype.unset = function(val){

		var index = this.indexOf(val);
		if(index > -1)
		{
			this.splice(index,1);
		}
	};

	/**
	 *	role -> retourne le prochain frère de l'élément spécifié du type DOM spécifié
	 *
	 *	GET @string : tag -> name of the tag
	 *		@HTMLElement : element -> currentChild
	 *  Returns: @HTMLElement
	 */

	function giveNextTag(tag, element){

		tag = tag.toUpperCase() ;
		do { element = element.nextElementSibling ; }
		while(element.tagName != tag);

		return element ;
	}

	// Pour éviter de se retaper le code à chaque fois 
	var api = {
		ajx : {

			getFile : function(chemin, fonction)
			{
				var xhr = new XMLHttpRequest();
				xhr.open('GET', chemin);
				xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");

				xhr.onreadystatechange = function(){
					if (xhr.readyState == 4 && xhr.status == 200) {
						fonction(xhr.responseText);
					}
				};
				xhr.send(); // La requête est prête, on envoie tout !
			},

			getXML : function(chemin, fonction)
			{
				var xhr = new XMLHttpRequest();
				xhr.open('GET', chemin);
				xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");

				xhr.onreadystatechange = function(){
					if (xhr.readyState == 4 && xhr.status == 200) {
						fonction(xhr.responseXML);
					}
				};
				xhr.send(); // La requête est prête, on envoie tout !
			}
		},

		geo : {

			getPosition : function(fonction, error)
			{
				if(error == undefined)
				{
					navigator.geolocation.getCurrentPosition(fonction, api.geo.displayError);
				}
				else
				{
					navigator.geolocation.getCurrentPosition(fonction, error);
				}
			},

			displayError : function(error)
			{
				switch(error.code)
				{
					case error.PERMISSION_DENIED :
						window.location = "PAGE D'EXPLICATION" ;

						break;

					case error.TIMEOUT :
						if(confirm("La localisation prend trop de temps. Voulez-vous réessayer ?"))
						{
							// GetPosition
						}
						break;

					case error.UNKNOWN_ERROR:
					case error.POSITION_UNAVAILABLE:
					default:
						alert("Une erreur s'est produite durant la localisation. Essayez de recharger la page plus tard.");
						break ;
				}
			},

			coder : new google.maps.Geocoder()
		}
	};

	function LightBox(){

		var that = this ;

		this.background = document.createElement("div");
			this.background.id = "lightbox" ;
			this.background.style.display = "none";

		this.foreground = document.createElement("div");
			this.foreground.className = "lightbox_content";

		this.background.addEventListener('click', function(e){

			if (e.currentTarget == this) {
				that.hide();
			}
		}, false);

		this.foreground.addEventListener('click', function(e){ e.stopPropagation(); }, false);

		this.background.appendChild(this.foreground);
		document.body.appendChild(this.background);

		this.show = function()
		{
			document.body.className = "stop-scrolling";
			this.background.style.display = "block";
		};

		this.hide = function()
		{
			document.body.className = "";
			this.background.style.display = "none";
		};

		this.setContent = function(HTMLElement)
		{
			var first = this.foreground.firstChild ;

			while(first)
			{
				this.foreground.removeChild(first);
				first = first.nextElementSibling ;
			}

			var fermer = document.createElement("a");
				fermer.className = "right alert" ;
				fermer.textContent = "Fermer" ;
				fermer.href = "#"
				fermer.onclick = function()
				{
					that.hide();
					return false ;
				};

			this.foreground.appendChild(fermer);
			this.foreground.appendChild(HTMLElement);
		};
	}

	function FavorisManager(container){

		//Gestion des favoris
		var that = this ;
		this.listeFavoris = [];
		this.isEditing = false ;
		this.container = container ;

		//Un semblant de pattern singleton
		Favori.manager = this ;

		this.editButton = document.createElement("input");
			this.editButton.type = "button" ;
			this.editButton.value = "Modifier" ;
			this.editButton.className = "right" ;

			this.editButton.onclick = function()
			{

				that.isEditing = !that.isEditing ;

				if(that.isEditing)
				{
					this.value = "Terminer" ;
					this.className = "right active" ;

					for(var c = that.listeFavoris.length, i = 0 ; i < c ; i++)
					{
						that.listeFavoris[i].setEditable(true);
					}

					that.addFavoriButton.style.display =  "block" ;
				}
				else
				{
					this.value = "Modifier" ;
					this.className = "right" ;

					for(var c = that.listeFavoris.length, i = 0 ; i < c ; i++)
					{
						that.listeFavoris[i].setEditable(false);
					}

					that.addFavoriButton.style.display =  "none" ;
				}
				
			};

		this.addFavoriButton = document.createElement("input");
			this.addFavoriButton.className = "centered";
			this.addFavoriButton.type = "button" ;
			this.addFavoriButton.value = "Ajouter un lieu favori";

			this.addFavoriButton.onclick = function(){
				that.addFavori();
			};

			this.addFavoriButton.style.display =  "none" ;

		this.container.insertBefore(this.editButton, this.container.firstChild);
		this.container.appendChild(this.addFavoriButton);

		this.getCurrentFavoris = function(anticipation)
		{
			var listeCurrent = [] ;
			var defaultFavori ;

			for (var i = 0, c = this.listeFavoris.length ; i < c; i++) {
				if(this.listeFavoris[i].isCurrent(anticipation))
				{
					listeCurrent.push(this.listeFavoris[i]);
				}

				if(this.listeFavoris[i].isDefault)
				{
					defaultFavori = this.listeFavoris[i] ;
				}
			}

			if(listeCurrent.length > 0)
			{
				return listeCurrent ;
			}
			else
			{
				return [defaultFavori] ;
			}

		};

		this.addFavori = function(){

			var fav = new Favori(this.container, this);
			fav.afficher();

			this.listeFavoris.push(fav);
			if(this.listeFavoris.length == 1){ fav.setDefault(true); }
			if(this.isEditing){ fav.setEditable(true); }

			fav.container.addEventListener("click", this.activer, false);

			this.serialize();
			return fav;
		};

		this.removeFavori = function(val){

			val.effacer();
			this.listeFavoris.unset(val);

			if(this.listeFavoris.length == 0){
				this.addFavori();
			}

			this.serialize() ;
		};

		//gestion de la persistance des données
		this.serialize = function(){
			var listeSerialize = [];

			for (var i = 0, c = this.listeFavoris.length ; i < c; i++) {
				listeSerialize.push(this.listeFavoris[i].serialize());
			}

			localStorage.setItem("serializedFavList", JSON.stringify(listeSerialize));
		};

		this.unserialize = function(){

			var listeUnserialize = JSON.parse(localStorage.getItem("serializedFavList"));

			for (var i = 0, c = listeUnserialize.length ; i < c; i++) {
				var fav = new Favori(this.container) ;
				fav.unserialize(listeUnserialize[i]);
				fav.afficher();

				fav.container.addEventListener("click", this.activer, false);

				this.listeFavoris.push(fav);

			}
		};


		/**
		 *	role -> renvoi un objet Favori dans la liste du manager d'après une vue donnée
		 *
		 *	GET: @HTMLElement: view (HTMLElement)
		 *  Returns: @Favoris
		 */

		this.VtoF = function(view){

			while(view.parentNode != this.container)
			{
				view = view.parentNode ;
			}

			var i = 0,
			//On ne commence que par le TROISIÈME enfant, le premier étant le titre, le second le bouton d'édition
			currentFav = this.container.firstElementChild.nextElementSibling.nextElementSibling ; 

			while(currentFav != view){
				i++ ;
				currentFav = currentFav.nextElementSibling ;
			}

			return this.listeFavoris[i] ;
		};
	}

	function Favori(container, manager){

		var that = this ;

		this.nom = "Nouveau lieu";
		this.isDefault = false ;

		this.isEditable = false ;
		this.isEditing = false ;

		this.adresse = "1 place Saint Laurent, 38000 Grenoble" ;
		this.longitude = 5.7322185 ;
		this.latitude = 45.1978225 ;

		this.intervals = new IntervalsManager();

		//On se sert de cette liste pour hydrater l'objet à partir des vues contenues dans le tableau
		this.listeInputs = {};

		//Gestion de toutes les vues

		this.container = document.createElement("div");
			container.insertBefore(this.container, container.lastChild);

		this.container.addEventListener("click", function(){
			if(that.isEditable && !that.isEditing)
			{
				that.setEditing(true);
			}
		}, false);

		this.setEditable = function(edit){

			var label = this.static.firstChild;

			if(edit)
			{
				this.isEditable = true ;

				label.style.display = "block";
			}
			else
			{
				this.isEditable = false ;
				if(this.isEditing){ this.setEditing(false); }

				label.style.display = "none";
			}
		};

		this.setEditing = function(edit){

			if(edit)
			{
				//Tout d'abord on désactive le favori en cours d'édition
				var editingView = document.querySelector("#editing");

				if(editingView != undefined){

					Favori.manager.VtoF(editingView).setEditing(false);

				}

				//Puis on rend le nouveau favori en édition
				this.isEditing = true ;
				this.setEditable(true) ;

				if(that.dynamic == undefined){
					that.createDynamic();
					that.container.appendChild(that.dynamic);
				}

				that.container.lastChild.style.display = "block" ;
				that.container.firstChild.style.display = "none" ;
				that.container.id = "editing";
			}
			else
			{
				this.isEditing = false ;
				
				that.bind();

				that.container.lastChild.style.display = "none" ;
				that.container.firstChild.style.display = "block" ;
				that.container.id = "";
			}

		};

		this.setDefault = function(isDefault){

			this.isDefault = isDefault ;

			if(this.listeInputs.isDefault != undefined)
			{
				this.listeInputs.isDefault.checked = this.isDefault ;
			}
		};

		this.createStatic = function(onSuccess){

			this.static = document.createElement("div");
				this.static.className = "favoris" ;

				var label = document.createElement("p");
					label.textContent = "Cliquez pour modifier";
					label.className = "right" ;
					label.style.display = "none";

				var nom = document.createElement('h5');
					nom.textContent = this.nom ;

				var adresse = document.createElement("p");
					adresse.textContent = this.adresse ;

			this.static.appendChild(label);
			this.static.appendChild(nom);
			this.static.appendChild(adresse);

			onSuccess();

			// if(this.longitude == 0 && this.latitude == 0)
			// {
			//	this.rafraichirPosition(adresse);
			// }
		};

		this.createDynamic = function(){

			this.dynamic = document.createElement("div");
				this.dynamic.className = "favoris" ;

				var nom = document.createElement('input');
					nom.className = "h5";
					nom.type = "text" ;
					nom.value = this.nom ;

				var adresseContainer = document.createElement("div");
				var adresse = document.createElement("input");
					adresse.className = "p collapsed" ;
					adresse.type = "text";
					adresse.value = this.adresse ;

					adresseContainer.appendChild(adresse);

				var map = document.createElement("div");
					map.className = "map";

				var longitude = document.createElement("input");
					longitude.type = "hidden" ;
					longitude.value = this.longitude ;

				var latitude = document.createElement("input");
					latitude.type = "hidden" ;
					latitude.value = this.latitude ;

				var horaires = document.createElement("div");
					horaires.className = "horaires";

				//On dit au gestionnaire des intervals où s'afficher
					this.intervals.afficher(horaires);


				var isDefaultContainer = document.createElement("div");
					isDefaultContainer.className = "noPadLeft" ;

					randomId = Math.random() * 10000 + this.latitude + this.longitude - (new Date().getTime());

					var isDefault = document.createElement('input');
						isDefault.type = "checkbox";
						isDefault.id = randomId ;
						isDefault.className = "isDefault" ;

						if(this.isDefault) { isDefault.checked = true ; }

						isDefault.addEventListener('click', function(e){

							var listeCheck = that.container.parentNode.querySelectorAll("input.isDefault");
							console.log(listeCheck);

							if(e.target.checked)
							{
								for (var check in listeCheck) {
									if(listeCheck[check].checked && e.target != listeCheck[check])
									{
										Favori.manager.VtoF(listeCheck[check]).setDefault(false) ;
										break ;
									}
								}
							}
							else
							{
								e.preventDefault();
							}

						}, false);

					var isDefaultLabel = document.createElement("label");
						isDefaultLabel.textContent = "Faire de ce favoris le lieu par défaut";
						isDefaultLabel.setAttribute("for", randomId) ;

					isDefaultContainer.appendChild(isDefault);
					isDefaultContainer.appendChild(isDefaultLabel);

				var deleteButton = document.createElement("input");
					deleteButton.type = "button";
					deleteButton.className = "alert centered";
					deleteButton.value = "Supprimer ce favoris";

					deleteButton.onclick = function(){

						if(confirm("Etes-vous sûr de vouloir supprimer " + that.nom + " ?"))
						{
							Favori.manager.removeFavori(that);
						}
					};

			this.dynamic.appendChild(nom);
			this.dynamic.appendChild(adresseContainer);
			this.dynamic.appendChild(map);
			this.dynamic.appendChild(longitude);
			this.dynamic.appendChild(latitude);
			
			this.dynamic.appendChild(horaires);

			this.dynamic.appendChild(isDefaultContainer);
			this.dynamic.appendChild(deleteButton);

			this.listeInputs = {
				"nom": nom,
				"longitude": longitude,
				"latitude": latitude,
				"adresse": adresse,
				"isDefault": isDefault
			};

			this.addGeocodeSupport(map, adresse, latitude, longitude);//On fait cela en dernier car on a besoin des noeuds parents de certains elements

			this.dynamic.style.display = "none";
		};

		this.addGeocodeSupport = function(mapContainer, adresse, latitude, longitude){

			var center = new google.maps.LatLng(this.latitude, this.longitude);

			var map = new google.maps.Map(mapContainer,
			{
				center: center,
				zoom: 16,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				streetViewControl: false
			});

			var marker = new google.maps.Marker({

				draggable: true,
				flat: true,

				position: center,
				map: map

			});

			var boutonRecherche = document.createElement("input");
				boutonRecherche.value = "Rechercher";
				boutonRecherche.type = "button" ;
				boutonRecherche.className = "collapsed";

				adresse.parentNode.insertBefore(boutonRecherche, adresse.nextElementSibling);

			// Toutes les fonctions suivantes permettent de lancer le geocoding

			google.maps.event.addListener(marker, 'dragend', function(e){

				if(e.latLng) {
					//on applique un traitement de geocoding: coordonnées -> adresse
					var latLng = new google.maps.LatLng(e.latLng.lat(), e.latLng.lng());
					updateMap({'latLng': latLng});

				} else {
					alert("Erreur: le point n'a pu être enregistré");
				}

			});

			boutonRecherche.addEventListener('click', function(){ updateMap({'address': adresse.value}); }, false);

			adresse.addEventListener('keypress', function(e){

				if(e.keyCode == 13){
					updateMap({'address': adresse.value});
				}

			},false);

			function updateMap(options){
				api.geo.coder.geocode(options, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						if (results[0]) {
							adresse.value = results[0].formatted_address ;

							for(var arg in results[0].geometry.location)
							{
								var pos = parseFloat(results[0].geometry.location[arg]);
								if(pos > 30 && pos < 50)
								{
									latitude.value = pos ;
								}
								else if(pos > 1 && pos < 10)
								{
									longitude.value = pos ;
								}
							}

							map.setCenter(results[0].geometry.location);
							marker.setPosition(results[0].geometry.location);
						} else {
							alert('No results found');
						}
					} else {
						alert('Geocoder failed due to: ' + status);
					}
				});
			}
		};

		//Cette fonction hydrate la vue des champs affichés en mode static ainsi que le modèle
		this.bind = function(){

			//On hydrate d'abord le modèle

			for(var val in this.listeInputs){
				switch(this.listeInputs[val].type)
				{
					case "checkbox":
						this[val] = this.listeInputs[val].checked ;
						break ;
					default:
						this[val] = this.listeInputs[val].value ;
						break ;
				}
			}

			//Sans oublier de typer les variables
			this.latitude = parseFloat(this.latitude);
			this.longitude = parseFloat(this.longitude);

			//Puis on hydrate la vue
				//Le noeud du titre
				var currentElement = giveNextTag("h5", this.static.firstChild) ;
				currentElement.textContent = this.nom ;

				//Le noeud de l'adresse
				currentElement = giveNextTag("p", currentElement);
				currentElement.textContent = this.adresse ;

			Favori.manager.serialize();
		};

		//La création de la vue dynamique se fait au clic sur le bouton "modifier"
		this.afficher = function(){

			this.createStatic(function(){
				that.container.appendChild(that.static) ;
			});
		};

		this.effacer = function(){

			this.container.parentNode.removeChild(this.container);
		};

		this.isCurrent = function(anticipation){

			var date = new Date();
			var jour = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"][date.getDay()] ;

			var now = new Horaire(date.getHours(), date.getMinutes());

			for (var i = 0, c = this.intervals.listeIntervals[jour].length ; i < c; i++) {
				if(this.intervals.listeIntervals[jour][i].isCurrent(now, anticipation))
				{
					return true ;
				}
			}

		};

		//Gestion de la persistance des données

		this.serialize = function()
		{
			return {
				"nom": this.nom,
				"isDefault": this.isDefault,
				"adresse": this.adresse,
				"latitude": this.latitude,
				"longitude": this.longitude,
				"intervals": this.intervals.serialize()
			};
		};

		this.unserialize = function(args)
		{
			for(var arg in args)
			{
				if(arg == "intervals")
				{
					this[arg] = new IntervalsManager();
					this[arg].unserialize(args[arg]);
				}
				else
				{
					this[arg] = args[arg] ;
				}
			}
		};
	}

	function IntervalsManager(){
		var that = this ;
		this.listeIntervals = {

			"lundi": [],
			"mardi": [],
			"mercredi": [],
			"jeudi": [],
			"vendredi": [],
			"samedi": [],
			"dimanche": []

		};

		this.afficher = function(container)
		{
			this.container = container ;
			this.container.innerHTML = "" ;

			for(var jour in this.listeIntervals)
			{
				if(this.listeIntervals[jour].length != 0)
				{
					var journee = document.createElement("div");
					var titre = document.createElement("h5");
						titre.textContent = jour ;

					var listeIntervalsVue = document.createElement("ul");

					for (var i = 0, c = this.listeIntervals[jour].length ; i < c; i++) {
						
						var interval = this.listeIntervals[jour][i];
						var intervalVue = interval.afficher(listeIntervalsVue);

						var deleteButton = document.createElement("a");
							deleteButton.href = "#" ;
							deleteButton.textContent = "Supprimer" ;
							deleteButton.setAttribute("data-id", i);
							deleteButton.setAttribute("data-day", jour);

							deleteButton.addEventListener("click", function(e){
								
								e.preventDefault();
								that.removeInterval(this.getAttribute("data-day"), this.getAttribute("data-id"));

							}, false);

							intervalVue.insertBefore(deleteButton, intervalVue.firstChild);
					}

					journee.appendChild(titre);
					journee.appendChild(listeIntervalsVue);

					this.container.appendChild(journee);
				}
			}

			var ajouter = document.createElement("input");
				ajouter.className = "centered";
				ajouter.type = "button";
				ajouter.value = "Ajouter un interval de présence";

				ajouter.onclick = function()
				{
					that.addInterval();
				};

			this.container.appendChild(ajouter);

		};

		this.removeInterval = function(jour, id)
		{
			var interval = this.listeIntervals[jour][id];
			this.listeIntervals[jour].unset(interval);
			this.afficher(this.container);
		};

		this.addInterval = function(){

			this.intervalDefiner.defineInterval();
		};

		this.pushList = function(args){
			for(var i = 0, c = args.jours.length ; i < c ; i++)
			{
				that.listeIntervals[args.jours[i]].push(new Interval(args)) ;
			}

			that.afficher(that.container);
		};

		//Gestion de la persistance des données

		this.serialize = function(){
			
			var listeSerialize = {};

			for(var jour in this.listeIntervals)
			{
				if(typeof listeSerialize[jour] == "undefined")
				{
					listeSerialize[jour] = [];
				}

				for (var i = 0, c = this.listeIntervals[jour].length ; i < c; i++) {
					listeSerialize[jour].push(this.listeIntervals[jour][i].serialize());
				}
			}


			return listeSerialize ;
		};

		this.unserialize = function(listeUnserialize)
		{
			for(var jour in listeUnserialize)
			{
				for (var i = 0, c = listeUnserialize[jour].length ; i < c; i++) {
					var interval = new Interval(listeUnserialize[jour][i]) ;
					this.listeIntervals[jour].push(interval);

				}
			}
		};

		this.intervalDefiner = new IntervalDefiner(this.pushList);
	}

	function IntervalDefiner(callback){
		var that = this ;

		this.callback = callback ;
		this.interval = {} ;
		this.inputs = {} ; //Pour pouvoir récupérer facilement les options choisies par l'utilisateur, on sauvergarde les champs

		this.defineInterval = function(favName)
		{
			this.lightbox = new LightBox();
			this.lightbox.setContent( this.createView(favName) );
			this.lightbox.show() ;
		};

		this.createView = function(favName)
		{
			var container = document.createElement("div");

			//La prsentation
			var titre = document.createElement("h3");
				titre.textContent = "Ajouter un horaire" ;

			var text = document.createElement("p") ;
				text.textContent = "Je suis à "/* + favName + "*/ + " ce favori le " ;

			//Les jours
			var day = document.createElement("p");

				this.inputs.jours = {} ;
				var listeJours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"] ;
				var dayId = new Date().getDay();
				dayId = dayId > 0 ? dayId - 1 : 6 ;

				for (var i = 0, c = listeJours.length ; i < c; i++) {

					var jour = listeJours[i] ;

					var checkbox = document.createElement("input");
						checkbox.type = "checkbox" ;
						checkbox.id = jour ;
						checkbox.value = i ;

						if(i == dayId)
						{
							checkbox.checked = "checked" ;
						}

					var label = document.createElement("label") ;
						label.setAttribute("for", jour);
						label.textContent = jour ;

						day.appendChild(checkbox);
						day.appendChild(label);

						this.inputs.jours[jour] = checkbox ;
				}

			//les heures
			function createTimeType(decalage)
			{
				var heureType = document.createElement("select"), heure = new Date().getHours() + decalage;

				for(var h=0 ; h < 24 ; h++)
				{
					var option = document.createElement("option");
						option.value = h ;
						option.textContent = h;

					if(option.value == heure)
					{
						option.selected = "selected" ;
					}

					heureType.appendChild(option);
				}

				var minutesType = document.createElement("select"), minutes = new Date().getMinutes();
				minutes = minutes - (minutes % 5);

				for(var m=0 ; m < 60 ; m += 5)
				{
					var option = document.createElement("option");
						option.value = m ;
						option.textContent = m;

					if(option.value == minutes)
					{
						option.selected = "selected" ;
					}

					minutesType.appendChild(option);
				}

				var timeType = document.createElement("span");
					timeType.appendChild(heureType);
					timeType.appendChild(document.createTextNode(":"));
					timeType.appendChild(minutesType);

				var inputs = {
					"heure" : heureType,
					"minutes" : minutesType
				};

				return { "html": timeType, "inputs": inputs } ;
			}

			var temps = document.createElement("p");

				var debut = createTimeType(0);
				var fin = createTimeType(1);

				temps.appendChild(document.createTextNode("De "));
				temps.appendChild(debut.html);
				temps.appendChild(document.createTextNode(" à "));
				temps.appendChild(fin.html);

				this.inputs.debut = debut.inputs;
				this.inputs.fin = fin.inputs;

			//Le bouton de validation
			var terminer = document.createElement("input");
				terminer.type = 'button';
				terminer.value = "Terminer";
				terminer.className = "centered";
				terminer.onclick = function(){
					that.lightbox.hide();
					that.bind();
				};

			//On compile le tout et on envoie
			container.appendChild(titre);
			container.appendChild(text);
			container.appendChild(day);
			container.appendChild(temps);
			container.appendChild(terminer);

			return container ;
		};

		this.bind = function()
		{

			this.interval.debut = {} ;
				this.interval.debut.heure = this.inputs.debut.heure.options[this.inputs.debut.heure.selectedIndex].value;
				this.interval.debut.minutes = this.inputs.debut.minutes.options[this.inputs.debut.minutes.selectedIndex].value;

			this.interval.fin = {} ;
				this.interval.fin.heure = this.inputs.fin.heure.options[this.inputs.fin.heure.selectedIndex].value;
				this.interval.fin.minutes = this.inputs.fin.minutes.options[this.inputs.fin.minutes.selectedIndex].value;

			this.interval.jours = [];
			for(var jour in this.inputs.jours)
			{
				if(this.inputs.jours[jour].checked == true)
				{
					this.interval.jours.push(jour);
				}
			}

			that.callback(this.interval);
		};
	}

	function Interval(interval){
		this.debut = new Horaire(
			interval.debut.heure,
			interval.debut.minutes
		);
		
		this.fin = new Horaire(
			interval.fin.heure,
			interval.fin.minutes
		);

		this.afficher = function(container)
		{
			var interval = document.createElement("li");
				interval.appendChild(
					document.createTextNode("De " + this.debut.toString() + " à " + this.fin.toString())
				) ;

			this.container = container ;
			this.container.appendChild(interval);

			return interval;
		};

		this.isCurrent = function(horaire, decalage)
		{
			var fin = this.fin, debut = new Horaire(this.debut.heure, this.debut.minutes);

			debut.minutes -= decalage ;
			if(debut.minutes < 0)
			{
				debut.minutes += 60 ;
				debut.heure-- ;
			}

			console.log(debut);

			if(horaire.isBetween(debut, fin))
			{
				return true ;
			}
			else
			{
				return false;
			}

		};

		//Gestion de la persistance des données

		this.serialize = function()
		{
			return {
				"debut": this.debut.serialize(),
				"fin": this.fin.serialize()
			};
		};

		this.unserialize = function(args)
		{
			for(var arg in args)
			{
				this[arg] = args[arg] ;
			}
		};
	}

	function Horaire(heure, minutes){

		this.heure = 0 + parseInt(heure, 10) % 24;
		this.minutes = 0 + parseInt(minutes, 10) % 60;

		this.toString = function()
		{
			return this.heure + ":" + this.minutes ;
		};

		this.isSup = function(h2)
		{
			if(this.heure > h2.heure)
			{
				return true ;
			}
			else if(this.heure == h2.heure && this.minute > h2.minute)
			{
				return true ;
			}
			else
			{
				return false ;
			}
		};
		
		this.isInf = function(h2)
		{
			return !this.isSup(h2);
		};

		this.isBetween = function(h1, h2)
		{
			if(h1.isInf(h2))
			{
				if(this.isSup(h1) && this.isInf(h2))
				{
					return true ;
				}
				else
				{
					return false ;
				}
			}
			else
			{
				if(this.isSup(h2) && this.isInf(h1))
				{
					return true ;
				}
				else
				{
					return false ;
				}
			}
		};

		//Gestion de la persistance des données

		this.serialize = function()
		{
			return {
				"heure": this.heure,
				"minutes": this.minutes
			};
		};

		this.unserialize = function(args)
		{
			for(var arg in args)
			{
				this[arg] = args[arg] ;
			}
		};
	}

	function routeManager(horairesContainer, mapContainer, favoris){
		var that = this ;

		this.container = horairesContainer ;
		this.mapContainer = mapContainer ;
		this.favoris = favoris ;

		this.favoris.activer =  function(){

			var fav = that.favoris.VtoF(this);

			if(!fav.isEditable)
			{
				window.scrollTo(0,0);
				that.getRoute([fav]);
			}
		};

		//Determine les favoris où aller,
		//prend les coordonnées et envoie la requete pour savoir comment y aller
		this.getRoute = function(favoris)
		{
			this.container.innerHTML = "";

			if(typeof favoris == "undefined")
			{
				favoris = this.favoris.getCurrentFavoris(30);
			}

			for (var i = 0, c = favoris.length ; i < c; i++) {
				fav = favoris[i];

				var container = this.afficherTarget(favoris[i]);

				api.geo.getPosition(function(position){
					api.ajx.getFile("traceroute.php?lat=" + position.coords.latitude + "&lng=" + position.coords.longitude + "&tLat=" + fav.latitude + "&tLng=" + fav.longitude,
						function(response){
							container.innerHTML = response ;
						}
					);

				});
			}
		};

		this.afficherTarget = function(favoris){

			var titre = document.createElement("h3");
				titre.textContent = "Pour aller à " + favoris.nom ;

			var adresse = document.createElement("h4");
				adresse.className = "adresse" ;
				adresse.textContent = favoris.adresse ;

			var result = document.createElement("div");
				result.className = 'no-pad';
				result.innerHTML = "<p>Recherche de l'itinéraire</p>" ;

			this.container.appendChild(titre);
			this.container.appendChild(adresse);
			this.container.appendChild(result);

			return result ;
		};
	}

	function Kernel(){
		this.horairesContainer = document.querySelector("#horaires");
		// this.mapContainer = document.querySelector("#map");
		this.mapContainer = null ;
		this.favorisContainer = document.querySelector("#favoris");

		this.favorisManager = new FavorisManager(this.favorisContainer);
		this.routeManager = new routeManager(this.horairesContainer, this.mapContainer, this.favorisManager);

		this.favorisManager.unserialize();
		this.routeManager.getRoute();
	}



	//On survient d'abord aux besions en Google Map
	google.maps.visualRefresh = true ;

	// Balancage massif de purée de Brocolis+pommes+liqueure de frelons
	var app = new Kernel();
	
};