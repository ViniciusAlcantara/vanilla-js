// Create a request variable and assign a new XMLHttpRequest object to it.
let request = new XMLHttpRequest()

// Open a new connection, using the GET request on the URL endpoint

buscarDados('https://kitsu.io/api/edge/characters', 1, 0, 5)


function buscarDados (url, current_page, startPage, endPage) {
	request.open('GET', url);
	let links, total, pages;
	request.onreadystatechange = function () {
		if (this.readyState === 4) {
			let response = JSON.parse(this.responseText)
			links = response.links
			total = response.meta.count
			pages = parseInt(total / 10)
			preencheTabela(response, startPage, endPage, current_page)
		}
	};

	request.send();
}

let characters = null
let width = screen.width;
function preencheTabela(dados, startPage, endPage, current_page) {
	characters = dados.data
	if (width < 650) {
		startPage = current_page - 1
		endPage = current_page + 1
	}
	if ('content' in document.createElement('template')) {
		let rowCount = personagens.rows.length;
		for (let i = rowCount - 1; i > 0; i--) {
			personagens.deleteRow(i);
		}
		characters.forEach(dado => {
			let elemento = dado.attributes
			let t = document.querySelector('#root')
			let clone = document.importNode(t.content, true);
			let td = clone.querySelectorAll("td");
			let tr = clone.querySelectorAll("tr");
			let tb = document.getElementsByTagName("tbody");
			let img_div = document.createElement('div')
			img_div.setAttribute('class', 'circle float-left');
			let img_hero = document.createElement('img')
			img_hero.height = 50
			img_hero.width = 50
			img_hero.src = elemento.image.original
			img_div.appendChild(img_hero)
			let p_nome = document.createElement('p')
			p_nome.setAttribute('class', 'padding-25');
			p_nome.textContent = elemento.name
			// Crie uma nova row
			td[0].append(img_div);
			td[0].append(p_nome);
			td[1].textContent = elemento.description
			tr[0].setAttribute('id', dado.id)
			tr[0].setAttribute('onclick', "abrePopUp("+dado.id+")")
			// Clone a nova row e insira-a na tabela
			tb[0].appendChild(clone);
		})
		renderPaginacao(startPage, endPage, current_page, dados.links.next)
		// app.appendChild(td)
	} else {

	}
}

function abrePopUp(id) {
	let url = ''
	let elemento;
	characters.forEach(dado => {
		if (dado.id == id) {
			url = dado.relationships.mediaCharacters.links.related
			elemento = dado
		}
	})

	request.open('GET', url);
	request.onreadystatechange = function () {
		if (this.readyState === 4) {
			let response = JSON.parse(this.responseText)
			let respostas = response.data
			buscaMidias(respostas, elemento)
		}
	};
	request.send();
}

function buscaMidias(elementos, dado) {
	let url = ''
	let midias = []
	elementos.forEach(elemento => {
		let requisicao = new XMLHttpRequest()
		url = elemento.relationships.media.links.related
		requisicao.open('GET', url, false);
		requisicao.send()
		if (requisicao.status === 200) {
			let response = JSON.parse(requisicao.responseText)
			midias.push(response.data)
		}
	})
	montaPopUpDetalhes(midias)
}

function montaPopUpDetalhes(midias) {
	let temp_modal = document.getElementById("modal-body");
	let modal_body = document.getElementById("modal-detalhes");
	modal_body.innerHTML = "";
	if (midias.length > 0) {
		midias.forEach(media => {
			console.log(media)
			let clone = document.importNode(temp_modal.content, true);
			let img = clone.querySelectorAll("img");
			if (media.attributes.coverImage) {
				img[0].src = media.attributes.coverImage.large
			}
			let ps = clone.querySelectorAll("p");
			ps[0].textContent = "Nome:" + media.attributes.canonicalTitle
			ps[1].textContent = "Tipo:" + media.type
			ps[2].textContent = "Classificação Indicativa:" + media.attributes.ageRatingGuide
			ps[3].textContent = "Nota:" + media.attributes.averageRating
			ps[4].textContent = "Ranking de Populariade:" + media.attributes.popularityRank
			ps[5].textContent = "Ranking de Nota:" + media.attributes.ratingRank
			ps[6].textContent = "Tipo de show:" + media.attributes.showType
			ps[7].textContent = "Sinopse:" + media.attributes.synopsis
			modal_body.append(clone);

		})
		let modal = document.getElementById("modal");
		modal.style.display = "block";
	}
}

let input = document.getElementById("search");
input.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		let pesquisa = e.target.value;
		let url = ''
		if (pesquisa != null && pesquisa !== '') {
			url = 'https://kitsu.io/api/edge/characters?filter[name]='+ pesquisa
		} else {
			url = 'https://kitsu.io/api/edge/characters'
		}
		buscarDados(url, 1, 0, 5)
	}
});

function paginacao (pagina, offset) {
	let startPage, endPage

	if (pagina >= 6) {
		startPage = pagina - 1
		endPage = pagina + 4
	} else {
		startPage = 0
		endPage = 5
	}
	let url = 'https://kitsu.io/api/edge/characters?page%5Blimit%5D=10&page%5Boffset%5D='+offset;
	buscarDados(url, pagina, startPage, endPage)
}

function renderPaginacao(startPage, endPage, currentPage) {
	const prevButton = document.getElementById('button_prev');
	const nextButton = document.getElementById('button_next');
	let next = currentPage+1
	let prev = currentPage-1
	nextButton.setAttribute('onclick', "paginacao("+(next)+","+(next*10)+")")
	prevButton.setAttribute('onclick', "paginacao("+(prev)+","+(prev*10)+")")
	let t;
	if (width < 650) {
		t = document.querySelector('#paginas-telas-menores')
	} else {
		t = document.querySelector('#paginas')
	}
	let clone = document.importNode(t.content, true);
	let as = clone.querySelectorAll("a");
	let pages = document.getElementById('pages');
	pages.innerHTML = "";
	let offset;
	let cont = 0;
	for (let i = startPage; i <= endPage; i++) {
		offset = i * 10
		as[cont].setAttribute('onclick', "paginacao("+(i+1)+","+offset+")");
		as[cont].setAttribute('id', i+1);
		as[cont].textContent = i+1;
		if (i+1 === currentPage) {
			as[cont].setAttribute('class', 'active page');
		}
		cont++;
	}
	pages.append(clone);
}
let span = document.getElementsByClassName("close")[0];
span.onclick = function() {
	modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}

// if you have any suggestion of questions, pleasse feel free to send me an email to chiholiu10@gmail.com
