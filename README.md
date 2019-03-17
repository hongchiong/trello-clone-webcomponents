# trello-clone-webcomponents
## Installation

To get started with the repo,
```
git clone https://github.com/hongchiong/trello-clone-webcomponents.git
npm install
npm start
```
And go to [http://localhost:3000](http://localhost:3000).

The application is build with three custom elements,
```
<trello-board>
<trello-column>
<trello-card>
```

Trello-cards are housed within respective trello-column, and the trello columns are nested in a trello-board. 
All functionalities are DOM manipulated through the app.js file.
