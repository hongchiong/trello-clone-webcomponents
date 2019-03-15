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
        // document.querySelector("trello-column").addEventListener("click", function() {
        //   console.log("CLICK");
        //   // document.querySelector("trello-card").shadowRoot.innerHTML = "CLICKED";
        //   this.shadowRoot.innerHTML = "CLCICKCK";
        // })
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
    switch (name) {
      case "id":
        break;

      case "title":
       break;

      case "description":
        this.shadowRoot.innerHTML = newVal;
        break;
    }
    // console.log(name, oldVal, newVal);
    // if (name === "description") {
    //   console.log(newVal);
    //   this.shadowRoot.innerHTML = newVal;
    // };
  }
}
window.customElements.define("trello-card", TrelloCard);