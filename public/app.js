//Trello Board
class TrelloBoard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  //Reload attribute to activate board reload
  static get observedAttributes() {
    return ["reload"];
  }

  attributeChangedCallback() {
    let ColNum = 0;
    let context = this;

    function loadColumns() {
      //Removes existing columns before populating
      while (context.shadowRoot.lastChild) {
          context.shadowRoot.removeChild(context.shadowRoot.lastChild);
      }
      //Get columns from DB
      fetch("http://localhost:3000/columns")
        .then(function(response) {
          return response.json();
        })
        .then(function(myJson) {
          //Create trello-column element for every column
          for (let i = 0; i < myJson.length; i++) {
            let column = document.createElement(`trello-column`);
            column.id = myJson[i].id;
            column.title = myJson[i].title;
            //append column element
            context.shadowRoot.appendChild(column);
            //store the last column id
            if (i == myJson.length -1) {
              ColNum = myJson[i].id;
            }
          }
          //Creates Add Column button at end of trello board
          let addColumnBtn = document.createElement("BUTTON");
          let text = document.createTextNode("Add Column");
          addColumnBtn.appendChild(text);
          addColumnBtn.addEventListener("click", addColumn);
          context.shadowRoot.appendChild(addColumnBtn);
        })
    }

    function addColumn() {
      let data = {
        "title": `Column ${ColNum + 1}`
      };

      fetch(`http://localhost:3000/columns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        //Reload columns after new column creation
        loadColumns()
        response.json();
      });
    }
    loadColumns();
  }

  connectedCallback() {
    //Make changes to reload attribute to run above code.
    document.querySelector("trello-board").setAttribute("reload", true);
  }
}
window.customElements.define("trello-board", TrelloBoard);

//Trello Column
class TrelloColumn extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ['id', 'title'];
  }

  connectedCallback() {
    function updateColumn() {
      let data = { "title": this.value };
      fetch(`http://localhost:3000/columns/${this.getAttribute("id")}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        response.json();
      });
    }

    function updateCardColId(e) {
      e.preventDefault();
      console.log("ihihi");
    }

    function deleteColumn() {
      fetch(`http://localhost:3000/columns/${this.getAttribute("id")}`, {
        method: "DELETE"
      })
      .then(response => {
        document.querySelector("trello-board").setAttribute("reload", true);
        response.json()
      });
    }

    let style = document.createElement("style")
    let styleText = document.createTextNode(`
          input {
            border: none;
            font-size: 25px;
            color: red;
          }
        `);
    style.appendChild(styleText);

    let colTitle = document.createElement("input");
    colTitle.type = "text";
    colTitle.id = this.getAttribute("id");
    colTitle.value = this.getAttribute("title");
    colTitle.addEventListener("change", updateColumn);

    let delBtn = document.createElement("BUTTON");
    let text = document.createTextNode(`Delete ${this.getAttribute("title")}`);
    delBtn.id = this.getAttribute("id");
    delBtn.appendChild(text);
    delBtn.addEventListener("click", deleteColumn);

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(colTitle);
    this.shadowRoot.appendChild(delBtn);

    document.addEventListener("dragover", function(event) {
      event.preventDefault();
    }, false);

    this.addEventListener("dragenter", function(event) {
      if (event.target.tagName == "TRELLO-COLUMN") {
        event.target.style.opacity = 0.5;
      }
    }, false);

    this.addEventListener("dragleave", function(event) {
      if (event.target.tagName == "TRELLO-COLUMN") {
        event.target.style.opacity = 1;
      }
    }, false);

    this.addEventListener("drop", function(event) {
      if (event.target.tagName == "TRELLO-COLUMN") {
        event.target.style.opacity = 1;

        let data = {"columnId": event.target.id};
        fetch(`http://localhost:3000/cards/${dragged.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data)
        })
        .then(response => {
          document.querySelector("trello-board").setAttribute("reload", true);
          response.json();
        });
      }
    });
  }

  attributeChangedCallback(name, oldVal, newVal) {
    let colContext = this;
    function loadCards() {
      while (colContext.shadowRoot.childNodes.length > 3) {
          colContext.shadowRoot.removeChild(colContext.shadowRoot.lastChild);
      };
      fetch(`http://localhost:3000/cards?columnId=${newVal}`)
        .then(function(response) {
          return response.json();
        })
        .then(function(myJson) {
          for (let j = 0; j < myJson.length; j++) {
            let card = document.createElement('trello-card');
            card.id = myJson[j].id;
            card.title = myJson[j].title;
            card.setAttribute('description', myJson[j].description);
            colContext.shadowRoot.appendChild(card);
          }

          let addCardBtn = document.createElement("BUTTON");
          let text = document.createTextNode("Add Card");
          addCardBtn.appendChild(text);
          addCardBtn.addEventListener("click", addCard);
          colContext.shadowRoot.appendChild(addCardBtn);
        })
    }

    function addCard() {
      fetch("http://localhost:3000/cards")
        .then(function(response) {
          return response.json();
        })
        .then(function(myJson) {
           let data = {
              "title": `Card ${myJson[myJson.length-1].id + 1}`,
              "description": `Default description for Card ${myJson[myJson.length-1].id + 1}`,
              "columnId": parseInt(newVal)
            };
          fetch(`http://localhost:3000/cards`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
          })
          .then(response => {
            loadCards();
            response.json();
          });
        })
    }
    if (name === "id") { loadCards() };
  }
}
window.customElements.define("trello-column", TrelloColumn);

// Trello Card
var dragged;
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
        <style>
          div {
            border: 1px solid green;
            padding: 5px;
            margin: 5px;
          }
          input {
            border: none;
            overflow: display;
            display: block;
            margin-bottom: 10px;
          }
          textarea {
            border: none;
            overflow: auto;
            resize: none;
          }
        </style>
        <div id=${this.getAttribute("id")} draggable="true">
          <h4>${this.getAttribute("title")}</h4>
          <textarea style="visibility: hidden" cols="50" rows='${this.getAttribute("description") ? Math.ceil(this.getAttribute("description").length/15) : 0}'>${this.getAttribute("description")}</textarea>
          <button>Delete</button>
        </div>
    `;
  }

  connectedCallback() {
    let thisCard = this;
    thisCard.shadowRoot.querySelector('div').addEventListener("dragstart", function(event) {
      dragged = event.target;
    });

    function updateDescription() {
      let data = {"description": this.value};
      fetch(`http://localhost:3000/cards/${this.parentNode.getAttribute("id")}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        response.json();
      });
    }

    thisCard.shadowRoot.querySelector("div").addEventListener('click', function() {
      this.querySelector('textarea').setAttribute("style", "visibility: display")
    });

    thisCard.shadowRoot.querySelector("textarea").addEventListener("change", updateDescription);

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