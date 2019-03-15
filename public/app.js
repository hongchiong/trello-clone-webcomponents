class TrelloBoard extends HTMLElement {
  constructor() {
    super();
    let context = this;
    fetch("http://localhost:3000/columns")
      .then(function(response) {
        return response.json();
      })
      .then(function(myJson) {
        context.attachShadow({ mode: "open" });
        console.log(myJson);
        for (let i = 0; i < myJson.length; i++) {
          let column = document.createElement(`trello-column`);
          column.id = myJson[i].id;
          column.title = myJson[i].title;
          context.shadowRoot.appendChild(column);
        }
      })
  }
}
window.customElements.define("trello-board", TrelloBoard);


class TrelloColumn extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ['id', 'title'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    switch (name) {
      case "title":
        this.shadowRoot.innerHTML = newVal;
        break;

      case "id":
        let colContext = this
        fetch(`http://localhost:3000/cards?columnId=${newVal}`)
          .then(function(response) {
            return response.json();
          })
          .then(function(myJson) {
            console.log(colContext.shadowRoot.innerHTML, myJson);
            for (let j = 0; j < myJson.length; j++) {
              let card = document.createElement('trello-card');
              card.id = myJson[j].id;
              card.title = myJson[j].title;
              card.setAttribute('description', myJson[j].description);
              colContext.shadowRoot.appendChild(card);
            }
          })
        break;
    }
  }
}
window.customElements.define("trello-column", TrelloColumn);



class TrelloCard extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });


  }

  static get observedAttributes() {
    return ["id", "title", "description"];
  }

  attributeChangedCallback(name ,oldVal, newVal) {
    this.shadowRoot.innerHTML = `
      <div>
        <h4 class="hihi">${this.getAttribute("title")}</h4>
        <p>${this.getAttribute("description")}</p>
        <button>Delete</button>
      </div>
    `;
  }

  connectedCallback() {
    let thisCard = this;
    thisCard.shadowRoot.querySelector('button').addEventListener('click', function(e) {
      fetch(`http://localhost:3000/cards/${thisCard.getAttribute("id")}`, {
        method: "DELETE"
      })
      .then(response => response.json());
      thisCard.parentNode.removeChild(thisCard);
    });
  }
}
window.customElements.define("trello-card", TrelloCard);